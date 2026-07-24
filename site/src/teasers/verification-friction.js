// Verification Friction — 迭代輪子在轉，下方摩擦條週期升降；摩擦高則慢又卡，低則飛轉留殘影
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
  const cog = (cx, cy, r, teeth, a, alpha) => {
    g.globalAlpha = alpha; g.strokeStyle = A; g.lineWidth = 2.2 * dpr
    g.beginPath(); g.arc(cx, cy, r * 0.6, 0, 7); g.stroke()
    for (let i = 0; i < teeth; i++) {
      const an = a + i / teeth * Math.PI * 2
      g.beginPath()
      g.moveTo(cx + Math.cos(an) * r * 0.7, cy + Math.sin(an) * r * 0.7)
      g.lineTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r)
      g.stroke()
    }
    for (let i = 0; i < 3; i++) {
      const an = a + i / 3 * Math.PI * 2
      g.beginPath(); g.moveTo(cx, cy)
      g.lineTo(cx + Math.cos(an) * r * 0.58, cy + Math.sin(an) * r * 0.58); g.stroke()
    }
  }
  let ang = 0, last = performance.now()
  const start = last, T = 6.0
  const loop = now => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now
    const t = (now - start) / 1000, tc = t % T
    const fric = 0.5 - 0.5 * Math.cos(tc / T * Math.PI * 2)   // 0..1 週期
    const speed = 0.5 + 5.0 * (1 - fric)                       // rad/s
    const judder = fric > 0.5 ? Math.sin(t * 33) * fric * 0.06 : 0
    ang += speed * dt
    g.clearRect(0, 0, w, h)
    const u = Math.min(w, h), cx = w / 2, cy = h * 0.42, rr = u * 0.24
    // 殘影（摩擦低時）
    const ghosts = Math.round((1 - fric) * 4)
    for (let k = ghosts; k >= 1; k--) cog(cx, cy, rr, 10, ang - k * 0.17, 0.09 * (1 - fric))
    cog(cx, cy, rr, 10, ang + judder, 1)
    g.globalAlpha = 1
    // 摩擦條
    const bL = w * 0.2, bR = w * 0.8, byy = h * 0.86, bhh = u * 0.05
    g.strokeStyle = G; g.globalAlpha = 0.4; g.lineWidth = 1.6 * dpr
    g.strokeRect(bL, byy - bhh / 2, bR - bL, bhh)
    g.globalAlpha = 1; g.fillStyle = fric > 0.5 ? G : A
    g.fillRect(bL, byy - bhh / 2, (bR - bL) * fric, bhh)
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
