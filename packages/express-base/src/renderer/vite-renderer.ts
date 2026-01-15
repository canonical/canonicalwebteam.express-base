import type {
  RendererOptions,
  RendererServerEntrypointProps,
} from "@canonical/react-ssr/renderer";
import { JSXRenderer } from "@canonical/react-ssr/renderer";
import { ViteHTMLExtractor } from "main";

// type WindowInitialData

export interface HTMLTemplateHeadProps extends RendererServerEntrypointProps {
  /** All the other tags inside the <head> element of the page, other than <link> and <script>. */
  otherHeadTags?: [HTMLElement];
}

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
      return {
        lang: this.getLocale(),
        scriptTags: this.viteExtractor?.getScriptTags(),
        linkTags: this.viteExtractor?.getLinkTags(),
        otherHeadTags: this.viteExtractor?.getOtherHeadTags(),
      } as SSRComponentProps;
    };
  }

  protected getLocale(): string {
    return "en";
  }
}
