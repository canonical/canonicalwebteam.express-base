import type { ErrorPageContext } from "../middleware/types.js";

// Styles are in a <style> tag rather than an external CSS file or inline style attributes because:
// - Error pages must be self-contained. If the server is failing, a CSS file request may also fail.
// - <style> tags are CSP-compatible via nonce/hash, unlike inline style attributes which require unsafe-inline.
const css = `
  body {
    margin: 0;
    font-family: system-ui, sans-serif;
    background: #f5f5f5;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
  }
  .container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 3rem;
    max-width: 600px;
    text-align: center;
  }
  .status-code {
    font-size: 4rem;
    font-weight: bold;
    color: #e74c3c;
    margin-bottom: 1rem;
  }
  .status-message {
    font-size: 1.5rem;
    color: #555;
    margin-bottom: 1rem;
  }
  .divider {
    height: 1px;
    background: #e0e0e0;
    margin: 2rem 0;
  }
  .error-message {
    font-size: 1rem;
    color: #666;
    line-height: 1.6;
  }
  .help-text {
    font-size: 0.875rem;
    color: #999;
  }
`;

export function ProdErrorPage({
  statusCode,
  statusMessage,
  errorMessage,
  nonce,
}: ErrorPageContext) {
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
          <div className="status-code">{statusCode}</div>
          <div className="status-message">{statusMessage}</div>
          <div className="divider" />
          <div className="error-message">{errorMessage}</div>
          <div className="divider" />
          <div className="help-text">
            If this problem persists, please contact support.
          </div>
        </div>
      </body>
    </html>
  );
}
