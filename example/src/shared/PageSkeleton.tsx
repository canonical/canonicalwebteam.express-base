import type { HTMLTemplateProps } from "@canonical/express-base";
import App from "../client/components/app/App";
import Head from "../client/components/head/Head";
// import WindowInitDataInjector from "../server/data/WindowInitDataInjector";
import type { WindowInitialData } from "./types/windowData";

function PageSkeleton(props: HTMLTemplateProps<WindowInitialData>) {
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
