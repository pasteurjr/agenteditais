import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5180,
    allowedHosts: true,
    proxy: {
      '/api': 'http://localhost:5007',
      '/uploads': 'http://localhost:5007',
    },
  },
})
