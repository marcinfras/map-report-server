import { Schema, model, type Types } from 'mongoose';

export enum PinType {
  Damage = 'damage',
  Change = 'change',
  Idea = 'idea',
}

export enum PinStatus {
  Active = 'active',
  Resolved = 'resolved',
}

export interface IPin {
  _id: Types.ObjectId;
  title: string;
  description: string;
  type: PinType;
  coordinates: ICoordinates;
  image?: string;
  author: Types.ObjectId;
  status: PinStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface ICoordinates {
  lat: number;
  lng: number;
}

const coordinatesSchema = new Schema<ICoordinates>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const pinSchema = new Schema<IPin>(
  {
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 500 },
    type: { type: String, enum: Object.values(PinType), required: true },
    coordinates: {
      type: coordinatesSchema,
      required: true,
    },
    image: { type: String, required: false },
    author: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
    status: {
      type: String,
      enum: Object.values(PinStatus),
      default: PinStatus.Active,
    },
  },
  { timestamps: true }
);

export const Pin = model<IPin>('Pin', pinSchema);
