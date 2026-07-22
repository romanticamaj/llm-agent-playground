// 預設 teaser：概念編號 + 漂浮粒子（自訂 teaser 未提供時的 fallback）
export default function mount(el, ctx) {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'width:100%;height:100%;display:block'
  el.appendChild(canvas)
  const g = canvas.getContext('2d')
  const N = 26
  const pts = Array.from({ length: N }, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0016, vy: (Math.random() - 0.5) * 0.0016,
    r: 1 + Math.random() * 2,
  }))
  let raf, w, h
  const resize = () => {
    const r = el.getBoundingClientRect()
    w = canvas.width = Math.max(2, r.width * devicePixelRatio)
    h = canvas.height = Math.max(2, r.height * devicePixelRatio)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(el)
  const num = ctx.concept?.num || '00'
  const loop = () => {
    g.clearRect(0, 0, w, h)
    g.font = `700 ${h * 0.5}px "Inter", sans-serif`
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.strokeStyle = ctx.accent + '55'
    g.lineWidth = devicePixelRatio
    g.strokeText(num, w / 2, h / 2)
    g.fillStyle = ctx.accent
    for (const p of pts) {
      p.x = (p.x + p.vx + 1) % 1
      p.y = (p.y + p.vy + 1) % 1
      g.globalAlpha = 0.5
      g.beginPath()
      g.arc(p.x * w, p.y * h, p.r * devicePixelRatio, 0, 7)
      g.fill()
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  loop()
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
