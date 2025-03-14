import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/",
  plugins: [react()],
  define: {
    'process.env.VITE_TAPPAY_APP_KEY': JSON.stringify(process.env.VITE_TAPPAY_APP_KEY),
    'process.env.VITE_TAPPAY_APP_ID': JSON.stringify(process.env.VITE_TAPPAY_APP_ID),
    'process.env.VITE_APPLE_MERCHANT_ID': JSON.stringify(process.env.VITE_APPLE_MERCHANT_ID),
    'process.env.VITE_GOOGLE_MERCHANT_ID': JSON.stringify(process.env.VITE_GOOGLE_MERCHANT_ID),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: ".",
  },
  server: {
    host: true, // 讓 Vite 綁定 0.0.0.0，允許內網訪問
    port: 5173, // 可選，設定開發伺服器端口
    allowedHosts: [
      'localhost',
      '127.0.0.1'
    ]
  },
})
