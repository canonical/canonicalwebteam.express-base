import path from "node:path";
import fs from "node:fs/promises";

import type { Application } from "express";
import { type ViteDevServer, createServer } from "vite";


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
        "utf-8"
      );

      template = await vite.transformIndexHtml(url, template);
      const render: (url: string) => RenderOutput = (
        await vite.ssrLoadModule("src/client/entry-server.tsx")
      ).render;

      const rendered = await render(url);
      const html = template
        .replace(`<!--app-head-->`, rendered.head ?? "")
        .replace(`<!--app-html-->`, rendered.body ?? "");

      res.status(200).set({ "Content-Type": "text/html" }).send(html);
    } catch (e) {
      if (e instanceof Error) {
        vite?.ssrFixStacktrace(e);
        console.log(e.stack);
        res.status(500).end(e.stack);
      }
    }
  });
}
