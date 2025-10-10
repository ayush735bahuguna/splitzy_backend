import express from "express";
import authMiddleware from "../middleware/authenticate.ts";
import {
  addExpense,
  deleteExpense,
  getExpenseById,
  getfriendsExpenses,
  getGroupExpenses,
} from "./expenseController.ts";

const expenseRouter = express.Router();

expenseRouter.post("/", authMiddleware, addExpense);
expenseRouter.get("/:expenseId", authMiddleware, getExpenseById);
expenseRouter.get("/:friendId", authMiddleware, getfriendsExpenses);
expenseRouter.get("/:groupId", authMiddleware, getGroupExpenses);
expenseRouter.delete("/:expenseId", authMiddleware, deleteExpense);

export default expenseRouter;
