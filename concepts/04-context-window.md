---
id: context-window
title: Context Window 是 AI 的全部世界
subtitle: The Context Window
chapter: 1
chapterTitle: LLM 的本質
source:
  - title: "跟 AI 說「幫我記住這個」的時候，背後發生了什麼事？"
    url: https://www.garyhsieh.com/blog/2026-04-07-ai
    date: 2026-04-07
  - title: "Agent 是怎麼做出來的？"
    url: https://www.garyhsieh.com/blog/2026-04-30-agent
    date: 2026-04-30
---

## 一句話

Context window 不是 AI 的記憶體 — 它是一張有限的桌子，每次對話都要重新決定放什麼上去。

## 三分鐘講稿

Context window 是我覺得最重要的一個概念。它不是 AI 的記憶體上限，它是「一次 API call 能傳過去的 token 總量」。傳完就沒了，下次要重新傳 — 真的重傳，每次都要把一部分跟上次一樣的東西再送一次。

每次跟 AI 對話，背後其實是這樣組裝的：最前面是固定區 — identity、soul、agent 規範、tools、user 資訊，這些可以 cache；中間是動態區 — 撈回來的記憶加上對話歷史，每次不同；最後才是你當前的訊息。越穩定的放越前面，越動態的放越後面。

現在主流模型的 context window 都到 1M tokens 了 — 大概 75 萬字英文，或一整個中型 codebase。但重點來了：塞越多不代表 AI 用得越好。研究顯示模型對 context 開頭和結尾的資訊處理最好，中間容易漏掉 — 這叫 lost in the middle。

塞到上限會發生什麼事？觸發 compaction — AI 自動把前面的對話摘要壓縮，過程中丟失 nuance 跟 edge cases。這就是為什麼聊很久之後，AI 開始忘東忘西。

所以記住這個畫面：模型廠商把桌子撐大是一回事，放對東西到桌上，要靠我們自己。不然有三公尺的書桌，東西還是一直掉啊。

Agent 的視角更極端 — 不管架構設計多精密、檔案分得多細、cache 策略多講究，最終送進 LLM 的就是一段 text。Context Window = Agent 執行期的全部。

## 關鍵重點

- Context window = 一次 API call 的 token 總量，不是持久的記憶體
- 組裝順序有學問：穩定的往前放（可 cache），動態的往後放
- 塞越多 ≠ 越好 — lost in the middle：中間的資訊最容易被漏掉
- 滿了就 compaction：自動摘要壓縮，nuance 和 edge cases 會流失
- Context Window = Agent 執行期的全部世界

## 互動示範構想

畫面中央一張俯視的「桌子」（長條容量槽）。使用者按按鈕往上放東西：system prompt（藍磚）、tool 定義（綠磚）、記憶（黃磚）、對話歷史（灰磚，會隨聊天自動增生）。桌子漸滿，容量表逼近 100% 時警告閃爍，然後觸發 compaction 動畫：一大段灰磚被壓縮成一小塊「摘要磚」，但壓縮時有幾顆代表「細節」的小亮點掉出桌外消失 — 具象化「壓縮會丟失 nuance」。另附「lost in the middle」實驗鈕：在長 context 的開頭/中間/結尾各藏一個關鍵字，顯示模型對三個位置的注意力熱度圖。

## 課堂提問

- 為什麼「越穩定的內容放越前面」？（提示：跟 prompt cache 有關）
- 1M token 的 context window，是不是就不需要 memory 系統了？
- 你遇過 AI「聊到後面開始亂掉」嗎？現在你知道是為什麼了？

## 原文金句

> Context window 不是 AI 的記憶體上限，它是「一次 API call 能傳過去的 token 總量」。

> 塞越多不代表 AI 用得越好。

> 不然有三公尺的書桌，東西還是一直掉啊😂😂😂
