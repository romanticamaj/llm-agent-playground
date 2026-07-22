// Demo：Context Window 是 AI 的全部世界
// 核心互動：一張有容量上限的「桌子」，放入 system/tools/memory/history 色磚，
// 「繼續聊天」讓灰磚增生逼近滿載 → 觸發 compaction（灰磚壓成一小塊摘要、細節亮點掉出消失）；
// 另附 lost-in-the-middle 小實驗：開頭/中間/結尾關鍵字的注意力熱度圖。

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const CAP = 100 // 桌面容量（%）
  const COLORS = { system: accent, tools: '#4ade80', memory: '#fbbf24', history: '#8b91a2', summary: '#a78bfa' }

  const style = document.createElement('style')
  style.textContent = `
  .cw-wrap{position:absolute;inset:0;display:flex;flex-direction:column;gap:16px;padding:22px 30px;box-sizing:border-box;font-family:var(--font-tc,'Noto Sans TC',sans-serif);overflow:auto}
  .cw-lead{font-size:17px;color:#9aa0b0;line-height:1.55}
  .cw-lead b{color:#e8ebf2;font-weight:600}
  .cw-deskwrap{position:relative}
  .cw-meta{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px}
  .cw-meta .lbl{font-size:14px;letter-spacing:.1em;color:#7d8496;text-transform:uppercase}
  .cw-meta .pct{font-size:24px;font-weight:700;font-variant-numeric:tabular-nums;color:#e8ebf2}
  .cw-meta .pct.warn{color:#f87171;animation:cw-flash .6s ease-in-out infinite}
  @keyframes cw-flash{50%{opacity:.35}}
  .cw-desk{position:relative;height:66px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);display:flex;padding:6px;gap:4px;overflow:hidden}
  .cw-desk.full{border-color:rgba(248,113,113,.5);box-shadow:0 0 0 1px rgba(248,113,113,.3) inset}
  .cw-brick{border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:600;color:#05060a;white-space:nowrap;overflow:hidden;transition:width .5s cubic-bezier(.2,.7,.2,1),opacity .4s;min-width:0}
  .cw-empty{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:13px;color:#5a6070;pointer-events:none}
  .cw-spark{position:absolute;width:6px;height:6px;border-radius:50%;background:#fff;box-shadow:0 0 8px #fff;pointer-events:none;z-index:6}
  .cw-legend{display:flex;gap:16px;flex-wrap:wrap;font-size:14px;color:#8b91a2}
  .cw-legend span{display:flex;align-items:center;gap:6px}
  .cw-legend i{width:11px;height:11px;border-radius:3px;display:inline-block}
  .cw-controls{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
  .cw-note{font-size:14px;color:#7d8496;margin-left:auto;max-width:44%;text-align:right;line-height:1.5}
  .cw-note.hot{color:#a78bfa}
  .cw-divider{height:1px;background:rgba(255,255,255,.08);margin:4px 0}
  .cw-litm h4{font-size:17px;color:#e8ebf2;margin:0 0 4px;font-weight:600}
  .cw-litm p{font-size:15px;color:#8b91a2;margin:0 0 12px;line-height:1.5}
  .cw-track{position:relative;display:flex;gap:5px;height:52px}
  .cw-cell{flex:1;border-radius:5px;background:rgba(255,255,255,.05);position:relative;transition:background .5s,box-shadow .5s}
  .cw-key{position:absolute;top:-30px;left:50%;transform:translateX(-50%);font-size:13px;padding:3px 9px;border-radius:6px;white-space:nowrap;font-weight:600;border:1px solid rgba(255,255,255,.16);background:rgba(20,22,30,.9);color:#e8ebf2;opacity:0;transition:opacity .4s}
  .cw-key.show{opacity:1}
  .cw-cell .cw-att{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);font-size:12px;font-variant-numeric:tabular-nums;opacity:0;transition:opacity .4s;color:#0a0b10;font-weight:700}
  .cw-cell .cw-att.show{opacity:1}
  .cw-litm-legend{display:flex;gap:14px;flex-wrap:wrap;font-size:14px;color:#8b91a2;margin-top:14px}
  .cw-litm-legend b.ok{color:#4ade80}.cw-litm-legend b.bad{color:#f87171}
  `
  el.appendChild(style)

  const wrap = document.createElement('div')
  wrap.className = 'cw-wrap'
  wrap.innerHTML = `
    <div class="cw-lead">Context window 不是記憶體，是一張<b>有限的桌子</b>。往上放東西：穩定的（system、tools）放前面、動態的（記憶、對話歷史）放後面。桌子塞滿會觸發 <b>compaction</b> — 歷史被壓成一小塊摘要，過程中<b>細節會掉出去消失</b>。</div>

    <div class="cw-deskwrap">
      <div class="cw-meta"><span class="lbl">桌面使用量 / Context Window</span><span class="pct" id="cw-pct">0%</span></div>
      <div class="cw-desk" id="cw-desk"><span class="cw-empty" id="cw-empty">空桌子 — 從下面放東西上來</span></div>
    </div>

    <div class="cw-legend">
      <span><i style="background:${COLORS.system}"></i>System</span>
      <span><i style="background:${COLORS.tools}"></i>Tools</span>
      <span><i style="background:${COLORS.memory}"></i>記憶</span>
      <span><i style="background:${COLORS.history}"></i>對話歷史</span>
      <span><i style="background:${COLORS.summary}"></i>壓縮摘要</span>
    </div>

    <div class="cw-controls">
      <button class="demo-btn" id="cw-sys">放入 System</button>
      <button class="demo-btn" id="cw-tools">放入 Tools</button>
      <button class="demo-btn" id="cw-mem">放入 記憶</button>
      <button class="demo-btn primary" id="cw-chat">繼續聊天（+歷史）</button>
      <button class="demo-btn" id="cw-reset">清空</button>
      <span class="cw-note" id="cw-note">提示：一直按「繼續聊天」把桌子塞滿，看會發生什麼事。</span>
    </div>

    <div class="cw-divider"></div>

    <div class="cw-litm">
      <h4>小實驗：Lost in the Middle</h4>
      <p>在一長串 context 的<b style="color:#c3c8d4">開頭 / 中間 / 結尾</b>各藏一個關鍵字，看模型對三個位置的「注意力熱度」。塞越多不代表用得越好。</p>
      <div class="cw-track" id="cw-track"></div>
      <div class="cw-litm-legend">
        <span>顏色越亮 = 注意力越高</span>
        <span>開頭 <b class="ok">記得</b></span>
        <span>結尾 <b class="ok">記得</b></span>
        <span>中間 <b class="bad">容易漏掉</b></span>
      </div>
      <div class="cw-controls" style="margin-top:12px">
        <button class="demo-btn primary" id="cw-litm-run">埋入關鍵字 → 看注意力</button>
        <button class="demo-btn" id="cw-litm-reset">重來</button>
      </div>
    </div>
  `
  el.appendChild(wrap)

  const $ = (id) => wrap.querySelector(id)
  const desk = $('#cw-desk'), pctEl = $('#cw-pct'), emptyEl = $('#cw-empty'), note = $('#cw-note')
  const track = $('#cw-track')

  const timers = new Set()
  const setT = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }

  // ---- 桌面狀態 ----
  let bricks = [] // {id, kind, units, label}
  let hasSystem = false, hasTools = false, hasMemory = false
  let uid = 0
  let compacting = false
  const UNITS = { system: 10, tools: 15, memory: 9, history: 9 }

  function total() { return bricks.reduce((s, b) => s + b.units, 0) }

  function render() {
    const t = total()
    const pct = Math.min(100, Math.round(t))
    pctEl.textContent = pct + '%'
    const warn = pct >= 85
    pctEl.classList.toggle('warn', warn)
    desk.classList.toggle('full', pct >= 98)
    emptyEl.style.display = bricks.length ? 'none' : 'block'

    // 移除舊磚 DOM（保留 spark 層與 empty）
    ;[...desk.querySelectorAll('.cw-brick')].forEach((n) => n.remove())
    bricks.forEach((b) => {
      const d = document.createElement('div')
      d.className = 'cw-brick'
      d.dataset.id = b.id
      d.style.width = (b.units / CAP * 100) + '%'
      d.style.background = COLORS[b.kind]
      if (b.kind === 'history') d.style.color = '#e8ebf2'
      d.textContent = b.units >= 7 ? b.label : ''
      desk.insertBefore(d, emptyEl)
    })
  }

  function add(kind, label) {
    if (compacting) return
    bricks.push({ id: ++uid, kind, units: UNITS[kind], label })
    render()
  }

  $('#cw-sys').addEventListener('click', () => { if (hasSystem) return; hasSystem = true; add('system', 'System'); $('#cw-sys').disabled = true })
  $('#cw-tools').addEventListener('click', () => { if (hasTools) return; hasTools = true; add('tools', 'Tools'); $('#cw-tools').disabled = true })
  $('#cw-mem').addEventListener('click', () => { if (hasMemory) return; hasMemory = true; add('memory', '記憶'); $('#cw-mem').disabled = true })

  const chatLabels = ['問答', '追問', '討論', '修改', '再問', '延伸', '補充', '確認']
  let chatN = 0
  $('#cw-chat').addEventListener('click', () => {
    if (compacting) return
    if (total() + UNITS.history > CAP) { runCompaction(); return }
    add('history', chatLabels[chatN++ % chatLabels.length])
    if (total() + UNITS.history > CAP) {
      note.textContent = '快滿了！再按一次「繼續聊天」就會觸發 compaction。'
      note.classList.add('hot')
    }
  })

  function runCompaction() {
    const hist = bricks.filter((b) => b.kind === 'history')
    if (hist.length < 2) { add('history', chatLabels[chatN++ % chatLabels.length]); return }
    compacting = true
    note.textContent = '桌子滿了 → 觸發 compaction：把歷史壓縮成摘要…'
    note.classList.add('hot')

    // 掉落亮點（代表流失的 nuance / edge cases）
    const deskRect = desk.getBoundingClientRect()
    const histNodes = hist.map((b) => desk.querySelector(`[data-id="${b.id}"]`)).filter(Boolean)
    histNodes.forEach((n, i) => {
      const r = n.getBoundingClientRect()
      const count = 2
      for (let k = 0; k < count; k++) {
        const s = document.createElement('div')
        s.className = 'cw-spark'
        const sx = r.left - deskRect.left + Math.random() * r.width
        const sy = r.top - deskRect.top + r.height / 2
        s.style.left = sx + 'px'; s.style.top = sy + 'px'
        desk.appendChild(s)
        setT(() => {
          s.style.transition = 'transform 1s ease-in, opacity 1s ease-in'
          s.style.transform = `translate(${(Math.random() - 0.5) * 40}px, ${60 + Math.random() * 30}px)`
          s.style.opacity = '0'
        }, 40 + i * 40 + k * 60)
        setT(() => s.remove(), 1300 + i * 40)
      }
    })

    // 壓縮：歷史磚寬度縮到 0
    const combined = hist.reduce((s, b) => s + b.units, 0)
    const summaryUnits = Math.max(7, Math.round(combined * 0.32))
    histNodes.forEach((n) => { n.style.width = '0%'; n.style.opacity = '0' })

    setT(() => {
      // 用一塊摘要磚取代所有歷史磚
      const firstHistIdx = bricks.findIndex((b) => b.kind === 'history')
      bricks = bricks.filter((b) => b.kind !== 'history')
      bricks.splice(firstHistIdx, 0, { id: ++uid, kind: 'summary', units: summaryUnits, label: '摘要' })
      chatN = 0
      render()
      // 摘要磚彈入
      const sn = desk.querySelector('.cw-brick[data-id="' + uid + '"]')
      if (sn) { sn.style.width = '0%'; requestAnimationFrame(() => { sn.style.width = (summaryUnits / CAP * 100) + '%' }) }
      note.textContent = '壓縮完成：一大段歷史 → 一小塊摘要，幾顆「細節」掉出桌外消失了。'
      compacting = false
    }, 700)
  }

  $('#cw-reset').addEventListener('click', () => {
    bricks = []; hasSystem = hasTools = hasMemory = false; chatN = 0; compacting = false
    $('#cw-sys').disabled = $('#cw-tools').disabled = $('#cw-mem').disabled = false
    note.textContent = '提示：一直按「繼續聊天」把桌子塞滿，看會發生什麼事。'
    note.classList.remove('hot')
    ;[...desk.querySelectorAll('.cw-spark')].forEach((n) => n.remove())
    render()
  })

  // ---- Lost in the middle 實驗 ----
  const N_CELLS = 11
  const KEY_POS = [0, 5, 10]
  const KEY_LABEL = ['開頭關鍵字', '中間關鍵字', '結尾關鍵字']
  // U 型注意力：兩端高、中間低
  const ATT = [0.95, 0.62, 0.4, 0.28, 0.2, 0.16, 0.2, 0.28, 0.42, 0.66, 0.97]
  let cells = []

  function buildTrack() {
    track.innerHTML = ''
    cells = []
    for (let i = 0; i < N_CELLS; i++) {
      const c = document.createElement('div')
      c.className = 'cw-cell'
      const ki = KEY_POS.indexOf(i)
      if (ki >= 0) {
        const key = document.createElement('div')
        key.className = 'cw-key'
        key.textContent = KEY_LABEL[ki]
        c.appendChild(key)
        const att = document.createElement('div')
        att.className = 'cw-att'
        c.appendChild(att)
      }
      track.appendChild(c)
      cells.push(c)
    }
  }

  function runLitm() {
    buildTrack()
    cells.forEach((c, i) => {
      setT(() => {
        const a = ATT[i]
        c.style.background = `rgba(${hexR(accent)},${hexG(accent)},${hexB(accent)},${(0.12 + a * 0.85).toFixed(2)})`
        if (a > 0.6) c.style.boxShadow = `0 0 14px rgba(${hexR(accent)},${hexG(accent)},${hexB(accent)},.5)`
        const key = c.querySelector('.cw-key'); if (key) key.classList.add('show')
        const att = c.querySelector('.cw-att')
        if (att) { att.textContent = Math.round(a * 100) + '%'; att.classList.add('show') }
      }, 120 + i * 70)
    })
  }

  function hexR(h) { return parseInt(h.slice(1, 3), 16) }
  function hexG(h) { return parseInt(h.slice(3, 5), 16) }
  function hexB(h) { return parseInt(h.slice(5, 7), 16) }

  $('#cw-litm-run').addEventListener('click', runLitm)
  $('#cw-litm-reset').addEventListener('click', buildTrack)

  render()
  buildTrack()

  return () => {
    timers.forEach((id) => clearTimeout(id)); timers.clear()
    style.remove(); wrap.remove()
  }
}
