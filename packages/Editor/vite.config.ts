import { defineConfig } from 'vite'
import packageJson from "./package.json";


const path = require('path')
const getPackageNameCamelCase = () => {
  return packageJson.aliasName;
};


export default defineConfig({
  resolve: {
    alias: {
      '@enerv-3d/core': path.resolve(__dirname, '../../src'),
      '@enerv-3d/app': path.resolve(__dirname, '../')
    }
  },
  build: {
    target: 'esnext',
    lib: {
      entry: path.resolve('index.ts'),
      name: getPackageNameCamelCase(),
      fileName: (format) => `${getPackageNameCamelCase()}.${format}.js`
    },
    rollupOptions: {
      external: ['@enerv-3d/core'],
      output: {
        globals: {
          '@enerv-3d/core': 'enerv3d'
        }
      }
    }
  }
})