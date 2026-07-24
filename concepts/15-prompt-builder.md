---
id: prompt-builder
title: 一次性 prompt 是 leverage，Builder 是複利
subtitle: The Prompt Builder
chapter: 3
chapterTitle: 從聊天到 Agent
source:
  - title: "每個人都應該要有一個自己的 Prompt Builder"
    url: https://www.garyhsieh.com/blog/2026-06-23-prompt-builder
    date: 2026-06-23
  - title: "生成式 AI 的終點：Higher-Order Prompting"
    url: https://www.garyhsieh.com/blog/2026-06-23-higher-order-prompting
    date: 2026-06-23
---

## 一句話

不要再每次手寫 prompt — 寫一個「會生出 prompt 的 prompt」，讓 AI 幫你把品味翻成它聽得懂的話。

## 三分鐘講稿

先講一個大家每天都在做、但很浪費的動作：每次要問 AI，就從頭慢慢手寫 prompt。這件事其實可以抽象化 — 把「寫 prompt」這件事外包給 AI，然後用 AI 幫你寫出來的 prompt，再回頭去問你真正的問題。

最簡單的版本，你今天就能用：想問一個問題，先別急著問。第一步先叫 AI「幫我把這個問題整理成一個好的 prompt」，它生完，你再用那個 prompt 去問。為什麼有效？因為我們前面講過，AI 對開頭特別敏感（primacy）— 開頭問得好，後面整串答得也好。花一步把開頭弄漂亮，CP 值超高。

再往上一層，如果某類東西你常常在做，就把偏好固定下來 — 寫進 AI「專案」的 system prompt 裡。之後每次在那個專案聊天，它自動幫你套上你的講法、你不想每次重講的細節。它就記在那，不會失憶。

最上面那一層，是我最近在玩的。我在幫自己的音樂作品做生圖，想要某種藝術家風格。那種能生出漂亮圖的 prompt，裡面一堆 corner framing、hero composition 之類的東西 — 抽象層級太低，你叫我手寫，我根本寫不出來。所以我沒去寫那個 prompt，我寫了一個 Skill，跟它說：你除了幫我生圖，還要幫我 build 一個「生 prompt 的 builder」。舉例，我要雲彩流動的畫面，直覺就跟它講「雲彩流動」，但自然的雲彩不可能流那麼快。我不想每次都補一句「不要縮時、慢慢流」，所以我把這個約束收進 builder，讓它自己幫我轉換。我只給 high-level 的意圖跟品味，中間又細又雜的那層轉換，丟給 AI 補掉。

這件事有個學術名字叫 meta-prompting，但我更喜歡用 higher-order 來想它 — 就像 higher-order function 是「會處理 function 的 function」，higher-order prompt 就是「會生出 prompt 的 prompt」。文字、圖片、音樂、影片生成，最後全都收斂到這個技巧。

但最關鍵的一句話在這：builder 寫得好不好，回到的是你的品味跟領域的通透了解。別人可以 fork 走我的 prompt，但 fork 不走我的品味。這也是為什麼這章要從「聊天」走到「Agent」— 你在把自己的工作流程，變成一個可重複、會複利的資產。

## 關鍵重點

- 把「寫 prompt」這件事本身抽象化、外包給 AI，再用生出來的 prompt 去問真正的問題
- 三個層級：臨時叫 AI 幫你整理 prompt → 寫進專案 system prompt → 做一個專屬的 prompt builder（skill）
- Higher-Order Prompting ＝「會生出 prompt 的 prompt」，四種生成領域最後都收斂到這
- Builder 幫你消化掉「我懶得每次重講」的約束，你只給意圖與品味
- 護城河不是 prompt 本身，是你的品味與 domain expertise — 那個 fork 不走

## 互動示範構想

三格階梯式面板，對應三個抽象層級。第一格：使用者輸入一句粗糙的問題，按鈕「先請 AI 幫我寫成好 prompt」，即時生出優化版並比對前後差異。第二格：把幾條個人偏好（語氣、禁止句型、預設風格）拖進一個「專案設定」盒子，之後每次提問都自動套上，畫面顯示被自動補上的內容。第三格「Builder」：使用者只輸入 high-level 意圖（例如「雲彩流動」），builder 自動展開成一大段結構化 prompt（補上「慢速、非縮時、HDR」等品味約束）。三格並排，讓人看見「同一個意圖，抽象層級越高、你手寫的字越少」。

## 課堂提問

- 你有沒有一類 prompt 是每次都要重打一長串同樣的交代？那正是該做成 builder 的東西
- 「fork 得走 prompt，fork 不走品味」— 對你的工作而言，你的「品味」具體是什麼、藏在哪些判斷裡？
- 一次性 prompt 是 leverage、builder 是複利 — 你目前的 AI 用法，卡在 leverage 還是已經在累積複利？

## 原文金句

> 一次性的 prompt 是 leverage，被歸納下來的 builder 是複利，被演化出來的自主 AI Agent 是一週工作四天的底氣。

> 別人 fork 得走我的 prompt，但 fork 不走我的品味。

> higher-order prompt 就是「會生出 prompt 的 prompt」。
