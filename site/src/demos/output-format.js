// Demo：目的地決定格式 — 請你輸出 HTML 讓我看 — DemoStage 導演版
// 6 拍：天書 markdown｜reader 渲染｜輸出 HTML｜原則登場（目的地決定格式）｜TSV/.ics 兩神技｜sandbox 目的地選擇器。
import { createStage, pop, enterFly, confettiBurst } from './_stage.js'

const GREEN = '#4ade80', GOLD = '#fbbf24'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'

  // 前段（B1–B3）沿用的「一坨 markdown 報表」
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
| 22 | 日期 | 格式不符 |`

  // 後段（B4–B6）共用的固定範例：診所下週排班
  const SCHED = [
    { d: '7/28 一', s: '上午', doc: '林怡君', room: 'A 診', iso: '2026-07-28', sh: 'AM' },
    { d: '7/28 一', s: '下午', doc: '陳柏宏', room: 'B 診', iso: '2026-07-28', sh: 'PM' },
    { d: '7/29 二', s: '上午', doc: '王思婷', room: 'A 診', iso: '2026-07-29', sh: 'AM' },
    { d: '7/30 三', s: '晚間', doc: '李昱德', room: 'C 診', iso: '2026-07-30', sh: 'EVE' },
  ]

  // 手繪 SVG icon（幾何極簡）
  const IC = {
    excel: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M4 14h16M10 4v16"/>',
    line: '<path d="M4 5h16v10H9l-4 4v-4H4z"/>',
    doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
    print: '<path d="M7 8V4h10v4"/><rect x="4" y="8" width="16" height="8" rx="1"/><path d="M7 14h10v6H7z"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 9h16M9 3v4M15 3v4"/>',
    sys: '<path d="M9 5H5v14h4M15 5h4v14h-4M8 12h8"/>',
    srt: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 14h4M14 14h3"/>',
    slide: '<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M12 16v4M8 20h8"/>',
  }
  const svg = p => `<svg class="of-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`

  // 8 個目的地：格式、prompt 關鍵句、預覽渲染
  const DESTS = [
    { k: 'excel', label: 'Excel', fmt: 'TSV', prompt: '把這份排班用 Tab 分隔（TSV）輸出，我要直接貼進 Excel', kind: 'excel' },
    { k: 'line', label: 'LINE', fmt: '純文字', prompt: '用純文字條列、不要任何 markdown 符號，我要貼到 LINE 群組', kind: 'mono' },
    { k: 'doc', label: '文件', fmt: 'Markdown', prompt: '輸出 Markdown 表格，我要貼進 Notion / Google Doc', kind: 'mono' },
    { k: 'print', label: '列印', fmt: 'HTML', prompt: '請你輸出 HTML 格式讓我看，我要用瀏覽器列印成 PDF', kind: 'html' },
    { k: 'cal', label: '日曆', fmt: '.ics', prompt: '把這份排班輸出成 .ics 行事曆檔，我要匯入 Google 日曆', kind: 'cal' },
    { k: 'sys', label: '系統', fmt: 'JSON', prompt: '輸出 JSON，欄位用 date / shift / doctor / room，我要餵給系統', kind: 'mono' },
    { k: 'srt', label: '字幕', fmt: 'SRT', prompt: '把這段旁白輸出成 SRT 字幕檔，帶時間碼，我要給影片上字幕', kind: 'mono' },
    { k: 'slide', label: '簡報', fmt: '簡報大綱', prompt: '輸出簡報大綱，每頁一個標題加 3 個 bullet，我要貼進 Gamma', kind: 'mono' },
  ]

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
  const TAB = '<span class="of-tabmk">→</span>'
  const monoBody = {
    line: `【下週門診排班】\n` + SCHED.map(r => `${r.d}（${r.s}） ${r.doc} ${r.room}`).join('\n'),
    doc: `| 日期 | 診次 | 醫師 | 診間 |\n| --- | --- | --- | --- |\n` +
      SCHED.map(r => `| ${r.d} | ${r.s} | ${r.doc} | ${r.room} |`).join('\n'),
    sys: '[\n' + SCHED.map(r => `  { "date": "${r.iso}", "shift": "${r.sh}", "doctor": "${r.doc}", "room": "${r.room[0]}" }`).join(',\n') + '\n]',
    srt: `1\n00:00:00,000 --> 00:00:03,200\n歡迎來到佑立診所門診說明\n\n2\n00:00:03,200 --> 00:00:07,600\n本週由四位主治醫師輪值\n\n3\n00:00:07,600 --> 00:00:11,000\n上午診集中在週一與週二`,
    slide: `# 下週門診排班\n\n## 第 1 頁：排班總覽\n- 涵蓋 7/28 – 7/30 共 3 天\n- 四位主治醫師輪值\n- A / B / C 三間診間\n\n## 第 2 頁：人力配置\n- 上午診：林怡君、王思婷\n- 下午 / 晚間：陳柏宏、李昱德`,
  }

  const style = document.createElement('style')
  style.textContent = `
  .of-tabs{display:flex;gap:8px;flex-wrap:wrap}
  .of-tab{padding:9px 16px;border-radius:10px 10px 0 0;border:1px solid rgba(255,255,255,.12);border-bottom:none;background:rgba(255,255,255,.03);cursor:pointer;font-size:16px;color:#aeb4c2;transition:all .18s;display:flex;align-items:center;gap:8px;font-family:inherit}
  .of-tab .n{font-size:14px;width:20px;height:20px;border-radius:50%;border:1px solid currentColor;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
  .of-tab:hover{color:#e8ebf2}
  .of-tab.on{color:#eef1f7;background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.22)}
  .of-tab.on.best{color:${GREEN};border-color:rgba(74,222,128,.5);background:rgba(74,222,128,.1)}
  .of-hide{display:none!important}
  .of-panel{border:1px solid rgba(255,255,255,.14);border-radius:0 12px 12px 12px;background:rgba(255,255,255,.02);padding:16px 20px;min-height:262px;max-height:330px;overflow:auto}
  .of-panel.pill{border-radius:12px}
  .of-note{font-size:15.5px;color:#828a9c;margin-bottom:11px;line-height:1.5}
  .of-raw{font-family:'JetBrains Mono',monospace;font-size:15px;line-height:1.7;color:#9aa0b0;white-space:pre-wrap;word-break:break-word}
  .of-raw .h{color:#e8ebf2}.of-raw .b{color:#c3c8d4}.of-raw .p{color:#6b7180}
  .of-rd h1{font-size:23px;color:#eef1f7;margin:0 0 8px}
  .of-rd h2{font-size:17px;color:#dfe3ec;margin:14px 0 6px}
  .of-rd ul{margin:6px 0;padding-left:22px}.of-rd li{font-size:16px;color:#c3c8d4;line-height:1.7}
  .of-rd strong{color:#eef1f7}
  .of-rd table,.of-htab{border-collapse:collapse;margin:8px 0;font-size:15px}
  .of-rd th,.of-rd td{border:1px solid rgba(255,255,255,.16);padding:6px 12px;color:#c3c8d4;text-align:left}
  .of-rd th{color:#e8ebf2;background:rgba(255,255,255,.04)}
  .of-html{border-radius:10px;overflow:hidden;border:1px solid rgba(74,222,128,.25)}
  .of-html .hd{background:linear-gradient(135deg,rgba(74,222,128,.18),rgba(91,140,255,.14));padding:14px 18px}
  .of-html .hd h1{font-size:20px;color:#eef1f7;margin:0}
  .of-html .hd .sub{font-size:15px;color:#9aa0b0;margin-top:3px}
  .of-html table{width:100%;border-collapse:collapse;font-size:15px}
  .of-html thead th{background:rgba(255,255,255,.05);color:#e8ebf2;padding:9px 18px;text-align:left;font-size:15.5px}
  .of-html tbody td{padding:9px 18px;color:#c3c8d4;border-top:1px solid rgba(255,255,255,.08)}
  .of-mono{font-family:'JetBrains Mono',monospace;font-size:15px;line-height:1.8;color:#c3c8d4;white-space:pre-wrap;word-break:break-word}
  .of-mono .k{color:${accent}}.of-mono .n{color:${GOLD}}
  .of-tabmk{color:${GREEN};opacity:.6;padding:0 5px;font-weight:700}
  .of-fmtbar{display:flex;align-items:center;gap:10px;margin-bottom:11px}
  .of-fmtbadge{font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:.05em;color:#08090a;background:${GREEN};border-radius:6px;padding:3px 10px;font-weight:700}
  .of-fmtname{font-size:15px;color:#aeb4c2}
  /* Excel 自動分欄 */
  .of-xl{border:1px solid rgba(74,222,128,.3);border-radius:10px;overflow:hidden}
  .of-xltab{font-size:14px;color:${GREEN};background:rgba(74,222,128,.1);padding:7px 14px;font-family:'JetBrains Mono',monospace}
  .of-grid{border-collapse:collapse;width:100%;font-size:14.5px}
  .of-grid td{border:1px solid rgba(255,255,255,.12);padding:7px 12px;color:#c3c8d4}
  .of-grid .col,.of-grid .rn{background:rgba(255,255,255,.05);color:#7c8398;text-align:center;font-family:'JetBrains Mono',monospace;font-size:13px;padding:5px}
  .of-grid tr.hdr td{color:#e8ebf2}
  /* 日曆 */
  .of-cal{border:1px solid rgba(91,140,255,.3);border-radius:10px;overflow:hidden}
  .of-caltab{font-size:14px;color:${accent};background:rgba(91,140,255,.12);padding:7px 14px;font-family:'JetBrains Mono',monospace}
  .of-week{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:12px}
  .of-day{border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:8px;min-height:96px}
  .of-day .dn{font-size:14px;color:#e8ebf2;margin-bottom:7px;font-weight:600}
  .of-ev{font-size:13px;color:#08090a;background:${accent};border-radius:5px;padding:4px 7px;margin-bottom:5px;line-height:1.35}
  /* 目的地列 */
  .of-principle{text-align:center;font-size:19px;font-weight:700;color:#eef1f7;letter-spacing:.01em}
  .of-principle b{color:var(--accent)}
  .of-dests{display:flex;gap:9px;flex-wrap:wrap;justify-content:center}
  .of-dest{display:flex;flex-direction:column;align-items:center;gap:5px;width:88px;padding:11px 4px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);color:#aeb4c2;cursor:pointer;transition:all .2s;font-family:inherit}
  .of-dest:hover{color:#eef1f7;border-color:rgba(255,255,255,.3);transform:translateY(-2px)}
  .of-dest.on{color:#eef1f7;border-color:var(--accent);background:rgba(91,140,255,.12)}
  .of-dest .lb{font-size:15px}
  .of-dest .fm{font-size:12px;font-family:'JetBrains Mono',monospace;color:#7c8398}
  .of-dest.on .fm{color:var(--accent)}
  .of-ic{width:24px;height:24px}
  .of-key{display:flex;align-items:center;gap:10px;font-size:16px;color:${GREEN};font-weight:600;min-height:24px;opacity:0;transform:translateX(-8px);transition:all .4s}
  .of-key.show{opacity:1;transform:none}
  .of-key .icon{width:1.1em;height:1.1em;flex:none;vertical-align:-.15em}
  .of-key .lead{color:#7c8398;font-weight:400;font-family:'JetBrains Mono',monospace;font-size:14px}
  .of-src{display:flex;align-items:center;gap:14px;flex-wrap:wrap;border:1px dashed rgba(255,255,255,.18);border-radius:12px;padding:10px 16px}
  .of-src .cap{font-size:14px;color:#7c8398;font-family:'JetBrains Mono',monospace;flex:none}
  .of-srctab{border-collapse:collapse;font-size:14px}
  .of-srctab td{padding:3px 12px;color:#aeb4c2;border-right:1px solid rgba(255,255,255,.1)}
  .of-srctab td:last-child{border-right:none}
  .of-cta{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
  .of-advice{font-family:var(--font-tc);font-size:16px;font-weight:600;color:#08090a;background:var(--accent);border:none;border-radius:999px;padding:11px 22px;cursor:pointer;transition:transform .2s}
  .of-advice:hover{transform:translateY(-1px)}
  .of-magic{display:flex;align-items:center;gap:10px;font-size:17px;color:${GREEN};font-weight:600;opacity:0;transform:translateX(-8px);transition:all .4s}
  .of-magic.show{opacity:1;transform:none}
  .of-magic .icon{width:1.1em;height:1.1em}
  `
  el.appendChild(style)

  const rawColored = RAW.split('\n').map(line => {
    if (line.startsWith('#')) return `<span class="h">${esc(line)}</span>`
    if (line.startsWith('- ') || line.startsWith('| ')) return `<span class="b">${esc(line)}</span>`
    return `<span class="p">${esc(line)}</span>`
  }).join('\n')

  // ---- DOM 一次蓋好 ----
  const tabs = document.createElement('div')
  tabs.className = 'of-tabs ds-unit'
  tabs.innerHTML = `
    <button class="of-tab on" data-k="raw"><span class="n">1</span>原始 markdown</button>
    <button class="of-tab" data-k="reader"><span class="n">2</span>markdown + Reader</button>
    <button class="of-tab best" data-k="html"><span class="n">3</span>HTML 報表</button>`

  const cta = document.createElement('div')
  cta.className = 'of-cta ds-unit'
  cta.innerHTML = `
    <button class="of-advice of-hide" id="of-advice">對非工程師的建議</button>
    <span class="of-magic" id="of-magic">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      直接跟它說：「請你輸出 HTML 格式讓我看。」</span>`

  const src = document.createElement('div')
  src.className = 'of-src ds-unit of-hide'
  src.innerHTML = `<span class="cap">同一份資料<br>下週排班</span><table class="of-srctab">` +
    SCHED.map(r => `<tr><td>${r.d}</td><td>${r.s}</td><td>${r.doc}</td><td>${r.room}</td></tr>`).join('') +
    `</table>`

  const principle = document.createElement('div')
  principle.className = 'of-principle ds-unit of-hide'
  principle.innerHTML = `原則：<b>目的地決定格式</b> — 東西要去哪裡，就決定它長什麼樣`

  const panel = document.createElement('div')
  panel.className = 'of-panel ds-unit'

  const dests = document.createElement('div')
  dests.className = 'of-dests ds-unit of-hide'
  dests.innerHTML = DESTS.map(d =>
    `<button class="of-dest" data-k="${d.k}">${svg(IC[d.k])}<span class="lb">${d.label}</span><span class="fm">${d.fmt}</span></button>`).join('')

  const keyLine = document.createElement('div')
  keyLine.className = 'of-key ds-unit of-hide'

  const magicEl = cta.querySelector('#of-magic')
  const adviceBtn = cta.querySelector('#of-advice')

  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  let current = 'raw', interactive = false, stage

  // ---- B1–B3 比較面板 ----
  function renderCompare(k) {
    panel.classList.add('pill')
    if (k === 'raw') {
      panel.innerHTML = `<div class="of-note">模型原始輸出，等寬字。給人看像天書：# 是標題、- 是項目、| 是表格線。</div><div class="of-raw">${rawColored}</div>`
    } else if (k === 'reader') {
      panel.innerHTML = `<div class="of-note">同一段 markdown 丟進會渲染的閱讀器（Reader），符號被翻譯成排版。</div><div class="of-rd">
        <h1>資料驗證報表</h1><h2>概要</h2>
        <ul><li>總列數：<strong>29</strong></li><li>通過：27</li><li>需修正：2</li></ul>
        <h2>需修正項目</h2>
        <table><thead><tr><th>列</th><th>欄位</th><th>問題</th></tr></thead>
        <tbody><tr><td>14</td><td>金額</td><td>出現負數</td></tr><tr><td>22</td><td>日期</td><td>格式不符</td></tr></tbody></table></div>`
    } else {
      panel.innerHTML = `<div class="of-note">請它「輸出 HTML 格式」：帶表格、色彩，打開就懂 — 瀏覽器就是 reader，一按列印就是 PDF。</div><div class="of-html">
        <div class="hd"><h1>資料驗證報表</h1><div class="sub">sales_2026Q2.csv · 27 / 29 通過</div></div>
        <table><thead><tr><th>列</th><th>欄位</th><th>問題</th></tr></thead>
        <tbody><tr><td>14</td><td>金額</td><td>出現負數</td></tr><tr><td>22</td><td>日期</td><td>格式不符</td></tr></tbody></table></div>`
    }
    enterFly(panel.lastElementChild, { y: 14, dur: 420 })
  }
  function selectTab(k, flash) {
    current = k
    tabs.querySelectorAll('.of-tab').forEach(b => b.classList.toggle('on', b.dataset.k === k))
    renderCompare(k)
  }

  // ---- B4–B6 目的地輸出 ----
  function fmtBar(d) {
    return `<div class="of-fmtbar"><span class="of-fmtbadge">${d.fmt}</span><span class="of-fmtname">給「${d.label}」的格式</span></div>`
  }
  function colorMono(k, text) {
    let t = esc(text)
    if (k === 'sys') t = t.replace(/&quot;(date|shift|doctor|room)&quot;/g, '<span class="k">"$1"</span>')
    if (k === 'srt') t = t.replace(/(\d\d:\d\d:\d\d,\d\d\d)/g, '<span class="n">$1</span>')
    if (k === 'doc') t = t.replace(/\|/g, '<span class="k">|</span>')
    return t
  }
  function renderDest(k, animate) {
    const d = DESTS.find(x => x.k === k)
    panel.classList.remove('pill')
    if (d.kind === 'excel') return playExcel()
    if (d.kind === 'cal') return playCal()
    if (d.kind === 'html') {
      panel.innerHTML = fmtBar(d) + `<div class="of-html">
        <div class="hd"><h1>下週門診排班</h1><div class="sub">7/28 – 7/30 · 四位醫師輪值</div></div>
        <table><thead><tr><th>日期</th><th>診次</th><th>醫師</th><th>診間</th></tr></thead><tbody>` +
        SCHED.map(r => `<tr><td>${r.d}</td><td>${r.s}</td><td>${r.doc}</td><td>${r.room}</td></tr>`).join('') +
        `</tbody></table></div>`
    } else {
      panel.innerHTML = fmtBar(d) + `<div class="of-mono">${colorMono(k, monoBody[k])}</div>`
    }
    enterFly(panel.lastElementChild, { y: 14, dur: 420 })
  }

  function playExcel() {
    panel.innerHTML = `<div class="of-fmtbar"><span class="of-fmtbadge">TSV</span><span class="of-fmtname">Tab 分隔 · 複製後直接貼進 Excel</span></div>
      <div class="of-xl"><div class="of-xltab">貼上瞬間 — 每一欄自動跳進格子</div>
      <table class="of-grid"><tr class="hdr"><td class="col"></td><td class="col">A</td><td class="col">B</td><td class="col">C</td><td class="col">D</td></tr>${
        [['日期', '診次', '醫師', '診間'], ...SCHED.map(r => [r.d, r.s, r.doc, r.room])].map((row, ri) =>
          `<tr${ri === 0 ? ' class="hdr"' : ''}><td class="rn">${ri + 1}</td>` +
          row.map(c => `<td class="xc">${c}</td>`).join('') + `</tr>`).join('')
      }</table></div>`
    const cells = [...panel.querySelectorAll('.xc')]
    cells.forEach((c, i) => { c.style.opacity = '0'; T(() => { c.style.opacity = ''; enterFly(c, { y: 0, dur: 300 }); pop(c, 1.08) }, 120 + i * 70) })
  }
  function playCal() {
    panel.innerHTML = `<div class="of-fmtbar"><span class="of-fmtbadge">.ics</span><span class="of-fmtname">點兩下匯入 — 變成行事曆事件</span></div>
      <div class="of-cal"><div class="of-caltab">Google 日曆 · 匯入 4 個事件</div><div class="of-week">${
        ['7/28 一', '7/29 二', '7/30 三'].map(day =>
          `<div class="of-day"><div class="dn">${day}</div>${
            SCHED.filter(r => r.d === day).map(r => `<div class="of-ev">${r.s} ${r.doc}<br>${r.room}</div>`).join('')
          }</div>`).join('')
      }</div></div>`
    const evs = [...panel.querySelectorAll('.of-ev')]
    evs.forEach((ev, i) => { ev.style.opacity = '0'; T(() => { ev.style.opacity = ''; enterFly(ev, { y: -18, dur: 420 }); pop(ev) }, 200 + i * 260) })
  }

  function selectDest(k) {
    current = k
    dests.querySelectorAll('.of-dest').forEach(b => b.classList.toggle('on', b.dataset.k === k))
    renderDest(k)
    const d = DESTS.find(x => x.k === k)
    keyLine.innerHTML = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg><span><span class="lead">prompt 關鍵句　</span>「${d.prompt}」</span>`
    keyLine.classList.remove('show'); void keyLine.offsetWidth; T(() => keyLine.classList.add('show'), 80)
  }

  // ---- 事件 ----
  tabs.addEventListener('click', e => {
    const btn = e.target.closest('.of-tab'); if (!btn) return
    if (!interactive || btn.dataset.k === current) return
    pop(btn); selectTab(btn.dataset.k, false)
  })
  adviceBtn.addEventListener('click', () => {
    pop(adviceBtn); selectTab('html', true)
    magicEl.classList.remove('show'); void magicEl.offsetWidth; T(() => magicEl.classList.add('show'), 120)
  })
  dests.addEventListener('click', e => {
    const btn = e.target.closest('.of-dest'); if (!btn) return
    if (!interactive || btn.dataset.k === current) return
    pop(btn); selectDest(btn.dataset.k)
  })

  // ---- 模式切換 ----
  function showCompare() {
    tabs.classList.remove('of-hide'); cta.classList.remove('of-hide')
    src.classList.add('of-hide'); principle.classList.add('of-hide')
    dests.classList.add('of-hide'); keyLine.classList.add('of-hide')
    panel.classList.add('pill')
  }
  function showDest({ withSrc = true } = {}) {
    tabs.classList.add('of-hide'); cta.classList.add('of-hide')
    principle.classList.remove('of-hide')
    src.classList.toggle('of-hide', !withSrc)
    dests.classList.remove('of-hide'); keyLine.classList.remove('of-hide')
    panel.classList.remove('pill')
  }

  function resetScene() {
    clearT(); interactive = false; current = 'raw'
    magicEl.classList.remove('show'); adviceBtn.classList.add('of-hide')
    keyLine.classList.remove('show')
    showCompare(); selectTab('raw', false)
  }

  function startSandboxRun() {
    clearT(); interactive = true; current = ''
    showDest({ withSrc: true })
    dests.querySelectorAll('.of-dest').forEach(b => b.classList.remove('on'))
    keyLine.classList.remove('show')
    ;[src, principle].forEach(n => enterFly(n, { y: 14, dur: 460 }))
    dests.querySelectorAll('.of-dest').forEach((b, i) => enterFly(b, { y: 14, dur: 420, delay: i * 55 }))
    T(() => selectDest('excel'), 260)
  }

  function buildBeats() {
    return [
      { narration: '叫 AI 整理報表，它吐給你一堆<b>井字號、星號、表格線</b> — 你看了頭很痛，覺得好醜。', focus: ['.of-panel'], nextLabel: '這是什麼？ →',
        enter() { resetScene() } },

      { narration: '那叫 <b>markdown</b>。它不醜 — 只是還沒被 <b>reader</b> 打開，符號會被翻譯成排版。', focus: ['.of-panel'], nextLabel: '有更好的嗎？ →',
        enter() { resetScene(); T(() => selectTab('reader', false), 450) } },

      { narration: '就像 PDF 沒有 reader 也是天書 — 給人看，一句：<b>請你輸出 HTML 格式讓我看</b>。瀏覽器就是 reader，一按列印就是 PDF。', focus: ['.of-panel', '.of-tabs', '.of-cta'], nextLabel: '但 HTML 是唯一解嗎？ →',
        enter() { resetScene(); T(() => selectTab('html', true), 450); T(() => { adviceBtn.classList.remove('of-hide'); magicEl.classList.add('show') }, 700) } },

      { narration: '不是。更大的原則是 <b>目的地決定格式</b> — 要去 Excel、LINE、文件、日曆、系統、字幕，各有各的格式。', focus: ['.of-principle', '.of-dests', '.of-panel'], nextLabel: '看兩個神技 →',
        enter() { clearT(); interactive = false; showDest({ withSrc: false })
          keyLine.classList.add('of-hide')
          enterFly(principle, { y: 16, dur: 500 })
          dests.querySelectorAll('.of-dest').forEach((b, i) => { b.classList.remove('on'); enterFly(b, { y: 18, dur: 440, delay: 120 + i * 70 }) })
          panel.innerHTML = `<div class="of-note" style="text-align:center;padding-top:96px">先問一句：<b style="color:${accent}">這東西要去哪裡？</b>　目的地選好，格式自然就有答案。</div>` } },

      { narration: '同一份排班，換個目的地就換個格式。<b>TSV</b> 貼 Excel 自動分欄、<b>.ics</b> 匯入日曆變事件 — 兩個真神技。', focus: ['.of-panel', '.of-src'], nextLabel: '換我選目的地 →',
        enter() { clearT(); interactive = false; showDest({ withSrc: true }); keyLine.classList.add('of-hide')
          dests.querySelectorAll('.of-dest').forEach(b => b.classList.remove('on'))
          enterFly(src, { y: 14, dur: 460 })
          T(() => { dests.querySelector('[data-k="excel"]').classList.add('on'); playExcel() }, 400)
          T(() => { const r = panel.getBoundingClientRect(), br = stage.body.getBoundingClientRect(); confettiBurst(stage.body, r.left - br.left + r.width / 2, r.top - br.top + 40, GREEN, 22) }, 900)
          T(() => { dests.querySelectorAll('.of-dest').forEach(b => b.classList.remove('on')); dests.querySelector('[data-k="cal"]').classList.add('on'); playCal() }, 2600) } },

      { narration: '換你當家 — 點任一<b>目的地</b>，右邊立刻出對應格式，下面就是可直接複製的 <b>prompt 關鍵句</b>。', sandbox: true,
        enter() { startSandboxRun() } },
    ]
  }

  stage = createStage(el, ctx, { beats: buildBeats() })
  stage.body.append(tabs, cta, src, principle, panel, dests, keyLine)

  return () => { clearT(); stage.destroy(); style.remove() }
}
