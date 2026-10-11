import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Konfigurasi Vite: React + Tailwind v4 + alias "@" ke ./src
// (struktur src/ ini nantinya bisa dipindah 1:1 ke resources/js Laravel + Inertia)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
})
