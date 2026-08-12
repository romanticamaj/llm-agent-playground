// Teaser: 四層同心門環由外往內逐層開啟（Connector → CLI → MCP → API key）—
// 越往內越亮、輪廓越銳利（能力變大、風險自負），中心鑰匙隨之點亮，循環播放
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

  const clamp = x => x < 0 ? 0 : x > 1 ? 1 : x
  const ease = x => { const t = clamp(x); return t * t * (3 - 2 * t) }
  const CYCLE = 5800
  // 由外而內：邊數越少＝輪廓越銳利；alpha 越高＝權限越大
  const RINGS = [
    { rf: 0.95, sides: 34, at: 0.08, alpha: 0.5, lw: 1.3 },
    { rf: 0.73, sides: 17, at: 0.26, alpha: 0.68, lw: 1.6 },
    { rf: 0.52, sides: 10, at: 0.44, alpha: 0.85, lw: 2.0 },
    { rf: 0.31, sides: 5, at: 0.62, alpha: 1, lw: 2.6 },
  ]

  const ringPath = (cx, cy, r, sides, gap, rot) => {
    const half = Math.PI - gap / 2
    const a0 = -Math.PI / 2 + gap / 2 + rot
    g.beginPath()
    for (let i = 0; i <= sides; i++) {
      const a = a0 + (half * 2) * (i / sides)
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r
      i ? g.lineTo(x, y) : g.moveTo(x, y)
    }
  }

  const key = (cx, cy, s, alpha) => {
    g.globalAlpha = alpha
    g.strokeStyle = A
    g.lineWidth = 1.8 * devicePixelRatio
    g.lineCap = 'round'
    g.beginPath()
    g.arc(cx - s * 0.45, cy, s * 0.36, 0, 7)
    g.stroke()
    g.beginPath()
    g.moveTo(cx - s * 0.09, cy)
    g.lineTo(cx + s * 0.95, cy)
    g.moveTo(cx + s * 0.95, cy)
    g.lineTo(cx + s * 0.95, cy + s * 0.34)
    g.moveTo(cx + s * 0.6, cy)
    g.lineTo(cx + s * 0.6, cy + s * 0.24)
    g.stroke()
  }

  const loop = now => {
    const dpr = devicePixelRatio
    const p = (now % CYCLE) / CYCLE
    const close = p > 0.86 ? ease((p - 0.86) / 0.14) : 0
    const cx = w / 2, cy = h / 2
    const base = Math.min(w, h) * 0.42
    g.clearRect(0, 0, w, h)
    g.lineJoin = 'round'

    let opened = 0
    RINGS.forEach((R, i) => {
      const u = ease((p - R.at) / 0.15) * (1 - close)
      opened += u
      const r = base * R.rf
      const gap = 0.12 + u * 0.95
      const rot = u * 0.34 + i * 0.12
      // 未開啟＝灰、開啟＝主色；越內圈線越粗、越亮
      const lit = u > 0.02
      g.globalAlpha = lit ? 0.28 + R.alpha * 0.72 * u : 0.3
      g.strokeStyle = lit ? A : GRAY
      g.lineWidth = R.lw * dpr
      if (lit) { g.shadowColor = A; g.shadowBlur = 10 * dpr * u * R.alpha }
      ringPath(cx, cy, r, R.sides, gap, rot)
      g.stroke()
      g.shadowBlur = 0
      // 門開處的兩個端點：越內圈越銳（畫成小尖刺）
      if (u > 0.05) {
        const spike = (2 + i * 2.2) * dpr * u
        ;[-1, 1].forEach(s => {
          const a = -Math.PI / 2 + s * gap / 2 + rot
          const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r
          g.globalAlpha = 0.35 + 0.65 * u
          g.fillStyle = A
          g.beginPath()
          g.arc(x, y, spike * 0.6, 0, 7)
          g.fill()
        })
      }
    })

    // 中心鑰匙：四層都開＝全亮
    const bright = clamp(opened / RINGS.length)
    if (bright > 0.02) {
      g.globalAlpha = 0.1 * bright
      g.fillStyle = A
      g.beginPath()
      g.arc(cx, cy, base * 0.3 * (0.7 + 0.3 * bright), 0, 7)
      g.fill()
    }
    key(cx, cy - base * 0.02, base * 0.2, 0.22 + 0.78 * bright)
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
