import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        opening: resolve(__dirname, 'opening.html'),
        closing: resolve(__dirname, 'closing.html'),
      },
    },
  },
})
