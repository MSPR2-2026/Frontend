import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
        target: 'http://127.0.0.1:8080', // <-- CHANGE THIS to your actual OpenFaaS/Nginx port!
        changeOrigin: true,
        secure: false,
    }
  }
});