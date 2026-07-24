// Relocating Rigor — 能量粒子原本全擠中段（堵塞閃紅），流動重新分配到上下游兩端，再回堵塞循環
export default function mount(el, ctx) {
  const A = ctx.accent || '#72c2ae', G = '#8a8f98', R = '#e5646e'
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
  const ease = x => x * x * (3 - 2 * x)
  const rr = (x, y, ww, hh, r) => { g.beginPath(); g.moveTo(x + r, y)
    g.arcTo(x + ww, y, x + ww, y + hh, r); g.arcTo(x + ww, y + hh, x, y + hh, r)
    g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + ww, y, r); g.closePath() }
  const N = 26
  const P = Array.from({ length: N }, (_, i) => ({
    end: i % 2, ph: Math.random(), jy: (Math.random() - 0.5),
    jx: 0.2 + Math.random() * 0.6, sp: 0.1 + Math.random() * 0.14,
  }))
  const start = performance.now()
  const loop = now => {
    const t = (now - start) / 1000, per = 6, tc = t % per
    let s
    if (tc < 1.8) s = 0
    else if (tc < 3.0) s = ease((tc - 1.8) / 1.2)
    else if (tc < 4.8) s = 1
    else s = 1 - ease((tc - 4.8) / 1.2)
    g.clearRect(0, 0, w, h)
    const py = h * 0.5, ph = h * 0.3, seg = w / 3, x0 = 0
    const pulse = (1 - s) * (0.55 + 0.45 * Math.sin(t * 6))
    // 三段管道外框
    g.lineWidth = 1.6 * dpr
    for (let k = 0; k < 3; k++) {
      const mid = k === 1
      const endLit = !mid ? s : 0, jam = mid ? pulse : 0
      g.strokeStyle = jam > 0.02 ? R : (endLit > 0.02 ? A : G)
      g.globalAlpha = jam > 0.02 ? 0.5 + jam * 0.5 : (endLit > 0.02 ? 0.4 + endLit * 0.6 : 0.4)
      rr(x0 + k * seg + 3 * dpr, py - ph / 2, seg - 6 * dpr, ph, 5 * dpr); g.stroke()
      if (jam > 0.3) { g.globalAlpha = (jam - 0.3) * 0.18; g.fillStyle = R; g.fill() }
    }
    g.globalAlpha = 1
    // 粒子：堵塞態擠中段，流動態分流到兩端
    for (const p of P) {
      const jamX = seg + seg * p.jx, jamY = py + p.jy * ph * 0.34
      const zx = p.end === 0 ? 0 : 2 * seg
      const flowX = zx + ((p.ph + t * p.sp) % 1) * seg
      const flowY = py + Math.sin((p.ph + t * p.sp) * 6.283) * ph * 0.28
      const x = jamX + (flowX - jamX) * s, y = jamY + (flowY - jamY) * s
      const col = s < 0.4 ? R : A, rr2 = (1.6 + (1 - s) * 0.8) * dpr
      const gl = g.createRadialGradient(x, y, 0, x, y, 6 * dpr)
      gl.addColorStop(0, col); gl.addColorStop(1, col + '00')
      g.globalAlpha = 0.8; g.fillStyle = gl
      g.beginPath(); g.arc(x, y, 6 * dpr, 0, 7); g.fill()
      g.globalAlpha = 1; g.fillStyle = col
      g.beginPath(); g.arc(x, y, rr2, 0, 7); g.fill()
    }
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
