import mongoose, { Schema } from "mongoose";
import type { TNotification } from "./notificationType.ts";

const notificationSchema = new mongoose.Schema<TNotification>(
  {
    recivingUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    type: {
      type: String,
      required: true,
      enum: [
        "EXPENSE_CREATED",
        "GROUP_JOINED",
        "PAYMENT_REMINDER",
        "FRIENDLIST_ADDED",
      ],
    },
    notificationType: {
      category: {
        type: String,
        enum: ["group", "expense", "user", "payment"],
        required: true,
      },
      relatedId: { type: Schema.Types.ObjectId, required: true },
    },
  },
  { timestamps: true }
);
export default mongoose.model<TNotification>(
  "Notification",
  notificationSchema
);
