import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel.ts";
import bcrypt from "bcrypt";
import pkg from "jsonwebtoken";
import { config } from "../config/config.ts";
import type { AuthRequest } from "../middleware/authenticate.ts";
import path from "node:path";
import cloudinary from "../config/cloudinary.ts";
import fs from "node:fs/promises";

const { sign } = pkg;

export const createuser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  try {
    const existingUser = await userModel.findOne({ email: email });

    if (existingUser) {
      const error = createHttpError(
        400,
        "User already exist with provided email"
      );

      return next(error);
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      name: name,
      email: email,
      password: hashedPass,
    });

    const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });

    res.status(201).json({ user: newUser, accessToken: token });
  } catch (err) {
    const error = createHttpError(400, "Error while registring user");
    return next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  try {
    const existingUser = await userModel.findOne({ email: email });

    if (!existingUser) {
      const error = createHttpError(400, "No user exist with provided email");
      return next(error);
    }

    const isPassValid = bcrypt.compareSync(password, existingUser.password);

    if (!isPassValid) {
      const error = createHttpError(401, "Incorrect username & password");
      return next(error);
    }

    const token = sign({ sub: existingUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });

    res.status(200).json({ user: existingUser, accessToken: token });
  } catch (err) {
    const error = createHttpError(400, "Error while registring user");
    return next(error);
  }
};

export const updateUserDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const _req = req as AuthRequest;
  const { name, pushNotifications, pushNotificationToken } = req.body;
  try {
    const existingUser = await userModel.findOne({ _id: _req.userId });

    if (!existingUser) {
      const error = createHttpError(400, "No user exist with provided email");
      return next(error);
    }
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let newprofileImage = existingUser.profilePicture;
    if (files.profileImage) {
      const profileImageMimeType = files.profileImage?.[0]?.mimetype
        ?.split("/")
        .at(-1);
      const filename = files?.profileImage?.[0]?.filename;

      if (!filename || !profileImageMimeType) {
        const error = createHttpError(400, "Profile image file is required");
        return next(error);
      }
      const filepath = path.resolve(
        import.meta.dirname,
        "../../Public/data/Uploads",
        filename
      );

      const uploadResult = await cloudinary.uploader.upload(filepath, {
        filename_override: filename,
        folder: "Splitzy_ProfileImages",
        format: profileImageMimeType,
      });
      await fs.unlink(filepath);

      if (
        existingUser.profilePicture ==
        "http://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
      ) {
        const coverFileSplit = existingUser.profilePicture.split("/");
        const coverImagePublicId =
          coverFileSplit.at(-2) +
          "/" +
          coverFileSplit.at(-1)?.split(".").at(-2);
        await cloudinary.uploader.destroy(coverImagePublicId);
      }
      newprofileImage = uploadResult.secure_url;
    }

    const newUser = await userModel.findByIdAndUpdate(
      { _id: _req.userId },
      {
        name: name ?? existingUser.name,
        profilePicture: newprofileImage,
        pushNotifications: pushNotifications ?? existingUser.pushNotifications,
        pushNotificationToken:
          pushNotificationToken ?? existingUser.pushNotificationToken,
      },

      { new: true }
    );
    const token = sign({ sub: existingUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });

    res.status(201).json({ user: newUser, accessToken: token });
  } catch (err) {
    const error = createHttpError(400, "Error updating user Details");
    return next(error);
  }
};

export const getIndivisualUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const user = await userModel.findById(userId);
    res.json({ user });
  } catch (err) {
    const error = createHttpError(500, "Error fetching user Details");
    return next(error);
  }
};

export const getIndivisualUserByName = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userName } = req.body;

    const user = await userModel.find({
      name: { $regex: userName, $options: "i" },
    });
    res.json({ user });
  } catch (err) {
    const error = createHttpError(500, "Error fetching user Details");
    return next(error);
  }
};

// for testing purpose
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const users = await userModel.find();
  res.json(users);
};
