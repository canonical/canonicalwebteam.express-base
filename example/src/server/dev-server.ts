import fs from "node:fs/promises";
import path from "node:path";
import type { RenderHandler } from "@canonical/react-ssr/renderer";

import type { Application } from "express";
import type { WindowInitialData } from "shared/types/windowData";
import { createServer, type ViteDevServer } from "vite";
import fetchInitialData from "./data/initialData";

//import { ViteHTMLExtractor } from "@canonical/express-base";

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

  app.use("*all", async (req, res) => {
    try {
      const url = req.originalUrl;
      let template = await fs.readFile(
        path.join(process.cwd(), "index.html"),
        "utf-8",
      );

      template = await vite.transformIndexHtml(url, template);
      console.log(template);
      const getRenderer: (
        windowData: WindowInitialData,
        htmlTemplate: string,
      ) => RenderHandler = (await vite.ssrLoadModule("src/server/renderer.tsx"))
        .default;
      const initialData = await fetchInitialData();

      //const extractor = new ViteHTMLExtractor(template);

      const render = getRenderer(initialData, template);

      res.status(200).set({ "Content-Type": "text/html" });
      return render(req, res);
    } catch (e) {
      if (e instanceof Error) {
        vite?.ssrFixStacktrace(e);
        console.log(e.stack);
        res.status(500).end(e.stack);
      }
    }
  });
}
