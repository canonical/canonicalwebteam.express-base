import { errorHandler, notFoundHandler } from "@canonical/express-base";
import express from "express";
import { IS_PRODUCTION, PORT } from "./constants";

// Create http server
const app = express();

if (IS_PRODUCTION) {
  const setupProd = (await import("./prod-server")).setupProd;
  setupProd(app);
} else {
  const setupDev = (await import("./dev-server")).setupDev;
  await setupDev(app);
}

// 404 handler for unmatched routes
app.use(notFoundHandler());

// Error handling middleware (must be last)
// Express error handlers have the 4- rgument signature (err, req, res, next).
// It only routes to them when a previous middleware or route calls next(error) or throws.
// If its placed before routes, there are no errors to catch yet because the routes haven't run.
// It needs to sit after everything so it can catch errors from all the routes and middleware above it.
app.use(
  errorHandler({
    isDev: !IS_PRODUCTION,
    onError: (error, req, _res, statusCode) => {
      console.error(
        `[${new Date().toISOString()}] ${statusCode} ${req.method} ${req.url}`,
        error,
      );
    },
  }),
);

// Start http server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
