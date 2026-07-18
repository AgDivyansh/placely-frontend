import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Vite configuration
// - React fast refresh
// - Path alias `@` -> `/src` for clean imports
// - Manual chunks for large libs (recharts, framer-motion) to keep main bundle lean
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "motion": ["framer-motion"],
          "charts": ["recharts"],
          "icons": ["lucide-react"],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
