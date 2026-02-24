import {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  ServiceUnavailableError,
  UnauthorizedError,
} from "@canonical/express-base";
import { Router } from "express";

import { type ApiResponse, DELAY_API_CALL, delay } from "../../shared";

const router = Router();

router.get("/test", async (_, res) => {
  // example response from an API
  const data: ApiResponse = { message: `API says 'Hi'` };
  await delay(DELAY_API_CALL, data);
  res.json(data);
});

router.get("/error/bad-request", () => {
  throw new BadRequestError("Missing required field: email", {
    field: "email",
    code: "MISSING_FIELD",
  });
});

router.get("/error/unauthorized", () => {
  throw new UnauthorizedError("Invalid or expired token");
});

router.get("/error/forbidden", () => {
  throw new ForbiddenError(
    "You do not have permission to access this resource",
  );
});

router.get("/error/not-found", () => {
  throw new NotFoundError("The requested user was not found");
});

router.get("/error/internal", () => {
  throw new InternalServerError("Database connection failed");
});

router.get("/error/unavailable", () => {
  throw new ServiceUnavailableError("Service is under maintenance");
});

router.get("/error/generic", () => {
  throw new Error("Something unexpected happened");
});

router.get("/error/async", async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  throw new NotFoundError("Async route: resource not found after lookup");
});

export default router;
