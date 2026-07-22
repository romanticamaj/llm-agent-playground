---
id: agent-anatomy
title: Agent 是怎麼做出來的？
subtitle: Anatomy of an Agent
chapter: 2
chapterTitle: 從 LLM 到 Agent
source:
  - title: "Agent 是怎麼做出來的？"
    url: https://www.garyhsieh.com/blog/2026-04-30-agent
    date: 2026-04-30
---

## 一句話

一個很強的 LLM，配上一堆工具、一堆很精密的操作規範 — 然後就變一個 Agent 了。

## 三分鐘講稿

Agent 是怎麼做出來的？一個很強的 LLM，配上一堆工具、一堆很精密的操作規範，然後就變一個 Agent 了。

拆任何 agent 之前，先建立一個直覺 — Agent 有三層結構。第一層是大腦：LLM 本身，負責推理、理解、生成回應。但它什麼都不記得，每次對話都從零開始，它的全部世界就是 context window 裡的東西。第二層是身體：工具。Browser、file system、code execution、API calls — 讓 agent 能跟外界互動，不只是說話。第三層是骨架（Harness）：看不到但最重要的一層，負責在每次 API call 之前，把對的 prompt、對的工具定義、對的記憶、對的使用者資訊，組裝成完整的 context，餵給大腦。

而那些定義 agent 行為的內容，很多時候就是 — 一組 .md 檔案。就這樣。SOUL.md 定義它是誰、什麼可以做什麼不行（行為邊界）；TOOLS.md 定義它能用什麼（能力邊界）；AGENTS.md 是工作手冊；USER.md 說明它服務誰；MEMORY.md 是累積的知識。一個 LLM 加上一組被精心組裝的 context，它就從聊天機器人 promote 成了 Agent。

但重點在後半句：這些檔案怎麼寫、怎麼拼、什麼時候塞進去、塞多少、哪些該 cache 哪些不該 — 才是整個 Agent Engineering 真正在做的事。

最後記住這個收斂點：不管架構多精密、檔案分得多細，最終送進 LLM 的就是一段 text。Context Window = Agent 執行期的全部。

## 關鍵重點

- Agent 三層結構：大腦（LLM）、身體（Tools）、骨架（Harness）
- Agent 的人格與規範，常常就是一組 .md 檔案（SOUL / TOOLS / AGENTS / USER / MEMORY）
- 能力邊界（TOOLS.md：能不能做）≠ 行為邊界（SOUL.md：該不該做）
- Harness 的工作：每次 API call 前把所有素材組裝成 context
- Context Window = Agent 執行期的全部世界

## 互動示範構想

「組裝一隻 Agent」：畫面中央一個空的人形輪廓。使用者依序拖入三個零件 — 大腦（LLM 晶片，裝上後會「說話」但什麼都做不了）、身體（工具手腳：裝上 file、browser、bash 圖示，它開始能「動」）、骨架（harness 脊椎，裝上後出現 context 組裝動畫：SOUL.md、TOOLS.md、MEMORY.md 一張張卡片飛進 context window 條）。組裝完成，Agent 眼睛亮起、開始跑一個小任務。中途可以抽掉任一零件觀察它退化成什麼樣子（抽掉工具 → 只剩嘴砲；抽掉骨架 → 失憶亂做）。

## 課堂提問

- 為什麼說「行為邊界」跟「能力邊界」要分開管理？
- 你如果要做一個自己的 Agent，SOUL.md 第一條會寫什麼？
- 為什麼 .md 檔案就足以定義一個 Agent 的行為？

## 原文金句

> 一個很強的 LLM，配上一堆工具、一堆很精密的操作規範，然後就變一個 Agent 了。

> 一個 LLM 加上一組被精心組裝的 context，它就從一個聊天機器人 promote 成了一個 Agent。

> Context Window = Agent 執行期的全部
