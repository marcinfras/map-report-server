import express, { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import { StandardUser, ThirdPartyUser, User } from '../models/Users.js';
import { Profile, type IProfile } from '../models/Profiles.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { ApiError } from '../helpers/ApiError.js';
import { withTransactions } from '../helpers/withTransactions.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../schemas/authSchemas.js';
import { requireAuth } from '../middleware/auth.js';
import { googleClient } from '../index.js';
import Config from '../config.js';
import { OAuthError } from '../types/oauth.js';

const router = express.Router();

router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await withTransactions(async session => {
      const { email, password, fullName } = req.body;

      const existingUser = await User.findOne({ email }).session(session);

      if (existingUser) {
        throw new ApiError(
          'BAD_REQUEST',
          'User already exists with this email'
        );
      }

      const profile = await Profile.create([{ fullName }], { session });

      if (!profile[0]) {
        throw new ApiError(
          'INTERNAL_SERVER_ERROR',
          'Failed to create user profile'
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

      return user[0];
    });

    res
      .status(201)
      .json({ message: 'User registered successfully', user: result });
  })
);

router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await StandardUser.findOne({ email })
      .populate('profile')
      .orFail(new ApiError('UNAUTHORIZED', 'Invalid email or password'));

    const isVaild = await bcrypt.compare(password, user.password);

    if (!isVaild) {
      throw new ApiError('UNAUTHORIZED', 'Invalid email or password');
    }

    const profile = user.profile as IProfile;

    // req.session.userId = user._id.toString();
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
      .json({ message: 'Login successful', user: req.session.user });
  })
);

router.get('/google', (req, res) => {
  const authUrl = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    redirect_uri: `${Config.BACKEND_URL}/auth/google/callback`,
  });

  res.redirect(authUrl);
});

router.get(
  '/google/callback',
  asyncHandler(async (req: Request, res: Response) => {
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

    console.log('Google OAuth payload:', payload);

    const user = await withTransactions(async session => {
      const existingUser = await ThirdPartyUser.findOne({
        email: payload.email,
        userType: 'thirdParty',
      })
        .populate('profile')
        .session(session);

      if (existingUser) {
        return existingUser;
      }

      const standardUser = await User.findOne({
        email: payload.email,
        userType: 'standard',
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
          'Failed to create user profile'
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
          'Failed to create user account'
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
  })
);

router.post(
  '/logout',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    req.session.destroy(err => {
      if (err) {
        throw new ApiError('INTERNAL_SERVER_ERROR', 'Failed to logout');
      }

      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'Logout successful' });
    });
  })
);

router.get(
  '/me',
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.session?.user?._id) {
      return res.status(200).json({ user: null });
    }

    const user = await User.findById(req.session.user?._id).populate('profile');

    if (!user) {
      throw new ApiError('NOT_FOUND', 'User not found');
    }

    res.status(200).json({
      user: {
        _id: user._id.toString(),
        email: user.email,
        profile: user.profile,
      },
    });
  })
);

export default router;
