import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/admin': {
        target: 'https://bike-tour-backend.billsbiketour.workers.dev',
        changeOrigin: true,
      },
    },
  },
})
