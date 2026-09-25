import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { gutenbergProxy } from './gutenberg-proxy.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), gutenbergProxy()],
})
