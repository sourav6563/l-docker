/* eslint-disable @typescript-eslint/no-explicit-any */
import { Video } from "../models/video.model";
import { ApiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary";
import { logger } from "../utils/logger";
import { Request, Response } from "express";
import { unlink } from "fs/promises";
import { VideoQuery } from "../validators/video.validator";
import { Like } from "../models/like.model";
import { Comment } from "../models/comment.model";
import { User } from "../models/user.model";
import { Types } from "mongoose";
import { Playlist } from "../models/playlist.model";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_THUMBNAIL_SIZE,
  MAX_VIDEO_SIZE,
} from "../constants";

export const uploadVideo = asyncHandler(async (req: Request, res: Response) => {
  const owner = req.user?._id;
  const { title, description } = req.body;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const videoFile = files?.video?.[0];
  const thumbnailFile = files?.thumbnail?.[0];

  if (!videoFile?.path) {
    throw new ApiError(400, "Video file is required");
  }

  if (!thumbnailFile?.path) {
    throw new ApiError(400, "Thumbnail file is required");
  }

  let videoUploadResult = null;
  let thumbnailUploadResult = null;

  try {
    if (!ALLOWED_VIDEO_TYPES.includes(videoFile.mimetype)) {
      throw new ApiError(
        400,
        "Invalid video file type. Only mp4 or mpeg allowed.",
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(thumbnailFile.mimetype)) {
      throw new ApiError(
        400,
        "Invalid thumbnail type. Only jpeg or png allowed.",
      );
    }

    if (videoFile.size > MAX_VIDEO_SIZE) {
      throw new ApiError(
        400,
        `Video file exceeds ${MAX_VIDEO_SIZE / (1024 * 1024)}MB size limit`,
      );
    }

    if (thumbnailFile.size > MAX_THUMBNAIL_SIZE) {
      throw new ApiError(
        400,
        `Thumbnail exceeds ${MAX_THUMBNAIL_SIZE / (1024 * 1024)}MB size limit`,
      );
    }

    // 2. Upload to Cloudinary
    videoUploadResult = await uploadOnCloudinary(videoFile.path, {
      resource_type: "video",
    });

    thumbnailUploadResult = await uploadOnCloudinary(thumbnailFile.path);

    // Removed null checks as uploadOnCloudinary throws error on failure
    logger.info(
      `User ${owner} uploaded files: video=${videoUploadResult.secure_url}, thumbnail=${thumbnailUploadResult.secure_url}`,
    );

    // 3. Create Database Entry
    const newVideo = await Video.create({
      owner,
      videoFile: {
        url: videoUploadResult.secure_url,
        public_id: videoUploadResult.public_id,
      },
      thumbnail: {
        url: thumbnailUploadResult.secure_url,
        public_id: thumbnailUploadResult.public_id,
      },
      title,
      description,
      duration: videoUploadResult.duration,
      isPublished: false,
    });

    // 4. Retrieve Clean Data (Using Aggregation Pipeline)
    const createdVideo = await Video.aggregate([
      {
        $match: {
          _id: newVideo._id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                username: 1,
                name: 1,
                profileImage: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          owner: { $first: "$owner" },
        },
      },
      {
        $project: {
          _id: 1,
          owner: 1,
          title: 1,
          description: 1,
          duration: 1,
          views: 1,
          isPublished: 1,
          createdAt: 1,
          videoFile: {
            url: "$videoFile.url",
            public_id: "$videoFile.public_id",
          },
          thumbnail: {
            url: "$thumbnail.url",
            public_id: "$thumbnail.public_id",
          },
        },
      },
    ]);

    if (!createdVideo.length) {
      throw new ApiError(500, "Video created but failed to retrieve");
    }

    return res
      .status(201)
      .json(
        new apiResponse(201, "Video uploaded successfully", createdVideo[0]),
      );
  } catch (error: any) {
    logger.error("uploadVideo error:", error.message);

    // Rollback: Delete from Cloudinary if DB save failed
    if (videoUploadResult?.public_id) {
      await deleteOnCloudinary(videoUploadResult.public_id).catch(() => {});
    }

    if (thumbnailUploadResult?.public_id) {
      await deleteOnCloudinary(thumbnailUploadResult.public_id).catch(() => {});
    }
    throw error;
  } finally {
    // Cleanup: Delete local temp files
    if (videoFile?.path) await unlink(videoFile.path).catch(() => {});
    if (thumbnailFile?.path) await unlink(thumbnailFile.path).catch(() => {});
  }
});

export const getAllVideos = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, query, sortBy, sortOrder, userId } =
      req.query as unknown as VideoQuery;

    const filter: any = { isPublished: true };

    // Use regex for partial matching (better UX for portfolio)
    if (query) {
      const searchRegex = new RegExp(query, "i");
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }
    if (userId) {
      filter.owner = new Types.ObjectId(userId);
    }
    const sortOptions: any = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const aggregate = Video.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [{ $project: { username: 1, name: 1, profileImage: 1 } }],
        },
      },
      { $addFields: { owner: { $first: "$owner" } } },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes",
        },
      },
      {
        $addFields: {
          likesCount: { $size: "$likes" },
        },
      },
      { $sort: sortOptions },

      {
        $project: {
          _id: 1,
          owner: 1,
          title: 1,
          description: 1,
          views: 1,
          duration: 1,
          createdAt: 1,
          isPublished: 1,
          likesCount: 1,
          videoFile: {
            url: "$videoFile.url",
            public_id: "$videoFile.public_id",
          },
          thumbnail: {
            url: "$thumbnail.url",
            public_id: "$thumbnail.public_id",
          },
        },
      },
    ]);

    const results = await Video.aggregatePaginate(aggregate, {
      page,
      limit,
    });

    return res
      .status(200)
      .json(new apiResponse(200, "Videos fetched", results));
  },
);

