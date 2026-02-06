import type { IncomingMessage, ServerResponse } from "node:http";
import { BaseJSXRenderer, ViteRenderer } from "@canonical/express-base";
import type { WindowInitialData } from "shared/types/windowData";
import PageSkeleton from "../shared/PageSkeleton";
import { IS_PRODUCTION } from "./constants";

function getRenderer(initialData: WindowInitialData, htmlTemplate: string) {
  if (IS_PRODUCTION) {
    return new BaseJSXRenderer<WindowInitialData>(PageSkeleton, initialData, {
      htmlString: htmlTemplate,
    }).render;
  }
  return new ViteRenderer<WindowInitialData>(PageSkeleton, initialData, {
    htmlString: htmlTemplate,
  }).render;
}

export default function render(
  initialData: WindowInitialData,
  htmlTemplate: string,
  req: IncomingMessage,
  res: ServerResponse,
) {
  const renderer = getRenderer(initialData, htmlTemplate);
  return renderer(req, res);
}
