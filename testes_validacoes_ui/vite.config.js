import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',           // escuta em todas as interfaces
    port: 5181,
    strictPort: true,
    cors: true,                // aceita qualquer origin
    // Vite 8.x: 'all' como string não é wildcard — usar array com ponto inicial.
    // Lista cobre IPs, ngrok, no-ip e localhost. Adicionar novos hosts conforme necessário.
    allowedHosts: ['.no-ip.info', '.ngrok.io', '.ngrok-free.app', '.servehttp.com',
                   'localhost', '127.0.0.1', '0.0.0.0',
                   'pasteurjr.servehttp.com', 'camerascasas.no-ip.info'],
    proxy: {
      '/api': {
        target: 'http://localhost:5060',
        changeOrigin: true,
        // Preserva o Host original via X-Forwarded-Host pra que a API possa
        // construir painel_url usando o hostname pelo qual o cliente acessou
        // (ex: pasteurjr.servehttp.com em vez de localhost).
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            if (req.headers.host) {
              proxyReq.setHeader('X-Forwarded-Host', req.headers.host);
            }
          });
        },
      },
    },
  },
})
