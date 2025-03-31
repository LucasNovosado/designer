import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: env.PORT || 3000,
      host: '0.0.0.0'
    },
    preview: {
      port: env.PORT || 3000,
      host: '0.0.0.0'
    },
    define: {
      '__APP_CONFIG__': JSON.stringify({
        PARSE_APP_ID: env.VITE_PARSE_APP_ID,
        PARSE_JS_KEY: env.VITE_PARSE_JS_KEY,
        PARSE_SERVER_URL: env.VITE_PARSE_SERVER_URL
      })
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  }
})
