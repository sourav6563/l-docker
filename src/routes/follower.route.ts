import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware";
import {
  getUserFollowers,
  getUserFollowing,
  toggleFollow,
} from "../controllers/follower.controller";
import { validate, ValidationSource } from "../middlewares/validate.middleware";
import { userIdParamSchema } from "../validators/common.validator";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     FollowerUser:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Follow document ID
 *         username:
 *           type: string
 *         name:
 *           type: string
 *         profileImage:
 *           type: string
 *         userId:
 *           type: string
 *           description: User ID of the follower
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     FollowingUser:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Follow document ID
 *         username:
 *           type: string
 *         name:
 *           type: string
 *         profileImage:
 *           type: string
 *         userId:
 *           type: string
 *           description: User ID of the followed user
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     PaginatedFollowers:
 *       type: object
 *       properties:
 *         docs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FollowerUser'
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
 *
 *     PaginatedFollowing:
 *       type: object
 *       properties:
 *         docs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FollowingUser'
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
 * /follower/toggle/{userId}:
 *   post:
 *     tags: [Follower]
 *     summary: Toggle follow status
 *     description: Follow or unfollow a user
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to follow/unfollow
 *     responses:
 *       200:
 *         description: Follow status toggled successfully
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
 *                   example: Followed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     isFollowed:
 *                       type: boolean
 *                 success:
 *                   type: boolean
 *       400:
 *         description: You cannot follow yourself
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router
  .route("/toggle/:userId")
  .post(validate(userIdParamSchema, ValidationSource.PARAM), toggleFollow);

/**
 * @swagger
 * /follower/followers/{userId}:
 *   get:
 *     tags: [Follower]
 *     summary: Get user's followers
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Followers fetched successfully
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
 *                   example: Followers fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedFollowers'
 *                 success:
 *                   type: boolean
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router
  .route("/followers/:userId")
  .get(validate(userIdParamSchema, ValidationSource.PARAM), getUserFollowers);

/**
 * @swagger
 * /follower/following/{userId}:
 *   get:
 *     tags: [Follower]
 *     summary: Get user's following list
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Following list fetched successfully
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
 *                   example: Following list fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedFollowing'
 *                 success:
 *                   type: boolean
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router
  .route("/following/:userId")
  .get(validate(userIdParamSchema, ValidationSource.PARAM), getUserFollowing);

export default router;
