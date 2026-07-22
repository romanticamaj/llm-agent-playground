---
id: sub-agents
title: 卡住了？叫 AI 去找幫手
subtitle: Sub-agents
chapter: 4
chapterTitle: Multi-Agent 與長時間運行
source:
  - title: "跟 AI Coding Agent 工作卡住的時候，這招滿好用的 — 叫他去「找幫手」"
    url: https://www.garyhsieh.com/blog/2026-03-28-ai-coding-agent
    date: 2026-03-28
---

## 一句話

當你的 Agent 鑽牛角尖，最快的解法不是繼續跟它耗，而是讓它 spawn 一個腦袋乾淨的 sub-agent。

## 三分鐘講稿

跟 AI Coding Agent 工作卡住的時候，這招滿好用的 — 叫他去「找幫手」。

認真的，你可以直接跟你的 Coding Agent 說：「幫我 spawn 一個 sub-agent 來驗證這個問題」，他就會開一個全新的 agent 出來，帶著你目前的 context 去思考，然後把 feedback 帶回來。

這招的原理其實很簡單 — Multi-agent。

想想看，你原本的 agent 已經在那個 context window 裡面繞了很久，思路被污染了。這就像你跟同一個人討論太久，兩個人一起鑽牛角尖，越討論越深、越討論越出不來。但 sub-agent 的 context 是全新的，你把問題丟過去，他用乾淨的腦袋想一次，回來的東西常常會讓你「啊對！」。

這就像你在辦公室卡住，走到隔壁找一個同事說「欸你幫我看一下這個」。你不會期待那個同事知道你這三小時的所有掙扎細節 — 正因為他不知道，他才看得到你看不到的盲點。

操作也超單純，四個步驟：第一，跟你的 Coding Agent 說「spawn 一個 sub-agent 來看這個問題」；第二，他會把當前 context 整理好傳過去；第三，sub-agent 確認問題、給 feedback；第四，feedback 回到你原本的 session 繼續推進。

如果你的 Coding Agent 不支援這個功能？那就趕快換一個吧。

最後提醒一件事：不要只會用招式。Multi-agent 的底層邏輯，我超推薦吳恩達（Andrew Ng）的 Agentic AI 課程；有興趣的話，也可以直接叫 AI 幫你分析你正在用的 Coding Agent 的架構。底層邏輯才會幫助你飛快地成長，不偷懶。

## 關鍵重點

- 卡住時直接下指令：「幫我 spawn 一個 sub-agent 來驗證這個問題」，Agent 會自己開新 agent、傳 context、收回 feedback
- 原理是 Multi-agent：原本的 agent 在同一個 context window 繞太久，思路被污染；sub-agent 的 context 是全新的
- 類比：就像在辦公室卡住，走到隔壁找同事說「欸你幫我看一下這個」
- 流程四步：下指令 spawn → 整理 context 傳過去 → sub-agent 確認問題、給 feedback → feedback 回到原 session 繼續推進
- 別只學招式，去理解底層邏輯（Multi-agent 架構），成長才會快

## 互動示範構想

畫面分左右兩欄。左欄是「主 Agent 的 context window」— 一條逐漸填滿、顏色越來越混濁的長條（從清澈藍變成濁褐色），旁邊滾動著模擬的對話訊息，訊息內容重複繞圈（「再試一次 patch A…」「還是不行…」「回到 patch A…」），視覺化「思路被污染、鑽牛角尖」。

使用者按下畫面中央的大按鈕「Spawn Sub-agent」：右欄彈出一個全新的 agent 卡片，context 長條是乾淨的淺藍色、幾乎全空。接著播放三段動畫：（1）左欄壓縮出一個小小的「問題摘要」封包飛到右欄；（2）右欄 sub-agent 思考幾秒後產出一張 feedback 卡片（例如「問題不在 patch，是測試環境的 env var 沒設」）；（3）feedback 卡片飛回左欄，左欄對話出現「啊對！」的訊息並繼續推進。

可以加一個對照開關「不 spawn，繼續凹」：按下去左欄就繼續繞圈、長條繼續變濁直到爆掉，讓學員直觀比較兩條路的差異。

## 課堂提問

- 你上一次跟 Coding Agent「鑽牛角尖」是什麼情境？當時如果 spawn 一個 sub-agent，你會請它驗證什麼？
- 為什麼「context 全新」反而是優勢？什麼情況下 sub-agent 缺少脈絡反而會幫倒忙？
- 主 agent 把 context「整理好傳過去」— 你覺得該傳什麼、不該傳什麼？

## 原文金句

> 你原本的 agent 已經在那個 context window 裡面繞了很久，思路被污染了，就像你跟同一個人討論太久，兩個人一起鑽牛角尖，但 sub-agent 的 context 是全新的。

> 這就像你在辦公室卡住，走到隔壁找一個同事說「欸你幫我看一下這個」。

> 底層邏輯才會幫助你飛快地成長，不偷懶💪
