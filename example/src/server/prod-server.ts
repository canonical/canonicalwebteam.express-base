import path from "node:path";
import compression from "compression";
import type { Application, NextFunction, Request, Response } from "express";
import sirv from "sirv";
import { BASE, TEMPLATE_HTML } from "./constants";
import fetchInitialData from "./data/initialData";
import getRenderer from "./renderer";
import apiRoute from "./routes/api";

export function setupProd(app: Application) {
  app.use(compression());
  app.use(
    BASE,
    sirv(path.join(process.cwd(), "dist", "client"), { extensions: [] }),
  );

  app.use("/api", apiRoute);
  app.use("*all", [serveStream], async (req: Request, res: Response) => {
    const initialData = await fetchInitialData();
    getRenderer(initialData, TEMPLATE_HTML)(req, res);
  });
}

function serveStream(_: Request, res: Response, next: NextFunction) {
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Transfer-Encoding", "chunked");
  next();
}
