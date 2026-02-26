import type { IncomingMessage } from "node:http";
import { contentSecurityPolicy } from "helmet";
import {
  cloneElement,
  type LinkHTMLAttributes,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
  type ScriptHTMLAttributes,
  type StyleHTMLAttributes,
} from "react";
import { renderToString } from "react-dom/server";
import type {
  DynamicCSPValueFunction,
  LocalServerResponse,
  MiddlewareFunction,
  PreRenderCallback,
} from "../types";
import { calculateHash, calculateNonce, patchReactNode } from "./utils";

export enum CSPDirectiveKey {
  ChildSrc = "child-src",
  ConnectSrc = "connect-src",
  DefaultSrc = "default-src",
  FencedFrameSrc = "fenced-frame-src",
  FontSrc = "font-src",
  FrameSrc = "frame-src",
  ImgSrc = "img-src",
  ManifestSrc = "manifest-src",
  MediaSrc = "media-src",
  ObjectSrc = "object-src",
  ScriptSrc = "script-src",
  ScriptSrcElem = "script-src-elem",
  ScriptSrcAttr = "script-src-attr",
  StyleSrc = "style-src",
  StyleSrcElem = "style-src-elem",
  StyleSrcAttr = "style-src-attr",
  WorkerSrc = "worker-src",
  BaseUri = "base-uri",
  Sandbox = "sandbox",
  FormAction = "form-action",
  FrameAncestors = "frame-ancestors",
  ReportTo = "report-to",
  RequireTrustedTypesFor = "require-trusted-types-for",
  TrustedTypes = "trusted-types",
  UpgradeInsecureRequests = "upgrade-insecure-requests",
}
export type CSPDirectiveValue = string | DynamicCSPValueFunction;

export type CSPDirectives = Partial<
  Record<CSPDirectiveKey, Iterable<CSPDirectiveValue>>
>;

const DEFAULT_DIRECTIVES: CSPDirectives = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "child-src": ["'self'"],
  "connect-src": [
    "'self'",
    "*.googletagmanager.com",
    "*.analytics.google.com",
    "*.google-analytics.com",
    "*.crazyegg.com",
    "sentry.is.canonical.com",
    "plausible.io",
  ],
  "font-src": ["'self'", "data:", "fonts.gstatic.com", "assets.ubuntu.com"],
  "form-action": ["'self'"],
  "frame-src": [
    "'self'",
    "player.vimeo.com",
    // youtube related iframes
    "td.doubleclick.net",
    "*.youtube.com",
  ],
  "frame-ancestors": [
    "'self'",
    "player.vimeo.com",
    // youtube related iframes
    "td.doubleclick.net",
    "*.youtube.com",
  ],
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "res.cloudinary.com",
    "assets.ubuntu.com",
    // youtube related images
    "*.youtube.com",
    "i.ytimg.com",
    "yt3.ggpht.com",
  ],
  "media-src": ["'self'", "res.cloudinary.com"],
  "object-src": ["'none'"],
  "script-src-attr": ["'none'"],
  "script-src-elem": [
    "'self'",
    "blob:",
    "assets.ubuntu.com",
    "*.google.com",
    "*.googletagmanager.com",
    "*.gstatic.com",
    "*.youtube.com",
    "*.crazyegg.com",
    "plausible.io",
    "static.doubleclick.net",
  ],
  "style-src": ["'self'", "'unsafe-inline'"],
  "upgrade-insecure-requests": [],
};

const CSP_HEADER_NAME = "Content-Security-Policy";
const REPLACE_SCRIPT_VALUE = "__REPLACE_SCRIPT__";
const REPLACE_STYLE_VALUE = "__REPLACE_STYLE__";

function mergeDirectives(
  directives: CSPDirectives,
  useBaseDirectives: boolean,
): CSPDirectives {
  if (!useBaseDirectives) {
    return directives;
  }

  const result: CSPDirectives = {};
  for (const key of Object.values(CSPDirectiveKey)) {
    const defaultValue = DEFAULT_DIRECTIVES[key] || [];
    const userValue = directives[key] || [];
    const mergedValues: Set<CSPDirectiveValue> = new Set();

    for (const value of [...defaultValue, ...userValue]) {
      mergedValues.add(value);
    }

    if (mergedValues.size > 0) {
      result[key] = [...mergedValues];
    }
  }

  return result;
}

