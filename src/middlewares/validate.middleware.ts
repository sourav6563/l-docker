import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { ApiError } from "../utils/apiError";

export enum ValidationSource {
  BODY = "body",
  QUERY = "query",
  PARAM = "params",
  HEADER = "headers",
}

export const validate = (schema: ZodSchema, source: ValidationSource = ValidationSource.BODY) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[source]);
      Object.assign(req[source], data);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.issues.map((e) => e.message).join(", ");
        return next(new ApiError(400, message));
      }
      next(err);
    }
  };
};
