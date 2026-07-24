// Agent Communication — 兩個 agent 方框以中間檔案通道傳遞小檔案卡，來回交替（檔案系統當信箱）
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
  const ease = x => x * x * (3 - 2 * x)
  const rr = (x, y, ww, hh, r) => { g.beginPath(); g.moveTo(x + r, y)
    g.arcTo(x + ww, y, x + ww, y + hh, r); g.arcTo(x + ww, y + hh, x, y + hh, r)
    g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + ww, y, r); g.closePath() }
  const agent = (x, y, s, glow) => {
    g.lineWidth = 2 * dpr; g.strokeStyle = glow > 0.02 ? A : G
    rr(x - s, y - s, s * 2, s * 2, 6 * dpr); g.stroke()
    g.fillStyle = glow > 0.02 ? A : G
    g.beginPath(); g.arc(x, y - s * 0.25, s * 0.32, 0, 7); g.fill()
    g.lineWidth = 1.6 * dpr; g.strokeStyle = g.fillStyle
    g.beginPath(); g.moveTo(x - s * 0.45, y + s * 0.4); g.lineTo(x + s * 0.45, y + s * 0.4); g.stroke()
    if (glow > 0.02) { g.globalAlpha = glow * 0.4; g.fillStyle = A
      g.beginPath(); g.arc(x, y, s * 1.7, 0, 7); g.fill(); g.globalAlpha = 1 }
  }
  const card = (x, y, s) => {
    g.save(); g.translate(x, y)
    g.fillStyle = A; g.strokeStyle = A; g.lineWidth = 1.4 * dpr
    const cw = s * 0.9, ch = s * 1.15, fold = s * 0.34
    g.globalAlpha = 0.16; rr(-cw / 2, -ch / 2, cw, ch, 2 * dpr); g.fill()
    g.globalAlpha = 1
    g.beginPath(); g.moveTo(-cw / 2, -ch / 2); g.lineTo(cw / 2 - fold, -ch / 2)
    g.lineTo(cw / 2, -ch / 2 + fold); g.lineTo(cw / 2, ch / 2)
    g.lineTo(-cw / 2, ch / 2); g.closePath(); g.stroke()
    g.beginPath(); g.moveTo(cw / 2 - fold, -ch / 2); g.lineTo(cw / 2 - fold, -ch / 2 + fold)
    g.lineTo(cw / 2, -ch / 2 + fold); g.stroke()
    g.strokeStyle = G; g.globalAlpha = 0.7; g.lineWidth = 1.1 * dpr
    for (let i = 0; i < 3; i++) { const ly = -ch * 0.12 + i * ch * 0.22
      g.beginPath(); g.moveTo(-cw * 0.28, ly); g.lineTo(cw * (0.2 - i * 0.06), ly); g.stroke() }
    g.globalAlpha = 1; g.restore()
  }
  const start = performance.now()
  const loop = now => {
    const t = (now - start) / 1000, per = 2.6, tc = (t % per) / per
    const trip = Math.floor(t / per), dir = trip % 2 === 0 ? 1 : -1
    g.clearRect(0, 0, w, h)
    const cy = h / 2, s = Math.min(w, h) * 0.16
    const lx = w * 0.19, rx = w * 0.81
    // 通道
    g.strokeStyle = G; g.globalAlpha = 0.3; g.lineWidth = 1.3 * dpr
    g.setLineDash([4 * dpr, 5 * dpr])
    g.beginPath(); g.moveTo(lx + s, cy); g.lineTo(rx - s, cy); g.stroke()
    g.setLineDash([]); g.globalAlpha = 1
    // 傳送/接收發光
    const sendGlow = tc < 0.18 ? 1 - tc / 0.18 : 0
    const recvGlow = tc > 0.82 ? (tc - 0.82) / 0.18 : 0
    const senderR = dir > 0
    agent(lx, cy, s, senderR ? sendGlow : recvGlow)
    agent(rx, cy, s, senderR ? recvGlow : sendGlow)
    // 檔案卡沿通道滑動
    if (tc > 0.15 && tc < 0.85) {
      const p = ease((tc - 0.15) / 0.7)
      const x0 = dir > 0 ? lx + s : rx - s, x1 = dir > 0 ? rx - s : lx + s
      card(x0 + (x1 - x0) * p, cy, s * 0.62)
    }
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
