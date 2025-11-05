import { Types } from 'mongoose';
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin"
}
export interface IProfile {
    _id: Types.ObjectId;
    fullName: string;
    role: UserRole;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Profile: import("mongoose").Model<IProfile, {}, {}, {}, import("mongoose").Document<unknown, {}, IProfile, {}, {}> & IProfile & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Profiles.d.ts.map