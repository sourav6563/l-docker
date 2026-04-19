import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware";
import { validate, ValidationSource } from "../middlewares/validate.middleware";
import { communityPostSchema } from "../validators/userCommunitypost.validator";
import { postIdParamSchema, userIdParamSchema } from "../validators/common.validator";
import {
  createCommunityPost,
  deleteCommunityPost,
  getAllCommunityPosts,
  getUserCommunityPosts,
  updateCommunityPost,
} from "../controllers/communityPost.controller";
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CommunityPost:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         content:
 *           type: string
 *         owner:
 *           $ref: '#/components/schemas/CommunityPostOwner'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CommunityPostOwner:
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
 *
 *     CommunityPostWithStats:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         content:
 *           type: string
 *         owner:
 *           $ref: '#/components/schemas/CommunityPostOwner'
 *         likesCount:
 *           type: integer
 *         isLiked:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     PaginatedCommunityPosts:
 *       type: object
 *       properties:
 *         docs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CommunityPostWithStats'
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
 * /communitypost:
 *   post:
 *     tags: [CommunityPost]
 *     summary: Create a new community post
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This is a new community post!"
 *     responses:
 *       201:
 *         description: Community post created successfully
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
 *                   example: Community post created successfully
 *                 data:
 *                   $ref: '#/components/schemas/CommunityPost'
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to create post
 */
router.route("/").post(validate(communityPostSchema, ValidationSource.BODY), createCommunityPost);

/**
 * @swagger
 * /communitypost/feed:
 *   get:
 *     tags: [CommunityPost]
 *     summary: Get all community posts (global feed)
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
 *         description: Community feed fetched successfully
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
 *                   example: Community feed fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedCommunityPosts'
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 */
router.route("/feed").get(getAllCommunityPosts);

/**
 * @swagger
 * /communitypost/user/{userId}:
 *   get:
 *     tags: [CommunityPost]
 *     summary: Get user's community posts
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
 *         description: Community posts fetched successfully
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
 *                   example: Community posts fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedCommunityPosts'
 *                 success:
 *                   type: boolean
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch community posts
 */
router
  .route("/user/:userId")
  .get(validate(userIdParamSchema, ValidationSource.PARAM), getUserCommunityPosts);

/**
 * @swagger
 * /communitypost/{postId}:
 *   patch:
 *     tags: [CommunityPost]
 *     summary: Update a community post
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Updated content"
 *     responses:
 *       200:
 *         description: Post updated successfully
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
 *                   example: Post updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/CommunityPost'
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Validation error
 *       403:
 *         description: You can only edit your own posts
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to update post
 *
 *   delete:
 *     tags: [CommunityPost]
 *     summary: Delete a community post
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
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
 *                   example: Post deleted successfully
 *                 data:
 *                   type: object
 *                   nullable: true
 *                 success:
 *                   type: boolean
 *       403:
 *         description: You can only delete your own posts
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to delete post
 */
router
  .route("/:postId")
  .patch(
    validate(postIdParamSchema, ValidationSource.PARAM),
    validate(communityPostSchema, ValidationSource.BODY),
    updateCommunityPost,
  )
  .delete(validate(postIdParamSchema, ValidationSource.PARAM), deleteCommunityPost);

export default router;
