import {
  JSXRenderer,
  type RendererOptions,
  type ServerEntrypoint,
} from "@canonical/react-ssr/renderer";

export type HTMLTransformationFunc = (html: string) => string;

export class BaseRenderer<
  InitData extends Record<string, unknown>,
> extends JSXRenderer<ServerEntrypoint<InitData>, InitData> {
  constructor(
    Component: ServerEntrypoint<InitData>,
    initialData: InitData = {} as InitData,
    options: RendererOptions = {},
  ) {
    if (options.htmlString) {
      options.htmlString = addInitialData(options.htmlString, initialData);
    }
    super(Component, initialData, options);
  }
}

function addInitialData<Data>(html: string, data: Data): string {
  // we add the initial data at the beginning of the <head> element to make sure it's ready
  // when the main JS starts executing (otherwise hydrateRoot has no data)
  const expression = /<head>/gm;
  const initialDataScript = `<script type="module">window.__INITIAL_DATA__=${JSON.stringify(data)}</script>`;
  return html.replace(expression, `<head>\n${initialDataScript}\n`);
}
