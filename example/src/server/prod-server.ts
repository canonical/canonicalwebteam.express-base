import path from "node:path";
import {
  hashContentSecurityPolicy,
  nonceContentSecurityPolicy,
} from "@canonical/express-middlewares";
import compression from "compression";
import type { Application, NextFunction, Request, Response } from "express";
import type { WindowInitialData } from "shared/types/windowData";
import sirv from "sirv";
import App from "../client/components/app/App";
import { BASE, PORT, TEMPLATE_HTML } from "./constants";
import fetchInitialData from "./data/initialData";
import render, { renderWithRoot } from "./renderer";
import apiRoute from "./routes/api";
import errorsRoute from "./routes/errors";

export function setupProd(app: Application) {
  app.use(compression());

  app.use(
    BASE,
    sirv(path.join(process.cwd(), "dist", "client"), { extensions: [] }),
  );

  app.use("/api", apiRoute);
  app.use("/errors", errorsRoute);

  // app.use(hashContentSecurityPolicy({}, true, PORT)) to affect the whole site
  // these here are just examples
  app.use(
    ["/hashes"],
    [...hashContentSecurityPolicy({}, true, PORT)],
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const initialData: WindowInitialData = await fetchInitialData();
        renderWithRoot(
          App,
          initialData,
          {
            htmlString: TEMPLATE_HTML,
            renderToPipeableStreamOptions: {
              bootstrapScripts: [],
              bootstrapModules: [],
            },
          },
          req,
          res,
        );
      } catch (e) {
        console.log((e as Error)?.stack);
        next(e);
      }
    },
  );

  app.use(
    ["/", "/suspense"],
    [...nonceContentSecurityPolicy({}), serveStream],
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const url = req.originalUrl;
        let initialData: WindowInitialData = { hasSuspense: true };
        if (!url.match(/suspense$/)) {
          initialData = await fetchInitialData();
        }
        render(
          initialData,
          {
            htmlString: TEMPLATE_HTML,
            renderToPipeableStreamOptions: {
              bootstrapScripts: [],
              bootstrapModules: [],
              onShellError: (error) => next(error),
              nonce: res.locals?.nonce,
            },
          },
          req,
          res,
        );
      } catch (e) {
        console.log((e as Error)?.stack);
        next(e);
      }
    },
  );
}

function serveStream(_: Request, res: Response, next: NextFunction) {
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Transfer-Encoding", "chunked");
  next();
}
