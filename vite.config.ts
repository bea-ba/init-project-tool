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
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Smart chunk splitting for better caching and loading
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],

          // UI libraries (Radix UI + shadcn)
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-switch',
            '@radix-ui/react-slider',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-progress',
            '@radix-ui/react-separator',
            '@radix-ui/react-tabs',
            '@radix-ui/react-visually-hidden',
          ],

          // Animation library
          animation: ['framer-motion'],

          // Chart library
          charts: ['recharts'],

          // Utility libraries
          utils: [
            'date-fns',
            'zod',
            'crypto-js',
            'howler',
            '@tanstack/react-query',
            'sonner',
          ],

          // Localization
          i18n: ['react-i18next'],
        },
      },
    },
  },
  // Ensure service worker and manifest are copied to dist
  publicDir: 'public',
  };
});
