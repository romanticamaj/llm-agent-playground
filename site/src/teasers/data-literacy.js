// Data Literacy — 三層金字塔由下往上輪流點亮：底層雜點整成網格（友善）→ 中層方塊變形三形狀（轉換）→ 頂層方塊滑入模具卡準發光（接口）；循環
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
  const lerp = (a, b, t) => a + (b - a) * t
  const start = performance.now()
  const T = 8.4, S = T / 3
  const dots = Array.from({ length: 21 }, (_, i) => ({ jx: Math.random(), jy: Math.random(), c: i % 7, r: (i / 7) | 0 }))
  const tier = i => {
    const base = w * 0.6, topw = w * 0.2, yb = h * 0.87, th = (h * 0.66) / 3
    const yBot = yb - i * th, yTop = yBot - th
    return { yBot, yTop, wBot: lerp(base, topw, i / 3), wTop: lerp(base, topw, (i + 1) / 3), th, cx: w / 2 }
  }
  const shape = (cx, cy, s, idx) => {
    g.fillStyle = A; g.globalAlpha = 0.9; g.beginPath()
    if (idx === 0) g.rect(cx - s, cy - s, s * 2, s * 2)
    else if (idx === 1) { g.moveTo(cx, cy - s); g.lineTo(cx + s, cy + s); g.lineTo(cx - s, cy + s); g.closePath() }
    else g.arc(cx, cy, s, 0, 7)
    g.fill(); g.globalAlpha = 1
  }
  const loop = now => {
    const tc = ((now - start) / 1000) % T
    g.clearRect(0, 0, w, h)
    g.lineJoin = 'round'
    const lit = [tc > 0.2, tc > S, tc > 2 * S]
    for (let i = 0; i < 3; i++) {
      const t = tier(i)
      g.beginPath(); g.moveTo(t.cx - t.wBot / 2, t.yBot); g.lineTo(t.cx + t.wBot / 2, t.yBot)
      g.lineTo(t.cx + t.wTop / 2, t.yTop); g.lineTo(t.cx - t.wTop / 2, t.yTop); g.closePath()
      g.strokeStyle = lit[i] ? A : G; g.globalAlpha = lit[i] ? 0.7 : 0.28; g.lineWidth = 1.5 * dpr; g.stroke()
    }
    g.globalAlpha = 1
    // 底層：雜點 → 網格（友善）
    const t0 = tier(0), p0 = ease(clamp((tc - 0.2) / (S * 0.8), 0, 1))
    const gw = t0.wTop * 0.82, gx0 = t0.cx - gw / 2, gy0 = t0.yTop + t0.th * 0.24, gyh = t0.th * 0.52
    for (const d of dots) {
      const sx = t0.cx + (d.jx - 0.5) * t0.wBot * 0.78, sy = t0.yTop + t0.th * (0.18 + d.jy * 0.64)
      const gx = gx0 + (d.c / 6) * gw, gy = gy0 + (d.r / 2) * gyh
      g.globalAlpha = 0.85; g.fillStyle = p0 > 0.5 ? A : G
      g.beginPath(); g.arc(lerp(sx, gx, p0), lerp(sy, gy, p0), 2.2 * dpr, 0, 7); g.fill()
    }
    g.globalAlpha = 1
    // 中層：方塊變形三形狀（轉換）
    if (tc > S) {
      const t1 = tier(1), p1 = clamp((tc - S) / (S * 0.9), 0, 1)
      const sub = p1 * 3, idx = Math.min(2, Math.floor(sub)), fr = sub - Math.floor(sub)
      const sc = 0.6 + 0.4 * ease(clamp(Math.sin(Math.PI * fr) * 1.6, 0, 1))
      shape(t1.cx, (t1.yTop + t1.yBot) / 2, t1.th * 0.3 * sc, idx)
    }
    // 頂層：方塊滑入模具卡準發光（接口）
    if (tc > 2 * S) {
      const t2 = tier(2), p2 = ease(clamp((tc - 2 * S) / (S * 0.85), 0, 1))
      const my = (t2.yTop + t2.yBot) / 2, bw = t2.th * 0.5, bh = t2.th * 0.42, mx = t2.cx
      g.strokeStyle = G; g.globalAlpha = 0.5; g.lineWidth = 1.5 * dpr
      g.setLineDash([4 * dpr, 3 * dpr]); g.strokeRect(mx - bw / 2, my - bh / 2, bw, bh); g.setLineDash([])
      if (p2 > 0.9) {
        const gl = (p2 - 0.9) / 0.1
        g.globalAlpha = 0.5 * (1 - gl); g.fillStyle = A
        g.beginPath(); g.arc(mx, my, bw * (0.6 + gl), 0, 7); g.fill()
      }
      g.globalAlpha = 1; g.fillStyle = A
      g.fillRect(lerp(t2.cx - t2.wBot * 0.45, mx, p2) - bw / 2, my - bh / 2, bw, bh)
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
