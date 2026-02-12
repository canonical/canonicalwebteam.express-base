import type { ErrorPageContext } from "../middleware/types.js";
import { formatJson } from "./utils.js";

const styles = {
  body: {
    margin: 0,
    boxSizing: "border-box" as const,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    background: "#1a1a1a",
    color: "#e0e0e0",
    lineHeight: 1.6,
    padding: "2rem",
  },
  container: { maxWidth: 1200, margin: "0 auto" },
  header: {
    borderBottom: "2px solid #e74c3c",
    paddingBottom: "1rem",
    marginBottom: "2rem",
  },
  statusCode: {
    fontSize: "3rem",
    fontWeight: "bold" as const,
    color: "#e74c3c",
  },
  statusMessage: { fontSize: "1.5rem", color: "#bdc3c7", marginTop: "0.5rem" },
  section: {
    background: "#2a2a2a",
    borderRadius: 8,
    padding: "1.5rem",
    marginBottom: "1.5rem",
    border: "1px solid #3a3a3a",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#61afef",
    marginBottom: "1rem",
  },
  errorName: { color: "#e74c3c", fontWeight: 600 },
  errorMessage: { color: "#e0e0e0", fontSize: "1.1rem", marginTop: "0.5rem" },
  pre: {
    background: "#1a1a1a",
    border: "1px solid #3a3a3a",
    borderRadius: 4,
    padding: "1rem",
    overflowX: "auto" as const,
    fontFamily: '"Monaco", "Menlo", "Consolas", monospace',
    fontSize: "0.875rem",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-all" as const,
  },
  requestDetails: {
    background: "#1a1a1a",
    border: "1px solid #3a3a3a",
    borderRadius: 4,
    padding: "1rem",
    overflowX: "auto" as const,
    fontFamily: '"Monaco", "Menlo", "Consolas", monospace',
    fontSize: "0.875rem",
  },
  detailRow: {
    display: "grid",
    gridTemplateColumns: "150px 1fr",
    gap: "1rem",
    marginBottom: "0.75rem",
    paddingBottom: "0.75rem",
    borderBottom: "1px solid #3a3a3a",
  },
  detailRowLast: {
    display: "grid",
    gridTemplateColumns: "150px 1fr",
    gap: "1rem",
  },
  detailLabel: { color: "#61afef", fontWeight: 600 },
  detailValue: { color: "#98c379", wordBreak: "break-word" as const },
  preFormatted: {
    color: "#98c379",
    wordBreak: "break-word" as const,
    whiteSpace: "pre-wrap" as const,
  },
  highlight: { color: "#61afef" },
};

function StackTrace({ stack }: { stack: string }) {
  const lines = stack.split("\n");
  return (
    <pre style={styles.pre}>
      {lines.map((line, i) => {
        const key = `${i}-${line.slice(0, 40)}`;
        const match = line.match(/^(.*?)(\(.*?:\d+:\d+\))(.*)$/);
        if (match) {
          return (
            <span key={key}>
              {match[1]}
              <span style={styles.highlight}>{match[2]}</span>
              {match[3]}
              {"\n"}
            </span>
          );
        }
        return (
          <span key={key}>
            {line}
            {i < lines.length - 1 ? "\n" : ""}
          </span>
        );
      })}
    </pre>
  );
}

function DetailRow({
  label,
  value,
  isLast,
  preFormatted,
}: {
  label: string;
  value: string;
  isLast?: boolean;
  preFormatted?: boolean;
}) {
  return (
    <div style={isLast ? styles.detailRowLast : styles.detailRow}>
      <div style={styles.detailLabel}>{label}</div>
      <div style={preFormatted ? styles.preFormatted : styles.detailValue}>
        {value}
      </div>
    </div>
  );
}

export function DevErrorPage({
  statusCode,
  statusMessage,
  errorName,
  errorMessage,
  details,
  stack,
  requestDetails,
}: ErrorPageContext) {
  const hasQuery = Boolean(
    requestDetails?.query &&
      Object.keys(requestDetails.query as object).length > 0,
  );
  const hasBody = Boolean(
    requestDetails?.body &&
      Object.keys(requestDetails.body as object).length > 0,
  );

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{`${statusCode} - ${statusMessage}`}</title>
      </head>
      <body style={styles.body}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.statusCode}>{statusCode}</div>
            <div style={styles.statusMessage}>{statusMessage}</div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionTitle}>Error Details</div>
            <div style={styles.errorName}>{errorName}</div>
            <div style={styles.errorMessage}>{errorMessage}</div>
          </div>

          {details !== undefined && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Error Details Payload</div>
              <pre style={styles.pre}>{formatJson(details)}</pre>
            </div>
          )}

          {stack && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Stack Trace</div>
              <StackTrace stack={stack} />
            </div>
          )}

          {requestDetails && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Request Details</div>
              <div style={styles.requestDetails}>
                <DetailRow label="Method" value={requestDetails.method} />
                <DetailRow label="URL" value={requestDetails.url} />
                <DetailRow
                  label="Headers"
                  value={formatJson(requestDetails.headers)}
                  preFormatted
                  isLast={!hasQuery && !hasBody}
                />
                {hasQuery && (
                  <DetailRow
                    label="Query"
                    value={formatJson(requestDetails.query)}
                    preFormatted
                    isLast={!hasBody}
                  />
                )}
                {hasBody && (
                  <DetailRow
                    label="Body"
                    value={formatJson(requestDetails.body)}
                    preFormatted
                    isLast
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
