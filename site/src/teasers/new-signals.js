// New Signals — 主線流動，中途分岔探測「訊號源」（雷達波紋），帶亮點回主線匯入
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
  const T = 4.2
  const loop = now => {
    const t = (now - start) / 1000, tc = t % T
    g.clearRect(0, 0, w, h)
    const cy = h / 2, xL = w * 0.08, xR = w * 0.92, xM = w * 0.5
    const src = [xM, cy - h * 0.3]
    const seg = (a, b) => ease(clamp((tc - a) / (b - a), 0, 1))
    g.lineCap = 'round'; g.lineJoin = 'round'
    // 主線（灰底）
    g.strokeStyle = G; g.globalAlpha = 0.4; g.lineWidth = 2 * dpr
    g.beginPath(); g.moveTo(xL, cy); g.lineTo(xR, cy); g.stroke()
    // 匯入後右半變亮
    const brightHead = xM + seg(2.4, 3.7) * (xR - xM)
    g.strokeStyle = A; g.globalAlpha = 0.9; g.lineWidth = 2.4 * dpr
    g.beginPath(); g.moveTo(xM, cy); g.lineTo(brightHead, cy); g.stroke()
    // 分岔探測線
    const bl = seg(1.0, 1.6)
    if (bl > 0) {
      g.globalAlpha = 0.5 * (1 - seg(2.6, 3.4)); g.strokeStyle = A; g.lineWidth = 1.6 * dpr
      g.setLineDash([4 * dpr, 4 * dpr])
      g.beginPath(); g.moveTo(xM, cy); g.lineTo(xM, cy + (src[1] - cy) * bl); g.stroke()
      g.setLineDash([])
    }
    // 訊號源 + 雷達波紋
    const rad = seg(1.3, 2.4)
    if (rad > 0 && tc < 3.2) {
      for (let k = 0; k < 3; k++) {
        const rp = (rad + k * 0.33) % 1
        g.globalAlpha = (1 - rp) * 0.5; g.strokeStyle = A; g.lineWidth = 1.4 * dpr
        g.beginPath(); g.arc(src[0], src[1], rp * h * 0.18, 0, 7); g.stroke()
      }
    }
    g.globalAlpha = tc < 3.4 ? 1 : 1 - seg(3.4, 4.2); g.strokeStyle = A; g.lineWidth = 2 * dpr
    g.beginPath(); g.arc(src[0], src[1], h * 0.05, 0, 7); g.stroke()
    // 左段封包 → 中心
    if (tc < 1.1) { const x = xL + seg(0, 1.0) * (xM - xL); packet(g, x, cy, A, dpr) }
    // 探測亮點：上行→源→下行匯入
    const up = seg(1.0, 1.55), down = seg(2.0, 2.45)
    if (tc > 1.0 && tc < 2.5) {
      let py
      if (down > 0) py = src[1] + (cy - src[1]) * down
      else py = cy + (src[1] - cy) * up
      packet(g, xM, py, A, dpr)
    }
    // 匯入後亮封包沿主線右行
    if (tc > 2.4 && tc < 3.7) packet(g, brightHead, cy, A, dpr)
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  const packet = (g, x, y, A, dpr) => {
    const grd = g.createRadialGradient(x, y, 0, x, y, 9 * dpr)
    grd.addColorStop(0, A); grd.addColorStop(1, A + '00')
    g.fillStyle = grd; g.beginPath(); g.arc(x, y, 9 * dpr, 0, 7); g.fill()
    g.fillStyle = A; g.beginPath(); g.arc(x, y, 3 * dpr, 0, 7); g.fill()
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
