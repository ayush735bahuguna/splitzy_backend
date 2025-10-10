import type { NextFunction, Request, Response } from "express";
import expenseModel from "./expenseModel.ts";
import createHttpError from "http-errors";
import type { AuthRequest } from "../middleware/authenticate.ts";
import mongoose from "mongoose";
import paymentModel from "../Payment/paymentModel.ts";

export const addExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _req = req as AuthRequest;
    const {
      expenseName,
      amount,
      expenseDate,
      isGroupexpense,
      groupId,
      reciptImage,
      relatedUsers,
      payers,
      splitType,
      splitMembers,
      expensePayments,
    } = req.body;

    if (!expenseName || typeof expenseName !== "string") {
      return next(
        createHttpError(400, "Expense name is required and must be a string")
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return next(
        createHttpError(400, "Amount is required and must be a positive number")
      );
    }

    if (typeof isGroupexpense !== "boolean") {
      return next(
        createHttpError(400, "isGroupexpense must be a boolean value")
      );
    }

    const validSplitTypes = ["equal", "unequal", "percentage", "share"];
    if (!splitType || !validSplitTypes.includes(splitType)) {
      return next(
        createHttpError(
          400,
          `splitType is required and must be one of: ${validSplitTypes.join(
            ", "
          )}`
        )
      );
    }

    if (groupId && !mongoose.Types.ObjectId.isValid(groupId)) {
      return next(createHttpError(400, "Invalid groupId format"));
    }

    if (!Array.isArray(relatedUsers)) {
      return next(
        createHttpError(400, "relatedUsers must be an array of user IDs")
      );
    }

    if (!Array.isArray(payers) || payers.length === 0) {
      return next(createHttpError(400, "Payers must be a non-empty array"));
    }

    for (const [index, payer] of payers.entries()) {
      if (!payer.user || !mongoose.Types.ObjectId.isValid(payer.user)) {
        return next(
          createHttpError(
            400,
            `Payer at index ${index} must have a valid user ObjectId`
          )
        );
      }
      if (typeof payer.amountPaid !== "number" || payer.amountPaid <= 0) {
        return next(
          createHttpError(
            400,
            `Payer at index ${index} must have a positive number amountPaid`
          )
        );
      }
    }

    if (!Array.isArray(splitMembers) || splitMembers.length === 0) {
      return next(
        createHttpError(400, "splitMembers must be a non-empty array")
      );
    }

    for (const [index, member] of splitMembers.entries()) {
      if (!member.user || !mongoose.Types.ObjectId.isValid(member.user)) {
        return next(
          createHttpError(
            400,
            `splitMember at index ${index} must have a valid user ObjectId`
          )
        );
      }
      if (typeof member.amountPaid !== "number" || member.amountPaid < 0) {
        return next(
          createHttpError(
            400,
            `splitMember at index ${index} must have amountPaid >= 0`
          )
        );
      }
      if (typeof member.isEqualShare !== "boolean") {
        return next(
          createHttpError(
            400,
            `splitMember at index ${index} must have isEqualShare boolean`
          )
        );
      }
    }

    const expense = await expenseModel.create({
      expenseName,
      amount,
      createdBy: _req.userId,
      expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
      status: "pending",
      isGroupexpense,
      groupId,
      reciptImage,
      relatedUsers,
      payers,
      splitType,
      splitMembers,
      expensePayments,
    });

    res.status(201).json(expense);
  } catch (err) {
    return next(createHttpError(500, "Internal Server Error"));
  }
};

export const getGroupExpenses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const _req = req as AuthRequest;
  const { groupId } = req.params;

  if (!groupId) {
    const error = createHttpError(400, "Group ID is required");
    return next(error);
  }

  try {
    const expenses = await expenseModel.find({
      isGroupexpense: true,
      relatedUsers: { $in: [_req.userId] },
      groupId,
    });

    res.json(expenses);
  } catch (err) {
    const error = createHttpError(500, "Error fetching group expenses");
    return next(error);
  }
};

export const getfriendsExpenses = async (
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
    const expenses = await expenseModel.find({
      isGroupexpense: false,
      relatedUsers: { $all: [_req.userId, friendId] },
      $expr: { $eq: [{ $size: "$relatedUsers" }, 2] },
    });

    res.json(expenses);
  } catch (err) {
    const error = createHttpError(500, "Error fetching group expenses");
    return next(error);
  }
};

export const deleteExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { expenseId } = req.params;

  if (!expenseId || !mongoose.Types.ObjectId.isValid(expenseId)) {
    return next(createHttpError(400, "Invalid or missing expenseId"));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await paymentModel.deleteMany({ expenseId: expenseId }).session(session);

    const deleteResult = await expenseModel
      .deleteOne({ _id: expenseId })
      .session(session);

    if (deleteResult.deletedCount === 0) {
      await session.abortTransaction();
      session.endSession();
      return next(createHttpError(404, "Expense not found"));
    }

    await session.commitTransaction();
    session.endSession();

    res.sendStatus(204);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return next(createHttpError(500, "Error deleting expense and payments"));
  }
};

export const getExpenseById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { expenseId } = req.params;

  if (!expenseId || !mongoose.Types.ObjectId.isValid(expenseId)) {
    return next(createHttpError(400, "Invalid or missing expense ID"));
  }

  try {
    const expense = await expenseModel.findById(expenseId);

    if (!expense) {
      return next(createHttpError(404, "Expense not found"));
    }

    res.json(expense);
  } catch (err) {
    return next(createHttpError(500, "Error fetching expense"));
  }
};
