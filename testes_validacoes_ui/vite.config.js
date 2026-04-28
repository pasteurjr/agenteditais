import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',           // escuta em todas as interfaces
    port: 5181,
    strictPort: true,
    cors: true,                // aceita qualquer origin
    allowedHosts: 'all',       // aceita qualquer Host header (ngrok, IP, etc)
    proxy: {
      '/api': {
        target: 'http://localhost:5060',
        changeOrigin: true,
      },
    },
  },
})
