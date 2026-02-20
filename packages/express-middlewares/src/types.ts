import type { IncomingMessage, ServerResponse } from "node:http";

export interface LocalServerResponse extends ServerResponse {
  // biome-ignore lint/suspicious/noExplicitAny: res.locals can store any type of object
  locals?: Record<string, any>;
}

export type MiddlewareFunction = (
  req: IncomingMessage,
  res: LocalServerResponse,
  next: (error?: Error) => void,
) => void;

export type DynamicCSPValueFunction = (
  req: IncomingMessage,
  res: ServerResponse,
) => string;

export type PreRenderCallback = <Props>(
  req: IncomingMessage,
  res: LocalServerResponse,
  node: React.ReactElement<Props>,
) => React.ReactElement<Props>;
