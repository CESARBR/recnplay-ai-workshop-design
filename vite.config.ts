import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// O build vai para /docs, que é a pasta servida pelo GitHub Pages (branch main → /docs).
// `base: './'` gera caminhos relativos, então o site funciona em qualquer subpath (usuario.github.io/repo/).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
})
