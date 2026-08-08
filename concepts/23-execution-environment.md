---
id: execution-environment
title: 跑在哪，是開關，不是屬性
subtitle: Execution Environment
chapter: 3
chapterTitle: 從聊天到 Agent
classroom: true
---

## 一句話

別問「這個產品跑在哪」—— 問「我這個 session 現在跑在哪、開了哪幾個口」。

## 三分鐘講稿

上一課結尾我留了一句：遠端／本地不是產品的固定屬性，是產品內部的一個開關。這一課就把它拆開來看。

先講課堂那一幕。我們在 Cowork 裡想裝一個 MCP，照文件下指令，**裝不動**；最後改開 Claude Code，一下就好。當下大家的結論很自然：「喔，Cowork 就是比較弱嘛。」

**這個結論是錯的。** 不是 Cowork 比較弱 —— 是我們那個 session **根本沒開 shell 這個口，也沒開 MCP 這個口**。同一個 Cowork，換一個模式跑，那兩個口就在。

要看懂，先把兩件常被混在一起的事分開：**agent loop 在哪裡跑**（想 → 呼叫工具 → 再想的迴圈，引擎在誰的機器上轉），跟**程式碼在哪裡執行**（跑一行指令、開一個檔案，發生在哪台機器上）。大部分人以為這是同一件事。不是。

拿 Cowork 當標本。**Cloud session** 是 agent loop 跟程式執行**都在** Anthropic 雲端的隔離 sandbox 裡，每個 session 一個、結束即銷毀；它連不到你的內網，對外流量走它管的通道，繞不過去。**Local session** 則是 agent loop 跑在**你的裝置上**，程式執行在**你電腦裡的一台隔離 VM**。

那問題來了：cloud session 整個跑在人家機房，怎麼還讀得到我桌面的檔案？答案是 —— **它繞回來。** 請求經 Anthropic 中介，繞回**你電腦上的 Claude Desktop app**，只限你明確連結的那幾個資料夾。推論很實際：**Desktop app 一離線，雲端 session 就碰不到你的電腦了。**

再來是最實用的一段，**四個口，哪些是開的**：cloud session 有 web 工具、（繞回 Desktop 的）本地資料夾、connector；**local session 才額外有 shell 指令和 plugin MCP server**，在那台隔離 VM 裡跑。

回頭看課堂那一幕，答案就跳出來了：我們跑在 cloud session。這不是「比較弱」的籠統印象，是一個具體、可以查證的開關狀態。

接著是最要你警覺的：**預設會被改，而且不一定通知你。** 2026 年 7 月 7 號起，Anthropic 逐步把 Cowork 預設改成雲端執行，**沒有 in-app 提示**。你昨天在本地跑得好好的，今天打開已經在雲端，畫面長得一模一樣。開關在 **Claude Desktop → Settings → Cowork →「Run new tasks in the cloud」**，自己去看一眼。

還要打掉另一個直覺：**「跑在我自己機器上就安全」。** 2026 年 7 月 27 號，研究者揭露 Cowork 在 Mac 上的**沙箱逃逸**漏洞 —— 跳出那台 VM、讀寫整台機器的檔案。隔離牆是軟體做的，軟體就會有洞。

別家一樣。**Codex** 兩邊都有，雲端是預載你 repo 的隔離容器，所以「codex 就是本地的」不成立；**ChatGPT** 的 Agent mode 是雲端虛擬電腦，碰不到你本機的檔案、除非你上傳，Work 版還要在桌面版授權才用得到本地資料夾。

收尾三句。問法換掉：不是「這個**產品**跑在哪」，是「**我這個 session 現在跑在哪、開了哪些口**」。三個口一次問完：**shell？MCP？本地資料夾？** 還有，**預設值是廠商的商業決定，不是物理定律** —— 它會改，而且不一定跟你說。

最後跟概念 20 對起來看：20 問的是**你拿多大的鑰匙**（權限的深度），這一課問的是**你在哪裡開鎖**（程式在誰的機器上跑、開了哪幾個口）。兩張圖疊起來，才是你這個 session 完整的邊界圖。

