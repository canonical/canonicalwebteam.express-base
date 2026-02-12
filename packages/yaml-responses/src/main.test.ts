import type { RequestHandler } from "express";
import { describe, expect, test, vi } from "vitest";
import { yamlDeleted, yamlRedirects } from "./main.js";

type ExpressReq = Parameters<RequestHandler>[0];
type ExpressRes = Parameters<RequestHandler>[1];
type ExpressNext = Parameters<RequestHandler>[2];

function reqHandlerParamMockFactory(): Parameters<RequestHandler> {
  const req = {
    path: "/mock-path",
  } as ExpressReq;
  const res = {
    sendStatus: vi.fn((_: number) => {}),
    redirect: vi.fn((_: number | string, __?: string) => {}),
  } as unknown as ExpressRes;
  const next = vi.fn((_: any) => {}) as ExpressNext;

  return [req, res, next];
}

const YAML = {
  NO_MATCH: `
regex_that_doesnt_match_anything: redirect-path
`,
  MATCH: `
^/mock-path$: /redirect-path
`,
  REGEX_MATCH: `
^/mock-.+$: /redirect-path
`,
  REGEX_MATCH_WITH_CAPTURE: `
^/mock-(.+)$: /redirect-$1
`,
  REGEX_MATCH_WITH_NAMED_CAPTURE: `
^/mock-(?<capture>.+)$: /redirect-$<capture>
`,
};

describe("yamlRedirects", () => {
  test("is an express middleware", () => {
    expect(yamlRedirects("")).toBeInstanceOf(Function);
  });

  test("doesn't redirect without a valid config", () => {
    const middleware = yamlRedirects("");
    const [req, res, next] = reqHandlerParamMockFactory();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("doesn't redirect without a match", () => {
    const middleware = yamlRedirects(YAML.NO_MATCH);
    const [req, res, next] = reqHandlerParamMockFactory();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("redirects when it finds a match", () => {
    const middleware = yamlRedirects(YAML.MATCH);
    const [req, res, next] = reqHandlerParamMockFactory();
    middleware(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(302, "/redirect-path");
  });

  test("redirects when it finds a regex match", () => {
    const middleware = yamlRedirects(YAML.REGEX_MATCH);
    const [req, res, next] = reqHandlerParamMockFactory();
    middleware(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(302, "/redirect-path");
  });

  test("redirects when it finds a regex match with capture group", () => {
    const middleware = yamlRedirects(YAML.REGEX_MATCH_WITH_CAPTURE);
    const [req, res, next] = reqHandlerParamMockFactory();
    middleware(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(302, "/redirect-path");
  });

  test("redirects when it finds a regex match with named capture group", () => {
    const middleware = yamlRedirects(YAML.REGEX_MATCH_WITH_NAMED_CAPTURE);
    const [req, res, next] = reqHandlerParamMockFactory();
    middleware(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(302, "/redirect-path");
  });

  test("sends permanent redirect when configured to do so", () => {
    const middleware = yamlRedirects(YAML.MATCH, true);
    const [req, res, next] = reqHandlerParamMockFactory();
    middleware(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(301, "/redirect-path");
  });
});

describe("yamlDeleted", () => {
  test("is an express middleware", () => {
    expect(yamlDeleted("")).toBeInstanceOf(Function);
  });

  test("doesn't delete without a valid config", () => {
    const middleware = yamlDeleted("");
    const [req, res, next] = reqHandlerParamMockFactory();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("doesn't delete without a match", () => {
    const middleware = yamlDeleted(YAML.NO_MATCH);
    const [req, res, next] = reqHandlerParamMockFactory();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("deletes when it finds a match", () => {
    const middleware = yamlDeleted(YAML.MATCH);
    const [req, res, next] = reqHandlerParamMockFactory();
    middleware(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(410);
  });

  test("deletes when it finds a regex match", () => {
    const middleware = yamlDeleted(YAML.REGEX_MATCH);
    const [req, res, next] = reqHandlerParamMockFactory();
    middleware(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(410);
  });

  test("deletes when it finds a regex match with capture group", () => {
    const middleware = yamlDeleted(YAML.REGEX_MATCH_WITH_CAPTURE);
    const [req, res, next] = reqHandlerParamMockFactory();
    middleware(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(410);
  });

  test("deletes when it finds a regex match with named capture group", () => {
    const middleware = yamlDeleted(YAML.REGEX_MATCH_WITH_NAMED_CAPTURE);
    const [req, res, next] = reqHandlerParamMockFactory();
    middleware(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(410);
  });
});
