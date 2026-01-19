import fs from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import type { RenderResult } from "@canonical/react-ssr/renderer";
import type { Application } from "express";
import type { WindowInitialData } from "shared/types/windowData";
import { createServer, type ViteDevServer } from "vite";
import fetchInitialData from "./data/initialData";
import apiRoute from "./routes/api";

async function setUpDevServer(app: Application): Promise<ViteDevServer> {
  const vite = await createServer({
    publicDir: "public",
    logLevel: "info",
    server: {
      middlewareMode: true,
    },
    appType: "custom",
    root: process.cwd(),
  });

  app.use(vite.middlewares);
  return vite;
}

export async function setupDev(app: Application) {
  const vite = await setUpDevServer(app);

  app.use("/api", apiRoute);
  app.use("*all", async (req, res) => {
    try {
      const url = req.originalUrl;
      let template = await fs.readFile(
        path.join(process.cwd(), "index.html"),
        "utf-8",
      );

      template = await vite.transformIndexHtml(url, template);
      const render: (
        windowData: WindowInitialData,
        htmlTemplate: string,
        req: IncomingMessage,
        res: ServerResponse,
      ) => RenderResult = (await vite.ssrLoadModule("src/server/renderer.tsx"))
        .default;
      const initialData = await fetchInitialData();

      res.status(200).set({ "Content-Type": "text/html" });
      return render(initialData, template, req, res);
    } catch (e) {
      if (e instanceof Error) {
        vite?.ssrFixStacktrace(e);
        console.log(e.stack);
        res.status(500).end(e.stack);
      }
    }
  });
}
