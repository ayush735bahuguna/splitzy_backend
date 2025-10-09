import express from "express";
import globalErrorHandler from "./middleware/globalErrorHandler.ts";
import userRouter from "./User/userRoutes.ts";
import cors from "cors";
import { config } from "./config/config.ts";
import friendshipRouter from "./Friendship/friendshipRoutes.ts";
import groupRouter from "./Group/groupRoutes.ts";

const app = express();
app.use(express.json());
app.use(cors({ origin: config.frontendDomain }));

app.get("/", (req, res) => {
  res.send({ message: "Server is running" });
});

app.use("/api/users", userRouter);
app.use("/api/friendship", friendshipRouter);
app.use("/api/groups", groupRouter);

app.use(globalErrorHandler);

export default app;
