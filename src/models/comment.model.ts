/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model, Types, Model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface IComment {
  video: Types.ObjectId;
  owner: Types.ObjectId;
  communityPost: Types.ObjectId;
  content: string;
}

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      index: true,
    },
    communityPost: {
      type: Schema.Types.ObjectId,
      ref: "CommunityPost",
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

commentSchema.plugin(mongooseAggregatePaginate);
interface CommentModel extends Model<IComment> {
  aggregatePaginate: any;
}

export const Comment = model<IComment, CommentModel>("Comment", commentSchema);
