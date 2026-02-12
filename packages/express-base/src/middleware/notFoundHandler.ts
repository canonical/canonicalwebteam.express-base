import type { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors/clientErrors.js";

/**
 * Express doesn't generate error pages for unmatched routes by default.
 * It just sends a plain Cannot GET /path text response with a 404 status.
 * The notFoundHandler catches those unmatched routes and turns them into a NotFoundError.
 * Then it flows through the errorHandler middleware so the same styled error page is used like every other error.
 */
export function notFoundHandler() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    next(
      new NotFoundError(`Cannot ${req.method} ${req.originalUrl || req.url}`),
    );
  };
}
