import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { ServerResponse } from 'http'

const API_TARGET = process.env.VITE_API_URL || 'http://localhost:8000';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000, 
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        // Add this configure block to catch backend-down events
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.error('Proxy Error:', err.message);

            if (res && 'writeHead' in res) {
              const httpRes = res as ServerResponse

              // If the response hasn't headers sent yet, write a 502/504 status
              if (!httpRes.headersSent) {
                httpRes.writeHead(502, { 'Content-Type': 'application/json' });
                httpRes.end(JSON.stringify({ error: 'Backend server is unreachable' }));
              }
            }

          });
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // SEO & Performance Optimizations
    rollupOptions: {
      output: {
        // Code splitting for better caching
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui': ['@radix-ui/react-avatar', '@radix-ui/react-checkbox', '@radix-ui/react-dialog'],
        }
      }
    },
    // Enable minification for smaller bundles
    minify: 'terser',
    cssCodeSplit: true,
    sourcemap: false, // Disable for production
  },
  // Performance optimization for development
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
  },
})