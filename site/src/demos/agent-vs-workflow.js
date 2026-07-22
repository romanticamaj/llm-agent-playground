// 自主性光譜滑桿 — Workflow ←→ Agent
// 拖動滑桿：左邊是燈火通明的房子（路徑畫死、1x token、可預測 100%），
// 右邊是鬼屋迷宮（路徑即時亂走、token 暴增、可預測性掉、能處理的模糊度升高）。
export default function mount(el, ctx) {
  const accent = ctx?.accent || '#38e1c6'
  const P = 'avw'
  const style = document.createElement('style')
  style.textContent = `
  .${P}-root{position:absolute;inset:0;overflow:auto;padding:22px 26px;color:#e8ebf2;font-family:var(--font-tc,'Noto Sans TC',sans-serif);box-sizing:border-box}
  .${P}-guide{font-size:17px;color:#aeb4c4;margin-bottom:14px;line-height:1.6}
  .${P}-guide b{color:${accent}}
  .${P}-sliderwrap{display:flex;align-items:center;gap:16px;margin-bottom:6px}
  .${P}-endlabel{font-size:16px;font-weight:700;white-space:nowrap}
  .${P}-endlabel small{display:block;font-size:12px;font-weight:400;color:#7b8296;letter-spacing:.12em}
  .${P}-slider{flex:1;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;
    background:linear-gradient(90deg,#3a6df0,${accent});outline:none;cursor:pointer}
  .${P}-slider::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;
    background:#fff;border:3px solid ${accent};box-shadow:0 0 14px ${accent};cursor:grab}
  .${P}-slider::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#fff;border:3px solid ${accent};cursor:grab}
  .${P}-anchors{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 16px}
  .${P}-anchors .demo-btn{font-size:15px;padding:7px 14px}
  .${P}-anchors .demo-btn.on{background:${accent};color:#05060a;border-color:${accent}}
  .${P}-stage{position:relative;border:1px solid rgba(255,255,255,.1);border-radius:14px;
    background:#0c0f16;overflow:hidden;margin-bottom:16px}
  .${P}-canvas{display:block;width:100%;height:280px}
  .${P}-scene{position:absolute;top:12px;left:14px;font-size:14px;letter-spacing:.06em;
    color:#9aa0b0;background:rgba(0,0,0,.35);padding:4px 10px;border-radius:8px}
  .${P}-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .${P}-metric{border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 16px;background:rgba(255,255,255,.02)}
  .${P}-metric .lab{font-size:13px;color:#8b93a7;letter-spacing:.08em}
  .${P}-metric .val{font-size:26px;font-weight:800;margin:4px 0 8px;font-family:var(--font-en,'Space Grotesk',sans-serif)}
  .${P}-bar{height:8px;border-radius:8px;background:rgba(255,255,255,.08);overflow:hidden}
  .${P}-bar>i{display:block;height:100%;border-radius:8px;transition:width .35s ease,background .35s}
  `
  document.head.appendChild(style)

  const svg = (p, s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block">${p}</svg>`
  const ICO = {
    house: '<path d="M4 11.5 12 5l8 6.5"/><path d="M6 10.5V19h12v-8.5"/><path d="M10 19v-4.5h4V19"/>',
    door: '<path d="M6 20V4.5A1.5 1.5 0 0 1 7.5 3h5A1.5 1.5 0 0 1 14 4.5V20"/><path d="M4 20h13"/><circle cx="11.5" cy="12" r=".9" fill="currentColor" stroke="none"/>',
    ghost: '<path d="M5 20v-8a7 7 0 0 1 14 0v8l-2.3-1.7L14.4 20 12 18.3 9.6 20 7.3 18.3 5 20Z"/><circle cx="9.5" cy="11" r="1.1" fill="currentColor" stroke="none"/><circle cx="14.5" cy="11" r="1.1" fill="currentColor" stroke="none"/>',
  }

  const root = document.createElement('div')
  root.className = `${P}-root`
  root.innerHTML = `
    <div class="${P}-guide">拖動滑桿在 <b>Workflow</b> 與 <b>Agent</b> 之間移動 — 看同一個任務「修一個 bug 並發 PR」怎麼被執行。愈往右愈自主：路徑每次都不一樣、成本飆高。</div>
    <div class="${P}-sliderwrap">
      <div class="${P}-endlabel" style="color:#5b8cff">Workflow<small>燈火通明的房子</small></div>
      <input class="${P}-slider" type="range" min="0" max="100" value="8" />
      <div class="${P}-endlabel" style="color:${accent};text-align:right">Agent<small>鬼屋迷宮</small></div>
    </div>
    <div class="${P}-anchors">
      <span style="font-size:15px;color:#7b8296;align-self:center">光譜錨點 →</span>
      <button class="demo-btn" data-a="22">Divide &amp; Conquer</button>
      <button class="demo-btn" data-a="48">Human in the Loop</button>
      <button class="demo-btn" data-a="68">TDD + Autonomous</button>
      <button class="demo-btn" data-a="85">Hook 護欄</button>
    </div>
    <div class="${P}-stage">
      <div class="${P}-scene"></div>
      <canvas class="${P}-canvas"></canvas>
    </div>
    <div class="${P}-metrics">
      <div class="${P}-metric"><div class="lab">TOKEN 成本</div><div class="val" data-m="tok">1.0x</div>
        <div class="${P}-bar"><i data-b="tok" style="background:#f87171"></i></div></div>
      <div class="${P}-metric"><div class="lab">可預測性</div><div class="val" data-m="pred">100%</div>
        <div class="${P}-bar"><i data-b="pred" style="background:#4ade80"></i></div></div>
      <div class="${P}-metric"><div class="lab">能處理的任務模糊度</div><div class="val" data-m="amb">低</div>
        <div class="${P}-bar"><i data-b="amb" style="background:${accent}"></i></div></div>
    </div>`
  el.appendChild(root)

  const slider = root.querySelector(`.${P}-slider`)
  const canvas = root.querySelector(`.${P}-canvas`)
  const sceneLbl = root.querySelector(`.${P}-scene`)
  const anchorBtns = [...root.querySelectorAll(`.${P}-anchors .demo-btn`)]
  const ctxC = canvas.getContext('2d')

  let a = 0.08          // autonomy 0..1
  let guardType = null  // 'divide'|'human'|'tdd'|'hook'|null
  let seed = 1
  let path = []
  let stubs = []
  let W = 0, H = 0, dpr = 1

  function rand() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = canvas.clientWidth; H = canvas.clientHeight
    canvas.width = W * dpr; canvas.height = H * dpr
    ctxC.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  // 依 autonomy 產生路徑：低=直線，高=上下亂走 + 分岔殘枝
  function buildPath() {
    seed = (Math.random() * 1e6) | 0
    const startX = 60, endX = W - 60, midY = H / 2
    const steps = Math.round(5 + a * 7)
    path = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = startX + (endX - startX) * t
      // 起終點固定，中間隨 autonomy 抖動
      const wobble = (i === 0 || i === steps) ? 0 : (rand() - 0.5) * a * (H * 0.75)
      path.push({ x, y: midY + wobble })
    }
    // 鬼屋殘枝：只有高自主性才出現，代表 non-deterministic 的岔路
    stubs = []
    const nStub = Math.round(a * a * 10)
    for (let i = 0; i < nStub; i++) {
      const base = path[1 + ((rand() * (path.length - 2)) | 0)]
      stubs.push({ x: base.x, y: base.y, dx: (rand() - .5) * 90, dy: (rand() - .5) * 120 })
    }
  }

  function setMetrics() {
    const tok = 1 + a * a * 14
    const pred = Math.max(8, Math.round(100 * (1 - a * 0.92)))
    const amb = Math.round(a * 100)
    root.querySelector('[data-m="tok"]').textContent = tok.toFixed(1) + 'x'
    root.querySelector('[data-m="pred"]').textContent = pred + '%'
    root.querySelector('[data-m="amb"]').textContent = amb < 25 ? '低' : amb < 55 ? '中' : amb < 80 ? '高' : '極高'
    root.querySelector('[data-b="tok"]').style.width = Math.min(100, (tok / 15) * 100) + '%'
    root.querySelector('[data-b="pred"]').style.width = pred + '%'
    root.querySelector('[data-b="amb"]').style.width = amb + '%'
    sceneLbl.innerHTML = a < 0.2 ? `${svg(ICO.house, 18)} 燈火通明的房子 · 每個房間都看得到`
      : a < 0.55 ? `${svg(ICO.door, 18)} 半開放 · 部分路徑交給 AI`
      : `${svg(ICO.ghost, 18)} 鬼屋迷宮 · 搭著前面遊客的肩膀走`
  }

  let raf = 0, phase = 0
  function draw() {
    ctxC.clearRect(0, 0, W, H)
    // 底：房間（workflow 感）—— autonomy 低時亮，高時熄
    const roomAlpha = Math.max(0, 1 - a * 1.4)
    if (roomAlpha > 0.02 && path.length) {
      for (let i = 0; i < path.length - 1; i++) {
        const p = path[i]
        ctxC.fillStyle = `rgba(91,140,240,${0.10 * roomAlpha})`
        ctxC.strokeStyle = `rgba(91,140,240,${0.5 * roomAlpha})`
        ctxC.lineWidth = 1
        ctxC.fillRect(p.x - 22, p.y - 26, 44, 52)
        ctxC.strokeRect(p.x - 22, p.y - 26, 44, 52)
        ctxC.fillStyle = `rgba(255,220,140,${0.9 * roomAlpha})`
        ctxC.beginPath(); ctxC.arc(p.x, p.y - 14, 3, 0, 7); ctxC.fill()
      }
    }
    // 殘枝（鬼屋岔路）
    ctxC.lineWidth = 1.5
    for (const s of stubs) {
      ctxC.strokeStyle = 'rgba(248,113,113,.35)'
      ctxC.beginPath(); ctxC.moveTo(s.x, s.y); ctxC.lineTo(s.x + s.dx, s.y + s.dy); ctxC.stroke()
    }
    // 主路徑
    if (path.length) {
      const g = ctxC.createLinearGradient(path[0].x, 0, path[path.length - 1].x, 0)
      g.addColorStop(0, '#5b8cff'); g.addColorStop(1, accent)
      ctxC.strokeStyle = g; ctxC.lineWidth = 3; ctxC.lineJoin = 'round'
      ctxC.beginPath(); ctxC.moveTo(path[0].x, path[0].y)
      for (let i = 1; i < path.length; i++) ctxC.lineTo(path[i].x, path[i].y)
      ctxC.stroke()
      // 護欄
      drawGuards()
      // 流動的執行光點
      phase = (phase + 0.006) % 1
      const seg = phase * (path.length - 1)
      const i0 = Math.floor(seg), f = seg - i0
      const p0 = path[i0], p1 = path[Math.min(i0 + 1, path.length - 1)]
      const px = p0.x + (p1.x - p0.x) * f, py = p0.y + (p1.y - p0.y) * f
      ctxC.fillStyle = '#fff'; ctxC.shadowColor = accent; ctxC.shadowBlur = 16
      ctxC.beginPath(); ctxC.arc(px, py, 6, 0, 7); ctxC.fill(); ctxC.shadowBlur = 0
      // 起終點
      label(path[0].x, path[0].y, 'START', '#5b8cff')
      label(path[path.length - 1].x, path[path.length - 1].y, 'PR ✓', accent)
    }
    raf = requestAnimationFrame(draw)
  }

  function label(x, y, txt, col) {
    ctxC.fillStyle = col; ctxC.beginPath(); ctxC.arc(x, y, 7, 0, 7); ctxC.fill()
    ctxC.fillStyle = '#cfd4e0'; ctxC.font = '600 13px sans-serif'; ctxC.textAlign = 'center'
    ctxC.fillText(txt, x, y - 14)
  }

  function drawGuards() {
    if (!guardType) return
    if (guardType === 'human') {
      // 每個岔路口一個暫停紅綠燈
      for (let i = 1; i < path.length - 1; i += 2) {
        const p = path[i]
        ctxC.fillStyle = '#f87171'; ctxC.beginPath(); ctxC.arc(p.x, p.y - 20, 4, 0, 7); ctxC.fill()
        ctxC.fillStyle = '#4ade80'; ctxC.beginPath(); ctxC.arc(p.x, p.y - 10, 4, 0, 7); ctxC.fill()
      }
    } else if (guardType === 'divide') {
      // 把路徑切成幾段（分而治之）
      for (let i = 3; i < path.length - 1; i += 3) {
        const p = path[i]
        ctxC.strokeStyle = 'rgba(255,255,255,.5)'; ctxC.setLineDash([4, 4]); ctxC.lineWidth = 1.5
        ctxC.beginPath(); ctxC.moveTo(p.x, p.y - 30); ctxC.lineTo(p.x, p.y + 30); ctxC.stroke()
        ctxC.setLineDash([])
      }
    } else if (guardType === 'tdd') {
      // 綠燈測試護欄包住路徑
      ctxC.strokeStyle = 'rgba(74,222,128,.55)'; ctxC.lineWidth = 10; ctxC.lineJoin = 'round'
      ctxC.globalAlpha = .35; ctxC.beginPath(); ctxC.moveTo(path[0].x, path[0].y)
      for (let i = 1; i < path.length; i++) ctxC.lineTo(path[i].x, path[i].y)
      ctxC.stroke(); ctxC.globalAlpha = 1
    } else if (guardType === 'hook') {
      // 岔路口紅色閘門，把亂走的殘枝擋掉
      for (const s of stubs) {
        ctxC.strokeStyle = '#f87171'; ctxC.lineWidth = 3
        ctxC.beginPath(); ctxC.arc(s.x, s.y, 9, 0, 7); ctxC.stroke()
        ctxC.beginPath(); ctxC.moveTo(s.x - 6, s.y - 6); ctxC.lineTo(s.x + 6, s.y + 6); ctxC.stroke()
      }
    }
  }

  function refresh() { buildPath(); setMetrics() }

  slider.addEventListener('input', () => {
    a = slider.value / 100
    anchorBtns.forEach(b => b.classList.remove('on'))
    if (a < 0.55) guardType = null
    refresh()
  })
  anchorBtns.forEach(b => b.addEventListener('click', () => {
    slider.value = b.dataset.a; a = b.dataset.a / 100
    guardType = { '22': 'divide', '48': 'human', '68': 'tdd', '85': 'hook' }[b.dataset.a]
    anchorBtns.forEach(x => x.classList.toggle('on', x === b))
    refresh()
  }))

  const onResize = () => { resize(); buildPath() }
  window.addEventListener('resize', onResize)

  resize(); refresh(); raf = requestAnimationFrame(draw)

  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', onResize)
    style.remove()
    el.innerHTML = ''
  }
}
