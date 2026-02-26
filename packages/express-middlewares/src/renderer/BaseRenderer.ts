import type { IncomingMessage, ServerResponse } from "node:http";
import {
  JSXRenderer,
  type RendererOptions,
  type RenderHandler,
  type ServerEntrypoint,
} from "@canonical/pragma-tmp-patch";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

export type HTMLTransformationFunc = (html: string) => string;

export class BaseRenderer<
  InitData extends Record<string, unknown>,
> extends JSXRenderer<ServerEntrypoint<InitData>, InitData> {
  private readonly htmlTransformations: HTMLTransformationFunc[];

  constructor(
    Component: ServerEntrypoint<InitData>,
    initialData: InitData = {} as InitData,
    options: RendererOptions = {},
  ) {
    if (options.htmlString) {
      options.htmlString = addInitialData(options.htmlString, initialData);
    }
    super(Component, initialData, options);
    this.htmlTransformations = [];
  }

  getHtmlTransformations = () => [...this.htmlTransformations];

  renderToString: RenderHandler = (
    _req: IncomingMessage,
    res: ServerResponse,
  ): void => {
    const props = this.getComponentProps();
    const jsx = createElement(this.Component, props);
    let html = renderToString(jsx);
    for (const transformHtml of this.htmlTransformations) {
      html = transformHtml(html);
    }
    res
      .writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
      .write(html);
    res.end();
  };
}

function addInitialData<Data>(html: string, data: Data): string {
  const expression = /<\/head>/gm;
  const initialDataScript = `<script type="module">window.__INITIAL_DATA__=${JSON.stringify(data)}</script>`;
  return html.replace(expression, `${initialDataScript}\n</head>`);
}
