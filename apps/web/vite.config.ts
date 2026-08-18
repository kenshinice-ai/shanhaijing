import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  test: {
    // Most suites are pure functions and need no DOM; the accessibility audit
    // renders the real application, so jsdom is opted into per file with
    // `@vitest-environment jsdom`.
    environment: "node",
  },
});
