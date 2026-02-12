import { HttpError } from "./httpError.js";

export class InternalServerError extends HttpError {
  constructor(message = "Internal Server Error", details?: unknown) {
    super(500, message, details);
    this.name = "InternalServerError";
  }
}

export class ServiceUnavailableError extends HttpError {
  constructor(message = "Service Unavailable", details?: unknown) {
    super(503, message, details);
    this.name = "ServiceUnavailableError";
  }
}
