import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: 'express-middlewares',
      formats: ['es'],
      fileName: 'main'
    },
  },
  plugins: [dts()],
});
