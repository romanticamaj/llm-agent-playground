// self-improving-agent — 四層管線 L1→L4；觀察點從左進入逐層向右蒸餾上升，抵頂化為亮星固定；累積三顆後重置，循環。
export default function mount(el, ctx) {
  const accent = ctx?.accent || '#8ea9e8'
  const gray = '#8a8f98'
  const cv = document.createElement('canvas')
  cv.style.cssText = 'width:100%;height:100%;display:block'
  el.appendChild(cv)
  const g = cv.getContext('2d')
  let raf, w, h, dpr
  const resize = () => {
    dpr = devicePixelRatio || 1
    const r = el.getBoundingClientRect()
    w = cv.width = Math.max(2, r.width * dpr)
    h = cv.height = Math.max(2, r.height * dpr)
  }
  resize()
  const ro = new ResizeObserver(resize); ro.observe(el)
  const L = 4
  let p = 0, stars = 0, phase = 'run', pt = 0, last = performance.now()
  const star = (x, y, r, now) => {
    g.globalAlpha = 0.3; g.fillStyle = accent
    g.beginPath(); g.arc(x, y, r * (1.4 + 0.15 * Math.sin(now / 300)), 0, 7); g.fill()
    g.globalAlpha = 1; g.fillStyle = accent
    g.beginPath()
    for (let k = 0; k < 10; k++) {
      const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 === 0 ? r : r * 0.42
      const fx = x + Math.cos(a) * rr, fy = y + Math.sin(a) * rr
      k === 0 ? g.moveTo(fx, fy) : g.lineTo(fx, fy)
    }
    g.closePath(); g.fill()
  }
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now
    g.clearRect(0, 0, w, h)
    const x0 = w * 0.1, x1 = w * 0.9, top = h * 0.22, bot = h * 0.8
    // 相位機
    if (phase === 'run') { p += dt * 0.5; if (p >= 1) { p = 0; stars++; if (stars >= 3) { phase = 'reset'; pt = 0 } } }
    else if (phase === 'reset') { pt += dt; if (pt > 1.0) { stars = 0; phase = 'run' } }
    // 四層管線
    for (let i = 0; i < L; i++) {
      const y = bot + (top - bot) * (i / (L - 1))
      g.globalAlpha = 0.3; g.strokeStyle = gray; g.lineWidth = dpr
      g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke()
    }
    // 蒸餾軌跡（曲線上升）+ 觀察點
    if (phase === 'run') {
      g.globalAlpha = 0.35; g.strokeStyle = accent; g.lineWidth = dpr; g.setLineDash([dpr * 3, dpr * 4])
      g.beginPath(); g.moveTo(x0, bot)
      for (let t = 0; t <= p + 1e-4; t += 0.02) { const e = t * t * (3 - 2 * t); g.lineTo(x0 + (x1 - x0) * t, bot + (top - bot) * e) }
      g.stroke(); g.setLineDash([])
      const ease = p * p * (3 - 2 * p)
      const px = x0 + (x1 - x0) * p, py = bot + (top - bot) * ease, dr = Math.min(w, h)
      g.globalAlpha = 0.25; g.fillStyle = accent
      g.beginPath(); g.arc(px, py, dr * 0.045, 0, 7); g.fill()
      g.globalAlpha = 1; g.fillStyle = accent
      g.beginPath(); g.arc(px, py, dr * 0.022, 0, 7); g.fill()
    }
    // 頂層亮星（累積）
    for (let s = 0; s < stars; s++) star(x1 - (2 - s) * Math.min(w, h) * 0.13, top, Math.min(w, h) * 0.05, now)
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
