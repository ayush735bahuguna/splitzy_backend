import mongoose, { Schema } from "mongoose";
import type { TGroup } from "./groupType.ts";

const groupSchema = new mongoose.Schema<TGroup>(
  {
    name: { type: String, required: true },
    icon: { type: String, required: true },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
export default mongoose.model<TGroup>("Group", groupSchema);
