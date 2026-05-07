import type { ServerEntrypointProps } from "@canonical/react-ssr/renderer";
import Head from "../client/components/head/Head";
import type { WindowInitialData } from "./types/windowData";

function StaticPageSkeleton(props: ServerEntrypointProps<WindowInitialData>) {
  return (
    <html lang={props?.lang}>
      <head>
        <Head />
        {props?.otherHeadElements}
        {props?.linkElements}
        {props?.scriptElements}
      </head>
      <body>
        <div
          id="root"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: root for hydration
          dangerouslySetInnerHTML={{ __html: `<!--app-html-->` }}
        ></div>
      </body>
    </html>
  );
}

export default StaticPageSkeleton;
