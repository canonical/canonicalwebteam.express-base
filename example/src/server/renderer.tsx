import {
  IntegrityRenderer,
  type RendererFactory,
  type RootAppProps,
} from "@canonical/express-middlewares";
import { JSXRenderer, type RendererOptions } from "@canonical/pragma-tmp-patch";
import type { Request, Response } from "express";
import PageSkeleton from "../shared/PageSkeleton";
import StaticPageSkeleton from "../shared/StaticPageSkeleton";
import type { WindowInitialData } from "../shared/types/windowData";

function getRenderMethod(
  initialData: WindowInitialData,
  options: RendererOptions,
  res: Response,
) {
  if (res.locals?.rendererFactory) {
    const renderer = (
      res.locals.rendererFactory as RendererFactory<WindowInitialData>
    )({ Component: PageSkeleton, initialData, options });
    if (initialData.hasSuspense) {
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
  if (initialData.hasSuspense) {
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
  const render = getRenderMethod(initialData, options, res);
  return render(req, res);
}

export function renderWithRoot(
  RootComponent: React.ComponentType<RootAppProps>,
  initialData: WindowInitialData,
  options: RendererOptions,
  req: Request,
  res: Response,
) {
  if (res.locals?.rendererFactory) {
    const renderer = (
      res.locals.rendererFactory as RendererFactory<WindowInitialData>
    )({ Component: StaticPageSkeleton, initialData, options });
    if (renderer instanceof IntegrityRenderer) {
      return renderer.renderToStringWithRoot(req, res, RootComponent);
    }
  }
  throw new Error(
    "Can't use renderWithRoot without having an IntegrityRenderer (provided by 'hashContentSecurityPolicy')",
  );
}
