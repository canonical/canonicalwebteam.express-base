import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./components/app/App";
import "./index.css";
import { INITIAL_DATA_KEY } from "../shared";

hydrateRoot(
  document.getElementById("root") as HTMLElement,
  <StrictMode>
    <App data={window[INITIAL_DATA_KEY]} />
  </StrictMode>,
);
