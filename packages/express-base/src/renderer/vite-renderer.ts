import type {
  RendererOptions,
  RendererServerEntrypointProps,
} from "@canonical/react-ssr/renderer";
import { JSXRenderer } from "@canonical/react-ssr/renderer";
import type React from "react";
import { ViteHTMLExtractor } from "./vite-extractor.js";

export interface HTMLTemplateHeadProps extends RendererServerEntrypointProps {
  /** All the React elements from the tags inside the <head> element of the page */
  allHeadElements?: React.ReactElement[];
}

export type SSRComponent = React.ComponentType<HTMLTemplateHeadProps>;

export class ViteRenderer<
  SSRComponent extends React.ComponentType<SSRComponentProps>,
  SSRComponentProps extends HTMLTemplateHeadProps = HTMLTemplateHeadProps,
> extends JSXRenderer<SSRComponent, SSRComponentProps> {
  private viteExtractor: ViteHTMLExtractor | undefined;

  constructor(component: SSRComponent, options: RendererOptions = {}) {
    super(component, options);
    this.viteExtractor = options.htmlString
      ? new ViteHTMLExtractor(options.htmlString)
      : undefined;
    // biome-ignore lint/complexity/useLiteralKeys: property is private in base class
    this["extractor"] = this.viteExtractor;
    // biome-ignore lint/complexity/useLiteralKeys: method is private in base class
    this["getComponentProps"] = (): SSRComponentProps => {
      // reverse keeps the original order in the HTML, because they are extracted with a stack
      const scriptElements = this.viteExtractor?.getScriptElements().reverse();
      const linkElements = this.viteExtractor?.getLinkElements().reverse();
      const otherElements = this.viteExtractor
        ?.getOtherHeadElements()
        .reverse();
      return {
        lang: this.getLocale(),
        allHeadElements: [scriptElements, linkElements, otherElements]
          .filter((array) => !!array)
          .flat(),
      } as SSRComponentProps;
    };
  }

  protected getLocale(): string {
    return "en";
  }
}
