---
id: prompt-cache
title: 算過的，別再算
subtitle: Prompt Cache / KV Cache
chapter: 5
chapterTitle: Agent 工程
source:
  - title: "為什麼會有 prompt cache？"
    url: https://www.garyhsieh.com/blog/2026-06-03-prompt-cache
    date: 2026-06-03
---

## 一句話

Prompt cache 聽起來很 AI，骨子裡就是 memoization — 把「算過的別再算」套到 attention 的 KV 上。

## 三分鐘講稿

為什麼會有 prompt cache？追到底才發現，就真的只是 "cache" 那個 "cache"，只是這次給 GPU 用。

先講 Transformer 在幹嘛。它每處理一個 token，都要跟前面所有 token 算 attention，過程會吐出每一層的 Key 跟 Value 向量（業界叫 KV）。重點來了 — 同一段 token，算出來的 KV 是固定的。不管後面接什麼，前面那段的 KV 永遠長一樣。既然結果固定，幹嘛每次重算？算過一次存起來，下次遇到一樣的開頭直接載入。啪，這就是 prompt cache。說穿了就是 memoization — 大學資料結構就教過，只是這次的「結果」是一坨 GPU 算出來的矩陣。

那為什麼只能 cache「開頭」？因為 attention 是 causal 的 — 每個 token 的 KV 由它前面所有 token 決定。Token C 的 KV = f(A, B, C)。只要改了開頭的 A，即使 C 一個字沒動，C 的 KV 還是會變。所以 cache 只能從開頭逐 token 比對，中間斷一個就全毀。這也解釋了為什麼所有 prompt 設計最佳實踐都長一樣：不變的往前擺，會變的往後丟 — 天然順著 causal attention 的數學特性。

多輪對話其實一直在偷吃 cache：每輪只是在尾巴追加新東西，前面那段的 KV 還熱著，GPU 直接載入。對話越長，命中比例越高。

然後就講到錢了：正常 input 1x、cache write 約 1.25x、cache read 約 0.1x。五個 agent 共用 100K 的 prefix，有 cache 省下大概 67% — 直接反映在帳單上。

很多 AI infra 的東西都這樣：名字很潮，拆開來都是 CS 基礎在撐。愈把新東西翻譯回老語言，就愈不嚇人。

## 關鍵重點

- 同一段 token 的 KV 是固定的 → 存起來重用 = prompt cache = memoization
- Attention 是 causal 的：改開頭一個字，後面全部 KV 作廢 — cache 只認「前綴」
- 所以 prompt 設計鐵則：穩定內容往前放、動態內容往後放
- 多輪對話天然一直命中 cache（每輪只在尾巴追加）
- 價格量級：write 1.25x / read 0.1x — multi-agent 共用 prefix 時省最大

## 互動示範構想

畫面是一條 token 色帶（system prompt + 對話）。第一次送出：整條逐格「點亮計算」，成本表跳動。第二次送出（尾巴加了新訊息）：前綴瞬間整段變成「熱快取」的暖光、免計算，只有尾巴新 token 逐格計算 — 成本表只加一點點。然後殺手級互動：讓使用者點開頭改一個字 — 整條色帶從那格之後全部熄滅重算，成本暴增，親眼看見「中間斷一個就全毀」。旁邊常駐兩個累計帳單：有 cache vs 沒 cache。

## 課堂提問

- 為什麼把「今天日期」放在 system prompt 開頭是個壞主意？
- 五個 sub-agent 共用同一段長 context，帳單會怎麼變化？
- 還有哪些「名字很潮」的 AI 技術，拆開來其實是 CS 基礎？

## 原文金句

> 就真的只是 "cache" 那個 "cache"😂，只是這次給 GPU 用。

> cache 只能從開頭逐 token 比對，中間斷一個就全毀。

> 很多 AI infra 的東西其實都這樣，名字很潮，拆開來都是 CS 基礎在撐。
