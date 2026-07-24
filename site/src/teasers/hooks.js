// hooks — 點反覆衝向發光閘門：虛線閘直接穿過閃紅；實體閘被彈回閃綠並標 exit 2；交替循環。
export default function mount(el, ctx) {
  const accent = ctx?.accent || '#8ea9e8'
  const gray = '#8a8f98'
  const red = '#e5484d', green = '#3fbf7f'
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
  let solid = false, x = -1, dir = 1, flash = 0, blocked = false, pt = 0, phase = 'run', last = performance.now()
  const reset = () => { x = -w * 0.02; dir = 1; blocked = false; flash = 0 }
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now
    if (x < -0.5) reset()
    g.clearRect(0, 0, w, h)
    const gx = w * 0.62, cy = h / 2, gh = h * 0.5, R = Math.min(w, h) * 0.045, speed = w * 0.55
    flash = Math.max(0, flash - dt * 2.2)
    if (phase === 'run') {
      x += dir * speed * dt
      if (dir > 0 && !blocked && x >= gx - R) { flash = 1; if (solid) { dir = -1; blocked = true } }
      if (x > w * 1.05 || x < -w * 0.05) { phase = 'gap'; pt = 0 }
    } else { pt += dt; if (pt > 0.5) { solid = !solid; reset(); phase = 'run' } }
    const fc = solid ? green : red
    // 閘門光暈
    if (flash > 0) {
      g.globalAlpha = flash * 0.4; g.strokeStyle = fc; g.lineWidth = dpr * 6
      g.beginPath(); g.moveTo(gx, cy - gh / 2); g.lineTo(gx, cy + gh / 2); g.stroke()
    }
    // 閘門本體（虛線=虛版 / 實線=實體）
    g.globalAlpha = 0.9; g.strokeStyle = flash > 0 ? fc : (solid ? accent : gray); g.lineWidth = dpr * 2.2
    if (!solid) g.setLineDash([dpr * 5, dpr * 5])
    g.beginPath(); g.moveTo(gx, cy - gh / 2); g.lineTo(gx, cy + gh / 2); g.stroke(); g.setLineDash([])
    // exit 2 小標（實體彈回時）
    if (solid && blocked) {
      g.globalAlpha = 0.85; g.fillStyle = green; g.textAlign = 'center'; g.textBaseline = 'middle'
      g.font = `600 ${Math.round(h * 0.09)}px "Inter", system-ui, sans-serif`
      g.fillText('exit 2', gx, cy - gh * 0.5 - h * 0.06)
    }
    // 衝刺點
    g.globalAlpha = 0.28; g.fillStyle = accent
    g.beginPath(); g.arc(x, cy, R * 1.8, 0, 7); g.fill()
    g.globalAlpha = 1; g.fillStyle = accent
    g.beginPath(); g.arc(x, cy, R, 0, 7); g.fill()
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
