import { defineConfig } from "vite";
import react       from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path        from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      // Forward all /LMS-React/backend/api/* requests to XAMPP Apache.
      // This makes the requests appear same-origin, completely eliminating
      // CORS preflight issues during development.
      "/LMS-React/backend/api": {
        target: "http://localhost",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor":    ["lucide-react", "recharts"],
          "state-vendor": ["zustand", "axios"],
        },
      },
    },
  },
});