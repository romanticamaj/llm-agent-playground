# LLM Agent Playground — AI 概念實驗室

**Live: [garyhsieh.com/ai-lab](https://www.garyhsieh.com/ai-lab)**

把 Gary Hsieh（garyhsieh.com）的 AI 心得文章，整理成可直接上課使用的教學概念庫 + 互動式教學網站。

- **教學概念檔**：`concepts/` — 每個概念一個檔案，含一句話、三分鐘講稿、關鍵重點、互動示範構想、課堂提問、原文金句與出處連結
- **互動教學網站**：`site/` — Vite + three.js，上課展示（Presentation 模式）與自由體驗（Explore 模式）兩用

## 使用方式

```bash
cd site
npm install
npm run dev   # 打開 http://localhost:5173
```

網站操作：滾動瀏覽 → 每個概念可「進入互動」；按 `P` 進入上課簡報模式（←/→ 換頁、`Enter` 開互動、`Esc` 離開）。

## 課綱總覽

### Chapter 1 — LLM 的本質

| # | 概念 | 英文 | 原文出處 |
|---|------|------|----------|
| 01 | AI 是文字接龍 | Next-token Prediction | [聊聊為什麼需要沒事多按「編輯」？](https://www.garyhsieh.com/blog/2026-04-22-ai-prompt-ai) |
| 02 | Deterministic vs. Non-deterministic | 確定性與非確定性 | [Agent 的手跟腳](https://www.garyhsieh.com/blog/2026-05-18-agent-tools-llm)、[Agent 是怎麼做出來的？](https://www.garyhsieh.com/blog/2026-04-30-agent) |
| 03 | LLM 根本沒有記憶 | LLM is Stateless | [跟 AI 說「幫我記住這個」的時候，背後發生了什麼事？](https://www.garyhsieh.com/blog/2026-04-07-ai) |
| 04 | Context Window 是 AI 的全部世界 | The Context Window | [跟 AI 說「幫我記住這個」…](https://www.garyhsieh.com/blog/2026-04-07-ai)、[Agent 是怎麼做出來的？](https://www.garyhsieh.com/blog/2026-04-30-agent) |
| 05 | 編輯鈕是時光機 | Context Pollution & Rewind | [聊聊為什麼需要沒事多按「編輯」？](https://www.garyhsieh.com/blog/2026-04-22-ai-prompt-ai) |
| 06 | 算過的，別再算 | Prompt Cache / KV Cache | [為什麼會有 prompt cache？](https://www.garyhsieh.com/blog/2026-06-03-prompt-cache) |

### Chapter 2 — 從 LLM 到 Agent

| # | 概念 | 英文 | 原文出處 |
|---|------|------|----------|
| 07 | Agent 是怎麼做出來的？ | Anatomy of an Agent | [Agent 是怎麼做出來的？](https://www.garyhsieh.com/blog/2026-04-30-agent) |
| 08 | Agent 的手跟腳 | Tool Use | [Agent 的手跟腳 / Tools](https://www.garyhsieh.com/blog/2026-05-18-agent-tools-llm) |
| 09 | Agent 還是 Workflow？ | Agent vs. Workflow | [我們要的是 AI Agent 還是一個 Workflow？](https://www.garyhsieh.com/blog/2026-03-30-ai-agent-workflow) |
| 10 | 說服是修辭，約束是工程 | Hooks & Anti-Rationalization | [為什麼會有 Hook 存在？](https://www.garyhsieh.com/blog/2026-05-09-hook-anti-rationalization-agent) |
| 11 | 從「會動」到「可控」 | The Agent Harness | [OpenClaw 跟 Claude Code 都用 Opus 4.6 — 為什麼結果差這麼多？](https://www.garyhsieh.com/blog/2026-04-26-openclaw-claude-code) |

### Chapter 3 — Memory：讓 AI 記得

| # | 概念 | 英文 | 原文出處 |
|---|------|------|----------|
| 12 | 記憶不在 AI 裡，在外面 | From Stateless to Stateful | [AI 從 Stateless 到 Stateful](https://www.garyhsieh.com/blog/2026-05-27-ai-stateless-stateful)、[AI Memory 工具實測](https://www.garyhsieh.com/blog/2026-05-30-ai-memory-llm) |
| 13 | 自我學習，就是超有紀律的記憶管理 | The Self-Improving Agent | [AI Agent 是怎麼自我學習的？](https://www.garyhsieh.com/blog/2026-05-13-ai-agent) |

### Chapter 4 — Multi-Agent 與長時間運行

| # | 概念 | 英文 | 原文出處 |
|---|------|------|----------|
| 14 | 卡住了？叫 AI 去找幫手 | Sub-agents | [跟 AI Coding Agent 工作卡住的時候](https://www.garyhsieh.com/blog/2026-03-28-ai-coding-agent) |
| 15 | Agent 怎麼聊天？作業系統早就演過了 | Agent Communication | [AI Agent 是怎麼溝通的？](https://www.garyhsieh.com/blog/2026-04-17-ai-agent-agent) |
| 16 | 不是撐得久，是交接零成本 | Long-running Agent | [原來我一直搞錯 Long-running Agent](https://www.garyhsieh.com/blog/2026-03-21-long-running-agent-loop)、[Session Handoff](https://www.garyhsieh.com/blog/2026-04-06-session-handoff-long-running)、[Harness Engineering](https://www.garyhsieh.com/blog/2026-04-11-llm-session-long-running) |

### Chapter 5 — 與 AI 協作的方法

| # | 概念 | 英文 | 原文出處 |
|---|------|------|----------|
| 17 | 第一次就對 | First-pass Acceptance | [不要追求 AI 多快生出 code](https://www.garyhsieh.com/blog/2026-03-26-ai-code) |
| 18 | 方向歪了？拉新訊號進來 | New Signals | [拉「新訊號」進來](https://www.garyhsieh.com/blog/2026-04-13-ai)、[救援 prompt](https://www.garyhsieh.com/blog/2026-05-02-ai) |
| 19 | 嚴謹搬家 | Relocating Rigor | [10 年前在群暉…嚴謹度只是換了位置](https://www.garyhsieh.com/blog/2026-06-04-relocating-rigor) |
| 20 | 三條反轉與不能外包的邊界 | Agentic Engineering | [Karpathy：Vibe Coding → Agentic Engineering](https://www.garyhsieh.com/blog/2026-05-06-andrej-karpathy-vibe) |

## 概念檔格式

每個 `concepts/NN-id.md` 都有 frontmatter（id / title / subtitle / chapter / chapterTitle / source[]）加六節：**一句話**（投影片級 punchline）、**三分鐘講稿**（保留原文口吻可直接唸）、**關鍵重點**、**互動示範構想**、**課堂提問**、**原文金句**。

網站的內容資料由 `site/scripts/build-data.mjs` 從這些 MD 檔自動產生（`npm run data`），概念檔是唯一的內容來源（single source of truth）。
