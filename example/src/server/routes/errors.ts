import {
  BadRequestError,
  errorHandler,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  ServiceUnavailableError,
  UnauthorizedError,
} from "@canonical/express-base";
import { StringRenderer } from "@canonical/pragma-tmp-patch";
import { Router } from "express";
import { CustomErrorPage } from "../components/CustomErrorPage";
import { ErrorDemoPage } from "../components/ErrorDemoPage";

const router = Router();

// Demo navigation page rendered via StringRenderer
router.get("/", (req, res, next) => {
  const result = new StringRenderer(ErrorDemoPage, null).render(req, res);
  if (result instanceof Error) {
    next(result);
  }
});

const prodRouter = Router();

prodRouter.get("/bad-request", () => {
  throw new BadRequestError("Missing required field: email", {
    field: "email",
    code: "MISSING_FIELD",
  });
});

prodRouter.get("/not-found", () => {
  throw new NotFoundError("The requested user was not found");
});

prodRouter.get("/internal", () => {
  throw new InternalServerError("Database connection failed");
});

prodRouter.get("/unavailable", () => {
  throw new ServiceUnavailableError("Service is under maintenance");
});

prodRouter.use(
  errorHandler({
    isDev: false,
    onError: (error, req, _res, statusCode) => {
      console.error(
        `[Prod] [${new Date().toISOString()}] ${statusCode} ${req.method} ${req.url}`,
        error,
      );
    },
  }),
);

router.use("/prod", prodRouter);

const customRouter = Router();

customRouter.get("/not-found", () => {
  throw new NotFoundError("The requested page was not found");
});

customRouter.get("/internal", () => {
  throw new InternalServerError("Database connection failed");
});

customRouter.get("/bad-request", () => {
  throw new BadRequestError("Invalid input data", {
    field: "username",
    code: "INVALID_FORMAT",
  });
});

customRouter.get("/unauthorized", () => {
  throw new UnauthorizedError("Session expired");
});

customRouter.get("/forbidden", () => {
  throw new ForbiddenError("Admin access required");
});

customRouter.get("/unavailable", () => {
  throw new ServiceUnavailableError("Scheduled maintenance in progress");
});

// isDev: false so the errorComponent is used (dev mode always shows the debug page)
customRouter.use(
  errorHandler({
    isDev: false,
    errorComponent: CustomErrorPage,
    onError: (error, req, _res, statusCode) => {
      console.error(
        `[Custom] [${new Date().toISOString()}] ${statusCode} ${req.method} ${req.url}`,
        error,
      );
    },
  }),
);

router.use("/custom", customRouter);

export default router;
