import type { Types } from 'mongoose';

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

export interface ICoordinates {
  lat: number;
  lng: number;
}
