import { MyNumber } from "@canonical/express-middlewares";

export const add = (a: number | MyNumber, b: number | MyNumber): number => {
  if (a instanceof MyNumber) {
    a = a.x;
  }
  if (b instanceof MyNumber) {
    b = b.x;
  }
  return a + b;
};

export {
  BadRequestError,
  ForbiddenError,
  HttpError,
  InternalServerError,
  NotFoundError,
  ServiceUnavailableError,
  UnauthorizedError,
} from "./errors/index.js";

export { errorHandler, notFoundHandler } from "./middleware/index.js";

export type {
  ErrorHandlerOptions,
  ErrorPageContext,
  ErrorResponse,
} from "./middleware/types.js";

export { DevErrorPage, formatJson, ProdErrorPage } from "./templates/index.js";
