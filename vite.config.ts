import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf-8")) as { version: string };

// https://vitejs.dev/config/
export default defineConfig(() => ({
  // Served at the site root; set VITE_BASE (e.g. "/myapp/") when the app is hosted under a path.
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  // shown in the footer and Settings → About, so support can tell which build a person runs
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // the backend API in development (services/apiClient.ts calls VITE_API_BASE, "/api/v1" by default)
      "/api": {
        target: process.env.VITE_API_TARGET ?? "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
}));
