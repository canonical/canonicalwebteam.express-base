import type { ErrorPageContext } from "../middleware/types.js";

const styles = {
  body: {
    margin: 0,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    background: "#f5f5f5",
    color: "#333",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "2rem",
  },
  container: {
    background: "white",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    padding: "3rem",
    maxWidth: 600,
    textAlign: "center" as const,
  },
  statusCode: {
    fontSize: "4rem",
    fontWeight: "bold" as const,
    color: "#e74c3c",
    marginBottom: "1rem",
  },
  statusMessage: {
    fontSize: "1.5rem",
    color: "#555",
    marginBottom: "1rem",
  },
  divider: {
    height: 1,
    background: "#e0e0e0",
    margin: "2rem 0",
  },
  errorMessage: {
    fontSize: "1rem",
    color: "#666",
    lineHeight: 1.6,
  },
  helpText: {
    fontSize: "0.875rem",
    color: "#999",
  },
};

export function ProdErrorPage({
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
      <body style={styles.body}>
        <div style={styles.container}>
          <div style={styles.statusCode}>{statusCode}</div>
          <div style={styles.statusMessage}>{statusMessage}</div>
          <div style={styles.divider} />
          <div style={styles.errorMessage}>{errorMessage}</div>
          <div style={styles.divider} />
          <div style={styles.helpText}>
            If this problem persists, please contact support.
          </div>
        </div>
      </body>
    </html>
  );
}
