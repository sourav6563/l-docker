import z from "zod";
import { Types } from "mongoose";

// Helper to validate MongoDB ObjectId
export const mongoIdSchema = z
  .string()
  .trim()
  .refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ID",
  });

// Specific parameter schemas
export const videoIdParamSchema = z.object({
  videoId: mongoIdSchema,
});

export const commentIdParamSchema = z.object({
  commentId: mongoIdSchema,
});

export const playlistIdParamSchema = z.object({
  playlistId: mongoIdSchema,
});

export const userIdParamSchema = z.object({
  userId: mongoIdSchema,
});

export const postIdParamSchema = z.object({
  postId: mongoIdSchema,
});
