import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: ".",
  },
  server: {
    host: true, // 讓 Vite 綁定 0.0.0.0，允許內網訪問
    port: 5173, // 可選，設定開發伺服器端口
    allowedHosts: [
      'a020-2402-7500-598-255a-f833-b0fd-9bcb-eff6.ngrok-free.app',
      'localhost',
      '127.0.0.1'
    ]
  },
})
