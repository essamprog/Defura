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
    // Backend runs on XAMPP/Apache — no proxy needed.
    // All API calls use the full URL from VITE_API_BASE_URL in .env
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