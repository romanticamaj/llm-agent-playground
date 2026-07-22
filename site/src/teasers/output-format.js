// Output Formats — 左側符號雨亂碼 → 通過轉換閘 → 右側整理成整齊表格報表；循環
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
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x))
  const ease = x => x * x * (3 - 2 * x)
  const mod = (a, m) => ((a % m) + m) % m
  const syms = '#-|/\\+*.=:<>'
  const start = performance.now()
  const T = 3.2
  const loop = now => {
    const t = (now - start) / 1000, tc = t % T
    g.clearRect(0, 0, w, h)
    const u = Math.min(w, h), cy = h / 2, cols = 6, chH = u * 0.075
    g.font = `${u * 0.055}px "JetBrains Mono", monospace`
    g.textAlign = 'center'; g.textBaseline = 'middle'
    // 左側符號雨
    for (let c = 0; c < cols; c++) {
      const x = w * 0.07 + c * (w * 0.28 / cols), sp = 0.5 + mod(c * 37, 50) / 60
      const headY = t * u * sp
      for (let r = 0; r < 8; r++) {
        const y = mod(headY - r * chH, h * 0.9) + h * 0.05
        const ch = syms[mod(Math.floor(headY / chH) + c * 7 + r * 3, syms.length)]
        g.globalAlpha = (1 - r / 8) * 0.8; g.fillStyle = r === 0 ? A : G
        g.fillText(ch, x, y)
      }
    }
    // 轉換閘
    const gx = w * 0.47, gh = u * 0.34
    g.globalAlpha = 0.9; g.strokeStyle = A; g.lineWidth = 2.4 * dpr
    for (const s of [-1, 1]) { g.beginPath()
      g.moveTo(gx + s * u * 0.03, cy - gh / 2); g.lineTo(gx, cy - gh / 2 + u * 0.03)
      g.lineTo(gx, cy + gh / 2 - u * 0.03); g.lineTo(gx + s * u * 0.03, cy + gh / 2); g.stroke() }
    const gp = 0.5 + 0.5 * Math.sin(t * 5)
    g.globalAlpha = gp * 0.6; g.fillStyle = A
    g.fillRect(gx - 1.5 * dpr, cy - gh / 2, 3 * dpr, gh)
    // 轉送流
    g.globalAlpha = 1
    for (let k = 0; k < 4; k++) {
      const p = mod(t * 0.8 + k / 4, 1), px = gx + p * (w * 0.6 - gx)
      g.fillStyle = A; g.globalAlpha = Math.sin(p * Math.PI) * 0.9
      g.beginPath(); g.arc(px, cy, 2.6 * dpr, 0, 7); g.fill()
    }
    // 右側報表
    const rx0 = w * 0.6, rx1 = w * 0.94, ry0 = cy - u * 0.28, ry1 = cy + u * 0.28
    const flash = ease(clamp((tc - 0.3) / 1.0, 0, 1)) * (1 - ease(clamp((tc - 2.5) / 0.6, 0, 1)))
    g.globalAlpha = 0.5 + flash * 0.5; g.strokeStyle = flash > 0.1 ? A : G; g.lineWidth = 2 * dpr
    rr(g, rx0, ry0, rx1 - rx0, ry1 - ry0, 4 * dpr); g.stroke()
    const rows = 4, rh = (ry1 - ry0) / (rows + 1)
    g.lineWidth = 1.4 * dpr
    // 表頭
    g.globalAlpha = 0.7; g.strokeStyle = flash > 0.1 ? A : G
    g.beginPath(); g.moveTo(rx0, ry0 + rh); g.lineTo(rx1, ry0 + rh); g.stroke()
    for (let cc = 1; cc < 3; cc++) { const cxp = rx0 + (rx1 - rx0) * cc / 3
      g.globalAlpha = 0.4; g.beginPath(); g.moveTo(cxp, ry0 + rh); g.lineTo(cxp, ry1); g.stroke() }
    for (let rI = 0; rI < rows; rI++) {
      const y = ry0 + rh * (rI + 1) + rh / 2, lit = flash > rI / rows
      for (let cc = 0; cc < 3; cc++) { const x = rx0 + (rx1 - rx0) * (cc + 0.5) / 3
        g.globalAlpha = lit ? 0.9 : 0.25; g.strokeStyle = lit ? A : G; g.lineWidth = 2.2 * dpr
        g.beginPath(); g.moveTo(x - (rx1 - rx0) * 0.1, y); g.lineTo(x + (rx1 - rx0) * 0.1, y); g.stroke() }
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  const rr = (g, x, y, ww, hh, r) => { g.beginPath(); g.moveTo(x + r, y)
    g.arcTo(x + ww, y, x + ww, y + hh, r); g.arcTo(x + ww, y + hh, x, y + hh, r)
    g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + ww, y, r); g.closePath() }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
