// Demo：Context Window 是 AI 的全部世界 — DemoStage 導演版
// 6 拍：空桌子｜穩定的先放車頭｜聊天堆歷史逼近滿載｜滿了 → compaction 細節掉出｜
// lost in the middle 注意力熱度｜sandbox = 全部按鈕自由玩。
import { createStage, pop, shake } from './_stage.js'

const RED = '#f87171'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const CAP = 100
  const COLORS = { system: accent, tools: '#4ade80', memory: '#fbbf24', history: '#8b91a2', summary: '#a78bfa' }
  const UNITS = { system: 10, tools: 15, memory: 9, history: 9 }
  const CHAT_LABELS = ['問答', '追問', '討論', '修改', '再問', '延伸', '補充', '確認']

  const style = document.createElement('style')
  style.textContent = `
  .cw-deskwrap{margin-bottom:16px}
  .cw-meta{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px}
  .cw-meta .lbl{font-size:14px;letter-spacing:.1em;color:#7d8496;text-transform:uppercase;font-family:var(--font-mono)}
  .cw-meta .pct{font-size:26px;font-weight:700;font-variant-numeric:tabular-nums;color:#e8ebf2}
  .cw-meta .pct.warn{color:${RED};animation:cw-flash .6s ease-in-out infinite}
  @keyframes cw-flash{50%{opacity:.35}}
  .cw-desk{position:relative;height:70px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid var(--line);display:flex;padding:6px;gap:4px;overflow:hidden}
  .cw-desk.full{border-color:${RED}80;box-shadow:0 0 0 1px ${RED}4d inset}
  .cw-brick{border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:600;color:#05060a;white-space:nowrap;overflow:hidden;transition:width .5s cubic-bezier(.2,.7,.2,1),opacity .4s;min-width:0}
  .cw-empty{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:13px;color:#5a6070;pointer-events:none}
  .cw-spark{position:absolute;width:6px;height:6px;border-radius:50%;background:#fff;box-shadow:0 0 8px #fff;pointer-events:none;z-index:6}
  .cw-legend{display:flex;gap:16px;flex-wrap:wrap;font-size:14px;color:#8b91a2;margin-bottom:16px}
  .cw-legend span{display:flex;align-items:center;gap:6px}
  .cw-legend i{width:11px;height:11px;border-radius:3px;display:inline-block}
  .cw-ctrls{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:16px}
  .cw-btn{font-family:var(--font-tc);font-size:14px;color:var(--text);background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:999px;padding:9px 17px;cursor:pointer;transition:all .2s}
  .cw-btn:hover{border-color:var(--text)}
  .cw-btn.primary{background:var(--accent);color:#08090a;border-color:var(--accent);font-weight:600}
  .cw-btn:disabled{opacity:.4;cursor:default}
  .cw-btn.hide{display:none}
  .cw-note{font-size:14px;color:#7d8496;margin-left:auto;max-width:44%;text-align:right;line-height:1.5}
  .cw-note.hot{color:#a78bfa}
  .cw-litm{border-top:1px solid rgba(255,255,255,.08);padding-top:16px}
  .cw-litm h4{font-size:17px;color:#e8ebf2;margin:0 0 4px;font-weight:600}
  .cw-litm p{font-size:15px;color:#8b91a2;margin:0 0 14px;line-height:1.5}
  .cw-track{position:relative;display:flex;gap:5px;height:52px;margin-top:26px}
  .cw-cell{flex:1;border-radius:5px;background:rgba(255,255,255,.05);position:relative;transition:background .5s,box-shadow .5s}
  .cw-key{position:absolute;top:-30px;left:50%;transform:translateX(-50%);font-size:13px;padding:3px 9px;border-radius:6px;white-space:nowrap;font-weight:600;border:1px solid rgba(255,255,255,.16);background:rgba(20,22,30,.9);color:#e8ebf2;opacity:0;transition:opacity .4s}
  .cw-key.show{opacity:1}
  .cw-att{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);font-size:12px;font-variant-numeric:tabular-nums;opacity:0;transition:opacity .4s;color:#0a0b10;font-weight:700;font-family:var(--font-mono)}
  .cw-att.show{opacity:1}
  .cw-llegend{display:flex;gap:14px;flex-wrap:wrap;font-size:14px;color:#8b91a2;margin-top:14px}
  .cw-llegend b.ok{color:#4ade80}.cw-llegend b.bad{color:${RED}}
  .cw-litm.hide{display:none}
  `
  el.appendChild(style)

  const desk = document.createElement('div')
  desk.className = 'cw-deskwrap ds-unit'
  desk.innerHTML = `
    <div class="cw-meta"><span class="lbl">桌面使用量 / Context Window</span><span class="pct" id="cw-pct">0%</span></div>
    <div class="cw-desk" id="cw-desk"><span class="cw-empty" id="cw-empty">空桌子 — 從下面放東西上來</span></div>`

  const legend = document.createElement('div')
  legend.className = 'cw-legend ds-unit'
  legend.innerHTML = `
    <span><i style="background:${COLORS.system}"></i>System</span>
    <span><i style="background:${COLORS.tools}"></i>Tools</span>
    <span><i style="background:${COLORS.memory}"></i>記憶</span>
    <span><i style="background:${COLORS.history}"></i>對話歷史</span>
    <span><i style="background:${COLORS.summary}"></i>壓縮摘要</span>`

  const ctrls = document.createElement('div')
  ctrls.className = 'cw-ctrls ds-unit'
  ctrls.innerHTML = `
    <button class="cw-btn hide" data-b="sys">放入 System</button>
    <button class="cw-btn hide" data-b="tools">放入 Tools</button>
    <button class="cw-btn hide" data-b="mem">放入 記憶</button>
    <button class="cw-btn primary hide" data-b="chat">繼續聊天（+歷史）</button>
    <button class="cw-btn hide" data-b="reset">清空</button>
    <span class="cw-note" id="cw-note"></span>`

  const litm = document.createElement('div')
  litm.className = 'cw-litm ds-unit'
  litm.innerHTML = `
    <h4>小實驗：Lost in the Middle</h4>
    <p>在一長串 context 的<b style="color:#c3c8d4">開頭 / 中間 / 結尾</b>各藏一個關鍵字，看模型對三個位置的注意力熱度。塞越多不代表用得越好。</p>
    <div class="cw-track" id="cw-track"></div>
    <div class="cw-llegend"><span>顏色越亮 = 注意力越高</span><span>開頭 <b class="ok">記得</b></span><span>結尾 <b class="ok">記得</b></span><span>中間 <b class="bad">容易漏掉</b></span></div>
    <div class="cw-ctrls" style="margin-top:14px;margin-bottom:0">
      <button class="cw-btn primary hide" data-b="litm">埋入關鍵字 → 看注意力</button>
      <button class="cw-btn hide" data-b="litmreset">重來</button>
    </div>`

  const pctEl = desk.querySelector('#cw-pct'), deskEl = desk.querySelector('#cw-desk'), emptyEl = desk.querySelector('#cw-empty')
  const note = ctrls.querySelector('#cw-note'), track = litm.querySelector('#cw-track')
  const btn = b => (ctrls.querySelector(`[data-b="${b}"]`) || litm.querySelector(`[data-b="${b}"]`))

  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  let bricks = [], has = { system: false, tools: false, memory: false }, uid = 0, compacting = false, chatN = 0, stage
  const total = () => bricks.reduce((s, b) => s + b.units, 0)

  function render() {
    const t = total(), pct = Math.min(100, Math.round(t))
    pctEl.textContent = pct + '%'; pctEl.classList.toggle('warn', pct >= 85)
    deskEl.classList.toggle('full', pct >= 98)
    emptyEl.style.display = bricks.length ? 'none' : 'block'
    ;[...deskEl.querySelectorAll('.cw-brick')].forEach(n => n.remove())
    bricks.forEach(b => {
      const d = document.createElement('div'); d.className = 'cw-brick'; d.dataset.id = b.id
      d.style.width = (b.units / CAP * 100) + '%'; d.style.background = COLORS[b.kind]
      if (b.kind === 'history') d.style.color = '#e8ebf2'
      d.textContent = b.units >= 7 ? b.label : ''
      deskEl.insertBefore(d, emptyEl)
    })
  }
  function add(kind, label, silent) {
    if (compacting) return
    bricks.push({ id: ++uid, kind, units: UNITS[kind], label }); render()
    if (!silent) { const n = deskEl.querySelector(`[data-id="${uid}"]`); pop(n) }
  }
  function putStable(kind, label) {
    if (has[kind]) return; has[kind] = true; add(kind, label)
    const bb = btn({ system: 'sys', tools: 'tools', memory: 'mem' }[kind]); if (bb) bb.disabled = true
  }
  function chat() {
    if (compacting) return
    if (total() + UNITS.history > CAP) { runCompaction(); return }
    add('history', CHAT_LABELS[chatN++ % CHAT_LABELS.length])
    if (total() + UNITS.history > CAP) { note.textContent = '快滿了！再按一次「繼續聊天」就會觸發 compaction。'; note.classList.add('hot') }
  }
  function runCompaction() {
    const hist = bricks.filter(b => b.kind === 'history')
    if (hist.length < 2) { add('history', CHAT_LABELS[chatN++ % CHAT_LABELS.length]); return }
    compacting = true; shake(deskEl)
    note.textContent = '桌子滿了 → 觸發 compaction：把歷史壓縮成摘要…'; note.classList.add('hot')
    const dr = deskEl.getBoundingClientRect()
    const nodes = hist.map(b => deskEl.querySelector(`[data-id="${b.id}"]`)).filter(Boolean)
    nodes.forEach((n, i) => {
      const r = n.getBoundingClientRect()
      for (let k = 0; k < 2; k++) {
        const s = document.createElement('div'); s.className = 'cw-spark'
        s.style.left = (r.left - dr.left + Math.random() * r.width) + 'px'
        s.style.top = (r.top - dr.top + r.height / 2) + 'px'
        deskEl.appendChild(s)
        T(() => { s.style.transition = 'transform 1s ease-in, opacity 1s ease-in'; s.style.transform = `translate(${(Math.random() - .5) * 40}px, ${60 + Math.random() * 30}px)`; s.style.opacity = '0' }, 40 + i * 40 + k * 60)
        T(() => s.remove(), 1300 + i * 40)
      }
    })
    const combined = hist.reduce((s, b) => s + b.units, 0)
    const summaryUnits = Math.max(7, Math.round(combined * .32))
    nodes.forEach(n => { n.style.width = '0%'; n.style.opacity = '0' })
    T(() => {
      const idx = bricks.findIndex(b => b.kind === 'history')
      bricks = bricks.filter(b => b.kind !== 'history')
      bricks.splice(idx, 0, { id: ++uid, kind: 'summary', units: summaryUnits, label: '摘要' })
      chatN = 0; render()
      const sn = deskEl.querySelector(`.cw-brick[data-id="${uid}"]`)
      if (sn) { sn.style.width = '0%'; requestAnimationFrame(() => { sn.style.width = (summaryUnits / CAP * 100) + '%' }) }
      note.textContent = '壓縮完成：一大段歷史 → 一小塊摘要，幾顆「細節」掉出桌外消失了。'
      compacting = false
    }, 700)
  }
  function resetDesk() {
    clearT(); bricks = []; has = { system: false, tools: false, memory: false }; chatN = 0; compacting = false
    ;['sys', 'tools', 'mem'].forEach(b => btn(b).disabled = false)
    note.textContent = ''; note.classList.remove('hot')
    ;[...deskEl.querySelectorAll('.cw-spark')].forEach(n => n.remove())
    render()
  }
  function showCtrls(list) { ctrls.querySelectorAll('.cw-btn').forEach(b => b.classList.toggle('hide', !list.includes(b.dataset.b))) }

  btn('sys').onclick = () => putStable('system', 'System')
  btn('tools').onclick = () => putStable('tools', 'Tools')
  btn('mem').onclick = () => putStable('memory', '記憶')
  btn('chat').onclick = () => { pop(btn('chat')); chat() }
  btn('reset').onclick = () => { pop(btn('reset')); resetDesk(); note.textContent = '提示：一直按「繼續聊天」把桌子塞滿，看會發生什麼事。' }

  // ---- lost in the middle ----
  const N = 11, KEY_POS = [0, 5, 10], KEY_LABEL = ['開頭關鍵字', '中間關鍵字', '結尾關鍵字']
  const ATT = [.95, .62, .4, .28, .2, .16, .2, .28, .42, .66, .97]
  const hx = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16)
  function buildTrack() {
    track.innerHTML = ''
    for (let i = 0; i < N; i++) {
      const c = document.createElement('div'); c.className = 'cw-cell'
      const ki = KEY_POS.indexOf(i)
      if (ki >= 0) { const k = document.createElement('div'); k.className = 'cw-key'; k.textContent = KEY_LABEL[ki]; c.appendChild(k); const a = document.createElement('div'); a.className = 'cw-att'; c.appendChild(a) }
      track.appendChild(c)
    }
  }
  function runLitm() {
    buildTrack()
    ;[...track.children].forEach((c, i) => T(() => {
      const a = ATT[i]
      c.style.background = `rgba(${hx(accent, 0)},${hx(accent, 1)},${hx(accent, 2)},${(.12 + a * .85).toFixed(2)})`
      if (a > .6) c.style.boxShadow = `0 0 14px rgba(${hx(accent, 0)},${hx(accent, 1)},${hx(accent, 2)},.5)`
      const k = c.querySelector('.cw-key'); if (k) k.classList.add('show')
      const at = c.querySelector('.cw-att'); if (at) { at.textContent = Math.round(a * 100) + '%'; at.classList.add('show') }
    }, 120 + i * 70))
  }
  btn('litm').onclick = () => { pop(btn('litm')); runLitm() }
  btn('litmreset').onclick = () => buildTrack()

  const beats = [
    { narration: 'Context window 不是記憶體，是一張<b>有限的桌子</b> — 一次 API call 能塞的 token 就這麼多。', focus: ['.cw-deskwrap'], nextLabel: '放穩定的東西 →',
      enter() { resetDesk(); showCtrls([]); litm.classList.add('hide') } },

    { narration: '穩定的先放車頭：<b>system、tools、記憶</b> — 每趟都一樣，可以 cache。', focus: ['.cw-deskwrap', '.cw-legend'], nextLabel: '開始聊天 →',
      enter() { resetDesk(); showCtrls([]); litm.classList.add('hide'); T(() => putStable('system', 'System'), 300); T(() => putStable('tools', 'Tools'), 700); T(() => putStable('memory', '記憶'), 1100) } },

    { narration: '每聊一句，就往桌上放一塊<b>對話歷史</b>。桌子越來越滿，動態的貨往車尾堆。', focus: ['.cw-deskwrap'], nextLabel: '塞爆看看 →',
      enter() { resetDesk(); showCtrls([]); litm.classList.add('hide'); putStable('system', 'System'); putStable('tools', 'Tools'); for (let i = 0; i < 6; i++) T(() => chat(), 300 + i * 260) } },

    { narration: '<b>滿了 → compaction</b>：一大段歷史壓成一小塊摘要，幾顆<b style="color:' + RED + '">細節掉出桌外消失</b> — 這就是聊久了會忘東忘西的原因。', focus: ['.cw-deskwrap'], nextLabel: '還有一個陷阱 →',
      enter() { resetDesk(); showCtrls([]); litm.classList.add('hide'); putStable('system', 'System'); putStable('tools', 'Tools'); putStable('memory', '記憶'); for (let i = 0; i < 8; i++) T(() => chat(), 200 + i * 180); T(() => runCompaction(), 1900) } },

    { narration: '塞越多 ≠ 用越好。開頭結尾<b>記得牢</b>，<b style="color:' + RED + '">中間容易漏掉</b> — 這叫 lost in the middle。', focus: ['.cw-litm'], nextLabel: '換你玩 →',
      enter() { litm.classList.remove('hide'); showCtrls([]); btn('litm').classList.add('hide'); btn('litmreset').classList.add('hide'); buildTrack(); runLitm() } },

    { narration: '換你玩 — <b>放 system/tools/記憶</b>、狂按<b>繼續聊天</b>塞爆桌子觸發 compaction，或跑 <b>lost in the middle</b> 實驗。', sandbox: true,
      enter() {
        resetDesk(); note.textContent = '提示：一直按「繼續聊天」把桌子塞滿，看會發生什麼事。'
        showCtrls(['sys', 'tools', 'mem', 'chat', 'reset'])
        litm.classList.remove('hide'); btn('litm').classList.remove('hide'); btn('litmreset').classList.remove('hide'); buildTrack()
      } },
  ]

  stage = createStage(el, ctx, { beats })
  stage.body.append(desk, legend, ctrls, litm)
  render(); buildTrack()

  return () => { clearT(); stage.destroy(); style.remove() }
}
