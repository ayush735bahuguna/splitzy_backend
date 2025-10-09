import { Types } from "mongoose";

export interface TPayment {
  expenseId: Types.ObjectId;
  amount: number;
  paymentDate?: Date;
  paymentMethod:
    | "CASH"
    | "CREDIT_CARD"
    | "DEBIT_CARD"
    | "BANK_TRANSFER"
    | "UPI"
    | "OTHER";
  paymentFrom: Types.ObjectId;
  paymentTo: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
