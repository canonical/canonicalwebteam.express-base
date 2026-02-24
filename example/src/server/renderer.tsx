import type { IncomingMessage, ServerResponse } from "node:http";
import { JSXRenderer, type RendererOptions } from "@canonical/pragma-tmp-patch";
import type { WindowInitialData } from "shared/types/windowData";
import PageSkeleton from "../shared/PageSkeleton";
import { IS_PRODUCTION } from "./constants";

function getRenderer(initialData: WindowInitialData, options: RendererOptions) {
  if (IS_PRODUCTION) {
    return new JSXRenderer<typeof PageSkeleton, WindowInitialData>(
      PageSkeleton,
      initialData,
      options,
    ).renderToStream;
  }
  return new JSXRenderer<typeof PageSkeleton, WindowInitialData>(
    PageSkeleton,
    initialData,
    options,
  ).renderToString;
}

export default function render(
  initialData: WindowInitialData,
  options: RendererOptions,
  req: IncomingMessage,
  res: ServerResponse,
) {
  const renderer = getRenderer(initialData, options);
  return renderer(req, res);
}
