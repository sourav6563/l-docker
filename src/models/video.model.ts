/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model, Types, Model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface IVideo {
  owner: Types.ObjectId;
  videoFile: {
    url: string;
    public_id: string;
  };
  thumbnail: {
    url: string;
    public_id: string;
  };
  title: string;
  description?: string;
  duration: number;
  views: number;
  isPublished: boolean;
}

const videoSchema = new Schema<IVideo>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videoFile: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    thumbnail: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "duration is required"],
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

videoSchema.plugin(mongooseAggregatePaginate);

interface VideoModel extends Model<IVideo> {
  aggregatePaginate: any;
}

export const Video = model<IVideo, VideoModel>("Video", videoSchema);
