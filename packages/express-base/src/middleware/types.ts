import type { Request, Response } from "express";
import type { ComponentType } from "react";

export interface ErrorPageContext {
  statusCode: number;
  statusMessage: string;
  errorName: string;
  errorMessage: string;
  details?: unknown;
  stack?: string;
  // CSP nonce applied to inline <style> tags in built-in error pages.
  nonce?: string;
  requestDetails?: {
    method: string;
    url: string;
    headers: Record<string, string | string[] | undefined>;
    query: unknown;
    body: unknown;
  };
}

export interface ErrorHandlerOptions {
  // Override environment detection. Defaults to process.env.NODE_ENV !== 'production'.
  isDev?: boolean;

  // Hook called before sending error response. Useful for logging/observability.
  onError?: (
    error: Error,
    req: Request,
    res: Response,
    statusCode: number,
  ) => void | Promise<void>;

  // Custom HTML template for production error pages.
  prodTemplate?: (context: ErrorPageContext) => string;

  // React component for production error pages, rendered via renderToString.
  // Takes precedence over prodTemplate if both are provided.
  errorComponent?: ComponentType<ErrorPageContext>;

  // CSP nonce for inline <style> tags in built-in error pages.
  nonce?: string;
}

export interface ErrorResponse {
  error: {
    statusCode: number;
    message: string;
    details?: unknown;
  };
}
