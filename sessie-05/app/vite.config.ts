import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // In dev: stuur /api-aanvragen door naar de Express-backend op poort 3005.
    proxy: {
      '/api': 'http://localhost:3005',
    },
  },
})
