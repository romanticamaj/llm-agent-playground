---
id: long-running-agent
title: 不是撐得久，是交接零成本
subtitle: Long-running Agent
chapter: 6
chapterTitle: Multi-Agent 與長時間運行
source:
  - title: "原來我一直以來都搞錯 Long-running Agent / Loop Agent 的概念"
    url: https://www.garyhsieh.com/blog/2026-03-21-long-running-agent-loop
    date: 2026-03-21
  - title: "Session Handoff 看 Long-running Agent — Scaffold 出自己的 AI 開發流程"
    url: https://www.garyhsieh.com/blog/2026-04-06-session-handoff-long-running
    date: 2026-04-06
  - title: "如何讓 LLM 在不同session 之間不間斷地執行任務？從 Long-running Agent 框架看Harness Engineering"
    url: https://www.garyhsieh.com/blog/2026-04-11-llm-session-long-running
    date: 2026-04-11
  - title: "犯蠢…Claude Code Dynamic Workflow 開下去，210 個 agent 開始跑"
    url: https://www.garyhsieh.com/blog/2026-07-10-dynamic-workflow-hit-limit
    date: 2026-07-10
  - title: "我現在每到晚上 10 點左右就會開始睡前焦慮"
    url: https://www.garyhsieh.com/blog/2026-07-19-token-anxiety
    date: 2026-07-19
---

## 一句話

Long-running 不是讓一個 session 撐很久，是讓無限個 session 可以接力跑下去 — 核心是「交接零成本」。

## 三分鐘講稿

原來我一直以來都搞錯 Long-running Agent 的概念。我以為 long-running 就是「一個 session 跑很久，context window 越大越好」— 讀完 Anthropic 的《2026 Agentic Coding Trends Report》才發現完全不是這麼回事。

Long-running 的核心是「交接零成本」。

大家最常遇到的痛點是：這個 session 做得很開心，但 context 要爆的時候就開始 compact，甚至要 reset。除非靠 Coding Agent 自己做的記憶管理，不然根本沒辦法延續做 — 沒有人想要靠 Vibe Coding 一直祈禱。所以問題從來就不是「怎麼讓一個 session 撐得更久」，而是無止境的 session 接龍，不斷地傳遞 context 下去，直到任務完成。

Anthropic 用了一個很精準的比喻：Agent 跨 session 工作就像工程師輪班，每個新來的工程師對上一班發生了什麼完全沒有記憶。如果交班紀錄寫得好，新人幾分鐘就能上手；如果什麼都沒留，就是花第一個小時重建 context，而且通常會理解錯。

Anthropic 的工程團隊讓 Claude 自主建了一個 claude.ai clone，兩百多個 features，過程中發現三個失敗模式：agent 嘗試 one-shot 整個 app，context 中途燒完，下一個 session 接手一個半成品爛攤子；後面的 agent 看到前面已經有進度，直接宣布完成，提早下班；agent 寫完 code 跑個 unit test 就標記 done，但 E2E 根本是壞的。聽起來像不像某些人類同事？

他們的解法是 Initializer + Coding Agent 雙 Prompt 架構：第一個 session 建環境 — feature checklist 用 JSON 不用 markdown，因為 agent 會偷改 markdown 的結構。之後每個 session 讀交班日誌、挑一個 feature、只做一個、E2E 驗證、commit、更新交班日誌。每個 session 結束時，code 必須是「可以 merge 到 main」的狀態，沒有半成品。

記住這個類比：Context Window = RAM，Filesystem = Disk。我們不會把重要資料只存在 RAM 裡，Agent 的工作記憶也一樣 — 重要的東西寫在磁碟上，不是留在 context window。

而且這個思路不只適用於寫 code — 寫技術文件、做研究報告、經營內容，任何需要「拆解 → 執行 → 驗收 → 接力」的工作都行。把大目標拆成可以一棒一棒傳下去的單位，每一棒結束時狀態是乾淨的，下一棒能直接接手。這就是 session 接力賽。

