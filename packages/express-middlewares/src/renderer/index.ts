import type { IncomingMessage } from "node:http";
import type {
  RendererOptions,
  ServerEntrypoint,
} from "@canonical/pragma-tmp-patch";
import type { LocalServerResponse } from "../types";
import { BaseRenderer } from "./BaseRenderer";
import { NonceRenderer } from "./NonceRenderer";

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

export function integrityRendererFactory() {
  return (
    _req: IncomingMessage,
    res: LocalServerResponse,
    next: (error?: Error) => void,
  ) => {
    if (res.locals) {
      res.locals.rendererFactory = <I extends InitData>(
        params: { nonce: string } & RendererParameters<I>,
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

export type RendererParameters<I extends InitData> = {
  Component: Entrypoint<I>;
  initialData: I;
  options: RendererOptions;
};

export type RendererFactory<I extends InitData> = (
  params: RendererParameters<I>,
) => BaseRenderer<I>;
