---
id: deterministic-vs-nondeterministic
title: Deterministic vs. Non-deterministic
subtitle: 確定性與非確定性
chapter: 1
chapterTitle: LLM 的本質
source:
  - title: "Agent 的手跟腳 / Tools，要怎麼裝到沒有狀態的 LLM 身上？"
    url: https://www.garyhsieh.com/blog/2026-05-18-agent-tools-llm
    date: 2026-05-18
  - title: "Agent 是怎麼做出來的？"
    url: https://www.garyhsieh.com/blog/2026-04-30-agent
    date: 2026-04-30
---

## 一句話

傳統程式同樣的輸入永遠給同樣的輸出；LLM 同樣的輸入，每次都可能給你不同的答案。

## 三分鐘講稿

寫了幾十年的軟體，我們習慣一件事：程式是確定的（deterministic）。`1 + 1` 永遠等於 `2`，同一個函式、同樣的輸入，跑一百萬次，結果一模一樣。整個軟體工程 — 測試、除錯、CI/CD — 都建立在這個地基上。

LLM 把這個地基抽掉了。同一個 prompt 丟給模型，這次它這樣回，下次它那樣回。因為它是在機率分布上抽樣 — 文字接龍的每一步，都是從一堆候選字裡「抽」一個出來。這就是 non-deterministic（非確定性）。

這不是 bug，是特性。抽樣帶來了創造力、多樣性、「像人」的感覺。但它也帶來了工程上的全新課題：你要怎麼測試一個每次輸出都不一樣的系統？你要怎麼信任它？

所以現代 Agent 設計裡，最重要的一條線就是：哪些事情交給 deterministic 的程式碼，哪些交給 non-deterministic 的 LLM。關鍵動作 — 刪檔案、發訊息、扣款 — 走 deterministic 的 tool schema + executor，控制力佳；需要理解、判斷、生成的 — 走 LLM。控制流可以預先定義的，用 code-based workflow；需要 LLM 全權決策的，才用 prompt-driven。

一句話總結：AI 時代的工程能力，就是知道把「確定」跟「不確定」各放在哪裡。

## 關鍵重點

- Deterministic：同輸入 → 同輸出，可測試、可預期（傳統程式）
- Non-deterministic：同輸入 → 機率抽樣 → 不同輸出（LLM 生成）
- 抽樣是特性不是 bug — 它是創造力的來源，也是風險的來源
- Agent 設計的核心決策：關鍵動作走 deterministic（tool schema + executor），彈性判斷走 probabilistic（LLM + prompt）
- 控制流可預先定義 → workflow；需要全權決策 → agent

## 互動示範構想

畫面分左右兩半。左邊是一台「函式機器」：輸入 `2 + 2`，按十次執行，十次都輸出 `4`，軌跡完全重疊成一條線。右邊是 LLM：同一個 prompt「用一句話形容今天」，按十次生成，十句都不一樣，輸出像煙火一樣散開成十條不同路徑。中間一個 temperature 滑桿：拉到 0，右邊的路徑開始收斂到幾乎同一句；拉高，路徑越散越有創意。使用者親手感受「確定 vs. 抽樣」的差別。

## 課堂提問

- 你的產品裡，哪些環節絕對不能交給 non-deterministic 的 LLM？
- Temperature = 0 的 LLM 算是 deterministic 嗎？（進階：為什麼實務上還是不完全一樣？）
- 如果測試無法「預期輸出」，那 AI 系統的品質要怎麼把關？

## 原文金句

> 你要 deterministic 還是 probabilistic 的 tool？走 tool schema ＋ executor → deterministic，控制力佳，適合關鍵動作。

> 它的控制流是 deterministic 還是 non-deterministic？如果流程可以預先定義，用 LangGraph 或 code-based workflow。如果需要 LLM 全權決策，用 prompt-driven。
