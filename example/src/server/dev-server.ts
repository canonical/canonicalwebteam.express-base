import fs from "node:fs/promises";
import path from "node:path";
import type {
  RendererOptions,
  RenderResult,
} from "@canonical/pragma-tmp-patch";
import type { Application, NextFunction, Request, Response } from "express";
import type { WindowInitialData } from "shared/types/windowData";
import { createServer, type ViteDevServer } from "vite";
import fetchInitialData from "./data/initialData";
import apiRoute from "./routes/api";
import errorsRoute from "./routes/errors";

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

  // Disable caching completely, otherwise the browser stores the resulting HTML
  // and the example can't be seen properly after the first request
  app.use((_req, res, next) => {
    res.set("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    next();
  });

  app.use("/api", apiRoute);
  app.use("/errors", errorsRoute);

  app.use(["/", "/suspense"], async (req, res, next: NextFunction) => {
    try {
      const url = req.originalUrl;
      console.log(`Rendering ${url}`);
      let template = await fs.readFile(
        path.join(process.cwd(), "index.html"),
        "utf-8",
      );

      template = await vite.transformIndexHtml(url, template);

      // Clear Vite's module cache to ensure fresh renders in development
      // This forces React.lazy and other cached modules to re-evaluate
      vite.moduleGraph.invalidateAll();

      const render: (
        windowData: WindowInitialData | null,
        options: RendererOptions,
        req: Request,
        res: Response,
      ) => RenderResult = (await vite.ssrLoadModule("src/server/renderer.tsx"))
        .default;

      let initialData: WindowInitialData = { hasSuspense: true };
      if (!url.match(/suspense$/)) {
        initialData = await fetchInitialData();
      }
      const result = render(
        initialData,
        {
          htmlString: template,
          renderToPipeableStreamOptions: {
            onShellError: (error) => next(error),
          },
        },
        req,
        res,
      );

      // Handle render errors
      if (result instanceof Error) {
        next(result);
      }
    } catch (e) {
      vite?.ssrFixStacktrace(e as Error);
      console.log((e as Error)?.stack);
      next(e);
    }
  });
}
