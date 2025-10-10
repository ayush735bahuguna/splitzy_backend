import express from "express";
import authMiddleware from "../middleware/authenticate.ts";
import {
  addExpense,
  deleteExpense,
  getExpenseById,
  getfriendsExpenses,
  getGroupExpenses,
} from "./expenseController.ts";
// import multer from "multer";
// import path from "node:path";

const expenseRouter = express.Router();

// const upload = multer({
//   dest: path.resolve(import.meta.dirname, "../../Public/data/Uploads"),
//   limits: { fileSize: 3e7 },
// });

expenseRouter.post(
  "/",
  authMiddleware,
  // upload.fields([{ name: "reciptImage", maxCount: 1 }]),
  addExpense
);
expenseRouter.get("/:expenseId", authMiddleware, getExpenseById);
expenseRouter.get("/expense/:friendId", authMiddleware, getfriendsExpenses);
expenseRouter.get("/expense/:groupId", authMiddleware, getGroupExpenses);
expenseRouter.delete("/:expenseId", authMiddleware, deleteExpense);

export default expenseRouter;
