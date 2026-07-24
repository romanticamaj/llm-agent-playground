// Teaser: 左側點群被吸入中央大腦壓縮成亮核，右側射出快速判斷閃光；循環
export default function mount(el, ctx) {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'width:100%;height:100%;display:block'
  el.appendChild(canvas)
  const g = canvas.getContext('2d')
  const GRAY = '#8a8f98'
  const A = ctx.accent
  const N = 28
  const dots = Array.from({ length: N }, () => ({
    sx: -0.05 + Math.random() * 0.28,
    sy: 0.15 + Math.random() * 0.7,
    ph: Math.random() * 0.35,
  }))
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
  const CYCLE = 3200
  const brain = (cx, cy, s) => {
    g.beginPath()
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.25) {
      const rd = s * (1 + 0.16 * Math.sin(a * 3) + 0.09 * Math.cos(a * 5))
      const x = cx + Math.cos(a) * rd * 1.05
      const y = cy + Math.sin(a) * rd * 0.82
      a === 0 ? g.moveTo(x, y) : g.lineTo(x, y)
    }
    g.closePath()
  }
  const loop = (now) => {
    const p = (now % CYCLE) / CYCLE
    const dpr = devicePixelRatio
    g.clearRect(0, 0, w, h)
    const cx = w * 0.5, cy = h * 0.5, s = h * 0.22
    // 大腦輪廓
    g.strokeStyle = GRAY; g.lineWidth = 1.4 * dpr; g.globalAlpha = 0.8
    brain(cx, cy, s); g.stroke()
    // 點群向中央收斂
    g.fillStyle = A
    for (const d of dots) {
      const local = ease((p - d.ph) / 0.5)
      const x = d.sx * w + (cx - d.sx * w) * local
      const y = d.sy * h + (cy - d.sy * h) * local
      g.globalAlpha = 0.75 * (1 - local * 0.6)
      g.beginPath(); g.arc(x, y, 2.2 * dpr, 0, 7); g.fill()
    }
    // 壓縮亮核
    const core = ease((p - 0.35) / 0.25)
    if (core > 0) {
      const cr = s * 0.5 * core
      const grad = g.createRadialGradient(cx, cy, 0, cx, cy, cr)
      grad.addColorStop(0, A); grad.addColorStop(1, A + '00')
      g.globalAlpha = core; g.fillStyle = grad
      g.beginPath(); g.arc(cx, cy, cr, 0, 7); g.fill()
    }
    // 右側判斷閃光
    const fl = (p - 0.6) / 0.25
    if (fl > 0 && fl < 1) {
      const tip = cx + (w * 0.45) * ease(fl)
      g.globalAlpha = 1 - fl
      g.strokeStyle = A; g.lineWidth = 3 * dpr
      g.beginPath(); g.moveTo(cx + s * 0.8, cy); g.lineTo(tip, cy); g.stroke()
      g.beginPath(); g.arc(tip, cy, 3.5 * dpr, 0, 7); g.fillStyle = A; g.fill()
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
