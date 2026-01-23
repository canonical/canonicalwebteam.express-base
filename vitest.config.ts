import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["packages/*"],
    exclude: ["**/dist/**", "**/node_modules/**"],
    coverage: {
      enabled: true,
      provider: "istanbul",
      reporter: ["html"],
      exclude: ["**/dist/**"]
    },
  },
});
