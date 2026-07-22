// Agent Anatomy — 人形線稿依序點亮組裝，全亮後眨眼開始工作，再拆解重來
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
  const T = 6.8
  const loop = now => {
    const t = (now - start) / 1000, tc = t % T
    g.clearRect(0, 0, w, h)
    const u = Math.min(w, h * 1.02), cx = w / 2, cy = h / 2
    const seg = (a, b) => ease(clamp((tc - a) / (b - a), 0, 1))
    const brain = seg(0, 0.9), limb = seg(0.9, 1.9), spine = seg(1.9, 2.9)
    const dis = clamp((tc - 5.8) / 0.7, 0, 1)
    const vis = 1 - ease(dis)
    g.lineCap = 'round'; g.lineJoin = 'round'
    // 骨架：脊椎/肩/髖（灰）
    const neck = [cx, cy - u * 0.18], hip = [cx, cy + u * 0.12]
    g.globalAlpha = spine * vis; g.strokeStyle = G; g.lineWidth = 2.4 * dpr
    line(g, neck, hip)
    line(g, [cx - u * 0.11, cy - u * 0.13], [cx + u * 0.11, cy - u * 0.13])
    line(g, [cx - u * 0.09, hip[1]], [cx + u * 0.09, hip[1]])
    // 四肢（主色）
    g.globalAlpha = limb * vis; g.strokeStyle = A; g.lineWidth = 2.6 * dpr
    const hL = [cx - u * 0.22, cy + u * 0.02], hR = [cx + u * 0.22, cy + u * 0.02]
    line(g, [cx - u * 0.11, cy - u * 0.13], hL)
    line(g, [cx + u * 0.11, cy - u * 0.13], hR)
    line(g, [cx - u * 0.09, hip[1]], [cx - u * 0.11, cy + u * 0.34])
    line(g, [cx + u * 0.09, hip[1]], [cx + u * 0.11, cy + u * 0.34])
    dot(g, hL, 3 * dpr, A); dot(g, hR, 3 * dpr, A)
    // 大腦圓（主色）
    g.globalAlpha = brain * vis; g.strokeStyle = A; g.lineWidth = 2.6 * dpr
    const head = [cx, cy - u * 0.28], rH = u * 0.1
    g.beginPath(); g.arc(head[0], head[1], rH, 0, 7); g.stroke()
    // 眼睛 + 眨眼（全亮後）
    if (brain > 0.99 && spine > 0.99) {
      const blink = tc > 3.0 && tc < 3.36 ? Math.abs(Math.sin((tc - 3.0) / 0.36 * Math.PI)) : 0
      const eh = (1 - blink) * rH * 0.28 + 0.5 * dpr
      g.globalAlpha = vis; g.fillStyle = A
      for (const s of [-1, 1]) {
        g.beginPath(); g.ellipse(head[0] + s * rH * 0.38, head[1] - rH * 0.05, 2 * dpr, eh, 0, 0, 7); g.fill()
      }
    }
    // 工作：手邊小方塊流動
    if (tc > 3.4 && tc < 5.7) {
      g.globalAlpha = vis
      for (let k = 0; k < 3; k++) {
        const p = ((tc - 3.4) / 0.9 + k / 3) % 1
        const x = cx + u * (0.02 + p * 0.24), y = hR[1] - Math.sin(p * Math.PI) * u * 0.08
        const sz = 5 * dpr * (0.6 + 0.4 * Math.sin(p * Math.PI))
        g.fillStyle = A; g.globalAlpha = vis * (0.3 + 0.6 * Math.sin(p * Math.PI))
        g.fillRect(x - sz / 2, y - sz / 2, sz, sz)
      }
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  const line = (g, a, b) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke() }
  const dot = (g, p, r, c) => { g.fillStyle = c; g.beginPath(); g.arc(p[0], p[1], r, 0, 7); g.fill() }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
