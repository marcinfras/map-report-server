import { Schema, model } from "mongoose";

interface IProfile {
  fullName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    fullName: { type: String, required: true },
    avatar: { type: String },
  },
  { timestamps: true }
);

export const Profile = model<IProfile>("Profile", profileSchema);
