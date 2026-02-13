import type { ErrorPageContext } from "@canonical/express-base";

const css = `
  body {
    font-family: Ubuntu, system-ui, sans-serif;
    margin: 4rem auto;
    max-width: 480px;
    padding: 0 1rem;
  }
  .status-code {
    color: #e95420;
    font-size: 0.85rem;
    font-weight: 600;
  }
  h1 {
    font-size: 1.5rem;
    font-weight: 500;
    margin: 0.25rem 0 1rem;
  }
  .message {
    color: #555;
  }
  hr {
    border: none;
    border-top: 1px solid #ddd;
    margin: 1.5rem 0;
  }
  .back {
    font-size: 0.85rem;
  }
`;

export function CustomErrorPage({
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
        <p className="status-code">{statusCode}</p>
        <h1>{statusMessage}</h1>
        <p className="message">{errorMessage}</p>
        <hr />
        <p className="back">
          <a href="/errors">Back to error demo</a>
        </p>
      </body>
    </html>
  );
}
