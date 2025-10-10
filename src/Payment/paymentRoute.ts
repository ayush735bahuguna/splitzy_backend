import express from "express";
import authMiddleware from "../middleware/authenticate.ts";
import {
  addPayment,
  getExpensePayment,
  getFriendsPayment,
  getGroupPayment,
} from "./paymentController.ts";

const paymentRouter = express.Router();

paymentRouter.post("/", authMiddleware, addPayment);
paymentRouter.get("/expense/:expenseId", authMiddleware, getExpensePayment);
paymentRouter.get("/group/:groupId", authMiddleware, getGroupPayment);
paymentRouter.get("/friend/:friendId", authMiddleware, getFriendsPayment);

export default paymentRouter;
