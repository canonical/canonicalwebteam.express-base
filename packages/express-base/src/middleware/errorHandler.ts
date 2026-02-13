import type { NextFunction, Request, Response } from "express";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { HttpError } from "../errors/httpError.js";
import { DevErrorPage } from "../templates/DevErrorPage.js";
import { ProdErrorPage } from "../templates/ProdErrorPage.js";
import type {
  ErrorHandlerOptions,
  ErrorPageContext,
  ErrorResponse,
} from "./types.js";

const STATUS_MESSAGES: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  500: "Internal Server Error",
  503: "Service Unavailable",
};

export function errorHandler(options: ErrorHandlerOptions = {}) {
  const isDev = options.isDev ?? process.env.NODE_ENV !== "production";

  return async (
    error: Error,
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    const statusCode =
      error instanceof HttpError
        ? error.statusCode
        : res.statusCode !== 200
          ? res.statusCode
          : 500;

    const statusMessage = STATUS_MESSAGES[statusCode] ?? "Error";

    if (options.onError) {
      try {
        await options.onError(error, req, res, statusCode);
      } catch (hookError) {
        console.error("Error in onError hook:", hookError);
      }
    }

    res.status(statusCode);

    const preferred = req.accepts(["html", "json"]);

    if (preferred === "html") {
      const context = buildErrorPageContext(
        error,
        req,
        statusCode,
        statusMessage,
        isDev,
        options.nonce,
      );
      const html = renderHtmlPage(context, isDev, options);
      res.type("html").send(html);
    } else {
      const response = buildJsonResponse(error, statusCode, isDev);
      res.json(response);
    }
  };
}

function renderHtmlPage(
  context: ErrorPageContext,
  isDev: boolean,
  options: ErrorHandlerOptions,
): string {
  if (isDev) {
    const element = createElement(DevErrorPage, context);
    return `<!DOCTYPE html>${renderToString(element)}`;
  }

  if (options.errorComponent) {
    const element = createElement(options.errorComponent, context);
    return `<!DOCTYPE html>${renderToString(element)}`;
  }

  if (options.prodTemplate) {
    return options.prodTemplate(context);
  }

  const element = createElement(ProdErrorPage, context);
  return `<!DOCTYPE html>${renderToString(element)}`;
}

function buildErrorPageContext(
  error: Error,
  req: Request,
  statusCode: number,
  statusMessage: string,
  isDev: boolean,
  nonce?: string,
): ErrorPageContext {
  const isServerError = statusCode >= 500;

  const context: ErrorPageContext = {
    statusCode,
    statusMessage,
    errorName: error.name,
    errorMessage: getErrorMessage(error, isServerError, isDev),
    ...(nonce ? { nonce } : {}),
  };

  if (isDev) {
    if (error instanceof HttpError && error.details) {
      context.details = error.details;
    }
    context.stack = error.stack;
    context.requestDetails = {
      method: req.method,
      url: req.originalUrl || req.url,
      headers: req.headers as Record<string, string | string[] | undefined>,
      query: req.query,
      body: req.body,
    };
  }

  return context;
}

function buildJsonResponse(
  error: Error,
  statusCode: number,
  isDev: boolean,
): ErrorResponse {
  const isServerError = statusCode >= 500;

  const response: ErrorResponse = {
    error: {
      statusCode,
      message: getErrorMessage(error, isServerError, isDev),
    },
  };

  if (
    (isDev || !isServerError) &&
    error instanceof HttpError &&
    error.details
  ) {
    response.error.details = error.details;
  }

  return response;
}

function getErrorMessage(
  error: Error,
  isServerError: boolean,
  isDev: boolean,
): string {
  if (!isDev && isServerError) {
    return "Internal Server Error";
  }
  return error.message || "An error occurred";
}
