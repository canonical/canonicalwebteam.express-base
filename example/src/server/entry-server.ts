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

// Start http server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
