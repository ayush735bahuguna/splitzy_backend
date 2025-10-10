import express from "express";
import authMiddleware from "../middleware/authenticate.ts";
import { getNotification } from "./notificationController.ts";

const paymentRouter = express.Router();

paymentRouter.post("/", authMiddleware, getNotification);

export default paymentRouter;
