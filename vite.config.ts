import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // For GitHub Pages, use the repo name as base path
  const base = process.env.GITHUB_ACTIONS ? '/init-project-tool/' : '/';

  return {
    base,
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Simplified chunking
        manualChunks: undefined,
      },
    },
  },
  // Ensure service worker and manifest are copied to dist
  publicDir: 'public',
  };
});
