import express from "express";

import authMiddleware from "../middleware/authenticate.ts";
import {
  addusertoGroup,
  createGroup,
  deleteGroup,
  getIndivisualGroup,
  getUserGroups,
} from "./groupController.ts";

const groupRouter = express.Router();

groupRouter.get("/", authMiddleware, getUserGroups);
groupRouter.post("/", authMiddleware, createGroup);
groupRouter.get("/:groupId", authMiddleware, getIndivisualGroup);
groupRouter.put("/:groupId", authMiddleware, addusertoGroup);
groupRouter.delete("/:groupId", authMiddleware, deleteGroup);

export default groupRouter;
