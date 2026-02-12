import { createServer, type Server } from "node:http";
import express from "express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { errorHandler } from "./errorHandler.js";
import { notFoundHandler } from "./notFoundHandler.js";

describe("notFoundHandler", () => {
  let server: Server;
  let url: string;

  beforeAll(async () => {
    const app = express();

    app.get("/existing-route", (_req, res) => {
      res.json({ message: "Success" });
    });

    app.use(notFoundHandler());
    app.use(errorHandler({ isDev: true }));

    await new Promise<void>((resolve) => {
      server = createServer(app);
      server.listen(0, () => {
        const addr = server.address() as { port: number };
        url = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(() => server.close());

  it("should allow existing routes to work", async () => {
    const res = await fetch(`${url}/existing-route`);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("Success");
  });

  it("should return 404 for non-existent routes", async () => {
    const res = await fetch(`${url}/non-existent`, {
      headers: { Accept: "application/json" },
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.message).toContain("Cannot GET /non-existent");
  });

  it("should include method and URL in error message", async () => {
    const res = await fetch(`${url}/api/users`, {
      method: "POST",
      headers: { Accept: "application/json" },
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.message).toContain("Cannot POST /api/users");
  });

  it("should return HTML for browser requests", async () => {
    const res = await fetch(`${url}/missing-page`, {
      headers: { Accept: "text/html" },
    });

    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain("text/html");
    const text = await res.text();
    expect(text).toContain("404");
  });
});
