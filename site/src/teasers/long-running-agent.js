// Long-Running Agent — 接力賽：跑者跑一段熄滅，交棒落地成日誌格，新跑者接續；下方進度格逐格蓋章
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
  const LEGS = 4
  const start = performance.now()
  const loop = now => {
    const t = (now - start) / 1000, legT = 1.5, total = LEGS * legT
    const tc = t % (total + 0.9)
    g.clearRect(0, 0, w, h)
    const trackY = h * 0.42, x0 = w * 0.12, x1 = w * 0.88, span = x1 - x0
    const cellY = h * 0.72, cw = span / LEGS
    g.lineCap = 'round'
    g.strokeStyle = G; g.globalAlpha = 0.28; g.lineWidth = 1.5 * dpr
    g.beginPath(); g.moveTo(x0, trackY); g.lineTo(x1, trackY); g.stroke()
    g.globalAlpha = 0.5; g.lineWidth = 1.4 * dpr
    g.beginPath(); g.moveTo(x1, trackY - h * 0.12); g.lineTo(x1, trackY + h * 0.02); g.stroke()
    g.globalAlpha = 1
    const done = Math.min(LEGS, Math.floor(tc / legT))
    const leg = Math.floor(tc / legT), local = (tc % legT) / legT
    for (let i = 0; i < LEGS; i++) {
      const bx = x0 + i * cw + cw * 0.12, bw = cw * 0.76
      g.lineWidth = 1.4 * dpr
      const stamped = i < done, stamping = i === leg && tc < total
      const pop = stamping ? ease(Math.min(1, local / 0.3)) : (stamped ? 1 : 0)
      g.strokeStyle = pop > 0.02 ? A : G; g.globalAlpha = pop > 0.02 ? 1 : 0.35
      rr(bx, cellY, bw, h * 0.11, 3 * dpr); g.stroke()
      if (pop > 0.02) { g.globalAlpha = pop * 0.14; g.fillStyle = A; g.fill()
        g.globalAlpha = pop; g.strokeStyle = A; g.lineWidth = 2 * dpr
        const mx = bx + bw * 0.5, my = cellY + h * 0.055
        g.beginPath(); g.moveTo(mx - bw * 0.14, my); g.lineTo(mx - bw * 0.03, my + h * 0.028)
        g.lineTo(mx + bw * 0.17, my - h * 0.03); g.stroke() }
      g.globalAlpha = 1
    }
    if (tc < total) {
      const rx = x0 + (leg + ease(local)) * cw
      if (local < 0.12) { const f = 1 - local / 0.12; g.globalAlpha = f * 0.5; g.fillStyle = A
        g.beginPath(); g.arc(x0 + leg * cw, trackY, cw * 0.18 * (1 + f), 0, 7); g.fill(); g.globalAlpha = 1 }
      const fade = local > 0.88 ? 1 - (local - 0.88) / 0.12 : 1
      const grd = g.createRadialGradient(rx, trackY, 0, rx, trackY, 12 * dpr)
      grd.addColorStop(0, A); grd.addColorStop(1, A + '00')
      g.globalAlpha = fade; g.fillStyle = grd
      g.beginPath(); g.arc(rx, trackY, 12 * dpr, 0, 7); g.fill()
      g.fillStyle = A; g.beginPath(); g.arc(rx, trackY, 3.4 * dpr, 0, 7); g.fill()
      g.globalAlpha = 1
    } else {
      const f = 1 - (tc - total) / 0.9; g.globalAlpha = f * 0.5; g.fillStyle = A
      g.beginPath(); g.arc(x1, trackY, cw * 0.3, 0, 7); g.fill(); g.globalAlpha = 1
    }
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
