import type { RequestHandler } from "express";
import { load } from "js-yaml";

export const yamlRedirects = (
  yaml: string,
  permanent = false,
): RequestHandler => {
  const redirectsMap = (load(yaml ?? "") ?? {}) as Record<string, string>;

  const middleware: RequestHandler = (req, res, next) => {
    for (const [regexStr, redirectStr] of Object.entries(redirectsMap)) {
      const r = RegExp(regexStr);
      const matches = req.path.match(r);

      if (matches) {
        const redirectUrl = req.path.replace(r, redirectStr);
        return res.redirect(permanent ? 301 : 302, redirectUrl);
      }
    }

    next();
  };

  return middleware;
};

export class HttpGoneError extends Error {
  constructor() {
    super("410 Gone");
  }
}

export const yamlDeleted = (yaml: string): RequestHandler => {
  const deletedMap = (load(yaml ?? "") ?? {}) as Record<string, string>;
  const deletedRegex = Object.keys(deletedMap);

  const middleware: RequestHandler = (req, _, next) => {
    for (const regexStr of deletedRegex) {
      const r = RegExp(regexStr);

      if (req.path.match(r)) {
        return next(new HttpGoneError());
      }
    }

    next();
  };

  return middleware;
};
