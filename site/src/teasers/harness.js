// harness — 中央大腦圓逐步套上三圈裝備環（身體/工具/韁繩），全套後輸出光束由散射收束變窄穩定；拆掉重來循環。
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
  const RINGS = 3
  let rings = 0, phase = 'equip', pt = 0, foc = 0, last = performance.now()
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; pt += dt
    g.clearRect(0, 0, w, h)
    const cx = w * 0.38, cy = h / 2, R = Math.min(w, h) * 0.11
    // 相位機
    if (phase === 'equip') { if (pt > 0.6) { pt = 0; if (rings < RINGS) rings++; else phase = 'focus' } }
    else if (phase === 'focus') { foc = Math.min(1, foc + dt * 0.9); if (foc >= 1 && pt > 1.6) { phase = 'hold'; pt = 0 } }
    else if (phase === 'hold') { if (pt > 0.9) { phase = 'strip'; pt = 0 } }
    else if (phase === 'strip') { foc = Math.max(0, foc - dt * 2); if (pt > 0.5) { pt = 0; if (rings > 0) rings--; else phase = 'equip' } }
    // 輸出光束（右側；散射→聚束）
    const spread = (1 - foc) * 0.5 + 0.03, rays = 9, len = w * 0.5
    for (let i = 0; i < rays; i++) {
      const t = (i / (rays - 1) - 0.5) * 2, a = t * spread
      g.globalAlpha = 0.12 + foc * 0.28 * (1 - Math.abs(t))
      g.strokeStyle = accent; g.lineWidth = dpr * (1 + foc * 1.6)
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len); g.stroke()
    }
    // 裝備環（一圈圈亮起）
    for (let i = 0; i < RINGS; i++) {
      const rr = R * (1.5 + i * 0.55), on = i < rings
      g.globalAlpha = on ? 0.9 : 0.2; g.strokeStyle = on ? accent : gray
      g.lineWidth = dpr * (on ? 2 : 1); g.setLineDash(on ? [] : [dpr * 3, dpr * 4])
      g.beginPath(); g.arc(cx, cy, rr, 0, 7); g.stroke(); g.setLineDash([])
    }
    // 中央大腦圓
    g.globalAlpha = 0.25; g.fillStyle = accent
    g.beginPath(); g.arc(cx, cy, R * (1 + 0.05 * Math.sin(now / 400)), 0, 7); g.fill()
    g.globalAlpha = 1; g.fillStyle = '#1b1f27'; g.strokeStyle = accent; g.lineWidth = dpr * 1.6
    g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill(); g.stroke()
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
