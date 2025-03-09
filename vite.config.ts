import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // 指定输出路径
    emptyOutDir: true, // 清空输出目录
    assetsDir: ".",   // 讓 Vite 把 JS 和 CSS 放到 `dist/` 根目錄
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
