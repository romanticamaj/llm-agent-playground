// llm-stateless — 訊息卡疊起→整疊打包飛向 LLM 圓圈→圓圈亮→加一張新卡→整疊重送，循環。
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
  const rr = (x, y, ww, hh, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + ww, y, x + ww, y + hh, r); g.arcTo(x + ww, y + hh, x, y + hh, r); g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + ww, y, r); g.closePath() }
  let n = 1, phase = 'send', pt = 0, flash = 0, last = performance.now()
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; pt += dt
    g.clearRect(0, 0, w, h)
    const cw = w * 0.22, ch = h * 0.13, step = ch * 0.44
    const stackX = w * 0.08, baseY = h * 0.74
    const llmX = w * 0.8, llmY = h * 0.5, R = h * 0.15
    // 訊息卡疊
    for (let i = 0; i < n; i++) {
      const top = i === n - 1, y = baseY - i * step
      g.globalAlpha = Math.max(0.4, 0.9 - i * 0.06)
      g.fillStyle = top ? accent + '2e' : '#20242c'
      g.strokeStyle = top ? accent : gray; g.lineWidth = dpr
      rr(stackX, y - ch, cw, ch, ch * 0.2); g.fill(); g.stroke()
      g.globalAlpha = 0.45; g.strokeStyle = gray; g.lineWidth = dpr
      g.beginPath(); g.moveTo(stackX + cw * 0.14, y - ch * 0.55); g.lineTo(stackX + cw * 0.72, y - ch * 0.55); g.stroke()
    }
    // LLM 圓圈
    g.globalAlpha = 1
    g.fillStyle = flash > 0.5 ? accent : '#1b1f27'
    g.strokeStyle = accent; g.lineWidth = dpr * 1.5
    g.beginPath(); g.arc(llmX, llmY, R, 0, 7); g.fill(); g.stroke()
    if (flash > 0) {
      g.globalAlpha = flash * 0.45; g.strokeStyle = accent
      g.beginPath(); g.arc(llmX, llmY, R * (1 + (1 - flash) * 0.7), 0, 7); g.stroke()
      flash = Math.max(0, flash - dt * 2.2)
    }
    g.globalAlpha = 1; g.fillStyle = flash > 0.5 ? '#0d0f13' : accent
    g.font = `600 ${R * 0.52}px "Inter",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'
    g.fillText('LLM', llmX, llmY)
    // 打包飛送（整疊）
    if (phase === 'send') {
      const pr = Math.min(1, pt / 0.9), e = pr * pr * (3 - 2 * pr)
      const sx = stackX + cw / 2, sy = baseY - (n * step) / 2
      const x = sx + (llmX - sx) * e, y = sy + (llmY - sy) * e, sc = 1 - 0.45 * e
      g.globalAlpha = 0.55 + 0.35 * (1 - e)
      g.fillStyle = accent + '44'; g.strokeStyle = accent; g.lineWidth = dpr
      const pw = cw * 0.82 * sc, ph = Math.max(ch, n * step + ch * 0.5) * 0.9 * sc
      rr(x - pw / 2, y - ph / 2, pw, ph, ch * 0.2); g.fill(); g.stroke()
      if (pr >= 1) { phase = 'grow'; pt = 0; flash = 1 }
    } else if (phase === 'grow') {
      if (pt > 0.55) { n = n >= 5 ? 1 : n + 1; phase = 'pause'; pt = 0 }
    } else if (phase === 'pause') {
      if (pt > 0.5) { phase = 'send'; pt = 0 }
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
