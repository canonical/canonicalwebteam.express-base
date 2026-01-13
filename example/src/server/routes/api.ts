import { add } from "@canonical/express-base";
import { sub } from "@canonical/express-middlewares";
import { mul } from "@canonical/yaml-responses";
import { Router } from "express";

import type { ApiTestResponse } from "shared";

const router = Router();

router.get("test", (_, res) => {
  const result = add(sub(mul(25, 2), 10), 2);
  // example response from an API
  const data: ApiTestResponse = { message: `The API returned ${result}`}
  res.json(data);
});

/** 

// Example on how to use another service to retrieve responses:

const apiHost = process.env.FLASK_BACKEND_HOST || "localhost";
const apiPort = process.env.FLASK_BACKEND_PORT || 5010;

router.all("*all", async (req, res) => {
  const redirectUrl = `http://${apiHost}:${apiPort.toString()}${req.originalUrl}`;
  console.log(`Forwarding request to Flask BE: ${redirectUrl}`);
  try {
    const response = await fetch(redirectUrl);
    const data = await response.json();
    res.json(data);
  } catch (e) {
    if (e instanceof Error) {
      console.log(e);
      res.status(500).end(e.message);
    }
  }
});

*/

export default router;
