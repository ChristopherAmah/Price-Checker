import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api/check-price": {
        target: "https://laternaerp.smerp.io",
        changeOrigin: true,
        rewrite: () => "/price-checker/search",
      },
    },
  },
});
