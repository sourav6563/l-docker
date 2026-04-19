import * as z from "zod";
export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),

  email: z.string().min(1, "Email is required").trim().toLowerCase().email("Invalid email format"),

  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .toLowerCase(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must contain uppercase, lowercase, and a number",
    ),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Email or username is required").toLowerCase(),

  password: z.string().min(1, "Password is required"),
});

export const verifyAccountSchema = z.object({
  email: z.string().min(1, "Email is required").trim().toLowerCase().email("Invalid email format"),

  code: z.string().regex(/^\d{6}$/, "Verification code must be 6 digits"),
});

export const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must contain uppercase, lowercase, and a number",
    ),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").trim().toLowerCase().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Verification code must be 6 digits"),
  email: z.string().min(1, "Email is required").trim().toLowerCase().email("Invalid email format"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must contain uppercase, lowercase, and a number",
    ),
});
export const checkUsernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .toLowerCase(),
});
