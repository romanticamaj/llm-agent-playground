// Harness — 從「會動」到「可控」（DemoStage 導演版）
// 6 拍：① 大腦固定 Opus 4.6 ② 裝上 Body（手腳，決定能不能做事）③ 裝上 Harness（約束，決定會不會做歪）
// ④ 派同一任務「修 bug」：對的組合收斂成窄鐘形 ⑤ Harness 敏感度彩蛋：加一條「≤100字」分布立刻歪掉
// ⑥ sandbox 自由組裝 body/harness、彩蛋、重來。
import { createStage, pop, shake, confettiBurst } from './_stage.js'

const GREEN = '#4ade80', RED = '#f87171', GOLD = '#facc15'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#38e1c6'
  const svg = (p, s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block">${p}</svg>`
  const ICO = {
    wrench: '<path d="M15.5 5.5a3.5 3.5 0 0 0-4 5.4L5 17.4a1.6 1.6 0 0 0 2.2 2.2l6.5-6.5a3.5 3.5 0 0 0 5.4-4l-2.4 2.4-2.1-.6-.6-2.1 2.4-2.4Z"/>',
    bubble: '<path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
    compass: '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5 13 13l-4.5 2.5L11 11l4.5-2.5Z"/>',
    brain: '<path d="M9 6.5A2.5 2.5 0 0 0 6.5 9 2.5 2.5 0 0 0 5 11.3 2.5 2.5 0 0 0 6 16v.5A2.5 2.5 0 0 0 9 19a2 2 0 0 0 3-.8 2 2 0 0 0 3 .8 2.5 2.5 0 0 0 3-2.5V16a2.5 2.5 0 0 0 1-4.7A2.5 2.5 0 0 0 17.5 9 2.5 2.5 0 0 0 15 6.5a2 2 0 0 0-3 .8 2 2 0 0 0-3-.8Z"/><path d="M12 7.3v11"/>',
    hand: '<path d="M8 12.5V6a1.3 1.3 0 0 1 2.6 0v4.5"/><path d="M10.6 10.5V4.8a1.3 1.3 0 0 1 2.6 0v5.7"/><path d="M13.2 6.5a1.3 1.3 0 0 1 2.6 0V13c0 3.3-2.1 5.5-5 5.5-1.6 0-2.8-.6-3.9-1.9l-2-2.6a1.3 1.3 0 0 1 2-1.6l1.6 1.6"/>',
    knot: '<path d="M9.5 14.5 7 17a3 3 0 0 1-4.2-4.2l3-3a3 3 0 0 1 4.2 0"/><path d="M14.5 9.5 17 7a3 3 0 0 1 4.2 4.2l-3 3a3 3 0 0 1-4.2 0"/><path d="M9.5 14.5l5-5"/>',
    chart: '<path d="M4 20V4M4 20h16"/><rect x="7" y="12" width="3" height="5" rx=".5"/><rect x="12" y="8" width="3" height="9" rx=".5"/><rect x="17" y="14" width="3" height="3" rx=".5"/>',
  }
  const BODIES = { coding: svg(ICO.wrench, 26), assistant: svg(ICO.bubble, 26) }
  const HARN = { coding: svg(ICO.target, 26), assistant: svg(ICO.compass, 26) }

  const style = document.createElement('style')
  style.id = 'hns-css'
  style.textContent = `
  .hns-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}
  .hns-panel{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#0c0f16;padding:16px}
  .hns-panel h3{margin:0 0 12px;font-size:17px;letter-spacing:.04em}
  .hns-creature{display:flex;align-items:center;justify-content:center;gap:6px;margin:6px 0 16px;font-size:15.5px;color:#9aa0b0}
  .hns-node{width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#9aa0b0;
    background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);transition:.3s}
  .hns-node.set{border-color:${accent};color:${accent};box-shadow:0 0 12px rgba(56,225,198,.4)}
  .hns-slot{margin-bottom:14px}
  .hns-slot .lab{font-size:15.5px;color:#8b93a7;margin-bottom:6px;letter-spacing:.05em;display:flex;align-items:center;gap:6px}
  .hns-opts{display:flex;gap:8px;flex-wrap:wrap}
  .hns-chip{flex:1;min-width:120px;border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:10px 12px;cursor:pointer;transition:.18s;background:rgba(255,255,255,.02);font-size:15px}
  .hns-chip:hover{border-color:${accent}}
  .hns-chip.on{border-color:${accent};background:rgba(56,225,198,.1);box-shadow:0 0 0 1px ${accent} inset}
  .hns-chip.fixed{cursor:default;border-style:dashed;opacity:.9}
  .hns-chip .t{font-weight:700;margin-bottom:2px;display:flex;align-items:center;gap:6px}
  .hns-chip .d{font-size:15px;color:#8b93a7}
  .hns-run{margin-top:4px}
  .hns-run .demo-btn{display:none}
  .hns-run.show .demo-btn{display:inline-flex}
  .hns-verdict{font-size:15px;line-height:1.6;min-height:70px;color:#cfd4e0}
  .hns-verdict .ok{color:${GREEN};font-weight:600} .hns-verdict .bad{color:${RED};font-weight:600}
  .hns-canvas{display:block;width:100%;height:180px;margin-top:8px}
  .hns-legend{font-size:15px;color:#8b93a7;text-align:center;margin-top:6px}
  .hns-egg{margin-top:14px;border-top:1px solid rgba(255,255,255,.1);padding-top:14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
  .hns-egg .demo-btn.on{background:${RED};color:#120708;border-color:${RED}}
  .hns-eggnote{font-size:15.5px;color:#aeb4c4;flex:1;min-width:200px;line-height:1.5}
  @media(max-width:820px){.hns-grid{grid-template-columns:1fr}}
  `

  const stage = createStage(el, ctx, { beats: buildBeats() })
  document.head.appendChild(style)

  stage.body.innerHTML = `
    <div class="hns-grid">
      <div class="hns-panel ds-unit" data-panel="build">
        <h3>組裝你的 Agent</h3>
        <div class="hns-creature">
          <div class="hns-node set" title="Model">${svg(ICO.brain, 26)}</div><span>+</span>
          <div class="hns-node" data-node="body" title="Body">?</div><span>+</span>
          <div class="hns-node" data-node="harness" title="Harness">?</div>
        </div>
        <div class="hns-slot" data-slot="model">
          <div class="lab">${svg(ICO.brain, 16)} MODEL（固定不變）</div>
          <div class="hns-opts"><div class="hns-chip on fixed"><div class="t">Opus 4.6</div><div class="d">intelligence 本身 — 兩邊都一樣</div></div></div>
        </div>
        <div class="hns-slot" data-slot="body">
          <div class="lab">${svg(ICO.hand, 16)} BODY — 決定「能不能做事」</div>
          <div class="hns-opts" data-opts="body">
            <div class="hns-chip" data-v="coding"><div class="t">${svg(ICO.wrench, 18)} Coding body</div><div class="d">bash · filesystem · git · sandbox</div></div>
            <div class="hns-chip" data-v="assistant"><div class="t">${svg(ICO.bubble, 18)} Assistant body</div><div class="d">Slack · WhatsApp · Memory.md</div></div>
          </div>
        </div>
        <div class="hns-slot" data-slot="harness">
          <div class="lab">${svg(ICO.knot, 16)} HARNESS — 決定「會不會做歪」</div>
          <div class="hns-opts" data-opts="harness">
            <div class="hns-chip" data-v="coding"><div class="t">${svg(ICO.target, 18)} Coding harness</div><div class="d">先 plan 再 implement · verification loop</div></div>
            <div class="hns-chip" data-v="assistant"><div class="t">${svg(ICO.compass, 18)} Assistant harness</div><div class="d">記得 user · 人格穩定 · 跨 channel</div></div>
          </div>
        </div>
        <div class="hns-run"><button class="demo-btn primary" data-act="run">派任務：修一個 bug</button></div>
      </div>
      <div class="hns-panel ds-unit" data-panel="result">
        <h3>${svg(ICO.chart, 18)} 執行結果 · 輸出分布</h3>
        <div class="hns-verdict" data-verdict>裝好 Body 與 Harness，派任務就看得到分布。</div>
        <canvas class="hns-canvas"></canvas>
        <div class="hns-legend">橫軸＝可能的輸出　·　愈窄＝愈收斂可控，愈寬＝愈發散難預測</div>
        <div class="hns-egg" data-egg style="display:none">
          <button class="demo-btn" data-act="egg">Harness 敏感度：加一條「回覆 ≤100 字」</button>
          <div class="hns-eggnote">Anthropic postmortem：只在 system prompt 加一條字數限制，就 caused an outsized effect on intelligence。</div>
        </div>
      </div>
    </div>`

  const $ = s => stage.body.querySelector(s)
  const canvas = $('.hns-canvas'), cx = canvas.getContext('2d')
  const verdict = $('[data-verdict]'), runWrap = $('.hns-run')
  const eggWrap = $('[data-egg]'), eggBtn = $('[data-act="egg"]')

  const timers = new Set()
  const T = (ms, fn) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  let sel = { body: null, harness: null }
  let eggOn = false, target = null, cur = null
  let W = 0, H = 0, dpr = 1, raf = 0, guided = false

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = canvas.clientWidth; H = canvas.clientHeight
    canvas.width = W * dpr; canvas.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  function hexA(hex, a) {
    const h = hex.replace('#', '')
    return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`
  }
  function drawBell(p) {
    const base = H - 24, pad = 20, usable = W - pad * 2, pts = []; let maxY = 0
    for (let i = 0; i <= 120; i++) {
      const t = i / 120, x = pad + t * usable
      const dx = (t - p.center) + p.skew * Math.pow(t - p.center, 2) * 3
      const y = Math.exp(-(dx * dx) / (2 * p.sigma * p.sigma)); pts.push([x, y]); if (y > maxY) maxY = y
    }
    const amp = (H - 50) * 0.92
    const grad = cx.createLinearGradient(0, 0, 0, base)
    grad.addColorStop(0, hexA(p.peak, .5)); grad.addColorStop(1, hexA(p.peak, .02))
    cx.beginPath(); cx.moveTo(pad, base)
    pts.forEach(([x, y]) => cx.lineTo(x, base - (y / maxY) * amp))
    cx.lineTo(W - pad, base); cx.closePath(); cx.fillStyle = grad; cx.fill()
    cx.beginPath(); pts.forEach(([x, y], i) => { const yy = base - (y / maxY) * amp; i ? cx.lineTo(x, yy) : cx.moveTo(x, yy) })
    cx.strokeStyle = p.peak; cx.lineWidth = 2.5; cx.stroke()
  }
  function frame() {
    cx.clearRect(0, 0, W, H)
    cx.strokeStyle = 'rgba(255,255,255,.06)'; cx.lineWidth = 1
    cx.beginPath(); cx.moveTo(0, H - 24); cx.lineTo(W, H - 24); cx.stroke()
    if (cur && target) {
      cur.sigma += (target.sigma - cur.sigma) * 0.08
      cur.center += (target.center - cur.center) * 0.08
      cur.skew += (target.skew - cur.skew) * 0.08
      cur.peak = target.peak; drawBell(cur)
    }
    raf = requestAnimationFrame(frame)
  }

  function pick(kind, v) {
    sel[kind] = v
    stage.body.querySelectorAll(`[data-opts="${kind}"] .hns-chip`).forEach(c => c.classList.toggle('on', c.dataset.v === v))
    const node = $(`[data-node="${kind}"]`)
    node.innerHTML = (kind === 'body' ? BODIES : HARN)[v]; node.classList.add('set'); pop(node)
    if (sel.body && sel.harness) runWrap.classList.add('show')
  }

  function run() {
    if (!(sel.body && sel.harness)) return
    const aligned = sel.body === 'coding' && sel.harness === 'coding'
    const mixed = sel.body === sel.harness
    let sigma, center, skew, txt
    if (aligned) {
      sigma = 0.09; center = 0.5; skew = 0
      txt = `<span class="ok">Coding body + Coding harness</span>：手腳對、約束對 — 路徑收斂、測試綠燈。輸出分布是一條窄窄的鐘形曲線。`
    } else if (sel.body === 'coding') {
      sigma = 0.2; center = 0.42; skew = 0.15
      txt = `Coding body 有 bash、git，但 <span class="bad">Assistant harness</span> 校準的是「當個好助理」— 會做事卻常繞路，分布變寬。`
    } else if (sel.harness === 'coding') {
      sigma = 0.22; center = 0.58; skew = -0.1
      txt = `Coding harness 想紀律地修 bug，但 <span class="bad">Assistant body</span> 沒有 bash/sandbox 這些器官 — 使不上力，分布攤開。`
    } else {
      sigma = 0.3; center = 0.5; skew = 0
      txt = `<span class="bad">Assistant body + Assistant harness</span>：同一顆大腦，卻被裝成 personal assistant — 修 bug 嚴重繞路，分布攤成一片寬扁。`
    }
    if (eggOn) { sigma *= 1.9; center += 0.12; skew += 0.25; txt += ` <span class="bad">（＋≤100字限制：分布立刻歪掉、變寬）</span>` }
    verdict.innerHTML = txt
    const peak = aligned && !eggOn ? GREEN : (mixed && !aligned ? RED : GOLD)
    target = { sigma: Math.min(sigma, 0.5), center, skew, peak }
    if (!cur) cur = { sigma: 0.4, center: 0.5, skew: 0, peak }
    if (aligned && !eggOn) T(360, () => { const r = canvas.getBoundingClientRect(), br = stage.body.getBoundingClientRect(); confettiBurst(stage.body, r.left - br.left + W / 2, r.top - br.top + 40, GREEN, 18) })
    else if (eggOn) shake(canvas)
  }

  function toggleEgg() {
    eggOn = !eggOn; eggBtn.classList.toggle('on', eggOn); pop(eggBtn)
    if (sel.body && sel.harness) run()
  }

  function resetScene() {
    clearT(); sel = { body: null, harness: null }; eggOn = false
    stage.body.querySelectorAll('.hns-chip:not(.fixed)').forEach(c => c.classList.remove('on'))
    ;['body', 'harness'].forEach(k => { const n = $(`[data-node="${k}"]`); n.innerHTML = '?'; n.classList.remove('set') })
    eggBtn.classList.remove('on'); eggWrap.style.display = 'none'
    runWrap.classList.remove('show')
    verdict.innerHTML = '裝好 Body 與 Harness，派任務就看得到分布。'
    target = { sigma: 0.4, center: 0.5, skew: 0, peak: '#8b93a7' }
    cur = { sigma: 0.4, center: 0.5, skew: 0, peak: '#8b93a7' }
  }

  stage.body.addEventListener('click', e => {
    const chip = e.target.closest('[data-opts] .hns-chip:not(.fixed)')
    if (chip) { pick(chip.closest('[data-opts]').dataset.opts, chip.dataset.v); if (guided) run(); return }
    const act = e.target.closest('[data-act]')?.dataset.act
    if (act === 'run') { pop(e.target.closest('[data-act]')); run() }
    if (act === 'egg') toggleEgg()
  })

  const onResize = () => resize()
  window.addEventListener('resize', onResize)
  resize()

  function buildBeats() {
    return [
      { narration: '同一顆大腦 <b>Opus 4.6</b> — intelligence 本身，全程固定不變。', focus: ['[data-slot="model"]', '.hns-creature'], nextLabel: '裝上 Body →',
        enter() { guided = false; resetScene() } },

      { narration: '先裝 <b>Body（手腳）</b> — 決定「能不能做事」：bash、git、sandbox 才修得動 code。', focus: ['[data-slot="body"]'], nextLabel: '再裝 Harness →',
        enter() { guided = false; resetScene(); T(300, () => pick('body', 'coding')) } },

      { narration: '再裝 <b>Harness（約束）</b> — 決定「會不會做歪」：先 plan 再 implement、verification loop。', focus: ['[data-slot="harness"]'], nextLabel: '派任務看分布 →',
        enter() { guided = false; resetScene(); T(200, () => pick('body', 'coding')); T(600, () => pick('harness', 'coding')) } },

      { narration: '派同一個任務「修 bug」— 手腳對、約束對，輸出<b>收斂成一條窄鐘形</b>。', focus: ['[data-panel="result"]'], nextLabel: 'Harness 有多敏感？ →',
        enter() { guided = false; resetScene(); T(150, () => { pick('body', 'coding'); pick('harness', 'coding') }); T(700, run) } },

      { narration: '<b>Harness 是校準層</b>：只加一條「回覆 ≤100 字」，同樣的組合分布立刻歪掉、變寬。', focus: ['[data-panel="result"]', '[data-egg]'], nextLabel: '換我組裝 →',
        enter() { guided = false; resetScene(); eggWrap.style.display = 'flex'; T(150, () => { pick('body', 'coding'); pick('harness', 'coding') }); T(700, run); T(1500, toggleEgg) } },

      { narration: '換你組裝 — 換 <b>Body/Harness</b> 看分布怎麼變，開關 <b>≤100字</b> 彩蛋，或按 <b>派任務</b> 重跑。', sandbox: true,
        enter() { resetScene(); guided = true; eggWrap.style.display = 'flex'; runWrap.classList.add('show') } },
    ]
  }

  raf = requestAnimationFrame(frame)

  return () => { clearT(); cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); style.remove(); stage.destroy() }
}
