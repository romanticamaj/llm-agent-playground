// Verify the Tool Fired — 上線不檢查衝到底爆紅✗；下線每站停留出現✓再前進，終點綠章
export default function mount(el, ctx) {
  const A = ctx.accent || '#72c2ae', G = '#8a8f98', R = '#e5646e', Gn = '#5fc08a'
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
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x))
  const ease = x => x * x * (3 - 2 * x)
  const lerp = (a, b, x) => a + (b - a) * x
  const start = performance.now()
  const T = 5.2
  const loop = now => {
    const t = (now - start) / 1000, tc = t % T
    g.clearRect(0, 0, w, h)
    const u = Math.min(w, h), xL = w * 0.1, xR = w * 0.9
    const yT = h / 2 - u * 0.17, yB = h / 2 + u * 0.17
    const stX = k => xL + (k + 1) * (xR - xL) / 4
    g.lineCap = 'round'; g.lineJoin = 'round'
    // 底軌
    for (const y of [yT, yB]) { g.strokeStyle = G; g.globalAlpha = 0.3; g.lineWidth = 2 * dpr
      g.beginPath(); g.moveTo(xL, y); g.lineTo(xR, y); g.stroke() }
    for (let k = 0; k < 4; k++) for (const y of [yT, yB]) {
      g.globalAlpha = 0.4; g.strokeStyle = G; g.lineWidth = 1.4 * dpr
      g.beginPath(); g.moveTo(stX(k), y - u * 0.02); g.lineTo(stX(k), y + u * 0.02); g.stroke() }
    // 上線：不檢查衝到底 → 爆紅
    const topP = ease(clamp(tc / 1.5, 0, 1)), topX = lerp(xL, xR, topP)
    const failed = tc > 1.5
    g.globalAlpha = 1; g.strokeStyle = failed ? R : A; g.lineWidth = 2.6 * dpr
    g.beginPath(); g.moveTo(xL, yT); g.lineTo(topX, yT); g.stroke()
    if (!failed) dotHead(g, topX, yT, A, dpr)
    if (failed) {
      const bp = ease(clamp((tc - 1.5) / 0.6, 0, 1)), fade = 1 - ease(clamp((tc - 3.6) / 1.2, 0, 1))
      g.globalAlpha = fade
      g.strokeStyle = R; g.lineWidth = 2 * dpr
      for (let a = 0; a < 8; a++) { const an = a / 8 * 7, rr2 = bp * u * 0.09
        g.beginPath(); g.moveTo(xR + Math.cos(an) * u * 0.03, yT + Math.sin(an) * u * 0.03)
        g.lineTo(xR + Math.cos(an) * (u * 0.03 + rr2), yT + Math.sin(an) * (u * 0.03 + rr2)); g.stroke() }
      drawX(g, xR, yT, u * 0.045 * bp, R, dpr)
    }
    // 下線：每站停留 ✓ 再前進 → 綠章
    const bt = clamp(tc - 0.3, 0, 99), per = 0.85
    const idx = Math.min(3, Math.floor(bt / per)), loc = (bt % per) / per
    const travelB = loc < 0.6 ? ease(loc / 0.6) : 1
    const baseX = idx === 0 ? xL : stX(idx - 1)
    const botX = bt >= 4 * per ? xR : lerp(baseX, stX(idx), travelB)
    g.globalAlpha = 1; g.strokeStyle = Gn; g.lineWidth = 2.6 * dpr
    g.beginPath(); g.moveTo(xL, yB); g.lineTo(botX, yB); g.stroke()
    for (let k = 0; k < 4; k++) {
      const passed = k < idx || (k === idx && loc > 0.6)
      if (passed && bt < 4 * per) { const pop = k === idx ? ease(clamp((loc - 0.6) / 0.3, 0, 1)) : 1
        drawCheck(g, stX(k), yB - u * 0.06, u * 0.03 * pop, Gn, dpr) }
    }
    if (bt < 4 * per) dotHead(g, botX, yB, Gn, dpr)
    else { const sp = ease(clamp((tc - (0.3 + 4 * per)) / 0.5, 0, 1))
      g.globalAlpha = sp; g.strokeStyle = Gn; g.lineWidth = 2.4 * dpr
      g.beginPath(); g.arc(xR, yB, u * 0.06, 0, 7); g.stroke()
      drawCheck(g, xR, yB, u * 0.032, Gn, dpr) }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  const dotHead = (g, x, y, c, dpr) => {
    const grd = g.createRadialGradient(x, y, 0, x, y, 8 * dpr)
    grd.addColorStop(0, c); grd.addColorStop(1, c + '00')
    g.fillStyle = grd; g.beginPath(); g.arc(x, y, 8 * dpr, 0, 7); g.fill()
    g.fillStyle = c; g.beginPath(); g.arc(x, y, 3 * dpr, 0, 7); g.fill()
  }
  const drawCheck = (g, x, y, s, c, dpr) => { g.strokeStyle = c; g.globalAlpha = 1; g.lineWidth = 2.2 * dpr
    g.beginPath(); g.moveTo(x - s, y); g.lineTo(x - s * 0.2, y + s * 0.8); g.lineTo(x + s, y - s * 0.7); g.stroke() }
  const drawX = (g, x, y, s, c, dpr) => { g.strokeStyle = c; g.lineWidth = 2.6 * dpr
    g.beginPath(); g.moveTo(x - s, y - s); g.lineTo(x + s, y + s); g.moveTo(x + s, y - s); g.lineTo(x - s, y + s); g.stroke() }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
