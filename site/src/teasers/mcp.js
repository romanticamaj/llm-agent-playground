// Teaser: 插頭沿弧線飛入 agent 端口，端口亮起，右側工具格逐格點亮；拔出換下一個
export default function mount(el, ctx) {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'width:100%;height:100%;display:block'
  el.appendChild(canvas)
  const g = canvas.getContext('2d')
  const GRAY = '#8a8f98'
  const A = ctx.accent
  let w, h, raf
  const resize = () => {
    const r = el.getBoundingClientRect()
    w = canvas.width = Math.max(2, r.width * devicePixelRatio)
    h = canvas.height = Math.max(2, r.height * devicePixelRatio)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(el)
  const ease = (x) => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x)
  const CYCLE = 3600
  const rr = (x, y, bw, bh, rad) => {
    g.beginPath()
    g.moveTo(x + rad, y)
    g.arcTo(x + bw, y, x + bw, y + bh, rad)
    g.arcTo(x + bw, y + bh, x, y + bh, rad)
    g.arcTo(x, y + bh, x, y, rad)
    g.arcTo(x, y, x + bw, y, rad); g.closePath()
  }
  const loop = (now) => {
    const p = (now % CYCLE) / CYCLE
    const ci = Math.floor(now / CYCLE)
    const dpr = devicePixelRatio
    g.clearRect(0, 0, w, h)
    // agent 主體
    const ax = w * 0.16, ay = h * 0.32, aw = w * 0.26, ah = h * 0.36
    g.strokeStyle = GRAY; g.lineWidth = 1.6 * dpr; g.globalAlpha = 0.9
    rr(ax, ay, aw, ah, 8 * dpr); g.stroke()
    // 端口（agent 右側面）
    const portX = ax + aw, portY = ay + ah / 2
    const inP = ease(Math.min(1, p / 0.4))
    const out = p > 0.8 ? ease((p - 0.8) / 0.2) : 0
    const docked = inP >= 1 && out === 0
    const t = out > 0 ? out : 1 - inP // 0 = 已插入
    const sx = w * 0.9, sy = h * 0.92
    const bx = portX + (sx - portX) * t
    const by = portY + (sy - portY) * t - Math.sin((1 - t) * Math.PI) * h * 0.12
    // 端口亮起
    g.globalAlpha = 1
    g.fillStyle = docked ? A : GRAY
    if (docked) { g.shadowColor = A; g.shadowBlur = 12 * dpr }
    g.beginPath(); g.arc(portX, portY, 5 * dpr, 0, 7); g.fill()
    g.shadowBlur = 0
    // 插頭（每輪換一種：prong 數交替）
    g.save(); g.translate(bx, by)
    g.fillStyle = A; g.globalAlpha = 0.95
    rr(-9 * dpr, -6 * dpr, 18 * dpr, 12 * dpr, 3 * dpr); g.fill()
    const prongs = ci % 2 ? 2 : 1
    for (let k = 0; k < prongs; k++) {
      const oy = prongs === 2 ? (k ? 3 : -3) * dpr : 0
      g.fillRect(-13 * dpr, oy - 1.5 * dpr, 4 * dpr, 3 * dpr)
    }
    g.restore()
    // 右側工具格逐格點亮成一排
    const cols = 4, cellY = h * 0.42, cell = w * 0.07, gap = w * 0.02
    let gx = w * 0.6
    const lit = docked ? ease((p - 0.4) / 0.35) : 0
    for (let i = 0; i < cols; i++) {
      const on = lit > (i + 0.5) / cols
      g.globalAlpha = on ? 1 : 0.35
      g.strokeStyle = on ? A : GRAY; g.lineWidth = 1.4 * dpr
      rr(gx, cellY, cell, cell, 4 * dpr); g.stroke()
      if (on) { g.globalAlpha = 0.2; g.fillStyle = A; g.fill() }
      gx += cell + gap
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
