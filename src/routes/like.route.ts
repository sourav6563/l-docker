import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleCommunityPostLike,
  toggleVideoLike,
} from "../controllers/like.controller";

import { validate, ValidationSource } from "../middlewares/validate.middleware";
import {
  commentIdParamSchema,
  postIdParamSchema,
  videoIdParamSchema,
} from "../validators/common.validator";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /like/toggle-video-like/{videoId}:
 *   post:
 *     tags: [Like]
 *     summary: Toggle like on a video
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: videoId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video like toggled successfully
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
 *                   example: Video liked successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     isLiked:
 *                       type: boolean
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Video not found
 *       401:
 *         description: Unauthorized
 */
router
  .route("/toggle-video-like/:videoId")
  .post(validate(videoIdParamSchema, ValidationSource.PARAM), toggleVideoLike);

/**
 * @swagger
 * /like/toggle-comment-like/{commentId}:
 *   post:
 *     tags: [Like]
 *     summary: Toggle like on a comment
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
 *         description: Comment like toggled successfully
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
 *                   example: Comment liked successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     isLiked:
 *                       type: boolean
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Comment not found
 *       401:
 *         description: Unauthorized
 */
router
  .route("/toggle-comment-like/:commentId")
  .post(validate(commentIdParamSchema, ValidationSource.PARAM), toggleCommentLike);

/**
 * @swagger
 * /like/toggle-community-post-like/{postId}:
 *   post:
 *     tags: [Like]
 *     summary: Toggle like on a community post
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
 *         description: Community post like toggled successfully
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
 *                   example: Post liked successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     isLiked:
 *                       type: boolean
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Community post not found
 *       401:
 *         description: Unauthorized
 */
router
  .route("/toggle-community-post-like/:postId")
  .post(validate(postIdParamSchema, ValidationSource.PARAM), toggleCommunityPostLike);

/**
 * @swagger
 * /like/liked-videos:
 *   get:
 *     tags: [Like]
 *     summary: Get all liked videos
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Liked videos fetched successfully
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
 *                   example: Liked videos fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Video'
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 */
router.route("/liked-videos").get(getLikedVideos);

export default router;
