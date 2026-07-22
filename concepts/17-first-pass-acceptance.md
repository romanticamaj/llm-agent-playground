---
id: first-pass-acceptance
title: 第一次就對
subtitle: First-pass Acceptance
chapter: 5
chapterTitle: 與 AI 協作的方法
source:
  - title: "不要追求 AI 多快生出 code，要追求第一次就對"
    url: https://www.garyhsieh.com/blog/2026-03-26-ai-code
    date: 2026-03-26
---

## 一句話

不要追求 AI 多快生出 code，要追求第一次就對。

## 三分鐘講稿

大家用 AI 最常見的失敗模式是什麼？Martin Fowler 在《Patterns for Reducing Friction in AI-Assisted Development》裡幫它取了一個名字，叫 Frustration Loop——挫折循環。四步：Generate、Review 覺得「不太對」、Regenerate 還是錯、最後放棄。是不是很熟悉？

所以他提出一個指標，叫 First-pass Acceptance Rate——第一次就從 AI 拿到能用結果的機率。重點不是 AI 生得多快，是第一次就對。而且不只是程式碼，生圖、生影像、生文案都一樣。因為我們講的是「工程」——你只要把第一步做對，後面 AI 幫我們放大，會把剩下的做完、做到好。

我自己就踩過一次。有一次做研究，Opus 4.6 第一次跑，完全找不到我要的東西，一直說「server 400、只有 Haiku 可以用」，至少 reject 我三次。但我知道那件事實務上一定做得到——因為別人的開源專案已經做出來了。所以我直接把那個專案的關鍵檔案指給它，明確要求它去讀特定幾支檔案，加上我自己也先掃過 code，它就有辦法幫我建構出我要的東西。

這帶出關鍵問題：如何給予有效的 Context？李宏毅教授講過一篇論文，Attention Space 其實跟人一樣：我們通常只記得最開始和最近發生的事，過程中的細節會忘記，甚至塞爆你的 context。

所以怎麼讓 AI 第一次就給你正確的資訊？這就是 Context Engineering：瞭解各領域背後的原理、底層邏輯，你知道怎麼下 prompt，AI 第一次就能產出你要的東西。這也是 Harness Engineering：能夠明確指出底層的邏輯，讓 AI 朝著你想要的方向去做。

你可能會想——「那我不就自己看 code 就好了嗎？」事實上，在看了 code 並指引它之後，AI 幫你把全部邏輯串接起來省下的時間，是手動處理的 5 倍、10 倍起跳。

落地怎麼做？開始跟 AI 聊之前，先問自己兩個問題：What is the goal? Where is the goal aiming for? 設定好目標，你就會知道要跟它說什麼。僅此而已。

## 關鍵重點

- Frustration Loop：Generate → Review「不太對」→ Regenerate「還是錯」→ 放棄。這是大多數人用 AI 的失敗模式
- First-pass Acceptance Rate（Martin Fowler）：衡量第一次就從 AI 拿到能用結果的機率——追求的是這個，不是生成速度
- Context Pollution 會讓 Context Window 效能下降；Attention Space 跟人一樣，記得頭尾、忘記中間
- Context Engineering = 懂底層原理 + 會下 prompt → AI 第一次就產出你要的東西；Harness Engineering = 明確指出底層邏輯，讓 AI 朝你要的方向去做
- 看過 code 再指引 AI，省下的時間是手動處理的 5 倍、10 倍起跳

## 互動示範構想

畫面分左右兩欄，主題是「同一個任務，兩種問法」。左欄是「模糊 prompt」，右欄是「有效 Context 的 prompt」（指定要讀哪些檔案、講清楚目標）。使用者按下「開始」，兩欄同時模擬 AI 對話：左欄跑出 Frustration Loop 動畫——Generate → 使用者皺眉「Not quite right」→ Regenerate → 「Still wrong」→ 循環計數器一直加，回合數跳到 4、5、6 次；右欄第一回合就打勾出現「Accepted ✓」。畫面下方有一個即時累計的「總耗時」與「First-pass Acceptance Rate」儀表板，左欄的 rate 停在低檔、時間一直跑，右欄一次過關。最後浮出結論字卡：「不要追求 AI 多快生出 code，要追求第一次就對。」使用者可以切換不同任務情境（寫 code、生圖、寫文案）重跑一次，看到同樣的模式。

## 課堂提問

- 回想你上次跟 AI 來回超過三輪的經驗——問題出在 AI 不夠聰明，還是你沒給它有效的 Context？
- 「What is the goal? Where is the goal aiming for?」——你手上正在做的任務，能不能用一句話講清楚目標？
- 如果你已經知道答案了，為什麼還要讓 AI 做？（提示：省下的時間是 5 倍、10 倍起跳）

## 原文金句

> 不要追求 AI 多快生出 code，要追求第一次就對。

> 你只要把第一步做對，後面 AI 幫我們放大，會把剩下的做完、做到好。

> 在看了 code 並指引它之後，AI 幫你把全部邏輯串接起來省下的時間，是手動處理的 5 倍、10 倍起跳。
