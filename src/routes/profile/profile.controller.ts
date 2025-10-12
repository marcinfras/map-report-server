import type { Request, Response } from 'express';
import { ERRORS } from '../../types/errors.js';
import { ApiError } from '../../helpers/ApiError.js';
import { withTransactions } from '../../helpers/withTransactions.js';
import { User } from '../../models/Users.js';
import { Profile } from '../../models/Profiles.js';
import { v4 as uuidv4 } from 'uuid';
import { deleteFromS3, uploadToS3 } from '../../helpers/aws.js';
import { SUCCESS } from '../../types/success.js';

export const updateProfile = async (req: Request, res: Response) => {
  const userSession = req.session.user;

  if (!userSession) {
    throw new ApiError('UNAUTHORIZED', ERRORS.AUTH.NOT_AUTHENTICATED);
  }

  const userId = userSession._id;

  const { fullName } = req.body;

  if (!fullName && !req.file) {
    throw new ApiError('BAD_REQUEST', ERRORS.PROFILE.NOTHING_TO_UPDATE);
  }

  const result = await withTransactions(async session => {
    const user = await User.findById(userId).session(session).select('profile');

    if (!user) {
      throw new ApiError('BAD_REQUEST', ERRORS.AUTH.NOT_FOUND);
    }

    const profileId = user.profile;

    const profile = await Profile.findById(profileId).session(session);

    if (!profile) {
      throw new ApiError('NOT_FOUND', ERRORS.PROFILE.NOT_FOUND);
    }

    if (fullName !== profile.fullName) {
      profile.fullName = fullName;
    }

    if (req.file) {
      const oldS3Key = profile.avatar;
      const newS3Key = `avatars/${uuidv4()}`;

      try {
        await uploadToS3(req.file.buffer, newS3Key, req.file.mimetype);
        profile.avatar = newS3Key;
        if (oldS3Key && !oldS3Key.startsWith('http')) {
          await deleteFromS3(oldS3Key);
        }
      } catch (error) {
        throw new ApiError(
          'INTERNAL_SERVER_ERROR',
          ERRORS.PROFILE.FAILED_AVATAR_UPLOAD
        );
      }
    }

    await profile.save({ session });

    return profile;
  });

  req.session.user = {
    _id: userSession._id,
    email: userSession.email,
    profile: {
      _id: result._id.toString(),
      fullName: result.fullName,
      role: result.role,
      ...(result.avatar ? { avatar: result.avatar } : {}),
    },
  };

  res.json({ message: SUCCESS.PROFILE.PROFILE_UPDATED, profile: result });
};
