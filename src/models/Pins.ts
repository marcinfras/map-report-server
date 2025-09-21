import { Schema, model, type Types } from 'mongoose';

export enum PinType {
  Damage = 'damage',
  Change = 'change',
  Idea = 'idea',
}

enum PinStatus {
  Active = 'active',
  Resolved = 'resolved',
}

interface IPin {
  title: string;
  description: string;
  type: PinType;
  coordinates: {
    lat: number;
    lng: number;
  };
  image?: string;
  author: Types.ObjectId;
  status: PinStatus;
  createdAt: Date;
  updatedAt: Date;
}

const pinSchema = new Schema<IPin>(
  {
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 500 },
    type: { type: String, enum: Object.values(PinType), required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
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
