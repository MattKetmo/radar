import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Pin the timezone so date tests are deterministic (some cross a DST change).
process.env.TZ = "Europe/Paris";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    globals: true,
  },
});
