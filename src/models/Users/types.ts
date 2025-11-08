import type { Types } from 'mongoose';
import type { IProfile } from '../Profiles/types.js';

export enum UserType {
  STANDARD = 'standard',
  THIRD_PARTY = 'thirdParty',
}

export interface IBaseUser {
  _id: Types.ObjectId;
  email: string;
  profile: Types.ObjectId | IProfile;
  createdAt: Date;
  updatedAt: Date;
  userType: UserType;
}

export interface IStandardUser extends IBaseUser {
  password: string;
  userType: UserType.STANDARD;
}

export interface IThirdPartyUser extends IBaseUser {
  provider: string;
  userType: UserType.THIRD_PARTY;
}
