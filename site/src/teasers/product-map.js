// The Product Map — 中央大腦圓輻射到四個不同大小的「身體」，脈衝輪流流向各身體
export default function mount(el, ctx) {
  const A = ctx.accent || '#72c2ae', G = '#8a8f98'
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'width:100%;height:100%;display:block'
  el.appendChild(canvas)
  const g = canvas.getContext('2d')
  let raf, w, h, dpr
  const resize = () => {
    dpr = devicePixelRatio || 1
    const r = el.getBoundingClientRect()
    w = canvas.width = Math.max(2, r.width * dpr)
    h = canvas.height = Math.max(2, r.height * dpr)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(el)
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x))
  const ease = x => x * x * (3 - 2 * x)
  const lerp = (a, b, x) => a + (b - a) * x
  const start = performance.now()
  const T = 6
  const loop = now => {
    const t = (now - start) / 1000, tc = t % T
    g.clearRect(0, 0, w, h)
    const cx = w / 2, cy = h / 2, u = Math.min(w, h), rB = u * 0.09
    const bodies = [
      [w * 0.19, h * 0.27, u * 0.05], [w * 0.81, h * 0.27, u * 0.075],
      [w * 0.82, h * 0.73, u * 0.1], [w * 0.18, h * 0.73, u * 0.088],
    ]
    const act = Math.floor(tc / 1.5), local = (tc % 1.5) / 1.5
    const travel = ease(clamp(local / 0.4, 0, 1)), glow = ease(clamp((local - 0.4) / 0.4, 0, 1)) * (1 - clamp((local - 0.9) / 0.1, 0, 1))
    g.lineCap = 'round'; g.lineJoin = 'round'
    // 輻射線
    for (let i = 0; i < 4; i++) {
      const b = bodies[i], on = i === act
      g.strokeStyle = on ? A : G; g.globalAlpha = on ? 0.7 : 0.25; g.lineWidth = 1.6 * dpr
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(b[0], b[1]); g.stroke()
    }
    // 身體
    for (let i = 0; i < 4; i++) drawBody(i, bodies[i], i === act ? glow : 0, t)
    // 脈衝
    if (local < 0.42) {
      const b = bodies[act], px = lerp(cx, b[0], travel), py = lerp(cy, b[1], travel)
      const grd = g.createRadialGradient(px, py, 0, px, py, 8 * dpr)
      grd.addColorStop(0, A); grd.addColorStop(1, A + '00')
      g.globalAlpha = 1; g.fillStyle = grd; g.beginPath(); g.arc(px, py, 8 * dpr, 0, 7); g.fill()
      g.fillStyle = A; g.beginPath(); g.arc(px, py, 3 * dpr, 0, 7); g.fill()
    }
    // 大腦圓
    g.globalAlpha = 1; g.strokeStyle = A; g.lineWidth = 2.6 * dpr
    g.beginPath(); g.arc(cx, cy, rB, 0, 7); g.stroke()
    g.strokeStyle = A; g.globalAlpha = 0.5; g.lineWidth = 1.2 * dpr
    g.beginPath(); g.moveTo(cx, cy - rB); g.bezierCurveTo(cx + rB, cy - rB * 0.4, cx - rB, cy + rB * 0.4, cx, cy + rB); g.stroke()
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  const drawBody = (i, b, glow, t) => {
    const x = b[0], y = b[1], s = b[2]
    // 記憶環（第 4 個）
    if (i === 3) { g.save(); g.translate(x, y); g.rotate(t * 0.6)
      g.strokeStyle = glow > 0.05 ? A : G; g.globalAlpha = 0.6; g.lineWidth = 1.4 * dpr
      g.setLineDash([5 * dpr, 5 * dpr]); g.beginPath(); g.arc(0, 0, s * 1.55, 0, 7); g.stroke()
      g.setLineDash([]); g.restore() }
    // 聊天框外框 + 尾巴
    g.globalAlpha = 1; g.strokeStyle = glow > 0.05 ? A : G; g.lineWidth = 2 * dpr
    rr(g, x - s, y - s * 0.75, s * 2, s * 1.5, 3 * dpr); g.stroke()
    g.beginPath(); g.moveTo(x - s * 0.5, y + s * 0.75); g.lineTo(x - s * 0.75, y + s * 1.1); g.lineTo(x - s * 0.2, y + s * 0.75); g.stroke()
    // 能力範圍：依大小點亮不同行數
    const n = i + 1
    for (let j = 0; j < n; j++) {
      const ly = y - s * 0.4 + j * (s * 0.9 / n)
      const lit = glow > j / n
      g.strokeStyle = lit ? A : G; g.globalAlpha = lit ? 0.95 : 0.3; g.lineWidth = 1.6 * dpr
      g.beginPath(); g.moveTo(x - s * 0.55, ly); g.lineTo(x + s * 0.55, ly); g.stroke()
    }
    if (glow > 0.05) { g.globalAlpha = glow * 0.35; g.fillStyle = A
      g.beginPath(); g.arc(x, y, s * 1.9, 0, 7); g.fill() }
    g.globalAlpha = 1
  }
  const rr = (g, x, y, ww, hh, r) => { g.beginPath(); g.moveTo(x + r, y)
    g.arcTo(x + ww, y, x + ww, y + hh, r); g.arcTo(x + ww, y + hh, x, y + hh, r)
    g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + ww, y, r); g.closePath() }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
