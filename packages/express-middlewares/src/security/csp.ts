import { contentSecurityPolicy } from "helmet";
import type { DynamicCSPValueFunction, MiddlewareFunction } from "types";

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
export function useBaseContentSecurityPolicy(
  directives: CSPDirectives,
  useBaseDirectives = true,
): MiddlewareFunction {
  return contentSecurityPolicy({
    useDefaults: false,
    directives: mergeDirectives(directives, useBaseDirectives),
  });
}

/**
 * This method returns a middleware that sets the CSP header with an entrypoint to be replaced
 * with the hashes later on (at this point we still can't compute the hashes).
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
 *
export function useHashContentSecurityPolicy(
  directives: CSPDirectives,
  useBaseDirectives = true,
): [MiddlewareFunction, PreRenderCallback] {
*/
