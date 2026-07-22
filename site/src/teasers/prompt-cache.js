// prompt-cache — token 格子重複送出：首輪逐格計算；之後前綴整段瞬間變暖色 HIT，只有尾巴新格逐格亮；每 4 輪重置。
export default function mount(el, ctx) {
  const accent = ctx?.accent || '#8ea9e8'
  const gray = '#8a8f98'
  const warm = '#e8a15a'
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
  const M = 10, lens = [4, 6, 8, 10]
  let round = 0, phase = 'hit', pt = 0, lit = 0, hitFlash = 0, last = performance.now()
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; pt += dt
    g.clearRect(0, 0, w, h)
    const prefix = round === 0 ? 0 : lens[round - 1], target = lens[round]
    // 相位機
    if (phase === 'hit') {
      if (prefix === 0) { phase = 'compute'; lit = 0; pt = 0 }
      else { hitFlash = 1; if (pt > 0.5) { phase = 'compute'; lit = prefix; pt = 0 } }
    } else if (phase === 'compute') {
      if (pt > 0.14) { pt = 0; lit++; if (lit >= target) { phase = 'gap' } }
    } else if (phase === 'gap') {
      if (pt > 0.6) { round = round >= 3 ? 0 : round + 1; phase = 'hit'; pt = 0; hitFlash = 0 }
    }
    hitFlash = Math.max(0, hitFlash - dt * 1.6)
    // 格子列
    const cw = w * 0.078, gap = cw * 0.28, totW = M * cw + (M - 1) * gap
    const gx0 = (w - totW) / 2, gy = h * 0.42, gh = h * 0.2
    for (let i = 0; i < M; i++) {
      const x = gx0 + i * (cw + gap)
      let fill = '#171a20', stroke = gray, a = 0.5
      if (i >= target) { fill = '#141821'; stroke = gray; a = 0.3 }
      else if (i < prefix) { // 快取命中
        const flashing = phase === 'hit' || phase === 'compute' || phase === 'gap'
        fill = warm + (hitFlash > 0.3 ? 'cc' : '55'); stroke = warm; a = 1
      } else if (i < lit) { fill = accent + '99'; stroke = accent; a = 1 } // 本輪計算
      else { fill = '#171a20'; stroke = accent + '77'; a = 0.6 } // 待算
      g.globalAlpha = a; g.fillStyle = fill
      g.beginPath(); g.rect(x, gy, cw, gh); g.fill()
      g.strokeStyle = stroke; g.lineWidth = dpr; g.stroke()
      // 正在計算的格子高亮
      if (phase === 'compute' && i === lit) {
        g.globalAlpha = 0.5 + 0.5 * Math.sin(now / 60); g.strokeStyle = accent; g.lineWidth = dpr * 2
        g.beginPath(); g.rect(x, gy, cw, gh); g.stroke()
      }
    }
    // 標籤
    g.globalAlpha = 0.75; g.textAlign = 'left'; g.textBaseline = 'alphabetic'
    g.font = `600 ${h * 0.075}px "Inter",sans-serif`
    g.fillStyle = prefix > 0 ? warm : gray
    g.fillText(prefix > 0 ? `HIT ${prefix}` : 'MISS', gx0, gy - h * 0.06)
    g.textAlign = 'right'; g.fillStyle = gray
    g.fillText(`#${round + 1}`, gx0 + totW, gy - h * 0.06)
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
