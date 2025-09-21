import type { Request, Response } from 'express';
import { withTransactions } from '../../helpers/withTransactions.js';
import { ApiError } from '../../helpers/ApiError.js';
import { ERRORS } from '../../types/errors.js';
import { Pin, PinType } from '../../models/Pins.js';
import { User } from '../../models/Users.js';

export const createPin = async (req: Request, res: Response) => {
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

    const authorProfileId = user.profile.toString();

    const pinData = {
      title,
      description,
      type,
      coordinates: { lat, lng },
      author: authorProfileId,
      ...(req.file && { image: `/uploads/pins/${req.file.filename}` }),
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
  });

  res.status(201).json({ message: 'Pin created successfully', pin: result });
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

  res.json(pin);
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
