// Special build used ONLY to produce a single self-contained preview HTML
// file (no service worker, no code-splitting) that can be opened directly
// via file:// without a local server. The real app is built with
// vite.config.ts (PWA + code-splitting) — this is a convenience artifact.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "virtual:pwa-register": new URL("./src/stubs/pwaRegisterStub.ts", import.meta.url).pathname,
    },
  },
  build: {
    outDir: "dist-standalone",
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
