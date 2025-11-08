import type { IProfile } from '@models/Profiles/types.js';
import type { IBaseUser } from '@models/Users/types.js';

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
