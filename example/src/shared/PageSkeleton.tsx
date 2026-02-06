import type { ServerEntrypointProps } from "@canonical/pragma-tmp-patch";
import App from "../client/components/app/App";
import Head from "../client/components/head/Head";
// import WindowInitDataInjector from "../server/data/WindowInitDataInjector";
import type { WindowInitialData } from "./types/windowData";

function PageSkeleton(props: ServerEntrypointProps<WindowInitialData>) {
  return (
    <html lang={props?.lang}>
      <head>
        <Head />
        {/* <WindowInitDataInjector data={props?.initialData} /> */}
        {props?.otherHeadElements}
        {props?.linkElements}
        {props?.scriptElements}
      </head>
      <body>
        <App data={props?.initialData} />
      </body>
    </html>
  );
}

export default PageSkeleton;
