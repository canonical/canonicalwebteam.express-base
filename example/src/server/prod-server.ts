import path from "node:path";
import { nonceContentSecurityPolicy } from "@canonical/express-middlewares";
import compression from "compression";
import type { Application, NextFunction, Request, Response } from "express";
import type { WindowInitialData } from "shared/types/windowData";
import sirv from "sirv";
import { BASE, TEMPLATE_HTML } from "./constants";
import fetchInitialData from "./data/initialData";
import render from "./renderer";
import apiRoute from "./routes/api";
import errorsRoute from "./routes/errors";

export function setupProd(app: Application) {
  app.use(compression());

  app.use(
    BASE,
    sirv(path.join(process.cwd(), "dist", "client"), { extensions: [] }),
  );

  app.use(nonceContentSecurityPolicy({}));

  app.use("/api", apiRoute);
  app.use("/errors", errorsRoute);

  app.use(
    ["/", "/suspense"],
    [serveStream],
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
            // preRenderCallback: preRenderCb,
            renderToPipeableStreamOptions: {
              bootstrapScripts: [],
              bootstrapModules: [],
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
