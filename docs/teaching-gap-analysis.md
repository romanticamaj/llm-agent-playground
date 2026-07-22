# 授課實錄 vs 網站內容 — 落差分析與建構清單

> 來源：2026-07-22 診所授課逐字稿。逐段對照現有 20 個概念後整理。
> 標記：🆕 全新概念（網站沒有）｜🔧 既有概念需補脈絡｜🗺 產品對照｜📋 順序調整

---

## A. 🆕 全新概念 — 課堂有教、網站完全沒有（優先建構）

### A1. Skill — 把成功的流程固化成可重複的工具 ⭐ 當天課程主軸
- **授課脈絡**：一次成功的聊天驗證流程（自費表核對）→「把整個驗證流程整理成完整的 skill，包含所有輸入項目、輸出規格」→ 下載 skill 包（zip/資料夾）→ 裝進 Claude（Customize → Skills / 專案資料夾）→ `/` 斜線 trigger → 實測
- **金句**：「這個 prompt 小小的，但你們寫的時候會蠻吃力的，那是因為我練很久了」
- **互動構想**：三步驟流水線 — ①聊天流程卡片（讀檔→比對→報表）②按「Hardening」壓縮成 skill 包（動畫：對話蒸餾成 SKILL.md）③拖進 agent、斜線選單亮起、trigger 重跑一次成功
- **踩雷筆記**：skill 放錯位置就 trigger 不到（不同家 agent 放法不同）→ 課堂提醒：遇到就問，不要自己花時間
- 出處：課堂實錄（可輔以 [Suno 工作流文章](https://www.garyhsieh.com/blog/2026-05-21-suno)、[SW Eng w/ Claude 關鍵字](https://www.garyhsieh.com/blog/2026-05-11-software-engineering-claude)）

### A2. 選大腦 — 模型與 Context Window 的選擇
- **授課脈絡**：每個模型注意力極限不同。難題/規劃/思考 → context window 大、模型強；聊聊天 → 選最便宜的。「殺雞焉用牛刀」反過來也成立：sonnet 一直亂講 → 馬上換 opus
- **關鍵數字**（他教的口訣）：**100 萬 token ≈ 50 萬中文字**（英文除以一）＝一本小說的記憶；**20 萬 = 小任務**；128k 問六七十個問題就開始幻覺、遺忘 →「幻覺跟遺忘就是這樣來的」
- **互動構想**：任務滑桿（隨口聊 ↔ 策略顧問）→ 即時推薦模型檔位；旁邊 context window 量體比較條（1M / 200k / 128k），塞問題進去看幾題後開始「忘」
- 出處：課堂實錄 + [Context Window 文章](https://www.garyhsieh.com/blog/2026-04-07-ai)

### A3. Compaction / 換新視窗 — 貨車卸貨（從 04 獨立成完整概念）
- **授課脈絡**：貨車台中→台北、限載 100 貨；開到新竹發現 99 萬了 → compaction＝把貨整理一次，該下的下、要到台北的留著 → 99 萬壓到 20 萬，**剩下 79 萬的貨就忘了**
- **實戰兩招**：①聊到開始幻覺（生圖越生越爛最明顯）→ 前一視窗說「幫我整理這一次的 context」→ 貼到新視窗繼續 ②重要貨先寫「行程記錄表」到硬碟（檔案），之後叫它去查文件撈回車上
- **互動構想**：貨車儀表 demo — 貨量逼近 100% 觸發 compaction 動畫（79 萬貨蒸發變灰飛走）；玩家可先按「寫行程記錄表」把關鍵貨存到路邊倉庫，compaction 後再撈回來對比結局
- 出處：課堂實錄 + [Session Handoff](https://www.garyhsieh.com/blog/2026-04-06-session-handoff-long-running)

### A4. Project / GPTs / Gem ＝ 文字接龍的固定開頭
- **授課脈絡**：「GPTs、Gem、Project 只是行銷名字，它就是把一段話接在文字接龍的最前面」。完整拼裝＝ ①記憶的接龍 ②Project 起始點 ③你這次要聊的 — 三塊接在一起得到非決定性輸出
- **應用**：社群寫手 project（「你是社群文章寫手，會用我的 skill 撰寫」）；prompt 寫越細、每月風格越穩定
- **互動構想**：三段式 context 組裝視覺（記憶塊＋Project 開頭塊＋當前輸入塊）→ 改 Project 開頭那塊，看同一句輸入的輸出風格即時改變
- 出處：課堂實錄 + [文字接龍](https://www.garyhsieh.com/blog/2026-04-22-ai-prompt-ai)

### A5. 輸出格式 — 「請你輸出 HTML 格式讓我看」
- **授課脈絡**：markdown 只是格式、要有 reader 才漂亮（跟 PDF/PDF reader 同理）；醫師團隊不用管 markdown，記一句話就好：**「請你輸出 HTML 格式讓我看」**
- **互動構想**：同一份報表三種輸出並排 — 原始 markdown（天書）/ markdown+reader / HTML（直接漂亮）；一鍵切換體會差異
- 出處：課堂實錄

### A6. Tool 驗證方法論 — 先確認 tool 真的有動
- **授課脈絡**：讀檔後**先要求回報讀到什麼**（「每個項目有幾列先列出來」）— tool 沒 trigger 成功，後面的接龍都是聊爽的；要求「說明在第幾列」讓人工可查證；「到台北要跟我說到了，不然它看到新竹就跑走了」
- **互動構想**：兩條流程對比 — 沒驗證：tool 靜默失敗、AI 一路快樂編故事到結尾才發現全錯；有驗證：第一步回報 29 列 ✓ 才往下走
- 出處：課堂實錄 + [第一次就對](https://www.garyhsieh.com/blog/2026-03-26-ai-code)

---

## B. 🔧 既有概念 — 需補上實際授課的類比與內容

| # | 現有概念 | 課堂上的差異 | 建構項目 |
|---|---|---|---|
| B1 | 04 Context Window（桌子） | 實際用的是**貨車載貨台中→台北**＋attention/Transformer 的 T 由來、小孩注意力幾十秒的類比 | demo 換成/新增貨車版本；講稿補 attention 段落 |
| B2 | 02 Deterministic | 實際用**診所排班**：「公平沒辦法量化＝非決定性」；「說得出第一步第二步第三步＝deterministic」 | 加「工作流分類器」互動：丟任務卡（對帳/排班/發文…）玩家分類，AI 給回饋 |
| B3 | 03/12 記憶 | 課堂教的是**產品實操**：ChatGPT/Claude 個人化→記憶 UI（可看/新增/刪除）、「這太重要了幫我記下來」、睡覺大腦重整類比、**養寫手**（持續餵語氣） | 補「記憶管理實操」小節＋養寫手案例 |
| B4 | 08 Tool Use | 醫師的 aha moment：「**LLM 輸出文字 → Agent 輸出指令來操作 tool**」；`start .` 開場 demo；PowerShell 就是 tool | demo 開頭加這組對比字卡；金句收進講稿 |
| B5 | 18 拉新訊號 | 課堂直接綁定 **web search 是第一個必學 tool**：「未來做任何東西都要幫 AI 拉新訊號，怎麼拉？web search」＋market research 實例（汽車材料大爆賣） | 18 補 web search 入口；或獨立「Web Search — 第一個 tool」（出處：[web-search 文章](https://www.garyhsieh.com/blog/2026-04-15-web-search-ai)，目前未使用！） |

---

## C. 🗺 產品地圖 — 課堂大量對照、網站沒有

### C1. 同一顆大腦、不同的身體 — 產品對照表
課堂上反覆做的對照，值得一頁互動總表：

| 產品 | 本質 | 工具/權限 |
|---|---|---|
| ChatGPT / Claude 網頁版 | 聊天＋少量內建 tool（web search） | 只能動他們那端的電腦 |
| Cowork | 「就是 agent，行銷取了好聽的名字」 | 有限度工具、介面漂亮、寫到你電腦 |
| Claude Code | 正式 agent | 工具最多、控制你整台電腦、terminal |
| OpenClaw 龍蝦 | 常駐 agent | 權限全開、記憶全在你這端 |
- 對應概念 11（Harness）已有理論，缺這張**產品落地對照**
- 互動構想：同一句任務丟四個產品，看各自能做到哪一步（聊天止步/寫檔/開瀏覽器/常駐記憶）

### C2. Remote Control — 手機接管所有 session（wow demo）
- 「手機上有我全部 Claude Code session，我想走去哪就做事做到哪」＋ /config 開推播
- 建構：可做成 C1 的延伸小節或上課 demo 腳本，不一定要互動

---

## D. 📋 授課順序 — 網站章節 vs 實際教學脈絡

實際授課動線（本次實錄）：
```
文字接龍 → Deterministic(排班) → 記憶(產品實操) → Context Window(貨車+選模型)
→ Compaction/換視窗 → 編輯鈕時光機 → Agent 三件套(大腦/工具/規範)
→ 龍蝦/Claude Code/Cowork 產品對照 → Tool Use(輸出指令) → Web Search
→ Skill(建構→安裝→trigger→驗證) → Project=接龍開頭
```

建議調整：
1. **Ch1 加入** A2（選大腦）、A3（Compaction 獨立）→ Ch1 變成：接龍 → deterministic → stateless → context window(貨車) → 選大腦 → compaction/換視窗 → 編輯鈕 → prompt cache
2. **Ch2 重排**：Agent 解剖 → Tool Use → Web Search/新訊號 → **Skill(A1)** → 產品地圖(C1) → Harness
3. **Hooks / Multi-Agent / Long-running 標成「進階章」**：這次課完全沒碰，是工程師場的內容 — 網站可加「入門路線 / 工程師路線」雙路徑切換
4. Presentation 模式可考慮支援**自訂播放清單**（這堂課只講 8 個概念，順序自選）

---

## 建議執行順序

| 優先 | 項目 | 理由 |
|---|---|---|
| P0 | A1 Skill | 當天主軸、下週還要教、完全缺失 |
| P0 | A3 Compaction 貨車 | 他花最多時間講的類比、現有桌子版對不上 |
| P0 | A2 選大腦 | 學員每天要做的決策、有具體口訣數字 |
| P1 | B1 貨車類比併入 04、B2 排班分類器 | 對齊授課語言 |
| P1 | A4 Project=接龍開頭、C1 產品地圖 | 學員實際困惑點（醫師直接問了） |
| P2 | A5 HTML 輸出、A6 tool 驗證、B3-B5 | 小而實用 |
| P2 | D 雙路徑 + 自訂播放清單 | 結構性改動 |
