import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import Components from 'unplugin-vue-components/vite'
import mkcert from "vite-plugin-mkcert";
import Unocss from 'unocss/vite'

export default defineConfig({
  plugins: [
    VueRouter({}),
    vue(),
    mkcert(),
    Components({ resolvers: [] }),
    AutoImport({
      imports: ['vue', '@vueuse/head', VueRouterAutoImports],
    }),
    Unocss({ /* options */ }),
  ],
  server: {
    open: false,
    port: 3000,
    https: true,
    proxy: {
      '/backend': {
        target: `https://localhost:4000`,
        changeOrigin: true,
        rewrite: path => path.replace('/backend', ''),
      },
    }
  },
  define: {
    "process.env": {},
  },
  build: {
    outDir: "../backend/public",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  }
})
