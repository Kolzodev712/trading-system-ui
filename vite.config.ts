import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const proxy = {
  "/api": {
    target: process.env.AUTH_API_PROXY ?? "http://127.0.0.1:3001",
    changeOrigin: true,
  },
  "/grpc": {
    target: process.env.GRPC_WEB_PROXY ?? "http://127.0.0.1:8081",
    changeOrigin: true,
    timeout: 0,
    rewrite: (p: string) => p.replace(/^\/grpc/, ""),
  },
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy,
  },
  preview: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy,
  },
});
