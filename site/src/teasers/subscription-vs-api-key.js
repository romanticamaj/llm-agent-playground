// subscription-vs-api-key — 兩個錢包對照：左邊訂閱是固定刻度條，一格一格填到上限就停住（每月重置）；
// 右邊 API key 是儲值餘額，持續往下滴、滴乾了再儲值。定額 vs 按量流失，循環播放。
export default function mount(el, ctx) {
  const A = ctx?.accent || '#8ea9e8'
  const GRAY = '#8a8f98', GOLD = '#e8a15a'
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

  const clamp = (x, a, b) => Math.max(a, Math.min(b, x))
  const ease = x => 1 - Math.pow(1 - x, 3)
  const SEG = 5, CYCLE = 9, STEP = 0.9, DRAIN = 3.6
  const start = performance.now()
  let last = start, drops = [], nextDrop = 0

  // roundRect 有些環境沒有 → 退回直角
  const rr = (x, y, bw, bh, r) => {
    g.beginPath()
    if (g.roundRect) g.roundRect(x, y, bw, bh, r); else g.rect(x, y, bw, bh)
  }
  const col = (cx, bw, top, bh, stroke, alpha) => {
    g.globalAlpha = alpha; g.strokeStyle = stroke; g.lineWidth = 1.6 * dpr
    rr(cx - bw / 2, top, bw, bh, bw * 0.22); g.stroke()
    g.globalAlpha = 1
  }

  const loop = now => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now
    const tc = ((now - start) / 1000) % CYCLE
    g.clearRect(0, 0, w, h)
    g.lineJoin = g.lineCap = 'round'

    const bw = w * 0.185, gh = h * 0.54, gy = h * 0.17, gb = gy + gh
    const lx = w * 0.31, rx = w * 0.69

    // ---- 左：訂閱（固定刻度，填到上限就停） ----
    let lv = 0, capped = false
    if (tc < 4.5) { const k = Math.floor(tc / STEP); lv = (k + ease(clamp((tc % STEP) / 0.38, 0, 1))) / SEG }
    else if (tc < 7.4) { lv = 1; capped = true }
    else lv = 0
    lv = clamp(lv, 0, 1)
    col(lx, bw, gy, gh, capped ? A : GRAY, capped ? 0.85 : 0.4)
    if (lv > 0.001) {
      g.globalAlpha = 0.9; g.fillStyle = A
      const fh = gh * lv
      rr(lx - bw / 2 + 2 * dpr, gb - fh, bw - 4 * dpr, fh - 2 * dpr, bw * 0.18); g.fill()
      g.globalAlpha = 1
    }
    // 刻度線
    g.globalAlpha = 0.35; g.strokeStyle = '#0b0d12'; g.lineWidth = 2 * dpr
    for (let i = 1; i < SEG; i++) {
      const y = gb - gh * (i / SEG)
      g.beginPath(); g.moveTo(lx - bw / 2 + 2 * dpr, y); g.lineTo(lx + bw / 2 - 2 * dpr, y); g.stroke()
    }
    // 上限線（滿了就停住，脈動）
    const pulse = capped ? 0.55 + 0.45 * Math.sin(now / 180) : 0.3
    g.globalAlpha = pulse; g.strokeStyle = capped ? A : GRAY; g.lineWidth = 2 * dpr
    g.setLineDash([5 * dpr, 4 * dpr])
    g.beginPath(); g.moveTo(lx - bw * 0.82, gy); g.lineTo(lx + bw * 0.82, gy); g.stroke()
    g.setLineDash([]); g.globalAlpha = 1

    // ---- 右：API key（餘額持續往下掉，滴乾再儲值） ----
    const dp = (tc % DRAIN) / DRAIN
    const rv = clamp(1 - dp, 0, 1)
    const refill = dp < 0.12 ? 1 - dp / 0.12 : 0
    col(rx, bw, gy, gh, GOLD, 0.42 + refill * 0.45)
    g.globalAlpha = 0.9; g.fillStyle = GOLD
    const rh = gh * rv
    if (rh > 2 * dpr) {
      rr(rx - bw / 2 + 2 * dpr, gb - rh, bw - 4 * dpr, rh - 2 * dpr, bw * 0.18); g.fill()
    }
    g.globalAlpha = 1

    // 滴落
    nextDrop -= dt
    if (nextDrop <= 0 && rv > 0.02) { nextDrop = 0.26; drops.push({ x: rx, y: gb, v: 0, a: 1 }) }
    drops = drops.filter(d => d.a > 0 && d.y < h * 1.05)
    for (const d of drops) {
      d.v += 620 * dpr * dt * 0.5; d.y += d.v * dt; d.a -= dt * 0.55
      g.globalAlpha = Math.max(0, d.a) * 0.9; g.fillStyle = GOLD
      g.beginPath(); g.ellipse(d.x, d.y, 2.4 * dpr, 3.6 * dpr, 0, 0, 7); g.fill()
    }
    g.globalAlpha = 1

    // ---- 標籤 ----
    g.textAlign = 'center'; g.textBaseline = 'top'
    g.font = `600 ${h * 0.072}px "Noto Sans TC","Inter",sans-serif`
    g.globalAlpha = 0.8; g.fillStyle = A
    g.fillText('訂閱', lx, gb + h * 0.055)
    g.fillStyle = GOLD
    g.fillText('API key', rx, gb + h * 0.055)
    g.font = `500 ${h * 0.055}px "Noto Sans TC","Inter",sans-serif`
    g.globalAlpha = 0.5; g.fillStyle = GRAY
    g.fillText(capped ? '上限 · 停住' : '固定額度', lx, gb + h * 0.14)
    g.fillText(refill > 0.4 ? '儲值' : '按量扣款', rx, gb + h * 0.14)
    g.globalAlpha = 1

    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); drops = []; el.innerHTML = '' }
}
