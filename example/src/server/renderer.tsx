import type {
  ReactServerEntrypointComponent,
  RendererServerEntrypointProps,
} from "@canonical/react-ssr/renderer";
import { JSXRenderer } from "@canonical/react-ssr/renderer";
import type { WindowInitialData } from "shared/types/windowData";
import App from "../client/components/app/App";
import Head from "../client/components/head/Head";

export default function getRenderer(
  initialData: WindowInitialData,
  htmlTemplate: string,
) {
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
  return new JSXRenderer(EntryServer, { htmlString: htmlTemplate }).render;
}
