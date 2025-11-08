import { type Types } from 'mongoose';
export declare enum PinType {
    Damage = "damage",
    Change = "change",
    Idea = "idea"
}
export declare enum PinStatus {
    Active = "active",
    Resolved = "resolved"
}
export interface IPin {
    _id: Types.ObjectId;
    title: string;
    description: string;
    type: PinType;
    coordinates: ICoordinates;
    image?: string;
    author: Types.ObjectId;
    status: PinStatus;
    createdAt: Date;
    updatedAt: Date;
}
interface ICoordinates {
    lat: number;
    lng: number;
}
export declare const Pin: import("mongoose").Model<IPin, {}, {}, {}, import("mongoose").Document<unknown, {}, IPin, {}, {}> & IPin & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export {};
//# sourceMappingURL=Pins.d.ts.map