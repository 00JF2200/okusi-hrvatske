import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Za lokalni dev: proksira /api pozive na localhost:3001
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
