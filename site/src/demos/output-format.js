// Demo：請你輸出 HTML 格式讓我看
// 核心互動：同一份驗證報表三種呈現（原始 markdown／markdown+Reader／HTML 報表）三分頁切換；
// 「對非工程師的建議」大按鈕高亮第三分頁並打出關鍵句；附 markdown 貼進文件軟體變亂碼的小對比。

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
  .of-wrap{position:absolute;inset:0;display:flex;flex-direction:column;gap:15px;padding:24px 30px;box-sizing:border-box;font-family:var(--font-tc,'Noto Sans TC',sans-serif);overflow:auto}
  .of-lead{font-size:17px;color:#9aa0b0;line-height:1.6}
  .of-lead b{color:#e8ebf2;font-weight:600}
  .of-tabs{display:flex;gap:8px;flex-wrap:wrap}
  .of-tab{padding:9px 16px;border-radius:10px 10px 0 0;border:1px solid rgba(255,255,255,.12);border-bottom:none;background:rgba(255,255,255,.03);cursor:pointer;font-size:16px;color:#aeb4c2;transition:all .18s;display:flex;align-items:center;gap:8px}
  .of-tab .n{font-size:12px;width:20px;height:20px;border-radius:50%;border:1px solid currentColor;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
  .of-tab:hover{color:#e8ebf2}
  .of-tab.on{color:#eef1f7;background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.22)}
  .of-tab.on.best{color:${GREEN};border-color:rgba(74,222,128,.5);background:rgba(74,222,128,.1)}
  .of-tab.flash{animation:of-flash 1s ease}
  @keyframes of-flash{0%,100%{box-shadow:none}30%,60%{box-shadow:0 0 0 2px ${GREEN}}}
  .of-panel{border:1px solid rgba(255,255,255,.14);border-radius:0 12px 12px 12px;background:rgba(255,255,255,.02);padding:18px 20px;min-height:250px;flex:1}
  .of-note{font-size:14px;color:#828a9c;margin-bottom:12px;line-height:1.5}
  /* 分頁一：原始 markdown 天書 */
  .of-raw{font-family:'JetBrains Mono',monospace;font-size:15px;line-height:1.7;color:#9aa0b0;white-space:pre-wrap;word-break:break-word}
  .of-raw .h{color:#e8ebf2}
  .of-raw .b{color:#c3c8d4}
  .of-raw .p{color:#6b7180}
  /* 分頁二：Reader 渲染 */
  .of-rd h1{font-size:24px;color:#eef1f7;margin:0 0 10px}
  .of-rd h2{font-size:18px;color:#dfe3ec;margin:16px 0 8px}
  .of-rd ul{margin:6px 0;padding-left:22px}
  .of-rd li{font-size:16px;color:#c3c8d4;line-height:1.7}
  .of-rd strong{color:#eef1f7}
  .of-rd table{border-collapse:collapse;margin:8px 0;font-size:15px}
  .of-rd th,.of-rd td{border:1px solid rgba(255,255,255,.16);padding:6px 12px;color:#c3c8d4;text-align:left}
  .of-rd th{color:#e8ebf2;background:rgba(255,255,255,.04)}
  /* 分頁三：HTML 報表 */
  .of-html{border-radius:10px;overflow:hidden;border:1px solid rgba(74,222,128,.25)}
  .of-html .hd{background:linear-gradient(135deg,rgba(74,222,128,.18),rgba(91,140,255,.14));padding:16px 20px}
  .of-html .hd h1{font-size:22px;color:#eef1f7;margin:0}
  .of-html .hd .sub{font-size:14px;color:#9aa0b0;margin-top:4px}
  .of-html .kpis{display:flex;gap:12px;padding:16px 20px;flex-wrap:wrap}
  .of-html .kpi{flex:1;min-width:100px;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:12px 14px;background:rgba(255,255,255,.02)}
  .of-html .kpi .v{font-size:26px;font-weight:700;font-family:'Space Grotesk',sans-serif}
  .of-html .kpi .l{font-size:13px;color:#828a9c;margin-top:2px}
  .of-html .kpi.tot .v{color:#e8ebf2}.of-html .kpi.pass .v{color:${GREEN}}.of-html .kpi.fix .v{color:#fbbf24}
  .of-html table{width:100%;border-collapse:collapse;font-size:15px}
  .of-html thead th{background:rgba(255,255,255,.05);color:#e8ebf2;padding:9px 20px;text-align:left;font-size:14px}
  .of-html tbody td{padding:9px 20px;color:#c3c8d4;border-top:1px solid rgba(255,255,255,.08)}
  .of-html tbody tr td:first-child{color:#fbbf24;font-variant-numeric:tabular-nums}
  .of-cta{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:2px}
  .of-key{font-size:17px;color:${GREEN};font-weight:600;opacity:0;transform:translateX(-8px);transition:all .4s}
  .of-key.show{opacity:1;transform:none}
  .of-key .icon{vertical-align:-.15em}
  .of-compare{border:1px dashed rgba(255,255,255,.2);border-radius:12px;padding:13px 17px;font-size:15px;line-height:1.6;color:#aeb4c2}
  .of-compare b{color:#e8ebf2}
  .of-compare .garble{font-family:'JetBrains Mono',monospace;color:#6b7180;background:rgba(255,255,255,.04);padding:2px 7px;border-radius:5px;font-size:14px}
  .of-btn-lg{font-size:16px;padding:12px 22px}
  .of-icon{width:1.1em;height:1.1em}
  `
  el.appendChild(style)

  const rawColored = RAW
    .split('\n')
    .map((line) => {
      if (line.startsWith('#')) return `<span class="h">${esc(line)}</span>`
      if (line.startsWith('- ') || line.startsWith('| ')) return `<span class="b">${esc(line)}</span>`
      return `<span class="p">${esc(line)}</span>`
    })
    .join('\n')

  const wrap = document.createElement('div')
  wrap.className = 'of-wrap'
  wrap.innerHTML = `
    <div class="of-lead">同一份驗證報表，<b>三種呈現方式</b>。內容一模一樣，但看起來天差地遠 — 差別只在你請它用什麼「格式」輸出。</div>
    <div class="of-tabs" id="of-tabs">
      <button class="of-tab on" data-k="raw"><span class="n">1</span>原始 markdown</button>
      <button class="of-tab" data-k="reader"><span class="n">2</span>markdown + Reader</button>
      <button class="of-tab best" data-k="html"><span class="n">3</span>HTML 報表</button>
    </div>
    <div class="of-panel" id="of-panel"></div>
    <div class="of-cta">
      <button class="demo-btn primary of-btn-lg" id="of-advice">對非工程師的建議</button>
      <span class="of-key" id="of-key">
        <svg class="icon of-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        直接跟它說：「請你輸出 HTML 格式讓我看。」
      </span>
    </div>
    <div class="of-compare">
      <b>小對比：</b>把原始 markdown 直接貼進文件軟體，那些 <span class="garble"># 標題</span>、<span class="garble">- 項目</span>、<span class="garble">| 表格 |</span> 的符號不會變漂亮，反而整段變成一堆生硬的符號夾雜文字。給非工程師看，HTML 才是「打開就懂」的那一種。
    </div>
  `
  el.appendChild(wrap)

  const panel = wrap.querySelector('#of-panel')
  const keyEl = wrap.querySelector('#of-key')
  const timers = new Set()
  const setT = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }

  function renderPanel(k) {
    if (k === 'raw') {
      panel.innerHTML = `<div class="of-note">模型原始輸出，等寬字。給人看像天書：# 是標題、- 是項目、| 是表格線。</div><div class="of-raw">${rawColored}</div>`
    } else if (k === 'reader') {
      panel.innerHTML = `<div class="of-note">同一段 markdown 丟進會渲染的閱讀器（Reader），符號被翻譯成排版。</div><div class="of-rd">
        <h1>資料驗證報表</h1>
        <h2>概要</h2>
        <ul><li>檔案：sales_2026Q2.csv</li><li>總列數：<strong>29</strong></li><li>通過：27</li><li>需修正：2</li></ul>
        <h2>需修正項目</h2>
        <table><thead><tr><th>列</th><th>欄位</th><th>問題</th></tr></thead>
        <tbody><tr><td>14</td><td>金額</td><td>出現負數</td></tr><tr><td>22</td><td>日期</td><td>格式不符</td></tr></tbody></table>
        <h2>結論</h2><ul><li>整體品質良好，兩筆待處理。</li></ul>
      </div>`
    } else {
      panel.innerHTML = `<div class="of-note">請它「輸出 HTML 格式」：帶表格、色彩、KPI，打開就懂，最適合直接給人看。</div><div class="of-html">
        <div class="hd"><h1>資料驗證報表</h1><div class="sub">sales_2026Q2.csv · 2026 Q2</div></div>
        <div class="kpis">
          <div class="kpi tot"><div class="v">29</div><div class="l">總列數</div></div>
          <div class="kpi pass"><div class="v">27</div><div class="l">通過</div></div>
          <div class="kpi fix"><div class="v">2</div><div class="l">需修正</div></div>
        </div>
        <table><thead><tr><th>列</th><th>欄位</th><th>問題</th></tr></thead>
        <tbody><tr><td>14</td><td>金額</td><td>出現負數</td></tr><tr><td>22</td><td>日期</td><td>格式不符</td></tr></tbody></table>
      </div>`
    }
  }

  let current = 'raw'
  function select(k, flash) {
    current = k
    wrap.querySelectorAll('.of-tab').forEach((b) => b.classList.toggle('on', b.dataset.k === k))
    if (flash) {
      const t = wrap.querySelector('.of-tab[data-k="html"]')
      t.classList.remove('flash'); void t.offsetWidth; t.classList.add('flash')
    }
    renderPanel(k)
  }

  wrap.querySelector('#of-tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.of-tab')
    if (btn) select(btn.dataset.k, false)
  })
  wrap.querySelector('#of-advice').addEventListener('click', () => {
    select('html', true)
    keyEl.classList.remove('show'); void keyEl.offsetWidth
    setT(() => keyEl.classList.add('show'), 120)
  })

  select('raw', false)

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

  return () => {
    timers.forEach((id) => clearTimeout(id)); timers.clear()
    style.remove(); wrap.remove()
  }
}
