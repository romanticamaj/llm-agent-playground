// Demo：Agent 還是 Workflow？ — DemoStage 導演版
// 5 拍：自主性光譜｜拉到 workflow（燈火通明房子）｜拉到 agent（鬼屋迷宮）｜錨點護欄（Human in the Loop）｜sandbox。
// 核心互動保留：autonomy 滑桿即時改路徑/token/可預測性/模糊度 ＋ 四個真實做法錨點的護欄動畫。
import { createStage } from './_stage.js'

const P = 'avw'
export default function mount(el, ctx) {
  const accent = ctx?.accent || '#38e1c6'
  const style = document.createElement('style')
  style.textContent = `
  .${P}-sliderwrap{display:flex;align-items:center;gap:16px;margin-bottom:6px}
  .${P}-endlabel{font-size:16px;font-weight:700;white-space:nowrap;color:#e8ebf2}
  .${P}-endlabel small{display:block;font-size:12px;font-weight:400;color:#7b8296;letter-spacing:.1em}
  .${P}-slider{flex:1;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;
    background:linear-gradient(90deg,#3a6df0,${accent});outline:none;cursor:pointer}
  .${P}-slider::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;
    background:#fff;border:3px solid ${accent};box-shadow:0 0 14px ${accent};cursor:grab}
  .${P}-slider::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#fff;border:3px solid ${accent};cursor:grab}
  .${P}-anchors{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:14px 0 16px}
  .${P}-anchors .demo-btn{font-size:14px;padding:7px 14px}
  .${P}-anchors .demo-btn.on{background:${accent};color:#05060a;border-color:${accent}}
  .${P}-stage{position:relative;border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#0c0f16;overflow:hidden;margin-bottom:16px}
  .${P}-canvas{display:block;width:100%;height:280px}
  .${P}-scene{position:absolute;top:12px;left:14px;font-size:14px;letter-spacing:.04em;color:#cfd4e0;background:rgba(0,0,0,.4);padding:4px 12px;border-radius:8px}
  .${P}-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .${P}-metric{border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 16px;background:rgba(255,255,255,.02)}
  .${P}-metric .lab{font-size:12.5px;color:#8b93a7;letter-spacing:.06em}
  .${P}-metric .val{font-size:26px;font-weight:800;margin:4px 0 8px;font-family:var(--font-en,'Space Grotesk');color:#e8ebf2}
  .${P}-bar{height:8px;border-radius:8px;background:rgba(255,255,255,.08);overflow:hidden}
  .${P}-bar>i{display:block;height:100%;border-radius:8px;transition:width .35s ease,background .35s}
  `
  document.head.appendChild(style)

  const slider = document.createElement('div')
  slider.className = `${P}-sliderwrap ds-unit`
  slider.innerHTML = `
    <div class="${P}-endlabel" style="color:#5b8cff">Workflow<small>燈火通明的房子</small></div>
    <input class="${P}-slider" type="range" min="0" max="100" value="8" />
    <div class="${P}-endlabel" style="color:${accent};text-align:right">Agent<small>鬼屋迷宮</small></div>`

  const anchors = document.createElement('div')
  anchors.className = `${P}-anchors ds-unit`
  anchors.innerHTML = `
    <span style="font-size:14px;color:#7b8296">光譜錨點 →</span>
    <button class="demo-btn" data-a="22">Divide &amp; Conquer</button>
    <button class="demo-btn" data-a="48">Human in the Loop</button>
    <button class="demo-btn" data-a="68">TDD + Autonomous</button>
    <button class="demo-btn" data-a="85">Hook 護欄</button>`

  const stageBox = document.createElement('div')
  stageBox.className = `${P}-stage ds-unit`
  stageBox.innerHTML = `<div class="${P}-scene"></div><canvas class="${P}-canvas"></canvas>`

  const metrics = document.createElement('div')
  metrics.className = `${P}-metrics ds-unit`
  metrics.innerHTML = `
    <div class="${P}-metric"><div class="lab">TOKEN 成本</div><div class="val" data-m="tok">1.0x</div>
      <div class="${P}-bar"><i data-b="tok" style="background:#f87171"></i></div></div>
    <div class="${P}-metric"><div class="lab">可預測性</div><div class="val" data-m="pred">100%</div>
      <div class="${P}-bar"><i data-b="pred" style="background:#4ade80"></i></div></div>
    <div class="${P}-metric"><div class="lab">能處理的任務模糊度</div><div class="val" data-m="amb">低</div>
      <div class="${P}-bar"><i data-b="amb" style="background:${accent}"></i></div></div>`

  let stage
  const inputEl = slider.querySelector(`.${P}-slider`)
  const canvas = stageBox.querySelector(`.${P}-canvas`)
  const sceneLbl = stageBox.querySelector(`.${P}-scene`)
  const anchorBtns = [...anchors.querySelectorAll('.demo-btn')]
  const ctxC = canvas.getContext('2d')

  let a = 0.08, guardType = null, seed = 1, pathSeed = 1, path = [], stubs = [], W = 0, H = 0, dpr = 1, raf = 0, tween = 0, phase = 0
  const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = canvas.clientWidth; H = canvas.clientHeight
    canvas.width = W * dpr; canvas.height = H * dpr
    ctxC.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  function buildPath(newSeed) {
    if (newSeed) pathSeed = (Math.random() * 1e6) | 0
    seed = pathSeed
    const startX = 60, endX = W - 60, midY = H / 2, steps = Math.round(5 + a * 7)
    path = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, x = startX + (endX - startX) * t
      const wobble = (i === 0 || i === steps) ? 0 : (rand() - 0.5) * a * (H * 0.75)
      path.push({ x, y: midY + wobble })
    }
    stubs = []
    const nStub = Math.round(a * a * 10)
    for (let i = 0; i < nStub; i++) {
      const base = path[1 + ((rand() * (path.length - 2)) | 0)]
      stubs.push({ x: base.x, y: base.y, dx: (rand() - .5) * 90, dy: (rand() - .5) * 120 })
    }
  }
  function setMetrics() {
    const tok = 1 + a * a * 14, pred = Math.max(8, Math.round(100 * (1 - a * 0.92))), amb = Math.round(a * 100)
    metrics.querySelector('[data-m="tok"]').textContent = tok.toFixed(1) + 'x'
    metrics.querySelector('[data-m="pred"]').textContent = pred + '%'
    metrics.querySelector('[data-m="amb"]').textContent = amb < 25 ? '低' : amb < 55 ? '中' : amb < 80 ? '高' : '極高'
    metrics.querySelector('[data-b="tok"]').style.width = Math.min(100, (tok / 15) * 100) + '%'
    metrics.querySelector('[data-b="pred"]').style.width = pred + '%'
    metrics.querySelector('[data-b="amb"]').style.width = amb + '%'
    sceneLbl.textContent = a < 0.2 ? '燈火通明的房子 · 每個房間都看得到'
      : a < 0.55 ? '半開放 · 部分路徑交給 AI'
        : '鬼屋迷宮 · 搭著前面遊客的肩膀走'
  }
  function refresh(newSeed) { buildPath(newSeed); setMetrics() }

  function draw() {
    raf = requestAnimationFrame(draw)
    ctxC.clearRect(0, 0, W, H)
    const roomAlpha = Math.max(0, 1 - a * 1.4)
    if (roomAlpha > 0.02 && path.length) {
      for (const p of path) {
        ctxC.fillStyle = `rgba(91,140,240,${0.1 * roomAlpha})`; ctxC.strokeStyle = `rgba(91,140,240,${0.5 * roomAlpha})`; ctxC.lineWidth = 1
        ctxC.fillRect(p.x - 22, p.y - 26, 44, 52); ctxC.strokeRect(p.x - 22, p.y - 26, 44, 52)
        ctxC.fillStyle = `rgba(255,220,140,${0.9 * roomAlpha})`; ctxC.beginPath(); ctxC.arc(p.x, p.y - 14, 3, 0, 7); ctxC.fill()
      }
    }
    ctxC.lineWidth = 1.5
    for (const s of stubs) { ctxC.strokeStyle = 'rgba(248,113,113,.35)'; ctxC.beginPath(); ctxC.moveTo(s.x, s.y); ctxC.lineTo(s.x + s.dx, s.y + s.dy); ctxC.stroke() }
    if (path.length) {
      const g = ctxC.createLinearGradient(path[0].x, 0, path[path.length - 1].x, 0)
      g.addColorStop(0, '#5b8cff'); g.addColorStop(1, accent)
      ctxC.strokeStyle = g; ctxC.lineWidth = 3; ctxC.lineJoin = 'round'
      ctxC.beginPath(); ctxC.moveTo(path[0].x, path[0].y)
      for (let i = 1; i < path.length; i++) ctxC.lineTo(path[i].x, path[i].y)
      ctxC.stroke()
      drawGuards()
      phase = (phase + 0.006) % 1
      const seg = phase * (path.length - 1), i0 = Math.floor(seg), f = seg - i0
      const p0 = path[i0], p1 = path[Math.min(i0 + 1, path.length - 1)]
      ctxC.fillStyle = '#fff'; ctxC.shadowColor = accent; ctxC.shadowBlur = 16
      ctxC.beginPath(); ctxC.arc(p0.x + (p1.x - p0.x) * f, p0.y + (p1.y - p0.y) * f, 6, 0, 7); ctxC.fill(); ctxC.shadowBlur = 0
      label(path[0].x, path[0].y, 'START', '#5b8cff')
      label(path[path.length - 1].x, path[path.length - 1].y, 'PR ✓', accent)
    }
  }
  function label(x, y, txt, col) {
    ctxC.fillStyle = col; ctxC.beginPath(); ctxC.arc(x, y, 7, 0, 7); ctxC.fill()
    ctxC.fillStyle = '#cfd4e0'; ctxC.font = '600 13px sans-serif'; ctxC.textAlign = 'center'; ctxC.fillText(txt, x, y - 14)
  }
  function drawGuards() {
    if (!guardType) return
    if (guardType === 'human') {
      for (let i = 1; i < path.length - 1; i += 2) {
        const p = path[i]
        ctxC.fillStyle = '#f87171'; ctxC.beginPath(); ctxC.arc(p.x, p.y - 20, 4, 0, 7); ctxC.fill()
        ctxC.fillStyle = '#4ade80'; ctxC.beginPath(); ctxC.arc(p.x, p.y - 10, 4, 0, 7); ctxC.fill()
      }
    } else if (guardType === 'divide') {
      for (let i = 3; i < path.length - 1; i += 3) {
        const p = path[i]
        ctxC.strokeStyle = 'rgba(255,255,255,.5)'; ctxC.setLineDash([4, 4]); ctxC.lineWidth = 1.5
        ctxC.beginPath(); ctxC.moveTo(p.x, p.y - 30); ctxC.lineTo(p.x, p.y + 30); ctxC.stroke(); ctxC.setLineDash([])
      }
    } else if (guardType === 'tdd') {
      ctxC.strokeStyle = 'rgba(74,222,128,.55)'; ctxC.lineWidth = 10; ctxC.lineJoin = 'round'; ctxC.globalAlpha = .35
      ctxC.beginPath(); ctxC.moveTo(path[0].x, path[0].y)
      for (let i = 1; i < path.length; i++) ctxC.lineTo(path[i].x, path[i].y)
      ctxC.stroke(); ctxC.globalAlpha = 1
    } else if (guardType === 'hook') {
      for (const s of stubs) {
        ctxC.strokeStyle = '#f87171'; ctxC.lineWidth = 3
        ctxC.beginPath(); ctxC.arc(s.x, s.y, 9, 0, 7); ctxC.stroke()
        ctxC.beginPath(); ctxC.moveTo(s.x - 6, s.y - 6); ctxC.lineTo(s.x + 6, s.y + 6); ctxC.stroke()
      }
    }
  }

  function setAnchorBtn(val) { anchorBtns.forEach(b => b.classList.toggle('on', val != null && +b.dataset.a === val)) }
  function animateTo(target, guard, val) {
    cancelAnimationFrame(tween)
    buildPath(true); guardType = guard; setAnchorBtn(val)
    const from = a, t0 = performance.now()
    const step = n => {
      const p = Math.min(1, (n - t0) / 800), e = 1 - Math.pow(1 - p, 3)
      a = from + (target - from) * e; inputEl.value = Math.round(a * 100); refresh(false)
      if (p < 1) tween = requestAnimationFrame(step)
    }
    tween = requestAnimationFrame(step)
  }

  inputEl.addEventListener('input', () => {
    cancelAnimationFrame(tween); a = inputEl.value / 100
    setAnchorBtn(null); if (a < 0.55) guardType = null
    refresh(true)
  })
  anchors.addEventListener('click', e => {
    const b = e.target.closest('.demo-btn'); if (!b) return
    cancelAnimationFrame(tween)
    inputEl.value = b.dataset.a; a = b.dataset.a / 100
    guardType = { 22: 'divide', 48: 'human', 68: 'tdd', 85: 'hook' }[b.dataset.a]
    setAnchorBtn(+b.dataset.a); refresh(true)
  })

  function resetScene() {
    cancelAnimationFrame(tween)
    a = 0.08; guardType = null; inputEl.value = 8; setAnchorBtn(null); refresh(true)
  }

  const beats = [
    { narration: '同一個任務「修一個 bug 並發 PR」— <b>自主性是一條光譜</b>，不是二選一。從 workflow 漸進調到 agent。',
      focus: [`.${P}-stage`], nextLabel: '先拉到 Workflow →', enter() { resetScene() } },

    { narration: '拉到最左 = <b>Workflow</b>：像走過一間燈火通明的房子，路徑畫死、1x token、可預測 100%。每步都確定 — 其實一個 shell script 就夠了。',
      focus: [`.${P}-sliderwrap`, `.${P}-stage`, `.${P}-metrics`], nextLabel: '拉到 Agent →',
      enter() { resetScene(); setTimeout(() => animateTo(0.08, null, null), 200) } },

    { narration: '拉到最右 = <b>Agent</b>：像搭著前面遊客的肩膀走鬼屋迷宮，路徑每次都不一樣、token 暴增到 4~15 倍，但能處理的模糊度變高。',
      focus: [`.${P}-sliderwrap`, `.${P}-stage`, `.${P}-metrics`], nextLabel: '中段的護欄 →',
      enter() { resetScene(); setTimeout(() => animateTo(0.92, null, null), 200) } },

    { narration: '光譜中段有真實做法當<b>護欄</b>：Human in the Loop 在每個岔路口設一個暫停確認的紅綠燈，把亂走擋下來。',
      focus: [`.${P}-anchors`, `.${P}-stage`], nextLabel: '換你調 →',
      enter() { resetScene(); setTimeout(() => animateTo(0.48, 'human', 48), 200) } },

    { narration: '換你調 — 拖滑桿、點四個錨點（Divide & Conquer / Human in the Loop / TDD / Hook），找你任務的<b>最適合位置</b>。',
      sandbox: true, enter() { resetScene() } },
  ]

  stage = createStage(el, ctx, { beats })
  stage.body.append(slider, anchors, stageBox, metrics)
  resize(); refresh(true); raf = requestAnimationFrame(draw)
  const onResize = () => { resize(); buildPath(false) }
  window.addEventListener('resize', onResize)

  return () => {
    cancelAnimationFrame(raf); cancelAnimationFrame(tween)
    window.removeEventListener('resize', onResize)
    stage.destroy(); style.remove()
  }
}
