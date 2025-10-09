import express from "express";

import authMiddleware from "../middleware/authenticate.ts";
import {
  getSentFriendRequests,
  getUserfriendList,
  getUserFriendRequests,
  initializeFriendship,
  updateFriendshipStatus,
} from "./friendshipController.ts";

const friendshipRouter = express.Router();

friendshipRouter.get("/", authMiddleware, getUserfriendList);
friendshipRouter.post("/initiate", authMiddleware, initializeFriendship);
friendshipRouter.post(
  "/updateStatus/:friendshipId",
  authMiddleware,
  updateFriendshipStatus
);
friendshipRouter.get("/gotRequests", authMiddleware, getUserFriendRequests);
friendshipRouter.get("/sentRequests", authMiddleware, getSentFriendRequests);

export default friendshipRouter;
