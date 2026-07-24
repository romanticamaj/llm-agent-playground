---
id: memory-map
title: 記憶不在 AI 裡，在外面
subtitle: From Stateless to Stateful
chapter: 4
chapterTitle: Memory — 讓 AI 記得
source:
  - title: "AI 從 Stateless 到 Stateful，Memory 系統設計整張地圖長這樣 — 從認知科學引入、到 representation 演進、到 library 落地，整理一條完整的生態系脈絡"
    url: https://www.garyhsieh.com/blog/2026-05-27-ai-stateless-stateful
    date: 2026-05-27
  - title: "最近在玩一批 AI Memory / LLM Memory 工具，主要是 mem0、zep、cognee 等等，也順便看了一些跟 LLM Wiki、RAG、Knowledge Graph、Embedding Search、Coding Agent Memory 有關的實作。"
    url: https://www.garyhsieh.com/blog/2026-05-30-ai-memory-llm
    date: 2026-05-30
---

## 一句話

AI 什麼都不記得——是外面那一層，每次都把記憶重新塞回去。

## 三分鐘講稿

先問大家一個問題：LLM 是 stateless 的——每次 API call 都是全新的。既然 AI 不會記得任何東西，為什麼我們用 ChatGPT、用 Claude，感覺它好像「記得」上次聊過什麼？

答案是：記憶不在 LLM 裡，記憶在外面。Application layer 在每一次 call 時把外部資訊重新塞回去——這個動作叫「inject」。你以為它記得你，其實是有人每次都重新把你介紹給它。

而過去兩年，「外面那一層」已經發展成一整片生態。要看懂這片生態，先從認知心理學借三個分類：Semantic——我知道什麼（我是誰、我喜歡什麼）；Episodic——發生過什麼（我上週看了一場電影）；Procedural——怎麼做（我坐捷運上班）。另外還有一個視角來自作業系統：Core memory 像 RAM，永遠在 context 裡；Archival 像 disk，要 retrieve 才能用；Recall 是最近的對話紀錄。同一筆記憶可以同時用兩個維度描述——「user 偏好 dark mode」就是 Semantic + Core。

重點來了：無論你用 Mem0、Letta、Zep，做的本質動作就一個——把外部資訊 inject 進 context window。差別只在三件事：呈現形式、消化時機、誰主動。

呈現形式最經典的分岔是 vector vs Knowledge Graph。Vector 只能告訴你「A 和 B 語意相似」，沒辦法告訴你「A 怎麼跟 B 相關」。問「賈伯斯的接班人是哪裡人？」——vector 能找到「賈伯斯」「庫克」「Apple」這些相關詞，但拼不出答案；Knowledge Graph 可以直接走「賈伯斯 → 接班人 → 庫克 → 出生於 → Alabama」這條路徑。

消化的部分要記住一組對比：Compaction 是為了不脹——排掉吃不下的；Consolidation 是為了變聰明——吸收成養分。

所以選 library 之前，先問自己需要哪一種 Memory：想讓 Claude Code 記得你的偏好，Mem0 最容易上手；想自架 local Knowledge Graph，看 Cognee；需要時序推理和關係性查詢，研究 Zep。選 Mem0 vs Letta，本質是選 Transparent vs Agent-aware；選 vector vs KG，本質是選「語意相似」vs「關係性推理」。地圖的意義不是告訴你哪個最好——是讓你看到每個選擇背後的差異化。

## 關鍵重點

- LLM 是 stateless 的，「記得」是假象——記憶在 application layer，靠每次 inject 進 context window
- 記憶有兩個描述維度：內容類型（Semantic / Episodic / Procedural）× 存取階層（Core 像 RAM / Archival 像 disk / Recall 是 sliding window）
- 所有 memory 系統本質都做同一個動作，差別只在三件事：Representation（vector → KG → Temporal KG → Multi-strategy）、Synthesis timing（retrieval-time vs ingest-time）、Agency（Transparent / Agent-aware / Meta-managed）
- Vector 只能答「語意相似」，Knowledge Graph 才能答「關係性查詢」——賈伯斯接班人問題是分水嶺
- Compaction 是為了不脹，Consolidation 是為了變聰明——兩者本質完全不同
- 選 library 前先問「你需要哪一種 Memory」：Mem0（最易上手、串 Hook）、Cognee（local 自架）、Zep（時序 + 關係查詢）、agentmemory（LLM Wiki 路線）

## 互動示範構想

**「假記憶拆穿機」— 一個雙面板的 stateless/stateful 對比 demo。**

畫面左右各一個聊天視窗，都接同一個 LLM。使用者先在左邊（純 stateless）輸入「我叫 Gary，我偏好 dark mode」，接著開新對話問「我叫什麼？」——LLM 答不出來，畫面用紅字標出「每次 API call 都是全新的」。

然後使用者按下中間的大按鈕「開啟記憶層」。右邊面板出現一個透明的「injection 管線」動畫：使用者再問一次「我叫什麼？」，畫面即時顯示 application layer 從外部儲存撈出「user 叫 Gary / 偏好 dark mode」兩張記憶卡片、動畫式地「塞進」prompt 上方，然後 LLM 才回答。重點是讓學員親眼看到 prompt 被組裝的過程——記憶不是在模型裡，是每次被塞進去的。

進階區塊：一個「賈伯斯接班人」查詢挑戰。使用者輸入問題後可切換兩種 retrieval 模式——Vector 模式顯示一堆語意相似的片段（賈伯斯、庫克、Apple）但組不出答案；KG 模式則在畫面上一步步走亮「賈伯斯 → 接班人 → 庫克 → 出生於 → Alabama」的圖譜路徑。按一顆切換鈕，立刻理解 representation 的選擇為什麼重要。

## 課堂提問

1. 你每天在用的 ChatGPT「記得」你上次說的話——現在你知道它其實是 stateless 的，那你猜它的記憶層把「你」存成了什麼樣子？是 Semantic、Episodic 還是 Procedural？
2. 「user 偏好 dark mode」和「上週我們討論了 code review framework」——這兩筆記憶各該放在 Core 還是 Archival？為什麼？
3. 如果你要幫自己的產品加記憶功能：你需要的是找回原文、整理知識、還是關係性查詢？這個答案會怎麼決定你選 vector 還是 Knowledge Graph？

## 原文金句

> LLM 是 stateless 的——每次 API call 都是全新的。……因為記憶不在 LLM 裡，記憶在外面。

> Vector 有個天生侷限——它只能告訴你「A 和 B 語意相似」，沒辦法告訴你「A 怎麼跟 B 相關」。

> Compaction 是為了不脹——排掉吃不下的；Consolidation 是為了變聰明——吸收成養分。
