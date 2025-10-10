import type mongoose from "mongoose";

export interface User {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  profilePicture: string;
  pushNotificationToken: string;
  pushNotifications: boolean;
  friends: string[];
}
