import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    minify: 'terser',
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
        chunkSizeWarningLimit: 2000
      }
    },
    terserOptions: {
      compress: {
        drop_console: false,
        pure_funcs: ['console.debug']
      }
    }
  },
  resolve: {
    alias: {
      'react-dom': 'react-dom'
    }
  }
})
