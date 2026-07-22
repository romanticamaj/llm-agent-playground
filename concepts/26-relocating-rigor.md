---
id: relocating-rigor
title: 嚴謹搬家
subtitle: Relocating Rigor
chapter: 6
chapterTitle: 與 AI 協作的方法
source:
  - title: "10 年前在群暉，沒過 review 的 commit 不能進 release build；現在我幾乎不逐行 review code 了"
    url: https://www.garyhsieh.com/blog/2026-06-04-relocating-rigor
    date: 2026-06-04
---

## 一句話

嚴謹度不會因為 AI 進來就消失，它只是換了位置——往上游搬到 spec 與 intention，往下游搬到自動化 verification。

## 三分鐘講稿

我剛出社會在群暉的時候，學到的 review 是這樣的——兩個人坐下來，開著 DiffMerge，一行一行看。嚴到什麼程度？任何一個 Git commit 沒有經過 review，絕對不准進 release build，還要 coder 講一次、reviewer 問問題，在 commit message 標注 reviewer。那套訓練到現在我都很感激，它逼你養成一種下意識——看到一段 code，會反射性地想「這裡會不會 race、這個 edge case 有沒有顧到」。

問題是，2026 年，有需要嗎？

現在 AI 產出的量，已經多到不可能再用「兩個人坐下來一行一行看」的方式處理。我一個 session 跑下來，產出的 code 量可能是以前一整天手寫的好幾倍。如果我還堅持每一行都自己過一遍，整條流水線最慢的環節就會變成我這個人。很反直覺——越資深、看得越仔細，就越可能變成拖慢全隊的瓶頸。

Chad Fowler 有個講法我很喜歡，叫 Relocating Rigor——嚴謹度不會因為 AI 進來就消失，它只是換了位置。以前嚴謹集中在「中間那層」，也就是逐行看 code；現在那層可以交出去了，嚴謹往兩頭搬：往上游搬到 spec 跟 intention，往下游搬到自動化的 verification。

上游要確認三件事：spec 對不對、業務需求有沒有抓到、我的 intention 有沒有被正確翻譯成它聽得懂的東西。這層完全是人工在做，沒辦法外包。Addy Osmani 說得很到位：現在 reviewer 的角色更像 editor 或 architect，而不是逐行檢查的 inspector。

下游我 review 的是架構層級——但我不看 code，我看圖。我要求 AI 先產出一張 Conceptual Map，我直接看那張圖。我看的不是這行 code 對不對，是這個 agent 到底有沒有在做我要它做的事。方向錯？直接整批廢掉重來，現在寫 code 太快了，根本不值得逐行修一份方向就錯的東西。

那中間被掏空的那層誰來做？Cross Model 跟 Cross Context。Cross Context：review 的 agent 不要給它產出時的對話歷史，讓它在乾淨的 session 裡只看最終產物——跟「不要讓寫 code 的人 review 自己的 code」同一個道理。Cross Model：不同架構的 model，blind spot 不一樣，A model 漏掉的，B model 往往一眼抓到。

還有一個坑：AI 會合理化自己沒做完的事，跟你說「這樣就可以了」。對付它，驗收指標（Acceptance Metrics）要先定義清楚——指標夠明確，AI 就沒有模糊空間可以敷衍；指標含糊，它就用最省力的方式交差。

## 關鍵重點

- 逐行 review 撐不住 AI 的產出量——越資深、看得越仔細，越可能變成拖慢全隊的瓶頸
- Relocating Rigor（Chad Fowler）：嚴謹沒有消失，往上游搬到 spec / intention，往下游搬到自動化 verification，中間交給 agent
- 上游 review 無法外包：spec 對不對、業務需求有沒有抓到、intention 有沒有被正確翻譯——reviewer 更像 editor / architect，不是 inspector
- 下游看圖不看 code：要求 AI 先產出 Conceptual Map，review 架構層級；方向錯就整批廢掉重來
- 中間那層交給 Cross Model（換 model 看，blind spot 不同）+ Cross Context（乾淨 session 只看最終產物，寫的人不 review 自己的 code）
- Acceptance Metrics 一定要先寫：指標明確 AI 就沒有敷衍空間，指標含糊它就用最省力的方式交差

## 互動示範構想

畫面是一條「嚴謹度分布圖」：橫軸是開發流程三段（上游 Spec/Intention → 中游逐行 Code Review → 下游 Verification），縱軸是你投入的嚴謹度，用可拖動的能量條呈現。開場預設是「10 年前的群暉模式」——能量全堆在中間那層，旁邊播一段兩人逐行 review 的示意動畫。接著 AI 產出量開始暴增（畫面上 code 卡片像瀑布一樣落下），中間那條能量條旁邊出現一個越排越長的等待佇列，標示「瓶頸：你」。使用者按下「搬家」按鈕，能量條動畫式地從中間流向兩頭：上游亮起「spec / intention / 架構原型」的檢查清單，下游亮起「Conceptual Map + Acceptance Metrics + Cross Model / Cross Context 驗證」，中間掏空的位置由兩個不同顏色的 agent 圖示補上（一個標 Claude、一個標 Codex，各自在獨立的乾淨 context 框裡）。搬完後瀑布順暢流過、佇列消失。加碼互動：點擊下游的「Acceptance Metrics」開關切換「指標明確 / 指標含糊」，含糊時 agent 會跳出「這樣就可以了」的敷衍對話框讓瑕疵溜過去，明確時瑕疵被擋下——直觀展示指標明確度的差別。

## 課堂提問

- 你現在花最多 review 時間的位置，是在上游（spec / intention）、中游（逐行看 code），還是下游（verification）？這個分布是刻意設計的嗎？
- 「越資深、看得越仔細，越可能變成瓶頸」——你同意嗎？你的團隊裡誰是那個瓶頸？
- 你上一個交給 AI 的任務，有先寫下明確的 Acceptance Metrics 嗎？如果 AI 想敷衍交差，你的指標擋得住嗎？

## 原文金句

> 嚴謹度不會因為 AI 進來就消失，它只是換了位置。

> 我現在看的，不是這行 code 對不對，是這個 agent 到底有沒有在做我要它做的事。

> 指標夠明確，AI 就沒有模糊空間可以敷衍；指標含糊，它就會用最省力的方式「交差」。
