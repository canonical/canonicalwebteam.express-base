import type { IncomingMessage } from "node:http";
import type {
  RendererOptions,
  ServerEntrypoint,
} from "@canonical/react-ssr/renderer";
import type { LocalServerResponse } from "../types";
import { BaseRenderer } from "./BaseRenderer";
import { IntegrityRenderer } from "./IntegrityRenderer";
import { NonceRenderer } from "./NonceRenderer";

export { BaseRenderer } from "./BaseRenderer";
export { IntegrityContext, IntegrityRenderer } from "./IntegrityRenderer";
export { NonceContext, NonceRenderer } from "./NonceRenderer";

export function rendererFactory() {
  return (
    _req: IncomingMessage,
    res: LocalServerResponse,
    next: (error?: Error) => void,
  ) => {
    // if it has been already created then do nothing
    if (res.locals && !res.locals.rendererFactory) {
      res.locals.rendererFactory = <I extends InitData>(
        params: RendererParameters<I>,
      ) =>
        new BaseRenderer(params.Component, params.initialData, params.options);
    }
    next();
  };
}

export function integrityRendererFactory(port: number) {
  return (
    _req: IncomingMessage,
    res: LocalServerResponse,
    next: (error?: Error) => void,
  ) => {
    if (res.locals) {
      res.locals.rendererFactory = <I extends InitData>(
        params: RendererParameters<I>,
      ) =>
        new IntegrityRenderer(
          params.Component,
          params.initialData,
          params.options,
          port,
        );
    }
    next();
  };
}

export function nonceRendererFactory() {
  return (
    _req: IncomingMessage,
    res: LocalServerResponse,
    next: (error?: Error) => void,
  ) => {
    if (res.locals) {
      res.locals.rendererFactory = <I extends InitData>(
        params: RendererParameters<I>,
      ) =>
        new NonceRenderer(
          params.Component,
          res.locals?.nonce,
          params.initialData,
          params.options,
        );
    }
    next();
  };
}

type InitData = Record<string, unknown>;

type Entrypoint<I extends InitData> = ServerEntrypoint<I>;

export type RootAppProps = { data: Record<string, unknown> | undefined };

export type RendererParameters<I extends InitData> = {
  Component: Entrypoint<I>;
  initialData: I;
  options: RendererOptions;
};

export type RendererFactory<I extends InitData> = (
  params: RendererParameters<I>,
) => BaseRenderer<I>;

export const HTML_ROOT_REPLACE_KEY = "<!--app-html-->";
