import type { IncomingMessage } from "node:http";
import {
  Extractor,
  type RendererOptions,
  type RenderHandler,
  type ServerEntrypoint,
  type ServerEntrypointProps,
} from "@canonical/pragma-tmp-patch";
import render from "dom-serializer";
import {
  type ChildNode,
  type Document,
  Element,
  NodeWithChildren,
  type Text,
} from "domhandler";
import { ElementType, parseDocument } from "htmlparser2";
import type React from "react";
import { createContext, createElement } from "react";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import {
  GENERATE_HASH_ATTR,
  REPLACE_SCRIPT_VALUE,
  REPLACE_STYLE_VALUE,
} from "../security";
import { calculateHash } from "../security/utils";
import type { LocalServerResponse } from "../types";
import { BaseRenderer } from "./BaseRenderer";
import { HTML_ROOT_REPLACE_KEY, type RootAppProps } from "./index";

export const IntegrityContext = createContext(false);

function withIntegrityProvider<InitialData extends Record<string, unknown>>(
  Component: React.ComponentType<InitialData>,
): React.ComponentType<InitialData> {
  return function Wrapped(props: InitialData) {
    return (
      <IntegrityContext.Provider value={true}>
        <Component {...props} />
      </IntegrityContext.Provider>
    );
  };
}

export class IntegrityRenderer<
  InitialData extends Record<string, unknown>,
> extends BaseRenderer<InitialData> {
  protected integrityExtractor: IntegrityExtractor | undefined;
  protected RootApplication: React.ComponentType<RootAppProps> | undefined;

  constructor(
    protected readonly ShellComponent: ServerEntrypoint<InitialData>,
    protected readonly initialData: InitialData = {} as InitialData,
    protected readonly options: RendererOptions = {},
    protected readonly port: number = 80,
  ) {
    super(ShellComponent, initialData, options);
    this.integrityExtractor = options.htmlString
      ? new IntegrityExtractor(options.htmlString)
      : undefined;
  }

  setRootApplication(RootApplication: React.ComponentType<RootAppProps>): void {
    this.RootApplication = withIntegrityProvider(RootApplication);
  }

  protected getComponentProps(): ServerEntrypointProps<InitialData> {
    return {
      lang: this.getLocale(),
      scriptElements: this.integrityExtractor?.getScriptElements(),
      linkElements: this.integrityExtractor?.getLinkElements(),
      otherHeadElements: this.integrityExtractor?.getOtherHeadElements(),
      initialData: this.initialData,
    } as ServerEntrypointProps<InitialData>;
  }

  renderToStream: RenderHandler = (
    _req: IncomingMessage,
    _res: LocalServerResponse,
  ): void => {
    throw new Error(
      "Hash CSP is not supported with renderToStream. Use nonces or renderToStringWithRoot.",
    );
  };

  renderToString: RenderHandler = (
    _req: IncomingMessage,
    _res: LocalServerResponse,
  ): void => {
    throw new Error(
      "Hash CSP is not supported with renderToString. Use nonces or renderToStringWithRoot.",
    );
  };

  renderToStringWithRoot = async (
    _req: IncomingMessage,
    res: LocalServerResponse,
    RootApplication?: React.ComponentType<RootAppProps>,
  ): Promise<void> => {
    if (RootApplication) {
      this.setRootApplication(RootApplication);
    }
    const props = this.getComponentProps();
    const jsx = createElement(this.ShellComponent, props);

    let html: string;
    if (this.RootApplication) {
      html = renderToStaticMarkup(jsx);
    } else {
      html = renderToString(jsx);
    }

    // we inject hashes into the generated markup and apply them to the CSP header
    const hashInjector = new HashInjector(html, this.port);
    await hashInjector.generateHashes();
    hashInjector.writeToCSPHeader(res);
    html = hashInjector.render();

    // now render the application with hydration available (renderToString)
    if (this.RootApplication) {
      const rootAppHtml = renderToString(
        createElement(this.RootApplication, { data: props.initialData }),
      );
      html = html.replace(HTML_ROOT_REPLACE_KEY, rootAppHtml);
    }

    // send the full response
    res
      .writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
      .write(html);
    res.end();
  };
}

/**
 * This Extractor injects nonce when transforming into React Elements the passed HTML.
 */
