import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { config } from "../config/config.ts";

export interface AuthRequest extends Request {
  userId: string;
}

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization");
  if (!token) {
    const error = createHttpError(401, "Auth token required");
    return next(error);
  }
  try {
    const parsedToken = token.split(" ")[1];
    const decoded = jwt.verify(
      parsedToken as string,
      config.jwtSecret as string
    );
    const _req = req as AuthRequest;
    _req.userId = decoded.sub as string;
    next();
  } catch (err) {
    const error = createHttpError(401, "Auth token expired");
    return next(error);
  }
};

export default authMiddleware;
