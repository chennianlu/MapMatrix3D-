// yarn add @types/node -D 
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { loadEnv } from 'vite';


const resolve = str => path.resolve(__dirname, str)
export default defineConfig(({ mode }) => {
  const ENV = loadEnv(mode, __dirname)

  return {
    base: './',
    assetsInclude: ['**/*.gltf'],//静态资源处理
    resolve: {
      alias: {
        '@enerv-3d/app': resolve('../SDK/src'),
        '@assets': resolve('src/assets')
      },
      // extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.glsl', '.scss']
    },
    build: {
      sourcemap: true, //判断环境
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          charset: false,
          javascriptEnabled: true,
        },
      },
    },
    server: {
      hmr: true,
      port: 8088,
      open: true,
      proxy: {
        '/api': 'http://127.0.0.1:3000'
      },
      cors: true
    },
    plugins: [
      react()
    ],
  }
})
