import { Request, Response } from "express";
import { Comment } from "../models/comment.model";
import { Video } from "../models/video.model"; // Import Video model
import { ApiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { CommunityPost } from "../models/communityPost.model";
import { Like } from "../models/like.model";

export const getVideoComments = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user?._id;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const pipeline = [
    {
      $match: {
        video: video._id,
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
    { $unwind: "$owner" },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
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
        likes: 0,
      },
    },
  ];

  // 3. Pagination
  const options = {
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
    sort: { createdAt: -1 },
  };

  const comments = await Comment.aggregatePaginate(Comment.aggregate(pipeline), options);

  return res
    .status(200)
    .json(new apiResponse(200, "Video comments fetched successfully", comments));
});

export const addVideoComment = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  const comment = await Comment.create({
    content,
    video: videoId as string,
    owner: userId,
  });

  await comment.populate("owner", "username name profileImage");

  if (!comment) {
    throw new ApiError(500, "Failed to add comment please try again");
  }

  return res.status(201).json(new apiResponse(201, "Comment added successfully", comment));
});

export const getPostComments = asyncHandler(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const UserId = req.user?._id;

  const post = await CommunityPost.findById(postId);

  if (!post) {
    throw new ApiError(404, "Community post not found");
  }

  const pipeline = [
    {
      $match: {
        communityPost: post._id,
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
    { $unwind: "$owner" },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        isLiked: {
          $cond: {
            if: { $in: [UserId, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        likes: 0,
      },
    },
  ];

  const options = {
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
  };

  const comments = await Comment.aggregatePaginate(Comment.aggregate(pipeline), options);

  return res.status(200).json(new apiResponse(200, "Post comments fetched successfully", comments));
});

export const addPostComment = asyncHandler(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;

  const post = await CommunityPost.findById(postId);
  if (!post) {
    throw new ApiError(404, "Community post not found");
  }
  const comment = await Comment.create({
    content,
    communityPost: postId as string,
    owner: userId,
  });

  await comment.populate("owner", "username name profileImage");

  if (!comment) {
    throw new ApiError(500, "Failed to add comment please try again");
  }

  return res.status(201).json(new apiResponse(201, "Comment added successfully", comment));
});

export const updateComment = asyncHandler(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const { content } = req.body;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (!comment.owner.equals(req.user?._id)) {
    throw new ApiError(403, "You are not authorized to edit this comment");
  }

  comment.content = content;
  await comment.save({ validateBeforeSave: false });

  return res.status(200).json(new apiResponse(200, "Comment updated successfully", comment));
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const userId = req.user?._id;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (!comment.owner.equals(userId)) {
    throw new ApiError(403, "You are not Authorized to delete this comment");
  }

  await Promise.all([
    Comment.findByIdAndDelete(commentId),
    Like.deleteMany({ comment: commentId }),
  ]);

  return res.status(200).json(new apiResponse(200, "Comment deleted successfully"));
});