/**
 * This middleware gives the most basic type of CSP protection. It can be used both with streaming
 * and non streaming SSR.
 *
 * @remark It returns a middleware function that adds the CSP header containing common defaults for
 * Canonical web team projects.
 * It doesn't make use of nonce or hashing.
 */
export function useBaseContentSecurityPolicy(
  directives: CSPDirectives,
  useBaseDirectives = true,
): MiddlewareFunction {
  return contentSecurityPolicy({
    useDefaults: false,
    directives: mergeDirectives(directives, useBaseDirectives),
  });
}

interface PropsWithIntegrity extends PropsWithChildren {
  integrity?: string;
}

/**
 * This method doesn't return middlewares and instead it does return 2 methods to be passed
 * as preRender and postRender callbacks.
 *
 * @remark We need to be about to render the page in order to be able to retrieve the contents
 * of inline script and styles.
 *
 * The methods calculate hashes for:
 * - inline script tags
 * - inline style tags
 * - external scripts (with "src" attribute)
 * - external styles (link tag with "rel" set to "stylesheet")
 *
 * The only elements that need the "integrity" attribute are the external scripts and styles.
 * For the inline script and style tags the browser calculates the hash automatically and
 * checks if it's present in the CSP header.
 *
 * The hashes are added to the headers in the PreRenderCallback method that is returned.
 */
export function useHashContentSecurityPolicy(
  directives: CSPDirectives,
  useBaseDirectives = true,
): [MiddlewareFunction, PreRenderCallback] {
  // adds the hashes to the script and style tags and to a res.locals variable
  const preRenderFunc: PreRenderCallback = (_req, res, node) => {
    const filter = (element: ReactElement): boolean =>
      CSPElements.isScriptElement(element) ||
      CSPElements.isStyleElement(element) ||
      CSPElements.isExternalStyle(element);

    const patchMethod = (
      element: ReactElement<PropsWithIntegrity>,
      children: ReactNode | ReactNode[],
    ) => {
      // get the element string contents in the same way they will be rendered by the server
      const elementHTML = renderToString(element);
      let content: string;
      if (
        CSPElements.isScriptElement(element) &&
        !CSPElements.isExternalScript(element)
      ) {
        const matchedContent = [
          ...elementHTML.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g),
        ];
        content = matchedContent[0] ? matchedContent[0][1] : "";
      } else {
        // is style, as we filter for just these 2 elements with scriptAndStyleFilter
        const matchedContent = [
          ...elementHTML.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g),
        ];
        content = matchedContent[0] ? matchedContent[0][1] : "";
      }

      // calculate the hash of the content and add it to res.locals
      const sha256Hash = calculateHash(content);
      if (res.locals) {
        if (CSPElements.isScriptElement(element)) {
          res.locals.cspScriptHashes = res.locals.cspScriptHashes
            ? (res.locals.cspScriptHashes as string[]).push(sha256Hash)
            : [sha256Hash];
        } else {
          res.locals.cspStyleHashes = res.locals.cspStyleHashes
            ? (res.locals.cspStyleHashes as string[]).push(sha256Hash)
            : [sha256Hash];
        }
      }

      // add the integrity attribute to the element if it's an external script (has "src")
      let extraProps: PropsWithIntegrity | undefined;

      return cloneElement(element, extraProps, children);
    };

    const patchedNode = patchReactNode(
      node,
      filter,
      patchMethod,
    ) as typeof node;

    // modify the CSP header to include the hashes
    let scriptSrcElemValue = "'self' blob: 'strict-dynamic'";
    for (const hash of res.locals?.cspScriptHashes || []) {
      scriptSrcElemValue = `${scriptSrcElemValue} sha256-${hash}`;
    }
    let styleSrcValue = "'self' 'unsafe-inline' 'strict-dynamic' ";
    for (const hash of res.locals?.cspStyleHashes || []) {
      styleSrcValue = `${styleSrcValue} sha256-${hash}`;
    }

    // apply the values to the header set by the middleware
    let cspHeaderValue = res.getHeader(CSP_HEADER_NAME);
    if (typeof cspHeaderValue !== "string") {
      throw new Error("CSP header invalid - Did you apply the middleware?");
    }
    cspHeaderValue = cspHeaderValue.replace(
      REPLACE_SCRIPT_VALUE,
      scriptSrcElemValue,
    );
    cspHeaderValue = cspHeaderValue.replace(REPLACE_STYLE_VALUE, styleSrcValue);
    res.setHeader(CSP_HEADER_NAME, cspHeaderValue);

    return patchedNode;
  };

  const calculatedDirectives = mergeDirectives(directives, useBaseDirectives);
  calculatedDirectives["script-src-elem"] = REPLACE_SCRIPT_VALUE;
  calculatedDirectives["style-src"] = REPLACE_STYLE_VALUE;
  const cspMiddleware = contentSecurityPolicy({
    useDefaults: false,
    directives: calculatedDirectives,
  });

  return [cspMiddleware, preRenderFunc];
}

