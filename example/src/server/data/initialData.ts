import { DELAY_SSR_MESSAGE, delay } from "../../shared";
import type { WindowInitialData } from "../../shared/types/windowData";

export default async function fetchInitialData() {
  // here we can perform some fetch operations in the server
  const sampleSSRfetchResponse = await delay(DELAY_SSR_MESSAGE, {
    message: "SSR Response rendered in the server",
  });
  const initialData: WindowInitialData = {
    apiResponse: sampleSSRfetchResponse,
    hasSuspense: false,
  };
  return initialData;
}
