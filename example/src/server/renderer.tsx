import type { RendererFactory } from "@canonical/express-middlewares";
import { JSXRenderer, type RendererOptions } from "@canonical/pragma-tmp-patch";
import type { Request, Response } from "express";
import type { WindowInitialData } from "shared/types/windowData";
import PageSkeleton from "../shared/PageSkeleton";
import { IS_PRODUCTION } from "./constants";

function getRenderMethod(
  initialData: WindowInitialData,
  options: RendererOptions,
  res: Response,
) {
  if (res.locals?.rendererFactory) {
    const renderer = (
      res.locals.rendererFactory as RendererFactory<WindowInitialData>
    )({ Component: PageSkeleton, initialData, options });
    if (IS_PRODUCTION) {
      return renderer.renderToStream;
    }
    return renderer.renderToString;
  }
  return fallbackRenderMethod(initialData, options);
}

function fallbackRenderMethod(
  initialData: WindowInitialData,
  options: RendererOptions,
) {
  const renderer = new JSXRenderer<typeof PageSkeleton, WindowInitialData>(
    PageSkeleton,
    initialData,
    options,
  );
  if (IS_PRODUCTION) {
    return renderer.renderToStream;
  }
  return renderer.renderToString;
}

export default function render(
  initialData: WindowInitialData,
  options: RendererOptions,
  req: Request,
  res: Response,
) {
  const renderer = getRenderMethod(initialData, options, res);
  return renderer(req, res);
}
