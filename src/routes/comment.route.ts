import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware";
import {
  addPostComment,
  addVideoComment,
  deleteComment,
  getPostComments,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller";
import { validate, ValidationSource } from "../middlewares/validate.middleware";
import { commentContentSchema } from "../validators/comment.validator";
import {
  commentIdParamSchema,
  postIdParamSchema,
  videoIdParamSchema,
} from "../validators/common.validator";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         content:
 *           type: string
 *         video:
 *           type: string
 *         communityPost:
 *           type: string
 *         owner:
 *           $ref: '#/components/schemas/CommentOwner'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CommentOwner:
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
 *     CommentWithStats:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         content:
 *           type: string
 *         owner:
 *           $ref: '#/components/schemas/CommentOwner'
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
 *     PaginatedComments:
 *       type: object
 *       properties:
 *         docs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CommentWithStats'
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

/**
 * @swagger
 * /comment/video-comments/{videoId}:
 *   get:
 *     tags: [Comment]
 *     summary: Get comments for a video
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: videoId
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
 *         description: Video comments fetched successfully
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
 *                   example: Video comments fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedComments'
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Video not found
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     tags: [Comment]
 *     summary: Add a comment to a video
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: videoId
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
 *                 example: "This is a great video!"
 *     responses:
 *       201:
 *         description: Comment added successfully
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
 *                   example: Comment added successfully
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Video not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to add comment
 */
router
  .route("/video-comments/:videoId")
  .get(authenticate, validate(videoIdParamSchema, ValidationSource.PARAM), getVideoComments)
  .post(
    authenticate,
    validate(videoIdParamSchema, ValidationSource.PARAM),
    validate(commentContentSchema, ValidationSource.BODY),
    addVideoComment,
  );

/**
 * @swagger
 * /comment/post-comments/{postId}:
 *   get:
 *     tags: [Comment]
 *     summary: Get comments for a community post
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: postId
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
 *         description: Post comments fetched successfully
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
 *                   example: Post comments fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedComments'
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Community post not found
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     tags: [Comment]
 *     summary: Add a comment to a community post
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
 *                 example: "Nice post!"
 *     responses:
 *       201:
 *         description: Comment added successfully
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
 *                   example: Comment added successfully
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Community post not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to add comment
 */
router
  .route("/post-comments/:postId")
  .get(authenticate, validate(postIdParamSchema, ValidationSource.PARAM), getPostComments)
  .post(
    authenticate,
    validate(postIdParamSchema, ValidationSource.PARAM),
    validate(commentContentSchema, ValidationSource.BODY),
    addPostComment,
  );

/**
 * @swagger
 * /comment/{commentId}:
 *   patch:
 *     tags: [Comment]
 *     summary: Update a comment
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: commentId
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
 *                 example: "Updated comment content"
 *     responses:
 *       200:
 *         description: Comment updated successfully
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
 *                   example: Comment updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *                 success:
 *                   type: boolean
 *       403:
 *         description: Unauthorized to edit this comment
 *       404:
 *         description: Comment not found
 *       401:
 *         description: Unauthorized
 *
 *   delete:
 *     tags: [Comment]
 *     summary: Delete a comment
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: commentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
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
 *                   example: Comment deleted successfully
 *                 data:
 *                   type: object
 *                   nullable: true
 *                 success:
 *                   type: boolean
 *       403:
 *         description: Unauthorized to delete this comment
 *       404:
 *         description: Comment not found
 *       401:
 *         description: Unauthorized
 */
router
  .route("/:commentId")
  .patch(
    authenticate,
    validate(commentIdParamSchema, ValidationSource.PARAM),
    validate(commentContentSchema, ValidationSource.BODY),
    updateComment,
  )
  .delete(authenticate, validate(commentIdParamSchema, ValidationSource.PARAM), deleteComment);

export default router;
