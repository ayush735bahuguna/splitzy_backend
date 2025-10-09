export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  profilePicture: string;
  pushNotificationToken: string;
  pushNotifications: boolean;
  friends: string[];
}
