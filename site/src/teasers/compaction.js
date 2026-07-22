// compaction — 容量條逐格填滿；到頂觸發壓縮：多數方塊變灰縮小消失，少數精華壓成一小段亮色，續填循環。
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
  const C = 14
  let blocks = [], phase = 'fill', addT = 0, comp = 0, last = performance.now()
  const geom = () => {
    const bx0 = w * 0.08, bx1 = w * 0.92, by = h * 0.4, bh = h * 0.2
    return { bx0, bx1, by, bh, bw: (bx1 - bx0) / C }
  }
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now
    const { bx0, bx1, by, bh, bw } = geom()
    g.clearRect(0, 0, w, h)
    if (phase === 'fill') {
      addT += dt
      if (addT > 0.16 && blocks.length < C) {
        addT = 0; const i = blocks.length
        blocks.push({ x: bx0 + i * bw, tx: bx0 + i * bw, alpha: 0, sc: 1, ess: Math.random() < 0.22 })
      }
      for (const b of blocks) b.alpha = Math.min(1, b.alpha + dt * 6)
      if (blocks.length >= C && blocks.every(b => b.alpha >= 1)) {
        phase = 'compact'; comp = 0; let ki = 0
        for (const b of blocks) { if (b.ess) { b.tx = bx0 + ki * bw; ki++; b.dead = false } else b.dead = true }
      }
    } else if (phase === 'compact') {
      comp += dt / 0.75
      for (const b of blocks) {
        b.x += (b.tx - b.x) * Math.min(1, dt * 6)
        if (b.dead) { b.alpha = Math.max(0, b.alpha - dt * 3); b.sc = Math.max(0.15, b.sc - dt * 2.4) }
      }
      if (comp >= 1) {
        blocks = blocks.filter(b => b.ess)
        blocks.forEach((b, i) => { b.x = b.tx = bx0 + i * bw })
        phase = 'fill'
      }
    }
    // 容量條外框
    g.globalAlpha = 0.35; g.strokeStyle = gray; g.lineWidth = dpr
    g.beginPath(); g.rect(bx0, by, bx1 - bx0, bh); g.stroke()
    // 方塊
    for (const b of blocks) {
      const bwv = bw * 0.86 * b.sc, bhv = bh * 0.72 * b.sc
      const cx = b.x + bw * 0.5, cy = by + bh * 0.5
      g.globalAlpha = b.alpha
      g.fillStyle = b.dead ? '#3a4048' : (b.ess ? accent : accent + '55')
      g.beginPath(); g.rect(cx - bwv / 2, cy - bhv / 2, bwv, bhv); g.fill()
      if (b.ess && !b.dead) { g.globalAlpha = b.alpha * 0.5; g.strokeStyle = accent; g.lineWidth = dpr; g.stroke() }
    }
    // 壓縮閃光
    if (phase === 'compact') {
      g.globalAlpha = Math.max(0, 0.5 - comp * 0.5); g.fillStyle = accent
      g.fillRect(bx0, by, bx1 - bx0, bh)
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
