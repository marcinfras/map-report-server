import type { Request, Response } from 'express';
import { withTransactions } from '../../helpers/withTransactions.js';
import { ApiError } from '../../helpers/ApiError.js';
import { ERRORS } from '../../types/errors.js';
import { Pin, PinType } from '../../models/Pins.js';
import { User } from '../../models/Users.js';
import { v4 as uuidv4 } from 'uuid';
import { deleteFromS3, getFromS3, uploadToS3 } from '../../helpers/aws.js';
import { SUCCESS } from '../../types/success.js';

export const createPin = async (req: Request, res: Response) => {
  let s3key: string | null = null;

  const result = await withTransactions(async session => {
    const { title, description, type, lat, lng } = req.body;

    const userId = req.session.user?._id;
    if (!userId) {
      throw new ApiError('UNAUTHORIZED', ERRORS.AUTH.NOT_AUTHENTICATED);
    }

    const user = await User.findById(userId).session(session).select('profile');

    if (!user) {
      throw new ApiError('BAD_REQUEST', ERRORS.AUTH.NOT_FOUND);
    }

    const authorProfileId = user.profile;

    if (req.file) {
      s3key = `pins/${uuidv4()}`;
      try {
        await uploadToS3(req.file.buffer, s3key, req.file.mimetype);
      } catch (error) {
        throw new ApiError(
          'INTERNAL_SERVER_ERROR',
          ERRORS.PINS.FAILED_IMAGE_UPLOAD
        );
      }
    }

    const pinData = {
      title,
      description,
      type,
      coordinates: { lat, lng },
      author: authorProfileId,
      ...(s3key && { image: s3key }),
    };

    const pin = await Pin.create([pinData], { session });

    if (!pin[0]) {
      throw new ApiError(
        'INTERNAL_SERVER_ERROR',
        ERRORS.PINS.FAILED_PIN_CREATION
      );
    }

    await pin[0].populate('author', 'fullName');

    return pin[0];
  }).catch(async error => {
    if (s3key) {
      await deleteFromS3(s3key);
    }
    throw error;
  });

  res.status(201).json({ message: SUCCESS.PINS.PIN_CREATED, pin: result });
};

export const getPins = async (req: Request, res: Response) => {
  const { type } = req.query;

  if (type && !Object.values(PinType).includes(type as PinType)) {
    throw new ApiError('BAD_REQUEST', ERRORS.PINS.INVALID_PIN_TYPE);
  }

  const pins = await Pin.find({ ...(type ? { type } : {}) }).select([
    '_id',
    'coordinates',
    'type',
  ]);

  res.json(pins);
};

export const getPinById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const pin = await Pin.findById(id).populate('author', 'fullName');

  if (!pin) {
    throw new ApiError('NOT_FOUND', ERRORS.PINS.NOT_FOUND);
  }
  let imageBase64: string | null = null;
  if (pin.image) {
    const s3Key = pin.image;
    const s3Object = await getFromS3(s3Key);

    const chunks: Buffer[] = [];
    for await (const chunk of s3Object.Body as AsyncIterable<Buffer>) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    imageBase64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
  }

  res.json({ ...pin.toObject(), image: imageBase64 });
};

export const getPinCounts = async (req: Request, res: Response) => {
  const counts = await Pin.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
      },
    },
  ]);

  const result = counts.reduce(
    (acc, curr) => {
      acc[curr._id as PinType] = curr.count;
      acc.all += curr.count;
      return acc;
    },
    {
      all: 0,
      [PinType.Damage]: 0,
      [PinType.Change]: 0,
      [PinType.Idea]: 0,
    } as Record<PinType | 'all', number>
  );

  res.json(result);
};
