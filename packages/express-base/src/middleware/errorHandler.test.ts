import { createServer, type Server } from "node:http";
import express from "express";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../errors/index.js";
import { errorHandler } from "./errorHandler.js";

function createTestApp(isDev: boolean) {
  const app = express();

  app.get("/test-404", () => {
    throw new NotFoundError("Resource not found");
  });

  app.get("/test-500", () => {
    throw new InternalServerError("Database error");
  });

  app.get("/test-400", () => {
    throw new BadRequestError("Invalid request", { field: "email" });
  });

  app.get("/test-generic", () => {
    throw new Error("Generic error");
  });

  app.use(errorHandler({ isDev }));

  return app;
}

function listen(
  app: express.Express,
): Promise<{ server: Server; url: string }> {
  return new Promise((resolve) => {
    const server = createServer(app);
    server.listen(0, () => {
      const addr = server.address() as { port: number };
      resolve({ server, url: `http://127.0.0.1:${addr.port}` });
    });
  });
}

describe("errorHandler", () => {
  describe("development mode", () => {
    let server: Server;
    let url: string;

    beforeAll(async () => {
      ({ server, url } = await listen(createTestApp(true)));
    });
    afterAll(() => server.close());

    it("should return HTML error page for HTML requests", async () => {
      const res = await fetch(`${url}/test-404`, {
        headers: { Accept: "text/html" },
      });

      expect(res.status).toBe(404);
      expect(res.headers.get("content-type")).toContain("text/html");
      const text = await res.text();
      expect(text).toContain("404");
      expect(text).toContain("Resource not found");
      expect(text).toContain("NotFoundError");
      expect(text).toContain("Stack Trace");
    });

    it("should return JSON error for JSON requests", async () => {
      const res = await fetch(`${url}/test-404`, {
        headers: { Accept: "application/json" },
      });

      expect(res.status).toBe(404);
      expect(res.headers.get("content-type")).toContain("json");
      const body = await res.json();
      expect(body).toEqual({
        error: {
          statusCode: 404,
          message: "Resource not found",
        },
      });
    });

    it("should include error details in dev JSON response", async () => {
      const res = await fetch(`${url}/test-400`, {
        headers: { Accept: "application/json" },
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error.details).toEqual({ field: "email" });
    });

    it("should show actual server error message in dev mode", async () => {
      const res = await fetch(`${url}/test-500`, {
        headers: { Accept: "application/json" },
      });

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error.message).toBe("Database error");
    });

    it("should handle generic (non-HttpError) errors as 500", async () => {
      const res = await fetch(`${url}/test-generic`, {
        headers: { Accept: "application/json" },
      });

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error.message).toBe("Generic error");
    });

    it("should include request details in dev HTML page", async () => {
      const res = await fetch(`${url}/test-404`, {
        headers: { Accept: "text/html" },
      });

      const text = await res.text();
      expect(text).toContain("Request Details");
      expect(text).toContain("GET");
      expect(text).toContain("/test-404");
    });
  });

  describe("production mode", () => {
    let server: Server;
    let url: string;

    beforeAll(async () => {
      ({ server, url } = await listen(createTestApp(false)));
    });
    afterAll(() => server.close());

    it("should return minimal HTML error page", async () => {
      const res = await fetch(`${url}/test-404`, {
        headers: { Accept: "text/html" },
      });

      expect(res.status).toBe(404);
      const text = await res.text();
      expect(text).toContain("404");
      expect(text).not.toContain("Stack Trace");
      expect(text).not.toContain("Request Details");
    });

    it("should hide server error details in production JSON", async () => {
      const res = await fetch(`${url}/test-500`, {
        headers: { Accept: "application/json" },
      });

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error.message).toBe("Internal Server Error");
      expect(body.error.details).toBeUndefined();
    });

    it("should show client error messages in production", async () => {
      const res = await fetch(`${url}/test-400`, {
        headers: { Accept: "application/json" },
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error.message).toBe("Invalid request");
    });

    it("should hide generic error details in production", async () => {
      const res = await fetch(`${url}/test-generic`, {
        headers: { Accept: "application/json" },
      });

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error.message).toBe("Internal Server Error");
    });
  });

  describe("onError hook", () => {
    it("should call onError hook with correct arguments", async () => {
      const onError = vi.fn();
      const app = express();

      app.get("/test", () => {
        throw new NotFoundError("Test error");
      });

      app.use(errorHandler({ isDev: true, onError }));

      const { server, url } = await listen(app);
      await fetch(`${url}/test`, {
        headers: { Accept: "application/json" },
      });
      server.close();

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.any(NotFoundError),
        expect.any(Object),
        expect.any(Object),
        404,
      );
    });

    it("should still send response if onError hook throws", async () => {
      const onError = vi.fn(() => {
        throw new Error("Hook error");
      });
      const app = express();

      app.get("/test", () => {
        throw new NotFoundError("Test error");
      });

      app.use(errorHandler({ isDev: true, onError }));

      const { server, url } = await listen(app);
      const res = await fetch(`${url}/test`, {
        headers: { Accept: "application/json" },
      });
      server.close();

      expect(res.status).toBe(404);
      expect(onError).toHaveBeenCalled();
    });
  });

  describe("content negotiation", () => {
    let server: Server;
    let url: string;

    beforeAll(async () => {
      ({ server, url } = await listen(createTestApp(true)));
    });
    afterAll(() => server.close());

    it("should prefer HTML when both are accepted", async () => {
      const res = await fetch(`${url}/test-404`, {
        headers: { Accept: "text/html, application/json" },
      });

      expect(res.headers.get("content-type")).toContain("text/html");
    });

    it("should return HTML for browser-like Accept header", async () => {
      const res = await fetch(`${url}/test-404`, {
        headers: { Accept: "text/html,application/xhtml+xml,*/*;q=0.8" },
      });

      expect(res.headers.get("content-type")).toContain("text/html");
    });

    it("should return JSON when only JSON is accepted", async () => {
      const res = await fetch(`${url}/test-404`, {
        headers: { Accept: "application/json" },
      });

      expect(res.headers.get("content-type")).toContain("json");
    });
  });

  describe("custom templates", () => {
    it("should use custom prod template when provided", async () => {
      const prodTemplate = vi.fn(() => "<html>Custom Prod</html>");
      const app = express();

      app.get("/test", () => {
        throw new NotFoundError();
      });

      app.use(errorHandler({ isDev: false, prodTemplate }));

      const { server, url } = await listen(app);
      const res = await fetch(`${url}/test`, {
        headers: { Accept: "text/html" },
      });
      server.close();

      const text = await res.text();
      expect(text).toContain("Custom Prod");
      expect(prodTemplate).toHaveBeenCalled();
    });
  });
});
