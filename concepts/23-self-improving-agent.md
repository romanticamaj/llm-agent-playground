---
id: self-improving-agent
title: 自我學習，就是超有紀律的記憶管理
subtitle: The Self-Improving Agent
chapter: 4
chapterTitle: Memory — 讓 AI 記得
source:
  - title: "AI Agent 是怎麼自我學習的？我的歸納是「超有紀律的記憶管理」"
    url: https://www.garyhsieh.com/blog/2026-05-13-ai-agent
    date: 2026-05-13
  - title: "一張小小的截圖，藏了讓 coding agent 不停下來一直開發的招"
    url: https://www.garyhsieh.com/blog/2026-06-11-long-running-rules
    date: 2026-06-11
---

## 一句話

Agent 不是天生會學習——是有人幫它把「反思」變成一定會發生的流程。

## 三分鐘講稿

AI Agent 是怎麼自我學習的？我把學術論文 Self-Refine、Reflexion、HyperAgents，一路追到 Claude Code、Hermes、OpenClaw 這些實務套件，看完之後最大的歸納是——所謂的「Agent 自我學習」，本質上就是一套超有紀律的記憶管理工程。

這個故事要從 1979 年講起。Stanford 心理學家 Flavell 提出 Meta-cognition，「後設認知」——白話講就是「Thinking about your thinking」，學習如何學習。英國 EEF 的研究發現，使用 metacognition 的學生，一年可以多出 7 到 8 個月的學習成效。機制是什麼？他們在學習後做結構化的反思——什麼方法有效、什麼沒效、下次怎麼調整。這就是學霸為什麼是學霸——學霸花時間回頭看自己的學習過程本身。而更關鍵的觀察是：弱勢學生除非被明確教導，否則不太會自己發展出這些能力。換句話說——metacognition 是可以被工程化的，不是天賦，是流程。如果可以教給人類，那也可以教給 agent。

拆開來看，所有 self-improving agent 都在解同一組問題，只有兩個動作：Context 的提取（什麼時機、提取什麼、怎麼觸發），和記憶的寫下（什麼格式、寫到哪層、怎麼找回來）。而整個產業的差異，幾乎全部集中在「觸發方式」——從手動貼 magic prompt，到 Hook 保證一定觸發，到背景 curator 一週跑一次。最強的設計是兩種一起用——Hook 負責「reflection 一定會發生」，LLM 負責「reflection 的品質」。

記憶本身也不是一種東西，是四層：L1 原始資料，像你今天上班發生的每件事，沒整理過；L2 本能，「看到深色背景就拿白色字」這種小規則；L3 技能，完整的工作流程；L4 策略，「遇到複雜問題先拆解再執行」這種做事哲學。學習就是資訊沿著這四層往上蒸餾。

最後一條最重要——加 verifier。LLM 對自己的錯誤記憶經常產生高信心值，agent 自評不可靠，這是被學術研究和 production system 一致驗證的結論。所以不要讓同一個 agent 既當實作者又當評審。一句話總結整套系統：Context window 是 RAM，filesystem 是 disk——session 結束前必須把有價值的東西從 RAM flush 到 disk，否則就永遠消失。

講一個我自己天天在做的實戰版，你會發現這套機制其實超接地氣：讓 coding agent 一直跑、不停下來的秘訣，就是「每踩一個坑，就補一條鐵則，自動寫到記憶裡面去」。我一開始只有三條鐵則——orthogonality（任務拆乾淨、彼此不互相污染）、statelessness（每個 session 不靠殘留狀態，重啟也能接著跑）、review-then-refine（先 review 再 refine，不邊看邊亂改）。然後它每犯一次蠢，我就補一條：它嘴砲「測過了」卻拿不出畫面，我補一條「視覺證據鐵則」——on-device 驗證至少留一張截圖，標 verified 就要主動把關鍵那一兩張傳過來；它拿假畫面湊數，我補一條「誠實原則」——截不到的（OS 檔案選擇器、麥克風）就老實說「需要人工」；交接漏東西，補「handoff 要附截圖絕對路徑清單」；手刻一堆輪子，補「Library-first」。重點在於這些鐵則不是我記在腦子裡，是寫進 CLAUDE.md / skill 這種一開 session 就常駐、一定會被讀到的地方——這正是前面講的「把有價值的東西從 RAM flush 到 disk」，只是這次 flush 的是一條條被踩出來的教訓。踩坑 → 補鐵則 → 寫進記憶 → 請它繼續跑 → 下班，這就是 self-improving agent 最樸素、也最好用的一版。

