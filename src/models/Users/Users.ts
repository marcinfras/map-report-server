import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import {
  UserType,
  type IBaseUser,
  type IStandardUser,
  type IThirdPartyUser,
} from './types.js';

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
