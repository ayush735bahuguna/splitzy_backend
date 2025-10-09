import type { Schema } from "mongoose";

export interface TGroup {
  _id: string;
  name: string;
  description: string;
  icon: string;
  members: Schema.Types.ObjectId[];
  createdBy: Schema.Types.ObjectId;
}
