// Tool Use — 訊號點沿「大腦→點單→工具箱→結果→回大腦」環形軌道循環流動
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
  const start = performance.now()
  const ang = [-Math.PI / 2, 0, Math.PI / 2, Math.PI]
  const loop = now => {
    const t = (now - start) / 1000
    g.clearRect(0, 0, w, h)
    const cx = w / 2, cy = h / 2, rx = w * 0.3, ry = h * 0.3
    const at = a => [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]
    g.lineCap = 'round'; g.lineJoin = 'round'
    // 軌道
    g.strokeStyle = G; g.globalAlpha = 0.28; g.lineWidth = 1.4 * dpr
    g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.stroke()
    // 訊號進度
    const per = 1.5, T = per * 4, tc = t % T
    const i = Math.floor(tc / per), local = (tc % per) / per
    const trav = local < 0.34 ? 0 : ease((local - 0.34) / 0.66)
    const a0 = ang[i], a1 = ang[(i + 1) % 4] + (i === 3 ? 2 * Math.PI : 0)
    const sig = at(a0 + (a1 - a0) * trav)
    // 各站
    for (let k = 0; k < 4; k++) {
      const p = at(ang[k]), glow = k === i && local < 0.34 ? 1 - local / 0.34 : 0
      drawStation(g, k, p, glow, t)
    }
    // 訊號點 + 尾光
    g.globalAlpha = 1
    const grd = g.createRadialGradient(sig[0], sig[1], 0, sig[0], sig[1], 10 * dpr)
    grd.addColorStop(0, A); grd.addColorStop(1, A + '00')
    g.fillStyle = grd; g.beginPath(); g.arc(sig[0], sig[1], 10 * dpr, 0, 7); g.fill()
    g.fillStyle = A; g.beginPath(); g.arc(sig[0], sig[1], 3 * dpr, 0, 7); g.fill()
    raf = requestAnimationFrame(loop)
  }
  const drawStation = (g, k, p, glow, t) => {
    const s = Math.min(w, h) * 0.05, x = p[0], y = p[1]
    g.globalAlpha = 1; g.lineWidth = 2 * dpr
    g.strokeStyle = glow > 0.02 ? A : G; g.fillStyle = A
    if (k === 0) { g.beginPath(); g.arc(x, y, s, 0, 7); g.stroke() }
    else if (k === 1) { rr(g, x - s, y - s * 0.7, s * 2, s * 1.4, 3 * dpr); g.stroke()
      g.globalAlpha = 0.6; g.lineWidth = 1.4 * dpr; g.beginPath()
      g.moveTo(x - s * 0.5, y - s * 0.2); g.lineTo(x + s * 0.5, y - s * 0.2)
      g.moveTo(x - s * 0.5, y + s * 0.2); g.lineTo(x + s * 0.3, y + s * 0.2); g.stroke() }
    else if (k === 2) { g.strokeRect(x - s, y - s, s * 2, s * 2)
      g.save(); g.translate(x, y); g.rotate(t * 1.4); g.beginPath()
      for (let j = 0; j < 6; j++) { const a = j / 6 * 7; g.moveTo(Math.cos(a) * s * 0.3, Math.sin(a) * s * 0.3); g.lineTo(Math.cos(a) * s * 0.62, Math.sin(a) * s * 0.62) }
      g.stroke(); g.beginPath(); g.arc(0, 0, s * 0.3, 0, 7); g.stroke(); g.restore() }
    else { rr(g, x - s, y - s * 0.7, s * 2, s * 1.4, 3 * dpr); g.stroke()
      g.lineWidth = 1.8 * dpr; g.beginPath()
      g.moveTo(x - s * 0.4, y); g.lineTo(x - s * 0.1, y + s * 0.4); g.lineTo(x + s * 0.5, y - s * 0.4); g.stroke() }
    if (glow > 0.02) { g.globalAlpha = glow * 0.5; g.fillStyle = A
      g.beginPath(); g.arc(x, y, s * 1.8, 0, 7); g.fill(); g.globalAlpha = 1 }
  }
  const rr = (g, x, y, ww, hh, r) => { g.beginPath(); g.moveTo(x + r, y)
    g.arcTo(x + ww, y, x + ww, y + hh, r); g.arcTo(x + ww, y + hh, x, y + hh, r)
    g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + ww, y, r); g.closePath() }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
