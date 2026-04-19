import { Request, Response } from "express";
import { CommunityPost } from "../models/communityPost.model";
import { ApiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";
import { Like } from "../models/like.model";
import { Comment } from "../models/comment.model";
import { logger } from "../utils/logger";

// 1. Create Post

export const createCommunityPost = asyncHandler(async (req: Request, res: Response) => {
  const { content } = req.body;
  const userId = req.user?._id;

  const post = await CommunityPost.create({
    content,
    owner: userId,
  });

  await post.populate("owner", "username name profileImage");

  if (!post) throw new ApiError(500, "Failed to create post");

  return res.status(201).json(new apiResponse(201, "Community post created successfully", post));
});

export const getUserCommunityPosts = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const postsAggregate = CommunityPost.aggregate([
    {
      $match: {
        owner: user._id,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{ $project: { username: 1, profileImage: 1, name: 1 } }],
      },
    },
    { $addFields: { owner: { $first: "$owner" } } },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "communityPost",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    { $project: { likes: 0 } },
  ]);

  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    sort: { createdAt: -1 },
  };

  const posts = await CommunityPost.aggregatePaginate(postsAggregate, options);

  return res.status(200).json(new apiResponse(200, "Community posts fetched successfully", posts));
});

export const updateCommunityPost = asyncHandler(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;

  const post = await CommunityPost.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  if (!post.owner.equals(userId)) {
    throw new ApiError(403, "You can only edit your own posts");
  }

  const updatedPost = await CommunityPost.findByIdAndUpdate(
    postId,
    { $set: { content } },
    { new: true },
  );

  return res.status(200).json(new apiResponse(200, "Post updated successfully", updatedPost));
});

export const deleteCommunityPost = asyncHandler(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const userid = req.user?._id;

  const post = await CommunityPost.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  if (!post.owner.equals(userid)) {
    throw new ApiError(403, "You can only delete your own posts");
  }

  await CommunityPost.findByIdAndDelete(postId);

  await Promise.all([
    Like.deleteMany({ communityPost: postId }),
    Comment.deleteMany({ communityPost: postId }),
  ]).catch((err) => logger.error(`Cleanup failed for post ${postId}`, err));

  return res.status(200).json(new apiResponse(200, "Post deleted successfully"));
});

// Get ALL community posts (global feed)
export const getAllCommunityPosts = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;

  const postsAggregate = CommunityPost.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{ $project: { username: 1, profileImage: 1, name: 1 } }],
      },
    },
    { $addFields: { owner: { $first: "$owner" } } },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "communityPost",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    { $project: { likes: 0 } },
    { $sort: { createdAt: -1 } },
  ]);

  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  };

  const posts = await CommunityPost.aggregatePaginate(postsAggregate, options);

  return res.status(200).json(new apiResponse(200, "Community feed fetched successfully", posts));
});
