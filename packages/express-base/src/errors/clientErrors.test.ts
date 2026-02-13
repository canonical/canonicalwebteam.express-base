import { describe, expect, it } from "vitest";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "./clientErrors.js";
import { HttpError } from "./httpError.js";

describe("BadRequestError", () => {
  it("should create 400 error with default message", () => {
    const error = new BadRequestError();

    expect(error).toBeInstanceOf(HttpError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Bad Request");
    expect(error.name).toBe("BadRequestError");
  });

  it("should accept custom message and details", () => {
    const error = new BadRequestError("Invalid input", { field: "email" });

    expect(error.message).toBe("Invalid input");
    expect(error.details).toEqual({ field: "email" });
  });
});

describe("UnauthorizedError", () => {
  it("should create 401 error with default message", () => {
    const error = new UnauthorizedError();

    expect(error).toBeInstanceOf(HttpError);
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe("Unauthorized");
    expect(error.name).toBe("UnauthorizedError");
  });

  it("should accept custom message", () => {
    const error = new UnauthorizedError("Token expired");
    expect(error.message).toBe("Token expired");
  });
});

describe("ForbiddenError", () => {
  it("should create 403 error with default message", () => {
    const error = new ForbiddenError();

    expect(error).toBeInstanceOf(HttpError);
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe("Forbidden");
    expect(error.name).toBe("ForbiddenError");
  });

  it("should accept custom message", () => {
    const error = new ForbiddenError("Insufficient permissions");
    expect(error.message).toBe("Insufficient permissions");
  });
});

describe("NotFoundError", () => {
  it("should create 404 error with default message", () => {
    const error = new NotFoundError();

    expect(error).toBeInstanceOf(HttpError);
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Not Found");
    expect(error.name).toBe("NotFoundError");
  });

  it("should accept custom message", () => {
    const error = new NotFoundError("User not found");
    expect(error.message).toBe("User not found");
  });
});

describe("all client errors", () => {
  it("should identify as client errors, not server errors", () => {
    const errors = [
      new BadRequestError(),
      new UnauthorizedError(),
      new ForbiddenError(),
      new NotFoundError(),
    ];

    for (const error of errors) {
      expect(error.isClientError()).toBe(true);
      expect(error.isServerError()).toBe(false);
    }
  });
});
