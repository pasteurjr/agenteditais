import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5180,
    cors: true,
    // Vite 8.x: 'all' como string nao funciona — usar array com hostnames + wildcards.
    allowedHosts: ['.no-ip.info', '.ngrok.io', '.ngrok-free.app', '.servehttp.com',
                   'localhost', '127.0.0.1', '0.0.0.0',
                   'pasteurjr.servehttp.com', 'camerascasas.no-ip.info'],
    proxy: {
      '/api': 'http://localhost:5007',
      '/uploads': 'http://localhost:5007',
    },
  },
})
