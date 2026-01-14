import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3010,
  },
  plugins: [react()],
  build: {
    outDir: "dist/client",
  },
});
