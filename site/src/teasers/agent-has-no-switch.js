// Agent 沒有開關 — 時間軸上規律出現觸發點，方塊被叫醒才亮一下；排程被關掉後就一直暗著
export default function mount(el, ctx) {
  const A = ctx.accent || '#5b8cff', G = '#8a8f98', AM = '#fbbf24'
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
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x))
  const rr = (x, y, ww, hh, r) => {
    g.beginPath(); g.moveTo(x + r, y)
    g.arcTo(x + ww, y, x + ww, y + hh, r); g.arcTo(x + ww, y + hh, x, y + hh, r)
    g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + ww, y, r); g.closePath()
  }

  const T = 13                       // 一輪循環
  const MARKS = [0.14, 0.34, 0.54]   // 觸發點（第 4 個之後排程被關掉）
  const CUT = 0.68                   // 排程被關掉的時刻（比例）
  const RUN = 0.075                  // 每次接龍佔的時間比例
  const start = performance.now()

  const loop = now => {
    const t = (now - start) / 1000, tc = (t % T) / T
    const u = Math.min(w, h)
    g.clearRect(0, 0, w, h)
    g.lineCap = 'round'; g.lineJoin = 'round'

    const live = MARKS.filter(m => m < CUT)
    // 目前是否正在接龍
    let act = 0
    for (const m of live) {
      if (tc >= m && tc < m + RUN) {
        const p = (tc - m) / RUN
        act = p < 0.25 ? ease(p / 0.25) : 1 - ease(clamp((p - 0.55) / 0.45, 0, 1))
      }
    }

    // ---- 接龍引擎（上方方塊 + 一排 token 格）----
    const bw = w * 0.46, bh = h * 0.30, bx = (w - bw) / 2, by = h * 0.16
    g.globalAlpha = 0.35 + act * 0.6
    g.strokeStyle = act > 0.15 ? A : G
    g.lineWidth = (1.4 + act * 0.9) * dpr
    rr(bx, by, bw, bh, 8 * dpr); g.stroke()
    if (act > 0.02) { g.globalAlpha = act * 0.12; g.fillStyle = A; rr(bx, by, bw, bh, 8 * dpr); g.fill() }

    // token 格：依接龍進度一格一格點亮
    const n = 6, pad = bw * 0.08, gap = bw * 0.024
    const tw = (bw - pad * 2 - gap * (n - 1)) / n, th = bh * 0.34, ty = by + bh * 0.33
    let prog = 0
    for (const m of live) if (tc >= m && tc < m + RUN) prog = clamp((tc - m) / (RUN * 0.7), 0, 1)
    for (let i = 0; i < n; i++) {
      const x = bx + pad + i * (tw + gap)
      const on = act > 0.05 && prog * n > i ? 1 : 0
      g.globalAlpha = on ? 0.55 + act * 0.45 : 0.18
      g.strokeStyle = on ? A : G
      g.lineWidth = 1.3 * dpr
      rr(x, ty, tw, th, 2.5 * dpr); g.stroke()
      if (on) { g.globalAlpha = act * 0.3; g.fillStyle = A; rr(x, ty, tw, th, 2.5 * dpr); g.fill() }
    }

    // ---- 時間軸 ----
    const ax = w * 0.08, aw = w * 0.84, ay = h * 0.76
    g.globalAlpha = 0.3; g.strokeStyle = G; g.lineWidth = 1.2 * dpr
    g.setLineDash([4 * dpr, 6 * dpr])
    g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax + aw, ay); g.stroke()
    g.setLineDash([])

    // 觸發點（菱形）；排程被關掉後那一段不再有點
    for (const m of MARKS) {
      const on = m < CUT
      const near = tc >= m && tc < m + RUN          // 被掃到的那一刻才亮
      const fade = on ? 1 : clamp(1 - (tc - CUT) * 6, 0, 1)   // 關掉瞬間淡出殘影
      if (fade <= 0.01) continue
      const x = ax + aw * m, s = u * (0.026 + (near && on ? 0.014 : 0))
      g.save(); g.translate(x, ay); g.rotate(Math.PI / 4)
      g.globalAlpha = fade * (on ? (near ? 1 : 0.7) : 0.3)
      g.strokeStyle = AM; g.lineWidth = 1.6 * dpr
      g.strokeRect(-s / 2, -s / 2, s, s)
      if (near && on) { g.globalAlpha = fade * 0.7; g.fillStyle = AM; g.fillRect(-s / 2, -s / 2, s, s) }
      g.restore()
    }

    // 排程關掉的位置：一道斷線
    if (tc > CUT - 0.01) {
      const x = ax + aw * CUT
      g.globalAlpha = clamp((tc - CUT + 0.01) * 8, 0, 1) * 0.75
      g.strokeStyle = G; g.lineWidth = 1.4 * dpr
      g.beginPath(); g.moveTo(x, ay - u * 0.05); g.lineTo(x, ay + u * 0.05); g.stroke()
    }

    // 播放頭
    const px = ax + aw * tc
    g.globalAlpha = 0.9; g.strokeStyle = A; g.lineWidth = 1.6 * dpr
    g.beginPath(); g.moveTo(px, ay - u * 0.075); g.lineTo(px, ay + u * 0.04); g.stroke()
    g.fillStyle = A; g.globalAlpha = 1
    g.beginPath(); g.arc(px, ay - u * 0.075, 2.8 * dpr, 0, 7); g.fill()

    // 引擎與觸發點之間的連線（只有被叫醒那一刻才亮）
    if (act > 0.05) {
      g.globalAlpha = act * 0.5; g.strokeStyle = A; g.lineWidth = 1.2 * dpr
      g.setLineDash([3 * dpr, 4 * dpr])
      g.beginPath(); g.moveTo(px, ay - u * 0.08); g.lineTo(w / 2, by + bh); g.stroke()
      g.setLineDash([])
    }

    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
