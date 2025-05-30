import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const { VITE_BASE_URL, VITE_API_URL, VITE_APP_TITLE } = env;
  console.log(VITE_BASE_URL, VITE_API_URL, VITE_APP_TITLE);
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      cors: true,
      proxy: {
        '/admin-api': {
          target: VITE_BASE_URL,
          changeOrigin: true,
        }
      },
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 3000,
        clientPort: 3000
      }
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
    define: {
      'process.env': {
        VITE_BASE_URL: JSON.stringify(VITE_BASE_URL),
        VITE_API_URL: JSON.stringify(VITE_API_URL),
        VITE_APP_TITLE: JSON.stringify(VITE_APP_TITLE)
      }
    }
  };
}); 