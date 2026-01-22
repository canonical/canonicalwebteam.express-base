import type { WindowInitialData } from "shared/types/windowData";
import Counter from "../counter/Counter";
import ServerMessage from "../serverMessage/ServerMessage";
import ServerSSRMessage from "../serverMessage/ServerSSRMessage";
import createServerSuspendedMessage from "../serverMessage/ServerSuspendedMessage";

import "./App.css";
import { Suspense, useState } from "react";
import Spinner from "../spinner/Spinner";

function App({ data }: { data: WindowInitialData | undefined }) {
  const [hasSuspense] = useState(data?.hasSuspense || false);

  // Create a fresh lazy component on each render to ensure Suspense re-evaluates
  const ServerSuspendedMessage = createServerSuspendedMessage();

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noopener">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank" rel="noopener">
          <img src="/react.svg" className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <Counter />
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      {hasSuspense ? (
        <Suspense fallback={<Spinner />}>
          <ServerSuspendedMessage />
        </Suspense>
      ) : (
        <ServerSSRMessage
          message={data?.apiResponse?.message || "Placeholder"}
        />
      )}
      <ServerMessage />
    </>
  );
}

export default App;
