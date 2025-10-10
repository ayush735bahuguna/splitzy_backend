import express from "express";
import authMiddleware from "../middleware/authenticate.ts";
import { addPayment } from "./paymentController.ts";

const paymentRouter = express.Router();

// paymentRouter.get("/:groupId", authMiddleware, getGroupPayments);
// paymentRouter.get("/:expenseId", authMiddleware, getExpensePayments);
paymentRouter.post("/:expenseId", authMiddleware, addPayment);

export default paymentRouter;
