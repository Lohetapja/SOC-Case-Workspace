import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Frontend-only configuration. No backend, no proxies, no external services.
export default defineConfig({
  plugins: [react()],
})
