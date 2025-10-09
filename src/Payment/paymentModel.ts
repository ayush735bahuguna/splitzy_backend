import mongoose, { Schema } from "mongoose";
import type { TPayment } from "./paymentType.ts";

const paymentSchema = new mongoose.Schema<TPayment>(
  {
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      required: true,
    },
    amount: { type: Number, required: true },
    paymentDate: { type: Date },
    paymentMethod: {
      type: String,
      required: true,
      enum: [
        "CASH",
        "CREDIT_CARD",
        "DEBIT_CARD",
        "BANK_TRANSFER",
        "UPI",
        "OTHER",
      ],
    },
    paymentFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
export default mongoose.model<TPayment>("Payment", paymentSchema);
