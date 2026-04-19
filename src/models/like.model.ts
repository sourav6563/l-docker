import { Schema, model, Types } from "mongoose";

interface ILike {
  video?: Types.ObjectId;
  comment?: Types.ObjectId;
  communityPost?: Types.ObjectId;
  likedBy: Types.ObjectId;
}

const likeSchema = new Schema<ILike>(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    communityPost: {
      type: Schema.Types.ObjectId,
      ref: "CommunityPost",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

likeSchema.index({ likedBy: 1, video: 1, comment: 1, communityPost: 1 }, { unique: true });

export const Like = model<ILike>("Like", likeSchema);
