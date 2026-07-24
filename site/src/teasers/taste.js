// Taste — 四張幾乎相同的抽象小卡並排，其中一張被微調後跳出放大發光，其餘變灰；換一張循環
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
  const rrect = (x, y, ww, hh, rad) => {
    g.beginPath(); g.moveTo(x + rad, y)
    g.arcTo(x + ww, y, x + ww, y + hh, rad)
    g.arcTo(x + ww, y + hh, x, y + hh, rad)
    g.arcTo(x, y + hh, x, y, rad)
    g.arcTo(x, y, x + ww, y, rad); g.closePath()
  }
  const start = performance.now()
  const N = 4, T = 4.0
  const loop = now => {
    const t = (now - start) / 1000, cyc = Math.floor(t / T), tc = t % T
    const pick = cyc % N
    g.clearRect(0, 0, w, h)
    const u = Math.min(w, h), cy = h / 2, cw = u * 0.2, ch = u * 0.3
    const gap = (w - N * cw) / (N + 1)
    const sel = ease(clamp((tc - 0.6) / 0.7, 0, 1)) * (1 - ease(clamp((tc - 3.2) / 0.6, 0, 1)))
    for (let i = 0; i < N; i++) {
      const isPick = i === pick, cx = gap + i * (cw + gap) + cw / 2
      const sc = 1 + (isPick ? 0.3 * sel : 0)
      const dim = isPick ? 1 : 1 - 0.72 * sel
      const cwi = cw * sc, chi = ch * sc * (isPick ? 1 + 0.05 * sel : 1)   // 比例微調
      const col = isPick ? A : G
      if (isPick && sel > 0.02) {   // 發光
        g.globalAlpha = sel * 0.5
        const grd = g.createRadialGradient(cx, cy, 0, cx, cy, cwi)
        grd.addColorStop(0, A + '66'); grd.addColorStop(1, A + '00')
        g.fillStyle = grd; g.beginPath(); g.arc(cx, cy, cwi, 0, 7); g.fill()
      }
      g.globalAlpha = dim; g.strokeStyle = col
      g.lineWidth = (isPick ? 2.4 + sel * 1.2 : 1.8) * dpr   // 描邊變亮
      rrect(cx - cwi / 2, cy - chi / 2, cwi, chi, u * 0.025); g.stroke()
      // 內部抽象元素
      g.lineWidth = (isPick ? 2 : 1.5) * dpr
      g.beginPath(); g.arc(cx, cy - chi * 0.18, cwi * 0.18, 0, 7); g.stroke()
      g.beginPath()
      g.moveTo(cx - cwi * 0.28, cy + chi * 0.14); g.lineTo(cx + cwi * 0.28, cy + chi * 0.14)
      g.moveTo(cx - cwi * 0.28, cy + chi * 0.28); g.lineTo(cx + cwi * 0.1, cy + chi * 0.28)
      g.stroke()
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
