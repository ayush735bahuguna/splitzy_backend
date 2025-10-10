import { Types } from "mongoose";

export interface TPayment {
  _id: Types.ObjectId;
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
  isGroupPayment: boolean;
}
