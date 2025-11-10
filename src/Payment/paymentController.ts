import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import paymentModel from "./paymentModel.ts";
import mongoose from "mongoose";
import expenseModel from "../Expense/expenseModel.ts";
import type { AuthRequest } from "../middleware/authenticate.ts";
import { createNotification } from "../Notifications/notificationController.ts";
import { getIO } from "../config/socket.ts";
const io = getIO();

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
    paymentTo,
    isGroupPayment,
  } = req.body;
  const _req = req as AuthRequest;
  if (
    !expenseId ||
    !amount ||
    !paymentMethod ||
    !paymentTo ||
    !isGroupPayment
  ) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  if (
    !mongoose.Types.ObjectId.isValid(expenseId) ||
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

    const remainingForUser = remainingByUser.get(_req.userId);

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

    const payment = await paymentModel.create({
      expenseId,
      amount,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod,
      paymentFrom: _req.userId,
      paymentTo,
      isGroupPayment,
    });

    await createNotification({
      message: "New payment recieved",
      notificationType: {
        category: "payment",
        relatedId: payment._id.toString(),
      },
      receivingUserId: [paymentTo] as string[],
      type: "EXPENSE_CREATED",
    });

    io.to(`user:${paymentTo}`).emit("user:notify", {
      type: "user:payment_received",
      title: "💸 Payment Received!",
      // message: `${senderName} has sent you ₹${amount}.`,
      message: `Someone has sent you ₹${amount}.`,
      user: _req.userId,
      data: payment,
      timestamp: new Date().toISOString(),
    });

    res.sendStatus(201);
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
    const payments = await paymentModel
      .find({ expenseId })
      .populate("paymentFrom", "name profilePicture")
      .populate("paymentTo", "name profilePicture");

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

    const payments = await paymentModel
      .find({
        expenseId: { $in: expenseIds },
      })
      .populate("paymentFrom", "name profilePicture")
      .populate("paymentTo", "name profilePicture");

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
    const payments = await paymentModel
      .find(
        {
          $or: [
            { paymentFrom: _req.userId, paymentTo: friendId },
            { paymentFrom: friendId, paymentTo: _req.userId },
          ],
        },
        { isGroupPayment: false }
      )
      .populate("paymentFrom", "name profilePicture")
      .populate("paymentTo", "name profilePicture");

    res.json(payments);
  } catch (err) {
    const error = createHttpError(500, "Error fetching payments for friend");
    return next(error);
  }
};
