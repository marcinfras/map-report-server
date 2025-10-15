import type { Request, Response } from 'express';
import { ERRORS } from '@/types/errors.js';
import { ApiError } from '@helpers/ApiError.js';
import { withTransactions } from '@helpers/withTransactions.js';
import { Profile } from '@models/Profiles.js';
import { v4 as uuidv4 } from 'uuid';
import { deleteFromS3, uploadToS3 } from '@helpers/aws.js';
import { SUCCESS } from '@/types/success.js';

export const updateProfile = async (req: Request, res: Response) => {
  const userSession = req.session.user;

  const { fullName } = req.body;

  const result = await withTransactions(async session => {
    const profileId = userSession!.profile._id;

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
    _id: userSession!._id,
    email: userSession!.email,
    profile: {
      _id: result._id.toString(),
      fullName: result.fullName,
      role: result.role,
      ...(result.avatar ? { avatar: result.avatar } : {}),
    },
  };

  res.json({ message: SUCCESS.PROFILE.PROFILE_UPDATED, profile: result });
};
