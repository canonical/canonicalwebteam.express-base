// biome-ignore-all lint/correctness/useUniqueElementIds: root hydration outlet

import type { IncomingMessage, ServerResponse } from "node:http";
import {
  type HTMLTemplateHeadProps,
  type SSRComponent,
  ViteRenderer,
} from "@canonical/express-base";
import type { WindowInitialData } from "shared/types/windowData";
import App from "../client/components/app/App";
import Head from "../client/components/head/Head";

function getRenderer(initialData: WindowInitialData, htmlTemplate: string) {
  const EntryServer: SSRComponent = ({
    lang,
    allHeadElements,
  }: HTMLTemplateHeadProps) => {
    return (
      <html lang={lang}>
        <head>
          <Head />
          {allHeadElements}
        </head>
        <body>
          <div id="root">
            <App data={initialData} />
          </div>
        </body>
      </html>
    );
  };
  return new ViteRenderer(EntryServer, { htmlString: htmlTemplate }).render;
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
