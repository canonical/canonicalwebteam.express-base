import path from "node:path";
import type { Application, NextFunction, Request, Response } from "express";
import { BASE } from "./constants";
import fetchInitialData from "./data/initialData";
import getRenderer from "./renderer";
import apiRoute from "./routes/api";

export async function setupProd(app: Application) {
  const compression = (await import("compression")).default;
  const sirv = (await import("sirv")).default;
  app.use(compression());
  app.use(
    BASE,
    sirv(path.join(process.cwd(), "dist", "client"), { extensions: [] }),
  );

  app.use("/api", apiRoute);
  app.use("*all", [serveStream], async (req: Request, res: Response) => {
    const initialData = await fetchInitialData();
    getRenderer(initialData)(req, res);
  });
}

function serveStream(_: Request, res: Response, next: NextFunction) {
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Transfer-Encoding", "chunked");
  next();
}
