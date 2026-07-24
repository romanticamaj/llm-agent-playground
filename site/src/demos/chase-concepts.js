// Demo：別追工具，追概念（Chase Concepts）— DemoStage 導演版
// 5 拍：工具雨堆積焦慮｜放下工具全變灰沉底｜概念石柱浮出發光｜時間快轉工具更替概念不動｜sandbox 點工具連到底層概念。
import { createStage, pop, shake, enterFly, countUp, confettiBurst } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const GRAY = '#565d70'
const CONCEPTS = ['Stateless', 'Context', 'Tool Use', 'Memory', 'Harness']
// sandbox 的 10 顆常見工具，前面 beats 的工具雨也用這批當開頭
const TOOLS10 = ['Claude Code', 'Cursor', 'ChatGPT', 'Codex', 'Gemini CLI',
  'GitHub Copilot', 'LangChain', 'n8n', 'OpenClaw', 'Manus']
const RAIN_TOOLS = [...TOOLS10, 'Devin', 'AutoGen', 'CrewAI', 'Dify', 'Cline',
  'Windsurf', 'Bolt', 'v0', 'Replit', 'Aider', 'Continue', 'LlamaIndex',
  'Flowise', 'Zapier', 'Make', 'Perplexity']
// 兩批「未來工具名」給快轉用
const FUTURE_TOOLS = [
  ['Nexus', 'Forge', 'Atlas', 'Quill', 'Vex', 'Orbit', 'Prism', 'Loom'],
  ['Zenith', 'Pulse', 'Drift', 'Ember', 'Nova', 'Relay', 'Sift', 'Cobalt'],
]
// sandbox：工具 → 對應概念索引（概念柱：0 Stateless｜1 Context｜2 Tool Use｜3 Memory｜4 Harness）+ 一句概念組成
const MAP = [
  { name: 'Claude Code', to: [1, 2, 4], desc: '把整個 repo 當上下文、直接改檔跑指令，還跑在官方 harness 上。' },
  { name: 'Cursor', to: [1, 2], desc: '讀你的專案當上下文，能直接改檔案、跑編輯動作。' },
  { name: 'ChatGPT', to: [0, 1], desc: '本質是無狀態的接龍，靠你貼進去的上下文來回答。' },
  { name: 'Codex', to: [2, 4], desc: '會實際執行工具與指令，跑在一套代理 harness 裡。' },
  { name: 'Gemini CLI', to: [2, 1], desc: '在終端機讀專案上下文，並實際呼叫工具動手做。' },
  { name: 'GitHub Copilot', to: [1], desc: '主要靠當下檔案的上下文補全，工具與記憶都很薄。' },
  { name: 'LangChain', to: [4, 3], desc: '一套把記憶與流程串起來的 harness 框架。' },
  { name: 'n8n', to: [2, 4], desc: '用節點式 harness 把各種工具串成自動化流程。' },
  { name: 'OpenClaw', to: [3, 4, 2], desc: '有長期記憶、跑在自己的 harness 上、還會實際操作工具。' },
  { name: 'Manus', to: [2, 4], desc: '自主代理 harness，會自己規劃並實際呼叫工具完成任務。' },
]

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#8ea9e8'

  const style = document.createElement('style')
  style.textContent = `
  .cc-scene{position:relative;height:clamp(320px,56vh,480px);border-radius:16px;overflow:hidden;
    background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(0,0,0,.28));border:1px solid var(--line);margin-bottom:14px}
  .cc-cap{position:absolute;font-family:var(--font-mono);font-size:14px;color:var(--text);white-space:nowrap;
    padding:6px 13px;border-radius:999px;background:rgba(20,24,34,.9);border:1px solid ${accent}66;
    box-shadow:0 0 14px ${accent}33;transform:translateY(-560px);transition:transform 1.1s cubic-bezier(.4,.7,.3,1),opacity .6s,filter .6s,background .6s;z-index:5}
  .cc-cap.sunk{filter:grayscale(1) brightness(.55);border-color:${GRAY}66;box-shadow:none;color:#9aa0af;opacity:.7}
  .cc-cap.fade{opacity:0;transform:translateY(40px) scale(.9)}
  .cc-pillars{position:absolute;left:0;right:0;bottom:0;height:74%;display:flex;align-items:flex-end;
    justify-content:center;gap:clamp(10px,2.2vw,26px);padding:0 22px 0;z-index:8;pointer-events:none}
  .cc-pillar{position:relative;width:clamp(70px,13vw,124px);border-radius:12px 12px 0 0;
    background:linear-gradient(180deg,rgba(20,26,38,.95),rgba(14,18,26,.98));border:1.5px solid ${accent}55;
    border-bottom:none;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;
    padding:14px 6px 16px;opacity:0;transform:translateY(120%);transition:transform .9s ${EASE},opacity .7s,box-shadow .5s,border-color .5s}
  .cc-pillar .cc-h{height:clamp(90px,20vh,180px)}
  .cc-pillar.up{opacity:1;transform:translateY(0);box-shadow:0 0 26px -6px ${accent}55,inset 0 0 24px ${accent}18}
  .cc-pillar.hot{border-color:${accent};box-shadow:0 0 40px -4px ${accent}aa,inset 0 0 30px ${accent}33}
  .cc-pillar.cool{opacity:.4}
  .cc-pk{font-family:var(--font-mono);font-size:clamp(12.5px,1.3vw,15.5px);font-weight:600;color:var(--text);
    letter-spacing:.02em;text-align:center;line-height:1.3}
  .cc-pillar .cc-dot{width:9px;height:9px;border-radius:50%;background:${accent};margin-bottom:9px;box-shadow:0 0 10px ${accent}}
  .cc-svg{position:absolute;inset:0;z-index:9;pointer-events:none;overflow:visible}
  .cc-svg path{stroke:${accent};stroke-width:2;fill:none;stroke-linecap:round;filter:drop-shadow(0 0 5px ${accent}aa)}
  .cc-counter{display:flex;align-items:baseline;gap:12px;justify-content:center;font-family:var(--font-mono)}
  .cc-counter .n{font-size:38px;font-weight:700;color:${accent};transition:color .4s}
  .cc-counter.hurt .n{color:#f87171}
  .cc-counter .lb{font-size:15px;color:var(--text-dim)}
  .cc-year{position:absolute;top:14px;left:18px;font-family:var(--font-mono);font-size:16px;color:var(--text-dim);
    padding:6px 14px;border-radius:999px;background:rgba(10,12,18,.7);border:1px solid var(--line);opacity:0;transition:opacity .5s;z-index:11}
  .cc-year b{color:var(--text);font-size:18px}
  .cc-ctrls{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:14px}
  .cc-btn{font-family:var(--font-tc);font-size:15.5px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:9px 18px;cursor:pointer;transition:all .25s ${EASE}}
  .cc-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .cc-btn.primary{background:var(--accent);color:#08090a;border-color:var(--accent);font-weight:600}
  .cc-btn.hide{display:none}
  .cc-tool{font-family:var(--font-mono);font-size:15px;color:var(--text);background:rgba(20,24,34,.9);
    border:1.5px solid ${accent}55;border-radius:999px;padding:9px 18px;cursor:pointer;transition:all .2s ${EASE}}
  .cc-tool:hover{transform:translateY(-2px);border-color:${accent}}
  .cc-tool.on{background:var(--accent);color:#08090a;border-color:var(--accent);font-weight:600}
  .cc-sandbox{position:absolute;top:16px;left:0;right:0;padding:0 18px;z-index:12;
    display:flex;flex-direction:column;align-items:center;gap:11px}
  .cc-toolrow{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
  .cc-sandbox .cc-tool{font-size:14px;padding:7px 14px}
  .cc-desc{font-family:var(--font-tc);font-size:14.5px;color:var(--text-dim);text-align:center;
    max-width:min(660px,94%);line-height:1.55;min-height:22px}
  .cc-desc b{color:${accent};font-family:var(--font-mono);font-size:14px}
  .cc-desc .hint{opacity:.72}
  `
  el.appendChild(style)

  const scene = document.createElement('div')
  scene.className = 'cc-scene ds-unit'
  scene.innerHTML = `
    <div class="cc-year">西元 <b class="yr">2023</b> 年</div>
    <div class="cc-rain"></div>
    <svg class="cc-svg" preserveAspectRatio="none"></svg>
    <div class="cc-pillars">${CONCEPTS.map((c, i) => `
      <div class="cc-pillar" data-i="${i}"><span class="cc-dot"></span><div class="cc-h"></div><span class="cc-pk">${c}</span></div>`).join('')}
    </div>`

  const counter = document.createElement('div')
  counter.className = 'cc-counter ds-unit'
  counter.innerHTML = `<span class="n">0</span><span class="lb">個新工具冒出來 · 這禮拜</span>`

  const ctrls = document.createElement('div')
  ctrls.className = 'cc-ctrls ds-unit'
  ctrls.innerHTML = `<button class="cc-btn primary hide" data-b="drop">放下工具</button>
    <button class="cc-btn hide" data-b="reset">重來</button>`

  let stage
  const rain = scene.querySelector('.cc-rain')
  const svg = scene.querySelector('.cc-svg')
  const yrWrap = scene.querySelector('.cc-year'), yrEl = scene.querySelector('.yr')
  const nEl = counter.querySelector('.n')
  const pillars = [...scene.querySelectorAll('.cc-pillar')]
  const btn = b => ctrls.querySelector(`[data-b="${b}"]`)

  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }
  let spawnLoop = null
  const stopSpawn = () => { if (spawnLoop) { clearInterval(spawnLoop); spawnLoop = null } }

  const NCOL = 8
  let colH = new Array(NCOL).fill(0)
  let caps = [], count = 0

  function dropCap(label) {
    const c = document.createElement('div')
    c.className = 'cc-cap'
    c.textContent = label
    const col = Math.floor(Math.random() * NCOL)
    const leftPct = (col + 0.5) / NCOL * 100 + (Math.random() * 8 - 4)
    const bottomPx = 8 + colH[col] * 30
    colH[col] = Math.min(colH[col] + 1, 6)
    c.style.left = Math.max(2, Math.min(86, leftPct)) + '%'
    c.style.bottom = bottomPx + 'px'
    rain.appendChild(c)
    void c.offsetWidth
    c.style.transform = 'translateY(0)'
    caps.push(c)
    count++
    nEl.textContent = count
    if (count >= 30) counter.classList.add('hurt')
    pop(nEl, 1.14)
  }

  function startRain(pool) {
    let i = Math.floor(Math.random() * pool.length)
    stopSpawn()
    spawnLoop = setInterval(() => {
      dropCap(pool[i % pool.length]); i++
      if (count > 46) stopSpawn()
    }, 230)
  }

  function sinkAll() {
    stopSpawn()
    caps.forEach((c, i) => T(() => { c.classList.add('sunk'); c.style.bottom = (2 + Math.random() * 14) + 'px'; pop(c, 0.92) }, i * 22))
    shake(scene)
  }

  function raisePillars(hot) {
    pillars.forEach((p, i) => T(() => { p.classList.add('up'); if (hot) p.classList.add('hot') }, i * 130))
  }

  // sandbox 連線
  function clearLines() { svg.innerHTML = '' }
  function drawLinks(toolEl, idxs) {
    clearLines()
    pillars.forEach((p, i) => p.classList.toggle('cool', !idxs.includes(i)))
    pillars.forEach((p, i) => p.classList.toggle('hot', idxs.includes(i)))
    const sr = scene.getBoundingClientRect()
    const tr = toolEl.getBoundingClientRect()
    const x1 = tr.left + tr.width / 2 - sr.left, y1 = tr.top + tr.height / 2 - sr.top
    idxs.forEach(i => {
      const pr = pillars[i].getBoundingClientRect()
      const x2 = pr.left + pr.width / 2 - sr.left, y2 = pr.top + 10 - sr.top
      const mid = (y1 + y2) / 2
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', `M${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`)
      svg.appendChild(path)
      const len = path.getTotalLength()
      path.style.strokeDasharray = len
      path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 520, easing: EASE, fill: 'backwards' })
      confettiBurst(scene, x2, y2, accent, 12)
    })
  }

  function resetScene() {
    clearT(); stopSpawn()
    caps.forEach(c => c.remove()); caps = []; count = 0; colH = new Array(NCOL).fill(0)
    nEl.textContent = '0'; counter.classList.remove('hurt')
    rain.innerHTML = ''; clearLines()
    pillars.forEach(p => p.classList.remove('up', 'hot', 'cool'))
    yrWrap.style.opacity = '0'; yrEl.textContent = '2023'
    ctrls.querySelectorAll('.cc-btn').forEach(b => b.classList.add('hide'))
  }

  const HINT = '<span class="hint">點任一工具，看它踩在哪幾根概念柱上。</span>'
  function buildSandbox() {
    resetScene()
    // 上方可點工具（10 顆，wrap 排列）＋ 一句概念組成說明
    const panel = document.createElement('div')
    panel.className = 'cc-sandbox'
    const row = document.createElement('div')
    row.className = 'cc-toolrow'
    row.innerHTML = MAP.map((m, i) => `<button class="cc-tool" data-t="${i}">${m.name}</button>`).join('')
    const desc = document.createElement('div')
    desc.className = 'cc-desc'
    desc.innerHTML = HINT
    panel.append(row, desc)
    rain.appendChild(panel)
    pillars.forEach((p, i) => T(() => p.classList.add('up'), i * 80))
    row.querySelectorAll('.cc-tool').forEach(b => {
      enterFly(b, { y: -16, dur: 440, delay: +b.dataset.t * 45 })
      b.onclick = () => {
        row.querySelectorAll('.cc-tool').forEach(x => x.classList.remove('on'))
        b.classList.add('on'); pop(b)
        const m = MAP[+b.dataset.t]
        drawLinks(b, m.to)
        desc.innerHTML = `<b>${m.name}</b> ${m.desc}`
      }
    })
    btn('reset').classList.remove('hide')
    btn('reset').onclick = () => { pop(btn('reset')); row.querySelectorAll('.cc-tool').forEach(x => x.classList.remove('on')); clearLines(); pillars.forEach(p => p.classList.remove('cool', 'hot')); desc.innerHTML = HINT }
  }

  function buildBeats() {
    return [
      { narration: '每個禮拜，都有<b>新工具</b>冒出來 — 追都追不完。', focus: ['.cc-scene', '.cc-counter'], nextLabel: '追不完… →',
        enter() { resetScene(); startRain(RAIN_TOOLS) } },

      { narration: '你<b>追不完的。該追的不是工具。</b>按「放下工具」試試。', focus: ['.cc-scene', '.cc-ctrls'], nextLabel: '放下之後？ →',
        enter() {
          // 承接上一拍的堆積；若太少則補一批
          if (caps.length < 12) startRain(RAIN_TOOLS)
          T(() => stopSpawn(), 1500)
          btn('drop').classList.remove('hide')
          btn('drop').onclick = () => { pop(btn('drop')); sinkAll(); btn('drop').classList.add('hide') }
        } },

      { narration: '沉在底下不變的，是<b>概念層</b> — Stateless、Context、Tool Use、Memory、Harness。', focus: ['.cc-scene'], nextLabel: '概念會過時嗎？ →',
        enter() {
          resetScene()
          // 先鋪一層灰工具沉底，概念柱再浮出
          RAIN_TOOLS.slice(0, 20).forEach((t, i) => T(() => dropCap(t), i * 45))
          T(() => caps.forEach(c => { c.classList.add('sunk'); c.style.bottom = (2 + Math.random() * 12) + 'px' }), 1050)
          T(() => raisePillars(true), 1300)
        } },

      { narration: '工具<b>年年換</b>，概念<b>十年不變</b>。快轉給你看 — 上層一直換，底層不動。', focus: ['.cc-scene'], nextLabel: '換我玩 →',
        enter() {
          resetScene()
          pillars.forEach(p => p.classList.add('up'))
          yrWrap.style.opacity = '1'
          RAIN_TOOLS.slice(0, 8).forEach((t, i) => T(() => dropCap(t), 200 + i * 70))
          const waves = [[2026, RAIN_TOOLS.slice(8, 16)], [2029, FUTURE_TOOLS[0]], [2033, FUTURE_TOOLS[1]]]
          let base = 1250
          waves.forEach(([yr, pool]) => {
            T(() => caps.forEach((c, i) => T(() => c.classList.add('fade'), i * 20)), base)
            T(() => { caps.forEach(c => c.remove()); caps = []; colH = new Array(NCOL).fill(0); countUp(yrEl, yr, { from: +yrEl.textContent, dur: 500, fmt: v => Math.round(v) }); pop(yrWrap) }, base + 650)
            T(() => pool.forEach((t, i) => T(() => dropCap(t), i * 70)), base + 780)
            base += 2050
          })
          T(() => pillars.forEach(p => pop(p)), base)
        } },

      { narration: '點任一<b>工具</b>，看它其實踩在哪幾根<b>概念柱</b>上 — 學會概念，工具自己就會用。', sandbox: true,
        enter() { buildSandbox() } },
    ]
  }

  stage = createStage(el, ctx, { beats: buildBeats() })
  stage.body.append(scene, counter, ctrls)

  return () => { clearT(); stopSpawn(); stage.destroy(); style.remove() }
}
