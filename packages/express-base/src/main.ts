import { MyNumber } from "@canonical/express-middlewares";

export const add = (a: number | MyNumber, b: number | MyNumber): number => {
  if (a instanceof MyNumber) {
    a = a.x;
  }
  if (b instanceof MyNumber) {
    b = b.x;
  }
  return a + b;
};

export {
  BaseJSXRenderer,
  type HTMLTemplateProps,
  INITIAL_DATA_KEY,
  type ScriptElement,
  type SSRComponent,
  type SSRComponentProps,
  ViteHTMLExtractor,
  ViteRenderer,
} from "./renderer/index.js";
