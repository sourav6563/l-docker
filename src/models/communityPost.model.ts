/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model, Types, Model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface ICommunityPost {
  owner: Types.ObjectId;
  content: string;
}

const communityPostSchema = new Schema<ICommunityPost>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
  },
  { timestamps: true },
);

communityPostSchema.plugin(mongooseAggregatePaginate);

interface communityPostModel extends Model<ICommunityPost> {
  aggregatePaginate: any;
}

export const CommunityPost = model<ICommunityPost, communityPostModel>(
  "CommunityPost",
  communityPostSchema,
);
