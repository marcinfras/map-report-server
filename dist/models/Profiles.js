import { Schema, Types, model } from 'mongoose';
export var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["ADMIN"] = "admin";
})(UserRole || (UserRole = {}));
const profileSchema = new Schema({
    fullName: { type: String, required: true },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.USER,
    },
    avatar: { type: String },
}, { timestamps: true });
export const Profile = model('Profile', profileSchema);
//# sourceMappingURL=Profiles.js.map