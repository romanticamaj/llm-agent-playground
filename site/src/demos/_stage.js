// DemoStage —「導演框架」：beat 節奏 + spotlight + 大旁白 + juice motion
// 用法見 DEMO_GUIDE.md「DemoStage」一節。
//
//   const stage = createStage(el, ctx, { beats: [...] })
//   return stage.destroy
//
// beat = {
//   narration: '一次只講一句的大旁白',
//   focus: ['.selector', elRef],   // 這一拍的主角；其他 .ds-unit 自動 dim
//   enter(stage) {},               // beat 開始（做動畫、掛互動）
//   exit(stage) {},                // beat 離開（收尾）
//   nextLabel: '下一步 →',          // 自訂按鈕字
//   sandbox: true,                 // 最後一拍：解除 dim、隱藏下一步、自由玩
// }
// 場景 DOM 放在 stage.body；會被 dim 的視覺單元加 class="ds-unit"。

const EASE_OUT = 'cubic-bezier(.16,1,.3,1)'

let cssInjected = false
function injectCSS() {
  if (cssInjected) return
  cssInjected = true
  const s = document.createElement('style')
  s.id = 'ds-stage-css'
  s.textContent = `
  .ds-root{position:absolute;inset:0;display:flex;flex-direction:column;overflow:hidden}
  .ds-body{position:relative;flex:1;overflow:auto;padding:28px 36px 16px}
  .ds-unit{transition:opacity .5s ${EASE_OUT}, filter .5s ${EASE_OUT}}
  .ds-dim{opacity:.22;filter:blur(1.5px) saturate(.6);pointer-events:none}
  .ds-bar{flex:none;display:flex;align-items:center;gap:24px;padding:18px 32px 22px;
    border-top:1px solid var(--line);background:rgba(8,9,10,.55);backdrop-filter:blur(14px)}
  .ds-dots{display:flex;gap:7px;flex:none}
  .ds-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.16);transition:all .3s}
  .ds-dot.on{background:var(--accent);box-shadow:0 0 10px var(--accent);transform:scale(1.3)}
  .ds-dot.done{background:rgba(255,255,255,.4)}
  .ds-narr{flex:1;min-width:0;font-size:clamp(18px,1.6vw,24px);font-weight:500;line-height:1.6;
    color:var(--text);letter-spacing:-0.011em}
  .ds-narr b,.ds-narr strong{color:var(--accent)}
  .ds-nav{display:flex;gap:10px;flex:none;align-items:center}
  .ds-back{font-family:var(--font-mono);font-size:12px;color:var(--text-dim);background:none;
    border:1px solid var(--line);border-radius:999px;width:38px;height:38px;cursor:pointer;transition:all .25s}
  .ds-back:hover{color:var(--text);border-color:var(--text)}
  .ds-back:disabled{opacity:.25;cursor:default}
  .ds-next{font-family:var(--font-tc);font-size:15px;font-weight:700;letter-spacing:.08em;
    color:#08090a;background:var(--text);border:none;border-radius:999px;padding:12px 26px;
    cursor:pointer;transition:transform .25s ${EASE_OUT},box-shadow .25s;white-space:nowrap}
  .ds-next:hover{transform:translateY(-2px);box-shadow:0 12px 32px -12px rgba(247,248,248,.4)}
  .ds-sandbox-tag{font-family:var(--font-mono);font-size:11px;letter-spacing:.24em;text-transform:uppercase;
    color:var(--accent);border:1px solid var(--accent);border-radius:999px;padding:8px 16px;white-space:nowrap;
    animation:dsPulse 2s ease-in-out infinite}
  @keyframes dsPulse{50%{opacity:.55}}
  .ds-hintkey{font-family:var(--font-mono);font-size:10px;letter-spacing:.18em;color:var(--text-dim)}
  @media (max-width:760px){.ds-bar{flex-wrap:wrap;gap:12px}.ds-narr{width:100%;order:-1;font-size:17px}}
  `
  document.head.appendChild(s)
}

/* ---------- juice utils ---------- */
export function pop(el, scale = 1.16) {
  el?.animate?.(
    [{ transform: 'scale(1)' }, { transform: `scale(${scale})` }, { transform: 'scale(1)' }],
    { duration: 260, easing: EASE_OUT }
  )
}
export function shake(el) {
  el?.animate?.(
    [0, -9, 8, -6, 4, -2, 0].map(x => ({ transform: `translateX(${x}px)` })),
    { duration: 380, easing: 'ease-out' }
  )
}
export function enterFly(el, { y = 26, delay = 0, dur = 650 } = {}) {
  if (!el?.animate) return
  el.animate(
    [
      { opacity: 0, transform: `translateY(${y}px) scale(.97)` },
      { opacity: 1, transform: 'translateY(0) scale(1)' },
    ],
    { duration: dur, delay, easing: EASE_OUT, fill: 'backwards' }
  )
}
export function countUp(el, to, { from = 0, dur = 800, fmt = v => Math.round(v).toLocaleString() } = {}) {
  if (!el) return
  const t0 = performance.now()
  const step = now => {
    const p = Math.min(1, (now - t0) / dur)
    const e = 1 - Math.pow(1 - p, 3)
    el.textContent = fmt(from + (to - from) * e)
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
export function confettiBurst(container, x, y, color = '#4ade80', n = 26) {
  const cv = document.createElement('canvas')
  const r = container.getBoundingClientRect()
  cv.width = r.width * devicePixelRatio
  cv.height = r.height * devicePixelRatio
  cv.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:50;width:100%;height:100%'
  container.appendChild(cv)
  const g = cv.getContext('2d')
  const ps = Array.from({ length: n }, () => ({
    x: x * devicePixelRatio, y: y * devicePixelRatio,
    vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 13 - 3,
    s: (2 + Math.random() * 3.5) * devicePixelRatio,
    rot: Math.random() * 7, vr: (Math.random() - 0.5) * 0.4, life: 1,
  }))
  let raf
  const loop = () => {
    g.clearRect(0, 0, cv.width, cv.height)
    let alive = false
    for (const p of ps) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.45; p.rot += p.vr; p.life -= 0.014
      if (p.life <= 0) continue
      alive = true
      g.save(); g.translate(p.x, p.y); g.rotate(p.rot)
      g.globalAlpha = Math.max(0, p.life)
      g.fillStyle = color
      g.fillRect(-p.s / 2, -p.s / 2, p.s, p.s)
      g.restore()
    }
    if (alive) raf = requestAnimationFrame(loop)
    else cv.remove()
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); cv.remove() }
}

