import { Schema, Types, model } from 'mongoose';
import bcrypt from 'bcrypt';
import type { IProfile } from './Profiles.js';

export enum UserType {
  STANDARD = 'standard',
  THIRD_PARTY = 'thirdParty',
}

interface IBaseUser {
  email: string;
  profile: Types.ObjectId | IProfile;
  createdAt: Date;
  updatedAt: Date;
  userType: UserType;
}

interface IStandardUser extends IBaseUser {
  password: string;
  userType: UserType.STANDARD;
}

interface IThirdPartyUser extends IBaseUser {
  provider: string;
  userType: UserType.THIRD_PARTY;
}

const baseUserSchema = new Schema<IBaseUser>(
  {
    email: { type: String, required: true, unique: true },
    profile: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
    userType: {
      type: String,
      required: true,
      enum: Object.values(UserType),
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
  UserType.STANDARD,
  standardUserSchema
);

export const ThirdPartyUser = User.discriminator<IThirdPartyUser>(
  UserType.THIRD_PARTY,
  thirdPartyUserSchema
);
