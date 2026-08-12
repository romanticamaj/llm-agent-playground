// Demo：Agent 沒有開關 — DemoStage 導演版
// 6 拍：靜止的接龍引擎（不是待命）｜送一句話 → 接完就停｜開排程 → 有人給它節奏｜
//       兩個開關（Agent 的不存在／排程的可以撥）｜關機 → 連排程都觸發不了｜sandbox。
import { createStage, pop, shake, enterFly, countUp } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const GREEN = '#4ade80', RED = '#f87171', AMBER = '#fbbf24'
const P = 'nsw'

const sv = d => `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor"
  stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
const IC = {
  chain: sv('<path d="M9.5 14.5l5-5"/><path d="M13 7.5l1.6-1.6a3.6 3.6 0 0 1 5.1 5.1L18 12.6"/><path d="M11 16.5l-1.6 1.6a3.6 3.6 0 0 1-5.1-5.1L6 11.4"/>'),
  power: sv('<path d="M12 3.5v8"/><path d="M7.2 6.6a7.5 7.5 0 1 0 9.6 0"/>'),
  clock: sv('<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.4 2"/>'),
  ban: sv('<circle cx="12" cy="12" r="8.5"/><path d="M6.2 6.2l11.6 11.6"/>'),
  send: sv('<path d="M4 12l16-7-6 16-2.6-6.4z"/><path d="M11.4 14.6L20 5"/>'),
  cpu: sv('<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3"/>'),
}

const TOKENS = ['取', '得', '清', '單', '→', '整', '理', '→', '完']
const OUTPUTS = ['整理好 12 封信', '寄出 1 封回覆', '產出今日摘要', '更新 3 筆標籤']
const FREQ = [
  { id: 'h', label: '每小時', at: [0.16, 0.38, 0.60, 0.82] },
  { id: 'd', label: '每天', at: [0.22, 0.50, 0.78] },
  { id: 'w', label: '每週', at: [0.30, 0.72] },
]
const LOOP_SEC = 10

const DETAIL = {
  off: `<b>機器沒開</b> — 排程觸發不了，Agent 連接龍的機會都沒有。要它停，關掉 Claude 或關機就好。`,
  idle: `<b>沒有排程 = 沒有節奏。</b>時間軸上沒有任何觸發事件 —— 只有你送一句話進去，它才會動一次，做完就停。`,
  sched: `<b>排程開著。</b>每到一個觸發點，Agent 醒來接一次龍、做完再回到靜止 —— 它不是一直在跑，是被叫醒。`,
}

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'

  const style = document.createElement('style')
  style.textContent = `
  .${P}-top{display:flex;align-items:center;gap:11px;flex-wrap:wrap;margin-bottom:13px}
  .${P}-btn{font-family:var(--font-tc);font-size:15px;color:var(--text);background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:999px;padding:9px 17px;cursor:pointer;display:inline-flex;align-items:center;gap:8px;transition:all .25s ${EASE}}
  .${P}-btn .ic{width:16px;height:16px;flex:none;color:var(--text-dim)}
  .${P}-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .${P}-btn.primary{background:${accent};color:#08090a;border-color:${accent};font-weight:700}
  .${P}-btn.primary .ic{color:#08090a}
  .${P}-btn.dead{color:${RED};border-color:${RED}66}
  .${P}-btn.dead .ic{color:${RED}}
  .${P}-btn.hide,.${P}-freq.hide{display:none}
  .${P}-freq{display:flex;align-items:center;gap:9px;margin-left:auto}
  .${P}-freq>span{font-size:14.5px;color:var(--text-dim)}
  .${P}-seg{display:flex;padding:3px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid var(--line)}
  .${P}-seg button{font-family:var(--font-tc);font-size:14.5px;color:var(--text-dim);background:none;border:none;border-radius:999px;padding:6px 14px;cursor:pointer;transition:all .3s ${EASE}}
  .${P}-seg button.on{background:${accent};color:#08090a;font-weight:700}

  .${P}-machine{position:relative;border:1px solid var(--line);border-radius:16px;padding:15px;background:rgba(18,22,32,.7);display:flex;flex-direction:column;gap:13px;transition:border-color .5s ${EASE}}
  .${P}-machine.off{border-color:${RED}44}
  /* 只暗掉內容層 —— veil 與 ghost 是 machine 的直接子層，不吃這個 filter */
  .${P}-machine .${P}-row,.${P}-machine .${P}-tl{transition:filter .5s ${EASE}}
  .${P}-machine.off .${P}-row,.${P}-machine.off .${P}-tl{filter:grayscale(1) brightness(.45)}
  .${P}-mtag{position:absolute;top:-9px;left:16px;padding:1px 9px;border-radius:999px;background:#12161f;font-family:var(--font-mono);font-size:11px;letter-spacing:.16em;color:var(--text-dim)}
  .${P}-veil{position:absolute;inset:0;z-index:30;display:none;align-items:center;justify-content:center;border-radius:16px;background:rgba(6,7,10,.62)}
  .${P}-veil.on{display:flex}
  .${P}-veil span{display:flex;align-items:center;gap:9px;font-size:17px;font-weight:700;color:${RED};padding:11px 20px;border:1px solid ${RED}77;border-radius:999px;background:rgba(10,12,16,.92)}
  .${P}-veil .ic{width:19px;height:19px;flex:none}

  .${P}-row{display:grid;grid-template-columns:1.28fr 1fr;gap:13px;align-items:stretch}
  .${P}-card{border:1px solid var(--line);border-radius:13px;background:rgba(255,255,255,.03);padding:12px 14px;display:flex;flex-direction:column;gap:10px;transition:border-color .45s ${EASE}}
  .${P}-hd{display:flex;align-items:center;gap:9px}
  .${P}-hd .ic{width:20px;height:20px;flex:none;color:var(--text-dim);transition:color .4s}
  .${P}-hd b{font-size:16.5px;color:var(--text)}
  .${P}-hd .st{margin-left:auto;font-family:var(--font-mono);font-size:11.5px;letter-spacing:.14em;padding:3px 10px;border-radius:999px;border:1px solid var(--line);color:var(--text-dim);white-space:nowrap;transition:all .3s ${EASE}}
  .${P}-card.run{border-color:${accent}88}
  .${P}-card.run .${P}-hd .ic{color:${accent}}
  .${P}-hd .st.run{color:${accent};border-color:${accent}88;background:${accent}18}
  .${P}-hd .st.done{color:${GREEN};border-color:${GREEN}88;background:${GREEN}18}

  .${P}-chain{display:flex;gap:6px;flex-wrap:nowrap}
  .${P}-tk{flex:1;min-width:0;height:38px;border-radius:9px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);display:flex;align-items:center;justify-content:center;font-family:var(--font-tc);font-size:15px;color:rgba(255,255,255,.18);transition:all .28s ${EASE}}
  .${P}-tk.lit{border-color:${accent};background:${accent}22;color:var(--text);box-shadow:0 0 14px -2px ${accent}88}
  .${P}-out{font-size:15px;line-height:1.5;color:var(--text-dim);display:flex;align-items:center;gap:8px;min-height:24px;transition:color .35s}
  .${P}-out s{text-decoration:none;font-family:var(--font-mono);font-size:11.5px;letter-spacing:.14em;color:var(--text-dim);flex:none}
  .${P}-out.fresh{color:${GREEN}}
  .${P}-meta{font-size:14px;color:var(--text-dim);display:flex;align-items:center;gap:7px}
  .${P}-meta b{font-family:var(--font-mono);font-size:16px;color:var(--text)}

  .${P}-sw{display:flex;align-items:center;gap:12px;padding:11px 13px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.03);text-align:left;font-family:var(--font-tc);transition:all .35s ${EASE}}
  .${P}-sw .tx{min-width:0}
  .${P}-sw .tx b{display:block;font-size:15.5px;color:var(--text);line-height:1.3}
  .${P}-sw .tx i{display:block;font-style:normal;font-family:var(--font-mono);font-size:11.5px;letter-spacing:.1em;color:var(--text-dim);margin-top:3px}
  .${P}-sw.dead{border-style:dashed;cursor:not-allowed;opacity:.72}
  .${P}-sw.dead .slot{width:44px;height:26px;flex:none;border-radius:999px;border:1px dashed ${RED}88;display:flex;align-items:center;justify-content:center;color:${RED}}
  .${P}-sw.dead .slot>svg{width:15px;height:15px}
  .${P}-sw.dead .tx i{color:${RED}}
  .${P}-sw.live{cursor:pointer}
  .${P}-sw.live:hover{border-color:var(--text)}
  .${P}-sw.live.on{border-color:${AMBER}99;background:${AMBER}12}
  .${P}-tg{width:44px;height:26px;flex:none;border-radius:999px;background:rgba(255,255,255,.1);border:1px solid var(--line);position:relative;transition:background .35s ${EASE},border-color .35s}
  .${P}-tg i{position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:var(--text-dim);transition:left .35s ${EASE},background .35s}
  .${P}-sw.live.on .${P}-tg{background:${AMBER}55;border-color:${AMBER}}
  .${P}-sw.live.on .${P}-tg i{left:20px;background:${AMBER}}

  .${P}-tl{display:flex;flex-direction:column;gap:8px}
  .${P}-tlhd{display:flex;align-items:baseline;gap:11px;font-size:15px;color:var(--text-dim)}
  .${P}-tlhd b{font-size:16px;color:var(--text)}
  .${P}-track{position:relative;height:88px;border-radius:12px;border:1px solid var(--line);background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.015))}
  .${P}-track::after{content:'';position:absolute;left:0;right:0;bottom:22px;height:1px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.18) 0 5px,transparent 5px 12px)}
  .${P}-head{position:absolute;top:6px;bottom:6px;width:2px;border-radius:2px;background:${accent};box-shadow:0 0 14px ${accent};transform:translateX(-1px);z-index:4}
  .${P}-head::before{content:'';position:absolute;top:-4px;left:50%;width:8px;height:8px;border-radius:50%;background:${accent};box-shadow:0 0 12px ${accent};transform:translateX(-50%)}
  .${P}-mk{position:absolute;bottom:8px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:4px;z-index:3;pointer-events:none}
  .${P}-mk em{font-style:normal;font-family:var(--font-mono);font-size:11px;letter-spacing:.1em;color:${AMBER};white-space:nowrap}
  .${P}-mk .pin{width:11px;height:11px;border-radius:3px;background:${AMBER};transform:rotate(45deg);box-shadow:0 0 10px ${AMBER}88;transition:transform .3s ${EASE},box-shadow .3s}
  .${P}-mk.manual em{color:${accent}}
  .${P}-mk.manual .pin{background:${accent};box-shadow:0 0 10px ${accent}88}
  .${P}-mk.hit .pin{transform:rotate(45deg) scale(1.5);box-shadow:0 0 20px ${AMBER}}
  .${P}-tlnote{position:absolute;left:50%;top:18px;transform:translateX(-50%);font-size:14.5px;color:var(--text-dim);white-space:nowrap;transition:opacity .4s}

  .${P}-detail{margin-top:12px;padding:12px 16px;border-radius:12px;border:1px dashed var(--line);background:rgba(255,255,255,.03);font-size:15.5px;line-height:1.55;color:var(--text);min-height:54px;display:flex;align-items:center}
  .${P}-detail b{color:var(--accent)}
  /* 絕對定位又掛在 .ds-body 血緣下 → 必須 width:max-content;margin:0，否則被置中規則撐出橫向捲動 */
  .${P}-ghost{position:absolute;z-index:40;width:max-content;max-width:min(340px,42vw);margin:0;font-family:var(--font-tc);font-size:14.5px;line-height:1.45;padding:9px 13px;border-radius:11px;background:rgba(14,17,24,.97);border:1px solid var(--accent);color:var(--text);box-shadow:0 16px 38px -18px #000;pointer-events:none}
  .${P}-ghost.warn{border-color:${RED};color:${RED}}
  .${P}-ghost.amber{border-color:${AMBER};color:${AMBER}}
  @media (max-width:900px){
    .${P}-row{grid-template-columns:1fr}
    .${P}-freq{margin-left:0}
    .${P}-tk{font-size:13px;height:32px}
  }
  `
  el.appendChild(style)

  /* ---------- 場景 DOM ---------- */
  const top = document.createElement('div')
  top.className = `${P}-top ds-unit`
  top.innerHTML = `
    <button class="${P}-btn primary" data-b="send" type="button"><span class="ic">${IC.send}</span>送一句話進去</button>
    <button class="${P}-btn hide" data-b="power" type="button"><span class="ic">${IC.power}</span>機器：開著</button>
    <button class="${P}-btn hide" data-b="reset" type="button">重來</button>
    <div class="${P}-freq hide"><span>排程頻率</span><div class="${P}-seg">${
      FREQ.map((f, i) => `<button type="button" data-f="${i}">${f.label}</button>`).join('')}</div></div>`

  const machine = document.createElement('div')
  machine.className = `${P}-machine`
  machine.innerHTML = `
    <span class="${P}-mtag">執行環境 · 你的機器</span>
    <div class="${P}-row">
      <div class="${P}-card ds-unit" data-engine>
        <div class="${P}-hd"><span class="ic">${IC.chain}</span><b>Agent · 文字接龍引擎</b>
          <span class="st" data-state>IDLE · 沒在跑</span></div>
        <div class="${P}-chain">${TOKENS.map(t => `<span class="${P}-tk">${t}</span>`).join('')}</div>
        <div class="${P}-out" data-out><s>OUTPUT</s><span data-outtx>—</span></div>
        <div class="${P}-meta"><span class="ic" style="width:15px;height:15px">${IC.cpu}</span>被叫醒次數 <b data-count>0</b> 次</div>
      </div>
      <div class="${P}-card ds-unit" data-switches>
        <div class="${P}-hd"><span class="ic">${IC.clock}</span><b>兩個開關</b></div>
        <div class="${P}-sw dead" data-sw="agent">
          <span class="slot">${IC.ban}</span>
          <span class="tx"><b>Agent 的開關</b><i>不存在 · 按不下去</i></span>
        </div>
        <button class="${P}-sw live" type="button" data-sw="sched">
          <span class="${P}-tg"><i></i></span>
          <span class="tx"><b>排程的開關</b><i data-schedst>SCHEDULE / ROUTINE · 關</i></span>
        </button>
      </div>
    </div>
    <div class="${P}-tl ds-unit">
      <div class="${P}-tlhd"><b>事件時間軸</b><span data-tlhint>誰在送觸發事件進來</span></div>
      <div class="${P}-track" data-track>
        <span class="${P}-tlnote" data-tlnote>沒有任何觸發事件 — 它不會動</span>
        <i class="${P}-head" data-head></i>
      </div>
    </div>
    <div class="${P}-veil" data-veil><span><span class="ic">${IC.power}</span>機器沒開 — 接不了龍</span></div>`

  const detail = document.createElement('div')
  detail.className = `${P}-detail ds-unit`
  detail.innerHTML = DETAIL.idle

  /* ---------- 狀態 ---------- */
  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  const q = s => machine.querySelector(s)
  const trackEl = q('[data-track]'), headEl = q('[data-head]'), veilEl = q('[data-veil]')
  const engineEl = q('[data-engine]'), stateEl = q('[data-state]')
  const outEl = q('[data-out]'), outTx = q('[data-outtx]'), countEl = q('[data-count]')
  const swSched = q('[data-sw="sched"]'), swAgent = q('[data-sw="agent"]')
  const schedSt = q('[data-schedst]'), tlNote = q('[data-tlnote]'), tlHint = q('[data-tlhint]')
  const tokEls = [...machine.querySelectorAll(`.${P}-tk`)]
  const ctlBtn = b => top.querySelector(`[data-b="${b}"]`)

  let machineOn = true, schedOn = false, freq = 1
  let tPos = 0, woke = 0, outIdx = 0, noteMuted = false
  let raf = 0, last = 0, stage = null

  /* ---------- 觸發點 ---------- */
  function renderMarks({ fly = false } = {}) {
    trackEl.querySelectorAll(`.${P}-mk[data-s]`).forEach(m => m.remove())
    if (!schedOn) return
    FREQ[freq].at.forEach((p, i) => {
      const m = document.createElement('span')
      m.className = `${P}-mk`
      m.dataset.s = p
      m.style.left = `${p * 100}%`
      m.innerHTML = `<em>${FREQ[freq].label}</em><i class="pin"></i>`
      trackEl.appendChild(m)
      if (fly) enterFly(m, { y: -14, dur: 460, delay: i * 90 })
    })
  }
  const schedMark = p => trackEl.querySelector(`.${P}-mk[data-s="${p}"]`)

  function dropManualMark() {
    const m = document.createElement('span')
    m.className = `${P}-mk manual hit`
    m.style.left = `${tPos * 100}%`
    m.innerHTML = `<em>你送的</em><i class="pin"></i>`
    trackEl.appendChild(m)
    enterFly(m, { y: -16, dur: 380 })
    T(() => m.classList.remove('hit'), 520)
    T(() => {
      m.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400 }).onfinish = () => m.remove()
    }, 3000)
  }

  /* ---------- 接龍 ---------- */
  function runAgent() {
    if (!machineOn) return
    clearChainTimers()
    engineEl.classList.add('run')
    stateEl.textContent = 'RUNNING · 接龍中'
    stateEl.className = 'st run'
    outEl.classList.remove('fresh')
    tokEls.forEach(t => t.classList.remove('lit'))
    tokEls.forEach((t, i) => chainT(() => { t.classList.add('lit'); pop(t, 1.14) }, 60 + i * 105))
    const endAt = 60 + tokEls.length * 105
    chainT(() => {
      outTx.textContent = OUTPUTS[outIdx++ % OUTPUTS.length]
      outEl.classList.add('fresh')
      enterFly(outEl, { y: 6, dur: 320 })
      woke += 1
      countUp(countEl, woke, { from: woke - 1, dur: 420 })
      stateEl.textContent = 'DONE · 做完就停'
      stateEl.className = 'st done'
    }, endAt + 90)
    chainT(() => {
      tokEls.forEach((t, i) => chainT(() => t.classList.remove('lit'), i * 34))
      engineEl.classList.remove('run')
      outEl.classList.remove('fresh')
      stateEl.textContent = 'IDLE · 沒在跑'
      stateEl.className = 'st'
    }, endAt + 900)
  }
  const chainTimers = new Set()
  function chainT(fn, ms) {
    const id = setTimeout(() => { chainTimers.delete(id); fn() }, ms)
    chainTimers.add(id); timers.add(id); return id
  }
  function clearChainTimers() { chainTimers.forEach(clearTimeout); chainTimers.clear() }

  function stopAgent() {
    clearChainTimers()
    engineEl.classList.remove('run')
    tokEls.forEach(t => t.classList.remove('lit'))
    stateEl.textContent = 'IDLE · 沒在跑'
    stateEl.className = 'st'
  }

  /* ---------- 時間軸 rAF ---------- */
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (machineOn) {
      const prev = tPos
      tPos = (tPos + dt / LOOP_SEC) % 1
      if (schedOn) {
        for (const p of FREQ[freq].at) {
          const crossed = tPos >= prev ? (p > prev && p <= tPos) : (p > prev || p <= tPos)
          if (crossed) {
            const m = schedMark(p)
            if (m) { m.classList.add('hit'); T(() => m.classList.remove('hit'), 480) }
            runAgent()
          }
        }
      }
      headEl.style.left = `${tPos * 100}%`
    }
    raf = requestAnimationFrame(tick)
  }

  /* ---------- render ---------- */
  function render() {
    machine.classList.toggle('off', !machineOn)
    veilEl.classList.toggle('on', !machineOn)
    swSched.classList.toggle('on', schedOn)
    schedSt.textContent = `SCHEDULE / ROUTINE · ${schedOn ? '開' : '關'}`
    tlNote.textContent = '沒有任何觸發事件 — 它不會動'
    tlNote.style.opacity = (schedOn || noteMuted) ? '0' : '1'
    tlHint.textContent = schedOn ? `排程正在給節奏 · ${FREQ[freq].label}觸發一次` : '誰在送觸發事件進來'
    ctlBtn('power').innerHTML = `<span class="ic">${IC.power}</span>機器：${machineOn ? '開著' : '關機'}`
    ctlBtn('power').classList.toggle('dead', !machineOn)
    top.querySelectorAll('[data-f]').forEach(b => b.classList.toggle('on', +b.dataset.f === freq))
    detail.innerHTML = !machineOn ? DETAIL.off : schedOn ? DETAIL.sched : DETAIL.idle
  }

  function setSched(on, { fly = false } = {}) {
    schedOn = on
    renderMarks({ fly })
    render()
  }
  function setPower(on) {
    machineOn = on
    if (!on) stopAgent()
    render()
  }

  /* ---------- ghost（一律掛在 machine 直接子層：不吃 .off 的 filter） ---------- */
  function ghost(html, { x, y, rx, cx, cy, cls = '', life = 2800 } = {}) {
    const g = document.createElement('div')
    g.className = `${P}-ghost ${cls}`
    g.innerHTML = html
    g.style.left = '0px'; g.style.top = '0px'
    machine.appendChild(g)
    const gx = cx != null ? cx - g.offsetWidth / 2 : rx != null ? rx - g.offsetWidth : x
    const gy = cy != null ? cy - g.offsetHeight / 2 : y
    g.style.left = `${Math.max(6, Math.min(gx, machine.clientWidth - g.offsetWidth - 6))}px`
    g.style.top = `${Math.max(2, Math.min(gy, machine.clientHeight - g.offsetHeight - 2))}px`
    enterFly(g, { y: 10, dur: 400 })
    if (life) T(() => { g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320 }).onfinish = () => g.remove() }, life)
    return g
  }
  const clearGhosts = () => {
    machine.querySelectorAll(`.${P}-ghost`).forEach(g => g.remove())
    noteMuted = false
  }
  const rectIn = node => {
    const mr = machine.getBoundingClientRect(), nr = node.getBoundingClientRect()
    return { x: nr.left - mr.left, y: nr.top - mr.top, w: nr.width, h: nr.height,
      cx: nr.left - mr.left + nr.width / 2, cy: nr.top - mr.top + nr.height / 2, b: nr.bottom - mr.top }
  }
  // 引擎旁註：落在（此時已 dim 的）右欄，不擋任何亮著的文字
  function engineGhost(html, cls, life = 2800) {
    const e = rectIn(engineEl), s = rectIn(q('[data-switches]'))
    return ghost(html, { cx: s.cx, cy: e.cy, cls, life })
  }
  // 「Agent 的開關」旁註：貼齊那格左側（落在左欄，不擋住旁邊真正能撥的排程開關）
  function agentGhost() {
    const a = rectIn(swAgent), e = rectIn(engineEl)
    return ghost('沒有這個東西 —— Agent 沒有開關',
      { rx: Math.max(a.x - 10, e.x + 120), cy: a.cy, cls: 'warn', life: 2600 })
  }
  // 時間軸註解：壓在軌道上緣（觸發點在下半部），並暫時收掉軌道內的提示字
  function trackGhost(html, cls, life = 3000) {
    const r = rectIn(trackEl)
    noteMuted = true; render()
    T(() => { noteMuted = false; render() }, life)
    return ghost(html, { cx: r.cx, y: r.y + 6, cls, life })
  }

  /* ---------- 重置 / sandbox ---------- */
  function setInteractive(on) {
    ctlBtn('power').classList.toggle('hide', !on)
    ctlBtn('reset').classList.toggle('hide', !on)
    top.querySelector(`.${P}-freq`).classList.toggle('hide', !on)
  }
  // 每個導演拍的共同開場：收乾淨上一拍留下的東西、收回 sandbox 控制列
  function prep() {
    clearT(); clearChainTimers(); clearGhosts()
    setInteractive(false)
    stopAgent()
    machineOn = true
  }
  function resetScene() {
    clearT(); clearChainTimers(); clearGhosts()
    machineOn = true; schedOn = false; freq = 1
    woke = 0; outIdx = 0; tPos = 0
    countEl.textContent = '0'
    outTx.textContent = '—'
    outEl.classList.remove('fresh')
    stopAgent()
    setInteractive(false)
    renderMarks()
    render()
    headEl.style.left = '0%'
  }
  function startSandboxRun() {
    resetScene()
    setSched(true, { fly: true })
    setInteractive(true)
    enterFly(machine, { y: 14, dur: 480 })
    enterFly(detail, { y: 10, dur: 480, delay: 120 })
  }

  /* ---------- 互動 ---------- */
  top.addEventListener('click', e => {
    const f = e.target.closest('[data-f]')
    if (f) { pop(f); freq = +f.dataset.f; renderMarks({ fly: true }); render(); return }
    const b = e.target.closest('[data-b]')
    if (!b) return
    pop(b)
    if (b.dataset.b === 'send') {
      if (!machineOn) { shake(b); shake(veilEl.firstElementChild); return }
      dropManualMark(); runAgent()
    } else if (b.dataset.b === 'power') {
      setPower(!machineOn)
      if (!machineOn) shake(machine)
    } else if (b.dataset.b === 'reset') {
      startSandboxRun()
    }
  })
  machine.addEventListener('click', e => {
    const s = e.target.closest('[data-sw]')
    if (!s) return
    if (s.dataset.sw === 'agent') {
      shake(s); clearGhosts(); render(); agentGhost()
      return
    }
    pop(s.querySelector(`.${P}-tg`), 1.14)
    setSched(!schedOn, { fly: true })
    if (!schedOn) stopAgent()
  })

  /* ---------- beats ---------- */
  const beats = [
    {
      narration: '這就是一隻 Agent —— 一台<b>文字接龍引擎</b>。時間軸上沒有任何觸發事件，所以它<b>靜止</b>：不是待命，是根本沒在跑。',
      focus: [`[data-engine]`, `.${P}-tl`], nextLabel: '送一句話進去 →',
      enter() {
        resetScene()
        T(() => engineGhost('它不是在待命 —— 是根本沒有進程在跑'), 900)
      },
    },
    {
      narration: '送一句話進去，它才接一次龍 —— 接完、吐出結果，然後<b>整排熄掉、回到靜止</b>。有輸入才有輸出，做完就停。',
      focus: [`.${P}-top`, `[data-engine]`, `.${P}-tl`], nextLabel: '那為什麼有的會自己動？ →',
      enter() {
        prep()
        schedOn = false; freq = 1; tPos = 0; headEl.style.left = '0%'
        renderMarks(); render()
        T(() => { dropManualMark(); runAgent() }, 700)
        T(() => engineGhost('做完就停 · 背景沒有任何東西還在跑', 'amber', 3200), 3100)
      },
    },
    {
      narration: '有些 Agent 好像會「自己動起來」—— 因為<b>有人另外給了它節奏</b>。那個東西叫<b>排程</b>：網頁版是 Schedule，Code 版是 Routine。',
      focus: [`.${P}-tl`, `[data-switches]`], nextLabel: '所以開關在哪？ →',
      enter() {
        prep()
        freq = 1; tPos = 0; headEl.style.left = '0%'
        setSched(false)
        T(() => {
          setSched(true, { fly: true })
          pop(swSched.querySelector(`.${P}-tg`), 1.16)
          trackGhost('排程給了節奏 —— 時間軸上長出週期性的觸發點', 'amber', 3000)
        }, 700)
      },
    },
    {
      narration: '看清楚這兩個開關：<b>Agent 的開關根本不存在</b>，按不下去。有開關的是<b>排程</b> —— 撥掉它，觸發點全部消失，Agent 從此不再醒來。',
      focus: [`[data-switches]`, `.${P}-tl`], nextLabel: '那要它徹底停呢？ →',
      enter() {
        prep()
        freq = 1
        setSched(true)
        T(() => { shake(swAgent); agentGhost() }, 800)
        T(() => {
          setSched(false, { fly: false }); stopAgent()
          pop(swSched.querySelector(`.${P}-tg`), 1.2)
          trackGhost('觸發點沒了 —— 播放頭再怎麼掃，它都不會醒', 'warn', 3400)
        }, 3300)
      },
    },
    {
      narration: '要它徹底停？<b>關機就好</b> —— 機器沒開，排程也觸發不了，連接龍的機會都沒有。（這正是概念 23 問的：它在哪裡跑。）',
      focus: [`.${P}-machine`], nextLabel: '換我玩 →',
      enter() {
        prep()
        freq = 0
        setSched(true, { fly: false })
        T(() => {
          setPower(false)
          shake(machine)
          trackGhost('播放頭停住 · 排程也叫不動它', 'warn', 3600)
        }, 1100)
      },
    },
    {
      narration: '換你玩 —— 送訊息、開關排程、調頻率、關機。順便找找 Agent 的開關。',
      sandbox: true,
      enter() { startSandboxRun() },
    },
  ]

  stage = createStage(el, ctx, { beats })
  stage.body.append(top, machine, detail)

  last = performance.now()
  raf = requestAnimationFrame(tick)

  return () => {
    clearT(); clearChainTimers(); cancelAnimationFrame(raf)
    stage.destroy(); style.remove()
  }
}
