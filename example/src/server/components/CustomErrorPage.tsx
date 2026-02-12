import type { ErrorPageContext } from "@canonical/express-base";

export function CustomErrorPage({
  statusCode,
  statusMessage,
  errorMessage,
}: ErrorPageContext) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{`${statusCode} - ${statusMessage}`}</title>
      </head>
      <body
        style={{
          fontFamily: "Ubuntu, system-ui, sans-serif",
          margin: "4rem auto",
          maxWidth: 480,
          padding: "0 1rem",
        }}
      >
        <p style={{ color: "#e95420", fontSize: "0.85rem", fontWeight: 600 }}>
          {statusCode}
        </p>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 500,
            margin: "0.25rem 0 1rem",
          }}
        >
          {statusMessage}
        </h1>
        <p style={{ color: "#555" }}>{errorMessage}</p>
        <hr
          style={{
            border: "none",
            borderTop: "1px solid #ddd",
            margin: "1.5rem 0",
          }}
        />
        <p style={{ fontSize: "0.85rem" }}>
          <a href="/errors">Back to error demo</a>
        </p>
      </body>
    </html>
  );
}
