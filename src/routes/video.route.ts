import { Router } from "express";
import { validate, ValidationSource } from "../middlewares/validate.middleware";
import {
  uploadVideoSchema,
  videoQuerySchema,
  videoUpdateDetailsSchema,
} from "../validators/video.validator";
import { videoIdParamSchema } from "../validators/common.validator";
import {
  deleteVideo,
  getAllVideos,
  getMyVideos,
  getVideoById,
  togglePublishStatus,
  updateVideoDetails,
  updateVideoThumbnail,
  uploadVideo,
} from "../controllers/video.controller";
import { upload } from "../middlewares/multer.middleware";
import { authenticate } from "../middlewares/authenticate.middleware";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     VideoOwner:
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
 *     Video:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         owner:
 *           $ref: '#/components/schemas/VideoOwner'
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
 *         duration:
 *           type: number
 *         views:
 *           type: integer
 *         isPublished:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     MyVideo:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
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
 *         isPublished:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     VideoOwnerWithStats:
 *       allOf:
 *         - $ref: '#/components/schemas/VideoOwner'
 *         - type: object
 *           properties:
 *             followersCount:
 *               type: integer
 *             isFollowed:
 *               type: boolean
 *
 *     VideoWithStats:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         owner:
 *           $ref: '#/components/schemas/VideoOwnerWithStats'
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
 *         duration:
 *           type: number
 *         views:
 *           type: integer
 *         isPublished:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         likesCount:
 *           type: integer
 *         isLiked:
 *           type: boolean
 *
 *     UpdatedVideo:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         owner:
 *           $ref: '#/components/schemas/VideoOwner'
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
 *         duration:
 *           type: number
 *         views:
 *           type: integer
 *         isPublished:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     PaginatedVideos:
 *       type: object
 *       properties:
 *         docs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Video'
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
 *     PaginatedMyVideos:
 *       type: object
 *       properties:
 *         docs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MyVideo'
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
 * /video/me:
 *   get:
 *     tags: [Video]
 *     summary: Get my uploaded videos
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
 *         description: Videos fetched successfully
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
 *                   example: videos fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedMyVideos'
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 */
router.route("/me").get(getMyVideos);

/**
 * @swagger
 * /video:
 *   get:
 *     tags: [Video]
 *     summary: Get all published videos
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
 *       - name: query
 *         in: query
 *         description: Search query
 *         schema:
 *           type: string
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           enum: [createdAt, views, title]
 *           default: createdAt
 *       - name: sortOrder
 *         in: query
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - name: userId
 *         in: query
 *         description: Filter by user ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Videos fetched
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
 *                   example: Videos fetched
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedVideos'
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     tags: [Video]
 *     summary: Upload a new video
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - video
 *               - thumbnail
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Sample Video Title"
 *               description:
 *                 type: string
 *                 example: "This is a sample video description"
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file (MP4/MPEG, max 100MB)
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Thumbnail image (JPEG/PNG, max 5MB)
 *     responses:
 *       201:
 *         description: Video uploaded successfully
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
 *                   example: Video uploaded successfully
 *                 data:
 *                   $ref: '#/components/schemas/Video'
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Validation error or Invalid file type/size
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Upload failed
 */
router
  .route("/")
  .get(validate(videoQuerySchema, ValidationSource.QUERY), getAllVideos)
  .post(
    upload.fields([
      { name: "video", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    validate(uploadVideoSchema, ValidationSource.BODY),
    uploadVideo,
  );

/**
 * @swagger
 * /video/{videoId}:
 *   get:
 *     tags: [Video]
 *     summary: Get video by ID with detailed stats
 *     description: Fetches video details including likes, owner followers, and user-specific data (isLiked, isFollowed)
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
 *         description: Video fetched successfully
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
 *                   example: Video fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/VideoWithStats'
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Video not found
 *       401:
 *         description: Unauthorized
 *
 *   patch:
 *     tags: [Video]
 *     summary: Update video details (title and description)
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
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Video Title"
 *               description:
 *                 type: string
 *                 example: "Updated video description"
 *     responses:
 *       200:
 *         description: Video updated successfully
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
 *                   example: Video updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/UpdatedVideo'
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Can only update own videos
 *       404:
 *         description: Video not found
 *       500:
 *         description: Failed to update video details
 *
 *   delete:
 *     tags: [Video]
 *     summary: Delete video and all related data
 *     description: Deletes video, removes from Cloudinary, and cleans up associated likes, comments, playlists, and watch history
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
 *         description: Video deleted successfully
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
 *                   example: Video deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedVideoId:
 *                       type: string
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to delete
 *       404:
 *         description: Video not found
 *       500:
 *         description: Failed to delete video
 */
router
  .route("/:videoId")
  .get(validate(videoIdParamSchema, ValidationSource.PARAM), getVideoById)
  .patch(
    validate(videoUpdateDetailsSchema, ValidationSource.BODY),
    validate(videoIdParamSchema, ValidationSource.PARAM),
    updateVideoDetails,
  )
  .delete(validate(videoIdParamSchema, ValidationSource.PARAM), deleteVideo);

/**
 * @swagger
 * /video/thumbnail/{videoId}:
 *   patch:
 *     tags: [Video]
 *     summary: Update video thumbnail
 *     description: Uploads new thumbnail to Cloudinary and deletes the old one
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - thumbnail
 *             properties:
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: New thumbnail image (JPEG/PNG, max 5MB)
 *     responses:
 *       200:
 *         description: Thumbnail updated successfully
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
 *                   example: Video thumbnail updated successfully
 *                 data:
 *                   type: object
 *                   description: Video document with populated owner (excludes __v and public_id fields)
 *                   properties:
 *                     _id:
 *                       type: string
 *                     owner:
 *                       $ref: '#/components/schemas/VideoOwner'
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     videoFile:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                     thumbnail:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                     duration:
 *                       type: number
 *                     views:
 *                       type: integer
 *                     isPublished:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Invalid file or thumbnail file required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Can only update own videos
 *       404:
 *         description: Video not found
 *       500:
 *         description: Thumbnail upload failed
 */
router
  .route("/thumbnail/:videoId")
  .patch(
    validate(videoIdParamSchema, ValidationSource.PARAM),
    upload.single("thumbnail"),
    updateVideoThumbnail,
  );

/**
 * @swagger
 * /video/publish-status/{videoId}:
 *   patch:
 *     tags: [Video]
 *     summary: Toggle video publish status
 *     description: Switches video between published and unpublished states
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
 *         description: Publish status toggled
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
 *                   example: Video is now published
 *                   description: Message will be either "Video is now published" or "Video is now unpublished"
 *                 data:
 *                   type: object
 *                   properties:
 *                     videoId:
 *                       type: string
 *                     isPublished:
 *                       type: boolean
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Can only update own videos
 *       404:
 *         description: Video not found
 */
router
  .route("/publish-status/:videoId")
  .patch(validate(videoIdParamSchema, ValidationSource.PARAM), togglePublishStatus);

export default router;
