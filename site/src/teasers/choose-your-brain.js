// choose-your-brain — 三顆大小不同的腦（128K/200K/1M），任務點游走；停在哪顆哪顆亮，大任務只有 1M 亮。
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
  const defs = [
    { fx: 0.2, fr: 0.12, label: '128K', cap: 0 },
    { fx: 0.5, fr: 0.16, label: '200K', cap: 1 },
    { fx: 0.82, fr: 0.22, label: '1M', cap: 2 },
  ]
  let target = 0, tx = 0.2, ty = 0.52, dwell = 0, last = performance.now(), t = 0
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt
    g.clearRect(0, 0, w, h)
    const load = 0.5 + 0.5 * Math.sin(t * 0.6) // 0..1 任務大小
    const need = load > 0.66 ? 2 : load > 0.33 ? 1 : 0 // 需要的最小容量等級
    const cs = defs.map(d => ({ x: d.fx * w, y: 0.52 * h, r: d.fr * h }))
    const tg = cs[target]
    tx += (defs[target].fx - tx) * Math.min(1, dt * 3)
    ty += (0.52 - ty) * Math.min(1, dt * 3)
    const near = Math.hypot(tx * w - tg.x, ty * h - tg.y) < tg.r * 0.4
    if (near) {
      dwell += dt
      if (dwell > 0.9) {
        dwell = 0
        if (need === 2) target = 2
        else { const opts = defs.filter(d => d.cap >= need).map(d => defs.indexOf(d)); target = opts[(Math.random() * opts.length) | 0] }
      }
    }
    const active = near ? target : -1
    // 三顆腦
    for (let i = 0; i < 3; i++) {
      const c = cs[i], on = i === active
      g.globalAlpha = on ? 1 : 0.28
      g.fillStyle = on ? accent + '2a' : '#1b1f27'
      g.strokeStyle = on ? accent : gray; g.lineWidth = dpr * (on ? 1.8 : 1)
      g.beginPath(); g.arc(c.x, c.y, c.r, 0, 7); g.fill(); g.stroke()
      if (on) { g.globalAlpha = 0.4; g.beginPath(); g.arc(c.x, c.y, c.r * (1.08 + 0.05 * Math.sin(t * 5)), 0, 7); g.stroke() }
      g.globalAlpha = on ? 0.95 : 0.4; g.fillStyle = on ? accent : gray
      g.font = `600 ${c.r * 0.4}px "Inter",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'
      g.fillText(defs[i].label, c.x, c.y)
    }
    // 任務點
    const px = tx * w, py = ty * h, pr2 = h * (0.02 + load * 0.055)
    g.globalAlpha = 0.35; g.fillStyle = accent
    g.beginPath(); g.arc(px, py - h * 0.32, pr2 * 1.6, 0, 7); g.fill()
    g.globalAlpha = 1; g.fillStyle = load > 0.66 ? '#e8985a' : accent
    g.beginPath(); g.arc(px, py - h * 0.32, pr2, 0, 7); g.fill()
    g.globalAlpha = 0.4; g.strokeStyle = gray; g.lineWidth = dpr
    g.beginPath(); g.moveTo(px, py - h * 0.32 + pr2); g.lineTo(px, py - tg.r * 0.4); g.stroke()
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
