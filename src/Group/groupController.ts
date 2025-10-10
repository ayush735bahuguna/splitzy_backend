import type { NextFunction, Request, Response } from "express";
import groupModel from "./groupModel.ts";
import type { AuthRequest } from "../middleware/authenticate.ts";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import expenseModel from "../Expense/expenseModel.ts";
import paymentModel from "../Payment/paymentModel.ts";
import type { User } from "../User/userTypes.ts";
import { createNotification } from "../Notifications/notificationController.ts";

export const getUserGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _req = req as AuthRequest;
    const userGroups = await groupModel
      .find({
        members: { $in: [_req.userId] },
      })
      .populate("members", "_id name profilePicture")
      .populate("createdBy", "_id name profilePicture");

    res.json(userGroups);
  } catch (err) {
    const error = createHttpError(500, "Error fetching user group list");
    return next(error);
  }
};

export const getIndivisualGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { groupId } = req.params;

    const group = await groupModel
      .findById(groupId)
      .populate("members", "_id name email profilePicture")
      .populate("createdBy", "_id name email profilePicture");
    const _req = req as AuthRequest;

    if (
      group?.members?.filter(
        (e) => (e as unknown as User)._id.toString() === _req.userId
      ).length === 0
    ) {
      const error = createHttpError(401, "Permission denied");
      return next(error);
    }

    res.json(group);
  } catch (err) {
    const error = createHttpError(500, "Error fetching user group list");
    return next(error);
  }
};

export const createGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const _req = req as AuthRequest;
  const { groupName, groupMembers, groupDescription, groupIcon } = req.body;

  if (!groupName || typeof groupName !== "string") {
    const error = createHttpError(
      400,
      "Group name is required and must be a string"
    );
    return next(error);
  }

  if (
    !Array.isArray(groupMembers) ||
    !groupMembers.every((member) => typeof member === "string")
  ) {
    const error = createHttpError(
      400,
      "Group members must be an array of user IDs (strings)"
    );
    return next(error);
  }

  if (groupDescription && typeof groupDescription !== "string") {
    const error = createHttpError(400, "Group description must be a string");
    return next(error);
  }

  try {
    const group = await groupModel.create({
      name: groupName,
      icon: groupIcon ?? "default",
      members: [_req.userId, ...groupMembers],
      createdBy: _req.userId,
      description: groupDescription,
    });

    await createNotification({
      message: "You are added to new group",
      notificationType: {
        category: "group",
        relatedId: group._id.toString(),
      },
      receivingUserId: groupMembers as [string],
      type: "GROUP_CREATED",
    });

    res.sendStatus(201);
  } catch (err) {
    const error = createHttpError(500, "Error creating group");
    return next(error);
  }
};

export const addusertoGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { groupId } = req.params;
  const { groupMemberId } = req.body;

  if (!groupId || !groupMemberId) {
    const error = createHttpError(500, "Provide requored fields");
    return next(error);
  }

  try {
    const existingGroup = await groupModel.findById(groupId);
    if (!existingGroup) {
      const error = createHttpError(500, "No related group found");
      return next(error);
    }
    if (existingGroup.members.includes(groupMemberId)) {
      const error = createHttpError(500, "User already exist");
      return next(error);
    }
    await groupModel.findByIdAndUpdate(
      { _id: groupId },
      {
        members: [...existingGroup.members, groupMemberId],
      }
    );
    await createNotification({
      message: "You are added to gruop",
      notificationType: {
        category: "group",
        relatedId: groupId,
      },

      receivingUserId: [groupMemberId],
      type: "GROUP_JOINED",
    });
    await createNotification({
      message: "New member added to group",
      notificationType: {
        category: "group",
        relatedId: groupId,
      },
      receivingUserId: existingGroup.members.map((e) =>
        e.toString()
      ) as string[],
      type: "GROUP_JOINED",
    });

    res.sendStatus(201);
  } catch (err) {
    const error = createHttpError(500, "Error adding user to group");
    console.log(err);

    return next(error);
  }
};

export const deleteGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { groupId } = req.params;

  if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
    return next(createHttpError(400, "Invalid or missing groupId"));
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const expenses = await expenseModel.find({ groupId }).session(session);
    const expenseIds = expenses.map((e) => e._id);

    await paymentModel
      .deleteMany({ expenseId: { $in: expenseIds } })
      .session(session);

    await expenseModel
      .deleteMany({ _id: { $in: expenseIds } })
      .session(session);

    const deleteResult = await groupModel
      .deleteOne({ _id: groupId })
      .session(session);

    if (deleteResult.deletedCount === 0) {
      await session.abortTransaction();
      session.endSession();
      return next(createHttpError(404, "Group not found"));
    }

    await session.commitTransaction();
    session.endSession();

    res.sendStatus(204);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return next(createHttpError(500, "Error deleting group and related data"));
  }
};