## 關鍵重點

- 「agent loop 在哪跑」和「程式碼在哪執行」是兩件事 —— 混為一談就會問錯問題
- Cowork 兩種模式：cloud（loop＋執行都在 Anthropic 隔離 sandbox，每 session 一個、結束即銷毀、連不到內網／metadata、對外強制走 proxy）／local（loop 在你裝置上，執行在本機隔離 VM：macOS Virtualization.framework、Windows Hyper-V）
- 雲端 session 碰你的檔案，是**繞回你電腦上的 Claude Desktop**，只限你明確連結的資料夾、每次呼叫都對權限 —— Desktop 離線，這條線就斷
- 口不一樣：cloud 有 web 工具／（經 Desktop 的）本地檔案／connector；**只有 local 才有 shell 和 plugin MCP** —— 課堂上 Cowork 裝不動 MCP 就是這個原因，不是「比較弱」
- 預設會被廠商改且不一定通知：2026-07-07 起 Cowork 預設轉雲端、無 in-app 提示；開關在 Claude Desktop → Settings → Cowork →「Run new tasks in the cloud」
- 本地 ≠ 零風險：2026-07-27 有研究者揭露 Mac 上的沙箱逃逸 —— 可跳出 VM 讀寫整台機器
- 別家一樣是開關不是屬性：Codex 有雲端容器（預設關網路）與本地 CLI sandbox；ChatGPT Agent mode 是雲端虛擬電腦、碰不到本機除非上傳，ChatGPT Work 要桌面版授權才有本地資料夾
- 跟概念 20 合起來看：20 問「拿多大的鑰匙」（權限深度），這篇問「在哪裡開鎖」（執行位置與開的口）

## 互動示範構想

一個產品（Cowork）＋一個執行模式開關。畫面上方是模式切換（Local session / Cloud session），中間是三欄示意圖：左邊「Anthropic 雲端 sandbox」框、右邊「你的電腦」框（內含「本機隔離 VM」與「你連結的資料夾」），中間是「Claude Desktop」當代理通道，兩側各一條線。一顆「agent loop」膠囊會在左右兩框之間移動。下方是四個能力口的燈號：web 工具 / 本地資料夾 / shell / MCP，點任一個口就在下面攤開它在目前模式下的實際狀態說明。

導演節奏：先看 local 模式，agent loop 停在右邊的本機 VM，四口全亮 → 切到 cloud，膠囊飛到左邊雲端框，**shell 與 MCP 兩顆燈直接熄掉**，並重現課堂那一幕：想下指令裝 MCP，指令送不出去（抖動）→ 那本地檔案怎麼還碰得到？畫出經 Claude Desktop 的代理路徑、封包沿線流動，接著把 Desktop 關掉，整條線斷開、本地資料夾燈也熄 → 廠商改預設：開關自己被撥到 cloud、沒有任何提示，旁邊浮出「你以為：還在本地」→ 本地也不是保險箱：本機 VM 的框上裂開一道縫，有東西漏到 VM 外的整台機器 → 最後開放 sandbox，自由切模式、開關 Desktop、點每個口讀說明，自己讀出「我這個 session 開了哪三個口」。

## 課堂提問

- 你現在正在用的那個 session，agent loop 跑在哪？shell、MCP、本地資料夾這三個口，你確定哪幾個是開的？
- 如果廠商今天把你的預設從本地改成雲端、而且不通知你，你會從哪個徵兆先發現？
- 「跑在我自己機器上就安全」—— 知道有沙箱逃逸這回事之後，你會怎麼修正這個直覺？

## 原文金句

> 不是 Cowork 比較弱 —— 是那個模式根本沒開 shell 跟 MCP 這兩個口。

> 別問「這個產品跑在哪」，要問「我這個 session 現在跑在哪」。

> Desktop app 一離線，雲端 session 就碰不到你的電腦了。

> 預設值是廠商的商業決定，不是物理定律。

> 概念 20 問你拿多大的鑰匙，這一課問你在哪裡開鎖。
