export interface TFriendship {
  _id: string;
  users: [string, string];
  status: "pending" | "friends" | "declined";
  requestedBy: string;
}