/* ---------- stage ---------- */
export function createStage(el, ctx, config) {
  injectCSS()
  const root = document.createElement('div')
  root.className = 'ds-root'
  root.innerHTML = `
    <div class="ds-body"></div>
    <div class="ds-bar">
      <div class="ds-dots"></div>
      <div class="ds-narr"></div>
      <div class="ds-nav">
        <span class="ds-hintkey">←→</span>
        <button class="ds-back" aria-label="上一步">←</button>
        <button class="ds-next">下一步 →</button>
      </div>
    </div>`
  el.appendChild(root)

  const body = root.querySelector('.ds-body')
  const dotsEl = root.querySelector('.ds-dots')
  const narrEl = root.querySelector('.ds-narr')
  const backBtn = root.querySelector('.ds-back')
  const nextBtn = root.querySelector('.ds-next')
  const navEl = root.querySelector('.ds-nav')

  const beats = config.beats
  beats.forEach(() => {
    const d = document.createElement('div')
    d.className = 'ds-dot'
    dotsEl.appendChild(d)
  })

  const stage = {
    root, body, ctx, index: -1, alive: true,
    utils: { pop, shake, enterFly, countUp, confettiBurst },
    focus(targets) {
      const keep = new Set()
      for (const t of targets || []) {
        if (typeof t === 'string') body.querySelectorAll(t).forEach(n => keep.add(n))
        else if (t) keep.add(t)
      }
      body.querySelectorAll('.ds-unit').forEach(u => {
        const hit = keep.size === 0 || keep.has(u) || [...keep].some(k => k.contains?.(u) || u.contains?.(k))
        u.classList.toggle('ds-dim', !hit)
      })
    },
    clearFocus() {
      body.querySelectorAll('.ds-unit').forEach(u => u.classList.remove('ds-dim'))
    },
    setNarration(text) {
      narrEl.style.animation = 'none'
      // 重觸發滑入
      void narrEl.offsetWidth
      narrEl.innerHTML = text
      narrEl.animate(
        [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
        { duration: 450, easing: EASE_OUT }
      )
    },
    goto(i) {
      if (!stage.alive || i < 0 || i >= beats.length) return
      const prev = beats[stage.index]
      if (prev?.exit) { try { prev.exit(stage) } catch (e) { console.error(e) } }
      stage.index = i
      const b = beats[i]
      dotsEl.querySelectorAll('.ds-dot').forEach((d, j) => {
        d.classList.toggle('on', j === i)
        d.classList.toggle('done', j < i)
      })
      backBtn.disabled = i === 0
      if (b.sandbox) {
        stage.clearFocus()
        nextBtn.style.display = 'none'
        if (!navEl.querySelector('.ds-sandbox-tag')) {
          const tag = document.createElement('span')
          tag.className = 'ds-sandbox-tag'
          tag.textContent = 'SANDBOX · 自由實驗'
          navEl.insertBefore(tag, backBtn)
        }
      } else {
        nextBtn.style.display = ''
        navEl.querySelector('.ds-sandbox-tag')?.remove()
        nextBtn.textContent = b.nextLabel || '下一步 →'
      }
      stage.setNarration(b.narration || '')
      if (b.focus) stage.focus(b.focus)
      else if (!b.sandbox) stage.clearFocus()
      if (b.enter) { try { b.enter(stage) } catch (e) { console.error(e) } }
    },
    next() { pop(nextBtn, 1.08); stage.goto(stage.index + 1) },
    prev() { stage.goto(stage.index - 1) },
    destroy() {
      stage.alive = false
      const cur = beats[stage.index]
      if (cur?.exit) { try { cur.exit(stage) } catch {} }
      document.removeEventListener('keydown', onKey)
      root.remove()
    },
  }

  nextBtn.addEventListener('click', stage.next)
  backBtn.addEventListener('click', stage.prev)
  const onKey = e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); stage.next() }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); stage.prev() }
  }
  document.addEventListener('keydown', onKey)

  // 讓呼叫端先蓋場景再開演
  queueMicrotask(() => { if (stage.alive && stage.index === -1) stage.goto(0) })
  return stage
}
