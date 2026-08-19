// Teaser：同一個頁面（五個區塊），三種讀法輪流掃過 —
// Web Search 只點亮靜態那塊、其餘維持空心（含一枚上鎖）；Claude in Chrome 全亮（連上鎖那塊也開）；
// Playwright 亮動態的、但上鎖那塊照樣空著。循環播放。
export default function mount(el, ctx) {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'width:100%;height:100%;display:block'
  el.appendChild(canvas)
  const g = canvas.getContext('2d')
  const A = ctx.accent, GRAY = '#8a8f98'
  let w, h, raf
  const resize = () => {
    const r = el.getBoundingClientRect()
    w = canvas.width = Math.max(2, r.width * devicePixelRatio)
    h = canvas.height = Math.max(2, r.height * devicePixelRatio)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(el)

  const clamp = x => (x < 0 ? 0 : x > 1 ? 1 : x)
  const ease = x => { const t = clamp(x); return t * t * (3 - 2 * t) }

  // 五個區塊：static / dynamic / locked(k) / interactive / fresh
  const BLOCKS = [[0, 0.92, 's'], [0.22, 0.72, 'd'], [0.44, 0.84, 'k'], [0.66, 0.62, 'i'], [0.88, 0.76, 'f']]
  // 三種讀法各自點亮的集合（第一種＝收錄副本，外框畫虛線）
  const LENS = [['s'], ['s', 'd', 'k', 'i', 'f'], ['s', 'd', 'i', 'f']].map(k => new Set(k))
  const PHASE = 3000, CYCLE = PHASE * LENS.length

  const rrect = (x, y, bw, bh, r) => {
    g.beginPath(); g.moveTo(x + r, y)
    g.lineTo(x + bw - r, y); g.quadraticCurveTo(x + bw, y, x + bw, y + r)
    g.lineTo(x + bw, y + bh - r); g.quadraticCurveTo(x + bw, y + bh, x + bw - r, y + bh)
    g.lineTo(x + r, y + bh); g.quadraticCurveTo(x, y + bh, x, y + bh - r)
    g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath()
  }

  const loop = now => {
    const dpr = devicePixelRatio
    const t = now % CYCLE, li = Math.floor(t / PHASE), p = (t % PHASE) / PHASE
    const lens = LENS[li]
    const padX = w * 0.13, padY = h * 0.2
    const pw = w - padX * 2, ph = h - padY * 2, bh = ph * 0.145
    const scan = ease((p - 0.06) / 0.5)        // 掃描光帶走過的位置 0→1
    const fade = 1 - ease((p - 0.9) / 0.1)     // 段落尾端淡出

    g.clearRect(0, 0, w, h)
    g.lineJoin = g.lineCap = 'round'

    // 外框：Web Search 是虛線（收錄好的副本），開瀏覽器的兩種是實線
    g.setLineDash(li === 0 ? [6 * dpr, 5 * dpr] : [])
    g.globalAlpha = 0.3 * fade; g.strokeStyle = GRAY; g.lineWidth = 1.2 * dpr
    rrect(padX - 12 * dpr, padY - 20 * dpr, pw + 24 * dpr, ph + 32 * dpr, 8 * dpr)
    g.stroke()
    g.setLineDash([])

    for (let i = 0; i < 3; i++) {               // 網址列的三顆點
      g.globalAlpha = 0.26 * fade; g.fillStyle = GRAY
      g.beginPath(); g.arc(padX - 4 * dpr + i * 8 * dpr, padY - 12 * dpr, 2 * dpr, 0, 7); g.fill()
    }

    for (const [ry, wf, kind] of BLOCKS) {
      const by = padY + ry * (ph - bh), bw = pw * wf
      const u = ease(clamp((scan * (ph + bh) - (by - padY)) / bh)) * fade   // 光帶掃過才判讀

      if (lens.has(kind)) {
        g.globalAlpha = 0.1 * u; g.fillStyle = A
        rrect(padX, by, bw, bh, 4 * dpr); g.fill()
        g.globalAlpha = 0.35 + 0.65 * u; g.strokeStyle = A; g.lineWidth = 1.5 * dpr
        g.shadowColor = A; g.shadowBlur = 9 * dpr * u
        rrect(padX, by, bw, bh, 4 * dpr); g.stroke()
        g.shadowBlur = 0
        for (let i = 0; i < 2; i++) {           // 讀到的內容線
          g.globalAlpha = 0.5 * u; g.lineWidth = 1.6 * dpr
          g.beginPath()
          g.moveTo(padX + bw * 0.08, by + bh * (0.36 + i * 0.3))
          g.lineTo(padX + bw * 0.08 + bw * (i ? 0.34 : 0.54) * u, by + bh * (0.36 + i * 0.3))
          g.stroke()
        }
      } else {                                   // 空殼：虛線空心，掃過之後也沒有內容
        g.globalAlpha = (0.16 + 0.14 * u) * fade; g.strokeStyle = GRAY; g.lineWidth = 1.2 * dpr
        g.setLineDash([5 * dpr, 4.5 * dpr])
        rrect(padX, by, bw, bh, 4 * dpr); g.stroke()
        g.setLineDash([])
        if (kind === 'k') {                      // 登入牆那塊：中間一枚小鎖
          const cx = padX + bw / 2, cy = by + bh / 2, s = bh * 0.42
          g.globalAlpha = (0.34 + 0.34 * u) * fade
          g.lineWidth = 1.7 * dpr
          g.beginPath()
          g.rect(cx - s * 0.7, cy - s * 0.15, s * 1.4, s * 0.95)
          g.moveTo(cx - s * 0.38, cy - s * 0.15)
          g.arc(cx, cy - s * 0.15, s * 0.38, Math.PI, 0)
          g.stroke()
        }
      }
    }

    if (p > 0.04 && p < 0.62) {                  // 掃描光帶
      const sy = padY - 6 * dpr + scan * (ph + 12 * dpr)
      const grad = g.createLinearGradient(padX - 12 * dpr, 0, padX + pw + 12 * dpr, 0)
      grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(0.5, A); grad.addColorStop(1, 'rgba(0,0,0,0)')
      g.globalAlpha = 0.75 * fade * (1 - Math.abs(scan * 2 - 1) * 0.5)
      g.strokeStyle = grad; g.lineWidth = 1.6 * dpr
      g.beginPath(); g.moveTo(padX - 12 * dpr, sy); g.lineTo(padX + pw + 12 * dpr, sy); g.stroke()
    }

    LENS.forEach((_, i) => {                     // 底部三段短線：現在是哪一種讀法
      const segW = pw * 0.16, gap = pw * 0.05
      const x = padX + (pw - (3 * segW + 2 * gap)) / 2 + i * (segW + gap), y = padY + ph + 20 * dpr
      g.globalAlpha = i === li ? 0.95 : 0.2
      g.strokeStyle = i === li ? A : GRAY; g.lineWidth = 2 * dpr
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + segW, y); g.stroke()
    })

    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
