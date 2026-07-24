// sub-agents — 主圓 context 漸濁；spawn 乾淨小圓飛出、閃思考波紋、帶亮點飛回，主圓恢復清澈；循環。
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
  const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})` }
  let turb = 0, phase = 'soil', out = 0, ripple = 0, carry = 0, pt = 0, last = performance.now()
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; pt += dt
    g.clearRect(0, 0, w, h)
    const mx = w * 0.3, my = h / 2, MR = Math.min(w, h) * 0.16
    const sx0 = mx + MR * 1.2, sy = my, sx1 = w * 0.82
    // 相位機
    if (phase === 'soil') { turb = Math.min(1, turb + dt * 0.4); if (turb >= 1) { phase = 'spawn'; out = 0 } }
    else if (phase === 'spawn') { out = Math.min(1, out + dt * 1.2); if (out >= 1) { phase = 'think'; pt = 0; ripple = 0 } }
    else if (phase === 'think') { ripple += dt; if (pt > 1.0) { phase = 'return'; carry = 1 } }
    else if (phase === 'return') { out = Math.max(0, out - dt * 1.2); if (out <= 0) phase = 'clear' }
    else if (phase === 'clear') { turb = Math.max(0, turb - dt * 2.5); if (turb <= 0) { phase = 'soil'; carry = 0 } }
    // 主圓（context 漸濁）
    g.globalAlpha = 0.9; g.fillStyle = mix(accent, '#5a5f68', turb)
    g.beginPath(); g.arc(mx, my, MR, 0, 7); g.fill()
    g.globalAlpha = 0.6; g.strokeStyle = mix(accent, gray, turb); g.lineWidth = dpr * 1.4
    g.beginPath(); g.arc(mx, my, MR, 0, 7); g.stroke()
    // 攜回亮點注入主圓
    if (phase === 'return' || phase === 'clear') {
      g.globalAlpha = 0.7 * (phase === 'clear' ? Math.max(0.2, turb) : 1); g.fillStyle = accent
      g.beginPath(); g.arc(mx, my, MR * 0.3, 0, 7); g.fill()
    }
    // 子代理小圓
    if (phase === 'spawn' || phase === 'think' || phase === 'return') {
      const sx = sx0 + (sx1 - sx0) * out, sr = MR * 0.4
      if (phase === 'think') for (let k = 0; k < 3; k++) { // 思考波紋
        const f = (ripple * 0.8 + k / 3) % 1
        g.globalAlpha = 0.35 * (1 - f); g.strokeStyle = accent; g.lineWidth = dpr
        g.beginPath(); g.arc(sx, sy, sr + f * MR * 0.9, 0, 7); g.stroke()
      }
      g.globalAlpha = 0.9; g.fillStyle = accent
      g.beginPath(); g.arc(sx, sy, sr, 0, 7); g.fill()
      if (carry && phase === 'return') { // 帶回亮點
        g.globalAlpha = 1; g.fillStyle = mix(accent, '#ffffff', 0.7)
        g.beginPath(); g.arc(sx, sy, sr * 0.35, 0, 7); g.fill()
      }
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
