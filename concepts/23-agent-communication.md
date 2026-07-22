---
id: agent-communication
title: Agent 怎麼聊天？作業系統早就演過了
subtitle: Agent Communication
chapter: 5
chapterTitle: Multi-Agent 與長時間運行
source:
  - title: "AI Agent 是怎麼溝通的？設計了一堆 Agent，打算怎麼讓它們溝通 — 全部都 spawn sub-agent？還是一個 session 一個，然後讓它們彼此交換資訊？"
    url: https://www.garyhsieh.com/blog/2026-04-17-ai-agent-agent
    date: 2026-04-17
---

## 一句話

Agent 溝通就是作業系統的 IPC 問題重演一遍 — 而決定成敗的，不是怎麼傳，是傳什麼。

## 三分鐘講稿

AI Agent 是怎麼溝通的？你設計了一堆 Agent，打算怎麼讓它們溝通 — 全部都 spawn sub-agent？還是一個 session 一個，讓它們彼此交換資訊？

先講一個會讓你意外的答案：Claude Code 的做法其實意外簡單 — 直接寫檔案、讀檔案、加個鎖。對，檔案系統當 message bus。每個 teammate 是獨立的 CLI process，溝通方式是寫 JSON 到 inbox 檔案，寫入用 flock() 做互斥鎖，讀取用 polling。

用 sub-agent 的時候，最常見的模式是 parent 把 prompt 丟給 child，child 做完回傳結果 — 這就是 OS 裡的 pipe：stdin 進、stdout 出，單向、parent-child only。很直覺，但很快會碰到瓶頸：如果兩個 agent 需要橫向溝通呢？

我研究了三個系統：Claude Code Agent Teams 用檔案系統、OpenClaw 用 WebSocket Gateway 當中央樞紐、Google 推的 A2A Protocol 用 Agent Card 做 discovery、JSON-RPC 跨網路互通。三個底層都是 structured text serialization — 差異在 transport 跟 topology。

然後你會發現，這整件事就是作業系統的 IPC 問題。以前作業系統學的 process、thread、IPC、flock、shared memory、message queue — 全部在 agent 系統裡重演了一遍。Process 對應 Agent、OS 對應 Harness、fork+exec 對應 spawn sub-agent、pipe 對應 stdin/stdout、TCP socket 對應 WebSocket。連經典問題都一模一樣：scheduling、context switch、memory isolation、permission。

所以我整理出一個五層決策模型，由下往上逐層決定：Layer 0 是 Environment — agent 跑在哪？Layer 1 是 Transport — 怎麼傳？Layer 2 是 Topology — 誰跟誰講？Layer 3 是 Protocol — 什麼格式？Layer 4 是 Content Contract — 傳什麼？

前四層只是把 bytes 送到，第五層才決定對方能不能用。你可以有完美的 transport，但 agent A 傳了一大坨 raw context dump，agent B 的 context window 直接爆掉，溝通就失敗了。Content Contract 才是 agent 溝通成敗的真正關鍵 — 也是目前所有系統做得最狂野的一層。

## 關鍵重點

- Claude Code Agent Teams 的溝通機制意外簡單：檔案系統當 message bus，JSON 寫進 inbox、flock() 上鎖、polling 讀取 — 好處是直接 cat 那個 inbox 就能 debug
- Agent 溝通 = OS 的 IPC 問題重演：Process→Agent、OS→Harness、fork+exec→spawn sub-agent、pipe→stdin/stdout、TCP socket→WebSocket
- 五層決策模型：Environment（在哪）→ Transport（怎麼傳）→ Topology（誰跟誰）→ Protocol（什麼格式）→ Content Contract（傳什麼）；前一層的選擇會 constrain 後一層
- MCP vs A2A：MCP 是 agent-to-tool（垂直，= system call），A2A 是 agent-to-agent（水平，= 跨 process 溝通），兩者互補不衝突
- Content Contract 是成敗關鍵：agent 之間傳的不是隨便一段文字，是經過 memory selection 和 compression 的結構化內容

## 互動示範構想

一個「五層決策模型」的互動決策板。畫面左側是五層由下往上疊的階梯（L0 Environment → L4 Content Contract），右側是三個系統的卡片（Claude Teams / OpenClaw / A2A）。

使用者從 Layer 0 開始點選：「你的 agent 跑在哪？」出現四個選項（same process / same machine / same network / open internet）。點選其中一個之後，Layer 1 的 transport 選項會即時亮起可用的、灰掉不可用的 — 直觀展示「前一層的選擇會 constrain 後一層」。例如選了 same machine，file + flock 和 pipe 亮起；選了 open internet，就只剩 HTTP + 認證。一路選到 Layer 3 之後，右側會自動 highlight 最接近你這組選擇的真實系統（例如選 same machine + file + star → Claude Teams 卡片發光，並顯示「直接 cat inbox 就能 debug」的說明）。

最後一步是 Layer 4 的戲肉：畫面出現兩個 agent 對傳訊息的動畫，使用者二選一 —「傳 raw context dump」或「傳壓縮過的結構化摘要」。選 raw dump，接收方的 context window 條瞬間爆紅、溝通失敗；選結構化摘要，訊息順利進入、任務繼續。用這個對比收尾：前四層只是把 bytes 送到，第五層才決定對方能不能用。

## 課堂提問

- 你現在的 multi-agent 設計是哪種 topology？Hierarchy、Star、Peer 還是 Pub/Sub？這是你選的，還是 harness 幫你選的？
- Claude Teams 為什麼敢用「寫檔案」這麼土法煉鋼的方式溝通？什麼情境下這反而是最佳解？
- 如果你的兩個 agent 溝通失敗了，你會先檢查哪一層？為什麼作者說 Content Contract 是最難的一層？

## 原文金句

> Claude Code 的做法其實意外簡單，直接寫檔案、讀檔案、加個鎖 🫠

> 以前作業系統學的 process、thread、IPC、flock、shared memory、message queue — 全部在 agent 系統裡重演了一遍。

> Content Contract 才是 agent 溝通成敗的真正關鍵 — 也是目前所有系統做得最狂野的一層。
