import type {
  ReactServerEntrypointComponent,
  RendererServerEntrypointProps,
} from "@canonical/react-ssr/renderer";
import { JSXRenderer } from "@canonical/react-ssr/renderer";
import type { WindowInitialData } from "shared/types/windowData";
import App from "../client/components/app/App";
import Head from "../client/components/head/Head";
import { TEMPLATE_HTML } from "./constants";

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
          <App data={initialData} />
        </body>
      </html>
    );
  };
  return new JSXRenderer(EntryServer, { htmlString: TEMPLATE_HTML }).render;
}
