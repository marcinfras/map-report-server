import { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import { StandardUser, ThirdPartyUser, User, UserType } from '@models/Users.js';
import { Profile, type IProfile } from '@models/Profiles.js';
import { ApiError } from '@helpers/ApiError.js';
import { withTransactions } from '@helpers/withTransactions.js';
import { googleClient } from '@/index.js';
import Config from '@/config.js';
import { OAuthError } from '@/types/oauth.js';
import { ERRORS } from '@/types/errors.js';
import { SUCCESS } from '@/types/success.js';
import { getFromS3 } from '@helpers/aws.js';

export const register = async (req: Request, res: Response) => {
  const result = await withTransactions(async session => {
    const { email, password, fullName } = req.body;

    const existingUser = await User.findOne({ email }).session(session);

    if (existingUser) {
      throw new ApiError('BAD_REQUEST', ERRORS.AUTH.USER_EXISTS);
    }

    const profile = await Profile.create([{ fullName }], { session });

    if (!profile[0]) {
      throw new ApiError(
        'INTERNAL_SERVER_ERROR',
        ERRORS.AUTH.FAILED_PROFILE_CREATION
      );
    }

    const user = await StandardUser.create(
      [
        {
          email,
          password,
          profile: profile[0]._id,
        },
      ],
      { session }
    );

    if (!user[0]) {
      throw new ApiError(
        'INTERNAL_SERVER_ERROR',
        ERRORS.AUTH.FAILED_USER_CREATION
      );
    }

    return user[0];
  });

  res
    .status(201)
    .json({ message: SUCCESS.AUTH.REGISTER_SUCCESS, user: result });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await StandardUser.findOne({ email })
    .populate('profile')
    .orFail(new ApiError('UNAUTHORIZED', ERRORS.AUTH.INVALID_CREDENTIALS));

  const isVaild = await bcrypt.compare(password, user.password);

  if (!isVaild) {
    throw new ApiError('UNAUTHORIZED', ERRORS.AUTH.INVALID_CREDENTIALS);
  }

  const profile = user.profile as IProfile;

  req.session.user = {
    _id: user._id.toString(),
    email: user.email,
    profile: {
      _id: profile._id.toString(),
      fullName: profile.fullName,
      role: profile.role,
      ...(profile.avatar ? { avatar: profile.avatar } : {}),
    },
  };

  res
    .status(200)
    .json({ message: SUCCESS.AUTH.LOGIN_SUCCESS, user: req.session.user });
};

export const googleRedirect = (req: Request, res: Response) => {
  const authUrl = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    redirect_uri: `${Config.BACKEND_URL}/auth/google/callback`,
  });

  res.redirect(authUrl);
};

export const googleCallback = async (req: Request, res: Response) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect(
      `${Config.CLIENT_URL}/login?error=${OAuthError.CANCELLED}`
    );
  }

  const { tokens } = await googleClient.getToken({
    code: code.toString(),
    redirect_uri: `${Config.BACKEND_URL}/auth/google/callback`,
  });

  if (!tokens.id_token) {
    return res.redirect(
      `${Config.CLIENT_URL}/login?error=${OAuthError.FAILED}`
    );
  }

  googleClient.setCredentials(tokens);

  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: Config.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email || !payload.name) {
    return res.redirect(
      `${Config.CLIENT_URL}/login?error=${OAuthError.FAILED}`
    );
  }

  const user = await withTransactions(async session => {
    const existingUser = await ThirdPartyUser.findOne({
      email: payload.email,
      userType: UserType.THIRD_PARTY,
    })
      .populate('profile')
      .session(session);

    if (existingUser) {
      return existingUser;
    }

    const standardUser = await User.findOne({
      email: payload.email,
      userType: UserType.STANDARD,
    }).session(session);

    if (standardUser) {
      res.redirect(
        `${Config.CLIENT_URL}/login?error=${OAuthError.ACCOUNT_EXISTS}`
      );
    }

    const profile = await Profile.create(
      [
        {
          fullName: payload.name,
          avatar: payload.picture,
        },
      ],
      { session }
    );

    if (!profile[0]) {
      throw new ApiError(
        'INTERNAL_SERVER_ERROR',
        ERRORS.AUTH.FAILED_PROFILE_CREATION
      );
    }

    const newUser = await ThirdPartyUser.create(
      [
        {
          email: payload.email,
          profile: profile[0]._id,
          provider: 'google',
        },
      ],
      { session }
    );

    if (!newUser[0]) {
      throw new ApiError(
        'INTERNAL_SERVER_ERROR',
        ERRORS.AUTH.FAILED_USER_CREATION
      );
    }

    return newUser[0];
  });

  const profile = user.profile as IProfile;

  req.session.user = {
    _id: user._id.toString(),
    email: user.email,
    profile: {
      _id: profile._id.toString(),
      fullName: profile.fullName,
      role: profile.role,
      ...(profile.avatar ? { avatar: profile.avatar } : {}),
    },
  };

  res.redirect(`${Config.CLIENT_URL}/login?success=success`);
};

export const logout = async (req: Request, res: Response) => {
  req.session.destroy(err => {
    if (err) {
      throw new ApiError('INTERNAL_SERVER_ERROR', ERRORS.AUTH.LOGOUT_FAILED);
    }

    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logout successful' });
  });
};

export const me = async (req: Request, res: Response) => {
  if (!req.session?.user?._id) {
    return res.status(200).json({ user: null });
  }

  const user = await User.findById(req.session.user?._id).populate('profile');

  if (!user) {
    throw new ApiError('NOT_FOUND', ERRORS.AUTH.NOT_FOUND);
  }

  let imageBase64: string | null = null;
  const profile = user.profile as IProfile;
  if (profile.avatar && !profile.avatar.startsWith('http')) {
    const s3Key = profile.avatar;
    const s3Object = await getFromS3(s3Key);

    const chunks: Buffer[] = [];
    for await (const chunk of s3Object.Body as AsyncIterable<Buffer>) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    imageBase64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
  }

  res.status(200).json({
    user: {
      id: user._id.toString(),
      email: user.email,
      userType: user.userType,
      profile: {
        id: profile._id.toString(),
        fullName: profile.fullName,
        role: profile.role,
        ...(imageBase64 ? { avatar: imageBase64 } : {}),
      },
    },
  });
};

export const changePassword = async (req: Request, res: Response) => {
  const userId = req.session.user!._id;

  const { currentPassword, newPassword } = req.body;

  const user = await StandardUser.findById(userId).orFail(
    new ApiError('BAD_REQUEST', ERRORS.AUTH.NOT_FOUND)
  );

  if (user.userType !== UserType.STANDARD) {
    throw new ApiError('BAD_REQUEST', ERRORS.AUTH.INVALID_USER_TYPE);
  }

  const isVaild = await bcrypt.compare(currentPassword, user.password);

  if (!isVaild) {
    throw new ApiError(
      'UNAUTHORIZED',
      ERRORS.AUTH.CHANGE_PASSWORD_INVALID_OLD_PASSWORD
    );
  }

  user.password = newPassword;

  await user.save();

  res.status(200).json({ message: SUCCESS.AUTH.PASSWORD_CHANGED });
};
