import type { NextFunction, Request, Response } from "express";
import expenseModel from "./expenseModel.ts";
import createHttpError from "http-errors";
import type { AuthRequest } from "../middleware/authenticate.ts";
import mongoose from "mongoose";
import paymentModel from "../Payment/paymentModel.ts";
import groupModel from "../Group/groupModel.ts";
import type { User } from "../User/userTypes.ts";
import { isUserFriends } from "../Friendship/friendshipController.ts";
import { createNotification } from "../Notifications/notificationController.ts";
import { getIO } from "../config/socket.ts";
import type { TExpense } from "./expenseType.ts";
const io = getIO();

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
      // reciptImage,
      relatedUsers,
      payers,
      splitType,
      splitMembers,
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
    let group;
    if (isGroupexpense) {
      group = await groupModel.findOne({ _id: groupId });

      if (!group) {
        const error = createHttpError(500, "No related group found");
        return next(error);
      }

      if (
        group?.members?.filter(
          (e) => (e as unknown as User)._id.toString() === _req.userId
        ).length === 0
      ) {
        const error = createHttpError(401, "Permission denied");
        return next(error);
      }
    } else {
      if (relatedUsers.length !== 2) {
        return next(
          createHttpError(400, "relatedUsers must be an array of two user IDs")
        );
      }
      const friends = await isUserFriends(relatedUsers[0], relatedUsers[1]);
      if (!friends) {
        return next(
          createHttpError(400, "Permission denied, users are not friend")
        );
      }
    }

    // for adding recipt file to expense
    // let reciptImage = null;
    // const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // if (files.reciptImage) {
    //   const reciptImageMimeType = files.reciptImage?.[0]?.mimetype
    //     ?.split("/")
    //     .at(-1);

    //   const filename = files?.reciptImage?.[0]?.filename;

    //   if (!filename || !reciptImageMimeType) {
    //     const error = createHttpError(400, "Recipt image file is required");
    //     return next(error);
    //   }
    //   const filepath = path.resolve(
    //     import.meta.dirname,
    //     "../../Public/data/Uploads",
    //     filename
    //   );

    //   const uploadResult = await cloudinary.uploader.upload(filepath, {
    //     filename_override: filename,
    //     folder: "Splitzy_reciptImage",
    //     format: reciptImageMimeType,
    //   });
    //   await fs.unlink(filepath);

    //   reciptImage = uploadResult.secure_url;
    // }
    const expense = await expenseModel.create({
      expenseName,
      amount,
      createdBy: _req.userId,
      expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
      status: "pending",
      isGroupexpense,
      groupId,
      reciptImage: "",
      relatedUsers,
      payers,
      splitType,
      splitMembers,
    });

    if (isGroupexpense) {
      io.to(`group:${groupId}`).emit("group:notify", {
        type: "group:expense_added",
        title: "💸 New Group Expense Added!",
        message: `A new expense has been added to **${group?.name}**.`,
        data: expense,
        timestamp: new Date().toISOString(),
      });
    } else {
      const addedByName = "Someone";
      relatedUsers?.forEach((memberId) => {
        io.to(`user:${memberId}`).emit("user:notify", {
          type: "user:expense_added",
          title: "💰 New Shared Expense",
          message: `${addedByName} added a shared expense with you.`,
          data: expense,
          timestamp: new Date().toISOString(),
        });
      });
    }

    await createNotification({
      message: "New expense added",
      notificationType: {
        category: "expense",
        relatedId: expense._id.toString(),
      },
      receivingUserId: relatedUsers as [string],
      type: "FRIEND_REQUEST_DECLINED",
    });

    res.sendStatus(201);
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
  const _req = req as AuthRequest;
  const { expenseId } = req.params;

  if (!expenseId || !mongoose.Types.ObjectId.isValid(expenseId)) {
    return next(createHttpError(400, "Invalid or missing expenseId"));
  }

  const existingExpenses = (await expenseModel.findById(
    expenseId
  )) as unknown as TExpense & {
    createdBy: { _id: string; name: string };
  };

  if (!existingExpenses) {
    const error = createHttpError(500, "No related expense found");
    return next(error);
  }

  if (existingExpenses.createdBy.toString() !== _req.userId) {
    const error = createHttpError(500, "Only creator can delete expense.");
    return next(error);
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

    existingExpenses.relatedUsers.forEach((memberId) => {
      io.to(`user:${memberId}`).emit("user:notify", {
        type: "user:deleted_expense",
        title: "❌ Expense Deleted",
        message: `The expense **${existingExpenses.expenseName}** has been deleted by **${existingExpenses.createdBy.name}**.`,
        targetId: expenseId,
        timestamp: new Date().toISOString(),
      });
    });

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
