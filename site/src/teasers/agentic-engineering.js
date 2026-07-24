// Agentic Engineering — 三卡依序 3D 翻面（scaleX 模擬），翻面後黑白對調；三張翻完閃一下全翻回；循環
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
  const ease = x => x * x * (3 - 2 * x)
  const rr = (x, y, ww, hh, r) => { g.beginPath(); g.moveTo(x + r, y)
    g.arcTo(x + ww, y, x + ww, y + hh, r); g.arcTo(x + ww, y + hh, x, y + hh, r)
    g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + ww, y, r); g.closePath() }
  const glyph = (shape, s) => { g.beginPath()
    if (shape === 0) g.arc(0, 0, s, 0, 7)
    else if (shape === 1) { const q = s * 0.88; g.moveTo(-q, -q); g.lineTo(q, -q); g.lineTo(q, q); g.lineTo(-q, q); g.closePath() }
    else { g.moveTo(0, -s); g.lineTo(s * 0.9, s * 0.7); g.lineTo(-s * 0.9, s * 0.7); g.closePath() }
    g.fill() }
  const fd = 0.85, hold = 0.55, fbd = 0.7, rest = 0.55
  const allBack = 3 * fd + hold, per = allBack + fbd + rest
  const start = performance.now()
  const angleOf = (i, tc) => {
    if (tc >= allBack && tc < allBack + fbd) return Math.PI * (1 - ease((tc - allBack) / fbd))
    if (tc >= i * fd && tc < i * fd + fd) return Math.PI * ease((tc - i * fd) / fd)
    if (tc >= i * fd + fd && tc < allBack) return Math.PI
    return 0
  }
  const loop = now => {
    const t = (now - start) / 1000, tc = t % per
    g.clearRect(0, 0, w, h)
    const cw = Math.min(w * 0.24, h * 0.5), ch = cw * 1.28, gap = cw * 0.42
    const totalW = cw * 3 + gap * 2, cy = h / 2
    const flash = (tc >= allBack && tc < allBack + fbd)
      ? Math.sin(((tc - allBack) / fbd) * Math.PI) : 0
    for (let i = 0; i < 3; i++) {
      const cx = w / 2 - totalW / 2 + cw / 2 + i * (cw + gap)
      const a = angleOf(i, tc), sx = Math.cos(a), back = sx < 0
      g.save(); g.translate(cx, cy); g.scale(Math.max(0.02, Math.abs(sx)), 1)
      if (back) {
        g.fillStyle = A; g.globalAlpha = 0.92; rr(-cw / 2, -ch / 2, cw, ch, 7 * dpr); g.fill()
        g.globalAlpha = 1; g.globalCompositeOperation = 'destination-out'
        g.fillStyle = '#000'; glyph(i, cw * 0.26)
        g.globalCompositeOperation = 'source-over'
      } else {
        g.strokeStyle = G; g.lineWidth = 1.8 * dpr; g.globalAlpha = 0.85
        rr(-cw / 2, -ch / 2, cw, ch, 7 * dpr); g.stroke()
        g.globalAlpha = 1; g.fillStyle = A; glyph(i, cw * 0.26)
      }
      if (flash > 0.01) { g.globalAlpha = flash * 0.5; g.fillStyle = A
        rr(-cw / 2, -ch / 2, cw, ch, 7 * dpr); g.fill(); g.globalAlpha = 1 }
      // 邊緣線（近側面時）
      if (Math.abs(sx) < 0.08) { g.strokeStyle = A; g.globalAlpha = 0.6; g.lineWidth = 2 * dpr
        g.beginPath(); g.moveTo(0, -ch / 2); g.lineTo(0, ch / 2); g.stroke(); g.globalAlpha = 1 }
      g.restore()
    }
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
