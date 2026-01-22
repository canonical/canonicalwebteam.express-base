import type { ApiResponse } from "./apiResponseTypes";

export type WindowInitialData = {
  apiResponse?: ApiResponse;
  hasSuspense: boolean;
};
