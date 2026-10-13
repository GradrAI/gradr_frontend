import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    // Preserve Vite 5's browser targets instead of silently raising requirements.
    target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
    cssTarget: ["edge88", "firefox78", "chrome87", "safari14"],
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
});
