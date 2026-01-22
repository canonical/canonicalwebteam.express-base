import type { NextFunction, Request, Response } from "express";
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

// An error handling middleware
app.use((_err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500);
  res.send("Oops, something went wrong.");
});

// Start http server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
