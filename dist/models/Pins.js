import { Schema, model } from 'mongoose';
export var PinType;
(function (PinType) {
    PinType["Damage"] = "damage";
    PinType["Change"] = "change";
    PinType["Idea"] = "idea";
})(PinType || (PinType = {}));
export var PinStatus;
(function (PinStatus) {
    PinStatus["Active"] = "active";
    PinStatus["Resolved"] = "resolved";
})(PinStatus || (PinStatus = {}));
const coordinatesSchema = new Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
}, { _id: false });
const pinSchema = new Schema({
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 500 },
    type: { type: String, enum: Object.values(PinType), required: true },
    coordinates: {
        type: coordinatesSchema,
        required: true,
    },
    image: { type: String, required: false },
    author: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
    status: {
        type: String,
        enum: Object.values(PinStatus),
        default: PinStatus.Active,
    },
}, { timestamps: true });
export const Pin = model('Pin', pinSchema);
//# sourceMappingURL=Pins.js.map