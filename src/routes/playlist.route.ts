import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware";
import { validate, ValidationSource } from "../middlewares/validate.middleware";
import { PlaylistSchema, UpdatePlaylistSchema } from "../validators/playlist.validator";
import {
  playlistIdParamSchema,
  userIdParamSchema,
  videoIdParamSchema,
} from "../validators/common.validator";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getMyPlaylists,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  searchPlaylists,
  updatePlaylist,
} from "../controllers/playlist.controller";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Playlist:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         videos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               title:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *         totalVideos:
 *           type: integer
 *         playlistThumbnail:
 *           type: string
 *         owner:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     PaginatedPlaylists:
 *       type: object
 *       properties:
 *         docs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Playlist'
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

// Protected routes
router.use(authenticate);

/**
 * @swagger
 * /playlist/search:
 *   get:
 *     tags: [Playlist]
 *     summary: Search playlists by name or description
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: query
 *         in: query
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
 *         description: Playlists fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.route("/search").get(searchPlaylists);

/**
 * @swagger
 * /playlist:
 *   post:
 *     tags: [Playlist]
 *     summary: Create a new playlist
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
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: "My Favorite Videos"
 *               description:
 *                 type: string
 *                 example: "A collection of my favorite videos"
 *     responses:
 *       201:
 *         description: Playlist created successfully
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
 *                   example: Playlist created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Playlist'
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.route("/").post(validate(PlaylistSchema, ValidationSource.BODY), createPlaylist);

/**
 * @swagger
 * /playlist/me:
 *   get:
 *     tags: [Playlist]
 *     summary: Get current user's playlists
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
 *         description: Playlists fetched successfully
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
 *                   example: User playlists fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedPlaylists'
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 */
router.route("/me").get(getMyPlaylists);

/**
 * @swagger
 * /playlist/user/{userId}:
 *   get:
 *     tags: [Playlist]
 *     summary: Get user's playlists by userId
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User playlists fetched successfully
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
 *                   example: User playlists fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Playlist'
 *                 success:
 *                   type: boolean
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router
  .route("/user/:userId")
  .get(validate(userIdParamSchema, ValidationSource.PARAM), getUserPlaylists);

/**
 * @swagger
 * /playlist/{playlistId}:
 *   get:
 *     tags: [Playlist]
 *     summary: Get playlist by ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: playlistId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Playlist fetched successfully
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
 *                   example: Playlist fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/Playlist'
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Playlist not found
 *       401:
 *         description: Unauthorized
 *
 *   patch:
 *     tags: [Playlist]
 *     summary: Update playlist
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: playlistId
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Playlist updated successfully
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
 *                   example: Playlist updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Playlist'
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Validation error
 *       404:
 *         description: Playlist not found
 *       401:
 *         description: Unauthorized
 *
 *   delete:
 *     tags: [Playlist]
 *     summary: Delete playlist
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: playlistId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Playlist deleted successfully
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
 *                   example: Playlist deleted successfully
 *                 data:
 *                   type: object
 *                   nullable: true
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Playlist not found
 *       401:
 *         description: Unauthorized
 */
router
  .route("/:playlistId")
  .get(validate(playlistIdParamSchema, ValidationSource.PARAM), getPlaylistById)
  .patch(
    validate(playlistIdParamSchema, ValidationSource.PARAM),
    validate(UpdatePlaylistSchema, ValidationSource.BODY),
    updatePlaylist,
  )
  .delete(validate(playlistIdParamSchema, ValidationSource.PARAM), deletePlaylist);

/**
 * @swagger
 * /playlist/{playlistId}/videos/{videoId}:
 *   post:
 *     tags: [Playlist]
 *     summary: Add video to playlist
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: playlistId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: videoId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video added to playlist successfully
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
 *                   example: Video added to playlist successfully
 *                 data:
 *                   $ref: '#/components/schemas/Playlist'
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Playlist or Video not found
 *       401:
 *         description: Unauthorized
 *
 *   delete:
 *     tags: [Playlist]
 *     summary: Remove video from playlist
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: playlistId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: videoId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video removed from playlist successfully
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
 *                   example: Video removed from playlist successfully
 *                 data:
 *                   $ref: '#/components/schemas/Playlist'
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Playlist or Video not found
 *       401:
 *         description: Unauthorized
 */
router
  .route("/:playlistId/videos/:videoId")
  .post(
    validate(playlistIdParamSchema, ValidationSource.PARAM),
    validate(videoIdParamSchema, ValidationSource.PARAM),
    addVideoToPlaylist,
  )
  .delete(
    validate(playlistIdParamSchema, ValidationSource.PARAM),
    validate(videoIdParamSchema, ValidationSource.PARAM),
    removeVideoFromPlaylist,
  );

export default router;
