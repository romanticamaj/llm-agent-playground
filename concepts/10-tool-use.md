---
id: tool-use
title: Agent 的手跟腳
subtitle: Tool Use
chapter: 2
chapterTitle: 從聊天到 Agent
source:
  - title: "Agent 的手跟腳 / Tools，要怎麼裝到沒有狀態的 LLM 身上？"
    url: https://www.garyhsieh.com/blog/2026-05-18-agent-tools-llm
    date: 2026-05-18
---

## 一句話

LLM 只會輸出字，沒有手也沒有腳 — Tool 裝上去，它才開始「行動」。

## 三分鐘講稿

先講一個當天課堂上醫師們最有感的分水嶺。以前的 LLM 你問它、它就回你一段文字，僅此而已。Agent 不一樣 — 它輸出的不是文字，是**指令**：一句「去讀這個檔」「去跑這個腳本」「去發這封信」，然後真的有東西替它把指令執行掉。從「輸出文字」到「輸出指令去操作 tool」，這一步就是從聊天跨到行動的分水嶺。聽懂這句，整個 Agent 就懂一半了。

LLM 本質就是文字接龍 — 它沒有手也沒有腳。它能讀檔嗎？不能。能上網嗎？不能。能跑腳本嗎？更不能。它只會輸出字。

那為什麼 Claude Code 可以寫 code、ChatGPT 可以查天氣？因為大家在它後面裝了工具（Tool）。Tool 就是 Agent 的手跟腳。沒有 Tool，LLM 再會推理，結論也只能輸出成文字，不會「發生」任何事。

Tool 怎麼安裝？沒有想像中神秘，就兩件事：Schema — 一份 JSON「工具清單」，告訴 LLM 你有這些能力、長這樣呼叫；Executor — 真正的「工具程式碼」，跑在你的 harness 裡執行。LLM 只看到清單，看不到程式碼。它只負責讀清單、決定點哪一個、把點單吐回給你 — 真正的執行是在我們這邊。

整個 pattern 是一個 loop：訊息跟 tool schema 平行送進 API → LLM 回覆「我要用這個工具、參數是這些」外加一個 unique ID → 本地 loop 執行對應的 executor → 把結果配對同一個 ID 塞回 messages → 再 call 一次 API → LLM 看到結果繼續推理 → 直到它說「講完了」。

那無狀態的 LLM 為什麼「記得」自己剛用過工具？因為 harness 每一輪把前面所有 messages、tool_use、tool_result 全部重新組裝送回去。ID 配對就是重組過程裡的信號線。模型看到完整重組的 history，就像記得剛剛做了什麼一樣。

這就是 2022 年 ReAct 論文定下的雛形 — 推理跟行動交錯，一邊想一邊用工具。現在所有 agent loop 都是它的後代。

## 關鍵重點

- LLM 只會輸出字 — Tool 是讓「文字」變成「行動」的關鍵零件
- Tool = Schema（清單，LLM 看得到）+ Executor（程式碼，LLM 看不到）
- Tool use 是一個 loop：tool_use → 執行 → tool_result → 繼續推理
- tool_use.id ↔ tool_result.id 必須配對 — 這是無狀態架構上的信號線
- Agent 核心就三個東西：environment、tools、prompt，在一個 loop 裡跑

## 互動示範構想

一個可以步進（step-by-step）的環形動畫：中間是 LLM 大腦，右邊是 Executor 工具箱。使用者輸入「幫我查台北天氣」，按「下一步」逐格看：(1) 訊息+工具清單送進大腦 (2) 大腦吐出一張「點單」（get_weather, city=Taipei, id=abc123）(3) 點單飛到工具箱，齒輪轉動執行 (4) 結果卡片（晴，31°C）貼上同樣的 id 飛回 messages (5) 整串重新送進大腦 (6) 大腦輸出人話回答。每一步高亮「LLM 從頭到尾只看到文字」。進階模式：一次 fire 兩個 tool_use（parallel），讓使用者手動把兩張結果卡配對回正確的 ID — 配錯整個 loop 卡住。

## 課堂提問

- LLM 供應商會幫你執行工具程式碼嗎？誰真正在「動手」？
- 為什麼 tool_use 跟 tool_result 要用 ID 配對？
- 「賽博龐克成真那天，先砍斷 Tool 就對了」— 這句玩笑話背後的安全思維是什麼？

## 原文金句

> AI 這個東西你只要給它權限、它可以下指令，它就可以做事情。

> 以前的 LLM 輸出的是文字；Agent 輸出的是指令 — 用指令去操作 tool，這就是從聊天到行動的分水嶺。

> LLM 本質就是文字接龍——它沒有手也沒有腳。它能讀檔嗎？不能。能上網嗎？不能。能跑腳本嗎？更不能。它只會輸出字。

> Tool 就是 Agent 的手跟腳。沒有 Tool，LLM 永遠是文字接龍——它再會推理、再會規劃，結論也只能輸出成文字，不會「發生」任何事。

> 嘿嘿～所以賽博龐克成真那天，先砍斷 Tool 就對了 😎😎😎
