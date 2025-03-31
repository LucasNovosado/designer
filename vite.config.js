import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Configuração do Vite
export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log('Variáveis de ambiente carregadas:', {
    PARSE_APP_ID: !!env.VITE_PARSE_APP_ID,
    PARSE_JS_KEY: !!env.VITE_PARSE_JS_KEY,
    PARSE_SERVER_URL: !!env.VITE_PARSE_SERVER_URL
  })

  return {
    plugins: [react()],
    server: {
      port: env.PORT || 3000,
      host: '0.0.0.0',
      cors: true,
      strictPort: true,
      // Adicione os hosts permitidos
      allowedHosts: [
        'designer-unica.onrender.com',
        'localhost',
        '127.0.0.1'
      ]
    },
    preview: {
      port: env.PORT || 3000,
      host: '0.0.0.0',
      cors: true,
      strictPort: true,
      // Adicione os hosts permitidos
      allowedHosts: [
        'designer-unica.onrender.com',
        'localhost',
        '127.0.0.1'
      ]
    },
    define: {
      'process.env': {},
      'import.meta.env.VITE_PARSE_APP_ID': JSON.stringify(env.VITE_PARSE_APP_ID || ''),
      'import.meta.env.VITE_PARSE_JS_KEY': JSON.stringify(env.VITE_PARSE_JS_KEY || ''),
      'import.meta.env.VITE_PARSE_SERVER_URL': JSON.stringify(env.VITE_PARSE_SERVER_URL || ''),
      'import.meta.env.VITE_PARSE_MASTER_KEY': JSON.stringify(env.VITE_PARSE_MASTER_KEY || '')
    },
    build: {
      outDir: 'dist',
      sourcemap: true, // Habilitar sourcemaps para depuração
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom', 'parse']
          }
        }
      }
    }
  }
})