export const getMyVideos = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { page = 1, limit = 10 } = req.query;

  if (!userId) {
    throw new ApiError(401, "Unauthorized request");
  }

  const aggregate = Video.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        views: 1,
        likesCount: 1,
        isPublished: 1,
        createdAt: 1,
        updatedAt: 1,
        duration: 1,
        videoFile: {
          url: "$videoFile.url",
          public_id: "$videoFile.public_id",
        },
        thumbnail: {
          url: "$thumbnail.url",
          public_id: "$thumbnail.public_id",
        },
      },
    },
  ]);

  const options = {
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
  };

  const videos = await Video.aggregatePaginate(aggregate, options);

  return res
    .status(200)
    .json(new apiResponse(200, "videos fetched successfully", videos));
});

export const getVideoById = asyncHandler(
  async (req: Request, res: Response) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    const userId = req.user?._id;
    const isOwner = userId && video.owner.toString() === userId.toString();

    if (!video.isPublished && !isOwner) {
      throw new ApiError(404, "Video not found");
    }

    // Only increment views if viewer is not the owner
    if (!isOwner) {
      await Video.findByIdAndUpdate(videoId, {
        $inc: { views: 1 },
      });
    }

    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { watchHistory: videoId },
      });
    }

    const aggregatedVideo = await Video.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(videoId as string),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                username: 1,
                name: 1,
                profileImage: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: "$owner",
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "follows",
          localField: "owner._id",
          foreignField: "following",
          as: "followers",
        },
      },
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          owner: {
            $mergeObjects: [
              "$owner",
              {
                followersCount: { $size: "$followers" },
                isFollowed: {
                  $cond: {
                    if: { $in: [userId, "$followers.follower"] },
                    then: true,
                    else: false,
                  },
                },
              },
            ],
          },
          isLiked: {
            $cond: {
              if: { $in: [userId, "$likes.likedBy"] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          owner: 1,
          title: 1,
          description: 1,
          views: 1,
          duration: 1,
          createdAt: 1,
          isPublished: 1,
          likesCount: 1,
          isLiked: 1,
          videoFile: {
            url: "$videoFile.url",
            public_id: "$videoFile.public_id",
          },
          thumbnail: {
            url: "$thumbnail.url",
            public_id: "$thumbnail.public_id",
          },
        },
      },
    ]);

    if (!aggregatedVideo.length) {
      throw new ApiError(404, "Video not found");
    }

    return res
      .status(200)
      .json(
        new apiResponse(200, "Video fetched successfully", aggregatedVideo[0]),
      );
  },
);

