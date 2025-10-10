import { Types } from "mongoose";

export interface TNotification {
  _id?: Types.ObjectId;
  receivingUserId: Types.ObjectId;
  message: string;
  isRead: boolean;
  type:
    | "EXPENSE_CREATED"
    | "GROUP_CREATED"
    | "GROUP_JOINED"
    | "GROUP_UPDATED"
    | "PAYMENT_RECEIVED"
    | "FRIENDLIST_ADDED"
    | "FRIEND_REQUEST_RECEIVED"
    | "FRIEND_REQUEST_ACCEPTED"
    | "FRIEND_REQUEST_DECLINED";
  notificationDetails: {
    category: "group" | "expense" | "user" | "payment";
    relatedId: Types.ObjectId;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
