// agent-vs-workflow — 左半固定直線點順跑（每輪相同）；右半迷宮亂走每輪隨機；兩點同時出發對比，循環。
export default function mount(el, ctx) {
  const accent = ctx?.accent || '#8ea9e8'
  const gray = '#8a8f98'
  const cv = document.createElement('canvas')
  cv.style.cssText = 'width:100%;height:100%;display:block'
  el.appendChild(cv)
  const g = cv.getContext('2d')
  let raf, w, h, dpr
  const resize = () => {
    dpr = devicePixelRatio || 1
    const r = el.getBoundingClientRect()
    w = cv.width = Math.max(2, r.width * dpr)
    h = cv.height = Math.max(2, r.height * dpr)
  }
  resize()
  const ro = new ResizeObserver(resize); ro.observe(el)
  let p = 0, maze = [], last = performance.now()
  const genMaze = () => { // 右半隨機折線（每輪重生）
    const rx0 = w * 0.56, rx1 = w * 0.94, y0 = h * 0.12, y1 = h * 0.88, steps = 7
    const pts = [{ x: (rx0 + rx1) / 2, y: y0 }]
    for (let i = 1; i <= steps; i++) pts.push({ x: rx0 + Math.random() * (rx1 - rx0), y: y0 + (y1 - y0) * i / steps })
    maze = pts
  }
  const onPoly = (pts, t) => {
    const seg = t * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(seg)), f = seg - i
    return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * f, y: pts[i].y + (pts[i + 1].y - pts[i].y) * f }
  }
  genMaze()
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now
    g.clearRect(0, 0, w, h)
    p += dt * 0.32
    if (p >= 1) { p = 0; genMaze() }
    const lx = w * 0.25, y0 = h * 0.12, y1 = h * 0.88, R = Math.min(w, h) * 0.03
    // 中線分隔
    g.globalAlpha = 0.15; g.strokeStyle = gray; g.lineWidth = dpr; g.setLineDash([dpr * 2, dpr * 6])
    g.beginPath(); g.moveTo(w / 2, h * 0.06); g.lineTo(w / 2, h * 0.94); g.stroke(); g.setLineDash([])
    // 左：固定直線路徑
    g.globalAlpha = 0.4; g.strokeStyle = gray; g.lineWidth = dpr * 1.4
    g.beginPath(); g.moveTo(lx, y0); g.lineTo(lx, y1); g.stroke()
    // 右：迷宮路徑
    g.globalAlpha = 0.4; g.strokeStyle = accent + '66'; g.lineWidth = dpr * 1.4
    g.beginPath(); g.moveTo(maze[0].x, maze[0].y)
    for (let i = 1; i < maze.length; i++) g.lineTo(maze[i].x, maze[i].y)
    g.stroke()
    // 兩點同時出發
    const lp = { x: lx, y: y0 + (y1 - y0) * p }, rp = onPoly(maze, p)
    for (const [pt, col] of [[lp, gray], [rp, accent]]) {
      g.globalAlpha = 0.28; g.fillStyle = col
      g.beginPath(); g.arc(pt.x, pt.y, R * 1.8, 0, 7); g.fill()
      g.globalAlpha = 1; g.fillStyle = col
      g.beginPath(); g.arc(pt.x, pt.y, R, 0, 7); g.fill()
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
