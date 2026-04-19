import { env } from "./env";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite:"lax",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: "/",
  domain: env.COOKIE_DOMAIN,
} as const;

export const CookieNames = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
};

export enum EmailTypes {
  VERIFY = "VERIFY",
  RESET = "RESET",
}

export const ALLOWED_VIDEO_TYPES = ["video/mp4"];
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5MB

export const EMAIL_VERIFICATION_EXPIRY_MS = 15 * 60 * 1000;
export const PASSWORD_RESET_EXPIRY_MS = 15 * 60 * 1000;

export const USER_SENSITIVE_FIELDS =
  "-password -refreshToken -watchHistory -__v -emailVerificationCode -emailVerificationExpires -passwordResetCode -passwordResetExpires";
