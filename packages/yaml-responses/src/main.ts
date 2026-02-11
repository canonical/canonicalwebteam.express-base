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

      if (!matches) continue;

      const redirectUrl = req.path.replace(r, replacements);
      return res.redirect(permanent ? 301 : 302, redirectUrl);
    }

    next();
  };

  return middleware;
};
