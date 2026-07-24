// Vampire Gremlin — 桌面綠色小方塊被上方小鬼剪影持續吸走，剩下紅色大方塊緩慢放大脈動；循環重擺
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
  const start = performance.now()
  const M = 5, T = 6.5
  const loop = now => {
    const t = (now - start) / 1000, tc = t % T
    g.clearRect(0, 0, w, h)
    const u = Math.min(w, h), deskY = h * 0.78
    // 桌面線
    g.globalAlpha = 0.4; g.strokeStyle = G; g.lineWidth = 1.6 * dpr
    g.beginPath(); g.moveTo(w * 0.1, deskY); g.lineTo(w * 0.96, deskY); g.stroke()
    // 小鬼剪影（頭 + 雙尖耳）
    const gx = w * 0.52, gy = h * 0.2, gr = u * 0.11
    g.globalAlpha = 0.85; g.fillStyle = G
    g.beginPath()
    g.moveTo(gx - gr * 0.7, gy - gr * 0.15)
    g.lineTo(gx - gr * 0.95, gy - gr * 1.35)
    g.lineTo(gx - gr * 0.2, gy - gr * 0.6)
    g.lineTo(gx + gr * 0.2, gy - gr * 0.6)
    g.lineTo(gx + gr * 0.95, gy - gr * 1.35)
    g.lineTo(gx + gr * 0.7, gy - gr * 0.15)
    g.arc(gx, gy, gr * 0.74, -0.2, Math.PI + 0.2)
    g.closePath(); g.fill()
    g.save(); g.globalCompositeOperation = 'destination-out'   // 挖空雙眼
    for (const s of [-1, 1]) { g.beginPath(); g.arc(gx + s * gr * 0.32, gy - gr * 0.08, gr * 0.13, 0, 7); g.fill() }
    g.restore(); g.globalAlpha = 1
    // 紅色大方塊：隨綠塊被吸走緩慢放大 + 脈動
    const eaten = clamp(tc / (T - 1.1) * M, 0, M)
    const grow = 0.5 + 0.5 * (eaten / M), pulse = 1 + 0.05 * Math.sin(t * 2.2)
    const rs = u * (0.1 + 0.09 * grow) * pulse, rx = w * 0.22
    g.fillStyle = R; g.fillRect(rx - rs / 2, deskY - rs, rs, rs)
    // 綠色小方塊被吸走
    const gs = u * 0.05
    for (let i = 0; i < M; i++) {
      const bx = w * 0.42 + i * u * 0.12, prog = clamp(eaten - i, 0, 1)
      if (prog >= 1) continue
      const suck = ease(prog)
      const x = bx + (gx - bx) * suck, y = (deskY - gs) + (gy - (deskY - gs)) * suck
      const s = gs * (1 - suck * 0.85)
      if (suck > 0.02 && suck < 0.97) {
        g.globalAlpha = 0.3; g.strokeStyle = Gn; g.lineWidth = 1.2 * dpr
        g.beginPath(); g.moveTo(x, y); g.lineTo(gx, gy + gr * 0.4); g.stroke()
      }
      g.globalAlpha = 1 - suck * 0.4; g.fillStyle = Gn
      g.fillRect(x - s / 2, y - s / 2, s, s)
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
