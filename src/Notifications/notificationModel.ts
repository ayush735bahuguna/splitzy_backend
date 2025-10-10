import mongoose, { Schema } from "mongoose";
import type { TNotification } from "./notificationType.ts";

const notificationSchema = new mongoose.Schema<TNotification>(
  {
    receivingUserId: {
      // fixed typo from "recivingUserId"
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "EXPENSE_CREATED",
        "GROUP_CREATED",
        "GROUP_JOINED",
        "GROUP_UPDATED",
        "PAYMENT_RECEIVED",
        "FRIENDLIST_ADDED",
        "FRIEND_REQUEST_RECEIVED",
        "FRIEND_REQUEST_ACCEPTED",
        "FRIEND_REQUEST_DECLINED",
      ],
    },
    notificationDetails: {
      category: {
        type: String,
        enum: ["group", "expense", "user", "payment"],
        required: true,
      },
      relatedId: {
        type: Schema.Types.ObjectId,
        required: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<TNotification>(
  "Notification",
  notificationSchema
);
