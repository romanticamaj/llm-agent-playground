// Demo：等待時間就是第二條產線 — Round Robin — DemoStage 導演版
// 5 拍：單一時間軸大段等待｜線性排程一日產出 3｜三泳道輪轉｜快轉一日產出 12｜sandbox 手動調度。
import { createStage, pop, shake, enterFly, countUp, confettiBurst } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const GOLD = '#fbbf24', RED = '#f87171', GREEN = '#4ade80', GRAY = '#4a5163'
const PAT = ['w', 'w', 's', 's', 's', 's', 'w', 'w'] // 每個任務：做2 → 等4 → 做2
const DAY = 30

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'

  const IC = {
    idle: '<circle cx="12" cy="8" r="3.2"/><path d="M6 20a6 6 0 0 1 12 0"/><path d="M15 6.5l2-1M15 9.5l2 1"/>',
    work: '<circle cx="12" cy="8" r="3.2"/><path d="M6 20a6 6 0 0 1 12 0"/><path d="M18 4l2 2l-3 3l-2-2z"/>',
    turn: '<path d="M4 9a8 8 0 0 1 14-4l2 2M20 5v4h-4"/><path d="M20 15a8 8 0 0 1-14 4l-2-2M4 19v-4h4"/>',
  }
  const svg = (p, c = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`

  const style = document.createElement('style')
  style.textContent = `
  .rr-wrap{display:flex;flex-direction:column;gap:16px}
  .rr-wrap svg{width:1.4em;height:1.4em;vertical-align:-.3em}
  .rr-top{display:flex;align-items:center;justify-content:space-between;gap:16px}
  .rr-clock{flex:1;display:flex;align-items:center;gap:12px}
  .rr-clock .cl{font-size:14px;color:var(--text-dim);min-width:66px}
  .rr-daybar{flex:1;height:12px;border-radius:6px;background:rgba(255,255,255,.06);overflow:hidden}
  .rr-dayfill{height:100%;width:0;border-radius:6px;background:${accent};transition:width .2s linear}
  .rr-out{font-family:var(--font-mono);font-weight:700;white-space:nowrap}
  .rr-out b{font-size:30px;color:${GREEN}}.rr-out small{font-size:14px;color:var(--text-dim)}
  .rr-lanes{display:flex;flex-direction:column;gap:12px}
  .rr-lane{position:relative;border:1px solid var(--line);border-radius:14px;padding:12px 16px;
    background:rgba(255,255,255,.03);display:flex;align-items:center;gap:14px;transition:all .3s ${EASE}}
  .rr-lane.active{border-color:${accent};box-shadow:0 0 0 1px ${accent},0 0 22px -6px ${accent}}
  .rr-lane.ready{border-color:${GOLD}88}
  .rr-lane.empty{opacity:.4}
  .rr-worker{flex:none;width:38px;height:38px;border-radius:50%;border:1px solid var(--line);display:flex;
    align-items:center;justify-content:center;color:var(--text-dim);transition:all .3s ${EASE}}
  .rr-lane.active .rr-worker{border-color:${accent};color:${accent};box-shadow:0 0 16px -2px ${accent}}
  .rr-lane.active.waiting .rr-worker{border-color:${GRAY};color:${GRAY};box-shadow:none}
  .rr-body{flex:1;min-width:0}
  .rr-lname{font-size:14.5px;font-weight:600;margin-bottom:7px;display:flex;justify-content:space-between}
  .rr-lname .meta{font-family:var(--font-mono);font-size:12.5px;color:var(--text-dim);font-weight:400}
  .rr-lname .meta b{color:${GREEN}}
  .rr-pips{display:flex;gap:4px}
  .rr-pip{flex:1;height:16px;border-radius:4px;background:rgba(255,255,255,.06);transition:all .25s ${EASE}}
  .rr-pip.w{background:${accent}55}.rr-pip.s{background:${GRAY};opacity:.5}
  .rr-pip.cur{transform:scaleY(1.35)}
  .rr-pip.cur.w{background:${accent};box-shadow:0 0 12px -1px ${accent}}
  .rr-pip.cur.s{background:${GRAY};opacity:.9}
  .rr-pip.filled{background:${accent}}.rr-pip.filled.s{background:${GRAY}66}
  .rr-waittag{position:absolute;right:18px;top:50%;transform:translateY(-50%);font-family:var(--font-mono);
    font-size:12px;letter-spacing:.15em;color:${GRAY};text-transform:uppercase;opacity:0;transition:opacity .3s}
  .rr-lane.waiting .rr-waittag{opacity:1}
  .rr-turn{position:absolute;right:14px;top:50%;transform:translateY(-50%);display:none;align-items:center;gap:6px;
    font-family:var(--font-tc);font-size:14px;font-weight:600;color:#08090a;background:${GOLD};
    border:none;border-radius:999px;padding:7px 15px;cursor:pointer}
  .rr-lane.canturn .rr-turn{display:flex}
  .rr-turn svg{color:#08090a}
  .rr-hint{text-align:center;font-size:14.5px;color:var(--text-dim);min-height:22px}
  .rr-hint b{color:var(--text)}
  .rr-ctrls{display:flex;gap:10px;justify-content:center}
  .rr-btn{font-family:var(--font-tc);font-size:15px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:9px 18px;cursor:pointer;transition:all .25s ${EASE}}
  .rr-btn:hover{border-color:var(--text)}
  .rr-btn.primary{background:${accent};color:#08090a;border-color:${accent};font-weight:600}
  .rr-btn.hide{display:none}
  `
  el.appendChild(style)

  const LANE_NAMES = ['寫程式的 agent', '整理資料的 agent', '查文件的 agent']
  const wrap = document.createElement('div')
  wrap.className = 'rr-wrap'
  wrap.innerHTML = `
    <div class="rr-top ds-unit">
      <div class="rr-clock"><span class="cl">第 <b class="rr-tick">0</b>／${DAY} 刻</span>
        <div class="rr-daybar"><div class="rr-dayfill"></div></div></div>
      <div class="rr-out"><b class="rr-outnum">0</b><small> 件產出</small></div></div>
    <div class="rr-lanes ds-unit"></div>
    <div class="rr-hint ds-unit"></div>`

  const ctrls = document.createElement('div')
  ctrls.className = 'rr-ctrls ds-unit'

  let stage
  const lanesEl = wrap.querySelector('.rr-lanes')
  const tickEl = wrap.querySelector('.rr-tick'), dayfill = wrap.querySelector('.rr-dayfill')
  const outNum = wrap.querySelector('.rr-outnum'), hintEl = wrap.querySelector('.rr-hint')

  // ---- 建三條泳道（DOM 一次蓋好，之後只切 class）----
  const lanes = LANE_NAMES.map((nm, li) => {
    const lane = document.createElement('div'); lane.className = 'rr-lane'
    lane.innerHTML = `
      <div class="rr-worker">${svg(IC.idle)}</div>
      <div class="rr-body">
        <div class="rr-lname"><span>${nm}</span><span class="meta">佇列 <span class="q">0</span>　完成 <b class="dn">0</b></span></div>
        <div class="rr-pips">${PAT.map((p, i) => `<div class="rr-pip ${p}" data-i="${i}"></div>`).join('')}</div></div>
      <span class="rr-waittag">等待中</span>
      <button class="rr-turn" data-l="${li}">${svg(IC.turn)}轉</button>`
    lanesEl.appendChild(lane)
    return { li, el: lane, worker: lane.querySelector('.rr-worker'), pips: [...lane.querySelectorAll('.rr-pip')], qEl: lane.querySelector('.q'), dnEl: lane.querySelector('.dn'), queue: 0, idx: 0, active: null, done: 0 }
  })

  // ---- 時鐘 ----
  let raf = null
  function stopClock() { if (raf) cancelAnimationFrame(raf); raf = null }
  function runClock(tickMs, steps, onTick, onEnd) {
    stopClock(); let acc = 0, last = performance.now(), n = 0
    const loop = now => {
      acc += now - last; last = now
      while (acc >= tickMs && n < steps) { acc -= tickMs; n++; onTick(n) }
      if (n < steps) raf = requestAnimationFrame(loop)
      else { raf = null; onEnd && onEnd() }
    }
    raf = requestAnimationFrame(loop)
  }

  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  let worker = -1, output = 0

  function resetEngine(queues) {
    stopClock()
    worker = -1; output = 0
    lanes.forEach((L, i) => {
      L.queue = queues[i] || 0; L.done = 0
      L.active = L.queue > 0 ? (L.queue--, true) : null
      L.idx = 0
      L.el.classList.remove('active', 'waiting', 'ready', 'canturn', 'empty')
      renderLane(L)
    })
    outNum.textContent = '0'; tickEl.textContent = '0'; dayfill.style.width = '0%'
  }

  function renderLane(L) {
    L.qEl.textContent = L.queue; L.dnEl.textContent = L.done
    L.el.classList.toggle('empty', !L.active)
    L.pips.forEach((pip, i) => {
      pip.className = 'rr-pip ' + PAT[i]
      if (!L.active) return
      if (i < L.idx) pip.classList.add('filled')
      if (i === L.idx) pip.classList.add('cur')
    })
    const waiting = L.active && PAT[L.idx] === 's'
    L.el.classList.toggle('waiting', waiting && worker === L.li)
    L.worker.innerHTML = svg(worker === L.li && !waiting ? IC.work : IC.idle)
  }

  // 完成目前任務 → 載入佇列下一個
  function completeTask(L) {
    L.done++; output++
    countUp(outNum, output, { from: output - 1, dur: 300 })
    const r = L.el.getBoundingClientRect(), br = stage.body.getBoundingClientRect()
    confettiBurst(stage.body, r.left - br.left + 40, r.top - br.top + 20, GREEN, 12)
    if (L.queue > 0) { L.queue--; L.active = true; L.idx = 0 }
    else L.active = null
  }

  // 一刻：背景等待全體推進；worker 那條若在 work 才推進工作
  function engineTick() {
    lanes.forEach(L => { if (L.active && PAT[L.idx] === 's') L.idx++ }) // 等待在背景平行流逝
    if (worker >= 0) {
      const L = lanes[worker]
      if (L.active && PAT[L.idx] === 'w') {
        L.idx++
        if (L.idx >= PAT.length) completeTask(L)
      }
    }
    lanes.forEach(renderLane)
  }

  function laneWorkable(L) { return L.active && PAT[L.idx] === 'w' }
  function setWorker(li, { glow = true } = {}) {
    worker = li
    lanes.forEach(L => L.el.classList.toggle('active', L.li === li))
    if (glow && li >= 0) { pop(lanes[li].el); const r = lanes[li].worker.getBoundingClientRect(), br = stage.body.getBoundingClientRect(); confettiBurst(stage.body, r.left - br.left + 18, r.top - br.top + 18, accent, 8) }
    lanes.forEach(renderLane)
  }

  function advanceClock(n) { tickEl.textContent = n; dayfill.style.width = (n / DAY * 100) + '%' }

  // ---------- 自動輪轉（B3/B4）----------
  function autoRR(tickMs, onEnd) {
    resetEngine([4, 4, 4]); setWorker(0, { glow: false })
    runClock(tickMs, DAY, n => {
      // 若 worker 那條不能做（進入等待或空了）→ 轉到下一條就緒的
      if (worker < 0 || !laneWorkable(lanes[worker])) {
        for (let k = 1; k <= 3; k++) { const cand = (worker + k + 3) % 3; if (laneWorkable(lanes[cand])) { setWorker(cand); break } }
      }
      engineTick(); advanceClock(n)
    }, onEnd)
  }

  // ---------- 線性（B2）----------
  function linear(tickMs, onEnd) {
    resetEngine([4, 0, 0]); setWorker(0, { glow: false })
    runClock(tickMs, DAY, n => { engineTick(); advanceClock(n) }, onEnd) // worker 不轉，等待時空等
  }

  // ---------- 單一時間軸（B1）----------
  function singleTrack() {
    resetEngine([1, 0, 0]); lanes[1].el.classList.add('empty'); lanes[2].el.classList.add('empty')
    setWorker(0, { glow: false })
    runClock(360, PAT.length, n => { engineTick(); advanceClock(Math.min(n, DAY)) })
  }

  // ---------- sandbox ----------
  let sandboxOn = false
  function startSandbox() {
    sandboxOn = true
    resetEngine([4, 4, 4]); setWorker(0, { glow: false })
    lanes.forEach(L => { L.el.querySelector('.rr-turn').onclick = () => { if (laneWorkable(L)) { setWorker(L.li); refreshCues() } else shake(L.el) }
      L.el.onclick = e => { if (e.target.closest('.rr-turn')) return; if (laneWorkable(L)) { setWorker(L.li); refreshCues() } } })
    setHint('你是調度員 — 目前這條一進入<b>等待中</b>，就按別條的「轉」把腦袋切過去。別讓自己空等。')
    ctrls.innerHTML = ''
    const reset = mkBtn('重來', ''); reset.onclick = () => { pop(reset); startSandbox() }; ctrls.appendChild(reset)
    runClock(430, DAY, n => {
      engineTick(); advanceClock(n); refreshCues()
    }, () => settle())
  }
  function refreshCues() {
    const workerBusy = worker >= 0 && laneWorkable(lanes[worker])
    lanes.forEach(L => {
      const canGo = laneWorkable(L) && L.li !== worker
      L.el.classList.toggle('canturn', canGo && !workerBusy)
      L.el.classList.toggle('ready', canGo)
    })
  }
  function settle() {
    lanes.forEach(L => { L.el.onclick = null; L.el.classList.remove('canturn', 'ready') })
    const beat = 3
    if (output > beat) { setHint(`一日結束 — 你調度出 <b>${output} 件</b>，線性排程只有 ${beat} 件。<b>等待的時間你拿去做別的了。</b>`); const br = stage.body.getBoundingClientRect(); confettiBurst(stage.body, br.width / 2, br.height / 2, GOLD, 30) }
    else setHint(`一日結束 — 產出 <b>${output} 件</b>。多按幾次「轉」別空等，就能超過線性的 ${beat} 件。`)
    sandboxOn = false
  }

  function setHint(html) { hintEl.innerHTML = html; enterFly(hintEl, { y: 6, dur: 320 }) }
  function mkBtn(label, cls) { const b = document.createElement('button'); b.className = 'rr-btn ' + cls; b.textContent = label; return b }

  function resetScene() { stopClock(); clearT(); worker = -1; output = 0; ctrls.innerHTML = ''; hintEl.innerHTML = ''; lanes.forEach(L => { L.el.onclick = null; const t = L.el.querySelector('.rr-turn'); if (t) t.onclick = null; L.el.classList.remove('active', 'waiting', 'ready', 'canturn', 'empty') }) }

  function buildBeats() {
    return [
      { narration: 'AI 任務丟下去 — 然後呢？<b>等。</b>做一下、就卡進一大段「等待中」，人在旁邊發呆。', focus: ['.rr-lanes'], nextLabel: '一天下來呢？ →',
        enter() { resetScene(); singleTrack(); setHint('一個任務：做一下 → 等一大段 → 再做一下。灰色那截，人是閒著的。') } },
      { narration: '線性排程：一件做完才做下一件，每段等待都在<b>空等</b>。一天下來 — 只出 <b>3 件</b>。', focus: ['.rr-lanes', '.rr-out'], nextLabel: 'Round Robin →',
        enter() { resetScene(); setHint('worker 不切換，等待時就乾等 —'); linear(150, () => setHint('一日結束 — <b>只有 3 件</b>。大半時間耗在等待。')) } },
      { narration: 'Round Robin：等待的那一刻，<b>馬上轉去下一個任務</b>。三條泳道交錯輪轉，切換點發光。', focus: ['.rr-lanes'], nextLabel: '快轉一整天 →',
        enter() { resetScene(); setHint('這條一進入等待，腦袋立刻跳到下一條就緒的 —'); autoRR(300, () => setHint('worker 幾乎沒有空檔 — 等待被別條的工作填滿了。')) } },
      { narration: '開 100 個 session 的人，不是同時面對 100 個 — 是<b>一直轉</b>。快轉一日，產出翻上去。', focus: ['.rr-lanes', '.rr-out'], nextLabel: '換你當調度員 →',
        enter() { resetScene(); setHint('同一顆腦袋，一直轉 —'); autoRR(70, () => { countUp(outNum, 12, { from: output, dur: 900 }); const br = stage.body.getBoundingClientRect(); confettiBurst(stage.body, br.width / 2, br.height / 2, GOLD, 34); setHint('一日 <b>12 件</b> — 同一顆腦袋，靠不停轉，把等待全變成產線。') }) } },
      { narration: '換你當調度員 — 任務進入等待就按<b>「轉」</b>切到就緒的泳道，別空等。撐完一日看產出。', sandbox: true,
        enter() { resetScene(); startSandbox() } },
    ]
  }

  stage = createStage(el, ctx, { beats: buildBeats() })
  stage.body.append(wrap, ctrls)

  return () => { stopClock(); clearT(); lanes.forEach(L => { L.el.onclick = null; const t = L.el.querySelector('.rr-turn'); if (t) t.onclick = null }); stage.destroy(); style.remove() }
}
