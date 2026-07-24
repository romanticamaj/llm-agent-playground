// Teaser: 亮點穿越兩道牆 — 虛線(prompt)直接穿過閃紅，實線(系統)彈開閃綠；交替循環
export default function mount(el, ctx) {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'width:100%;height:100%;display:block'
  el.appendChild(canvas)
  const g = canvas.getContext('2d')
  const GRAY = '#8a8f98'
  const A = ctx.accent
  const RED = '#f56565', GREEN = '#4ade80'
  let w, h, raf
  const resize = () => {
    const r = el.getBoundingClientRect()
    w = canvas.width = Math.max(2, r.width * devicePixelRatio)
    h = canvas.height = Math.max(2, r.height * devicePixelRatio)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(el)
  const CYCLE = 4200
  const dashX = 0.4, solidX = 0.72
  const loop = (now) => {
    const p = (now % CYCLE) / CYCLE
    const dpr = devicePixelRatio
    g.clearRect(0, 0, w, h)
    const cy = h * 0.5
    // 亮點：0-0.5 前進（穿過虛線→抵達實線）；0.5-1 被彈回起點
    let dotX, dir
    if (p < 0.5) { dotX = 0.12 + (solidX - 0.12) * (p / 0.5); dir = 1 }
    else { dotX = solidX - (solidX - 0.12) * ((p - 0.5) / 0.5); dir = -1 }
    const atDash = Math.abs(dotX - dashX) < 0.025 && dir > 0
    const atSolid = Math.abs(dotX - solidX) < 0.025
    // 虛線牆（prompt）— 穿過閃紅
    g.lineWidth = 2.4 * dpr
    g.setLineDash([8 * dpr, 6 * dpr])
    g.strokeStyle = atDash ? RED : GRAY
    g.globalAlpha = atDash ? 1 : 0.7
    if (atDash) { g.shadowColor = RED; g.shadowBlur = 14 * dpr }
    g.beginPath(); g.moveTo(dashX * w, h * 0.2); g.lineTo(dashX * w, h * 0.8); g.stroke()
    g.shadowBlur = 0; g.setLineDash([])
    // 實線牆（系統）— 彈開閃綠
    g.strokeStyle = atSolid ? GREEN : GRAY
    g.globalAlpha = atSolid ? 1 : 0.85
    if (atSolid) { g.shadowColor = GREEN; g.shadowBlur = 14 * dpr }
    g.beginPath(); g.moveTo(solidX * w, h * 0.16); g.lineTo(solidX * w, h * 0.84); g.stroke()
    g.shadowBlur = 0
    // 亮點
    g.globalAlpha = 1; g.fillStyle = A
    g.shadowColor = A; g.shadowBlur = 10 * dpr
    g.beginPath(); g.arc(dotX * w, cy, 5 * dpr, 0, 7); g.fill()
    g.shadowBlur = 0
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
