// Agent Eval — 一排測試燈條快速掃綠，偶爾一顆閃紅，被框選收進左側測試庫 +1，整排重掃
export default function mount(el, ctx) {
  const A = ctx.accent || '#72c2ae', G = '#8a8f98', R = '#e5646e', Gn = '#5fc08a'
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
  const rnd = s => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x) }
  const N = 8
  const start = performance.now()
  const T = 5.0
  const loop = now => {
    const t = (now - start) / 1000, cyc = Math.floor(t / T), tc = t % T
    g.clearRect(0, 0, w, h)
    const u = Math.min(w, h), cy = h / 2
    const bx = w * 0.14, bw = u * 0.16, bh = u * 0.22
    const rowL = w * 0.3, rowR = w * 0.93, step = (rowR - rowL) / N
    const bad = Math.floor(rnd(cyc + 1) * N)
    const sweep = ease(clamp(tc / 2.0, 0, 1)) * N
    const boxing = tc > 2.15 && tc < 3.2
    const collect = clamp((tc - 3.2) / 0.9, 0, 1)
    const count = cyc + (tc > 3.9 ? 1 : 0)
    // 測試庫
    g.lineWidth = 2 * dpr; g.strokeStyle = G; g.globalAlpha = 0.7
    g.strokeRect(bx - bw / 2, cy - bh / 2, bw, bh)
    g.globalAlpha = 1; g.fillStyle = A
    g.font = `700 ${u * 0.12}px "Inter", sans-serif`
    g.textAlign = 'center'; g.textBaseline = 'middle'
    g.fillText(String(count), bx, cy)
    // 燈條
    const rr = u * 0.028
    for (let i = 0; i < N; i++) {
      const x = rowL + step * (i + 0.5), lit = sweep > i, isBad = i === bad
      let c = G, a = 0.35
      if (lit) { c = isBad ? R : Gn; a = 1 }
      if (isBad && collect > 0) a = 1 - collect
      g.globalAlpha = a
      if (lit) {
        const grd = g.createRadialGradient(x, cy, 0, x, cy, rr * 2.4)
        grd.addColorStop(0, c); grd.addColorStop(1, c + '00')
        g.fillStyle = grd; g.beginPath(); g.arc(x, cy, rr * 2.4, 0, 7); g.fill()
      }
      g.fillStyle = c; g.beginPath(); g.arc(x, cy, rr, 0, 7); g.fill()
    }
    // 框選紅燈 → 飛入測試庫
    if (boxing || (collect > 0 && collect < 1)) {
      const bxi = rowL + step * (bad + 0.5)
      const fx = collect > 0 ? bxi + (bx - bxi) * ease(collect) : bxi
      const s = rr * 1.8 * (1 - 0.5 * collect)
      g.globalAlpha = collect > 0 ? 1 - collect * 0.5 : 1
      g.strokeStyle = R; g.lineWidth = 2 * dpr
      g.strokeRect(fx - s, cy - s, s * 2, s * 2)
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
