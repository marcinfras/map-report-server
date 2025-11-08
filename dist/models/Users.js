import { Schema, Types, model } from 'mongoose';
import bcrypt from 'bcrypt';
export var UserType;
(function (UserType) {
    UserType["STANDARD"] = "standard";
    UserType["THIRD_PARTY"] = "thirdParty";
})(UserType || (UserType = {}));
const baseUserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    profile: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
    userType: {
        type: String,
        required: true,
        enum: Object.values(UserType),
    },
}, { timestamps: true, discriminatorKey: 'userType' });
export const User = model('User', baseUserSchema);
const standardUserSchema = new Schema({
    password: { type: String, required: true },
});
standardUserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
    catch (error) {
        return next(error);
    }
});
const thirdPartyUserSchema = new Schema({
    provider: { type: String, required: true },
});
export const StandardUser = User.discriminator(UserType.STANDARD, standardUserSchema);
export const ThirdPartyUser = User.discriminator(UserType.THIRD_PARTY, thirdPartyUserSchema);
//# sourceMappingURL=Users.js.map