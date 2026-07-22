// next-token-prediction — 句子逐字接龍；每字前閃 3 候選字+機率條，選中者落下接上。
export default function mount(el, ctx) {
  const accent = ctx?.accent || '#8ea9e8'
  const gray = '#8a8f98'
  const cv = document.createElement('canvas')
  cv.style.cssText = 'width:100%;height:100%;display:block'
  el.appendChild(cv)
  const g = cv.getContext('2d')
  const SENT = '每個字接著上一個字'
  const POOL = '的是在了不和有大來個中上到說為你地出道時得就那要下把光'
  let raf, w, h, dpr
  const resize = () => {
    dpr = devicePixelRatio || 1
    const r = el.getBoundingClientRect()
    w = cv.width = Math.max(2, r.width * dpr)
    h = cv.height = Math.max(2, r.height * dpr)
  }
  resize()
  const ro = new ResizeObserver(resize); ro.observe(el)
  let idx = 0, phase = 'cand', pt = 0, fade = 1
  const gen = () => {
    const a = [{ c: SENT[idx] || '·', p: 0.6 + Math.random() * 0.15 }]
    for (let i = 0; i < 2; i++) a.push({ c: POOL[(Math.random() * POOL.length) | 0], p: 0.05 + Math.random() * 0.28 })
    return a
  }
  let cands = gen(), last = performance.now()
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; pt += dt
    g.clearRect(0, 0, w, h)
    const fs = Math.max(12, h * 0.16), sp = fs * 1.02
    const committed = SENT.slice(0, idx)
    const startX = (w - (committed.length + 1) * sp) / 2 + sp / 2
    const baseY = h * 0.68
    g.textAlign = 'center'; g.textBaseline = 'middle'
    g.font = `600 ${fs}px "Inter","Noto Sans TC",sans-serif`
    g.globalAlpha = fade; g.fillStyle = '#e6e8ec'
    for (let i = 0; i < committed.length; i++) g.fillText(committed[i], startX + i * sp, baseY)
    const slotX = startX + committed.length * sp
    if (phase === 'cand') {
      for (let k = 0; k < 3; k++) {
        const cy = h * 0.2 + k * fs * 0.92, cd = cands[k], chosen = k === 0
        g.globalAlpha = fade * (chosen ? 0.92 : 0.4)
        g.fillStyle = chosen ? accent : gray
        g.font = `${chosen ? 600 : 400} ${fs * 0.8}px "Inter","Noto Sans TC",sans-serif`
        g.textAlign = 'right'
        g.fillText(cd.c, slotX - fs * 0.12, cy)
        g.fillRect(slotX + fs * 0.2, cy - fs * 0.11, fs * 2.4 * cd.p + fs * 0.15, fs * 0.22)
      }
      g.textAlign = 'center'
      if (pt > 0.6) { phase = 'drop'; pt = 0 }
    } else if (phase === 'drop') {
      const pr = Math.min(1, pt / 0.32), e = pr * pr * (3 - 2 * pr)
      const fromY = h * 0.2, cy = fromY + (baseY - fromY) * e
      g.globalAlpha = fade * (0.9 + 0.1 * e); g.fillStyle = accent
      g.font = `600 ${fs}px "Inter","Noto Sans TC",sans-serif`
      g.fillText(cands[0].c, slotX, cy)
      if (pr >= 1) {
        idx++; pt = 0
        if (idx >= SENT.length) phase = 'hold'
        else { phase = 'cand'; cands = gen() }
      }
    } else if (phase === 'hold') {
      if (pt > 1.1) { phase = 'fade'; pt = 0 }
    } else if (phase === 'fade') {
      fade = Math.max(0, 1 - pt / 0.6)
      if (fade <= 0) { idx = 0; fade = 1; phase = 'cand'; cands = gen(); pt = 0 }
    }
    if (phase === 'cand' || phase === 'hold') {
      g.globalAlpha = fade * (0.3 + 0.4 * (0.5 + 0.5 * Math.sin(pt * 8)))
      g.fillStyle = gray
      g.fillRect(slotX, baseY - fs * 0.4, Math.max(1, dpr), fs * 0.8)
    }
    g.globalAlpha = 1
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); ro.disconnect(); el.innerHTML = '' }
}
