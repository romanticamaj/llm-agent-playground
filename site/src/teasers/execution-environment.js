// Execution Environment — agent loop 在雲端框／本機框之間切換，四個能力口隨模式亮滅
export default function mount(el, ctx) {
  const A = ctx.accent || '#5b8cff', G = '#8a8f98', AM = '#fbbf24'
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
  const rr = (x, y, ww, hh, r) => {
    g.beginPath(); g.moveTo(x + r, y)
    g.arcTo(x + ww, y, x + ww, y + hh, r); g.arcTo(x + ww, y + hh, x, y + hh, r)
    g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + ww, y, r); g.closePath()
  }

  const T = 7.2
  const start = performance.now()

  const loop = now => {
    const t = (now - start) / 1000, tc = t % T
    // side: 0 = 本機（右框）, 1 = 雲端（左框）
    const side = tc < 3 ? 0
      : tc < 3.7 ? ease((tc - 3) / 0.7)
      : tc < 6.5 ? 1
      : 1 - ease((tc - 6.5) / 0.7)

    g.clearRect(0, 0, w, h)
    g.lineCap = 'round'; g.lineJoin = 'round'
    const u = Math.min(w, h)
    const bw = w * 0.33, bh = h * 0.40, by = h * 0.15
    const L = { x: w * 0.055, y: by, w: bw, h: bh }
    const R = { x: w * 0.615, y: by, w: bw, h: bh }
    const lc = { x: L.x + L.w / 2, y: L.y + L.h / 2 }
    const rc = { x: R.x + R.w / 2, y: R.y + R.h / 2 }
    const mid = { x: w / 2, y: by + bh / 2 }

    // 代理通道（只在雲端模式浮現）：本機框 → Claude Desktop → 雲端框
    if (side > 0.02) {
      g.save()
      g.globalAlpha = side * 0.85
      g.strokeStyle = AM; g.lineWidth = 1.3 * dpr
      g.setLineDash([4 * dpr, 5 * dpr])
      g.lineDashOffset = -((t * 26 * dpr) % (9 * dpr))
      g.beginPath(); g.moveTo(R.x, mid.y); g.lineTo(mid.x + u * 0.045, mid.y)
      g.moveTo(mid.x - u * 0.045, mid.y); g.lineTo(L.x + L.w, mid.y); g.stroke()
      g.setLineDash([])
      // Desktop 小方塊
      g.strokeStyle = AM; g.lineWidth = 1.6 * dpr
      rr(mid.x - u * 0.042, mid.y - u * 0.032, u * 0.084, u * 0.064, 3 * dpr); g.stroke()
      g.beginPath(); g.moveTo(mid.x - u * 0.02, mid.y + u * 0.046); g.lineTo(mid.x + u * 0.02, mid.y + u * 0.046); g.stroke()
      g.restore()
    }

    // 兩個環境框
    const boxes = [[L, side], [R, 1 - side]]
    for (const [b, act] of boxes) {
      g.globalAlpha = 1
      g.strokeStyle = act > 0.5 ? A : G
      g.globalAlpha = act > 0.5 ? 0.95 : 0.4
      g.lineWidth = (act > 0.5 ? 2 : 1.4) * dpr
      rr(b.x, b.y, b.w, b.h, 7 * dpr); g.stroke()
      // 標題線
      g.globalAlpha = act > 0.5 ? 0.8 : 0.3
      g.lineWidth = 1.5 * dpr
      g.beginPath(); g.moveTo(b.x + b.w * 0.14, b.y + b.h * 0.24); g.lineTo(b.x + b.w * 0.62, b.y + b.h * 0.24); g.stroke()
      if (act > 0.05) { g.globalAlpha = act * 0.13; g.fillStyle = A; rr(b.x, b.y, b.w, b.h, 7 * dpr); g.fill() }
    }

    // agent loop 光點：在兩框之間移動
    const px = lerp(rc.x, lc.x, side), py = lerp(rc.y, lc.y, side) + u * 0.055
    const grd = g.createRadialGradient(px, py, 0, px, py, u * 0.09)
    grd.addColorStop(0, A + 'cc'); grd.addColorStop(1, A + '00')
    g.globalAlpha = 1; g.fillStyle = grd
    g.beginPath(); g.arc(px, py, u * 0.09, 0, 7); g.fill()
    g.fillStyle = A; g.beginPath(); g.arc(px, py, 3.4 * dpr, 0, 7); g.fill()
    g.strokeStyle = A; g.lineWidth = 1.7 * dpr; g.globalAlpha = 0.85
    g.beginPath(); g.arc(px, py, u * 0.045, t * 2.2, t * 2.2 + 4.2); g.stroke()

    // 四個能力口：web／本地資料夾／shell／MCP
    const py2 = h * 0.80, s = u * 0.055
    for (let i = 0; i < 4; i++) {
      const x = w * (0.185 + i * 0.21)
      // 0,1 兩種模式都在；1 在雲端模式轉為「繞 Desktop」；2,3 只有本機模式有
      const on = i < 2 ? 1 : 1 - side
      const col = i === 1 && side > 0.5 ? AM : (on > 0.5 ? A : G)
      g.globalAlpha = 0.25 + on * 0.7
      g.strokeStyle = col; g.lineWidth = 1.6 * dpr
      rr(x - s / 2, py2 - s / 2, s, s, 2.5 * dpr); g.stroke()
      g.globalAlpha = on * (i === 1 && side > 0.5 ? 0.5 : 0.85)
      g.fillStyle = col
      g.beginPath(); g.arc(x, py2, s * 0.2, 0, 7); g.fill()
      if (on < 0.4) {
        g.globalAlpha = (1 - on) * 0.7; g.strokeStyle = G; g.lineWidth = 1.4 * dpr
        g.beginPath(); g.moveTo(x - s * 0.3, py2 - s * 0.3); g.lineTo(x + s * 0.3, py2 + s * 0.3); g.stroke()
      }
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
