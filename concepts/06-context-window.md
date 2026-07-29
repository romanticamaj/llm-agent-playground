---
id: context-window
title: Context Window 是 AI 的全部世界
subtitle: The Context Window
chapter: 2
chapterTitle: LLM 的本質
source:
  - title: "跟 AI 說「幫我記住這個」的時候，背後發生了什麼事？"
    url: https://www.garyhsieh.com/blog/2026-04-07-ai
    date: 2026-04-07
  - title: "Agent 是怎麼做出來的？"
    url: https://www.garyhsieh.com/blog/2026-04-30-agent
    date: 2026-04-30
  - title: "為什麼跟 AI 聊久了，它就開始忘東忘西？"
    url: https://www.garyhsieh.com/blog/2026-06-21-lost-in-the-middle
    date: 2026-06-21
---

## 一句話

Context window 不是 AI 的記憶體 — 它是一台從台中開到台北的貨車，車上一次只能載 100 個貨，每趟都要重新決定裝什麼上車。

## 三分鐘講稿

Context window 是我覺得最重要的一個概念。它不是 AI 的記憶體上限，它是「一次 API call 能傳過去的 token 總量」。傳完就沒了，下次要重新傳 — 真的重傳，每次都要把一部分跟上次一樣的東西再送一次。

我最喜歡用貨車來講這件事：一台貨車從台中開到台北，車斗一次只能載 100 個貨。你這次要 AI 做的事、要它記得的東西，全部都得塞在這 100 個貨的空間裡，一起送上去。送到台北卸完，車就空了，下一趟要重裝。它不是一張永遠放在那的桌子，它是一台每趟都要重新裝貨的車。

車要怎麼裝才順？最前面是固定區 — identity、soul、agent 規範、tools、user 資訊，這些每趟都一樣、可以 cache；中間是動態區 — 撈回來的記憶加上對話歷史，每次不同；最後才是你當前的訊息。越穩定的貨放越前面，越動態的放越後面。

順便講 attention 這個詞怎麼來的。你看小朋友的注意力，能專注個幾十秒就不錯了 — 模型也一樣，它一次能「注意」的量是有限的。GPT 那個 T 就是 Transformer，Transformer 的核心機制就叫 attention，整個模型講的就是「這一車貨裡，我這一步該注意哪幾個」。所以 context window 就是它一次能注意的範圍上限。

現在主流模型的車斗都撐到 1M tokens 了 — 大概 75 萬字英文，或一整個中型 codebase。但重點來了：貨裝越滿不代表 AI 用得越好。研究顯示模型對車頭跟車尾的貨處理最好，塞在車廂中間的容易漏掉 — 這叫 lost in the middle。

塞到滿會發生什麼事？觸發 compaction — AI 自動把前面的貨摘要壓縮，過程中丟失 nuance 跟 edge cases。這就是為什麼聊很久之後，AI 開始忘東忘西。

我常遇到有人抱怨：AI 聊一聊就忘東忘西，一次交代它三、四件事，做完一兩件，剩下的跟沒講一樣。通常不是模型笨，也不是記性差，更不是 context window 不夠大 — 是它的注意力天生就「兩頭燒」。為什麼？Transformer 讀字有兩個天生的偏心：一個叫 causal masking，每個字只能往回看前面的字，疊很多層之後，最前面的字被「複習」最多次，所以開頭特別重；另一個是位置編碼 RoPE 的距離衰減，離得越近越被重視，所以結尾也特別重。開頭被拉走、結尾被拉走，夾在中間那段兩邊都搶不到 — lost in the middle 就是這樣來的。有趣的是這根本是我們大腦的老毛病：Primacy effect（首因效應）記得最前面、Recency effect（近因效應）記得最後面，面試排一整天、簡報的開場跟收尾，都是同一回事。

所以應對就三招：餵 Primacy（把要它記的釘到最前面 — CLAUDE.md、AGENTS.md 就是吃 Primacy）、餵 Recency（塞到最近一句）、或乾脆把中間變短（一個段落做完就主動壓縮、或 handoff 把中段重寫成下一段的開頭）。別等工具七、八成才 auto-compact，五、六成主動壓，摘要乾淨，模型也還沒開始退化。

所以記住這個畫面：模型廠商把車斗加大是一回事，把對的貨裝上車，要靠我們自己。桌子比喻也通 — 有三公尺的書桌，東西亂放還是一直掉啊。

> 招數再多，拆到底都是同一件事 — 餵 Primacy、餵 Recency、把中間變短。

Agent 的視角更極端 — 不管架構設計多精密、檔案分得多細、cache 策略多講究，最終送進 LLM 的就是這一車 text。Context Window = Agent 執行期的全部。

## 關鍵重點

- Context window = 一台貨車一次能載的貨（token 總量），不是持久的記憶體 — 每趟重裝
- attention 的由來：小朋友一次只能專注幾十秒，模型也一樣；GPT 的 T = Transformer，核心機制就叫 attention
- 裝貨順序有學問：穩定的往車頭放（可 cache），動態的往車尾放
- 裝越滿 ≠ 越好 — lost in the middle：車廂中間的貨最容易被漏掉（成因：causal masking 讓開頭最重、RoPE 距離衰減讓結尾最重，這正是大腦 Primacy / Recency 的翻版）
- 滿了就 compaction：自動摘要壓縮，nuance 和 edge cases 會流失
- 應對三招：餵 Primacy（釘到最前面，CLAUDE.md / AGENTS.md）、餵 Recency（塞到最近一句）、把中間變短（段落做完就主動壓縮或 handoff）
- Context Window = Agent 執行期的全部世界

## 互動示範構想

畫面中央一張俯視的「桌子」（長條容量槽）。使用者按按鈕往上放東西：system prompt（藍磚）、tool 定義（綠磚）、記憶（黃磚）、對話歷史（灰磚，會隨聊天自動增生）。桌子漸滿，容量表逼近 100% 時警告閃爍，然後觸發 compaction 動畫：一大段灰磚被壓縮成一小塊「摘要磚」，但壓縮時有幾顆代表「細節」的小亮點掉出桌外消失 — 具象化「壓縮會丟失 nuance」。另附「lost in the middle」實驗鈕：在長 context 的開頭/中間/結尾各藏一個關鍵字，顯示模型對三個位置的注意力熱度圖。

## 課堂提問

- 為什麼「越穩定的內容放越前面」？（提示：跟 prompt cache 有關）
- 1M token 的 context window，是不是就不需要 memory 系統了？
- 你遇過 AI「聊到後面開始亂掉」嗎？現在你知道是為什麼了？

## 原文金句

> Context window 不是記憶體，它是一台貨車一次能載的貨 — 從台中開到台北，車上就 100 個位子，這趟要用的全得塞進去。

> Context window 不是 AI 的記憶體上限，它是「一次 API call 能傳過去的 token 總量」。

> 塞越多不代表 AI 用得越好。

> 招數再多，拆到底都是同一件事 — 餵 Primacy、餵 Recency、把中間變短。

> 不然有三公尺的書桌，東西還是一直掉啊😂😂😂
