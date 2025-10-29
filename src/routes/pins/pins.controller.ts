import type { Request, Response } from 'express';
import { withTransactions } from '@helpers/withTransactions.js';
import { ApiError } from '@helpers/ApiError.js';
import { ERRORS } from '@/types/errors.js';
import { Pin, PinType, type IPin } from '@models/Pins.js';
import { User } from '@models/Users.js';
import { v4 as uuidv4 } from 'uuid';
import {
  deleteFromS3,
  getBase64ImageFromS3,
  uploadToS3,
} from '@helpers/aws.js';
import { SUCCESS } from '@/types/success.js';
import type { PipelineStage, SortOrder } from 'mongoose';
import { attachPinImages, buildSearchStage, isOwnerOfPin } from './helpers.js';

export const createPin = async (req: Request, res: Response) => {
  let s3key: string | null = null;

  const result = await withTransactions(async session => {
    const { title, description, type, lat, lng } = req.body;

    const userId = req.session.user?._id;

    const user = await User.findById(userId).session(session).select('profile');

    if (!user) {
      throw new ApiError('BAD_REQUEST', ERRORS.AUTH.NOT_FOUND);
    }

    const authorProfileId = user.profile;

    if (req.file) {
      s3key = `pins/${uuidv4()}`;
      try {
        await uploadToS3(req.file.buffer, s3key, req.file.mimetype);
      } catch {
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
    imageBase64 = await getBase64ImageFromS3(pin.image);
  }

  res.json({ ...pin.toObject(), image: imageBase64 });
};

export const listMyPins = async (req: Request, res: Response) => {
  const { type, status, sort, page: reqPage, limit: reqLimit } = req.query;

  const page = parseInt(reqPage as string) || 1;
  const limit = parseInt(reqLimit as string) || 10;
  const skip = (page - 1) * limit;

  const query = {
    author: req.session.user!.profile._id,
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
  };

  const sortOption: Record<string, SortOrder> =
    sort === 'asc' ? { createdAt: 'asc' } : { createdAt: 'desc' };

  const [pins, total] = await Promise.all([
    await Pin.find(query).sort(sortOption).skip(skip).limit(limit),
    await Pin.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  const pinsWithImages = await attachPinImages(pins);

  res.json({
    pins: pinsWithImages,
    pagination: {
      total,
      totalPages,
    },
  });
};

export const listAdminPins = async (req: Request, res: Response) => {
  const {
    type,
    status,
    sort,
    search,
    field,
    operator,
    page: reqPage,
    limit: reqLimit,
  } = req.query;

  const page = parseInt(reqPage as string) || 1;
  const limit = parseInt(reqLimit as string) || 10;
  const skip = (page - 1) * limit;

  const match = {
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
  };

  const sortOption: Record<string, 1 | -1> = {
    createdAt: sort === 'asc' ? 1 : -1,
  };

  const pipeline: PipelineStage[] = [
    {
      $lookup: {
        from: 'profiles',
        let: { authorId: '$author' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$authorId'] } } },
          { $project: { _id: 0, fullName: 1 } },
        ],
        as: 'author',
      },
    },
    { $unwind: '$author' },
    { $match: match },
  ];

  const searchStage = buildSearchStage(
    search as string,
    field as string,
    operator as string
  );

  if (searchStage) {
    pipeline.push(searchStage);
  }

  pipeline.push({ $sort: sortOption });

  pipeline.push({
    $facet: {
      data: [{ $skip: skip }, { $limit: limit }],
      totalCount: [{ $count: 'count' }],
    },
  });

  const [result] = await Pin.aggregate(pipeline);

  const total = result.totalCount[0] ? result.totalCount[0].count : 0;
  const totalPages = Math.ceil(total / limit);
  const pins: IPin[] = result?.data || [];

  const pinsWithImages = await attachPinImages(pins);

  res.json({
    pins: pinsWithImages,
    pagination: {
      total,
      totalPages,
    },
  });
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

export const updatePin = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, type, status } = req.body;

  if (!id) throw new ApiError('BAD_REQUEST', ERRORS.PINS.NOT_FOUND);

  const pin = await Pin.findById(id);
  if (!pin) throw new ApiError('NOT_FOUND', ERRORS.PINS.NOT_FOUND);

  const authorProfileId = req.session.user!.profile._id;

  if (
    !isOwnerOfPin(
      authorProfileId.toString(),
      pin.author.toString(),
      req.session.user!.profile.role
    )
  ) {
    throw new ApiError('FORBIDDEN', ERRORS.AUTH.FORBIDDEN);
  }

  if (title) pin.title = title;
  if (description) pin.description = description;
  if (type) pin.type = type;
  if (status) pin.status = status;

  if (req.file) {
    const oldS3Key = pin.image;
    const newS3Key = `pins/${uuidv4()}`;
    try {
      await uploadToS3(req.file.buffer, newS3Key, req.file.mimetype);
      pin.image = newS3Key;
      if (oldS3Key) {
        await deleteFromS3(oldS3Key);
      }
    } catch {
      await deleteFromS3(newS3Key);
      throw new ApiError(
        'INTERNAL_SERVER_ERROR',
        ERRORS.PINS.FAILED_IMAGE_UPLOAD
      );
    }
  }

  await pin.save();
  await pin.populate('author', 'fullName');

  res.json({ message: SUCCESS.PINS.PIN_UPDATED, pin });
};

export const deletePin = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) throw new ApiError('BAD_REQUEST', ERRORS.PINS.NOT_FOUND);

  const result = await withTransactions(async session => {
    const pin = await Pin.findById(id).session(session);
    if (!pin) throw new ApiError('NOT_FOUND', ERRORS.PINS.NOT_FOUND);

    const authorProfileId = req.session.user!.profile._id;

    if (
      !isOwnerOfPin(
        authorProfileId.toString(),
        pin.author.toString(),
        req.session.user!.profile.role
      )
    ) {
      throw new ApiError('FORBIDDEN', ERRORS.AUTH.FORBIDDEN);
    }

    await pin.deleteOne();

    if (pin.image) {
      try {
        await deleteFromS3(pin.image);
      } catch {
        throw new ApiError(
          'INTERNAL_SERVER_ERROR',
          ERRORS.PINS.FAILED_PIN_DELETE
        );
      }
    }

    return pin;
  });

  res.json({ message: SUCCESS.PINS.PIN_DELETED, pin: result });
};
