---
id: deterministic-vs-nondeterministic
title: Deterministic vs. Non-deterministic
subtitle: 確定性與非確定性
chapter: 2
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

在診所裡我最愛用一個例子：什麼事情是 deterministic 的？就是你講得出第一步、第二步、第三步的事 — 對帳、掛號流程、自費表核對，SOP 攤開來白紙黑字，照著做就對。這種交給程式，穩。反過來，排班就不是了。排班要「公平」，可是公平沒辦法量化、沒辦法白紙黑字定義 — 誰上大夜、誰換連假、誰上個月已經被凹過了，這裡面全是說不清楚的權衡。這種說不出步驟、只能憑感覺抓平衡的，就是非決定性的事，正好丟給 AI 去打分、去給建議。

所以現代 Agent 設計裡，最重要的一條線就是：哪些事情交給 deterministic 的程式碼，哪些交給 non-deterministic 的 LLM。關鍵動作 — 刪檔案、發訊息、扣款 — 走 deterministic 的 tool schema + executor，控制力佳；需要理解、判斷、生成的 — 走 LLM。控制流可以預先定義的，用 code-based workflow；需要 LLM 全權決策的，才用 prompt-driven。

一句話總結：AI 時代的工程能力，就是知道把「確定」跟「不確定」各放在哪裡 — 講得出步驟的歸程式，講不出步驟的歸 AI。

## 關鍵重點

- Deterministic：同輸入 → 同輸出，可測試、可預期（傳統程式）
- Non-deterministic：同輸入 → 機率抽樣 → 不同輸出（LLM 生成）
- 抽樣是特性不是 bug — 它是創造力的來源，也是風險的來源
- 一個超好用的分辨法：說得出第一步第二步第三步 → deterministic（對帳、掛號 SOP）；說不出步驟、只能憑感覺抓平衡 → 非決定性（排班要公平，公平沒辦法量化）→ 丟給 AI 打分
- Agent 設計的核心決策：關鍵動作走 deterministic（tool schema + executor），彈性判斷走 probabilistic（LLM + prompt）
- 控制流可預先定義 → workflow；需要全權決策 → agent

## 互動示範構想

畫面分左右兩半。左邊是一台「函式機器」：輸入 `2 + 2`，按十次執行，十次都輸出 `4`，軌跡完全重疊成一條線。右邊是 LLM：同一個 prompt「用一句話形容今天」，按十次生成，十句都不一樣，輸出像煙火一樣散開成十條不同路徑。中間一個 temperature 滑桿：拉到 0，右邊的路徑開始收斂到幾乎同一句；拉高，路徑越散越有創意。使用者親手感受「確定 vs. 抽樣」的差別。

進階模式「工作流分類器」：畫面上散落一疊任務卡（對帳、掛號、排班、寫社群貼文、催繳通知、審核自費表…），中央擺兩個籃子 — 左邊「說得出步驟 → 程式」、右邊「說不出步驟 → 丟給 AI」。使用者把卡片一張張拖進籃子，拖完系統給回饋：對帳、掛號拖進左籃 ✓；排班、寫貼文拖進右籃 ✓；拖錯的（例如把「扣款」丟進 AI 籃）跳出提醒「這是關鍵動作，錯了要付代價，應該走 deterministic」。玩一輪就內化了那條分界線。

## 課堂提問

- 你診所／公司裡哪些流程是「說得出第一步第二步第三步」的？哪些是講不出步驟、只能憑感覺抓平衡的？
- 你的產品裡，哪些環節絕對不能交給 non-deterministic 的 LLM？
- Temperature = 0 的 LLM 算是 deterministic 嗎？（進階：為什麼實務上還是不完全一樣？）
- 如果測試無法「預期輸出」，那 AI 系統的品質要怎麼把關？

## 原文金句

> 你要 deterministic 還是 probabilistic 的 tool？走 tool schema ＋ executor → deterministic，控制力佳，適合關鍵動作。

> 它的控制流是 deterministic 還是 non-deterministic？如果流程可以預先定義，用 LangGraph 或 code-based workflow。如果需要 LLM 全權決策，用 prompt-driven。
