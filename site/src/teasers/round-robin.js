// Round-robin — 亮點在三條泳道間輪轉跳躍（每條跑一小段就跳下一條），右側產出計數上升；對比左上角灰點在單條泳道走走停停；循環
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
  const start = performance.now()
  const T = 6.4, SEG = 8
  const dot = (x, y, c) => {
    const grd = g.createRadialGradient(x, y, 0, x, y, 9 * dpr)
    grd.addColorStop(0, c); grd.addColorStop(1, c + '00')
    g.fillStyle = grd; g.beginPath(); g.arc(x, y, 9 * dpr, 0, 7); g.fill()
    g.fillStyle = c; g.beginPath(); g.arc(x, y, 3.2 * dpr, 0, 7); g.fill()
  }
  const loop = now => {
    const tt = (now - start) / 1000, tc = tt % T
    g.clearRect(0, 0, w, h)
    g.lineCap = 'round'
    const x0 = w * 0.1, x1 = w * 0.72, laneY = i => h * (0.44 + i * 0.2)
    // 三條泳道
    for (let i = 0; i < 3; i++) {
      g.strokeStyle = G; g.globalAlpha = 0.3; g.lineWidth = 2 * dpr
      g.beginPath(); g.moveTo(x0, laneY(i)); g.lineTo(x1, laneY(i)); g.stroke()
    }
    // 亮點：跨全寬前進，逐段換道（跑一小段 → 跳下一條）
    const u = tc / T, s = Math.min(SEG - 1, Math.floor(u * SEG)), lu = u * SEG - s
    const cur = s % 3, nxt = (s + 1) % 3
    const x = x0 + (s + lu) / SEG * (x1 - x0)
    let y
    if (lu < 0.72) y = laneY(cur)
    else {
      const hp = (lu - 0.72) / 0.28
      y = laneY(cur) + (laneY(nxt) - laneY(cur)) * ease(hp) - Math.sin(Math.PI * hp) * h * 0.08
    }
    // 尾跡
    g.globalAlpha = 0.4; g.strokeStyle = A; g.lineWidth = 2.4 * dpr
    g.beginPath(); g.moveTo(Math.max(x0, x - (x1 - x0) / SEG * 0.6), laneY(cur)); g.lineTo(x, y); g.stroke()
    g.globalAlpha = 1; dot(x, y, A)
    // 右側產出計數（每完成一段 +1）
    const cx = w * 0.82, cw = w * 0.09, cy1 = laneY(2) + h * 0.06, ch = h * 0.5
    g.strokeStyle = G; g.globalAlpha = 0.3; g.lineWidth = 1.5 * dpr
    g.strokeRect(cx, cy1 - ch, cw, ch)
    const done = s + ease(lu), bh = ch / SEG
    for (let k = 0; k < SEG && k < done; k++) {
      g.globalAlpha = 0.85; g.fillStyle = A
      g.fillRect(cx + cw * 0.15, cy1 - (k + 1) * bh + bh * 0.15, cw * 0.7, bh * 0.7)
    }
    g.globalAlpha = 1
    // 對比：左上角灰點在單條短泳道走走停停
    const gy = h * 0.16, gx0 = w * 0.08, gx1 = w * 0.32
    g.strokeStyle = G; g.globalAlpha = 0.25; g.lineWidth = 2 * dpr
    g.beginPath(); g.moveTo(gx0, gy); g.lineTo(gx1, gy); g.stroke()
    const gT = 3.2, gp = (tt % gT) / gT, steps = 4, sp = gp * steps, gi = Math.floor(sp), gf = sp - gi
    const walked = (gi + ease(clamp((gf - 0.45) * 1.9, 0, 1))) / steps
    g.globalAlpha = 1; dot(gx0 + walked * (gx1 - gx0), gy, G)
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
