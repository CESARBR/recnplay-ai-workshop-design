import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

import { designMdShims } from './vite/design-md-shims.ts'

// O build vai para /docs, que é a pasta servida pelo GitHub Pages (branch main → /docs).
// `base: './'` gera caminhos relativos, então o site funciona em qualquer subpath (usuario.github.io/repo/).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), designMdShims()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    // O chunk do gerador de DESIGN.md (~160 KB gzip, com o lint oficial) já é carregado sob
    // demanda e pré-carregado em segundo plano; tudo nele é necessário ao abrir a ferramenta.
    chunkSizeWarningLimit: 700,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
