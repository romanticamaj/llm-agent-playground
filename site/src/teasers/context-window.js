// context-window — 小貨車沿底部道路行駛（台中→台北），車斗貨物逐漸堆滿，滿載時閃警示色。
export default function mount(el, ctx) {
  const accent = ctx?.accent || '#8ea9e8'
  const gray = '#8a8f98'
  const warn = '#e8985a'
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
  let last = performance.now(), p = 0
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now
    p += dt / 6; if (p > 1.18) p = 0
    const pp = Math.min(1, p)
    g.clearRect(0, 0, w, h)
    const roadY = h * 0.82, x0 = w * 0.06, x1 = w * 0.94
    // 道路 + 里程點
    g.globalAlpha = 0.35; g.strokeStyle = gray; g.lineWidth = dpr
    g.beginPath(); g.moveTo(x0, roadY); g.lineTo(x1, roadY); g.stroke()
    for (let i = 0; i <= 5; i++) {
      const x = x0 + (x1 - x0) * (i / 5)
      g.globalAlpha = 0.3; g.beginPath(); g.moveTo(x, roadY); g.lineTo(x, roadY + h * 0.03); g.stroke()
    }
    g.globalAlpha = 0.6; g.fillStyle = gray
    g.font = `500 ${h * 0.07}px "Inter","Noto Sans TC",sans-serif`; g.textBaseline = 'top'
    g.textAlign = 'left'; g.fillText('台中', x0, roadY + h * 0.05)
    g.textAlign = 'right'; g.fillText('台北', x1, roadY + h * 0.05)
    // 貨車
    const bodyW = w * 0.26, r = h * 0.045
    const frontX = x0 + bodyW + (x1 - x0 - bodyW) * pp, left = frontX - bodyW
    const wheelY = roadY - r, bodyBot = wheelY - r * 0.5
    const bedH = h * 0.16, cabW = bodyW * 0.32, bedW = bodyW - cabW
    const full = pp >= 0.94
    const warnOn = full && Math.sin(now / 90) > 0
    // 輪子
    g.globalAlpha = 1; g.fillStyle = '#2a2f38'; g.strokeStyle = gray; g.lineWidth = dpr
    for (const wx of [left + bedW * 0.4, frontX - cabW * 0.5]) {
      g.beginPath(); g.arc(wx, wheelY, r, 0, 7); g.fill(); g.stroke()
    }
    // 車斗
    g.strokeStyle = warnOn ? warn : accent; g.lineWidth = dpr * 1.4; g.fillStyle = '#171a20'
    g.beginPath(); g.rect(left, bodyBot - bedH, bedW, bedH); g.fill(); g.stroke()
    // 駕駛室
    g.fillStyle = '#20242c'; g.strokeStyle = gray
    g.beginPath(); g.rect(left + bedW, bodyBot - bedH * 1.35, cabW, bedH * 1.35); g.fill(); g.stroke()
    g.fillStyle = accent + '55'
    g.beginPath(); g.rect(left + bedW + cabW * 0.15, bodyBot - bedH * 1.2, cabW * 0.7, bedH * 0.5); g.fill()
    // 貨物方塊
    const cols = 5, rows = 2, cell = bedW / (cols + 0.3)
    const total = cols * rows, filled = Math.round(pp * total)
    for (let k = 0; k < filled; k++) {
      const c = k % cols, ro2 = (k / cols) | 0
      const bx = left + cell * 0.15 + c * cell, by = bodyBot - cell * 0.85 - ro2 * cell * 0.92
      g.globalAlpha = 0.95; g.fillStyle = warnOn ? warn : accent
      g.beginPath(); g.rect(bx, by - cell * 0.78, cell * 0.82, cell * 0.78); g.fill()
    }
    if (warnOn) {
      g.globalAlpha = 0.7; g.fillStyle = warn; g.textAlign = 'center'; g.textBaseline = 'bottom'
      g.font = `600 ${h * 0.075}px "Inter",sans-serif`
      g.fillText('FULL', left + bedW / 2, bodyBot - bedH - h * 0.02)
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
