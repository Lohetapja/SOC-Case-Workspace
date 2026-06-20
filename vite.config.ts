import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Frontend-only configuration. No backend, no proxies, no external services.
// `base` is set for GitHub Pages project hosting at
// https://lohetapja.github.io/SOC-Case-Workspace/ so built asset URLs resolve
// under the repo subpath. (Dev server therefore serves under that path too.)
export default defineConfig({
  base: '/SOC-Case-Workspace/',
  plugins: [react()],
})
