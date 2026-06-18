import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      // Ловим любой запрос, который начинается с /function
      '/function': {
        target: 'http://127.0.0.1:8080/', // OpenFaaS
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log("Vite ${req.url} -> ${proxyReq.host}${proxyReq.path}");
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log("OpenFaaS: статус ${proxyRes.statusCode}");
          });
        }
      }
    }
  }
});