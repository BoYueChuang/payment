import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 讓 Vite 綁定 0.0.0.0，允許內網訪問
    port: 5173, // 可選，設定開發伺服器端口
    allowedHosts: [
      'ee6f-114-37-126-234.ngrok-free.app',
      'localhost',
      '127.0.0.1'
    ]
  },
})
