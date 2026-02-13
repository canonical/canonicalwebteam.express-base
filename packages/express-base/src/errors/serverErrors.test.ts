import { describe, expect, it } from "vitest";
import { HttpError } from "./httpError.js";
import {
  InternalServerError,
  ServiceUnavailableError,
} from "./serverErrors.js";

describe("InternalServerError", () => {
  it("should create 500 error with default message", () => {
    const error = new InternalServerError();

    expect(error).toBeInstanceOf(HttpError);
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe("Internal Server Error");
    expect(error.name).toBe("InternalServerError");
  });

  it("should accept custom message and details", () => {
    const error = new InternalServerError("Database failed", {
      db: "postgres",
    });

    expect(error.message).toBe("Database failed");
    expect(error.details).toEqual({ db: "postgres" });
  });
});

describe("ServiceUnavailableError", () => {
  it("should create 503 error with default message", () => {
    const error = new ServiceUnavailableError();

    expect(error).toBeInstanceOf(HttpError);
    expect(error.statusCode).toBe(503);
    expect(error.message).toBe("Service Unavailable");
    expect(error.name).toBe("ServiceUnavailableError");
  });

  it("should accept custom message", () => {
    const error = new ServiceUnavailableError("Maintenance mode");
    expect(error.message).toBe("Maintenance mode");
  });
});

describe("all server errors", () => {
  it("should identify as server errors, not client errors", () => {
    const errors = [new InternalServerError(), new ServiceUnavailableError()];

    for (const error of errors) {
      expect(error.isServerError()).toBe(true);
      expect(error.isClientError()).toBe(false);
    }
  });
});
