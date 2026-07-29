# LLM Agent Playground — AI 概念實驗室

**Live: [garyhsieh.com/ai-lab](https://www.garyhsieh.com/ai-lab)**

把 Gary Hsieh（garyhsieh.com）的 AI 心得文章，整理成可直接上課使用的教學概念庫 + 互動式教學網站 — 目前共 **9 章、40 個概念**。

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

全站 **9 章、40 概念**，分三條路徑：**Ch1–Ch3 是入門・授課主線**（診所／一般團隊上課用的核心概念），**Ch4–Ch8 是進階・工程師路線**（多在工程師場才展開），**Ch9 是視野・工作型態與品味**（全站收束，談 AI 之後的工作型態與最後決勝的品味）。標「課堂實錄」的概念來自 2026-07-22 授課實錄整理。

### Chapter 1 — 開場：為什麼是概念　`🟢 入門・授課主線`

| # | 概念 | 英文 | 原文出處 |
|---|------|------|----------|
| 01 | 追工具，還是追概念？ | Chase Concepts, Not Tools | [AI 工具推陳出新這麼快，我該怎麼跟得上？](https://www.garyhsieh.com/blog/2026-04-11-ai-ai) |
| 02 | 你只有 100 分 — 認知負荷三分法 | Cognitive Load | 課堂實錄 |

### Chapter 2 — LLM 的本質　`🟢 入門・授課主線`

| # | 概念 | 英文 | 原文出處 |
|---|------|------|----------|
| 03 | AI 是文字接龍 | Next-token Prediction | [聊聊為什麼需要沒事多按「編輯」？](https://www.garyhsieh.com/blog/2026-04-22-ai-prompt-ai) |
| 04 | Deterministic vs. Non-deterministic | 確定性與非確定性 | [Agent 的手跟腳](https://www.garyhsieh.com/blog/2026-05-18-agent-tools-llm)、[Agent 是怎麼做出來的？](https://www.garyhsieh.com/blog/2026-04-30-agent) |
| 05 | LLM 根本沒有記憶 | LLM is Stateless | [跟 AI 說「幫我記住這個」…](https://www.garyhsieh.com/blog/2026-04-07-ai) |
| 06 | Context Window 是 AI 的全部世界 | The Context Window | [跟 AI 說「幫我記住這個」…](https://www.garyhsieh.com/blog/2026-04-07-ai)、[Agent 是怎麼做出來的？](https://www.garyhsieh.com/blog/2026-04-30-agent)、[聊久了為什麼會忘東忘西？](https://www.garyhsieh.com/blog/2026-06-21-lost-in-the-middle) |
| 07 | 選大腦 | Choosing Your Model | 課堂實錄 + [跟 AI 說「幫我記住這個」…](https://www.garyhsieh.com/blog/2026-04-07-ai)、[Agentic Programming 起手式](https://www.garyhsieh.com/blog/2026-07-20-agentic-programming-setup) |
| 08 | 貨車滿了，怎麼辦？ | Compaction & Fresh Context | 課堂實錄 + [Session Handoff 看 Long-running Agent](https://www.garyhsieh.com/blog/2026-04-06-session-handoff-long-running) |
| 09 | 編輯鈕是時光機 | Context Pollution & Rewind | [聊聊為什麼需要沒事多按「編輯」？](https://www.garyhsieh.com/blog/2026-04-22-ai-prompt-ai) |
| 10 | 請你輸出 HTML 格式讓我看 | Output Formats | 課堂實錄 |

### Chapter 3 — 從聊天到 Agent　`🟢 入門・授課主線`

| # | 概念 | 英文 | 原文出處 |
|---|------|------|----------|
| 11 | Agent 是怎麼做出來的？ | Anatomy of an Agent | [Agent 是怎麼做出來的？](https://www.garyhsieh.com/blog/2026-04-30-agent) |
| 12 | Agent 的手跟腳 | Tool Use | [Agent 的手跟腳 / Tools](https://www.garyhsieh.com/blog/2026-05-18-agent-tools-llm) |
| 13 | 方向歪了？拉新訊號進來 | New Signals / Dynamic Decomposition | [拉「新訊號」進來](https://www.garyhsieh.com/blog/2026-04-13-ai)、[救援 prompt](https://www.garyhsieh.com/blog/2026-05-02-ai)、[先用 Web Search 驗證](https://www.garyhsieh.com/blog/2026-04-15-web-search-ai) |
| 14 | 把成功的流程，變成可重複的工具 | Skills | 課堂實錄 + [Software Engineering w/ Claude 2026](https://www.garyhsieh.com/blog/2026-05-11-software-engineering-claude) |
| 15 | 一次性 prompt 是 leverage，Builder 是複利 | The Prompt Builder | [每個人都應該有一個 Prompt Builder](https://www.garyhsieh.com/blog/2026-06-23-prompt-builder)、[Higher-Order Prompting](https://www.garyhsieh.com/blog/2026-06-23-higher-order-prompting) |
| 16 | GPTs、Gem、Project — 只是接龍的開頭 | Project = Fixed Prefix | 課堂實錄 + [聊聊為什麼需要沒事多按「編輯」？](https://www.garyhsieh.com/blog/2026-04-22-ai-prompt-ai) |
| 17 | MCP — 工具的 USB 接口 | Model Context Protocol | [資訊落差超級大的事情（AI 整理 Gmail）](https://www.garyhsieh.com/blog/2026-05-24-ai-gmail-chatgpt) |
| 18 | 資料友善、資料轉換、資料接口 | Data Literacy | 課堂實錄 |
| 19 | 同一顆大腦，不同的身體 | The Product Map | 課堂實錄 + [OpenClaw 跟 Claude Code 都用 Opus 4.6](https://www.garyhsieh.com/blog/2026-04-26-openclaw-claude-code) |
| 20 | 先確認 Tool 真的有動 | Verify the Tool Fired | 課堂實錄 + [不要追求 AI 多快生出 code](https://www.garyhsieh.com/blog/2026-03-26-ai-code) |

### Chapter 4 — Memory：讓 AI 記得　`🟡 進階・工程師路線`

| # | 概念 | 英文 | 原文出處 |
|---|------|------|----------|
| 21 | 記憶不在 AI 裡，在外面 | From Stateless to Stateful | [AI 從 Stateless 到 Stateful](https://www.garyhsieh.com/blog/2026-05-27-ai-stateless-stateful)、[AI Memory 工具實測](https://www.garyhsieh.com/blog/2026-05-30-ai-memory-llm) |
| 22 | 自我學習，就是超有紀律的記憶管理 | The Self-Improving Agent | [AI Agent 是怎麼自我學習的？](https://www.garyhsieh.com/blog/2026-05-13-ai-agent)、[讓 coding agent 不停下來的招](https://www.garyhsieh.com/blog/2026-06-11-long-running-rules) |

### Chapter 5 — Agent 工程　`🟡 進階・工程師路線`

| # | 概念 | 英文 | 原文出處 |
|---|------|------|----------|
| 23 | Agent 還是 Workflow？ | Agent vs. Workflow | [我們要的是 AI Agent 還是一個 Workflow？](https://www.garyhsieh.com/blog/2026-03-30-ai-agent-workflow) |
| 24 | 說服是修辭，約束是工程 | Hooks & Anti-Rationalization | [為什麼會有 Hook 存在？](https://www.garyhsieh.com/blog/2026-05-09-hook-anti-rationalization-agent) |
| 25 | 從「會動」到「可控」 | The Agent Harness | [OpenClaw 跟 Claude Code 都用 Opus 4.6](https://www.garyhsieh.com/blog/2026-04-26-openclaw-claude-code)、[到底什麼是 Harness？](https://www.garyhsieh.com/blog/2026-06-19-what-is-harness) |
| 26 | 算過的，別再算 | Prompt Cache / KV Cache | [為什麼會有 prompt cache？](https://www.garyhsieh.com/blog/2026-06-03-prompt-cache) |
| 27 | 停止手寫 Harness | Harness Depreciates | [停止手寫 harness](https://www.garyhsieh.com/blog/2026-07-19-stop-writing-harness) |

### Chapter 6 — Multi-Agent 與長時間運行　`🟡 進階・工程師路線`

| # | 概念 | 英文 | 原文出處 |
|---|------|------|----------|
| 28 | 卡住了？叫 AI 去找幫手 | Sub-agents | [跟 AI Coding Agent 工作卡住的時候](https://www.garyhsieh.com/blog/2026-03-28-ai-coding-agent) |
| 29 | Agent 怎麼聊天？作業系統早就演過了 | Agent Communication | [AI Agent 是怎麼溝通的？](https://www.garyhsieh.com/blog/2026-04-17-ai-agent-agent) |
| 30 | 不是撐得久，是交接零成本 | Long-running Agent | [原來我一直搞錯 Long-running Agent](https://www.garyhsieh.com/blog/2026-03-21-long-running-agent-loop)、[Session Handoff](https://www.garyhsieh.com/blog/2026-04-06-session-handoff-long-running)、[Harness Engineering](https://www.garyhsieh.com/blog/2026-04-11-llm-session-long-running)、[210 個 agent 開始跑](https://www.garyhsieh.com/blog/2026-07-10-dynamic-workflow-hit-limit)、[睡前 token 焦慮](https://www.garyhsieh.com/blog/2026-07-19-token-anxiety) |

### Chapter 7 — 與 AI 協作的方法　`🟡 進階・工程師路線`

| # | 概念 | 英文 | 原文出處 |
|---|------|------|----------|
| 31 | 第一次就對 | First-pass Acceptance | [不要追求 AI 多快生出 code](https://www.garyhsieh.com/blog/2026-03-26-ai-code) |
| 32 | 嚴謹搬家 | Relocating Rigor | [嚴謹度只是換了位置](https://www.garyhsieh.com/blog/2026-06-04-relocating-rigor)、[閱讀 AI 產出為什麼累](https://www.garyhsieh.com/blog/2026-06-10-cognitive-load-review) |
| 33 | 三條反轉與不能外包的邊界 | Agentic Engineering | [Karpathy：Vibe Coding → Agentic Engineering](https://www.garyhsieh.com/blog/2026-05-06-andrej-karpathy-vibe) |

### Chapter 8 — 安全與評測　`🟡 進階・工程師路線`

| # | 概念 | 英文 | 原文出處 |
|---|------|------|----------|
| 34 | 約定不是牆 | Boundaries Are Not Walls | [某 AI Agent App 的權限邊界實測](https://www.garyhsieh.com/blog/2026-06-26-agent-permission-boundary)、[AI Native Agent App 的安全邊界](https://www.garyhsieh.com/blog/2026-06-27-agent-app-security) |
| 35 | 每次亂講，都變成一條 regression | Agent Evals | [怎麼驗證你的 AI Agent 不會亂講話？](https://www.garyhsieh.com/blog/2026-07-15-promptfoo-agent-eval) |

### Chapter 9 — 視野：工作型態與品味　`🔵 視野・工作型態與品味`

| # | 概念 | 英文 | 原文出處 |
|---|------|------|----------|
| 36 | 迭代速度 ≈ 1 / 驗證摩擦 | Verification Friction | [2026 開發趨勢：遠離開發機](https://www.garyhsieh.com/blog/2026-06-15-tailscale-dev-loop)、[無限大 Engineering](https://www.garyhsieh.com/blog/2026-07-02-infinity-engineering)、[Remote Engineering](https://www.garyhsieh.com/blog/2026-07-23-remote-engineering) |
| 37 | 等待時間就是第二條產線 — Round Robin | Round Robin | 課堂實錄 |
| 38 | 你在 Agentic Engineering 第幾級？ | The 8 Levels | [Martin Fowler 的 8 個 agentic engineering Level](https://www.garyhsieh.com/blog/2026-03-20-martin-fowler-agentic) |
| 39 | AI 把簡單的事做完了，剩下的全是難題 | The Vampire Gremlin | [AI 把簡單的事全做完了，剩下的全是難題](https://www.garyhsieh.com/blog/2026-02-20-ai) |
| 40 | 最後決定勝負的，是品味 | Taste Wins | [AI 會取代工程師和音樂人嗎？](https://www.garyhsieh.com/blog/2026-02-18-ai)、[有想法的人應該自己出來做](https://www.garyhsieh.com/blog/2026-03-04-ai) |

## 概念檔格式

每個 `concepts/NN-id.md` 都有 frontmatter（id / title / subtitle / chapter / chapterTitle / source[]，課堂實錄的概念另標 `classroom: true`）加六節：**一句話**（投影片級 punchline）、**三分鐘講稿**（保留原文口吻可直接唸）、**關鍵重點**、**互動示範構想**、**課堂提問**、**原文金句**。

網站的內容資料由 `site/scripts/build-data.mjs` 從這些 MD 檔自動產生（`npm run data`），概念檔是唯一的內容來源（single source of truth）。
