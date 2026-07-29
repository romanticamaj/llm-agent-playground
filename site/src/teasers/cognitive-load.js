// Cognitive Load — 100 格能量槽的兩種花法對比：灰噪泡泡狂吸（快速流失、無產出） vs 金色判斷方塊穩定消耗、右側成長條上升；交替循環
export default function mount(el, ctx) {
  const A = ctx.accent || '#72c2ae', G = '#8a8f98', GOLD = '#d7a94b'
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
  const T = 4.6
  const bubbles = Array.from({ length: 16 }, () => ({
    x: 0.05 + Math.random() * 0.9, ph: Math.random(), sp: 0.7 + Math.random() * 0.8, r: 0.5 + Math.random() * 0.8,
  }))
  const loop = now => {
    const tt = (now - start) / 1000
    const gold = Math.floor(tt / T) % 2 === 1
    const tc = tt % T
    g.clearRect(0, 0, w, h)
    const tx = w * 0.07, tw = w * 0.6, th = h * 0.16, ty = h * 0.42
    // 能量水位：先充能，再依模式流失（灰噪快、金判斷慢）
    let level
    if (tc < 0.5) level = ease(tc / 0.5)
    else if (!gold) level = 1 - ease(clamp((tc - 0.5) / (T * 0.55), 0, 1)) * 0.9
    else level = 1 - clamp((tc - 0.5) / (T * 0.85), 0, 1) * 0.82
    // 能量槽外框 + 100 填格（暗綠能量）
    g.strokeStyle = G; g.globalAlpha = 0.4; g.lineWidth = 1.5 * dpr
    g.strokeRect(tx, ty, tw, th)
    const cells = 100, cw = tw / cells, filled = Math.round(level * cells)
    g.fillStyle = A
    for (let i = 0; i < filled; i++) {
      g.globalAlpha = 0.7
      g.fillRect(tx + i * cw + cw * 0.12, ty + th * 0.2, cw * 0.76, th * 0.6)
    }
    g.globalAlpha = 1
    if (!gold) {
      // 灰噪泡泡：從槽面狂吸能量往上飄散（快速、雜亂、無產出）
      const drain = ease(clamp((tc - 0.5) / (T * 0.55), 0, 1))
      for (const b of bubbles) {
        const p = (b.ph + tt * b.sp) % 1
        const bx = tx + b.x * tw, by = ty - p * h * 0.33
        g.globalAlpha = (1 - p) * 0.5 * (0.25 + drain)
        g.fillStyle = G
        g.beginPath(); g.arc(bx, by, (b.r + 0.5) * 3 * dpr, 0, 7); g.fill()
      }
    } else {
      // 金色判斷方塊：沿槽穩定推進消耗
      const march = clamp((tc - 0.5) / (T * 0.85), 0, 1)
      const bx = tx + march * tw
      for (let k = 0; k < 3; k++) {
        const sx = bx - k * th * 0.85
        if (sx < tx + th * 0.34) continue
        g.globalAlpha = 0.9 - k * 0.28; g.fillStyle = GOLD
        g.fillRect(sx - th * 0.32, ty - th * 0.45, th * 0.64, th * 1.9)
      }
    }
    g.globalAlpha = 1
    // 右側成長條：金判斷才長高；灰噪期近乎空手（能量白花）
    const gx = w * 0.82, gw = w * 0.08, gby = ty + th * 1.4, gh = h * 0.5
    g.strokeStyle = G; g.globalAlpha = 0.3; g.lineWidth = 1.5 * dpr
    g.strokeRect(gx, gby - gh, gw, gh)
    const grow = gold ? clamp((tc - 0.5) / (T * 0.85), 0, 1) * 0.92 : 0.03
    const grd = g.createLinearGradient(0, gby, 0, gby - gh)
    grd.addColorStop(0, A + 'cc'); grd.addColorStop(1, A + '44')
    g.globalAlpha = 1; g.fillStyle = grd
    g.fillRect(gx, gby - gh * grow, gw, gh * grow)
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
