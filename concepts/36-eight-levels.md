---
id: eight-levels
title: 你在 Agentic Engineering 第幾級？
subtitle: The 8 Levels
chapter: 9
chapterTitle: 視野 — 工作型態與品味
source:
  - title: "Martin Fowler 網站一直在聊新的工程概念，剛好討論到 8 個 agentic engineering 的 Level"
    url: https://www.garyhsieh.com/blog/2026-03-20-martin-fowler-agentic
    date: 2026-03-20
---

## 一句話

Agentic Engineering 有一條從「手動下 prompt」到「設計自主系統」的階梯 — 先誠實定位你在第幾級，比追新工具更重要。

## 三分鐘講稿

Martin Fowler 的網站一直在聊新的工程概念，其中有一個很好用的框架：把 agentic engineering 拆成 8 個 Level，像一把尺，讓你量自己現在站在哪。

這把尺大致是這樣長的：最底層是你還在一句一句手動 prompt、把 AI 當高級搜尋；往上是你會用 tool、會給它上下文；再往上是你開始並行跑好幾個 session、會設計 harness 讓它更可控；最頂端，是你已經不直接 prompt 了，而是在設計那套「替你 prompt 的系統」，讓 loop 自己跑、你只管定義意圖跟驗收。整站前面幾章其實就是在陪你一級一級往上爬。

我自己老實講，大概在 7 往 8 之間 — 但我很常被 distraction，需要 pick up 回來，這是人類版的 Context Switch，overhead 超高。而且說真的，我也還沒有一個 Product 去真正驗證我的工程能力。追這條浪，累欸。追的很累耶。

但我想講的重點，不是要你焦慮自己在第幾級。剛好相反 — 這把尺的價值，是讓你停止「什麼都想追」的焦慮，改成「我現在在這一級，下一級具體要補什麼」。這其實跟第一章那句話是同一件事：追概念，不追工具。Level 不是拿來跟別人比的，是拿來給自己定位、規劃下一步的。

而且爬這條階梯有兩個很現實的提醒。第一，它不是線性一路往上 —你會被日常工作、被 context switch 一直往下拉，能穩定 pick up 回來本身就是一種能力。第二，級數高不代表贏，最後還是要有東西被市場、被 Product 驗證，光是「我會很進階的玩法」不算數。這也剛好接到全站最後兩個概念：吸血小鬼（爬得越高，剩下的越是難題）跟品味（決定勝負的，從來不是你在第幾級，是你做出了什麼）。

所以這一節請你做一件事就好：誠實幫自己標一個 Level，然後只問「下一級要補的那一件事是什麼」。

## 關鍵重點

- Martin Fowler 提的 8 個 Level，是一把「量自己在哪」的尺，不是拿來跟別人比
- 階梯方向：手動 prompt → 會用 tool／給 context → 並行 session／設計 harness → 設計自主系統
- 不是線性上升 — 會被 distraction 跟 context switch 往下拉，能 pick up 回來是能力
- 級數高 ≠ 贏：最終要有 Product／市場驗證，玩法進階本身不算數
- 用法：誠實定位當前 Level，只問「下一級要補的那一件事」，呼應「追概念不追工具」

## 互動示範構想

一座 8 階的樓梯，每一階標一個 Level 的一句話描述（Lv1 手動 prompt … Lv8 設計自主系統）。使用者用一份 5–6 題的自評小問卷（「你還在手動 prompt 每一步嗎？」「你會並行跑多個 agent 嗎？」「你會設計替你 prompt 的 loop 嗎？」）回答後，一個小人自動站到對應的階上，並高亮「下一階你需要補的那一件事」。旁邊放一個會不定時把小人往下拉一格的「distraction」干擾按鈕，並顯示「pick up 回來 +1」，呈現「非線性、會被拉扯」的真實感。

## 課堂提問

- 用這把尺誠實量一下，你現在大概在第幾級？判斷依據是什麼？
- 到下一級，你要補的「那一件事」具體是什麼 —是工具、是心態、還是一個真的被驗證的 Product？
- 「級數高不代表贏，最後要有東西被市場驗證」— 這句話對你安排接下來的學習優先序有什麼影響？

## 原文金句

> 我好像在 7 往 8 左右，可是我很常被 Distraction，需要 pickup 回來，人類版 Context Switch High Overhead。

> 還沒有 Product 驗證我的工程能力。
