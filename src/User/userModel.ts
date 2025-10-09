import mongoose from "mongoose";
import type { User } from "./userTypes.ts";

const userSchema = new mongoose.Schema<User>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    profilePicture: {
      type: String,
      default:
        "http://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    pushNotifications: { type: Boolean, default: true },
    pushNotificationToken: { type: String },
  },
  { timestamps: true }
);
export default mongoose.model<User>("User", userSchema);
