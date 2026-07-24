// Demo：Context Window 是一台貨車一趟能載的貨 — DemoStage 導演版
// 6 拍：空車登場｜穩定貨先上車頭｜聊天堆貨往車尾逼近滿載｜滿載 → compaction 細節掉出車斗｜
// lost in the middle 車頭車尾記得牢、車廂中間漏｜sandbox = 全部按鈕自由玩。
// 視覺為靜態側視貨車，車斗＝context window；下方保留容量條（token 計數）與車斗同步。
import { createStage, pop, shake, enterFly } from './_stage.js'

const RED = '#f87171', EASE = 'cubic-bezier(.16,1,.3,1)'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const CAP = 100
  const COLORS = { system: accent, tools: '#4ade80', memory: '#fbbf24', history: '#8b91a2', summary: '#a78bfa' }
  const UNITS = { system: 10, tools: 15, memory: 9, history: 9 }
  const CHAT_LABELS = ['問答', '追問', '討論', '修改', '再問', '延伸', '補充', '確認']

  // 手繪側視貨車：車頭（cab）在左、貨櫃車斗在右。車斗內部由 DOM .cw-bed 疊貨。
  const TRUCK = `<svg class="cw-svg" viewBox="0 0 800 300" preserveAspectRatio="none"
    fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 286 h776" stroke="rgba(255,255,255,.16)" stroke-width="3"/>
    <path d="M72 220 h700" stroke="rgba(255,255,255,.28)" stroke-width="3"/>
    <path d="M72 220 V150 Q72 140 82 137 L140 100 Q147 96 158 96 L236 96 V220 Z"
      fill="rgba(12,14,20,.82)" stroke="rgba(210,215,230,.5)" stroke-width="2.4"/>
    <path d="M98 137 L150 105 L192 105 L192 137 Z" fill="rgba(120,150,220,.14)" stroke="rgba(210,215,230,.45)" stroke-width="2"/>
    <rect x="64" y="188" width="9" height="17" rx="2" fill="rgba(251,191,36,.55)" stroke="rgba(210,215,230,.4)" stroke-width="1.6"/>
    <rect x="250" y="40" width="530" height="180" rx="7" fill="rgba(10,12,18,.72)" stroke="${accent}" stroke-width="2.6" class="cw-boxline"/>
    <circle cx="152" cy="260" r="26" fill="rgba(10,12,18,.92)" stroke="rgba(210,215,230,.5)" stroke-width="2.4"/><circle cx="152" cy="260" r="9" stroke="rgba(210,215,230,.5)" stroke-width="2.4"/>
    <circle cx="556" cy="260" r="26" fill="rgba(10,12,18,.92)" stroke="rgba(210,215,230,.5)" stroke-width="2.4"/><circle cx="556" cy="260" r="9" stroke="rgba(210,215,230,.5)" stroke-width="2.4"/>
    <circle cx="656" cy="260" r="26" fill="rgba(10,12,18,.92)" stroke="rgba(210,215,230,.5)" stroke-width="2.4"/><circle cx="656" cy="260" r="9" stroke="rgba(210,215,230,.5)" stroke-width="2.4"/>
  </svg>`

  const style = document.createElement('style')
  style.textContent = `
  .cw-scene{position:relative;margin-bottom:14px}
  .cw-truck{position:relative;width:100%;max-width:900px;margin:0 auto;aspect-ratio:800/300}
  .cw-svg{position:absolute;inset:0;width:100%;height:100%}
  .cw-boxline{transition:stroke .4s,filter .4s}
  .cw-truck.full .cw-boxline{stroke:${RED};filter:drop-shadow(0 0 6px ${RED}aa)}
  .cw-bed{position:absolute;left:32.6%;right:4.2%;top:17.5%;bottom:30.2%;
    display:flex;align-items:stretch;gap:3px;padding:2px;overflow:hidden}
  .cw-brick{border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:15px;
    font-weight:600;color:#05060a;white-space:nowrap;overflow:hidden;min-width:0;
    box-shadow:inset 0 2px 0 rgba(255,255,255,.28),inset 0 0 0 1px rgba(0,0,0,.3);
    transition:width .5s ${EASE},opacity .4s}
  .cw-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    font-size:15px;color:#5a6070;pointer-events:none}
  .cw-zone{position:absolute;font-size:13.5px;font-family:var(--font-mono);letter-spacing:.04em;
    color:#7d8496;white-space:nowrap}
  .cw-zone.head{left:32.6%;top:9%}
  .cw-zone.tail{right:4.2%;top:9%;color:#9aa1b2}
  .cw-spark{position:absolute;width:7px;height:7px;border-radius:2px;background:#fff;
    box-shadow:0 0 8px #fff;pointer-events:none;z-index:9}
  .cw-gauge{display:flex;align-items:center;gap:16px;margin-bottom:14px}
  .cw-bar{flex:1;height:20px;border-radius:10px;background:rgba(255,255,255,.05);
    border:1px solid var(--line);overflow:hidden}
  .cw-fill{height:100%;width:0;border-radius:10px;background:linear-gradient(90deg,${accent},#fbbf24);transition:width .5s ${EASE}}
  .cw-fill.warn{background:linear-gradient(90deg,#fbbf24,${RED});animation:cw-flash .5s infinite}
  @keyframes cw-flash{50%{opacity:.45}}
  .cw-pct{font-family:var(--font-mono);font-size:18px;font-weight:600;color:#e8ebf2;min-width:196px;text-align:right}
  .cw-pct.warn{color:${RED}}
  .cw-pct small{font-size:13.5px;color:#7d8496;font-weight:400}
  .cw-legend{display:flex;gap:16px;flex-wrap:wrap;font-size:15.5px;color:#8b91a2;margin-bottom:14px}
  .cw-legend span{display:flex;align-items:center;gap:6px}
  .cw-legend i{width:11px;height:11px;border-radius:3px;display:inline-block}
  .cw-ctrls{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:14px}
  .cw-btn{font-family:var(--font-tc);font-size:15.5px;color:var(--text);background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:999px;padding:9px 17px;cursor:pointer;transition:all .2s}
  .cw-btn:hover{border-color:var(--text)}
  .cw-btn.primary{background:var(--accent);color:#08090a;border-color:var(--accent);font-weight:600}
  .cw-btn:disabled{opacity:.4;cursor:default}
  .cw-btn.hide{display:none}
  .cw-note{font-size:15.5px;color:#7d8496;margin-left:auto;max-width:44%;text-align:right;line-height:1.5}
  .cw-note.hot{color:#a78bfa}
  .cw-litm{border-top:1px solid rgba(255,255,255,.08);padding-top:16px}
  .cw-litm h4{font-size:17px;color:#e8ebf2;margin:0 0 4px;font-weight:600}
  .cw-litm p{font-size:15px;color:#8b91a2;margin:0 0 14px;line-height:1.5}
  .cw-track{position:relative;display:flex;gap:5px;height:52px;margin-top:26px}
  .cw-cell{flex:1;border-radius:5px;background:rgba(255,255,255,.05);position:relative;transition:background .5s,box-shadow .5s}
  .cw-key{position:absolute;top:-30px;left:50%;transform:translateX(-50%);font-size:14.5px;padding:3px 9px;border-radius:6px;white-space:nowrap;font-weight:600;border:1px solid rgba(255,255,255,.16);background:rgba(20,22,30,.9);color:#e8ebf2;opacity:0;transition:opacity .4s}
  .cw-key.show{opacity:1}
  .cw-att{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);font-size:14px;font-variant-numeric:tabular-nums;opacity:0;transition:opacity .4s;color:#0a0b10;font-weight:700;font-family:var(--font-mono)}
  .cw-att.show{opacity:1}
  .cw-llegend{display:flex;gap:14px;flex-wrap:wrap;font-size:15.5px;color:#8b91a2;margin-top:14px}
  .cw-llegend b.ok{color:#4ade80}.cw-llegend b.bad{color:${RED}}
  .cw-litm.hide{display:none}
  `
  el.appendChild(style)

  const scene = document.createElement('div')
  scene.className = 'cw-scene ds-unit'
  scene.innerHTML = `
    <div class="cw-truck" id="cw-truck">
      ${TRUCK}
      <div class="cw-zone head">車頭 · 穩定區（可 cache）</div>
      <div class="cw-zone tail">車尾 · 動態區</div>
      <div class="cw-bed" id="cw-bed"><span class="cw-empty" id="cw-empty">空車 — 從下面把貨裝上車斗</span></div>
    </div>`

  const gauge = document.createElement('div')
  gauge.className = 'cw-gauge ds-unit'
  gauge.innerHTML = `
    <div class="cw-bar"><div class="cw-fill" id="cw-fill"></div></div>
    <div class="cw-pct" id="cw-pct">0% <small>· 0 / 100 K token</small></div>`

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
    <button class="cw-btn hide" data-b="reset">清空車斗</button>
    <span class="cw-note" id="cw-note"></span>`

  const litm = document.createElement('div')
  litm.className = 'cw-litm ds-unit'
  litm.innerHTML = `
    <h4>小實驗：Lost in the Middle</h4>
    <p>在一整車 context 的<b style="color:#c3c8d4">車頭 / 車廂中間 / 車尾</b>各藏一件關鍵貨，看模型對三個位置的注意力熱度。裝越滿不代表用得越好。</p>
    <div class="cw-track" id="cw-track"></div>
    <div class="cw-llegend"><span>顏色越亮 = 注意力越高</span><span>車頭 <b class="ok">記得</b></span><span>車尾 <b class="ok">記得</b></span><span>車廂中間 <b class="bad">容易漏掉</b></span></div>
    <div class="cw-ctrls" style="margin-top:14px;margin-bottom:0">
      <button class="cw-btn primary hide" data-b="litm">埋入關鍵貨 → 看注意力</button>
      <button class="cw-btn hide" data-b="litmreset">重來</button>
    </div>`

  const truckEl = scene.querySelector('#cw-truck'), bedEl = scene.querySelector('#cw-bed'), emptyEl = scene.querySelector('#cw-empty')
  const fillEl = gauge.querySelector('#cw-fill'), pctEl = gauge.querySelector('#cw-pct')
  const note = ctrls.querySelector('#cw-note'), track = litm.querySelector('#cw-track')
  const btn = b => (ctrls.querySelector(`[data-b="${b}"]`) || litm.querySelector(`[data-b="${b}"]`))

  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  let bricks = [], has = { system: false, tools: false, memory: false }, uid = 0, compacting = false, chatN = 0, stage
  const total = () => bricks.reduce((s, b) => s + b.units, 0)

  function render() {
    const t = total(), pct = Math.min(100, Math.round(t))
    pctEl.innerHTML = `${pct}% <small>· ${pct} / 100 K token</small>`
    pctEl.classList.toggle('warn', pct >= 85)
    fillEl.style.width = pct + '%'; fillEl.classList.toggle('warn', pct >= 85)
    truckEl.classList.toggle('full', pct >= 98)
    emptyEl.style.display = bricks.length ? 'none' : 'flex'
    ;[...bedEl.querySelectorAll('.cw-brick')].forEach(n => n.remove())
    bricks.forEach(b => {
      const d = document.createElement('div'); d.className = 'cw-brick'; d.dataset.id = b.id
      d.style.width = (b.units / CAP * 100) + '%'; d.style.background = COLORS[b.kind]
      if (b.kind === 'history') d.style.color = '#e8ebf2'
      d.textContent = b.units >= 7 ? b.label : ''
      bedEl.insertBefore(d, emptyEl)
    })
  }
  function add(kind, label, silent) {
    if (compacting) return
    bricks.push({ id: ++uid, kind, units: UNITS[kind], label }); render()
    if (!silent) { const n = bedEl.querySelector(`[data-id="${uid}"]`); enterFly(n, { y: -34, dur: 500 }); pop(n) }
  }
  function putStable(kind, label) {
    if (has[kind]) return; has[kind] = true; add(kind, label)
    const bb = btn({ system: 'sys', tools: 'tools', memory: 'mem' }[kind]); if (bb) bb.disabled = true
  }
  function chat() {
    if (compacting) return
    if (total() + UNITS.history > CAP) { runCompaction(); return }
    add('history', CHAT_LABELS[chatN++ % CHAT_LABELS.length])
    if (total() + UNITS.history > CAP) { note.textContent = '快滿載了！再按一次「繼續聊天」就會觸發 compaction。'; note.classList.add('hot') }
  }
  function runCompaction() {
    const hist = bricks.filter(b => b.kind === 'history')
    if (hist.length < 2) { add('history', CHAT_LABELS[chatN++ % CHAT_LABELS.length]); return }
    compacting = true; shake(truckEl)
    note.textContent = '車斗滿載 → 觸發 compaction：把歷史壓成一小塊摘要…'; note.classList.add('hot')
    const tr = truckEl.getBoundingClientRect()
    const nodes = hist.map(b => bedEl.querySelector(`[data-id="${b.id}"]`)).filter(Boolean)
    nodes.forEach((n, i) => {
      const r = n.getBoundingClientRect()
      for (let k = 0; k < 2; k++) {
        const s = document.createElement('div'); s.className = 'cw-spark'
        s.style.left = (r.left - tr.left + Math.random() * r.width) + 'px'
        s.style.top = (r.top - tr.top + r.height / 2) + 'px'
        truckEl.appendChild(s)
        T(() => { s.style.transition = 'transform 1s ease-in, opacity 1s ease-in'; s.style.transform = `translate(${(Math.random() - .5) * 50}px, ${90 + Math.random() * 40}px)`; s.style.opacity = '0' }, 40 + i * 40 + k * 60)
        T(() => s.remove(), 1400 + i * 40)
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
      const sn = bedEl.querySelector(`.cw-brick[data-id="${uid}"]`)
      if (sn) { sn.style.width = '0%'; requestAnimationFrame(() => { sn.style.width = (summaryUnits / CAP * 100) + '%' }) }
      note.textContent = '壓縮完成：一車歷史 → 一小塊摘要，幾顆「細節」掉出車斗消失了。'
      compacting = false
    }, 700)
  }
  function resetBed() {
    clearT(); bricks = []; has = { system: false, tools: false, memory: false }; chatN = 0; compacting = false
    ;['sys', 'tools', 'mem'].forEach(b => btn(b).disabled = false)
    note.textContent = ''; note.classList.remove('hot')
    ;[...truckEl.querySelectorAll('.cw-spark')].forEach(n => n.remove())
    render()
  }
  function showCtrls(list) { ctrls.querySelectorAll('.cw-btn').forEach(b => b.classList.toggle('hide', !list.includes(b.dataset.b))) }

  btn('sys').onclick = () => putStable('system', 'System')
  btn('tools').onclick = () => putStable('tools', 'Tools')
  btn('mem').onclick = () => putStable('memory', '記憶')
  btn('chat').onclick = () => { pop(btn('chat')); chat() }
  btn('reset').onclick = () => { pop(btn('reset')); resetBed(); note.textContent = '提示：一直按「繼續聊天」把車斗塞滿，看會發生什麼事。' }

  // ---- lost in the middle（沿車斗位置：車頭 / 車廂中間 / 車尾）----
  const N = 11, KEY_POS = [0, 5, 10], KEY_LABEL = ['車頭關鍵貨', '車廂中間', '車尾關鍵貨']
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
    { narration: 'Context window 不是記憶體，是一台<b>貨車一趟能載的貨</b> — 車斗一次就這麼大，這趟要用的全得塞進去。', focus: ['.cw-scene'], nextLabel: '穩定的貨先上車 →',
      enter() { resetBed(); showCtrls([]); litm.classList.add('hide') } },

    { narration: '穩定的貨往<b>車頭</b>放：system、tools、記憶 — 每趟都一樣，可以 cache。', focus: ['.cw-scene', '.cw-legend'], nextLabel: '開始聊天 →',
      enter() { resetBed(); showCtrls([]); litm.classList.add('hide'); T(() => putStable('system', 'System'), 300); T(() => putStable('tools', 'Tools'), 700); T(() => putStable('memory', '記憶'), 1100) } },

    { narration: '每聊一句，就往<b>車尾</b>堆一件對話歷史。車斗越裝越滿，逼近滿載。', focus: ['.cw-scene', '.cw-gauge'], nextLabel: '塞爆看看 →',
      enter() { resetBed(); showCtrls([]); litm.classList.add('hide'); putStable('system', 'System'); putStable('tools', 'Tools'); for (let i = 0; i < 6; i++) T(() => chat(), 300 + i * 260) } },

    { narration: '<b>滿載 → compaction</b>：一車歷史壓成一小塊摘要，幾顆<b style="color:' + RED + '">細節掉出車斗消失</b> — 這就是聊久了會忘東忘西的原因。', focus: ['.cw-scene', '.cw-gauge'], nextLabel: '還有一個陷阱 →',
      enter() { resetBed(); showCtrls([]); litm.classList.add('hide'); putStable('system', 'System'); putStable('tools', 'Tools'); putStable('memory', '記憶'); for (let i = 0; i < 8; i++) T(() => chat(), 200 + i * 180); T(() => runCompaction(), 1900) } },

    { narration: '裝越滿 ≠ 用越好。<b>車頭車尾</b>記得牢，<b style="color:' + RED + '">車廂中間容易漏掉</b> — 這叫 lost in the middle。', focus: ['.cw-litm'], nextLabel: '換你玩 →',
      enter() { litm.classList.remove('hide'); showCtrls([]); btn('litm').classList.add('hide'); btn('litmreset').classList.add('hide'); buildTrack(); runLitm() } },

    { narration: '換你玩 — <b>把穩定貨上車頭</b>、狂按<b>繼續聊天</b>往車尾塞爆觸發 compaction，或跑 <b>lost in the middle</b> 實驗。', sandbox: true,
      enter() {
        resetBed(); note.textContent = '提示：一直按「繼續聊天」把車斗塞滿，看會發生什麼事。'
        showCtrls(['sys', 'tools', 'mem', 'chat', 'reset'])
        litm.classList.remove('hide'); btn('litm').classList.remove('hide'); btn('litmreset').classList.remove('hide'); buildTrack()
      } },
  ]

  stage = createStage(el, ctx, { beats })
  stage.body.append(scene, gauge, legend, ctrls, litm)
  render(); buildTrack()

  return () => { clearT(); stage.destroy(); style.remove() }
}
