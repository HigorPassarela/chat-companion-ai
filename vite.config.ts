import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // 👇 ADICIONE ESTA CONFIGURAÇÃO DE PROXY
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Backend Flask
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // Mantém /api no caminho
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));