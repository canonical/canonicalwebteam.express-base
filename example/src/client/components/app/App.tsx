import type { WindowInitialData } from "shared/types/windowData";
import Counter from "../counter/Counter";
import ServerMessage from "../serverMessage/ServerMessage";

import "./App.css";
import { useId } from "react";

function App({ data }: { data: WindowInitialData | undefined }) {
  const ssrRenderedId = useId();
  const flaskOutputId = useId();
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
      <div id={ssrRenderedId}>
        <h3>SSR rendered message</h3>
        <p id={flaskOutputId}>{data?.apiSSRResponse.message}</p>
      </div>
      <ServerMessage />
    </>
  );
}

export default App;
