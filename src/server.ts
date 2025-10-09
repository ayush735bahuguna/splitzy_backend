import express from "express";
import globalErrorHandler from "./middleware/globalErrorHandler.ts";
import userRouter from "./User/userRoutes.ts";
import cors from "cors";
import { config } from "./config/config.ts";

const app = express();
app.use(express.json());
app.use(cors({ origin: config.frontendDomain }));

app.get("/", (req, res) => {
  res.send({ message: "Server is running" });
});

app.use("/api/users", userRouter);

app.use(globalErrorHandler);

export default app;