export const updateVideoDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const ownerId = req.user?._id;
    const { title, description } = req.body;

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (!video.owner.equals(ownerId)) {
      throw new ApiError(403, "You can only update your own videos");
    }

    await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          title,
          description,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    const updatedVideo = await Video.aggregate([
      {
        $match: {
          _id: video._id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                username: 1,
                name: 1,
                profileImage: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          owner: { $first: "$owner" },
        },
      },
      {
        $project: {
          _id: 1,
          owner: 1,
          title: 1,
          description: 1,
          views: 1,
          duration: 1,
          isPublished: 1,
          createdAt: 1,
          updatedAt: 1,
          videoFile: {
            url: "$videoFile.url",
            public_id: "$videoFile.public_id",
          },
          thumbnail: {
            url: "$thumbnail.url",
            public_id: "$thumbnail.public_id",
          },
        },
      },
    ]);

    if (!updatedVideo.length) {
      throw new ApiError(500, "Failed to update video details");
    }

    return res
      .status(200)
      .json(
        new apiResponse(200, "Video updated successfully", updatedVideo[0]),
      );
  },
);

export const updateVideoThumbnail = asyncHandler(
  async (req: Request, res: Response) => {
    const thumbnailLocalPath = req.file?.path;

    if (!thumbnailLocalPath) {
      throw new ApiError(400, "Thumbnail file is required");
    }

    let thumbnail = null;

    try {
      const { videoId } = req.params;
      const video = await Video.findById(videoId);

      if (!video) {
        throw new ApiError(404, "Video not found");
      }

      if (!video.owner.equals(req.user?._id)) {
        throw new ApiError(403, "You can only update your own videos");
      }

      thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

      // Removed null check as uploadOnCloudinary now throws error on failure

      const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
          $set: {
            thumbnail: {
              url: thumbnail.secure_url,
              public_id: thumbnail.public_id,
            },
          },
        },
        { new: true },
      )
        .populate("owner", "username name profileImage")
        .select("-__v -videoFile.public_id -thumbnail.public_id");

      if (!updatedVideo) {
        throw new ApiError(500, "Failed to update video thumbnail");
      }

      if (video.thumbnail?.public_id) {
        deleteOnCloudinary(video.thumbnail.public_id).catch(() => {});
      }

      return res
        .status(200)
        .json(
          new apiResponse(
            200,
            "Video thumbnail updated successfully",
            updatedVideo,
          ),
        );
    } catch (error) {
      if (thumbnail?.public_id) {
        await deleteOnCloudinary(thumbnail.public_id).catch(() => {});
      }
      throw error;
    } finally {
      if (thumbnailLocalPath) await unlink(thumbnailLocalPath).catch(() => {});
    }
  },
);

export const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (!video.owner.equals(userId)) {
    throw new ApiError(403, "You can only update your own videos");
  }

  video.isPublished = !video.isPublished;
  await video.save({ validateModifiedOnly: true });

  logger.info(
    `Video ${video.isPublished ? "PUBLISHED" : "UNPUBLISHED"} | ID: ${videoId} | Owner: ${userId}`,
  );

  return res.status(200).json(
    new apiResponse(
      200,
      `Video is now ${video.isPublished ? "published" : "unpublished"}`,
      {
        videoId: video._id,
        isPublished: video.isPublished,
      },
    ),
  );
});

export const deleteVideo = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== userId?.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  const videoPid = video.videoFile?.public_id;
  const thumbPid = video.thumbnail?.public_id;

  try {
    await video.deleteOne();

    await Promise.all([
      Like.deleteMany({ video: videoId }),
      Comment.deleteMany({ video: videoId }),
      User.updateMany(
        { watchHistory: videoId as string },
        { $pull: { watchHistory: videoId as any } },
      ),
      Playlist.updateMany({ videos: videoId as string }, { $pull: { videos: videoId as any } }),
    ]).catch((err) => {
      logger.warn(`DB cleanup failed for video ${videoId}`, err);
    });

    if (videoPid) {
      deleteOnCloudinary(videoPid).catch((err) =>
        logger.warn(`Cloudinary delete failed for ${videoPid}`, err),
      );
    }

    if (thumbPid) {
      deleteOnCloudinary(thumbPid).catch((err) =>
        logger.warn(`Cloudinary delete failed for ${thumbPid}`, err),
      );
    }
    logger.info(
      `Video deleted successfully | VideoID: ${videoId} | Owner: ${userId}`,
    );
    return res
      .status(200)
      .json(
        new apiResponse(200, "Video deleted successfully", {
          deletedVideoId: videoId,
        }),
      );
  } catch (error) {
    logger.error(`deleteVideo critical failure | VideoID: ${videoId}`, error);
    throw new ApiError(500, "Failed to delete video");
  }
});
