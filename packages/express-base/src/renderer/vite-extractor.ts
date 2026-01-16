import { Extractor } from "@canonical/react-ssr/renderer";
import type { Element } from "domhandler";
import React from "react";

/**
 * This class extracts all the possible tags from the <head> of an HTML page.
 * These are:
 * - title
 * - style
 * - meta
 * - link
 * - script
 * - base
 *
 * It extracts the content of the tags that have one:
 * - title
 * - style
 * - script
 */
export class ViteHTMLExtractor extends Extractor {
  protected convertToReactKey: (key: string) => string =
    // biome-ignore lint/complexity/useLiteralKeys: method is private in base class
    this["convertKeyToReactKey"];
  protected getElements: (tag: string) => Element[] =
    // biome-ignore lint/complexity/useLiteralKeys: method is private in base class
    this["getElementsByTagName"];

  protected convertToReact(element: Element): React.ReactElement {
    const props: { [key: string]: string } = {};
    // set properties
    for (const [key, value] of Object.entries(element.attribs)) {
      props[this.convertToReactKey(key)] = value;
    }
    // the tags we're interested in converting should have only one children of type text
    let elementChildren: string | undefined;
    if (element.children.length === 1 && element.firstChild?.type === "text") {
      elementChildren = element.firstChild.data;
    }
    // create react element with the properties and children
    return React.createElement(element.name, props, elementChildren);
  }

  public getLinkElements(): React.ReactElement[] {
    return this.getLinkTags();
  }

  // Overwritten to include script content
  public getScriptElements(): React.ReactElement[] {
    const scriptElements = this.getElements("script");
    return scriptElements.map(this.convertToReact, this);
  }

  public getOtherHeadElements(): React.ReactElement[] {
    const otherElements = ["title", "style", "meta", "base"].flatMap(
      (elementName: string) => this.getElements(elementName),
    );
    return otherElements.map(this.convertToReact, this);
  }
}
