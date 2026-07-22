// context-pollution-rewind — 對話節點鏈往右生長；中途節點變紅並往後傳染；時間倒帶收回，從紅點前長出乾淨綠色分支，循環。
export default function mount(el, ctx) {
  const accent = ctx?.accent || '#8ea9e8'
  const gray = '#8a8f98'
  const red = '#e5484d', green = '#3fbf7f'
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
  const N = 7, PID = 4 // 汙染節點索引；安全點 = PID-1
  let mainCount = 1, redFront = -1, greenCount = 0, phase = 'grow', pt = 0, last = performance.now()
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; pt += dt
    g.clearRect(0, 0, w, h)
    const x0 = w * 0.12, step = w * 0.115, mainY = h * 0.6, R = h * 0.05
    const nx = i => x0 + i * step
    // 相位機
    if (phase === 'grow') { if (pt > 0.34) { pt = 0; if (mainCount < N) mainCount++; else { phase = 'pollute'; redFront = PID - 1 } } }
    else if (phase === 'pollute') { if (pt > 0.26) { pt = 0; if (redFront < N - 1) redFront++; else phase = 'wait' } }
    else if (phase === 'wait') { if (pt > 0.6) { phase = 'rewind'; pt = 0 } }
    else if (phase === 'rewind') { if (pt > 0.16) { pt = 0; if (mainCount > PID) mainCount--; else { phase = 'branch'; greenCount = 0 } } }
    else if (phase === 'branch') { if (pt > 0.32) { pt = 0; if (greenCount < 4) greenCount++; else phase = 'hold' } }
    else if (phase === 'hold') { if (pt > 1.0) { mainCount = 1; redFront = -1; greenCount = 0; phase = 'grow'; pt = 0 } }
    // 主鏈連線
    g.strokeStyle = gray; g.lineWidth = dpr * 1.2
    for (let i = 1; i < mainCount; i++) {
      const poisoned = redFront >= 0 && i <= redFront && i >= PID
      g.globalAlpha = 0.5; g.strokeStyle = poisoned ? red : gray
      g.beginPath(); g.moveTo(nx(i - 1), mainY); g.lineTo(nx(i), mainY); g.stroke()
    }
    // 綠色分支連線
    const safeX = nx(PID - 1)
    g.strokeStyle = green; g.globalAlpha = 0.5
    for (let j = 0; j < greenCount; j++) {
      const ax = safeX + j * step * 0.92, ay = mainY - j * h * 0.06
      const bx = safeX + (j + 1) * step * 0.92, byy = mainY - (j + 1) * h * 0.06
      g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, byy); g.stroke()
    }
    // 主節點
    for (let i = 0; i < mainCount; i++) {
      const poisoned = redFront >= 0 && i <= redFront && i >= PID
      const col = poisoned ? red : accent
      g.globalAlpha = 1; g.fillStyle = poisoned ? red + '33' : '#1b1f27'
      g.strokeStyle = col; g.lineWidth = dpr * 1.4
      g.beginPath(); g.arc(nx(i), mainY, R, 0, 7); g.fill(); g.stroke()
      if (poisoned) { g.globalAlpha = 0.35; g.beginPath(); g.arc(nx(i), mainY, R * (1.3 + 0.2 * Math.sin(now / 120)), 0, 7); g.stroke() }
    }
    // 綠節點
    for (let j = 1; j <= greenCount; j++) {
      const bx = safeX + j * step * 0.92, byy = mainY - j * h * 0.06
      g.globalAlpha = 1; g.fillStyle = green + '33'; g.strokeStyle = green; g.lineWidth = dpr * 1.4
      g.beginPath(); g.arc(bx, byy, R * 0.9, 0, 7); g.fill(); g.stroke()
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
