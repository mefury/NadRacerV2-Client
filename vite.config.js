import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/monad': {
        target: 'https://www.monadclip.fun',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/monad/, ''),
      },
    },
  },
  preview: {
    port: 4173,
    host: true, // Allow external connections
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/monad': {
        target: 'https://www.monadclip.fun',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/monad/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable source maps in production
    minify: 'esbuild', // Use esbuild for faster minification
    target: 'esnext', // Use esnext to properly handle BigInt
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Three.js into its own chunk
          three: ['three'],
          // Split React into its own chunk
          react: ['react', 'react-dom'],
          // Web3 related chunks
          web3: ['@privy-io/react-auth', '@walletconnect/ethereum-provider'],
          // Split audio system
          audio: ['./src/audioSystem.js'],
          // Split game logic
          game: ['./src/racingLogic.js', './src/shipModels.js'],
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  esbuild: {
    loader: 'jsx',
    include: /\.[jt]sx?$/,
    // Keep console.error in output; strip other console calls and debugger in prod
    drop: ['debugger'],
    pure: ['console.log', 'console.info', 'console.debug', 'console.warn'],
  },
  optimizeDeps: {
    include: [
      'three', 
      'react', 
      'react-dom',
      '@privy-io/react-auth',
      '@walletconnect/ethereum-provider'
    ],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
      target: 'esnext',
    },
  },
  // Enable CSS code splitting
  css: {
    devSourcemap: true,
  },
  // Add headers for security and CORS
  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://verify.walletconnect.com https://verify.walletconnect.org;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https: blob:;
      media-src 'self' data: https:;
      connect-src 'self' https: wss: data: blob:;
      font-src 'self';
      frame-src 'self' https://verify.walletconnect.com https://verify.walletconnect.org;
    `.replace(/\s+/g, ' ').trim(),
  },
});