import type { IncomingMessage, ServerResponse } from "node:http";
import {
  PipeableStreamRenderer,
  StringRenderer,
} from "@canonical/pragma-tmp-patch";
import type { WindowInitialData } from "shared/types/windowData";
import PageSkeleton from "../shared/PageSkeleton";
import { IS_PRODUCTION } from "./constants";

function getRenderer(initialData: WindowInitialData, htmlTemplate: string) {
  if (IS_PRODUCTION) {
    return new PipeableStreamRenderer<typeof PageSkeleton, WindowInitialData>(
      PageSkeleton,
      initialData,
      {
        htmlString: htmlTemplate,
      },
    ).render;
  }
  return new StringRenderer<typeof PageSkeleton, WindowInitialData>(
    PageSkeleton,
    initialData,
    {
      htmlString: htmlTemplate,
    },
  ).render;
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