講兩個我自己的戰爭故事，讓這件事更有體感。第一個是翻車現場：有一次我 Claude Code 的 dynamic workflow 開下去，一口氣 spawn 了 210 個 agent 開始跑，我還很得意，結果不到半小時就 hit limit — 一查才發現 subagent 預設用的是 fable 5 這種貴模型，額度瞬間燒光，週重置還在下星期二，我當週剩四個工作天都得省著用。這個坑的教訓很直接：接力賽能無限接下去是一回事，但每一棒用哪顆模型、平行開幾棒，是你要 harness 進去的設計 — 不是開越多越好，額度是真實的邊界。第二個是另一種極端：我現在每到晚上十點就會開始「睡前焦慮」，因為要想今晚一點以後的 long-running 要跑什麼、spec 準備好了嗎、測試環境確認了嗎。我已經太習慣睡覺期間一定要擺一個東西下去跑，沒在跑就覺得整晚浪費掉了。這其實正是接力賽威力的證明 — 當交接成本降到夠低、每一棒都能自己跑完自己驗，你的產能就從「白天你在場的八小時」解放成「連你睡著的八小時都在推進」。一個是提醒你 harness 要管住資源，一個是提醒你 harness 做對了紅利有多大，剛好兩頭。

## 關鍵重點

- Long-running ≠ 一個 session 跑很久；核心是「交接零成本」，讓無限個 session 接力跑下去
- 三個失敗模式：one-shot 燒完 context 留半成品、看到進度就宣布完成提早下班、跑個 unit test 就標記 done 但 E2E 是壞的
- 解法是 Initializer + Coding Agent 雙 Prompt 架構：Initializer 建環境（JSON feature checklist、init.sh、交班日誌、initial commit），之後每個 session 走 7 步 loop、只做一個 feature、結束時可 merge
- Context Window = RAM，Filesystem = Disk — 計畫和狀態要落地到磁碟（feature list、交班日誌、git log），每個 session 都是 disposable 的
- Harness 是你幫 agent 設計的軌道，而且會隨模型能力演化；這套思路適用於任何「拆解 → 執行 → 驗收 → 接力」的工作

## 互動示範構想

一個「session 接力賽」模擬器。畫面上方是一條任務跑道，目標是完成 10 個 features；下方有兩個模式按鈕：「One-shot 硬跑」和「接力模式」。

按「One-shot 硬跑」：一個 agent 角色沿跑道前進，頭上的 context 條（RAM）快速消耗，跑到第 4 個 feature 時 context 燒完、角色倒地，畫面留下一堆半成品的碎片圖示。下一個 session 進場，看到碎片後隨機觸發原文的失敗模式之一：彈出對話框「看起來差不多了，宣布完成！」（提早下班）或「unit test 過了，標記 done」（但 E2E 圖示是紅的）。

按「接力模式」：先出現 Initializer 角色，在跑道旁放下三個道具 — JSON feature checklist、init.sh、空白交班日誌 claude-progress.txt，然後 initial commit。接著每個 runner 進場時播放固定動畫：讀交班日誌 → 挑一個 feature → 跑 smoke test → 實作一個 → E2E 綠燈 → git commit → 寫交班日誌 → 把接力棒（一份小小的日誌檔案圖示）交給下一棒。每一棒結束時跑道上會蓋一個「可 merge」的綠色印章。使用者可以隨時按「Kill session」隨機砍掉一個 runner — 接力模式下砍掉完全沒差，下一棒讀日誌照樣接手，直觀展示「每個 session 都是 disposable 的」。

側邊欄常駐一個對照表：Context Window = RAM / Filesystem = Disk，接力模式下磁碟區的檔案（feature list、日誌、git log）會隨每棒更新閃爍。

## 課堂提問

- 你現在的專案如果 session 突然 crash，下一個 session 要花多久才能接手？交班需要的資訊現在存在哪裡 — RAM 還是 Disk？
- 為什麼 feature checklist 要用 JSON 不用 markdown？這反映了對 agent 什麼樣的不信任？
- 除了寫 code，你手上有什麼工作可以套用「拆解 → 執行 → 驗收 → 接力」？每一棒之間需要傳遞什麼、怎樣算「做完」？

## 原文金句

> Long-running 的核心是「交接零成本」

> 問題從來就不是「怎麼讓一個 Session 撐得更久」，而是無止境的 session 接龍，不斷地傳遞 Context 下去，直到這個任務完成。

> Agent 跨 session 工作就像工程師輪班，每個新來的工程師對上一班發生了什麼完全沒有記憶。如果交班紀錄寫得好，新人幾分鐘就能上手；如果什麼都沒留，就是花第一個小時重建 context，而且通常會理解錯。

> Dynamic Workflow 開下去，210 個 agent 開始跑，不到半小時就發現 hit limit — 這就是不熟悉工具的下場。

> 我已經太習慣睡覺期間一定要擺一個東西下去跑了。如果沒有在跑，就會覺得整個晚上浪費掉。
