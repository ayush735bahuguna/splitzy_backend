import type { NextFunction, Request, Response } from "express";
import friendshipModel from "./friendshipModel.ts";
import type { AuthRequest } from "../middleware/authenticate.ts";
import createHttpError from "http-errors";
import { createNotification } from "../Notifications/notificationController.ts";

export const initializeFriendship = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const _req = req as AuthRequest;
  const { friendId } = req.body;

  if (!friendId) {
    return next(createHttpError(400, "Friend ID is required."));
  }

  if (_req.userId === friendId) {
    return next(
      createHttpError(400, "You cannot send a friend request to yourself.")
    );
  }

  try {
    const friendshipExist = await friendshipModel.findOne({
      users: { $all: [friendId, _req.userId] },
    });

    if (friendshipExist) {
      return next(createHttpError(400, "Request already sent"));
    }
    await friendshipModel.create({
      users: [_req.userId, friendId],
      requestedBy: _req.userId,
    });

    await createNotification({
      message: "New friend request recieved",
      notificationType: { category: "user", relatedId: _req.userId },
      receivingUserId: friendId,
      type: "FRIEND_REQUEST_RECEIVED",
    });

    res.status(201).json({ message: "Friend request sent successfully." });
  } catch (err) {
    next(
      createHttpError(
        500,
        "Failed to send friend request. Please try again later."
      )
    );
  }
};

export const updateFriendshipStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const _req = req as AuthRequest;
  const { friendshipId } = req.params;
  const { newStatus } = req.body;

  if (!friendshipId || !newStatus) {
    return next(
      createHttpError(400, "Both 'friendshipId' and 'newStatus' are required.")
    );
  }

  const allowedStatuses = ["pending", "friends", "declined"];

  if (!allowedStatuses.includes(newStatus)) {
    return next(
      createHttpError(
        400,
        `Invalid status value. Allowed values are: ${allowedStatuses.join(
          ", "
        )}.`
      )
    );
  }

  try {
    const existingFriendship = await friendshipModel.findById(friendshipId);

    if (!existingFriendship) {
      return next(createHttpError(404, "Friendship record not found."));
    }

    if (!existingFriendship.users.includes(_req.userId)) {
      return next(
        createHttpError(
          403,
          "You are not authorized to modify this friendship."
        )
      );
    }

    const friendship = await friendshipModel.findByIdAndUpdate(friendshipId, {
      status: newStatus,
    });
    if (friendship?.requestedBy) {
      if (newStatus == "declined") {
        await createNotification({
          message: "New friend request rejected",
          notificationType: { category: "user", relatedId: _req.userId },
          receivingUserId: [friendship?.requestedBy],
          type: "FRIEND_REQUEST_DECLINED",
        });
      } else if (newStatus == "friends") {
        await createNotification({
          message: "New friend request recieved",
          notificationType: { category: "user", relatedId: _req.userId },
          receivingUserId: [friendship?.requestedBy],
          type: "FRIEND_REQUEST_ACCEPTED",
        });
      }
    }
    res
      .status(200)
      .json({ message: "Friendship status updated successfully." });
  } catch (err) {
    next(
      createHttpError(
        500,
        "Failed to update friendship status. Please try again later."
      )
    );
  }
};

export const getUserFriendRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _req = req as AuthRequest;
    const friendRequests = await friendshipModel
      .find({
        requestedBy: { $ne: _req.userId },
        status: "pending",
        users: _req.userId,
      })
      .populate("users", "name profilePicture")
      .populate("requestedBy", "name profilePicture");

    res.status(200).json(friendRequests);
  } catch (err) {
    next(createHttpError(500, "Failed to fetch received friend requests."));
  }
};

export const getSentFriendRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _req = req as AuthRequest;
    const friendRequests = await friendshipModel
      .find({
        requestedBy: _req.userId,
        users: _req.userId,
      })
      .populate("users", "name profilePicture")
      .populate("requestedBy", "_id");

    res.status(200).json(friendRequests);
  } catch (err) {
    next(createHttpError(500, "Failed to fetch sent friend requests."));
  }
};

export const getUserfriendList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _req = req as AuthRequest;

    const friendships = await friendshipModel
      .find({
        users: { $in: [_req.userId] },
        status: "friends",
      })
      .populate("users", "name email profilePicture");

    const friendList = friendships.map((f) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const users = f.users as any[];
      return users[0]._id.equals(_req.userId) ? users[1] : users[0];
    });

    res.json(friendList);
  } catch (err) {
    const error = createHttpError(500, "Error fetching friends list");
    return next(error);
  }
};

export async function isUserFriends(
  userId: string,
  friendId: string
): Promise<boolean> {
  if (userId === friendId) return false;
  const friendship = await friendshipModel.findOne({
    status: "friends",
    users: { $all: [userId, friendId] },
  });

  return !!friendship;
}
