import express from "express";
import {
  createuser,
  getAllUsers,
  getIndivisualUserById,
  getIndivisualUserByName,
  loginUser,
  updateUserDetails,
} from "./userController.ts";
import authMiddleware from "../middleware/authenticate.ts";
import multer from "multer";
import path from "node:path";

const userRouter = express.Router();

const upload = multer({
  dest: path.resolve(import.meta.dirname, "../../Public/data/Uploads"),
  limits: { fileSize: 3e7 },
});

userRouter.post("/register", createuser);
userRouter.post("/login", loginUser);
userRouter.put(
  "/update",
  authMiddleware,
  upload.fields([{ name: "profileImage", maxCount: 1 }]),
  updateUserDetails
);
userRouter.get("/:userId", authMiddleware, getIndivisualUserById);
userRouter.post("/", authMiddleware, getIndivisualUserByName);
userRouter.get("/", getAllUsers);

export default userRouter;
