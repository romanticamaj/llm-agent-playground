// Hooks — 說服是修辭，約束是工程（DemoStage 導演版）
// 6 拍：① 同一條規則兩種執法 ② Prompt 派靠機率、被 rationalization 繞過、token 暴走
// ③ Hook 派在 tool boundary 被 exit 2 擋回、成本收斂 ④ 連派十次成本長條差距拉大
// ⑤ Enforcement Stack 三層（L1 說服 / L2 限制 / L3 塑造）⑥ sandbox 自由派任務、重來。
import { createStage, pop, shake, countUp, confettiBurst } from './_stage.js'

const GREEN = '#4ade80', RED = '#f87171', GOLD = '#facc15'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#38e1c6'
  const ico = (d, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block">${d}</svg>`
  const I = {
    ruler: '<rect x="3" y="8" width="18" height="8" rx="1"/><path d="M7 8v3M11 8v4M15 8v3"/>',
    gate: '<rect x="4" y="5" width="16" height="14" rx="1"/><path d="M8 5v14M12 5v14M16 5v14"/>',
    ban: '<circle cx="12" cy="12" r="8"/><path d="M6.5 6.5l11 11"/>',
    uturn: '<path d="M9 7H6a3 3 0 0 0 0 6h9"/><path d="M12 4 9 7l3 3"/>',
    bubble: '<path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>',
    brick: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 9.7h18M3 14.3h18M9 5v4.7M15 5v4.7M9 14.3V19M15 14.3V19"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/>',
  }
  const RATIONALIZATIONS = ['這個 case 太簡單，測過就好', '我已經手動測過了', '這次情況不一樣', '只是 typo 修正不需要測試', '先寫 code，等等再補測試']

  const style = document.createElement('style')
  style.id = 'hk-css'
  style.textContent = `
  .hk-top{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:12px;min-height:44px}
  .hk-rule{display:inline-flex;align-items:center;gap:8px;font-size:16px;color:#dfe3ec;background:rgba(255,255,255,.06);
    border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:8px 16px}
  .hk-rule b{color:${accent}}
  .hk-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:12px}
  .hk-col{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#0c0f16;padding:13px 16px;min-height:0;position:relative}
  .hk-col h3{margin:0 0 2px;font-size:17px}
  .hk-col .sub{font-size:15px;color:#7b8296;margin-bottom:8px}
  .hk-tag{font-size:15px;color:#8b93a7;display:inline-flex;align-items:center;gap:7px;margin-bottom:8px}
  .hk-tag.gate{color:${accent}}
  .hk-log{font-size:15px;line-height:1.5;min-height:96px;max-height:132px;overflow:auto}
  .hk-log .row{padding:3px 0;opacity:0;transform:translateX(-6px);transition:.3s;display:flex;align-items:center;gap:6px}
  .hk-log .row.show{opacity:1;transform:none}
  .hk-bubble{background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.4);color:#ffd5d5;border-radius:10px;padding:6px 10px;display:inline-flex;gap:6px;align-items:center;font-size:15.5px}
  .hk-ok{color:${GREEN}} .hk-bad{color:${RED}} .hk-dim{color:#8b93a7} .hk-gate{color:${accent};font-weight:600}
  .hk-tok{margin-top:8px;font-size:15px;color:#8b93a7}
  .hk-tok b{font-family:var(--font-mono,monospace);font-size:18px;color:#e8ebf2}
  .hk-chart{border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:9px 16px;background:rgba(255,255,255,.02);margin-bottom:10px}
  .hk-chart .lab{font-size:15px;color:#8b93a7;margin-bottom:7px;letter-spacing:.06em}
  .hk-crow{display:flex;align-items:center;gap:10px;margin:5px 0;font-size:15.5px}
  .hk-crow .name{width:78px;flex:none}
  .hk-cbar{flex:1;height:14px;border-radius:8px;background:rgba(255,255,255,.06);overflow:hidden}
  .hk-cbar>i{display:block;height:100%;border-radius:8px;width:0;transition:width .6s cubic-bezier(.16,1,.3,1)}
  .hk-crow .n{width:64px;text-align:right;font-family:var(--font-mono,monospace)}
  .hk-stack .head{display:flex;align-items:center;gap:10px;margin-bottom:8px;font-size:16px;font-weight:700}
  .hk-stack .head .dim{font-size:15px;color:#8b93a7;font-weight:400}
  .hk-layers{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
  .hk-layer{border:1px dashed rgba(255,255,255,.18);border-radius:12px;padding:10px 12px;cursor:pointer;transition:.2s;background:rgba(255,255,255,.02)}
  .hk-layer:hover{border-color:${accent}}
  .hk-layer.on{border-style:solid;border-color:${accent};background:rgba(56,225,198,.08)}
  .hk-layer .lt{font-weight:700;font-size:15px;margin-bottom:2px}
  .hk-layer .ld{font-size:15px;color:#8b93a7;margin-bottom:6px}
  .hk-meter{font-size:14px;color:#9aa0b0;display:flex;justify-content:space-between;margin:1px 0}
  .hk-mbar{height:6px;border-radius:6px;background:rgba(255,255,255,.08);overflow:hidden;margin-bottom:4px}
  .hk-mbar>i{display:block;height:100%;border-radius:6px}
  .hk-hint{font-size:15.5px;color:#aeb4c4;margin-top:8px;min-height:18px;line-height:1.45}
  .hk-ctrls{display:none;gap:10px;flex-wrap:wrap;align-items:center;margin:0}
  .hk-ctrls.show{display:flex}
  .hk-runs{font-size:15.5px;color:#8b93a7}
  @media(max-width:820px){.hk-cols{grid-template-columns:1fr}.hk-layers{grid-template-columns:1fr}}
  `

  const meter = (n, v, c) => `<div class="hk-meter"><span>${n}</span><span>${v}%</span></div><div class="hk-mbar"><i style="width:${v}%;background:${c}"></i></div>`

  const stage = createStage(el, ctx, { beats: buildBeats() })
  document.head.appendChild(style)

  stage.body.innerHTML = `
    <div class="hk-top">
      <div class="hk-rule ds-unit">${ico(I.ruler, 16)} 規則：<b>先寫測試，再寫實作</b></div>
      <div class="hk-ctrls ds-unit">
        <button class="demo-btn primary" data-act="run">派任務</button>
        <button class="demo-btn" data-act="x10">連派 10 次</button>
        <button class="demo-btn" data-act="reset">重來</button>
        <span class="hk-runs">已派任務 <b data-runs>0</b> 次</span>
      </div>
    </div>
    <div class="hk-cols">
      <div class="hk-col ds-unit" data-side="prompt">
        <h3>Prompt 派 <span class="hk-dim" style="font-size:15px">說服 · 修辭</span></h3>
        <div class="sub">CLAUDE.md 寫了紀律，但遵守與否是機率問題</div>
        <div class="hk-tag">${ico(I.dice, 15)} 每次擲骰決定聽不聽話</div>
        <div class="hk-log" data-log="prompt"></div>
        <div class="hk-tok">本輪 token：<b data-t="prompt">0</b></div>
      </div>
      <div class="hk-col ds-unit" data-side="hook">
        <h3>Hook 派 <span class="hk-dim" style="font-size:15px">約束 · 工程</span></h3>
        <div class="sub">tool boundary 有一道 exit-2 閘門，繞不過去</div>
        <div class="hk-tag gate">${ico(I.gate, 15)} tool boundary 閘門啟動</div>
        <div class="hk-log" data-log="hook"></div>
        <div class="hk-tok">本輪 token：<b data-t="hook">0</b></div>
      </div>
    </div>
    <div class="hk-chart ds-unit">
      <div class="lab">累積 TOKEN 成本（連派愈多，差距愈大）</div>
      <div class="hk-crow"><span class="name">Prompt 派</span><div class="hk-cbar"><i data-c="prompt" style="background:${RED}"></i></div><span class="n" data-cn="prompt">0</span></div>
      <div class="hk-crow"><span class="name">Hook 派</span><div class="hk-cbar"><i data-c="hook" style="background:${GREEN}"></i></div><span class="n" data-cn="hook">0</span></div>
    </div>
    <div class="hk-stack ds-unit">
      <div class="head">${ico(I.brick, 18)} Enforcement Stack<span class="dim">— 把「先寫測試」這條規則放在哪一層？點一層看看</span></div>
      <div class="hk-layers">
        <div class="hk-layer" data-layer="L1"><div class="lt">L1 · Harness</div><div class="ld">prompt 說服模型</div>${meter('強度', 33, RED)}${meter('成本', 15, GREEN)}${meter('靈活度', 95, accent)}</div>
        <div class="hk-layer" data-layer="L2"><div class="lt">L2 · Tools（Hook）</div><div class="ld">程式碼限制模型</div>${meter('強度', 92, GREEN)}${meter('成本', 45, GOLD)}${meter('靈活度', 50, accent)}</div>
        <div class="hk-layer" data-layer="L3"><div class="lt">L3 · Model</div><div class="ld">權重塑造模型</div>${meter('強度', 100, GREEN)}${meter('成本', 100, RED)}${meter('靈活度', 8, RED)}</div>
      </div>
      <div class="hk-hint" data-hint></div>
    </div>`

  const $ = s => stage.body.querySelector(s)
  const logP = $('[data-log="prompt"]'), logH = $('[data-log="hook"]')
  const runsEl = $('[data-runs]'), ctrls = $('.hk-ctrls')
  const HINTS = {
    L1: 'L1 說服模型：便宜、超靈活，但只是統計性有效 — 合規率約 33%→72%，永遠有非零機率被繞過。',
    L2: 'L2 限制模型：Hook 攔在 tool boundary，強、可靠、失敗成本 bounded；代價是要寫程式、彈性下降。',
    L3: 'L3 塑造模型：藏在權重裡最強，但成本最高、最不靈活 — 那是 Anthropic 的領地，我們碰不了。',
  }

  const timers = new Set()
  const T = (ms, fn) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }
  let runs = 0, cumP = 0, cumH = 0, busy = false

  function addRow(log, html, delay) {
    const r = document.createElement('div'); r.className = 'row'; r.innerHTML = html
    log.appendChild(r); T(delay, () => r.classList.add('show'))
  }
  function animTok(which, target, delay) {
    T(delay, () => countUp($(`[data-t="${which}"]`), target * 40, { from: 0, dur: 520, fmt: v => Math.round(v) }))
  }

  // Prompt 派：force = 'diverge' | 'obey' | null(隨機)
  function runPromptSide(force) {
    logP.innerHTML = ''
    const obeys = force ? force === 'obey' : Math.random() < 0.45
    let d = 0, tP; const step = 260
    if (obeys) {
      addRow(logP, `<span class="hk-ok">✓ 先寫測試</span> <span class="hk-dim">test_fix.py</span>`, d += step)
      addRow(logP, `<span class="hk-ok">✓ 寫實作，測試綠燈</span>`, d += step); tP = 3
    } else {
      const ex = RATIONALIZATIONS[(Math.random() * RATIONALIZATIONS.length) | 0]
      addRow(logP, `<span class="hk-bubble">${ico(I.bubble, 15)}「${ex}」</span>`, d += step)
      addRow(logP, `<span class="hk-bad">✗ 跳過測試，直接寫 code</span>`, d += step)
      addRow(logP, `<span class="hk-bad">✗ 跑出 bug → 寫 fix</span>`, d += step)
      addRow(logP, `<span class="hk-bad">✗ 又壞了 → 再 fix</span>`, d += step)
      addRow(logP, `<span class="hk-dim">…bad branch 一路暴走</span>`, d += step); tP = 12
      T(d, () => shake($('[data-side="prompt"]')))
    }
    animTok('prompt', tP, d + 200)
    cumP += tP
    return d + 400
  }
  function runHookSide() {
    logH.innerHTML = ''
    let d = 0; const step = 260
    addRow(logH, `<span class="hk-dim">agent 想直接寫 code…</span>`, d += step)
    addRow(logH, `<span class="hk-gate">${ico(I.gate, 15)} tool call 撞上 boundary</span>`, d += step)
    addRow(logH, `<span class="hk-bad">${ico(I.ban, 15)} exit 2：先寫測試再來</span>`, d += step)
    addRow(logH, `<span class="hk-ok">${ico(I.uturn, 15)} 被迫轉向 → 先寫測試</span>`, d += step)
    addRow(logH, `<span class="hk-ok">✓ 寫實作，測試綠燈</span>`, d += step)
    animTok('hook', 4, d + 200); cumH += 4
    return d + 400
  }
  function bump() { runs++; runsEl.textContent = runs }

  function accumulate(n) {
    for (let i = 0; i < n; i++) { cumP += Math.random() < 0.45 ? 3 : 12; cumH += 4; runs++ }
    runsEl.textContent = runs
  }
  function animChart() {
    const max = Math.max(cumP, cumH, 1) * 40
    $('[data-c="prompt"]').style.width = (cumP * 40 / max * 100) + '%'
    $('[data-c="hook"]').style.width = (cumH * 40 / max * 100) + '%'
    countUp($('[data-cn="prompt"]'), cumP * 40, { dur: 700, fmt: v => Math.round(v) })
    countUp($('[data-cn="hook"]'), cumH * 40, { dur: 700, fmt: v => Math.round(v) })
  }
  function selectStack(layer) {
    stage.body.querySelectorAll('.hk-layer').forEach(l => l.classList.toggle('on', l.dataset.layer === layer))
    $('[data-hint]').textContent = HINTS[layer]
  }

  function resetScene() {
    clearT(); busy = false; runs = 0; cumP = 0; cumH = 0
    logP.innerHTML = ''; logH.innerHTML = ''; runsEl.textContent = 0
    $('[data-t="prompt"]').textContent = 0; $('[data-t="hook"]').textContent = 0
    $('[data-c="prompt"]').style.width = '0'; $('[data-c="hook"]').style.width = '0'
    $('[data-cn="prompt"]').textContent = 0; $('[data-cn="hook"]').textContent = 0
    stage.body.querySelectorAll('.hk-layer').forEach(l => l.classList.remove('on'))
    $('[data-hint]').textContent = ''
    ctrls.classList.remove('show')
  }

  function runFull() {
    if (busy) return
    busy = true; bump()
    const d = Math.max(runPromptSide(), runHookSide())
    animChart(); T(d, () => { busy = false })
  }

  ctrls.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return
    pop(b)
    if (b.dataset.act === 'reset') { resetScene(); ctrls.classList.add('show'); return }
    if (busy) return
    if (b.dataset.act === 'run') runFull()
    if (b.dataset.act === 'x10') {
      busy = true; runPromptSide(); runHookSide()
      accumulate(9); animChart(); T(1600, () => { busy = false })
    }
  })
  stage.body.querySelector('.hk-stack').addEventListener('click', e => {
    const l = e.target.closest('[data-layer]'); if (l) { pop(l); selectStack(l.dataset.layer) }
  })

  function buildBeats() {
    return [
      { narration: '同一條紀律「<b>先寫測試，再寫實作</b>」，兩種執法方式 — 看誰真的擋得住。', focus: ['.hk-rule'], nextLabel: '看 Prompt 派 →',
        enter() { resetScene() } },

      { narration: 'Prompt 派靠<b>擲骰</b> — 這一次它給你一套說法（rationalization），直接跳過測試，token 一路暴走。', focus: ['[data-side="prompt"]'], nextLabel: '換 Hook 派 →',
        enter() { resetScene(); runPromptSide('diverge') } },

      { narration: 'Hook 派把它攔在 <b>tool boundary</b> — exit 2 直接彈回，被迫先寫測試，成本收斂。', focus: ['[data-side="hook"]'], nextLabel: '連派十次 →',
        enter() { resetScene(); T(200, () => { runHookSide(); const r = $('[data-side="hook"]').getBoundingClientRect(), br = stage.body.getBoundingClientRect(); T(1500, () => confettiBurst(stage.body, r.left - br.left + 120, r.top - br.top + 60, accent, 18)) }) } },

      { narration: '連派十次 — Prompt 派的失敗成本 <b>unbounded</b>，Hook 派 <b>bounded</b>，累積差距愈拉愈大。', focus: ['.hk-chart'], nextLabel: '那該放哪層？ →',
        enter() { resetScene(); accumulate(10); T(300, animChart) } },

      { narration: '所有執法是一個三層 stack：<b>L1 說服</b>、<b>L2 限制</b>、<b>L3 塑造</b> — 選哪層是工程判斷。', focus: ['.hk-stack'], nextLabel: '換我派任務 →',
        enter() { resetScene(); T(200, () => selectStack('L2')) } },

      { narration: '換你派任務 — <b>派任務</b>擲一次骰、<b>連派 10 次</b>拉開成本、點 stack 三層比較，<b>重來</b>歸零。', sandbox: true,
        enter() { resetScene(); ctrls.classList.add('show'); selectStack('L2') } },
    ]
  }

  return () => { clearT(); style.remove(); stage.destroy() }
}
