import mongoose, { Schema } from "mongoose";
import type { TExpense } from "./expenseType.ts";

const expenseSchema = new mongoose.Schema<TExpense>(
  {
    expenseName: { type: String, required: true },
    amount: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expenseDate: { type: Date },
    status: { type: String, enum: ["pending", "settled"], required: true },
    isGroupexpense: { type: Boolean, required: true },
    groupId: { type: Schema.Types.ObjectId, ref: "Group" },
    relatedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    payers: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        amountPaid: { type: Number, required: true },
      },
    ],
    splitType: {
      type: String,
      enum: ["equal", "unequal", "percentage", "share"],
      required: true,
    },
    splitMembers: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        amountPaid: { type: Number, required: true },
        share: { type: Number },
        percentage: { type: Number },
        isEqualShare: { type: Boolean, required: true },
      },
    ],
    expensePayments: [{ type: Schema.Types.ObjectId, ref: "Payment" }],
  },
  { timestamps: true }
);
export default mongoose.model<TExpense>("Expense", expenseSchema);
