import { Video } from "../models/video.model";
import { ApiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";

import { Follow } from "../models/follow.model";
import { Like } from "../models/like.model";

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized request");
  }

  const [videoStats, followerStats, likeStats] = await Promise.all([
    Video.aggregate([
      {
        $match: {
          owner: userId, // Filter: My Videos
        },
      },
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 }, // Count of videos
          totalViews: { $sum: "$views" }, // Sum of views
        },
      },
    ]),
    Follow.aggregate([
      {
        $match: {
          following: userId,
        },
      },
      {
        $count: "followersCount",
      },
    ]),
    Like.aggregate([
      {
        $match: {
          video: { $exists: true }, // Only consider video likes
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "videoDetails",
        },
      },
      {
        $unwind: "$videoDetails",
      },
      {
        $match: {
          "videoDetails.owner": userId, // Filter: My Content
        },
      },
      {
        $count: "totalLikes",
      },
    ]),
  ]);

  const stats = {
    totalVideos: videoStats[0]?.totalVideos || 0,
    totalViews: videoStats[0]?.totalViews || 0,
    totalFollowers: followerStats[0]?.followersCount || 0,
    totalLikes: likeStats[0]?.totalLikes || 0,
  };

  return res.status(200).json(new apiResponse(200, "Dashboard stats fetched successfully", stats));
});


