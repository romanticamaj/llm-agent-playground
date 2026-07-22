// Demo：確定性 vs 非確定性（Deterministic vs Non-deterministic）
// 核心互動：左「函式機器」跑 10 次，10 條軌跡完全重合成一條；右「LLM」跑 10 次，
// 10 條軌跡像煙火般散開；temperature 滑桿 0→2 控制右邊發散程度（0 幾乎收斂）。

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'

  const OUTPUTS = [
    '今天像被揉皺又攤平的一張紙。',
    '今天是溫吞的、剛剛好的一天。',
    '像一杯忘了加糖的咖啡。',
    '今天有點灰，但灰得很溫柔。',
    '一切都慢半拍，卻剛剛好。',
    '像午後突然想睡的那種鬆。',
    '平凡到值得被記住的一天。',
    '今天是還沒說完的一句話。',
    '像雨後還沒乾的柏油路。',
    '有點忙，但心是靜的。',
  ]

  const style = document.createElement('style')
  style.textContent = `
  .dvn-wrap{position:absolute;inset:0;display:flex;flex-direction:column;gap:16px;padding:24px 30px;box-sizing:border-box;font-family:var(--font-tc,'Noto Sans TC',sans-serif);overflow:auto}
  .dvn-lead{font-size:17px;color:#9aa0b0;line-height:1.55}
  .dvn-lead b{color:#e8ebf2;font-weight:600}
  .dvn-cols{flex:1;min-height:340px;display:grid;grid-template-columns:1fr 1fr;gap:18px}
  .dvn-card{position:relative;border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(255,255,255,.02);display:flex;flex-direction:column;overflow:hidden}
  .dvn-head{padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:baseline;gap:10px}
  .dvn-head .t{font-size:19px;font-weight:600;color:#eef1f7}
  .dvn-head .s{font-size:13px;letter-spacing:.1em;text-transform:uppercase}
  .dvn-in{font-size:15px;color:#8b91a2;padding:8px 18px 0}
  .dvn-in code{color:#e8ebf2;background:rgba(255,255,255,.06);padding:2px 7px;border-radius:5px;font-size:15px}
  .dvn-canvas-box{flex:1;position:relative;min-height:150px}
  .dvn-canvas-box canvas{position:absolute;inset:0;width:100%;height:100%}
  .dvn-tag{position:absolute;top:10px;right:12px;font-size:13px;padding:3px 9px;border-radius:999px;font-weight:600}
  .dvn-tag.det{color:#4ade80;background:rgba(74,222,128,.12);border:1px solid rgba(74,222,128,.3)}
  .dvn-tag.non{color:#fbbf24;background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.3)}
  .dvn-out{padding:8px 16px 12px;font-size:15px;line-height:1.55;max-height:112px;overflow:auto}
  .dvn-out .row{padding:2px 0;color:#c3c8d4;opacity:0;transform:translateX(-6px);transition:all .3s}
  .dvn-out .row.show{opacity:1;transform:none}
  .dvn-out .row .n{color:#6b7180;font-variant-numeric:tabular-nums;margin-right:8px}
  .dvn-out .same{color:#4ade80}
  .dvn-temp{display:flex;align-items:center;gap:14px;padding:10px 4px;flex-wrap:wrap}
  .dvn-temp label{font-size:16px;color:#c3c8d4;white-space:nowrap}
  .dvn-temp input[type=range]{flex:1;accent-color:${accent};min-width:180px;max-width:360px}
  .dvn-temp .val{font-size:16px;font-weight:600;color:${accent};font-variant-numeric:tabular-nums;width:2.6em;text-align:right}
  .dvn-temp .desc{font-size:13px;color:#7d8496;min-width:6em}
  .dvn-controls{display:flex;gap:12px;flex-wrap:wrap}
  `
  el.appendChild(style)

  const wrap = document.createElement('div')
  wrap.className = 'dvn-wrap'
  wrap.innerHTML = `
    <div class="dvn-lead">同樣的輸入，跑 10 次。<b>左邊的函式</b>每次都走同一條路、給同一個答案；<b>右邊的 LLM</b>在機率上抽樣，10 次散成 10 條不同的路。這就是 <b>確定</b> vs. <b>非確定</b>。</div>
    <div class="dvn-cols">
      <div class="dvn-card">
        <div class="dvn-head"><span class="t">函式機器</span><span class="s" style="color:#4ade80">DETERMINISTIC</span></div>
        <div class="dvn-in">輸入 <code>add(2, 2)</code> → 期待固定輸出</div>
        <div class="dvn-canvas-box"><canvas id="dvn-cL"></canvas><span class="dvn-tag det">10/10 相同</span></div>
        <div class="dvn-out" id="dvn-outL"></div>
      </div>
      <div class="dvn-card">
        <div class="dvn-head"><span class="t">LLM</span><span class="s" style="color:#fbbf24">NON-DETERMINISTIC</span></div>
        <div class="dvn-in">輸入 <code>「用一句話形容今天」</code> → 抽樣輸出</div>
        <div class="dvn-canvas-box"><canvas id="dvn-cR"></canvas><span class="dvn-tag non" id="dvn-tagR">10 條散開</span></div>
        <div class="dvn-out" id="dvn-outR"></div>
      </div>
    </div>
    <div class="dvn-temp">
      <label>Temperature</label>
      <input type="range" id="dvn-temp" min="0" max="2" step="0.05" value="0.9">
      <span class="val" id="dvn-tval">0.9</span>
      <span class="desc" id="dvn-tdesc">有創意、發散</span>
    </div>
    <div class="dvn-controls">
      <button class="demo-btn primary" id="dvn-run">同時跑 10 次</button>
      <button class="demo-btn" id="dvn-clear">清除</button>
    </div>
  `
  el.appendChild(wrap)

  const $ = (id) => wrap.querySelector(id)
  const cL = $('#dvn-cL'), cR = $('#dvn-cR')
  const ctxL = cL.getContext('2d'), ctxR = cR.getContext('2d')
  const outL = $('#dvn-outL'), outR = $('#dvn-outR')
  const tagR = $('#dvn-tagR')
  const slider = $('#dvn-temp'), tval = $('#dvn-tval'), tdesc = $('#dvn-tdesc')
  const btnRun = $('#dvn-run'), btnClear = $('#dvn-clear')

  const rafs = new Set()
  const timers = new Set()
  const setT = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  let temperature = 0.9

  function fitCanvas(c) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const r = c.getBoundingClientRect()
    c.width = Math.max(10, r.width * dpr)
    c.height = Math.max(10, r.height * dpr)
    const g = c.getContext('2d')
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    return { w: r.width, h: r.height }
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  // 一條路徑：從左中出發，經過幾個控制點到右側；spread 決定沿途抖動
  function makePath(w, h, seed, spread) {
    const rnd = mulberry32(seed)
    const startY = h / 2
    const pts = [{ x: 8, y: startY }]
    const n = 5
    for (let i = 1; i <= n; i++) {
      const x = 8 + (w - 16) * (i / n)
      const jitter = (rnd() - 0.5) * 2 * spread * (i / n)
      pts.push({ x, y: Math.max(8, Math.min(h - 8, startY + jitter)) })
    }
    return pts
  }

  function drawPaths(canvas, gctx, paths, color, progress) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    gctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
    paths.forEach((pts) => {
      gctx.beginPath()
      gctx.moveTo(pts[0].x, pts[0].y)
      const last = 1 + (pts.length - 1) * progress
      for (let k = 1; k < pts.length; k++) {
        const p = pts[k]
        if (k <= last) gctx.lineTo(p.x, p.y)
        else {
          const prev = pts[k - 1]
          const f = Math.max(0, Math.min(1, last - (k - 1)))
          gctx.lineTo(prev.x + (p.x - prev.x) * f, prev.y + (p.y - prev.y) * f)
          break
        }
      }
      gctx.strokeStyle = color
      gctx.globalAlpha = 0.5
      gctx.lineWidth = 2
      gctx.stroke()
      if (progress >= 1) {
        const end = pts[pts.length - 1]
        gctx.globalAlpha = 1
        gctx.beginPath()
        gctx.arc(end.x, end.y, 3.5, 0, Math.PI * 2)
        gctx.fillStyle = color
        gctx.fill()
      }
    })
    gctx.globalAlpha = 1
  }

  function tempDesc(t) {
    if (t <= 0.05) return '幾乎收斂'
    if (t < 0.5) return '偏保守'
    if (t < 1.1) return '有創意、發散'
    if (t < 1.6) return '很發散'
    return '接近混亂'
  }

  let running = false
  function run() {
    if (running) return
    running = true
    btnRun.disabled = true
    const dimL = fitCanvas(cL), dimR = fitCanvas(cR)
    // 左：全部同一條 → spread 0、seed 相同 → 完全重合
    const pathsL = Array.from({ length: 10 }, () => makePath(dimL.w, dimL.h, 42, 0))
    // 右：spread 隨 temperature，seed 各不同
    const spreadMax = (dimR.h / 2 - 14)
    const spread = spreadMax * (0.02 + 0.98 * (temperature / 2))
    const pathsR = Array.from({ length: 10 }, (_, i) => makePath(dimR.w, dimR.h, 100 + i * 7, spread))

    outL.innerHTML = ''; outR.innerHTML = ''
    tagR.textContent = temperature <= 0.05 ? '幾乎收斂' : '10 條散開'

    const t0 = performance.now()
    const dur = 900
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / dur)
      drawPaths(cL, ctxL, pathsL, '#4ade80', p)
      drawPaths(cR, ctxR, pathsR, accent, p)
      if (p < 1) { const id = requestAnimationFrame(tick); rafs.add(id) }
      else { rafs.clear(); revealOutputs() }
    }
    const id = requestAnimationFrame(tick); rafs.add(id)

    function revealOutputs() {
      for (let i = 0; i < 10; i++) {
        setT(() => {
          const row = document.createElement('div')
          row.className = 'row'
          row.innerHTML = `<span class="n">#${i + 1}</span><span class="same">4</span>`
          outL.appendChild(row)
          requestAnimationFrame(() => row.classList.add('show'))
        }, i * 55)
      }
      const rnd = mulberry32(Math.round(temperature * 1000) + 7)
      for (let i = 0; i < 10; i++) {
        setT(() => {
          let text
          if (temperature <= 0.08) text = OUTPUTS[0]
          else if (temperature < 0.5) text = OUTPUTS[Math.floor(rnd() * 3)]
          else text = OUTPUTS[Math.floor(rnd() * OUTPUTS.length)]
          const row = document.createElement('div')
          row.className = 'row'
          row.innerHTML = `<span class="n">#${i + 1}</span>${text}`
          outR.appendChild(row)
          requestAnimationFrame(() => row.classList.add('show'))
          if (i === 9) setT(() => { running = false; btnRun.disabled = false }, 60)
        }, 550 + i * 60)
      }
    }
  }

  function clearAll() {
    ;[cL, cR].forEach((c) => { const d = fitCanvas(c); c.getContext('2d').clearRect(0, 0, d.w, d.h) })
    outL.innerHTML = ''; outR.innerHTML = ''
    tagR.textContent = '10 條散開'
  }

  slider.addEventListener('input', () => {
    temperature = parseFloat(slider.value)
    tval.textContent = temperature.toFixed(2)
    tdesc.textContent = tempDesc(temperature)
  })
  btnRun.addEventListener('click', run)
  btnClear.addEventListener('click', clearAll)

  const onResize = () => { fitCanvas(cL); fitCanvas(cR) }
  window.addEventListener('resize', onResize)

  setT(() => { fitCanvas(cL); fitCanvas(cR) }, 30)

  return () => {
    rafs.forEach((id) => cancelAnimationFrame(id)); rafs.clear()
    timers.forEach((id) => clearTimeout(id)); timers.clear()
    window.removeEventListener('resize', onResize)
    style.remove(); wrap.remove()
  }
}