interface PropsWithNonce extends PropsWithChildren {
  nonce?: string;
}

/**
 * This middleware be used only with Streaming SSR and without any caching. Otherwise it doesn't
 * give as much protection.
 *
 * @remark It provides the middleware functions that take care of generating a nonce value and
 * adding it to the CSP header. The nonce is created and added to `res.locals`.
 *
 * It also gives a PreRenderCallback function to be passed to the Renderer so that it automatically
 * adds the "nonce" attribute to all <script> and <style> tags.
 */
export function useNonceContentSecurityPolicy(
  directives: CSPDirectives,
  useBaseDirectives = true,
): [MiddlewareFunction[], PreRenderCallback] {
  // sets the nonce value created for the request in res.locals object
  const calculateNonceMiddleware = (
    _req: IncomingMessage,
    res: LocalServerResponse,
    next: (error?: Error) => void,
  ) => {
    if (res.locals) {
      res.locals.cspNonce = calculateNonce();
    }
    next();
  };

  // adds the nonce value to the script and style tags when the rendering is finished
  const preRenderFunc: PreRenderCallback = (_req, res, node) => {
    const scriptAndStyleFilter = (element: ReactElement): boolean =>
      CSPElements.isScriptElement(element) ||
      CSPElements.isStyleElement(element);
    // closure for nonce
    const nonce = (res.locals?.cspNonce as string) || "";
    const patchMethod = (
      element: ReactElement<PropsWithNonce>,
      children: ReactNode | ReactNode[],
    ) => {
      return cloneElement(element, { nonce }, children);
    };

    return patchReactNode(
      node,
      scriptAndStyleFilter,
      patchMethod,
    ) as typeof node;
  };

  // adds the appropriate headers to the response
  const calculatedDirectives = mergeDirectives(directives, useBaseDirectives);
  calculatedDirectives["script-src-elem"] = [
    "'self'",
    "blob:",
    (_req: IncomingMessage, res: LocalServerResponse) =>
      `'nonce-${res.locals?.cspNonce || ""}'`,
    "'strict-dynamic'",
  ];
  calculatedDirectives["style-src"] = [
    "'self'",
    (_req: IncomingMessage, res: LocalServerResponse) =>
      `'nonce-${res.locals?.cspNonce || ""}'`,
    "'unsafe-inline",
  ];
  const cspMiddleware = contentSecurityPolicy({
    useDefaults: false,
    directives: calculatedDirectives,
  });

  return [[calculateNonceMiddleware, cspMiddleware], preRenderFunc];
}

namespace CSPElements {
  export type ScriptElement = ReactElement<
    ScriptHTMLAttributes<HTMLScriptElement>
  >;
  export type StyleElement = ReactElement<
    StyleHTMLAttributes<HTMLStyleElement>
  >;
  export type LinkElement = ReactElement<LinkHTMLAttributes<HTMLLinkElement>>;

  export const isScriptElement = (
    element: ReactElement,
  ): element is ScriptElement =>
    typeof element.type === "string" && element.type.toLowerCase() === "script";

  export const isStyleElement = (
    element: ReactElement,
  ): element is StyleElement =>
    typeof element.type === "string" && element.type.toLowerCase() === "style";

  export const isLinkElement = (
    element: ReactElement,
  ): element is LinkElement =>
    typeof element.type === "string" && element.type.toLowerCase() === "link";

  export const isExternalScript = (element: ReactElement): boolean =>
    isScriptElement(element) && !!element.props.src;

  export const isExternalStyle = (element: ReactElement): boolean =>
    isLinkElement(element) &&
    element.props.rel === "stylesheet" &&
    !!element.props.href;
}
