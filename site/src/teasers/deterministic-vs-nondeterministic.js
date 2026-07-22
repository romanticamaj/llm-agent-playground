// deterministic-vs-nondeterministic — 左：多線重合成一條直線脈衝；右：同源發散成隨機扇形，不斷重繪。
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
  const N = 7
  const seeds = Array.from({ length: N }, () => ({ a: Math.random() * 6.28, b: 1 + Math.random() * 2.4, c: Math.random() * 6.28 }))
  let last = performance.now(), t = 0
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt
    g.clearRect(0, 0, w, h)
    const cy = h / 2, lw = Math.max(1, dpr * 1.2)
    g.globalAlpha = 0.12; g.strokeStyle = gray; g.lineWidth = dpr
    g.beginPath(); g.moveTo(w / 2, h * 0.16); g.lineTo(w / 2, h * 0.84); g.stroke()
    // LEFT — 決定性：所有線重合為一，脈衝沿線行進
    const lx0 = w * 0.09, lx1 = w * 0.44
    for (let s = -2; s <= 2; s++) {
      g.globalAlpha = 0.1; g.strokeStyle = gray; g.lineWidth = lw
      g.beginPath(); g.moveTo(lx0, cy + s * dpr * 0.5); g.lineTo(lx1, cy + s * dpr * 0.5); g.stroke()
    }
    const pulse = (t % 1.6) / 1.6, px = lx0 + (lx1 - lx0) * pulse
    const grad = g.createLinearGradient(px - w * 0.13, 0, px + w * 0.05, 0)
    grad.addColorStop(0, accent + '00'); grad.addColorStop(0.75, accent); grad.addColorStop(1, accent + '00')
    g.globalAlpha = 1; g.strokeStyle = grad; g.lineWidth = lw * 2.2
    g.beginPath(); g.moveTo(lx0, cy); g.lineTo(lx1, cy); g.stroke()
    g.fillStyle = accent
    g.beginPath(); g.arc(px, cy, lw * 2.2, 0, 7); g.fill()
    g.beginPath(); g.arc(lx0, cy, lw * 1.6, 0, 7); g.fill()
    // RIGHT — 非決定性：同起點發散為隨機路徑，週期重繪
    const rx0 = w * 0.56, rx1 = w * 0.92, spread = h * 0.31
    const life = t % 3, grow = Math.min(1, life / 2)
    const fade = life > 2.4 ? Math.max(0, 1 - (life - 2.4) / 0.6) : 1
    if (life < dt) for (const s of seeds) { s.a = Math.random() * 6.28; s.b = 1 + Math.random() * 2.4; s.c = Math.random() * 6.28 }
    g.lineWidth = lw; g.strokeStyle = accent
    const steps = 26
    for (let i = 0; i < N; i++) {
      const s = seeds[i]
      g.globalAlpha = fade * 0.55
      g.beginPath()
      const kmax = steps * grow
      for (let k = 0; k <= kmax; k++) {
        const u = k / steps, x = rx0 + (rx1 - rx0) * u
        const yy = cy + spread * u * (Math.sin(s.a + u * s.b * 4) * 0.6 + Math.sin(s.c + u * 7) * 0.4)
        k === 0 ? g.moveTo(x, yy) : g.lineTo(x, yy)
      }
      g.stroke()
    }
    g.globalAlpha = 0.95; g.fillStyle = gray
    g.beginPath(); g.arc(rx0, cy, lw * 1.8, 0, 7); g.fill()
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
