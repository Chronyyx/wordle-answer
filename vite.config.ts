import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    {
      name: 'html-transform',
      apply: 'serve',
      transformIndexHtml(html) {
        // In dev, we can just use a placeholder or fetch the real one
        // For simplicity and speed in dev, we'll use a placeholder or today's date logic
        // But since we want to be helpful, let's try to be accurate or just use a clear dev value
        return html.replace('{{YESTERDAY_WORDLE}}', 'DEV_PREVIEW');
      },
    },
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
