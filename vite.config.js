import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          d3: ['d3', 'd3-force'],
          vendor: ['react', 'react-dom', 'framer-motion', 'zustand'],
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
