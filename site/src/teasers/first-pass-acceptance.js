// First-Pass Acceptance — 左：反覆脫靶多次才中（計數器跳）；右：一箭正中紅心（光環）；兩側交替
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
  const ease = x => 1 - (1 - x) * (1 - x)
  const miss = [[-0.7, -0.55], [0.75, 0.4], [-0.5, 0.7]] // 前三次脫靶偏移（相對靶半徑）
  const target = (cx, cy, rad, active, hit) => {
    for (let i = 3; i >= 1; i--) {
      g.lineWidth = 1.5 * dpr; g.globalAlpha = active ? 0.9 : 0.4
      g.strokeStyle = (hit && i === 1) ? A : G
      g.beginPath(); g.arc(cx, cy, rad * i / 3, 0, 7); g.stroke()
    }
    g.globalAlpha = 1; g.fillStyle = hit ? A : G
    g.beginPath(); g.arc(cx, cy, rad * 0.14, 0, 7); g.fill()
  }
  const arrow = (fx, fy, tx, ty, p) => {
    const x = fx + (tx - fx) * p, y = fy + (ty - fy) * p
    const a = Math.atan2(ty - fy, tx - fx), L = 14 * dpr
    g.strokeStyle = A; g.lineWidth = 2 * dpr; g.lineCap = 'round'
    g.beginPath(); g.moveTo(x - Math.cos(a) * L, y - Math.sin(a) * L); g.lineTo(x, y); g.stroke()
    g.beginPath(); g.moveTo(x, y)
    g.lineTo(x - Math.cos(a - 0.4) * 6 * dpr, y - Math.sin(a - 0.4) * 6 * dpr)
    g.moveTo(x, y); g.lineTo(x - Math.cos(a + 0.4) * 6 * dpr, y - Math.sin(a + 0.4) * 6 * dpr)
    g.stroke()
  }
  const num = (x, y, n, sz) => { g.fillStyle = G; g.globalAlpha = 0.85
    g.font = `600 ${sz}px "Inter", system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'
    g.fillText(String(n), x, y); g.globalAlpha = 1 }
  const start = performance.now()
  const loop = now => {
    const t = (now - start) / 1000, shot = 0.95, LN = 4, Ldur = LN * shot, Rdur = 2.4
    const per = Ldur + Rdur, tc = t % per, leftPhase = tc < Ldur
    g.clearRect(0, 0, w, h)
    const rad = Math.min(w, h) * 0.17, cy = h * 0.5
    const lcx = w * 0.27, rcx = w * 0.73
    if (leftPhase) {
      const k = Math.floor(tc / shot), lp = (tc % shot) / shot
      const hitNow = k === LN - 1
      const off = hitNow ? [0, 0] : miss[k]
      const tx = lcx + off[0] * rad * 0.9, ty = cy + off[1] * rad * 0.9
      const fx = w * 0.03, fy = cy + rad * 1.3
      target(lcx, cy, rad, true, hitNow && lp > 0.55)
      if (lp < 0.6) arrow(fx, fy, tx, ty, ease(lp / 0.6))
      else { arrow(fx, fy, tx, ty, 1)
        if (!hitNow) { g.strokeStyle = G; g.globalAlpha = 0.5; g.lineWidth = 1.3 * dpr
          g.beginPath(); g.arc(tx, ty, rad * 0.1, 0, 7); g.stroke(); g.globalAlpha = 1 } }
      num(lcx, cy + rad * 1.7, Math.min(k + (lp > 0.55 ? 1 : 0), LN), rad * 0.38)
      target(rcx, cy, rad, false, false)
    } else {
      const lp = (tc - Ldur) / Rdur
      target(lcx, cy, rad, false, false)
      const hit = lp > 0.42
      target(rcx, cy, rad, true, hit)
      const fx = w * 0.97, fy = cy + rad * 1.3
      if (lp < 0.42) arrow(fx, fy, rcx, cy, ease(lp / 0.42))
      else { arrow(fx, fy, rcx, cy, 1)
        const gl = 1 - (lp - 0.42) / 0.58; g.strokeStyle = A; g.globalAlpha = gl * 0.7
        g.lineWidth = 2 * dpr; g.beginPath()
        g.arc(rcx, cy, rad * (0.4 + (1 - gl) * 0.9), 0, 7); g.stroke(); g.globalAlpha = 1 }
    }
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
