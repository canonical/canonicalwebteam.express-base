import type { IncomingMessage, ServerResponse } from "node:http";
import type {
  RendererOptions,
  RenderHandler,
  RenderResult,
} from "@canonical/react-ssr/renderer";
import { JSXRenderer } from "@canonical/react-ssr/renderer";
import React from "react";
import type { RenderToPipeableStreamOptions } from "react-dom/server";
import { renderToPipeableStream } from "react-dom/server";
import type {
  ScriptElement,
  SSRComponent,
  SSRComponentProps,
} from "./types.js";
import { ViteHTMLExtractor } from "./vite-extractor.js";

export const INITIAL_DATA_KEY = "__INITIAL_DATA__";

export class BaseJSXRenderer<InitialData = unknown> extends JSXRenderer<
  SSRComponent<InitialData>,
  SSRComponentProps<InitialData>
> {
  protected viteExtractor: ViteHTMLExtractor | undefined;
  protected component: SSRComponent<InitialData>;
  protected initialData: InitialData | undefined;
  protected rendererOptions: RendererOptions;

  constructor(
    component: SSRComponent<InitialData>,
    initialData?: InitialData,
    options: RendererOptions = {},
  ) {
    super(component, options);
    this.component = component;
    this.initialData = initialData;
    this.rendererOptions = options;
    this.viteExtractor = options.htmlString
      ? new ViteHTMLExtractor(options.htmlString)
      : undefined;
    // biome-ignore lint/complexity/useLiteralKeys: property is private in base class
    this["extractor"] = this.viteExtractor;
  }

  protected getLocale(): string {
    return "en";
  }

  protected getProps(): SSRComponentProps<InitialData> {
    // reverse keeps the original order in the HTML, because they are extracted with a stack
    const scriptElements = this.viteExtractor?.getScriptElements().reverse();
    const linkElements = this.viteExtractor?.getLinkElements().reverse();
    const otherElements = this.viteExtractor?.getOtherHeadElements().reverse();

    return {
      lang: this.getLocale(),
      otherHeadElements: otherElements,
      scriptElements: scriptElements,
      linkElements: linkElements,
      initialData: this.initialData,
    } as SSRComponentProps<InitialData>;
  }

  protected getScriptsByType(
    scripts: React.ReactElement[],
    type: "module" | "classic",
  ): string[] {
    return (
      scripts
        .map((script) => script as ScriptElement)
        .filter((script) => {
          if (type === "module") {
            return script.props.type === "module";
          } else {
            return script.props.type !== "module";
          }
        })
        .map((script) => script.props.src)
        .filter((src) => typeof src === "string") || []
    );
  }

  protected enrichRendererOptions(
    userOptions: RenderToPipeableStreamOptions | undefined,
    props: SSRComponentProps<InitialData>,
  ): RenderToPipeableStreamOptions {
    const enrichedOptions = { ...userOptions };

    // options passed by the user always take priority
    if (!enrichedOptions.bootstrapScriptContent) {
      if (props.initialData) {
        enrichedOptions.bootstrapScriptContent = `window.${INITIAL_DATA_KEY} = ${JSON.stringify(props.initialData)}`;
      }
    }
    if (!enrichedOptions.bootstrapScripts) {
      if (props.scriptElements) {
        enrichedOptions.bootstrapScripts = this.getScriptsByType(
          props.scriptElements,
          "classic",
        );
      }
    }
    if (!enrichedOptions.bootstrapModules) {
      if (props.scriptElements) {
        enrichedOptions.bootstrapModules = this.getScriptsByType(
          props.scriptElements,
          "module",
        );
      }
    }

    return enrichedOptions;
  }

  render: RenderHandler = (
    _req: IncomingMessage,
    res: ServerResponse,
  ): RenderResult => {
    // await this.prepareLocale(req.headers.get("accept-language") || undefined);
    const props = this.getProps();
    const jsx = React.createElement(this.component, props);

    let renderingError: Error;

    const jsxStream = renderToPipeableStream(jsx, {
      ...this.enrichRendererOptions(
        this.rendererOptions.renderToPipeableStreamOptions,
        props,
      ),
      // Early error, before the shell is prepared
      onShellError(error) {
        if (!res.headersSent) {
          res
            .writeHead(500, { "Content-Type": "text/html; charset=utf-8" })
            .end("<h1>Something went wrong</h1>");
        }
        console.error(error);
      },
      onShellReady() {
        if (!res.headersSent) {
          res.writeHead(renderingError ? 500 : 200, {
            "Content-Type": "text/html; charset=utf-8",
          });
        }

        jsxStream.pipe(res);
        res.on("finish", () => {
          res.end();
        });
      },
      // Error occurred during rendering, after the shell & headers were sent - store the error for usage after stream is sent
      onError(error) {
        renderingError = error as Error;
      },
    });
    return jsxStream;
  };
}

export class ViteRenderer<
  InitialData = unknown,
> extends BaseJSXRenderer<InitialData> {
  render: RenderHandler = (
    _req: IncomingMessage,
    res: ServerResponse,
  ): RenderResult => {
    // await this.prepareLocale(req.headers.get("accept-language") || undefined);
    const props = this.getProps();
    const jsx = React.createElement(this.component, props);

    let renderingError: Error;

    const jsxStream = renderToPipeableStream(jsx, {
      ...this.enrichRendererOptions(
        this.rendererOptions.renderToPipeableStreamOptions,
        props,
      ),
      // this works as renderToString -> no suspense allowed because Vite in development mode
      // can't load its needed modules until the full HTML is parsed (all Suspense components solved)
      onAllReady() {
        if (!res.headersSent) {
          res.writeHead(renderingError ? 500 : 200, {
            "Content-Type": "text/html; charset=utf-8",
          });
        }

        jsxStream.pipe(res);
        res.on("finish", () => {
          res.end();
        });
      },
      // Error occurred during rendering, after the shell & headers were sent - store the error for usage after stream is sent
      onError(error) {
        renderingError = error as Error;
      },
    });
    return jsxStream;
  };
}
