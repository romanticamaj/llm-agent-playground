// Teaser: 三選項滑塊依序切換位置，下方組出 prompt 光帶，完成時亮一下；循環
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
  const ease = (x) => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x)
  const CYCLE = 4200
  const rows = [{ from: 0.5, to: 0.5 }, { from: 0.5, to: 0.5 }, { from: 0.5, to: 0.5 }]
  let cyc = -1
  const bar = (x, y, bw, bh) => {
    if (g.roundRect) { g.beginPath(); g.roundRect(x, y, bw, bh, bh / 2) }
    else { g.beginPath(); g.rect(x, y, bw, bh) }
  }
  const loop = (now) => {
    const c = Math.floor(now / CYCLE)
    const p = (now % CYCLE) / CYCLE
    if (c !== cyc) { cyc = c; for (const r of rows) { r.from = r.to; r.to = 0.2 + Math.random() * 0.6 } }
    const dpr = devicePixelRatio
    g.clearRect(0, 0, w, h)
    const trackX = w * 0.18, trackW = w * 0.64
    const settled = []
    for (let i = 0; i < 3; i++) {
      const y = h * (0.16 + i * 0.16)
      // 依序切換：第 i 軌延後啟動
      const seg = ease((p - i * 0.2) / 0.28)
      const pos = rows[i].from + (rows[i].to - rows[i].from) * seg
      settled.push({ pos, done: seg })
      g.strokeStyle = GRAY; g.globalAlpha = 0.5; g.lineWidth = 1.5 * dpr
      g.beginPath(); g.moveTo(trackX, y); g.lineTo(trackX + trackW, y); g.stroke()
      const kx = trackX + trackW * pos
      g.globalAlpha = 1; g.fillStyle = A
      g.beginPath(); g.arc(kx, y, 5 * dpr, 0, 7); g.fill()
    }
    // prompt 光帶（長度/顏色隨選項變化）
    const barX = w * 0.18, barY = h * 0.78, bh = h * 0.06
    const avg = (settled[0].pos + settled[1].pos + settled[2].pos) / 3
    const allDone = Math.min(settled[0].done, settled[1].done, settled[2].done)
    const barW = trackW * (0.35 + avg * 0.65) * ease(Math.min(1, p / 0.7))
    const grad = g.createLinearGradient(barX, 0, barX + barW, 0)
    grad.addColorStop(0, A + '33'); grad.addColorStop(1, A)
    g.fillStyle = grad; g.globalAlpha = 0.9
    bar(barX, barY - bh / 2, barW, bh); g.fill()
    // 完成閃光
    if (allDone >= 1) {
      const fl = Math.max(0, 1 - ((p - 0.7) / 0.25))
      g.globalAlpha = 0.5 * fl; g.fillStyle = A
      bar(barX, barY - bh / 2, barW, bh); g.fill()
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
