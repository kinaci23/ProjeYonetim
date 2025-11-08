import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // path modülünü import ediyoruz

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // YOL (ALIAS) YAPILANDIRMASI
  resolve: {
    alias: {
      // '@' sembolünü, projenin 'src' klasörü olarak tanımlıyoruz
      '@': path.resolve(__dirname, './src'),
    },
  },
})
