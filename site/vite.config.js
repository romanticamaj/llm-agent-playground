import { defineConfig } from 'vite'

// AI_LAB_BASE 讓這個站可以掛在任何網域 path 下（例如 /ai-lab/）
// 本機開發不設就是 '/'
export default defineConfig({
  base: process.env.AI_LAB_BASE || '/',
})
