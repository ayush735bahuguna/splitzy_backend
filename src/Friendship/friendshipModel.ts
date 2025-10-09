import mongoose from "mongoose";
import type { TFriendship } from "./friendshipTypes.ts";

const friendshipSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    status: { type: String, enum: ["pending", "friends"], default: "pending" },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<TFriendship>("Friendship", friendshipSchema);
