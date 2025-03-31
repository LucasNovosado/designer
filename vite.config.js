import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  },
  preview: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  },
  define: {
    '__APP_CONFIG__': JSON.stringify({
      PARSE_APP_ID: "UKkWqowhXy7crlvQqlZdfcxJoWiMwEWVdZUSz5dN",
      PARSE_JS_KEY: "errtZmuEsUserCUZrZIP2iYldNsw3jzqBzkrHSW9",
      PARSE_SERVER_URL: "https://parseapi.back4app.com"
    })
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
