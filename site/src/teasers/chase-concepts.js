// Teaser: 工具膠囊持續向下漂落並淡出，底部三根概念石柱恆定發光
export default function mount(el, ctx) {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'width:100%;height:100%;display:block'
  el.appendChild(canvas)
  const g = canvas.getContext('2d')
  const GRAY = '#8a8f98'
  const A = ctx.accent
  const tools = ['LangChain', 'AutoGPT', 'RAG', 'CrewAI', 'n8n', 'Flowise', 'Dify', 'Pinecone']
  let ti = 0
  const caps = []
  let w, h, raf, last = performance.now(), spawn = 0
  const dpr = () => devicePixelRatio
  const resize = () => {
    const r = el.getBoundingClientRect()
    w = canvas.width = Math.max(2, r.width * devicePixelRatio)
    h = canvas.height = Math.max(2, r.height * devicePixelRatio)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(el)
  const rr = (x, y, bw, bh, rad) => {
    g.beginPath()
    g.moveTo(x + rad, y)
    g.arcTo(x + bw, y, x + bw, y + bh, rad)
    g.arcTo(x + bw, y + bh, x, y + bh, rad)
    g.arcTo(x, y + bh, x, y, rad)
    g.arcTo(x, y, x + bw, y, rad)
    g.closePath()
  }
  const loop = (now) => {
    const dt = Math.min(50, now - last); last = now
    g.clearRect(0, 0, w, h)
    // 概念石柱（恆定發光，不動）
    const pillarY = h * 0.7, pillarH = h * 0.24, pw = w * 0.12, gap = w * 0.06
    const totalW = pw * 3 + gap * 2
    let px = (w - totalW) / 2
    const glow = 0.55 + 0.25 * Math.sin(now / 600)
    for (let i = 0; i < 3; i++) {
      g.fillStyle = A
      g.globalAlpha = glow * (0.7 + i * 0.1)
      rr(px, pillarY, pw, pillarH, 4 * dpr()); g.fill()
      g.globalAlpha = 1
      px += pw + gap
    }
    // 產生下落膠囊
    spawn -= dt
    if (spawn <= 0) {
      spawn = 900
      caps.push({ x: 0.22 + Math.random() * 0.56, y: -0.05, label: tools[ti % tools.length], v: 0.00016 + Math.random() * 0.00006 })
      ti++
    }
    g.font = `600 ${h * 0.09}px "Inter", system-ui, sans-serif`
    g.textAlign = 'center'; g.textBaseline = 'middle'
    for (let i = caps.length - 1; i >= 0; i--) {
      const c = caps[i]
      c.y += c.v * dt
      const fade = 1 - Math.max(0, (c.y - 0.15) / 0.45)
      if (c.y > 0.62 || fade <= 0) { caps.splice(i, 1); continue }
      const cx = c.x * w, cy = c.y * h
      const tw = g.measureText(c.label).width + 26 * dpr()
      const chh = h * 0.15
      g.globalAlpha = Math.min(1, fade) * 0.9
      g.strokeStyle = GRAY; g.lineWidth = 1.2 * dpr()
      rr(cx - tw / 2, cy - chh / 2, tw, chh, chh / 2); g.stroke()
      g.fillStyle = GRAY
      g.fillText(c.label, cx, cy)
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
