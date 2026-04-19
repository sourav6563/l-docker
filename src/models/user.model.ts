/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model, Types, Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../env";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  name: string;
  bio?: string;
  profileImage?: string;
  password: string;
  watchHistory?: Types.ObjectId[];
  refreshToken?: string;
  isVerified?: boolean;
  emailVerificationCode?: string;
  emailVerificationExpires?: Date;
  passwordResetCode?: string;
  passwordResetExpires?: Date;
}

export interface IUserMethods {
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  isEmailVerificationCodeCorrect(code: string): Promise<boolean>;
  isPasswordResetCodeCorrect(code: string): Promise<boolean>;
}

// Create a type that combines User interface with UserMethods
export interface UserModel extends Model<IUser, object, IUserMethods> {
  aggregatePaginate: any;
}

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    profileImage: String,
    password: {
      type: String,
      required: true,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    refreshToken: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date,
    },
    passwordResetCode: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.isModified("emailVerificationCode") && this.emailVerificationCode) {
    this.emailVerificationCode = await bcrypt.hash(this.emailVerificationCode, 10);
  }
  if (this.isModified("passwordResetCode") && this.passwordResetCode) {
    this.passwordResetCode = await bcrypt.hash(this.passwordResetCode, 10);
  }
});

userSchema.methods.isPasswordCorrect = function (password: string) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.isEmailVerificationCodeCorrect = function (code: string) {
  return bcrypt.compare(code, this.emailVerificationCode || "");
};

userSchema.methods.isPasswordResetCodeCorrect = function (code: string) {
  return bcrypt.compare(code, this.passwordResetCode || "");
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRY as SignOptions["expiresIn"],
    },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as SignOptions["expiresIn"],
  });
};
userSchema.plugin(mongooseAggregatePaginate as any);

export const User = model<IUser, UserModel>("User", userSchema);
