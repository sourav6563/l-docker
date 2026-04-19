/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model, Types, Model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface IPlaylist {
  owner: Types.ObjectId;
  videos: Types.ObjectId[];
  name: string;
  description: string;
  isPublished: boolean;
}

const playlistSchema = new Schema<IPlaylist>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
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
playlistSchema.plugin(mongooseAggregatePaginate);

interface PlaylistModel extends Model<IPlaylist> {
  aggregatePaginate: any;
}

export const Playlist = model<IPlaylist, PlaylistModel>("Playlist", playlistSchema);
