---
id: new-signals
title: 方向歪了？拉新訊號進來
subtitle: New Signals / Dynamic Decomposition
chapter: 3
chapterTitle: 從聊天到 Agent
source:
  - title: "AI 幫你把東西都做完了，但你覺得方向有點歪 — 要重跑一次嗎？不，這時需要的是拉「新訊號」進來"
    url: https://www.garyhsieh.com/blog/2026-04-13-ai
    date: 2026-04-13
  - title: "AI 開發卡關？不確定他講的是不是唬爛？想讓他跑更久再停下來？"
    url: https://www.garyhsieh.com/blog/2026-05-02-ai
    date: 2026-05-02
  - title: "「先透過 Web Search 幫我驗證一下」— 用 AI Agent 最該學會的第一句"
    url: https://www.garyhsieh.com/blog/2026-04-15-web-search-ai
    date: 2026-04-15
---

## 一句話

Scaffolding 是本金，新訊號是即興加碼——方向歪了不要砍掉重跑，開一條新路去驗證，再拉回來對照。

## 三分鐘講稿

AI 幫你把東西都做完了，但你覺得方向有點歪——要重跑一次嗎？不。這時候不要砍掉重跑，可以做的是：直接在當前 session 中 spawn 一個 sub-agent，用不同的 context 針對你不確定的部分再驗證一次，結果拉回來跟原本的 output 對照。

學術界稱之為 Dynamic Decomposition，跟事先定義好的 Static Scaffolding 相對。簡單說就是：你的 Scaffolding 是本金，但你可以在工作過程中即興加碼。

核心邏輯都一樣：保留原本的 context → 開新路出去驗證 → 結果拉回來對照整合。Code review 覺得不夠深？spawn 一個 sub-agent 專門用 security 角度重看。旅遊規劃想參考外部行程？先保留目前的行程不要動，去看 KKday 跟 Klook 的熱門行程，抓重點回來對照。不確定 AI 講的是不是唬爛？請它用 web search 找即時股價、最新財報，驗證剛剛的分析。卡關了？請它去找這個 repo 相關的 GitHub Discussion，看看別人怎麼解的。

而拉新訊號最該學會的第一個 tool，就是 web search。我在課堂上一直講：你用 AI Agent 要學會的第一句話，就是「先透過 web search 幫我驗證一下」。為什麼？因為模型的知識是凍結在某個時間點的，它腦袋裡沒有此刻的世界 — 未來你要做任何東西，都要幫 AI 拉新訊號進來，而怎麼拉？最基本、最必學的就是用 web search 去拉。舉個生活例子：我幫我媽做 market research，她想幫產品取名叫「汽車材料大爆賣」，那這名字到底有沒有人用過、會不會撞名？不用自己 Google 半天，直接叫 AI 用 web search 去查一圈、回報結果 — 這就是把外面的即時訊號拉進來、幫你做判斷。第一個 tool 學會了，後面所有的驗證跟研究都是它的延伸。

那為什麼這件事需要「你」自己來做？因為 Static Scaffolding 這一層，2026 年的 coding agent 已經幫你做大半了——ReAct Loop、Sub-agent Spawning、自動壓縮，加上社群開源的上百個 Skills。Agent 內建一層，社群再疊一層，Static Scaffolding 幾乎滿到溢出一堆 AI Slop。

但有一個東西沒辦法自動化：Developer Judgment。當你看到 Agent 的 output，判斷「這個方向偏了」或「這裡需要更深的驗證」，然後即時決定要不要 spawn sub-agent、用什麼 context 去查——你，就是那個 supervision signal。

大家都同意人類要留在 loop 裡面，但留在哪裡？Kief Morris 提出三種位置：In the loop 是 review 每一行 code；Out of the loop 是完全放手；On the loop 是你不 review 每一行，但你設計並維護引導 agent 行為的機制。On the loop 就是 Dynamic Decomposition 的工程落地——在犯錯成本高的地方插入 friction，在犯錯成本低的地方減少 friction。

最後別忘了 Feedback Flywheel：每次你修正 agent 的 output，把修正的原因寫回 CLAUDE.md 或 Skills 裡。這不是額外的工作，這是讓你的 Static Scaffolding 越來越準的機制。讓 AI 自己跑，永遠就做出那 90 分。剩下的 10 分，在你的核心洞察力，和你知道什麼時候該從 Static 切換到 Dynamic。

## 關鍵重點

- 方向歪了不要砍掉重跑：保留原本 context → spawn sub-agent 開新路驗證 → 結果拉回來對照整合
- Static Scaffolding（本金）vs Dynamic Decomposition（即興加碼）——Static 層 agent 跟社群已經做滿了，Dynamic 層才是你的價值
- Developer Judgment 就是 adaptation signal：你判斷「方向偏了」「需要更深驗證」，這件事無法自動化
- On the loop：不逐行 review、也不完全放手，而是設計機制、觀察 output、在高風險時刻即時介入；在犯錯成本高的地方插入 friction
- Feedback Flywheel：每次修正 agent，把原因寫回 CLAUDE.md / Skills，讓 Static Scaffolding 越來越準
- 日常救援 prompt 三類：驗證類（cross-model review、跑起來看 log、web search 查證）、卡關類（查 GitHub Discussion、參考別人架構）、反思類（這段過程能不能抽成新 Skill 複用）

## 互動示範構想

畫面中央是一條「Agent 工作流程」的橫向管線動畫：Scaffolding 各節點依序亮起，最後跑出一個 output 卡片，上面故意有一個「方向有點歪」的地方（例如市場分析少了外部佐證）。使用者面前出現兩顆按鈕：「砍掉重跑」和「拉新訊號進來」。按「砍掉重跑」，整條管線清空從頭再跑一次，計時器大幅增加，而且新 output 隨機又歪在別的地方——體感就是賭運氣。按「拉新訊號進來」，主管線保持不動（明顯標示「原 context 保留中」），畫面往上分岔出一條支線：一個 sub-agent 小圖示帶著不同顏色的 context 泡泡跑出去（可選擇訊號來源：security review / web search 查證 / 外部行程參考），回來時支線結果跟原 output 並排出現「對照 diff」視圖，使用者按「整合」把差異合併回主線。最後儀表板比較兩種策略的耗時與結果品質，並列出可直接複製的救援 prompt 範本（驗證類、卡關類、反思類）。

## 課堂提問

- 上次 AI 給你的結果「還 ok 但有些地方不太對」的時候，你是砍掉重跑，還是有保留原本的成果去補驗證？
- 在你的工作流程裡，哪些環節犯錯成本高、值得插入 friction？哪些環節其實可以放手讓 agent 跑？
- 這一週你修正過 agent 的哪些 output？那些修正的原因，有沒有被寫回你的 CLAUDE.md 或 Skills？

## 原文金句

> 你的 Scaffolding 是本金，但你可以在工作過程中即興加碼。

> 保留原本的 context → 開新路出去驗證 → 結果拉回來對照整合。

> 讓 AI 自己跑，永遠就做出那 90 分。剩下的 10 分我認為在：你拿手領域的核心洞察力、你知道什麼時候該從 Static 切換到 Dynamic。
