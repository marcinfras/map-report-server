import type { Types } from 'mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface IProfile {
  _id: Types.ObjectId;
  fullName: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
