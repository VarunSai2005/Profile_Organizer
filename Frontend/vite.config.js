import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api1': 'http://localhost:5037',
      '/api2': 'http://localhost:5037',
      '/api3': 'http://localhost:5037',
      '/api4': 'http://localhost:5037',
      '/api5': 'http://localhost:5037',
    },
  },
})
