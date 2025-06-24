import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
 
  return {
    plugins: [react()],
    base: './',
    assetsInclude: ['**/*.glb','**/*.gltf'],
    publicDir: 'public',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../src'),
        '@enerv-3d/core': path.resolve(__dirname, '../src/index.ts'),
      },
    },
    server: {
      port: 8080,
      strictPort: true,
      open: true,
      proxy: {
       
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'three-vendor': ['three']
          }
        }
      }
    },
  };
}); 