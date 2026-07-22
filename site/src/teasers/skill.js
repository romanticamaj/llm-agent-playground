// Skills — 散亂對話卡收攏壓縮成發光方塊 → 滑入插槽 → 跳出 /skill 指令膠囊；循環
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
  const scatter = [[-0.16, -0.24], [0.12, -0.2], [-0.2, 0.06], [0.18, 0.16], [-0.04, 0.26]]
  const start = performance.now()
  const T = 5.6
  const loop = now => {
    const t = (now - start) / 1000, tc = t % T
    g.clearRect(0, 0, w, h)
    const cy = h / 2, gx = w * 0.4, sx = w * 0.8, u = Math.min(w, h)
    const seg = (a, b) => ease(clamp((tc - a) / (b - a), 0, 1))
    g.lineCap = 'round'; g.lineJoin = 'round'
    // 插槽（右側）
    const slotGlow = seg(3.5, 3.9) * (1 - seg(5.1, 5.6))
    g.globalAlpha = 0.5; g.strokeStyle = slotGlow > 0.05 ? A : G; g.lineWidth = 2 * dpr
    g.setLineDash([5 * dpr, 4 * dpr]); rr(g, sx - u * 0.1, cy - u * 0.1, u * 0.2, u * 0.2, 4 * dpr); g.stroke()
    g.setLineDash([])
    // 散亂對話卡 → 收攏
    const gather = seg(1.4, 2.35), fade = 1 - seg(2.15, 2.45)
    if (fade > 0.02) {
      for (const s of scatter) {
        const x = lerp(gx + s[0] * u, gx, gather), y = lerp(cy + s[1] * u, cy, gather)
        g.globalAlpha = fade * 0.9; card(g, x, y, u, G, A, dpr)
      }
    }
    // 壓縮方塊（skill 包）
    const born = seg(2.3, 2.9)
    if (born > 0.02) {
      const slide = seg(3.0, 3.85), bx = lerp(gx, sx, slide)
      const bs = u * 0.09 * (0.6 + 0.4 * born)
      const pulse = 0.5 + 0.5 * Math.sin(tc * 6)
      g.globalAlpha = born; g.fillStyle = A
      const grd = g.createRadialGradient(bx, cy, 0, bx, cy, bs * 2)
      grd.addColorStop(0, A + 'cc'); grd.addColorStop(1, A + '00')
      g.fillStyle = grd; g.beginPath(); g.arc(bx, cy, bs * (1.6 + pulse * 0.3), 0, 7); g.fill()
      g.fillStyle = A; rr(g, bx - bs, cy - bs, bs * 2, bs * 2, 4 * dpr); g.fill()
      g.globalAlpha = born * 0.9; g.strokeStyle = '#fff'; g.lineWidth = 1.4 * dpr
      g.beginPath(); g.moveTo(bx - bs * 0.4, cy); g.lineTo(bx + bs * 0.4, cy); g.stroke()
    }
    // /skill 指令膠囊
    const pop = seg(3.9, 4.35) * (1 - seg(5.1, 5.5))
    if (pop > 0.02) {
      const cw = u * 0.22, ch = u * 0.11, px = sx, py = cy - u * 0.24
      g.globalAlpha = pop; g.fillStyle = A
      rr(g, px - cw / 2, py - ch / 2, cw, ch, ch / 2); g.fill()
      g.fillStyle = '#0b0d10'; g.globalAlpha = pop
      g.font = `600 ${u * 0.06}px "JetBrains Mono", monospace`
      g.textAlign = 'center'; g.textBaseline = 'middle'
      g.fillText('/skill', px, py + u * 0.004)
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  const card = (g, x, y, u, G, A, dpr) => {
    const cw = u * 0.13, ch = u * 0.09
    g.strokeStyle = G; g.lineWidth = 1.6 * dpr; rr(g, x - cw / 2, y - ch / 2, cw, ch, 3 * dpr); g.stroke()
    g.strokeStyle = A; g.globalAlpha *= 0.7; g.lineWidth = 1.4 * dpr; g.beginPath()
    g.moveTo(x - cw * 0.3, y - ch * 0.15); g.lineTo(x + cw * 0.3, y - ch * 0.15)
    g.moveTo(x - cw * 0.3, y + ch * 0.15); g.lineTo(x + cw * 0.1, y + ch * 0.15); g.stroke()
  }
  const rr = (g, x, y, ww, hh, r) => { g.beginPath(); g.moveTo(x + r, y)
    g.arcTo(x + ww, y, x + ww, y + hh, r); g.arcTo(x + ww, y + hh, x, y + hh, r)
    g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + ww, y, r); g.closePath() }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
