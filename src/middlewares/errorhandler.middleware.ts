/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ApiError } from "../utils/apiError";

import { env } from "../env";

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error instanceof mongoose.Error ? 400 : 500);

    const message = error.message || "Something went wrong";

    // 👇 pass the whole error, not error.errors
    error = new ApiError(statusCode, message, error);
    error.stack = err.stack;
  }

  const response: any = {
    success: false,
    message: error.message,
  };

  if (error.errors) {
    response.errors = error.errors;
  }

  if (env.NODE_ENV === "development") {
    response.stack = error.stack;
  }

  res.status(error.statusCode).json(response);
};

export { errorHandler };
