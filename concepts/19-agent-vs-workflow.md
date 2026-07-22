---
id: agent-vs-workflow
title: Agent 還是 Workflow？
subtitle: Agent vs. Workflow
chapter: 4
chapterTitle: Agent 工程
source:
  - title: "我們要的是 AI Agent 還是一個Workflow？"
    url: https://www.garyhsieh.com/blog/2026-03-30-ai-agent-workflow
    date: 2026-03-30
---

## 一句話

每一步你都很清楚，那叫 workflow；只知道起點跟終點，中間讓 AI 自己走，那才叫 agency。

## 三分鐘講稿

我們要的是 AI Agent 還是一個 Workflow？去年我看到一張圖，恍然大悟：你很清楚第一步、第二步、第三步——那叫 workflow；當你知道起點跟終點，但中間怎麼走你不管——那叫 agency。

我們每天在用 coding agent，常常走到不知道哪裡去，為什麼？因為 LLM 就是「文字接龍」，他真的、真的沒有腦，就是機率，所以「可預測性」天生就不可控。那反過來想，如果你每一步都確定了，你要的根本不是 AI，一個 Shell Script 就搞定了——認真，寫個腳本就好。AI 真正賦能的地方，是你知道目標在哪、知道從哪出發，但中間那條路你「真的不知道」、「沒決定好」，這段讓 AI 做，幫助超級大。

這其實就是學校教過的 imperative 跟 declarative。用上廁所來比喻：Imperative 是你想上廁所，1）站起來 2）走到走廊 3）打開廁所門 4）坐在馬桶上，上廁所；Declarative 是你想上廁所，有一個人帶你去，你在馬桶上，上廁所。Workflow 就是 imperative——每一步寫死；Agency 就是 declarative——你定義目標，讓 AI 自己 find the way out。

但真實情況是，工程上沒有人站在天平的兩端，一定是光譜上某個「最適合位置」。Anthropic 在《Building Effective Agents》也講了一樣的事——自主性是一個光譜，從 workflow 到 agent 漸進式調整複雜度。

而這整件事的底層邏輯就是 context engineering：「LLM 就像 CPU，Context Window 就是 RAM，Context Engineering 就是 Code」。你不是在寫更好的 prompt，你是在管理「這一刻 AI 能看到什麼資訊」。不過代價也是真的：workflow 像走過一間燈火通明的房子，每個房間你都看得到；agent 像搭著前面遊客的肩膀走鬼屋迷宮——Agent 比普通 chat 多吃 4 倍 token，multi-agent 更是 15 倍。所以能 workflow 就 workflow，需要彈性的時候才開 agent。工程從來不是絕對值，看任務決定解法。

## 關鍵重點

- 每一步都很清楚 = workflow（imperative）；只定義起點與終點 = agency（declarative）
- 如果每一步都確定了，你要的根本不是 AI，一個 Shell Script 就搞定了
- 自主性是一個光譜，不是二選一——工程上要找光譜上的「最適合位置」（Anthropic《Building Effective Agents》）
- 底層邏輯是 context engineering：管理「這一刻 AI 能看到什麼資訊」，而不是寫更好的 prompt
- 彈性有代價：Agent 比 chat 多吃 4 倍 token，multi-agent 15 倍——能 workflow 就 workflow

## 互動示範構想

一個「自主性光譜滑桿」demo。畫面中央是一條從「Workflow」到「Agent」的橫向滑桿，下方是同一個任務（例如「修一個 bug 並發 PR」）的執行視覺化。使用者拖動滑桿：拉到最左邊，畫面變成一間「燈火通明的房子」——每個步驟是一個亮著燈的房間，路徑一條直線畫死，旁邊顯示 token 成本 1x、可預測性 100%；拉到最右邊，畫面變成「鬼屋迷宮」——路徑變成一團會即時亂走的分岔線（每次拖到這裡走法都不一樣，體現 non-deterministic），token 計數器跳到 4x～15x，可預測性掉下來，但「能處理的任務模糊度」指標升高。滑桿中段會標出幾個真實做法的錨點：Divide and Conquer、Human in the Loop、TDD + Autonomous、Hook。使用者點任一錨點，迷宮上就出現對應的「護欄」動畫（例如點 Human in the Loop，迷宮每個岔路口出現一個暫停確認的紅綠燈）。

## 課堂提問

- 你上週用 AI 做的某件事——它其實是 workflow 還是 agency？如果是 workflow，一個 shell script 是不是就夠了？
- 「上廁所」的比喻裡，imperative 跟 declarative 差在哪？你手上的任務比較像哪一種？
- 老闆說「全部都要 AI Agent 化」——你會怎麼用「光譜」跟「token 成本」跟他溝通？

## 原文金句

> 你很清楚第一步、第二步、第三步 — 那叫 workflow；當你知道起點跟終點，但中間怎麼走你不管 — 那叫 agency。

> 「LLM 就像 CPU，Context Window 就是 RAM，Context Engineering 就是 Code」 - 這是 2026 年的軟體工程

> workflow 像走過一間燈火通明的房子，你看得到每一個房間、通道、轉角；agent 像在你搭著前面的遊客的肩膀走鬼屋迷宮。
