import * as z from "zod";

export const updateNameSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});
export const updateEmailSchema = z.object({
  email: z.string().min(1, "Email is required").trim().toLowerCase().email("Invalid email format"),
});

export const updateBioSchema = z.object({
  bio: z.string().trim().max(160, "Bio must be less than 160 characters"),
});

export const userProfileSchema = z.object({
  username: z.string().trim().min(1, "Username is required").toLowerCase(),
});
