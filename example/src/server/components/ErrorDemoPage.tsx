function Section({
  title,
  code,
  links,
  note,
}: {
  title: string;
  code?: string;
  links?: { href: string; label: string; note?: string }[];
  note?: string;
}) {
  return (
    <>
      <h2>{title}</h2>
      {code && (
        <pre
          style={{
            background: "#f6f6f6",
            padding: "0.75rem",
            overflowX: "auto",
            fontSize: "0.82rem",
            lineHeight: 1.45,
            margin: "0.5rem 0 1rem",
            borderLeft: "3px solid #ddd",
          }}
        >
          {code}
        </pre>
      )}
      {links && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {links.map((link) => (
            <li key={link.href} style={{ marginBottom: "0.25rem" }}>
              <a href={link.href}>{link.label}</a>
              {link.note && <> — {link.note}</>}
            </li>
          ))}
        </ul>
      )}
      {note && <p>{note}</p>}
    </>
  );
}

export function ErrorDemoPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Error Handling Demo</title>
      </head>
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          maxWidth: 700,
          margin: "2rem auto",
          padding: "0 1rem",
          color: "#333",
        }}
      >
        <h1 style={{ fontWeight: 500 }}>Error Handling Demo</h1>
        <p>
          Routes for testing <code>@canonical/express-base</code> error
          handling.
        </p>

        <Section
          title="Throwing errors"
          code={`import { BadRequestError, NotFoundError } from "@canonical/express-base";

// Simple error
app.get("/users/:id", () => {
  throw new NotFoundError("User not found");
});

// With details payload
app.get("/users/:id", () => {
  throw new BadRequestError("Invalid ID", { field: "id" });
});

// Works with async too — Express 5 catches it
app.get("/data", async () => {
  const result = await fetchFromDB();
  if (!result) throw new NotFoundError("Not found");
});`}
          links={[
            {
              href: "/api/error/bad-request",
              label: "400 Bad Request",
              note: "with details payload",
            },
            { href: "/api/error/unauthorized", label: "401 Unauthorized" },
            { href: "/api/error/forbidden", label: "403 Forbidden" },
            { href: "/api/error/not-found", label: "404 Not Found" },
            {
              href: "/api/error/internal",
              label: "500 Internal Server Error",
            },
            {
              href: "/api/error/unavailable",
              label: "503 Service Unavailable",
            },
            {
              href: "/api/error/generic",
              label: "500 Generic Error",
              note: "plain throw new Error()",
            },
            { href: "/api/error/async", label: "Async error" },
          ]}
        />

        <Section
          title="404 catch-all handler"
          code={`import { notFoundHandler } from "@canonical/express-base";

// After all routes, before errorHandler
app.use(notFoundHandler());`}
          links={[
            {
              href: "/does-not-exist",
              label: "404 catch-all",
              note: "unmatched route",
            },
          ]}
        />

        <Section
          title="Error handler with onError hook"
          code={`import { errorHandler } from "@canonical/express-base";

app.use(errorHandler({
  onError: (error, req, res, statusCode) => {
    // Log, send to Sentry, etc.
    console.error(statusCode, req.method, req.url, error);
  },
}));`}
          note="Check your terminal — every error link above logs via onError."
        />

        <Section
          title="Prod mode (isDev: false)"
          code={`app.use(errorHandler({ isDev: false }));
// 4xx: shows error message
// 5xx: hides message, shows "Internal Server Error"
// No stack traces or request details`}
          links={[
            { href: "/errors/prod/bad-request", label: "400 Bad Request" },
            { href: "/errors/prod/not-found", label: "404 Not Found" },
            {
              href: "/errors/prod/internal",
              label: "500 Internal Server Error",
              note: "message hidden",
            },
            {
              href: "/errors/prod/unavailable",
              label: "503 Service Unavailable",
              note: "message hidden",
            },
          ]}
        />

        <Section
          title="Custom React component (errorComponent)"
          code={`import { errorHandler } from "@canonical/express-base";
import type { ErrorPageContext } from "@canonical/express-base";

function MyErrorPage({ statusCode, statusMessage, errorMessage }: ErrorPageContext) {
  return (
    <html>
      <body>
        <h1>{statusCode} - {statusMessage}</h1>
        <p>{errorMessage}</p>
      </body>
    </html>
  );
}

app.use(errorHandler({ errorComponent: MyErrorPage }));`}
          links={[
            { href: "/errors/custom/bad-request", label: "400 Bad Request" },
            { href: "/errors/custom/not-found", label: "404 Not Found" },
            {
              href: "/errors/custom/internal",
              label: "500 Internal Server Error",
            },
          ]}
        />
      </body>
    </html>
  );
}
