import { env } from "../env";
import { ApiError } from "../utils/apiError";

import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
export const isGuest = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ", "");

  if (!token) return next(); // not logged in

  try {
    jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch {
    // If token is invalid or expired, treat as guest
    return next();
  }

  throw new ApiError(400, "You are already logged in");
});
