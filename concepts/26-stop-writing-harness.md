---
id: stop-writing-harness
title: 停止手寫 Harness
subtitle: Harness Depreciates
chapter: 5
chapterTitle: Agent 工程
source:
  - title: "停止手寫 harness"
    url: https://www.garyhsieh.com/blog/2026-07-19-stop-writing-harness
    date: 2026-07-19
---

## 一句話

你辛苦手寫的 harness，是折舊資產，壽命大概就一個模型世代 — 下一代模型一出來，它就從「必要」變「冗餘」。

## 三分鐘講稿

先講一個很無奈的親身經歷：兩個月內，我白忙了兩次。

第一次，我把一套跑過 482 個 commits 的長任務 pipeline，打包成跨 agent 的 skill — 三平台一鍵安裝、平行 worktree、整套流程全串起來，把踩過的坑全轉成一個 long-running 系統。結果三週後，新一代模型出來，原生就會拆長任務，平台也內建了 subagent 跟 workflow orchestration。我這套東西直接沒有存在理由，只能默默把 repo 刪掉。第二次更崩潰，我做了五個 skill、測試跟 evaluation 全寫好，最後用新模型跑一輪順口問了句「這東西到底該不該存在？」答案是不該 — 模型 baseline 本來就 97 分，我的 skill 幾乎沒帶來提升。

從這兩次我悟出一句話：harness 是折舊資產，壽命大概就一個模型世代。

為什麼？把系統拆成三層 — Model（模型本身）、Harness（外面的執行機制：agent loop、tool、workflow、orchestration）、Context（你額外塞進去的規則、知識、資料）。這兩個月不斷重演的是：內層的 model 往外長，把原本屬於 harness 跟 context 的東西一層一層吃進來。以前要寫在 prompt 裡提醒的，現在模型內建；以前要靠 skill 補的，現在是 base capability。這就是折舊 — 很多 harness 本質上只是補模型缺口的工具，模型一升級，缺口沒了，它就冗餘了。

那是不是什麼都別做了？不是。關鍵在：context 不會全部消失。最後留下來的，是那些模型學不到、網路抄不到、只能從真實世界長出來的東西 — 公司的資料、客戶講不清楚的需求、產品踩過的坑、只有你知道「為什麼不能這樣做」的判斷。這就是護城河。

所以我現在的紀律是：任何想做的東西，先強制 research —是不是已經有人做了？平台是不是快內建？下一代模型是不是就不需要？search 一小時，不 search 三週。Research 完一定先問一句：這東西到底該不該存在？答不出「拿掉它我還剩什麼」，就不要開始。力氣往兩端放 — 需求端比「把模糊需求翻成可執行」的轉譯能力，交付端比「成品到底有沒有價值、能不能被取代」。中間那層實作、協調、orchestration，正在被商品化。逃。

## 關鍵重點

- Harness 是折舊資產，壽命約一個模型世代 — 模型升級就從必要變冗餘
- 三層結構：Model 往外長，一層層把 Harness 與 Context 吃進來
- Context 不會全消失 — 真實世界長出的東西（公司資料、客戶隱性需求、踩過的坑）是護城河
- 開工前強制 research：有人做了嗎？平台快內建了嗎？下一代模型還需要嗎？
- 力氣放兩端：需求端比轉譯、交付端比成品；中間那層正在被商品化

## 互動示範構想

一個三層同心圓：最內圈 Model、中圈 Harness、外圈 Context。畫面上方有一個「模型世代」滑桿，使用者往右拉（Gen 1 → Gen 2 → Gen 3），每拉一格，內圈 Model 就膨脹一圈，把中圈 Harness 的一塊塊功能（agent loop、拆任務、orchestration）逐一「吞」進去變灰。但 Context 圈裡標著「公司資料／客戶隱性需求／踩過的坑」的那幾塊不會被吞，反而發亮 — 直觀看見「harness 折舊、真實世界 context 留存」。旁邊即時顯示折舊倒數：「這塊 harness 預估壽命：1 個世代」。

## 課堂提問

- 你手上有沒有一套 harness／skill／workflow，其實只是在補模型現在的缺口？下一代模型補上後它還剩什麼？
- 「search 一小時，不 search 三週」— 你上一個專案，如果開工前先 research，會不會少走冤枉路？
- 哪些是你正在累積、但別人（跟模型）抄不走的 context？如果一個都想不出來，這代表什麼？

## 原文金句

> harness 是折舊資產，壽命大概就一個模型世代。

> search 一小時，不 search 三週。

> 唯一比較不折舊的，剩原則。
