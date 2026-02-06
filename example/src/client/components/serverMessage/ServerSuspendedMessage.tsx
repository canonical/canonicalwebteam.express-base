import React from "react";
import { DELAY_SUSPENSE_MESSAGE, delay } from "../../../shared";

const ssrSuspenseMessage =
  "This message is rendered in a <Suspense> component in the server";

/*

Doing it like this Node caches the result of the import.
It is not good to show the behavior of Suspense, but might be good 
for performance in cases where the component gets rendered always the same.

const ServerSuspendedMessage = React.lazy(async () => {
  console.log("Suspense called");
  const data = await delay(DELAY_SUSPENSE_MESSAGE, ssrSuspenseMessage);
  console.log("Suspense resolved. Streaming chunk");
  return {
    default: (): React.ReactElement => {
      return (
        <div>
          <h3>SSR Suspense message</h3>
          <p>{data}</p>
        </div>
      );
    },
  };
});

*/

function createServerSuspendedMessage() {
  return React.lazy(async () => {
    console.log("Suspense called");
    const data = await delay(DELAY_SUSPENSE_MESSAGE, ssrSuspenseMessage);
    console.log("Suspense resolved. Streaming chunk");
    return {
      default: (): React.ReactElement => {
        return (
          <div>
            <h3>SSR Suspense message</h3>
            <p>{data}</p>
          </div>
        );
      },
    };
  });
}

export default createServerSuspendedMessage;
