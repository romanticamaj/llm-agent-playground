// 組裝 Agent 生物 — Agent = Model + Body + Harness
// 大腦固定是 Opus 4.6；換不同的 Body 與 Harness，派同一個任務「修一個 bug」，
// 看輸出分布：對的組合收斂成窄鐘形，錯的組合攤成寬扁。彩蛋：harness 加一條「≤100 字」就出包。
export default function mount(el, ctx) {
  const accent = ctx?.accent || '#38e1c6'
  const GREEN = '#4ade80', RED = '#f87171'
  const P = 'hns'
  const style = document.createElement('style')
  style.textContent = `
  .${P}-root{position:absolute;inset:0;overflow:auto;padding:20px 24px;color:#e8ebf2;box-sizing:border-box;
    font-family:var(--font-tc,'Noto Sans TC',sans-serif)}
  .${P}-guide{font-size:17px;color:#aeb4c4;margin-bottom:16px;line-height:1.6}
  .${P}-guide b{color:${accent}}
  .${P}-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}
  .${P}-panel{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#0c0f16;padding:16px}
  .${P}-panel h3{margin:0 0 12px;font-size:17px;letter-spacing:.04em}
  .${P}-slot{margin-bottom:14px}
  .${P}-slot .lab{font-size:14px;color:#8b93a7;margin-bottom:6px;letter-spacing:.06em}
  .${P}-opts{display:flex;gap:8px;flex-wrap:wrap}
  .${P}-chip{flex:1;min-width:120px;border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:10px 12px;
    cursor:pointer;transition:.18s;background:rgba(255,255,255,.02);font-size:15px}
  .${P}-chip:hover{border-color:${accent}}
  .${P}-chip.on{border-color:${accent};background:rgba(56,225,198,.1);box-shadow:0 0 0 1px ${accent} inset}
  .${P}-chip.fixed{cursor:default;border-style:dashed;opacity:.9}
  .${P}-chip .t{font-weight:700;margin-bottom:2px}
  .${P}-chip .d{font-size:13px;color:#8b93a7}
  .${P}-creature{display:flex;align-items:center;justify-content:center;gap:6px;margin:6px 0 14px;font-size:14px;color:#9aa0b0}
  .${P}-node{width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;
    font-size:24px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14)}
  .${P}-node.set{border-color:${accent};box-shadow:0 0 12px rgba(56,225,198,.4)}
  .${P}-run{margin:4px 0 14px}
  .${P}-result h3{margin-top:0}
  .${P}-verdict{font-size:15px;line-height:1.6;min-height:66px;color:#cfd4e0}
  .${P}-verdict .ok{color:${GREEN};font-weight:600}
  .${P}-verdict .bad{color:${RED};font-weight:600}
  .${P}-canvas{display:block;width:100%;height:180px;margin-top:8px}
  .${P}-legend{font-size:13px;color:#8b93a7;text-align:center;margin-top:6px}
  .${P}-egg{margin-top:14px;border-top:1px solid rgba(255,255,255,.1);padding-top:14px;display:flex;
    align-items:center;gap:12px;flex-wrap:wrap}
  .${P}-egg .demo-btn.on{background:${RED};color:#120708;border-color:${RED}}
  .${P}-eggnote{font-size:14px;color:#aeb4c4;flex:1;min-width:200px}
  @media(max-width:820px){.${P}-grid{grid-template-columns:1fr}}
  `
  document.head.appendChild(style)

  const svg = (p, s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block">${p}</svg>`
  const ICO = {
    wrench: '<path d="M15.5 5.5a3.5 3.5 0 0 0-4 5.4L5 17.4a1.6 1.6 0 0 0 2.2 2.2l6.5-6.5a3.5 3.5 0 0 0 5.4-4l-2.4 2.4-2.1-.6-.6-2.1 2.4-2.4Z"/>',
    bubble: '<path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
    compass: '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5 13 13l-4.5 2.5L11 11l4.5-2.5Z"/>',
    brain: '<path d="M9 6.5A2.5 2.5 0 0 0 6.5 9 2.5 2.5 0 0 0 5 11.3 2.5 2.5 0 0 0 6 16v.5A2.5 2.5 0 0 0 9 19a2 2 0 0 0 3-.8 2 2 0 0 0 3 .8 2.5 2.5 0 0 0 3-2.5V16a2.5 2.5 0 0 0 1-4.7A2.5 2.5 0 0 0 17.5 9 2.5 2.5 0 0 0 15 6.5a2 2 0 0 0-3 .8 2 2 0 0 0-3-.8Z"/><path d="M12 7.3v11"/>',
    hand: '<path d="M8 12.5V6a1.3 1.3 0 0 1 2.6 0v4.5"/><path d="M10.6 10.5V4.8a1.3 1.3 0 0 1 2.6 0v5.7"/><path d="M13.2 6.5a1.3 1.3 0 0 1 2.6 0V13c0 3.3-2.1 5.5-5 5.5-1.6 0-2.8-.6-3.9-1.9l-2-2.6a1.3 1.3 0 0 1 2-1.6l1.6 1.6"/>',
    knot: '<path d="M9.5 14.5 7 17a3 3 0 0 1-4.2-4.2l3-3a3 3 0 0 1 4.2 0"/><path d="M14.5 9.5 17 7a3 3 0 0 1 4.2 4.2l-3 3a3 3 0 0 1-4.2 0"/><path d="M9.5 14.5l5-5"/>',
    chart: '<path d="M4 20V4"/><path d="M4 20h16"/><rect x="7" y="12" width="3" height="5" rx=".5"/><rect x="12" y="8" width="3" height="9" rx=".5"/><rect x="17" y="14" width="3" height="3" rx=".5"/>',
  }

  const BODIES = {
    coding: { t: 'Coding body', d: 'bash · filesystem · git · sandbox', ico: svg(ICO.wrench, 26) },
    assistant: { t: 'Assistant body', d: 'Slack · WhatsApp · Memory.md', ico: svg(ICO.bubble, 26) },
  }
  const HARNESSES = {
    coding: { t: 'Coding harness', d: '先 plan 再 implement · verification loop', ico: svg(ICO.target, 26) },
    assistant: { t: 'Assistant harness', d: '記得 user 是誰 · 人格穩定 · 跨 channel', ico: svg(ICO.compass, 26) },
  }

  const root = document.createElement('div')
  root.className = `${P}-root`
  root.innerHTML = `
    <div class="${P}-guide">同一顆大腦 <b>Opus 4.6</b>，裝進不同的 <b>Body（手腳）</b> 與 <b>Harness（約束）</b>。組裝後派同一個任務「修一個 bug」，看輸出分布怎麼變。</div>
    <div class="${P}-grid">
      <div class="${P}-panel">
        <h3>組裝你的 Agent</h3>
        <div class="${P}-creature">
          <div class="${P}-node set" title="Model">${svg(ICO.brain, 26)}</div><span>+</span>
          <div class="${P}-node" data-node="body" title="Body">?</div><span>+</span>
          <div class="${P}-node" data-node="harness" title="Harness">?</div>
        </div>
        <div class="${P}-slot">
          <div class="lab">${svg(ICO.brain, 16)} MODEL（固定不變）</div>
          <div class="${P}-opts"><div class="${P}-chip on fixed"><div class="t">Opus 4.6</div><div class="d">intelligence 本身 — 兩邊都一樣</div></div></div>
        </div>
        <div class="${P}-slot">
          <div class="lab">${svg(ICO.hand, 16)} BODY — 決定「能不能做事」</div>
          <div class="${P}-opts" data-opts="body">
            <div class="${P}-chip" data-v="coding"><div class="t">${svg(ICO.wrench, 18)} Coding body</div><div class="d">bash · filesystem · git · sandbox</div></div>
            <div class="${P}-chip" data-v="assistant"><div class="t">${svg(ICO.bubble, 18)} Assistant body</div><div class="d">Slack · WhatsApp · Memory.md</div></div>
          </div>
        </div>
        <div class="${P}-slot">
          <div class="lab">${svg(ICO.knot, 16)} HARNESS — 決定「會不會做歪」</div>
          <div class="${P}-opts" data-opts="harness">
            <div class="${P}-chip" data-v="coding"><div class="t">${svg(ICO.target, 18)} Coding harness</div><div class="d">先 plan 再 implement · verification loop</div></div>
            <div class="${P}-chip" data-v="assistant"><div class="t">${svg(ICO.compass, 18)} Assistant harness</div><div class="d">記得 user · 人格穩定 · 跨 channel</div></div>
          </div>
        </div>
        <div class="${P}-run"><button class="demo-btn primary" data-act="run" disabled>▶ 派任務：修一個 bug</button></div>
      </div>
      <div class="${P}-panel ${P}-result">
        <h3>${svg(ICO.chart, 18)} 執行結果 · 輸出分布</h3>
        <div class="${P}-verdict" data-verdict>先在左邊選好 Body 與 Harness，再派任務。</div>
        <canvas class="${P}-canvas"></canvas>
        <div class="${P}-legend">橫軸＝可能的輸出　·　愈窄＝愈收斂可控，愈寬＝愈發散難預測</div>
        <div class="${P}-egg">
          <button class="demo-btn" data-act="egg">Harness 敏感度：加一條「回覆 ≤100 字」</button>
          <div class="${P}-eggnote" data-eggnote>Anthropic postmortem：只在 system prompt 加一條字數限制，就 caused an outsized effect on intelligence。</div>
        </div>
      </div>
    </div>`
  el.appendChild(root)

  const canvas = root.querySelector(`.${P}-canvas`)
  const cx = canvas.getContext('2d')
  const runBtn = root.querySelector('[data-act="run"]')
  const eggBtn = root.querySelector('[data-act="egg"]')
  const verdict = root.querySelector('[data-verdict]')

  let sel = { body: null, harness: null }
  let eggOn = false
  let target = null   // 目標分布參數
  let cur = null      // 當前動畫分布
  let W = 0, H = 0, dpr = 1

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = canvas.clientWidth; H = canvas.clientHeight
    canvas.width = W * dpr; canvas.height = H * dpr
    cx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function pick(kind, v) {
    sel[kind] = v
    root.querySelectorAll(`[data-opts="${kind}"] .${P}-chip`).forEach(c => c.classList.toggle('on', c.dataset.v === v))
    root.querySelector(`[data-node="${kind}"]`).innerHTML = (kind === 'body' ? BODIES : HARNESSES)[v].ico
    root.querySelector(`[data-node="${kind}"]`).classList.add('set')
    runBtn.disabled = !(sel.body && sel.harness)
  }

  function run() {
    const aligned = sel.body === 'coding' && sel.harness === 'coding'
    const mixed = sel.body === sel.harness
    // sigma 小=窄鐘形（收斂）；center 偏移=繞路
    let sigma, center, skew, txt
    if (aligned) {
      sigma = 0.09; center = 0.5; skew = 0
      txt = `<span class="ok">Coding body + Coding harness</span>：手腳對、約束對 — 路徑收斂、測試綠燈 ✓。輸出分布是一條窄窄的鐘形曲線。`
    } else if (sel.body === 'coding' && sel.harness === 'assistant') {
      sigma = 0.2; center = 0.42; skew = 0.15
      txt = `Coding body 有 bash、git，但 <span class="bad">Assistant harness</span> 校準的是「當個好助理」— 會做事卻常繞路，分布變寬。`
    } else if (sel.body === 'assistant' && sel.harness === 'coding') {
      sigma = 0.22; center = 0.58; skew = -0.1
      txt = `Coding harness 想紀律地修 bug，但 <span class="bad">Assistant body</span> 沒有 bash/sandbox 這些器官 — 使不上力，分布攤開。`
    } else {
      sigma = 0.3; center = 0.5; skew = 0
      txt = `<span class="bad">Assistant body + Assistant harness</span>：同一顆大腦，卻被裝成 personal assistant — 修 bug 這種任務嚴重繞路，分布攤成一片寬扁。`
    }
    if (eggOn) { sigma *= 1.9; center += 0.12; skew += 0.25; txt += ` <span class="bad">（＋≤100字限制：分布立刻歪掉、變寬）</span>` }
    verdict.innerHTML = txt
    target = { sigma: Math.min(sigma, 0.5), center, skew, peak: aligned && !eggOn ? GREEN : (mixed && !aligned ? RED : '#facc15') }
    if (!cur) cur = { sigma: 0.4, center: 0.5, skew: 0, peak: target.peak }
  }

  let raf = 0
  function frame() {
    cx.clearRect(0, 0, W, H)
    // 網格底線
    cx.strokeStyle = 'rgba(255,255,255,.06)'; cx.lineWidth = 1
    cx.beginPath(); cx.moveTo(0, H - 24); cx.lineTo(W, H - 24); cx.stroke()
    if (cur && target) {
      // 緩動趨近目標
      cur.sigma += (target.sigma - cur.sigma) * 0.08
      cur.center += (target.center - cur.center) * 0.08
      cur.skew += (target.skew - cur.skew) * 0.08
      cur.peak = target.peak
      drawBell(cur)
    }
    raf = requestAnimationFrame(frame)
  }

  function drawBell(p) {
    const base = H - 24, pad = 20
    const usable = W - pad * 2
    cx.beginPath()
    let maxY = 0
    const pts = []
    for (let i = 0; i <= 120; i++) {
      const t = i / 120
      const x = pad + t * usable
      // 加一點 skew 的高斯
      const dx = (t - p.center) + p.skew * Math.pow(t - p.center, 2) * 3
      const y = Math.exp(-(dx * dx) / (2 * p.sigma * p.sigma))
      pts.push([x, y]); if (y > maxY) maxY = y
    }
    const amp = (H - 50) * 0.92
    // 面積
    const grad = cx.createLinearGradient(0, 0, 0, base)
    grad.addColorStop(0, hexA(p.peak, .5)); grad.addColorStop(1, hexA(p.peak, .02))
    cx.beginPath(); cx.moveTo(pad, base)
    pts.forEach(([x, y]) => cx.lineTo(x, base - (y / maxY) * amp))
    cx.lineTo(W - pad, base); cx.closePath()
    cx.fillStyle = grad; cx.fill()
    // 曲線
    cx.beginPath()
    pts.forEach(([x, y], i) => { const yy = base - (y / maxY) * amp; i ? cx.lineTo(x, yy) : cx.moveTo(x, yy) })
    cx.strokeStyle = p.peak; cx.lineWidth = 2.5; cx.stroke()
  }

  function hexA(hex, a) {
    const h = hex.replace('#', '')
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16)
    return `rgba(${r},${g},${b},${a})`
  }

  root.addEventListener('click', (e) => {
    const chip = e.target.closest(`[data-opts] .${P}-chip`)
    if (chip) { pick(chip.closest('[data-opts]').dataset.opts, chip.dataset.v); return }
    const act = e.target.closest('[data-act]')?.dataset.act
    if (act === 'run') run()
    if (act === 'egg') {
      eggOn = !eggOn
      eggBtn.classList.toggle('on', eggOn)
      if (sel.body && sel.harness) run()
      else verdict.innerHTML = eggOn ? '已插入「≤100字」限制 — 選好 body/harness 派任務就會看到分布歪掉。' : verdict.innerHTML
    }
  })

  const onResize = () => resize()
  window.addEventListener('resize', onResize)
  resize(); cur = { sigma: 0.4, center: 0.5, skew: 0, peak: '#8b93a7' }; target = { ...cur }; raf = requestAnimationFrame(frame)

  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', onResize)
    style.remove()
    el.innerHTML = ''
  }
}
