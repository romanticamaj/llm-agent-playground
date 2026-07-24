// Teaser: 精緻齒輪轉動 → 新世代脈衝掃過 → 齒輪變灰龜裂停轉 → 淡出重建；循環
export default function mount(el, ctx) {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'width:100%;height:100%;display:block'
  el.appendChild(canvas)
  const g = canvas.getContext('2d')
  const GRAY = '#8a8f98'
  const A = ctx.accent
  let w, h, raf
  const resize = () => {
    const r = el.getBoundingClientRect()
    w = canvas.width = Math.max(2, r.width * devicePixelRatio)
    h = canvas.height = Math.max(2, r.height * devicePixelRatio)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(el)
  const CYCLE = 5000
  const gear = (cx, cy, rad, teeth, rot, col, alpha) => {
    g.globalAlpha = alpha
    g.strokeStyle = col; g.lineWidth = 2 * devicePixelRatio
    g.beginPath()
    for (let i = 0; i <= teeth * 2; i++) {
      const a = rot + (i / (teeth * 2)) * Math.PI * 2
      const rd = rad * (i % 2 === 0 ? 1 : 0.82)
      const x = cx + Math.cos(a) * rd, y = cy + Math.sin(a) * rd
      i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)
    }
    g.closePath(); g.stroke()
    g.beginPath(); g.arc(cx, cy, rad * 0.32, 0, 7); g.stroke()
  }
  const loop = (now) => {
    const p = (now % CYCLE) / CYCLE
    const dpr = devicePixelRatio
    g.clearRect(0, 0, w, h)
    const spin = now / 900
    // 階段：0-0.5 運轉；0.5 脈衝；0.5-0.7 變灰龜裂；0.7-0.85 淡出；0.85-1 重建
    let col = A, rot = spin, alpha = 1, cracked = false
    if (p >= 0.5 && p < 0.7) { col = GRAY; rot = 0.6; cracked = true }
    else if (p >= 0.7 && p < 0.85) { col = GRAY; rot = 0.6; cracked = true; alpha = 1 - (p - 0.7) / 0.15 }
    else if (p >= 0.85) { col = A; rot = spin; alpha = (p - 0.85) / 0.15 }
    const cx = w * 0.42, cy = h * 0.5, R = h * 0.24
    gear(cx, cy, R, 10, rot, col, Math.max(0.12, alpha))
    gear(cx + R * 1.55, cy - R * 0.3, R * 0.66, 8, -rot * 1.5 + 0.3, col, Math.max(0.12, alpha))
    // 龜裂
    if (cracked) {
      g.strokeStyle = GRAY; g.globalAlpha = 0.7 * alpha; g.lineWidth = 1 * dpr
      g.beginPath()
      g.moveTo(cx - R * 0.4, cy - R * 0.5); g.lineTo(cx + R * 0.1, cy)
      g.lineTo(cx - R * 0.2, cy + R * 0.5)
      g.moveTo(cx + R * 0.1, cy); g.lineTo(cx + R * 0.5, cy + R * 0.2)
      g.stroke()
    }
    // 新世代脈衝掃過
    if (p > 0.46 && p < 0.6) {
      const sw = (p - 0.46) / 0.14
      const lx = sw * w * 1.1
      const grad = g.createLinearGradient(lx - w * 0.16, 0, lx + w * 0.04, 0)
      grad.addColorStop(0, A + '00'); grad.addColorStop(1, A)
      g.globalAlpha = 0.85 * (1 - sw)
      g.fillStyle = grad
      g.fillRect(lx - w * 0.16, 0, w * 0.2, h)
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
