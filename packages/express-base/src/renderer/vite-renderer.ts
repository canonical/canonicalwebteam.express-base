import type {
  RendererOptions,
  RendererServerEntrypointProps,
} from "@canonical/react-ssr/renderer";
import { JSXRenderer } from "@canonical/react-ssr/renderer";
import type React from "react";
import { ViteHTMLExtractor } from "./vite-extractor.js";

export interface HTMLTemplateProps<InitialData>
  extends RendererServerEntrypointProps {
  /** All the React elements from the tags inside the <head> element of the page */
  allHeadElements?: React.ReactElement[];
  initialData?: InitialData;
}

export type SSRComponent<InitialData> = React.ComponentType<
  HTMLTemplateProps<InitialData>
>;
export type SSRComponentProps<InitialData> = HTMLTemplateProps<InitialData>;

export class ViteRenderer<InitialData = unknown> extends JSXRenderer<
  SSRComponent<InitialData>,
  SSRComponentProps<InitialData>
> {
  private viteExtractor: ViteHTMLExtractor | undefined;
  private initialData: InitialData | undefined;

  constructor(
    component: SSRComponent<InitialData>,
    initialData?: InitialData,
    options: RendererOptions = {},
  ) {
    super(component, options);
    this.initialData = initialData;
    this.viteExtractor = options.htmlString
      ? new ViteHTMLExtractor(options.htmlString)
      : undefined;
    // biome-ignore lint/complexity/useLiteralKeys: property is private in base class
    this["extractor"] = this.viteExtractor;
    // biome-ignore lint/complexity/useLiteralKeys: method is private in base class
    this["getComponentProps"] = (): SSRComponentProps<InitialData> => {
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
        initialData: this.initialData,
      } as SSRComponentProps<InitialData>;
    };
  }

  protected getLocale(): string {
    return "en";
  }
}
