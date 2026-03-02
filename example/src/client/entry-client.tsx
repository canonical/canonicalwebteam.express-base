import { hydrateRoot } from "react-dom/client";
import "./index.css";
import { INITIAL_DATA_KEY } from "../shared";
import PageSkeleton from "../shared/PageSkeleton";
import App from "./components/app/App";

const rootElement = document.getElementById("root");

if (rootElement) {
  hydrateRoot(rootElement, <App data={window[INITIAL_DATA_KEY]} />);
} else {
  hydrateRoot(
    document,
    <PageSkeleton initialData={window[INITIAL_DATA_KEY]} lang="en" />,
  );
}
