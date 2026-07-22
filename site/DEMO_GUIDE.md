# Demo 模組實作規格

每個概念的互動 demo 是一個獨立 JS 模組，位於 `src/demos/<concept-id>.js`。

## 合約（Contract）

```js
// 必須 default export 一個 mount 函式
export default function mount(el, ctx) {
  // el: 一個 position:absolute; inset:0 的容器，位於全螢幕 overlay 的 stage 區內（stage 可滾動）
  // ctx: { accent: '#5b8cff', concept: {...該概念的完整 JSON 資料...} }
  // 在 el 裡面建立你的 DOM / canvas / svg，啟動動畫
  return () => {
    // cleanup：清掉所有 setInterval / setTimeout / requestAnimationFrame / addEventListener(window/document)
  }
}
```

## 硬性規則

1. **Vanilla JS only** — 不得引入任何新依賴。可以 `import * as THREE from 'three'`（已安裝），但只在 3D 真的加分時用；2D 概念視覺請用 DOM / Canvas2D / SVG，教學畫面要「清楚」優先於「炫」。
2. **自帶樣式** — 在模組內建立 `<style>` 注入，所有 class 加上概念 id 前綴（如 `.ntp-board`）避免衝突；cleanup 時移除該 style 元素。可用全域現成的 `.demo-btn`（按鈕）、`.demo-btn.primary`、CSS 變數 `var(--accent)`。
3. **深色舞台** — 背景已是深色（#0b0d12 系），你的 UI 直接畫在上面；主色用 `var(--accent)` 或 `ctx.accent`，輔以白/灰階；成功=綠 `#4ade80`、錯誤/汙染=紅 `#f87171` 可用。
4. **繁體中文**、字體已全域載入（Noto Sans TC / Space Grotesk / JetBrains Mono），標題大、字要大：內文 ≥15px、主要標籤 16–18px、引導語 17px+，教學場景會投影。
4b. **禁用 emoji** — UI 文字（按鈕、標籤、狀態、標題）一律不用 emoji。需要圖示時用內嵌 SVG 自己畫：幾何極簡、`stroke="currentColor"`、`fill="none"`、`stroke-width="1.6"`、圓端點（linecap/linejoin round）、16–24px。可直接用全域 `.icon` class（1.1em、對齊基線）。裝飾性 emoji 直接刪除，不必每個都補圖示。
5. **無網路** — 一切互動都是本地模擬，不呼叫任何 API。LLM 行為用預先寫好的資料/規則模擬即可（例如假的機率表、假的回覆）。
6. **響應式** — 1024×640 以上要完整可用；內容過高時允許 stage 滾動。
7. **效能** — 動畫用 rAF；離開（cleanup）後不得有殘留 timer；單模組 ≤ 500 行。

## 版面建議（教學優先）

```
┌────────────────────────────────────────┐
│  引導語（一句話告訴使用者要做什麼）      │
│  ┌──────────────────────────────┐      │
│  │        主互動區（大）          │      │
│  └──────────────────────────────┘      │
│  控制列（.demo-btn 們） · 觀察提示/數據  │
└────────────────────────────────────────┘
```

- 一進來 3 秒內就要能看懂「按什麼、看什麼」。
- 互動的因果要即時可見（按下去馬上有視覺回饋）。
- 最好有一個「啊哈時刻」：一個開關/按鈕讓概念的對比瞬間顯現。

## DemoStage 導演框架（改版 demo 一律使用）

`src/demos/_stage.js` 提供 beat 節奏 + spotlight + 大旁白 + juice 工具。設計法則：**一次只教一件事、同時會動的東西 ≤ 1、每次點擊有 juice、先導遊後放生**。

```js
import { createStage, pop, shake, enterFly, countUp, confettiBurst } from './_stage.js'

export default function mount(el, ctx) {
  const stage = createStage(el, ctx, {
    beats: [
      { narration: '大旁白，一次一句，可用 <b>重點</b>。', focus: ['.xx-truck'],
        enter(s) { /* 對 s.body 裡的場景做動畫、掛互動 */ }, exit(s) {} },
      // ... 3-6 拍
      { narration: '換你玩 — 全部解鎖。', sandbox: true, enter(s) { /* 開放所有控制 */ } },
    ],
  })
  // 場景 DOM 一次蓋好放 stage.body（會被 dim 的視覺單元加 class="ds-unit"）
  stage.body.innerHTML = `...`
  return stage.destroy
}
```

規範：
- 場景一次蓋好放 `stage.body`，beat 之間**用動畫轉場，不重繪**（狀態轉換要「值得看」：飛走、點亮、滾動）
- 每拍主角用 `focus: [selector|el]` 指定，其餘 `.ds-unit` 自動變暗模糊 — 這就是視線引導
- 互動回饋必用 juice：按下 `pop()`、錯誤 `shake()`、數字 `countUp()`、成功 `confettiBurst(stage.body, x, y)`
- 說明文字全部進 beat 的 narration（底部大旁白條），**不要**再放頂部大段引導文
- 最後一拍必為 `sandbox: true`：解除 dim、隱藏下一步、開放所有控制自由玩
- 底部旁白條高約 84px；場景內容過高時 body 可捲動
- ←/→ 鍵已由框架接管換拍；demo 內不要再掛全域方向鍵

## 內容來源

每個概念的教學內容在 `../concepts/NN-<id>.md`，其中「## 互動示範構想」一節就是該 demo 的設計稿 — 以它為藍本實作，可為了清楚與可行而簡化，但核心對比不能丟。
