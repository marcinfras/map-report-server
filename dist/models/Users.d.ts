import { Types } from 'mongoose';
import type { IProfile } from './Profiles.js';
export declare enum UserType {
    STANDARD = "standard",
    THIRD_PARTY = "thirdParty"
}
export interface IBaseUser {
    _id: Types.ObjectId;
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
export declare const User: import("mongoose").Model<IBaseUser, {}, {}, {}, import("mongoose").Document<unknown, {}, IBaseUser, {}, {}> & IBaseUser & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const StandardUser: import("mongoose").Model<IStandardUser, {}, {}, {}, import("mongoose").Document<unknown, {}, IStandardUser, {}, {}> & IStandardUser & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const ThirdPartyUser: import("mongoose").Model<IThirdPartyUser, {}, {}, {}, import("mongoose").Document<unknown, {}, IThirdPartyUser, {}, {}> & IThirdPartyUser & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export {};
//# sourceMappingURL=Users.d.ts.map