export const INITIAL_DATA_KEY = "__INITIAL_DATA__";

// Checking if we are in the SSR context with this allows Vite to do tree-shaking
export const SSR = import.meta.env.SSR;
