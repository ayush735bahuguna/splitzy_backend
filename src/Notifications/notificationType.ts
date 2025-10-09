import { Types } from "mongoose";

export interface TNotification {
  _id?: Types.ObjectId;
  recivingUserId: Types.ObjectId;
  message: string;
  isRead: boolean;
  type:
    | "EXPENSE_CREATED"
    | "GROUP_JOINED"
    | "PAYMENT_REMINDER"
    | "FRIENDLIST_ADDED";
  notificationType: {
    category: "group" | "expense" | "user" | "payment";
    relatedId: Types.ObjectId;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
