import { INITIAL_DATA_KEY, type WindowInitialData } from "../../shared";

function WindowInitDataInjector({
  data,
}: {
  data: WindowInitialData | undefined;
}) {
  if (!data) {
    return null;
  }
  return (
    <script
      type="text/javascript"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: this is rendered only in the server and used to hydrate the page
      dangerouslySetInnerHTML={{
        __html: `window.${INITIAL_DATA_KEY} = ${JSON.stringify(data)}`,
      }}
    />
  );
}

export default WindowInitDataInjector;
