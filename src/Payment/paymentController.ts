import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import paymentModel from "./paymentModel.ts";
import mongoose from "mongoose";
import expenseModel from "../Expense/expenseModel.ts";
import type { AuthRequest } from "../middleware/authenticate.ts";

export const addPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    expenseId,
    amount,
    paymentDate,
    paymentMethod,
    paymentFrom,
    paymentTo,
    isGroupPayment,
  } = req.body;

  if (
    !expenseId ||
    !amount ||
    !paymentMethod ||
    !paymentFrom ||
    !paymentTo ||
    !isGroupPayment
  ) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  if (
    !mongoose.Types.ObjectId.isValid(expenseId) ||
    !mongoose.Types.ObjectId.isValid(paymentFrom) ||
    !mongoose.Types.ObjectId.isValid(paymentTo)
  ) {
    const error = createHttpError(400, "Invalid ObjectId(s) provided");
    return next(error);
  }

  try {
    const expense = await expenseModel.findById(expenseId);
    if (!expense) {
      const error = createHttpError(404, "Expense not found");
      return next(error);
    }

    const payments = await paymentModel.find({ expenseId: expense._id });

    const userPaymentsMap: Map<string, number> = new Map();

    for (const payment of payments) {
      const payerId = payment.paymentFrom.toString();
      userPaymentsMap.set(
        payerId,
        (userPaymentsMap.get(payerId) || 0) + payment.amount
      );
    }

    const remainingByUser: Map<string, number> = new Map();

    expense.splitMembers.forEach((member) => {
      const userId = member.user.toString();
      const owedAmount = expense.amount;

      const paidAmount = userPaymentsMap.get(userId) || 0;
      remainingByUser.set(userId, owedAmount - paidAmount);
    });

    const currentUserId = paymentFrom.toString();
    const remainingForUser = remainingByUser.get(currentUserId);

    if (remainingForUser === undefined) {
      return next(createHttpError(400, "User not authorized for this expense"));
    }

    if (amount > remainingForUser) {
      throw createHttpError(
        400,
        "Payment exceeds remaining amount for user, amount remaining: " +
          remainingForUser
      );
    }

    if (amount <= 0) {
      const error = createHttpError(400, "Payment amount must be positive");
      return next(error);
    }

    const newPayment = await paymentModel.create({
      expenseId,
      amount,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod,
      paymentFrom,
      paymentTo,
      isGroupPayment,
    });

    expense.expensePayments.push(newPayment._id);
    await expense.save();

    res.status(201).json(newPayment);
  } catch (err) {
    const error = createHttpError(500, "Error while registering payment");
    return next(error);
  }
};

export const getExpensePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { expenseId } = req.params;

  if (!expenseId) {
    const error = createHttpError(400, "Expense ID is required");
    return next(error);
  }

  try {
    const payments = await paymentModel.find({ expenseId });
    res.json(payments);
  } catch (err) {
    const error = createHttpError(500, "Error fetching payments for expense");
    return next(error);
  }
};

export const getGroupPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { groupId } = req.params;

  if (!groupId) {
    const error = createHttpError(400, "Group ID is required");
    return next(error);
  }

  try {
    const expenses = await expenseModel.find(
      { groupId },
      { isGroupPayment: true }
    );
    const expenseIds = expenses.map((expense) => expense._id);

    const payments = await paymentModel.find({
      expenseId: { $in: expenseIds },
    });

    res.json(payments);
  } catch (err) {
    const error = createHttpError(500, "Error fetching payments for group");
    return next(error);
  }
};

export const getFriendsPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const _req = req as AuthRequest;
  const { friendId } = req.params;

  if (!friendId) {
    const error = createHttpError(400, "Friend ID is required");
    return next(error);
  }

  try {
    const payments = await paymentModel.find(
      {
        $or: [
          { paymentFrom: _req.userId, paymentTo: friendId },
          { paymentFrom: friendId, paymentTo: _req.userId },
        ],
      },
      { isGroupPayment: false }
    );

    res.json(payments);
  } catch (err) {
    const error = createHttpError(500, "Error fetching payments for friend");
    return next(error);
  }
};
