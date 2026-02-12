import crypto from "node:crypto";
import type { IncomingMessage } from "node:http";

import { contentSecurityPolicy } from "helmet";
import {
  cloneElement,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
} from "react";
import type {
  DynamicCSPValueFunction,
  LocalServerResponse,
  MiddlewareFunction,
  PostRenderCallback,
  PreRenderCallback,
} from "types";
import { IS_PRODUCTION, patchReactNode } from "utils";

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

export function useBaseContentSecurityPolicy(
  directives: CSPDirectives,
  useBaseDirectives = true,
  reportOnly = false,
): MiddlewareFunction {
  // if development mode we don't set any security headers
  if (IS_PRODUCTION) {
    return contentSecurityPolicy({
      useDefaults: false,
      directives: mergeDirectives(directives, useBaseDirectives),
      reportOnly: reportOnly,
    });
  }
  return (_req, _res, next) => next();
}

export function useHashContentSecurityPolicy(): [
  MiddlewareFunction,
  PostRenderCallback,
] {
  // if development mode we don't set any security headers
  if (IS_PRODUCTION) {
    //
  }
  return [(_req, _res, next) => next(), (_req, _res) => {}];
}

interface PropsWithNonce extends PropsWithChildren {
  nonce?: string;
}

/**
 * To be used only with Streaming SSR and without any caching. Otherwise it doesn't
 * give as much protection.
 *
 * @returns A middleware to be used for all routes in which the nonce is created and
 * added to `res.locals`. A post render callback to be passed to the Renderer which will
 * set the `nonce` attribute in script and style tags.
 */
export function useNonceContentSecurityPolicy(
  directives: CSPDirectives,
  useBaseDirectives = true,
  reportOnly = false,
): [MiddlewareFunction[], PreRenderCallback] {
  // if development mode we don't set any security headers
  if (IS_PRODUCTION) {
    // sets the nonce value created for the request in res.locals object
    const middlewareFunc = (
      _req: IncomingMessage,
      res: LocalServerResponse,
      next: (error?: Error) => void,
    ) => {
      if (res.locals) {
        res.locals.cspNonce = crypto.randomBytes(32).toString("hex") as string;
      }
      next();
    };

    // adds the nonce value to the script and style tags when the rendering is finished
    const preRenderFunc: PreRenderCallback = (_req, res, node) => {
      const patchFilter = (element: ReactElement<PropsWithChildren>) => {
        if (element.type === "string") {
          const tag = element.type.toLowerCase();
          if (tag === "script" || tag === "style") {
            return true;
          }
        }
        return false;
      };

      // closure for nonce
      const nonce = (res.locals?.cspNonce as string) || "";
      const patchMethod = (
        element: ReactElement<PropsWithNonce>,
        children: ReactNode | ReactNode[],
      ) => {
        return cloneElement(element, { nonce }, children);
      };

      return patchReactNode(node, patchFilter, patchMethod) as typeof node;
    };

    // adds the appropriate headers to the response
    const calculatedDirectives = mergeDirectives(directives, useBaseDirectives);
    calculatedDirectives["script-src-elem"] = [
      "'self'",
      "blob:",
      (_req: IncomingMessage, res: LocalServerResponse) =>
        `'nonce-${res.locals?.cspNonce || ""}'`,
    ];
    const cspMiddleware = contentSecurityPolicy({
      useDefaults: false,
      directives: calculatedDirectives,
      reportOnly: reportOnly,
    });

    return [[middlewareFunc, cspMiddleware], preRenderFunc];
  }
  return [[(_req, _res, next) => next()], (_req, _res, node) => node];
}
