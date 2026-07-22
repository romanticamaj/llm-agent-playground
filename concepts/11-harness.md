---
id: harness
title: 從「會動」到「可控」
subtitle: The Agent Harness
chapter: 2
chapterTitle: 從 LLM 到 Agent
source:
  - title: "OpenClaw 跟 Claude Code 都用 Opus 4.6 — 為什麼做同一件事，結果差這麼多？"
    url: https://www.garyhsieh.com/blog/2026-04-26-openclaw-claude-code
    date: 2026-04-26
---

## 一句話

模型是大腦，工具是手腳，Harness 是把這個生物從「會動」變成「可控」。

## 三分鐘講稿

OpenClaw 跟 Claude Code 都用 Opus 4.6——為什麼做同一件事，結果差這麼多？不是模型問題，是它們的「身體」跟「性格」根本不一樣。

LangChain 的 Viv Trivedy 在《Anatomy of an Agent Harness》寫過一句經典的話：「If you're not the model, you're the harness.」他的等式是 Agent = Model + Harness。但我參透 OpenClaw vs Claude Code 的差異之後，覺得這個等式可以再細——它把兩件本質不同的事混在一起叫 harness。我的工作框架是：Agent = Model + Body + Harness。Model 是大腦，intelligence 本身；Body 是手腳——tool use、filesystem、bash、sandbox、browser、MCP，決定它能不能做事；Harness 是約束——CLAUDE.md、hooks、planner-evaluator 拆分、sub-agent 結構，決定它會不會做歪。

用這個框架拆：Model 一樣，都是 Opus 4.6。Body 不一樣——Claude Code 出生就是給工程師寫 code 的，bash 直接執行、git 整合、Plan mode、sub-agent；OpenClaw 是個 personal AI，body 設計給 personal assistant 用，寫 code 是它的能力之一，但不是它的器官中心。Harness 也不一樣——Claude Code 的 system prompt 全部在校準「寫好 code 的行為」；OpenClaw 的 harness 在校準「做個好的 personal assistant」。同一顆大腦，被裝進不同的身體跟約束，跑出來的自然就不一樣。

Harness 有多敏感？2026 年 4 月 Anthropic 官方 postmortem 承認，Claude Code 的品質問題來自三個 harness 層變更，不是模型退化——光在 system prompt 加一條「回覆不超過 100 字」的限制，就「caused an outsized effect on intelligence」。Harness 改一行就出包，因為它是個校準層：寫錯一點點，整個 output 分布就跑掉。

那 model 變強，harness 會不會消失？不會。因為 harness 在解的不是 model 弱的問題，是「LLM 永遠是 non-deterministic」這個結構問題。Model 變強不等於變 deterministic，輸出永遠有分布，永遠需要校準。Body 會隨 model 變強長新器官——Computer Use、多 agent 並行；Harness 會搬家但不會消失。下次有人說「等更強的模型出來就好了」，可以問他：這個問題本質是缺大腦、缺手腳，還是缺約束？

## 關鍵重點

- Agent = Model + Body + Harness：Model 是大腦、Body 是手腳（決定能不能做事）、Harness 是約束（決定會不會做歪）
- 同一顆 Opus 4.6，裝進不同的 body 跟 harness，結果天差地遠——OpenClaw vs Claude Code 不是模型強弱問題
- Harness 是校準層：Anthropic postmortem 證明改一行 system prompt（≤100 字限制）就能讓智力體感大幅下降
- Sub-agent 不只是角色扮演，是 context firewall——Chroma 的 context rot 研究證明 18 個模型都隨 context 變長而變差，拉長 context window 不是解
- Model 變強，body 會長新器官，harness 會搬家但不會消失——因為 non-deterministic 是 LLM 的本質，不是弱點的副作用

## 互動示範構想

一個「組裝 Agent 生物」demo。畫面中央是一個生物模型：大腦（Model）、手腳（Body）、韁繩（Harness）三個插槽。使用者從左側零件庫拖拉組裝——大腦只有一顆「Opus 4.6」（強調 model 固定不變）；Body 零件有兩組：「Coding body」（bash、filesystem、git、sandbox 圖示）跟「Assistant body」（Slack/WhatsApp/Discord、Memory.md 圖示）；Harness 零件也有兩組：「Coding harness」（先 plan 再 implement、verification loop、planner-evaluator）跟「Assistant harness」（記得 user 是誰、人格穩定、跨 channel 連貫）。組裝完按「派同一個任務：修一個 bug」，右側跑出動畫結果：Coding body + Coding harness 的組合，路徑收斂、測試綠燈、輸出分布圖是一條窄窄的鐘形曲線；Assistant body + Assistant harness 的組合，同一顆大腦卻繞路、輸出分布圖攤成一片寬扁的曲線。畫面下方有一個「Harness 敏感度」彩蛋按鈕：按下去在 harness 裡插入一條「回覆 ≤100 字」的限制，整個輸出分布立刻歪掉，重現 Anthropic postmortem——讓學員親眼看到「harness 改一行就出包」。

## 課堂提問

- 你現在用的 AI 工具，如果它表現不好——問題是缺大腦（model）、缺手腳（body），還是缺約束（harness）？舉一個實例分析。
- 為什麼 Anthropic 只在 system prompt 加一條字數限制，使用者就覺得「模型變笨了」？這說明 harness 的什麼性質？
- 「等更強的模型出來，這些 scaffolding 就都不需要了」——哪些 harness 會被解掉、哪些會永遠留下？為什麼？

## 原文金句

> 「If you're not the model, you're the harness. A harness is every piece of code, configuration, and execution logic that isn't the model itself. A raw model is not an agent.」

> Harness 會搬家但不會消失 — 因為它在解的不是 model 弱的問題，是 LLM 本質 non-deterministic 的問題。

> 模型是大腦，工具是手腳，Harness 是把這個生物從「會動」變成「可控」。
