// Demo：請你輸出 HTML 格式讓我看 — DemoStage 導演版
// 5 拍：天書 markdown｜reader 渲染｜HTML 一句解決｜瀏覽器就是 reader｜sandbox 三種呈現自由切。
import { createStage, pop, enterFly } from './_stage.js'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const GREEN = '#4ade80'

  const RAW = `# 資料驗證報表

## 概要
- 檔案：sales_2026Q2.csv
- 總列數：**29**
- 通過：27
- 需修正：2

## 需修正項目
| 列 | 欄位 | 問題 |
| -- | ---- | ---- |
| 14 | 金額 | 出現負數 |
| 22 | 日期 | 格式不符 |

## 結論
- 整體品質良好，兩筆待處理。`

  const style = document.createElement('style')
  style.textContent = `
  .of-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:0}
  .of-tab{padding:9px 16px;border-radius:10px 10px 0 0;border:1px solid rgba(255,255,255,.12);border-bottom:none;background:rgba(255,255,255,.03);cursor:pointer;font-size:16px;color:#aeb4c2;transition:all .18s;display:flex;align-items:center;gap:8px;font-family:inherit}
  .of-tab .n{font-size:14px;width:20px;height:20px;border-radius:50%;border:1px solid currentColor;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
  .of-tab:hover{color:#e8ebf2}
  .of-tab.on{color:#eef1f7;background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.22)}
  .of-tab.on.best{color:${GREEN};border-color:rgba(74,222,128,.5);background:rgba(74,222,128,.1)}
  .of-tab.flash{animation:of-flash 1s ease}
  @keyframes of-flash{0%,100%{box-shadow:none}30%,60%{box-shadow:0 0 0 2px ${GREEN}}}
  .of-panel{border:1px solid rgba(255,255,255,.14);border-radius:0 12px 12px 12px;background:rgba(255,255,255,.02);padding:18px 20px;min-height:250px;margin-bottom:16px}
  .of-note{font-size:15.5px;color:#828a9c;margin-bottom:12px;line-height:1.5}
  .of-raw{font-family:'JetBrains Mono',monospace;font-size:15px;line-height:1.7;color:#9aa0b0;white-space:pre-wrap;word-break:break-word}
  .of-raw .h{color:#e8ebf2}.of-raw .b{color:#c3c8d4}.of-raw .p{color:#6b7180}
  .of-rd h1{font-size:24px;color:#eef1f7;margin:0 0 10px}
  .of-rd h2{font-size:18px;color:#dfe3ec;margin:16px 0 8px}
  .of-rd ul{margin:6px 0;padding-left:22px}
  .of-rd li{font-size:16px;color:#c3c8d4;line-height:1.7}
  .of-rd strong{color:#eef1f7}
  .of-rd table{border-collapse:collapse;margin:8px 0;font-size:15px}
  .of-rd th,.of-rd td{border:1px solid rgba(255,255,255,.16);padding:6px 12px;color:#c3c8d4;text-align:left}
  .of-rd th{color:#e8ebf2;background:rgba(255,255,255,.04)}
  .of-html{border-radius:10px;overflow:hidden;border:1px solid rgba(74,222,128,.25)}
  .of-html .hd{background:linear-gradient(135deg,rgba(74,222,128,.18),rgba(91,140,255,.14));padding:16px 20px}
  .of-html .hd h1{font-size:22px;color:#eef1f7;margin:0}
  .of-html .hd .sub{font-size:15.5px;color:#9aa0b0;margin-top:4px}
  .of-html .kpis{display:flex;gap:12px;padding:16px 20px;flex-wrap:wrap}
  .of-html .kpi{flex:1;min-width:100px;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:12px 14px;background:rgba(255,255,255,.02)}
  .of-html .kpi .v{font-size:26px;font-weight:700;font-family:'Space Grotesk',sans-serif}
  .of-html .kpi .l{font-size:15px;color:#828a9c;margin-top:2px}
  .of-html .kpi.tot .v{color:#e8ebf2}.of-html .kpi.pass .v{color:${GREEN}}.of-html .kpi.fix .v{color:#fbbf24}
  .of-html table{width:100%;border-collapse:collapse;font-size:15px}
  .of-html thead th{background:rgba(255,255,255,.05);color:#e8ebf2;padding:9px 20px;text-align:left;font-size:15.5px}
  .of-html tbody td{padding:9px 20px;color:#c3c8d4;border-top:1px solid rgba(255,255,255,.08)}
  .of-html tbody tr td:first-child{color:#fbbf24;font-variant-numeric:tabular-nums}
  .of-cta{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:16px}
  .of-advice{font-family:var(--font-tc);font-size:16px;font-weight:600;color:#08090a;background:var(--accent);border:none;border-radius:999px;padding:12px 22px;cursor:pointer;transition:transform .2s}
  .of-advice:hover{transform:translateY(-1px)}
  .of-advice.hide{display:none}
  .of-key{font-size:17px;color:${GREEN};font-weight:600;opacity:0;transform:translateX(-8px);transition:all .4s}
  .of-key.show{opacity:1;transform:none}
  .of-key .icon{vertical-align:-.15em;width:1.1em;height:1.1em}
  .of-compare{border:1px dashed rgba(255,255,255,.2);border-radius:12px;padding:13px 17px;font-size:15px;line-height:1.6;color:#aeb4c2}
  .of-compare b{color:#e8ebf2}
  .of-compare .garble{font-family:'JetBrains Mono',monospace;color:#6b7180;background:rgba(255,255,255,.04);padding:2px 7px;border-radius:5px;font-size:15.5px}
  `
  el.appendChild(style)

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
  const rawColored = RAW.split('\n').map(line => {
    if (line.startsWith('#')) return `<span class="h">${esc(line)}</span>`
    if (line.startsWith('- ') || line.startsWith('| ')) return `<span class="b">${esc(line)}</span>`
    return `<span class="p">${esc(line)}</span>`
  }).join('\n')

  const tabs = document.createElement('div')
  tabs.className = 'of-tabs ds-unit'
  tabs.innerHTML = `
    <button class="of-tab on" data-k="raw"><span class="n">1</span>原始 markdown</button>
    <button class="of-tab" data-k="reader"><span class="n">2</span>markdown + Reader</button>
    <button class="of-tab best" data-k="html"><span class="n">3</span>HTML 報表</button>`

  const panel = document.createElement('div')
  panel.className = 'of-panel ds-unit'

  const cta = document.createElement('div')
  cta.className = 'of-cta ds-unit'
  cta.innerHTML = `
    <button class="of-advice hide" id="of-advice">對非工程師的建議</button>
    <span class="of-key" id="of-key">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      直接跟它說：「請你輸出 HTML 格式讓我看。」
    </span>`

  const compare = document.createElement('div')
  compare.className = 'of-compare ds-unit'
  compare.innerHTML = `<b>小對比：</b>把原始 markdown 直接貼進文件軟體，那些 <span class="garble"># 標題</span>、<span class="garble">- 項目</span>、<span class="garble">| 表格 |</span> 的符號不會變漂亮，反而整段變成一堆生硬符號。給非工程師看，HTML 才是「打開就懂」的那一種。`

  const panelEl = panel
  const keyEl = cta.querySelector('#of-key')
  const adviceBtn = cta.querySelector('#of-advice')

  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  let current = 'raw', interactive = false, stage

  function renderPanel(k) {
    if (k === 'raw') {
      panelEl.innerHTML = `<div class="of-note">模型原始輸出，等寬字。給人看像天書：# 是標題、- 是項目、| 是表格線。</div><div class="of-raw">${rawColored}</div>`
    } else if (k === 'reader') {
      panelEl.innerHTML = `<div class="of-note">同一段 markdown 丟進會渲染的閱讀器（Reader），符號被翻譯成排版。</div><div class="of-rd">
        <h1>資料驗證報表</h1><h2>概要</h2>
        <ul><li>檔案：sales_2026Q2.csv</li><li>總列數：<strong>29</strong></li><li>通過：27</li><li>需修正：2</li></ul>
        <h2>需修正項目</h2>
        <table><thead><tr><th>列</th><th>欄位</th><th>問題</th></tr></thead>
        <tbody><tr><td>14</td><td>金額</td><td>出現負數</td></tr><tr><td>22</td><td>日期</td><td>格式不符</td></tr></tbody></table>
        <h2>結論</h2><ul><li>整體品質良好，兩筆待處理。</li></ul></div>`
    } else {
      panelEl.innerHTML = `<div class="of-note">請它「輸出 HTML 格式」：帶表格、色彩、KPI，打開就懂，最適合直接給人看。</div><div class="of-html">
        <div class="hd"><h1>資料驗證報表</h1><div class="sub">sales_2026Q2.csv · 2026 Q2</div></div>
        <div class="kpis">
          <div class="kpi tot"><div class="v">29</div><div class="l">總列數</div></div>
          <div class="kpi pass"><div class="v">27</div><div class="l">通過</div></div>
          <div class="kpi fix"><div class="v">2</div><div class="l">需修正</div></div>
        </div>
        <table><thead><tr><th>列</th><th>欄位</th><th>問題</th></tr></thead>
        <tbody><tr><td>14</td><td>金額</td><td>出現負數</td></tr><tr><td>22</td><td>日期</td><td>格式不符</td></tr></tbody></table></div>`
    }
    enterFly(panelEl.lastElementChild, { y: 14, dur: 420 })
  }
  function select(k, flash) {
    current = k
    tabs.querySelectorAll('.of-tab').forEach(b => b.classList.toggle('on', b.dataset.k === k))
    if (flash) { const t = tabs.querySelector('.of-tab[data-k="html"]'); t.classList.remove('flash'); void t.offsetWidth; t.classList.add('flash') }
    renderPanel(k)
  }

  tabs.addEventListener('click', e => {
    const btn = e.target.closest('.of-tab'); if (!btn) return
    if (!interactive || btn.dataset.k === current) return
    pop(btn); select(btn.dataset.k, false)
  })
  adviceBtn.addEventListener('click', () => {
    pop(adviceBtn); select('html', true)
    keyEl.classList.remove('show'); void keyEl.offsetWidth; T(() => keyEl.classList.add('show'), 120)
  })

  function resetScene() {
    clearT(); interactive = false
    keyEl.classList.remove('show'); adviceBtn.classList.add('hide')
    select('raw', false)
  }
  function startSandboxRun() {
    resetScene(); interactive = true
    adviceBtn.classList.remove('hide')
    tabs.querySelectorAll('.of-tab').forEach((b, i) => enterFly(b, { y: 12, dur: 400, delay: i * 90 }))
  }

  function buildBeats() {
    return [
      { narration: '叫 AI 整理報表，它吐給你一堆<b>井字號、星號、表格線</b> — 你看了頭很痛，覺得好醜。', focus: ['.of-panel'], nextLabel: '這是什麼？ →',
        enter() { resetScene() } },

      { narration: '那叫 <b>markdown</b>。它不醜 — 它只是還沒被 <b>reader</b> 打開，符號會被翻譯成排版。', focus: ['.of-panel'], nextLabel: '有更好的嗎？ →',
        enter() { resetScene(); T(() => select('reader', false), 450) } },

      { narration: '就像 PDF 沒有 PDF reader 也是天書 — 給非工程師，最好一句：<b>請你輸出 HTML 格式讓我看</b>。', focus: ['.of-panel', '.of-tabs'], nextLabel: '為什麼是 HTML？ →',
        enter() { resetScene(); T(() => select('html', true), 450) } },

      { narration: '因為<b>瀏覽器天生就是最好的 reader</b> — HTML 一開就是漂亮報表，不用裝任何東西。', focus: ['.of-panel', '.of-compare'], nextLabel: '換我切切看 →',
        enter() { resetScene(); T(() => select('html', false), 300) } },

      { narration: '換你切三種呈現 — <b>內容一模一樣</b>，差的只是有沒有被 reader 打開。按「對非工程師的建議」看那句魔法。', sandbox: true,
        enter() { startSandboxRun() } },
    ]
  }

  stage = createStage(el, ctx, { beats: buildBeats() })
  stage.body.append(tabs, panel, cta, compare)

  return () => { clearT(); stage.destroy(); style.remove() }
}
