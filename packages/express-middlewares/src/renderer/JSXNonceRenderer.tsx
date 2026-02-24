import {
  Extractor,
  JSXRenderer,
  type RendererOptions,
  type ServerEntrypoint,
  type ServerEntrypointProps,
} from "@canonical/pragma-tmp-patch";
import type { Element } from "domhandler";
import React, { createContext } from "react";

export const NonceContext = createContext("");

function withNonceProvider<InitialData extends Record<string, unknown>>(
  Component: ServerEntrypoint<InitialData>,
  nonce: string,
): ServerEntrypoint<InitialData> {
  return function Wrapped(props: ServerEntrypointProps<InitialData>) {
    return (
      <NonceContext.Provider value={nonce}>
        <Component {...props} />
      </NonceContext.Provider>
    );
  };
}

/**
 * This class extends pragma's JSXRenderer to add nonces out of the box to all the script, link
 * and style tags in the HTML template.
 *
 * It will also wrap the given Component with a React Context called NonceProvider that will
 * allow you to retrieve the generated nonce in any React Component.
 * You can add the following to any <style> <link rel="stylesheet"> and <script> tag that you
 * include in your code:
 * ```js
 * {...(useContext(NonceContext) ? {nonce: useContext(NonceContext)} : {})}
 * ```
 *
 * Like this they will have the nonce value if present (and nothing if no nonce available).
 */
export class JSXNonceRenderer<
  InitialData extends Record<string, unknown>,
> extends JSXRenderer<ServerEntrypoint<InitialData>, InitialData> {
  protected nonceExtractor: NonceExtractor | undefined;

  constructor(
    protected readonly nonce: string,
    protected readonly Component: ServerEntrypoint<InitialData>,
    protected readonly initialData: InitialData = {} as InitialData,
    protected readonly options: RendererOptions = {},
  ) {
    const { htmlString, ...restOptions } = options;
    super(withNonceProvider(Component, nonce), initialData, restOptions);
    this.nonceExtractor = htmlString
      ? new NonceExtractor(nonce, htmlString)
      : undefined;
  }

  protected getComponentProps(): ServerEntrypointProps<InitialData> {
    return {
      lang: this.getLocale(),
      scriptElements: this.nonceExtractor?.getScriptElements(),
      linkElements: this.nonceExtractor?.getLinkElements(),
      otherHeadElements: this.nonceExtractor?.getOtherHeadElements(),
      initialData: this.initialData,
    } as ServerEntrypointProps<InitialData>;
  }
}

/**
 * This Extractor injects nonce when transforming into React Elements the passed HTML.
 */
class NonceExtractor extends Extractor {
  constructor(
    protected readonly nonce: string,
    htmlString: string,
  ) {
    super(htmlString);
  }

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
    const props: { [key: string]: string } = {};

    for (const [key, value] of Object.entries(element.attribs)) {
      props[this.convertKeyToReactKey(key)] = value;
    }

    // some tags from <head> have one children of type text
    let elementChildren: string | undefined;
    if (element.children.length === 1 && element.firstChild?.type === "text") {
      elementChildren = element.firstChild.data;
    }

    props.key = `${element.name}_${index}`;
    props.nonce = this.nonce;
    return React.createElement(element.name, props, elementChildren);
  }
}