## 關鍵重點

- Agent 自我學習 = 超有紀律的記憶管理工程，理論根源是 1979 年 Flavell 的 metacognition（「Thinking about your thinking」）——EEF 實證：可帶來一年 +7~8 個月的學習成效，而且可以被工程化，不是天賦是流程
- 只有兩個動作：Context 的提取（時機／內容／觸發）+ 記憶的寫下（格式／層級／可檢索）；產業差異幾乎全集中在觸發方式——手動 → Hook（deterministic）→ LLM 自判（probabilistic）→ 背景全自動
- 記憶有四層：L1 Raw Data → L2 Instincts（帶 confidence 分數的原子規則）→ L3 Skills → L4 Strategic；大多數系統跳過 L2，ECC v2 的 instinct 設計補上了這層
- Capture 跟 Consolidate 必須分離：capture 便宜隨時做，consolidate 昂貴要累積夠了再做（dual-gate：24 小時 + 5 sessions 兩條件同時成立）
- Agent 自評不可靠（calibration bias）——production-grade 系統的共同特徵是分離 implementer 和 verifier：「The implementer is an LLM. Verify independently.」
- 最小可用版五步驟：留下 L1 transcript → 設一定會觸發的 capture 點 → 固定 observation 格式（情境／方法／結果／原因／建議）→ capture 與 consolidate 分開 → 加獨立 verifier

## 互動示範構想

**「養一隻會學習的 Agent」— 記憶管線模擬器。**

畫面主體是一條由左至右的四層管線：L1 Raw Data → L2 Instincts → L3 Skills → L4 Strategic，右上角有兩個儀表：「dual-gate 進度」（時間 gate + session 數 gate 兩條進度條）和 token 成本計數器。

使用者按「跑一個 session」按鈕：L1 區掉進一筆雜亂的 transcript 卡片，同時 Hook 圖示閃一下、自動 capture 出一筆五欄位 observation（情境／方法／結果／原因／建議）。連按幾次後，dual-gate 兩條進度條都滿了，「Consolidate」自動觸發——動畫顯示多筆 observation 被蒸餾合併成一條 L2 instinct，上面掛著 confidence 進度條（0.3 起跳）。

同一條 instinct 在不同專案（react → python → go）反覆出現時，confidence 一路升到 0.9，觸發「Promote」動畫：instinct 從 project 欄位飛升到 global 欄位。反之，使用者可以按「打臉它」按鈕餵一筆矛盾證據，看 confidence 衰減。

關鍵互動：畫面上有一個「Verifier」開關。關掉它再跑幾個 session——會看到一條錯誤的學習（例如 agent 自圓其說的結論）長成高信心的 L4 規則，整條管線被污染變紅；打開 Verifier（一個獨立的小 Haiku 圖示），錯誤的 observation 在進入 L2 前就被攔下丟棄。學員親手體驗「沒有 verifier 的 self-improvement 會把錯誤模式學成高信心規則」。

## 課堂提問

1. 學霸和普通學生的差別不是「多讀幾遍」，是回頭反思自己的學習過程——你自己的工作流程裡，有沒有一個「一定會觸發」的反思點？還是全靠想到才做？
2. 為什麼「每次 session 結束就 consolidate」反而是壞設計？dual-gate 的兩個條件各自在防什麼？
3. 「有一個 task agent 負責做事，一個 meta agent 負責改進它——誰來改進 meta agent？」HyperAgents 給的答案是什麼？你買單嗎？

## 原文金句

> 所謂的「Agent 自我學習」，本質上就是一套超有紀律的記憶管理工程。

> Metacognition 是可以被工程化的，不是天賦，是流程。

> Context window 是 RAM，filesystem 是 disk——Session 結束前必須把有價值的東西從 RAM flush 到 disk，否則就永遠消失，差別只在誰來決定「什麼有價值」，以及「觸發的時機」可不可靠。

> 每踩一個坑，補一條鐵則，自動寫到記憶裡面去，請繼續跑，下班。
