import { Types } from "mongoose";

export interface TExpense {
  expenseName: string;
  amount: number;
  createdBy: Types.ObjectId;
  expenseDate?: Date;
  status: "pending" | "settled";

  reciptImage?: string;
  isGroupexpense: boolean;
  groupId?: Types.ObjectId;
  relatedUsers: Types.ObjectId[];

  payers: Array<{
    user: Types.ObjectId;
    amountPaid: number;
  }>;

  splitType: "equal" | "unequal" | "percentage" | "share";

  splitMembers: Array<{
    user: Types.ObjectId;
    amountPaid: number;
    share?: number;
    percentage?: number;
    isEqualShare: boolean;
  }>;

  createdAt?: Date;
  updatedAt?: Date;
}
