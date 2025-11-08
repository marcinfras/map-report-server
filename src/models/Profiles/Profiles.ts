import { Schema, Types, model } from 'mongoose';
import { UserRole, type IProfile } from './types.js';

const profileSchema = new Schema<IProfile>(
  {
    fullName: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    avatar: { type: String },
  },
  { timestamps: true }
);

export const Profile = model<IProfile>('Profile', profileSchema);