class IntegrityExtractor extends Extractor {
  /**
   * Converts a parsed {@link domhandler#Element | DOM Element} into a {@link react#React.ReactElement | ReactElement},
   * adding the nonce prop to script, style and link tags.
   *
   * @remark The method takes into account the attributes of the parsed {@link domhandler#Element | Element}
   * and passes them as props when creating the {@link react#React.ReactElement | ReactElement}.
   * It only handles children of type "text".
   */
  protected convertToReactElement(
    element: Element,
    index: number,
  ): React.ReactElement {
    const props: { [key: string]: string | boolean } = {};

    for (const [key, value] of Object.entries(element.attribs)) {
      props[this.convertKeyToReactKey(key)] = value;
    }

    // some tags from <head> have one children of type text
    let elementChildren: string | undefined;
    if (element.children.length === 1 && element.firstChild?.type === "text") {
      elementChildren = element.firstChild.data;
    }

    props.key = `${element.name}_${index}`;
    if (needsHash(element.name, props)) {
      props[GENERATE_HASH_ATTR] = "true";
    }
    return createElement(element.name, props, elementChildren);
  }
}

function needsHash(tag: string, props: { [key: string]: string | boolean }) {
  return (
    tag === "script" ||
    tag === "style" ||
    (tag === "link" && props.rel === "stylesheet")
  );
}

const HASH_METHOD = "sha256";
const CSP_HEADER_NAME = "content-security-policy";

class HashInjector {
  /**
   * A document object representing the DOM of a page.
   */
  protected readonly document: Document;
  protected readonly port: number;
  protected readonly scriptHashes: string[] = [];
  protected readonly styleHashes: string[] = [];

  constructor(html: string, port: number) {
    this.document = parseDocument(html);
    this.port = port;
  }

  async generateHashes(): Promise<void> {
    const elements: Element[] = this.getHashableElements();
    await Promise.all(
      elements.map((element) => {
        switch (element.type) {
          case ElementType.Script:
            return this.addHashToScript(element);
          case ElementType.Style:
            return this.addHashToStyle(element);
          case ElementType.Tag:
            if (element.tagName === "link") {
              return this.addHashToLink(element);
            }
        }
        return Promise.resolve();
      }),
    );
  }

  protected async addHashToScript(element: Element): Promise<void> {
    let hash: string;
    if (element.attribs.src) {
      hash = await this.fetchSrcAndComputeHash(element.attribs.src);
    } else {
      const scriptText: string = element.childNodes
        .filter((node: ChildNode) => node.type === ElementType.Text)
        .map((text: Text) => text.data)
        .join();
      hash = calculateHash(scriptText);
    }
    const integrity = `${HASH_METHOD}-${hash}`;
    this.scriptHashes.push(integrity);
    element.attribs.integrity = integrity;
  }

  protected async addHashToStyle(element: Element): Promise<void> {
    const styleText: string = element.childNodes
      .filter((node: ChildNode) => node.type === ElementType.Text)
      .map((text: Text) => text.data)
      .join();
    const hash = calculateHash(styleText);
    const integrity = `${HASH_METHOD}-${hash}`;
    this.styleHashes.push(integrity);
    element.attribs.integrity = integrity;
  }

  protected async addHashToLink(element: Element): Promise<void> {
    if (element.attribs.rel && element.attribs.rel === "stylesheet") {
      const src = element.attribs.href;
      const hash = await this.fetchSrcAndComputeHash(src);
      const integrity = `${HASH_METHOD}-${hash}`;
      this.styleHashes.push(integrity);
      element.attribs.integrity = integrity;
    }
  }

  protected async fetchSrcAndComputeHash(src: string): Promise<string> {
    if (!src.startsWith("http")) {
      src = `http://localhost:${this.port}${src.startsWith("/") ? "" : "/"}${src}`;
    }
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${src}`);
    }
    const content = await response.text();
    return calculateHash(content);
  }

  protected getHashableElements(): Element[] {
    const elements: Element[] = [];
    const stack = [...this.document.children];

    while (stack.length) {
      const node = stack.pop();
      if (!node) continue;

      if (node instanceof Element) {
        if (node.attribs[GENERATE_HASH_ATTR] === "true") {
          elements.push(node);
        }
      }

      if (node instanceof NodeWithChildren) {
        stack.push(...node.children);
      }
    }

    return elements;
  }

  render(): string {
    return render(this.document);
  }

  writeToCSPHeader(res: LocalServerResponse): void {
    const csp = res.getHeader(CSP_HEADER_NAME) as string;
    const scriptIntegrityValue = this.scriptHashes
      .map((hash) => `'${hash}'`)
      .join(" ");
    const styleIntegrityValue = this.styleHashes
      .map((hash) => `'${hash}'`)
      .join(" ");
    let cspWithHashes = csp.replace(REPLACE_SCRIPT_VALUE, scriptIntegrityValue);
    cspWithHashes = cspWithHashes.replace(
      REPLACE_STYLE_VALUE,
      styleIntegrityValue,
    );
    res.setHeader(CSP_HEADER_NAME, cspWithHashes);
  }
}
