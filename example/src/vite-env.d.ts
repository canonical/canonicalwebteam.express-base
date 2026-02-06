/// <reference types="vite/client" />

import { INITIAL_DATA_KEY, type WindowInitialData } from "shared";

declare global {
  interface Window {
    [INITIAL_DATA_KEY]?: WindowInitialData;
  }
}
