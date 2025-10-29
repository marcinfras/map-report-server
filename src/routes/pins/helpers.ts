import { getBase64ImageFromS3 } from '@helpers/aws.js';
import type { IPin } from '@models/Pins.js';
import type { Document } from 'mongoose';

export const isOwnerOfPin = (
  userProfileId: string,
  pinAuthorId: string,
  userRole: string
) => {
  return userProfileId === pinAuthorId || userRole === 'admin';
};

export const buildSearchStage = (
  search?: string,
  field?: string,
  operator?: string
) => {
  if (!search || !field || !operator) return null;

  let regex: RegExp;

  switch (operator) {
    case 'equals':
      regex = new RegExp(`^${search}$`, 'i');
      break;
    case 'startsWith':
      regex = new RegExp(`^${search}`, 'i');
      break;
    default:
      regex = new RegExp(`${search}`, 'i');

      if (field === 'author') {
        return { $match: { 'author.fullName': { $regex: regex } } };
      }

      return { $match: { [field]: { $regex: regex } } };
  }
};

export function isMongooseDocument<T extends object>(
  obj: T | (T & Document)
): obj is T & Document {
  return 'toObject' in obj && typeof (obj as Document).toObject === 'function';
}

export const attachPinImages = async (pins: IPin[]) => {
  return Promise.all(
    pins.map(async pin => {
      let imageBase64: string | null = null;

      if (pin.image) {
        imageBase64 = await getBase64ImageFromS3(pin.image);
      }

      const plainPin = isMongooseDocument(pin) ? pin.toObject() : pin;

      return { ...plainPin, image: imageBase64 };
    })
  );
};
