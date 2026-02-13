import type { ErrorPageContext } from "../middleware/types.js";
import { formatJson } from "./utils.js";

// Styles are in a <style> tag rather than an external CSS file or inline style attributes because:
// - Error pages must be self-contained. If the server is failing, a CSS file request may also fail.
// - <style> tags are CSP-compatible via nonce/hash, unlike inline style attributes which require unsafe-inline.
const css = `
  body {
    margin: 0;
    box-sizing: border-box;
    font-family: system-ui, sans-serif;
    background: #1a1a1a;
    color: #e0e0e0;
    line-height: 1.6;
    padding: 2rem;
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
  .header {
    border-bottom: 2px solid #e74c3c;
    padding-bottom: 1rem;
    margin-bottom: 2rem;
  }
  .status-code {
    font-size: 3rem;
    font-weight: bold;
    color: #e74c3c;
  }
  .status-message {
    font-size: 1.5rem;
    color: #bdc3c7;
    margin-top: 0.5rem;
  }
  .section {
    background: #2a2a2a;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid #3a3a3a;
  }
  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #61afef;
    margin-bottom: 1rem;
  }
  .error-name {
    color: #e74c3c;
    font-weight: 600;
  }
  .error-message {
    color: #e0e0e0;
    font-size: 1.1rem;
    margin-top: 0.5rem;
  }
  pre {
    background: #1a1a1a;
    border: 1px solid #3a3a3a;
    border-radius: 4px;
    padding: 1rem;
    overflow-x: auto;
    font-family: "Monaco", "Menlo", "Consolas", monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .request-details {
    background: #1a1a1a;
    border: 1px solid #3a3a3a;
    border-radius: 4px;
    padding: 1rem;
    overflow-x: auto;
    font-family: "Monaco", "Menlo", "Consolas", monospace;
    font-size: 0.875rem;
  }
  .detail-row {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 1rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #3a3a3a;
  }
  .detail-row-last {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 1rem;
  }
  .detail-label {
    color: #61afef;
    font-weight: 600;
  }
  .detail-value {
    color: #98c379;
    word-break: break-word;
  }
  .pre-formatted {
    color: #98c379;
    word-break: break-word;
    white-space: pre-wrap;
  }
  .highlight {
    color: #61afef;
  }
`;

function StackTrace({ stack }: { stack: string }) {
  const lines = stack.split("\n");
  return (
    <pre>
      {lines.map((line, i) => {
        const key = `${i}-${line.slice(0, 40)}`;
        const match = line.match(/^(.*?)(\(.*?:\d+:\d+\))(.*)$/);
        if (match) {
          return (
            <span key={key}>
              {match[1]}
              <span className="highlight">{match[2]}</span>
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
    <div className={isLast ? "detail-row-last" : "detail-row"}>
      <div className="detail-label">{label}</div>
      <div className={preFormatted ? "pre-formatted" : "detail-value"}>
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
  nonce,
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
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: CSS in a style tag is not an XSS vector */}
        <style nonce={nonce} dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>
        <div className="container">
          <div className="header">
            <div className="status-code">{statusCode}</div>
            <div className="status-message">{statusMessage}</div>
          </div>

          <div className="section">
            <div className="section-title">Error Details</div>
            <div className="error-name">{errorName}</div>
            <div className="error-message">{errorMessage}</div>
          </div>

          {details !== undefined && (
            <div className="section">
              <div className="section-title">Error Details Payload</div>
              <pre>{formatJson(details)}</pre>
            </div>
          )}

          {stack && (
            <div className="section">
              <div className="section-title">Stack Trace</div>
              <StackTrace stack={stack} />
            </div>
          )}

          {requestDetails && (
            <div className="section">
              <div className="section-title">Request Details</div>
              <div className="request-details">
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
