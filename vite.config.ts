import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 讓 Vite 綁定 0.0.0.0，允許內網訪問
    port: 5173, // 可選，設定開發伺服器端口
    allowedHosts: [
      '7f9a-2402-7500-598-2568-250e-bc5c-a46-2741.ngrok-free.app',
      'localhost',
      '127.0.0.1'
    ]
  },
})
