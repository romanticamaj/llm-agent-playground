// Eight Levels — 八階階梯，一顆亮點從 L0 逐級爬到頂端發光後淡出重爬；當前階發光、已過階留微光
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
  const start = performance.now()
  const N = 8, T = 6.5
  const loop = now => {
    const t = (now - start) / 1000, tc = t % T
    g.clearRect(0, 0, w, h)
    const u = Math.min(w, h)
    const xL = w * 0.16, xR = w * 0.84, yB = h * 0.82, yT = h * 0.2
    const dx = (xR - xL) / (N - 1), dy = (yB - yT) / (N - 1), tw = dx * 0.7
    const climb = ease(clamp(tc / 4.8, 0, 1)) * (N - 1)
    const cur = Math.min(N - 1, Math.floor(climb + 1e-4))
    const atTop = tc > 4.8
    const fade = 1 - ease(clamp((tc - 5.6) / 0.9, 0, 1))
    g.lineCap = 'round'
    // 階梯踏面 + 立板
    for (let i = 0; i < N; i++) {
      const x = xL + dx * i, y = yB - dy * i
      let a = 0.26, c = G
      if (i < cur) { a = 0.5; c = A }
      if (i === cur && !atTop) { a = 1; c = A }
      if (atTop) { a = 0.4 * fade + 0.12; c = A }
      g.globalAlpha = a; g.strokeStyle = c; g.lineWidth = 2.4 * dpr
      g.beginPath(); g.moveTo(x - tw / 2, y); g.lineTo(x + tw / 2, y); g.stroke()
      if (i < N - 1) {
        g.globalAlpha = a * 0.45
        g.beginPath(); g.moveTo(x + tw / 2, y); g.lineTo(x + dx - tw / 2, y - dy); g.stroke()
      }
    }
    // 亮點
    const i0 = Math.floor(climb), fr = climb - i0
    const px = xL + dx * (i0 + fr), py = yB - dy * (i0 + fr) - u * 0.035
    const glow = atTop ? fade : 1, gr = u * (atTop ? 0.15 : 0.07)
    g.globalAlpha = glow
    const grd = g.createRadialGradient(px, py, 0, px, py, gr)
    grd.addColorStop(0, A); grd.addColorStop(1, A + '00')
    g.fillStyle = grd; g.beginPath(); g.arc(px, py, gr, 0, 7); g.fill()
    g.globalAlpha = glow; g.fillStyle = A
    g.beginPath(); g.arc(px, py, u * 0.02, 0, 7); g.fill()
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
