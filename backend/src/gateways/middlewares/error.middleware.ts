import { NextFunction, Request, Response } from "express";
import { ApiError } from "@exeptions/api.error.js";
import { logger } from "@config/config.logger.js";

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ApiError) {
    res.status(error.status).json({ message: error.message });
    return;
  }

  logger.error({ err: error }, "Unhandled error");
  res.status(500).json({ message: "Internal server error" });
}
