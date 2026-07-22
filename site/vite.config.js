import { defineConfig } from 'vite'

// AI_LAB_BASE 讓這個站可以掛在任何網域 path 下（例如 /ai-lab/）
// 本機開發不設就是 '/'
export default defineConfig({
  base: process.env.AI_LAB_BASE || '/',
  // 明確給空的 PostCSS 設定，避免 Vite 往上層目錄找 config
  //（當本 repo 作為 submodule 掛在別的專案下時會誤抓宿主的 postcss.config）
  css: { postcss: {} },
})
