const mongoose = require("mongoose");
const { Schema } = mongoose;

// User Model
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phoneNo: String,
  profilePicture: String,
  pushNotifications: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

// Group Model
const GroupSchema = new Schema({
  groupName: { type: String, required: true },
  groupIcon: String,
  groupDescription: String,
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});

const Group = mongoose.model("Group", GroupSchema);

// Expense Model
const ExpenseSchema = new Schema({
  expenseName: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["pending", "settled"], required: true },
  expenseType: { type: String, enum: ["Group", "Individual"], required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  group: { type: Schema.Types.ObjectId, ref: "Group" },
  otherUser: { type: Schema.Types.ObjectId, ref: "User" }, // for individual expenses
  payers: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      amountPaid: Number,
    },
  ],
  splitDetails: Schema.Types.Mixed, // flexible JSON-style object
  relatedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  isSynced: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now },
});

const Expense = mongoose.model("Expense", ExpenseSchema);

// Payment Model
const PaymentSchema = new Schema({
  isGroupPayment: { type: Boolean, default: false },
  group: { type: Schema.Types.ObjectId, ref: "Group" },
  user: { type: Schema.Types.ObjectId, ref: "User" }, // For individual payment
  otherUser: { type: Schema.Types.ObjectId, ref: "User" },
  payments: [Schema.Types.Mixed], // array of payment objects
  isSynced: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model("Payment", PaymentSchema);

// Notification Model
const NotificationSchema = new Schema({
  message: { type: String, required: true },
  receivingUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: String, // Notification type enum string
  notificationType: Schema.Types.Mixed, // JSON object with category & relatedId
  isRead: { type: Boolean, default: false },
  isSynced: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = {
  User,
  Group,
  Expense,
  Payment,
  Notification,
};
