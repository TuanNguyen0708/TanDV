import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',      // ⭐ QUAN TRỌNG: cho máy khác truy cập
    port: 5173,
    open: false,          // ❌ không auto open browser (tránh mở localhost)
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // BE
        changeOrigin: true,
      },
    },
  },
})
