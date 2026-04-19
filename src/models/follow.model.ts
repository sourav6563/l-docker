/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model, Types, Model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface IFollow {
  follower: Types.ObjectId; // who follows
  following: Types.ObjectId; // whom they follow
}

const followSchema = new Schema<IFollow>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
followSchema.plugin(mongooseAggregatePaginate);

interface followModel extends Model<IFollow> {
  aggregatePaginate: any;
}

followSchema.index({ follower: 1, following: 1 }, { unique: true });

export const Follow = model<IFollow, followModel>("Follow", followSchema);
