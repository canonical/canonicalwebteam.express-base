import type { IncomingMessage } from "node:http";
import { contentSecurityPolicy } from "helmet";
import { integrityRendererFactory, nonceRendererFactory } from "../renderer";
import type {
  DynamicCSPValueFunction,
  LocalServerResponse,
  MiddlewareFunction,
} from "../types";
import { generateNonce } from "./utils";

export const REPLACE_SCRIPT_VALUE = "__REPLACE_SCRIPT__";
export const REPLACE_STYLE_VALUE = "__REPLACE_STYLE__";

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
export function baseContentSecurityPolicy(
  directives: CSPDirectives,
  useBaseDirectives = true,
): MiddlewareFunction {
  return contentSecurityPolicy({
    useDefaults: false,
    directives: mergeDirectives(directives, useBaseDirectives),
  });
}

/**
 * This method provides the middleware functions and renderer appropriate to implementing
 * hash integrity for the CSP header.
 */
export function hashContentSecurityPolicy(
  directives: CSPDirectives,
  useBaseDirectives = true,
  port = 80,
): MiddlewareFunction[] {
  const calculatedDirectives = mergeDirectives(directives, useBaseDirectives);
  calculatedDirectives["script-src-elem"] = [
    "'self'",
    "blob:",
    `${REPLACE_SCRIPT_VALUE}`,
    "'strict-dynamic'",
  ];
  calculatedDirectives["style-src"] = ["'self'", `${REPLACE_STYLE_VALUE}`];
  const cspMiddleware = contentSecurityPolicy({
    useDefaults: false,
    directives: calculatedDirectives,
  });

  return [cspMiddleware, integrityRendererFactory(port)];
}

/**
 * It provides the middleware function that take care of generating a nonce value and adding it to the CSP header.
 * It also returns a JSXRenderer object that should be used to render the page to take advantage of
 * automatically getting the "nonce" attribute in all <script> and <style> tags of the template HTML and
 * having a Provider wrapping the whole application that gives the 'nonce' value to any component that
 * needs it.
 *
 * @remark This method should be used for non cached pages. Otherwise, if the nonces are reused it doesn't
 * give as much protection.
 */
export function nonceContentSecurityPolicy(
  directives: CSPDirectives,
  useBaseDirectives = true,
): MiddlewareFunction[] {
  const calculatedDirectives = mergeDirectives(directives, useBaseDirectives);
  calculatedDirectives["script-src-elem"] = [
    "'self'",
    "blob:",
    (_req: IncomingMessage, res: LocalServerResponse) =>
      `'nonce-${res.locals?.nonce || ""}'`,
    "'strict-dynamic'",
  ];
  calculatedDirectives["style-src"] = [
    "'self'",
    (_req: IncomingMessage, res: LocalServerResponse) =>
      `'nonce-${res.locals?.nonce || ""}'`,
  ];
  const cspMiddleware = contentSecurityPolicy({
    useDefaults: false,
    directives: calculatedDirectives,
  });
  return [calculateNonceMiddleware(), cspMiddleware, nonceRendererFactory()];
}

export function calculateNonceMiddleware() {
  return (
    _req: IncomingMessage,
    res: LocalServerResponse,
    next: (error?: Error) => void,
  ) => {
    if (res.locals) {
      res.locals.nonce = generateNonce();
    }
    next();
  };
}
