import type { IncomingMessage, ServerResponse } from "node:http";
import { ViteRenderer } from "@canonical/express-base";
import type { WindowInitialData } from "shared/types/windowData";
import PageSkeleton from "../shared/PageSkeleton";

function getRenderer(initialData: WindowInitialData, htmlTemplate: string) {
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
