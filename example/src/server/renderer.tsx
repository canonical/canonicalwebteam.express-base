import type {
  ReactServerEntrypointComponent,
  RendererServerEntrypointProps,
} from "@canonical/react-ssr/renderer";
import { JSXRenderer } from "@canonical/react-ssr/renderer";
import App from "client/components/app/App";
import { TEMPLATE_HTML } from "./constants";
import Head from "client/components/head/Head";
import type { WindowInitialData } from "shared/types/windowData";

export default function getRenderer(initialData: WindowInitialData) {
  const EntryServer: ReactServerEntrypointComponent<
    RendererServerEntrypointProps
  > = ({
    lang = "en",
    scriptTags,
    linkTags,
  }: RendererServerEntrypointProps) => {
    return (
      <html lang={lang}>
        <head>
          <Head />
          {scriptTags}
          {linkTags}
        </head>
        <body>
          <div id="root">
            <App data={initialData} />
          </div>
        </body>
      </html>
    );
  };
  return new JSXRenderer(EntryServer, { htmlString: TEMPLATE_HTML }).render;
}
