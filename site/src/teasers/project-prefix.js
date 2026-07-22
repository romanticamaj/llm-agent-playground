// Project = Fixed Prefix — 記憶+Project+輸入 三段拼接 → 流入圓圈吐出波形；Project 每輪換色
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
  const lerp = (a, b, x) => a + (b - a) * x
  const pal = [A, '#d9a866', '#a794d4', '#cf8b96']
  const start = performance.now()
  const T = 4.6
  const loop = now => {
    const t = (now - start) / 1000, tc = t % T
    const round = Math.floor((now - start) / 1000 / T)
    const pc = pal[round % pal.length]
    g.clearRect(0, 0, w, h)
    const cy = h / 2, u = Math.min(w, h)
    const seg = (a, b) => ease(clamp((tc - a) / (b - a), 0, 1))
    const barL = w * 0.1, bw = w * 0.42 / 3, bh = u * 0.13
    const cCx = w * 0.72, cR = u * 0.11
    const flow = seg(1.8, 2.7)
    const cols = ['#4b515a', pc, '#e8eaed'], labs = ['MEM', 'PRJ', 'IN']
    // 三段色塊拼接
    if (flow < 0.99) {
      g.globalAlpha = 1 - flow
      for (let k = 0; k < 3; k++) {
        const p = seg(k * 0.18, k * 0.18 + 0.8)
        const tx = lerp(-w * 0.35, 0, p)
        const x = barL + k * bw + tx + flow * (cCx - (barL + w * 0.21))
        const sh = 1 - flow * 0.7
        g.fillStyle = cols[k]
        rr(g, x, cy - bh / 2 * sh, bw + 0.5, bh * sh, 3 * dpr); g.fill()
        if (p > 0.9 && flow < 0.3) {
          g.fillStyle = k === 2 ? '#0b0d10' : '#0b0d10'; g.globalAlpha = (1 - flow) * 0.85
          g.font = `600 ${u * 0.045}px "JetBrains Mono", monospace`
          g.textAlign = 'center'; g.textBaseline = 'middle'
          g.fillText(labs[k], x + bw / 2, cy)
          g.globalAlpha = 1 - flow
        }
      }
    }
    // 圓圈
    const pulse = flow > 0.5 ? Math.sin(seg(1.8, 2.7) * Math.PI) : 0
    g.globalAlpha = 1; g.strokeStyle = flow > 0.6 ? pc : G; g.lineWidth = 2.2 * dpr
    g.beginPath(); g.arc(cCx, cy, cR * (1 + pulse * 0.15), 0, 7); g.stroke()
    if (flow > 0.6) { g.fillStyle = pc; g.globalAlpha = flow * 0.5
      g.beginPath(); g.arc(cCx, cy, cR * 0.5, 0, 7); g.fill(); g.globalAlpha = 1 }
    // 吐出波形（依 round 變形）
    const wv = seg(2.7, 3.9)
    if (wv > 0) {
      const x0 = cCx + cR, x1 = w * 0.95, freq = 3 + (round % 3), amp = u * (0.05 + (round % 2) * 0.03)
      g.strokeStyle = pc; g.lineWidth = 2 * dpr; g.globalAlpha = 0.95 * (1 - seg(4.0, 4.6))
      g.beginPath()
      const xe = lerp(x0, x1, wv)
      for (let x = x0; x <= xe; x += 2 * dpr) {
        const ph = (x - x0) / (x1 - x0)
        const y = cy + Math.sin(ph * freq * Math.PI * 2 + tc * 4) * amp * Math.sin(ph * Math.PI)
        x === x0 ? g.moveTo(x, y) : g.lineTo(x, y)
      }
      g.stroke()
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
