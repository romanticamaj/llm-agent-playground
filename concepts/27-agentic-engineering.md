---
id: agentic-engineering
title: 三條反轉與不能外包的邊界
subtitle: Agentic Engineering
chapter: 6
chapterTitle: 與 AI 協作的方法
source:
  - title: "Andrej Karpathy 最近開始淡化他去年自己推紅的「Vibe Coding」，轉而更常使用另一個詞：Agentic Engineering"
    url: https://www.garyhsieh.com/blog/2026-05-06-andrej-karpathy-vibe
    date: 2026-05-06
---

## 一句話

Vibe coding 拉高地板，Agentic engineering 拉高天花板——你可以外包 execution，但不能外包 abstraction。

## 三分鐘講稿

Andrej Karpathy 最近開始淡化他自己推紅的「Vibe Coding」，轉而更常用另一個詞：Agentic Engineering。他有一句非常值得記住的話：「Vibe coding raises the floor. Agentic engineering raises the ceiling.」Vibe Coding 的價值是讓更多人降低門檻、開始能做 software；Agentic Engineering 談的是另一件事——如何真正把系統做進 production、做成可維護、可持續演化的工程。如果 Vibe Coding 是「讓 AI 幫你寫東西」，那 Agentic Engineering 更像是「設計一個會持續幫你做事的系統」。

我的理解是：Agentic Engineering 不只是多幾個工具、多幾個 prompt。它是三條非常根本的反轉，而今天大量新出現的詞——context engineering、memory、harness、eval——本質上都只是這三條反轉被逼出來的新語言。

第一條，Stateless 與 Stateful 的反轉。傳統工程花了幾十年在學「怎麼把 state 包好」。但 LLM 本身是 stateless 的，每一次 request 都像重新開始，它表現出的「記憶」其實是外部系統每次把 relevant context 塞回去。新的工程命題變成：怎麼把一個沒有持續 state 的核心，包裝得像有 state。State 沒有消失，而是被 externalize 到 model 外部。

第二條，Code 與 Architecture 的反轉。過去是資深工程師先打架構，再實作成 code。但現在丟一句「幫我做一個股票追蹤系統」，Agent 瞬間就替你決定了 React、Supabase、folder structure——它不只寫 code，它同時在做 architecture decision，而且快到你根本沒 review。所以 AI 時代的新技術債，不一定來自 code quality，更可能來自「未被審視的架構決策」。Code 可以重寫，超廉價；但錯的 bounded context、錯的 identity assumption，代價高得多。

第三條，Deterministic 與 Non-deterministic 的反轉。傳統軟體追求同樣 input 同樣 output，但 LLM 天生是機率模型。「Traditional software automates what you can specify. LLMs automate what you can verify.」以前精確指定「怎麼做」，現在設計的是「做完之後怎麼驗證」。我們不是消滅 non-deterministic 核心，而是在它外面建立 deterministic boundary——以前 deterministic 是 code 的特性，現在是治理層（Harness）的特性。

把三條反轉放在一起，最值得注意的是：Bounded Context 的價值正在被重新放大。User、Billing、Identity 這些大邊界，最好仍然由人定義——邊界切錯，agent 不是幫你解決問題，而是更高速地放大問題。所以人類真正保留的護城河，是 abstraction。「You can outsource your thinking, but you can't outsource your understanding.」我的翻譯是：可以外包 execution，不能外包 abstraction。

## 關鍵重點

- Vibe coding raises the floor（降低門檻），Agentic engineering raises the ceiling（做進 production、可維護、可治理、可持續演化）
- 反轉一 Stateless ↔ Stateful：LLM 天生無狀態，state 被 externalize 到 model 外部——Context Engineering 就是「策劃下一次推理該看到什麼」
- 反轉二 Code ↔ Architecture：agent 寫 code 的同時也在做架構決策，AI 時代的新技術債來自「未被審視的架構決策」，ADR 變得超級重要
- 反轉三 Deterministic ↔ Non-deterministic：不消滅不確定性，而是在外面建 deterministic boundary——Harness 是新時代的 Deterministic
- Bounded Context 是跟 Coding Agent Planning 的第一步；可以外包 execution，不能外包 abstraction——抽象能力是傳統軟體工程師的護城河

## 互動示範構想

一個「三條反轉」的翻轉卡互動頁。畫面上三張大卡片並排：Stateless↔Stateful、Code↔Architecture、Deterministic↔Non-deterministic，每張正面是「傳統工程」的世界（例如第一張畫著被程式包得好好的 state 圖示）。使用者點擊卡片，卡片 3D 翻面到「Agent 時代」：第一張翻面後 state 圖示跑到 model 外面，變成 CLAUDE.md、memory、compaction 等外部元件圍繞著一個空心的 LLM，並示範「每次 request 都失憶，靠外部塞 context 回去」的動畫；第二張翻面後，使用者在輸入框打一句「幫我做一個股票追蹤系統」，按 Enter 的瞬間畫面爆出一整棵 React / Tailwind / Supabase / folder structure 的決策樹，其中幾個節點閃紅色標籤「未被審視的架構決策」，點擊紅色節點會顯示這個決策日後的代價；第三張翻面後是一個機率雲核心，使用者可以拖拉 Eval、Guardrails、Hooks 等積木在外圍搭出一圈 deterministic boundary，搭好之後亂數輸出被邊界過濾成穩定輸出。三張都翻完後，畫面底部浮現終局互動：一張系統地圖讓使用者親手畫 Bounded Context 的邊界線（User / Billing / Identity），畫對了 agent 順利在各區塊內工作；故意畫錯一條，就看到 agent 高速地把錯誤放大到整張地圖——收尾字卡：「可以外包 execution，不能外包 abstraction。」

## 課堂提問

- 你上次讓 AI 從零建一個專案時，它替你做了哪些架構決策？其中有幾個是你真正 review 過的？
- 「LLMs automate what you can verify」——你現在的工作流程裡，有哪些「做完之後怎麼驗證」的設計？
- 如果 execution 都能外包，你的護城河是什麼？你能不能把你手上系統的 bounded context 邊界畫出來？

## 原文金句

> "Vibe coding raises the floor. Agentic engineering raises the ceiling."

> "You can outsource your thinking, but you can't outsource your understanding."

> 一旦邊界切錯，agent 很可能不是幫你解決問題，而是更高速地放大問題。
