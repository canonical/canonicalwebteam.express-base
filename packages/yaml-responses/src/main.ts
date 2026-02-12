import type { RequestHandler } from "express";
import { load } from "js-yaml";

export const yamlRedirects = (
  yaml: string,
  permanent = false,
): RequestHandler => {
  const redirectsMap = load(yaml) as Record<string, string>;

  const middleware: RequestHandler = (req, res, next) => {
    for (const [regexStr, replacements] of Object.entries(redirectsMap)) {
      const r = RegExp(regexStr);
      const matches = req.path.match(r);

      if (matches) {
        const redirectUrl = req.path.replace(r, replacements);
        return res.redirect(permanent ? 301 : 302, redirectUrl);
      }
    }

    next();
  };

  return middleware;
};

export const yamlDeleted = (yaml: string): RequestHandler => {
  const deletedMap = load(yaml) as Record<string, string>;
  const deletedRegex = Object.keys(deletedMap);

  const middleware: RequestHandler = (req, res, next) => {
    for (const regexStr of deletedRegex) {
      const r = RegExp(regexStr);

      // TODO: what do we render here?
      if (req.path.match(r)) return res.sendStatus(410);
    }

    next();
  };

  return middleware;
};
