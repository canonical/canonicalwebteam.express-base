import { hydrateRoot } from "react-dom/client";
import "./index.css";
import { INITIAL_DATA_KEY } from "../shared";
import PageSkeleton from "../shared/PageSkeleton";

hydrateRoot(
  document,
  <PageSkeleton initialData={window[INITIAL_DATA_KEY]} lang="en" />,
);
