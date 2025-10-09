import type { NextFunction, Request, Response } from "express";
import groupModel from "./groupModel.ts";
import type { AuthRequest } from "../middleware/authenticate.ts";
import createHttpError from "http-errors";

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

    // if (!group?.members.includes(_req.userId)) {
    //   const error = createHttpError(401, "Permission denied");
    //   return next(error);
    // }

    res.json(group);
  } catch (err) {
    const error = createHttpError(500, "Error fetching user group list");
    return next(error);
  }
};

export const createUsergroup = async (
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
) => {};
