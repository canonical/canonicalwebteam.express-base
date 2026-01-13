import express from "express";
import { IS_PRODUCTION, PORT } from "./constants";
import { setupDev } from "./dev-server";
import { setupProd } from "./prod-server";

// Create http server
const app = express();

if (IS_PRODUCTION) {
  await setupProd(app)
} else {
  await setupDev(app)
}

// Start http server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
