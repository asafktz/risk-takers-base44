import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Bridge build: Base44 dev-only vite-plugin removed for deterministic headless
// builds on Vercel. Runtime @base44/sdk stays (frontend still calls Base44's API
// cross-origin until the Supabase backend rebuild lands). The dev plugin used to
// provide the '@' -> src alias, so we set it explicitly here.
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  logLevel: 'error',
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
