import { describe, expect, it } from "vitest";
import { HttpError } from "./httpError.js";

describe("HttpError", () => {
  it("should create error with status code and message", () => {
    const error = new HttpError(404, "Not found");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Not found");
    expect(error.name).toBe("HttpError");
  });

  it("should include optional details", () => {
    const details = { userId: 123, reason: "invalid" };
    const error = new HttpError(400, "Bad request", details);

    expect(error.details).toEqual(details);
  });

  it("should have undefined details when not provided", () => {
    const error = new HttpError(500, "Error");

    expect(error.details).toBeUndefined();
  });

  it("should identify client errors", () => {
    expect(new HttpError(400, "").isClientError()).toBe(true);
    expect(new HttpError(404, "").isClientError()).toBe(true);
    expect(new HttpError(499, "").isClientError()).toBe(true);
    expect(new HttpError(500, "").isClientError()).toBe(false);
    expect(new HttpError(399, "").isClientError()).toBe(false);
  });

  it("should identify server errors", () => {
    expect(new HttpError(500, "").isServerError()).toBe(true);
    expect(new HttpError(503, "").isServerError()).toBe(true);
    expect(new HttpError(599, "").isServerError()).toBe(true);
    expect(new HttpError(400, "").isServerError()).toBe(false);
    expect(new HttpError(600, "").isServerError()).toBe(false);
  });

  it("should have a stack trace", () => {
    const error = new HttpError(500, "Error");

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("HttpError");
  });
});
