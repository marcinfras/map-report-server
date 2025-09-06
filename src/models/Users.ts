// import { Schema, Types, model } from "mongoose";
// import bcrypt from "bcrypt";
// import type { IProfile } from "./Profiles.js";

// interface IUser {
//   email: string;
//   password: string;
//   profile: Types.ObjectId | IProfile;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const userSchema = new Schema<IUser>(
//   {
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     profile: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
//   },
//   { timestamps: true }
// );

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   try {
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
//   } catch (error) {
//     return next(error as Error);
//   }
// });

// export const User = model<IUser>("User", userSchema);

///////////////////////////////////////////////////////////////////

import { Schema, Types, model } from 'mongoose';
import bcrypt from 'bcrypt';
import type { IProfile } from './Profiles.js';

interface IBaseUser {
  email: string;
  profile: Types.ObjectId | IProfile;
  createdAt: Date;
  updatedAt: Date;
  userType: 'standard' | 'thirdParty';
}

interface IStandardUser extends IBaseUser {
  password: string;
  userType: 'standard';
}

interface IThirdPartyUser extends IBaseUser {
  provider: string;
  userType: 'thirdParty';
}

const baseUserSchema = new Schema<IBaseUser>(
  {
    email: { type: String, required: true, unique: true },
    profile: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
    userType: {
      type: String,
      required: true,
      enum: ['standard', 'thirdParty'],
    },
  },
  { timestamps: true, discriminatorKey: 'userType' }
);

export const User = model<IBaseUser>('User', baseUserSchema);

const standardUserSchema = new Schema<IStandardUser>({
  password: { type: String, required: true },
});

standardUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    return next(error as Error);
  }
});

const thirdPartyUserSchema = new Schema<IThirdPartyUser>({
  provider: { type: String, required: true },
});

export const StandardUser = User.discriminator<IStandardUser>(
  'standard',
  standardUserSchema
);

export const ThirdPartyUser = User.discriminator<IThirdPartyUser>(
  'thirdParty',
  thirdPartyUserSchema
);

// interface IUser {
//   email: string;
//   password: string;
//   profile: Types.ObjectId | IProfile;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const userSchema = new Schema<IUser>(
//   {
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     profile: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
//   },
//   { timestamps: true }
// );

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   try {
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
//   } catch (error) {
//     return next(error as Error);
//   }
// });

// export const User = model<IUser>("User", userSchema);
