import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../middleware/authenticate.ts";
import notificationModel from "./notificationModel.ts";
import createHttpError from "http-errors";
import type { TNotification } from "./notificationType.ts";
import { sendAndroidNotification } from "./fcmAndroidNotification.ts";

export const getNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _req = req as AuthRequest;
    const notifications = notificationModel.find({
      receivingUserId: _req.userId,
    });
    res.json(notifications);
  } catch (err) {
    const error = createHttpError(500, "Error while getting notifications");
    return next(error);
  }
};

interface NotificationPayload {
  receivingUserId: string[];
  message: string;
  type: TNotification["type"];
  notificationType: {
    category: "group" | "expense" | "user" | "payment";
    relatedId: string;
  };
}

export async function createNotification(payload: NotificationPayload) {
  try {
    if (!Array.isArray(payload.receivingUserId)) {
      throw new Error("receiving UserId must be an array");
    }

    const notifications = payload.receivingUserId.map((userId) => ({
      receivingUserId: userId,
      message: payload.message,
      type: payload.type,
      notificationType: {
        category: payload.notificationType.category,
        relatedId: payload.notificationType.relatedId,
      },
      isRead: false,
    }));

    await notificationModel.insertMany(notifications);

    // add android notification config
    // await sendAndroidNotification(
    //   payload.receivingUserId,
    //   "",
    //   payload.message,
    //   "",
    //   ""
    // );
  } catch (err) {
    console.error("Failed to create notification:", err);
    throw err;
  }
}
