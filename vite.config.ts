import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'development' ? '/' : '/',
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
    rollupOptions: {
      output: {
        // Manual chunking for optimal code splitting
        manualChunks: (id) => {
          // Vendor chunk for core React libraries
          if (id.includes('node_modules')) {
            // Recharts and dependencies in separate chunk
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-recharts';
            }
            // Framer Motion in separate chunk
            if (id.includes('framer-motion')) {
              return 'vendor-framer';
            }
            // React core and React Router in main vendor chunk
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Radix UI components in separate chunk
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            // Other vendor dependencies
            return 'vendor';
          }
        },
      },
    },
  },
  // Ensure service worker and manifest are copied to dist
  publicDir: 'public',
}));
