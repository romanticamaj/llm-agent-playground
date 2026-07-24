// memory-map — 中央空心 LLM 圓（不記得）；外圈記憶卡繞行，每輪一張被拉進 prompt 通道進圓圈、圓圈短暫亮起，循環。
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
  const N = 6
  let ang = 0, sel = 0, phase = 'orbit', pt = 0, pull = 0, lit = 0, last = performance.now()
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; pt += dt
    g.clearRect(0, 0, w, h)
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.15, OR = Math.min(w, h) * 0.36
    ang += dt * 0.4
    // 相位機
    if (phase === 'orbit') { if (pt > 0.5) { phase = 'pull'; pt = 0; pull = 0 } }
    else if (phase === 'pull') { pull = Math.min(1, pull + dt * 1.3); if (pull >= 1) { phase = 'lit'; pt = 0; lit = 1 } }
    else if (phase === 'lit') { lit = Math.max(0, lit - dt * 1.6); if (pt > 0.7) { phase = 'orbit'; pt = 0; sel = (sel + 1) % N } }
    // 選中卡的 prompt 通道
    const selAng = ang + sel / N * Math.PI * 2
    const sox = cx + Math.cos(selAng) * OR, soy = cy + Math.sin(selAng) * OR
    if (phase === 'pull' || phase === 'lit') {
      g.globalAlpha = 0.3; g.strokeStyle = accent; g.lineWidth = dpr; g.setLineDash([dpr * 4, dpr * 4])
      g.beginPath(); g.moveTo(sox, soy); g.lineTo(cx, cy); g.stroke(); g.setLineDash([])
    }
    // 記憶卡
    for (let i = 0; i < N; i++) {
      const a = ang + i / N * Math.PI * 2
      let px = cx + Math.cos(a) * OR, py = cy + Math.sin(a) * OR
      let s = 1, fade = 1
      if (i === sel && phase === 'pull') { px = sox + (cx - sox) * pull; py = soy + (cy - soy) * pull; s = 1 - pull * 0.7 }
      if (i === sel && phase === 'lit') fade = 0
      const cw = R * 0.5 * s, ch = R * 0.36 * s
      g.globalAlpha = 0.85 * fade; g.fillStyle = accent + '33'; g.strokeStyle = accent; g.lineWidth = dpr
      g.beginPath(); g.rect(px - cw / 2, py - ch / 2, cw, ch); g.fill(); g.stroke()
    }
    // 中央 LLM 圓（空心；亮起時填充）
    if (lit > 0) {
      g.globalAlpha = lit * 0.5; g.fillStyle = accent
      g.beginPath(); g.arc(cx, cy, R * (1 + lit * 0.15), 0, 7); g.fill()
    }
    g.globalAlpha = 0.9; g.strokeStyle = lit > 0.1 ? accent : gray; g.lineWidth = dpr * 1.6
    g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke()
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
