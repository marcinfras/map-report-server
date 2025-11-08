import type { IProfile } from '@models/profiles.types.js';
import type { IBaseUser } from '@models/users.enums.js';

export type ApiUser = Omit<
  IBaseUser,
  '_id' | 'profile' | 'createdAt' | 'updatedAt'
> & {
  id: string;
  profile: ApiProfile;
};

export type ApiProfile = Omit<IProfile, '_id' | 'createdAt' | 'updatedAt'> & {
  id: string;
};
