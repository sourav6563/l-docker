/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { env } from "../env";
import { User } from "../models/user.model";
import { USER_SENSITIVE_FIELDS } from "../constants";

export const authenticate = asyncHandler(async (req: Request, _: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "UNAUTHORIZED");
  }

  try {
    const decodedToken = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;

    const user = await User.findById(decodedToken._id).select(USER_SENSITIVE_FIELDS);

    if (!user) {
      throw new ApiError(401, "UNAUTHORIZED");
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "ACCESS_TOKEN_EXPIRED");
    }

    throw new ApiError(401, "UNAUTHORIZED");
  }
});
