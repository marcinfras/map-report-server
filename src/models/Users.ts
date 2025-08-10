import { Schema, Types, model } from "mongoose";

interface IUser {
  email: string;
  password: string;
  role: "user" | "admin";
  profile: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    profile: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
