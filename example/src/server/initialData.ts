import type { ApiSSRResponse } from "shared";
import type { WindowInitialData } from "shared/types/windowData";

export default async function fetchInitialData() {
  // here we can perform some fetch operations in the server
  const sampleSSRfetchResponse = await delay(500, { message: "SSR Response rendered in the server" });
  const initialData: WindowInitialData = { apiSSRResponse: sampleSSRfetchResponse }
  return initialData;
}

async function delay(milliseconds: number, returnValue: ApiSSRResponse): Promise<ApiSSRResponse> {
   return new Promise((resolve) => {
       setTimeout(() => {
           resolve(returnValue);
       }, milliseconds);
   });
};
