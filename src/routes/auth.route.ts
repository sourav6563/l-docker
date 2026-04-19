import { Router } from "express";
import {
  forgotPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  resetPassword,
  verifyAccount,
  changePassword,
  checkUsername,
  getMe,
  registerUser,
} from "../controllers/auth.controller";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  verifyAccountSchema,
  checkUsernameSchema,
  registerSchema,
} from "../validators/auth.validator";
import { validate, ValidationSource } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/authenticate.middleware";
import { isGuest } from "../middlewares/guest.middleware";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         name:
 *           type: string
 *         profileImage:
 *           type: string
 *         isVerified:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Public routes

/**
 * @swagger
 * /auth/check-username:
 *   get:
 *     tags: [Auth]
 *     summary: Check username availability
 *     parameters:
 *       - name: username
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Username to check
 *     responses:
 *       200:
 *         description: Username availability status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Username is available
 *                   description: Either "Username is already taken" or "Username is available"
 *                 data:
 *                   type: object
 *                   properties:
 *                     available:
 *                       type: boolean
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Validation error
 */
router
  .route("/check-username")
  .get(validate(checkUsernameSchema, ValidationSource.QUERY), checkUsername);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - username
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePass123!"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: User registered. Please verify your email
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   description: No data returned, only message
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists / Username already exists / Email and username belong to different accounts
 *       500:
 *         description: Failed to send verification email
 */
router
  .route("/register")
  .post(isGuest, validate(registerSchema, ValidationSource.BODY), registerUser);

/**
 * @swagger
 * /auth/verify-account:
 *   post:
 *     tags: [Auth]
 *     summary: Verify email with code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   description: No data returned, only message
 *                 success:
 *                   type: boolean
 *       400:
 *         description: User already verified / Invalid verification code / Verification code expired / Validation error
 *       404:
 *         description: User not found
 */
router
  .route("/verify-account")
  .post(isGuest, validate(verifyAccountSchema, ValidationSource.BODY), verifyAccount);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     description: Sets access and refresh tokens in HTTP-only cookies
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or username
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePass123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: accessToken=abc123; refreshToken=xyz789
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: User logged in successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials / Invalid password
 *       500:
 *         description: Something went wrong while logging in user
 */
router.route("/login").post(isGuest, validate(loginSchema, ValidationSource.BODY), loginUser);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     description: Uses refresh token from cookie or Authorization header to generate new access and refresh tokens
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: accessToken=abc123; refreshToken=xyz789
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Access token refreshed successfully
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   description: No data returned, tokens set in cookies
 *                 success:
 *                   type: boolean
 *       401:
 *         description: UNAUTHORIZED / INVALID_REFRESH_TOKEN
 *       500:
 *         description: Internal server error
 */
router.route("/refresh-token").post(refreshAccessToken);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *     responses:
 *       200:
 *         description: Reset code sent to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Password reset code sent to your email
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   description: No data returned, only message
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to send reset password email
 */
router
  .route("/forgot-password")
  .post(isGuest, validate(forgotPasswordSchema, ValidationSource.BODY), forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password with code
 *     description: Resets password and clears all auth cookies, requiring re-login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               code:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewSecurePass123!"
 *     responses:
 *       200:
 *         description: Password reset successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: accessToken=; refreshToken=; (cleared cookies)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Password reset successful. Please login again
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   description: No data returned, only message
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Validation error / Invalid reset code / Reset code expired
 *       404:
 *         description: User not found
 */
router
  .route("/reset-password")
  .post(isGuest, validate(resetPasswordSchema, ValidationSource.BODY), resetPassword);

// Protected routes
router.use(authenticate);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: User details fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 */
router.route("/me").get(getMe);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 example: "OldPass123!"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewSecurePass123!"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   description: No data returned, only message
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Validation error
 *       401:
 *         description: old password is incorrect / Unauthorized request
 *       404:
 *         description: update password failed User not found
 */
router
  .route("/change-password")
  .post(validate(updatePasswordSchema, ValidationSource.BODY), changePassword);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     description: Clears refresh token from database and removes auth cookies
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: accessToken=; refreshToken=; (cleared cookies)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: User logged out successfully
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   description: No data returned, only message
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized request
 *       404:
 *         description: User not found
 */
router.route("/logout").post(logoutUser);

export default router;
