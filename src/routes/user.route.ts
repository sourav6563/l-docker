import { Router } from "express";
import { validate, ValidationSource } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/authenticate.middleware";
import { upload } from "../middlewares/multer.middleware";
import {
  getUserProfile,
  getWatchHistory,
  searchUsers,
  updateEmail,
  updateName,
  updateProfileImage,
  updateBio,
} from "../controllers/user.controller";
import {
  updateEmailSchema,
  updateNameSchema,
  userProfileSchema,
  updateBioSchema,
} from "../validators/user.validator";

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
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         username:
 *           type: string
 *         profileImage:
 *           type: string
 *         isVerified:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     UserProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         username:
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
 *         followersCount:
 *           type: integer
 *         followingCount:
 *           type: integer
 *         isFollowedByMe:
 *           type: boolean
 *
 *     WatchHistoryVideo:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         owner:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             username:
 *               type: string
 *             profileImage:
 *               type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         videoFile:
 *           type: string
 *           description: Video file URL
 *         thumbnail:
 *           type: string
 *           description: Thumbnail URL
 *         views:
 *           type: integer
 *         duration:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     PaginatedWatchHistory:
 *       type: object
 *       properties:
 *         docs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WatchHistoryVideo'
 *         totalDocs:
 *           type: integer
 *         limit:
 *           type: integer
 *         page:
 *           type: integer
 *         totalPages:
 *           type: integer
 *         hasNextPage:
 *           type: boolean
 *         hasPrevPage:
 *           type: boolean
 */

router.use(authenticate);

/**
 * @swagger
 * /user/search:
 *   get:
 *     tags: [User]
 *     summary: Search users by name or username
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (matches name or username)
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.route("/search").get(searchUsers);

/**
 * @swagger
 * /user/name:
 *   patch:
 *     tags: [User]
 *     summary: Update user name
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *     responses:
 *       200:
 *         description: Name updated successfully
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
 *                   example: Name updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Validation error
 *       404:
 *         description: Name update failed User not found
 *       401:
 *         description: Unauthorized
 */
router.route("/name").patch(validate(updateNameSchema, ValidationSource.BODY), updateName);

/**
 * @swagger
 * /user/email:
 *   patch:
 *     tags: [User]
 *     summary: Update user email
 *     security:
 *       - cookieAuth: []
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
 *                 example: "newemail@example.com"
 *     responses:
 *       200:
 *         description: Email updated successfully
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
 *                   example: Email updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email is already in use
 *       404:
 *         description: Email update failed User not found
 *       401:
 *         description: Unauthorized
 */
router.route("/email").patch(validate(updateEmailSchema, ValidationSource.BODY), updateEmail);

/**
 * @swagger
 * /user/profileimage:
 *   patch:
 *     tags: [User]
 *     summary: Update profile image
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - profileImage
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Profile image (JPEG/PNG)
 *     responses:
 *       200:
 *         description: Profile image updated successfully
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
 *                   example: User profileImage updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 success:
 *                   type: boolean
 *       400:
 *         description: profileImage file is required / Invalid profileImage file
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: profileImage upload failed
 */
router.route("/profileimage").patch(upload.single("profileImage"), updateProfileImage);

/**
 * @swagger
 * /user/bio:
 *   patch:
 *     tags: [User]
 *     summary: Update user bio
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bio
 *             properties:
 *               bio:
 *                 type: string
 *                 example: "I love coding and coffee!"
 *     responses:
 *       200:
 *         description: Bio updated successfully
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
 *                   example: Bio updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 success:
 *                   type: boolean
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.route("/bio").patch(validate(updateBioSchema), updateBio);

/**
 * @swagger
 * /user/history:
 *   get:
 *     tags: [User]
 *     summary: Get watch history
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Watch history fetched successfully
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
 *                   example: Watch history fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedWatchHistory'
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 */
router.route("/history").get(getWatchHistory);

/**
 * @swagger
 * /user/{username}:
 *   get:
 *     tags: [User]
 *     summary: Get user profile by username
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the user
 *     responses:
 *       200:
 *         description: User profile fetched successfully
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
 *                   example: User profile fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.route("/:username").get(validate(userProfileSchema, ValidationSource.PARAM), getUserProfile);

export default router;
