import { Request, Response } from "express";
import { connection, STATES } from "mongoose";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { logger } from "../utils/logger";

export const healthCheck = asyncHandler(async (_req: Request, res: Response) => {
  const dbStatus = connection.readyState;

  const dbState = STATES[dbStatus] || "unknown";
  const isHealthy = dbStatus === 1;

  const healthData = {
    status: isHealthy ? "OK" : "ERROR",
    timestamp: new Date().toISOString(),
    services: {
      database: dbState,
    },
    system: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    },
  };

  if (!isHealthy) {
    logger.error(`Health check failed: DB state is ${dbState}`);
    return res.status(503).json(new apiResponse(503, "Health check failed", healthData));
  }

  return res.status(200).json(new apiResponse(200, "Health check passed", healthData));
});
