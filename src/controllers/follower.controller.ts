import { Request, Response } from "express";
import { Types } from "mongoose";
import { Follow } from "../models/follow.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const toggleFollow = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params; // The user to be followed/unfollowed
    const currentUserId = req.user?._id;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (currentUserId?.equals(new Types.ObjectId(userId as string))) {
      throw new ApiError(400, "You cannot follow yourself");
    }

    const deletedFollow = await Follow.findOneAndDelete({
      follower: currentUserId,
      following: userId,
    });

    if (deletedFollow) {
      return res
        .status(200)
        .json(
          new apiResponse(200, "Unfollowed successfully", {
            isFollowed: false,
          }),
        );
    }

    try {
      await Follow.create({
        follower: currentUserId,
        following: userId as string,
      });
      return res
        .status(200)
        .json(
          new apiResponse(200, "Followed successfully", { isFollowed: true }),
        );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // If concurrent requests cause a duplicate key error, it means we are already following.
      // We can consider this a successful "follow" action or a race condition where we should basically ignore.
      if (error.code === 11000) {
        return res
          .status(200)
          .json(
            new apiResponse(200, "Followed successfully", { isFollowed: true }),
          );
      }
      throw error;
    }
  },
);

export const getUserFollowers = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const aggregate = Follow.aggregate([
      {
        $match: {
          following: user._id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "follower",
          foreignField: "_id",
          as: "followerDetails",
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
      { $unwind: "$followerDetails" },
      {
        $project: {
          _id: 1,
          username: "$followerDetails.username",
          name: "$followerDetails.name",
          profileImage: "$followerDetails.profileImage",
          userId: "$followerDetails._id",
          createdAt: 1,
        },
      },
    ]);

    const options = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sort: { [sortBy as string]: sortOrder === "desc" ? -1 : 1 },
    };

    const followers = await Follow.aggregatePaginate(aggregate, options);

    return res
      .status(200)
      .json(new apiResponse(200, "Followers fetched successfully", followers));
  },
);

export const getUserFollowing = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const aggregate = Follow.aggregate([
      {
        $match: {
          follower: user._id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "following",
          foreignField: "_id",
          as: "followingDetails",
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
        $unwind: "$followingDetails",
      },
      {
        $project: {
          _id: 1,
          username: "$followingDetails.username",
          name: "$followingDetails.name",
          profileImage: "$followingDetails.profileImage",
          userId: "$followingDetails._id",
          createdAt: 1,
        },
      },
    ]);

    const options = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sort: { [sortBy as string]: sortOrder === "desc" ? -1 : 1 },
    };

    const following = await Follow.aggregatePaginate(aggregate, options);

    return res
      .status(200)
      .json(
        new apiResponse(200, "Following list fetched successfully", following),
      );
  },
);
