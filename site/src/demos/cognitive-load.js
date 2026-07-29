// Demo：你只有 100 分 — 認知負荷三分法 — DemoStage 導演版
// 6 拍：100 顆能量點｜Intrinsic 選模型｜Extraneous 雜訊吸點｜Germane 建判斷力｜對比拍｜sandbox 花/跳過決策。
import { createStage, pop, shake, enterFly, countUp, confettiBurst } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const GOLD = '#fbbf24', RED = '#f87171', GREEN = '#4ade80', GRAY = '#4a5163'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'

  const IC = {
    head: '<path d="M12 3a6 6 0 0 0-6 6c0 2 1 3 1 5v3h10v-3c0-2 1-3 1-5a6 6 0 0 0-6-6z"/><path d="M9 20h6"/>',
    doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h4"/>',
    chart: '<path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8"/>',
    noise: '<path d="M12 4a7 6 0 0 1 7 6c0 3-3 5-7 5a9 9 0 0 1-2-.2L5 17l1-3a5.5 5.5 0 0 1-1-4a7 6 0 0 1 7-6z"/><path d="M12 8v3M12 13v.5"/>',
    check: '<path d="M4 12a8 8 0 1 1 16 0a8 8 0 0 1-16 0z"/><path d="M8 12l3 3l5-6"/>',
  }
  const svg = (p, c = 'currentColor') => `<svg class="cl-ic" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`

  const style = document.createElement('style')
  style.textContent = `
  .cl-wrap{display:flex;flex-direction:column;gap:16px}
  .cl-ic{width:1.5em;height:1.5em;vertical-align:-.3em}
  .cl-poolbox{position:relative;border:1px solid var(--line);border-radius:16px;padding:16px 18px;
    background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(0,0,0,.18))}
  .cl-poolhead{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:12px}
  .cl-poollab{font-size:15px;color:var(--text-dim);letter-spacing:.02em;display:flex;align-items:center;gap:8px}
  .cl-poollab svg{color:${accent}}
  .cl-budget{font-family:var(--font-mono);font-weight:600}
  .cl-budget b{font-size:30px;color:var(--text)}.cl-budget small{font-size:15px;color:var(--text-dim)}
  .cl-budget.warn b{color:${RED}}
  .cl-pool{display:grid;grid-template-columns:repeat(25,1fr);gap:5px}
  .cl-dot{aspect-ratio:1;border-radius:3px;background:${accent};opacity:.9;
    transition:background .4s ${EASE},opacity .4s,transform .5s ${EASE}}
  .cl-dot.off{background:${GRAY};opacity:.28}
  .cl-dot.intr{background:${accent};opacity:.5}
  .cl-dot.extr{background:${RED};opacity:.9}
  .cl-dot.germ{background:${GOLD};opacity:.95;box-shadow:0 0 6px ${GOLD}66}
  .cl-dot.leak{transform:translateY(-16px) scale(.4);opacity:0;background:${RED}}
  .cl-stagearea{position:relative;min-height:290px;display:flex;align-items:center;justify-content:center}
  .cl-cards{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;width:100%}
  .cl-card{flex:1;min-width:210px;max-width:300px;border:1px solid var(--line);border-radius:14px;padding:16px;
    background:rgba(255,255,255,.03);display:flex;flex-direction:column;gap:9px}
  .cl-card .t{font-size:16px;font-weight:600;color:var(--text);display:flex;align-items:center;gap:8px}
  .cl-card .t svg{color:${accent};flex:none}
  .cl-card .d{font-size:14px;color:var(--text-dim);line-height:1.5}
  .cl-tier{align-self:flex-start;font-family:var(--font-mono);font-size:13px;padding:5px 12px;border-radius:999px;
    border:1px solid ${accent};color:${accent};opacity:0;transition:opacity .5s}
  .cl-tier.show{opacity:1}
  .cl-cost{font-family:var(--font-mono);font-size:14px;color:var(--text-dim)}
  .cl-cost b{color:${accent}}
  .cl-bubbles{position:absolute;inset:0;pointer-events:none}
  .cl-bub{position:absolute;font-size:14px;color:var(--text);background:${RED}22;border:1px solid ${RED};
    border-radius:14px;padding:8px 13px;white-space:nowrap;font-family:var(--font-mono)}
  .cl-growthbox{width:min(560px,100%);display:flex;flex-direction:column;gap:10px}
  .cl-growthbox .gl{font-size:15px;color:var(--text-dim);display:flex;justify-content:space-between}
  .cl-growthbox .gl b{color:${GOLD};font-family:var(--font-mono)}
  .cl-gbar{height:18px;border-radius:9px;background:rgba(255,255,255,.05);border:1px solid var(--line);overflow:hidden}
  .cl-gfill{height:100%;width:0;border-radius:9px;background:linear-gradient(90deg,${GOLD},#fde68a);transition:width .8s ${EASE}}
  .cl-cmp{display:flex;gap:22px;width:100%;justify-content:center}
  .cl-person{flex:1;max-width:320px;border:1px solid var(--line);border-radius:16px;padding:16px;text-align:center;
    background:rgba(255,255,255,.03)}
  .cl-person .nm{font-size:16px;font-weight:600;margin-bottom:4px}
  .cl-person .fed{font-size:14px;color:var(--text-dim);margin-bottom:12px}
  .cl-person .out{font-family:var(--font-mono);font-weight:700}
  .cl-person .out b{font-size:40px;color:var(--text)}.cl-person .out small{font-size:15px;color:var(--text-dim)}
  .cl-person.win{border-color:${GOLD}}.cl-person.win .out b{color:${GOLD}}
  .cl-person.lose .out b{color:${GRAY}}
  .cl-person svg{width:34px;height:34px;color:${accent};margin-bottom:6px}
  .cl-flow{display:flex;flex-direction:column;gap:14px;width:min(620px,100%)}
  .cl-slot{border:1px solid var(--line);border-radius:14px;padding:14px 16px;background:rgba(255,255,255,.03);
    display:flex;align-items:center;gap:14px;min-height:66px}
  .cl-slot .lab{flex:1}
  .cl-slot .lab .q{font-size:16px;font-weight:600;color:var(--text)}
  .cl-slot .lab .k{font-size:12.5px;color:var(--text-dim);font-family:var(--font-mono);margin-top:3px}
  .cl-slot.done .lab{opacity:.5}
  .cl-slot .verdict{font-family:var(--font-mono);font-size:13px;padding:5px 11px;border-radius:999px;display:none}
  .cl-slot.ok .verdict{display:inline-block;color:${GREEN};border:1px solid ${GREEN}}
  .cl-slot.bad .verdict{display:inline-block;color:${RED};border:1px solid ${RED}}
  .cl-acts{display:flex;gap:8px;flex:none}
  .cl-result{text-align:center}
  .cl-result .big{font-family:var(--font-mono);font-weight:700}
  .cl-result .big b{font-size:52px;color:${GOLD}}.cl-result .big small{font-size:17px;color:var(--text-dim)}
  .cl-result .sub{font-size:15px;color:var(--text-dim);margin-top:8px}
  .cl-ctrls{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
  .cl-btn{font-family:var(--font-tc);font-size:15px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:9px 18px;cursor:pointer;transition:all .25s ${EASE}}
  .cl-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .cl-btn.primary{background:${accent};color:#08090a;border-color:${accent};font-weight:600}
  .cl-btn.skip{border-color:${RED}88;color:#fca5a5}
  .cl-btn.hide{display:none}
  `
  el.appendChild(style)

  const wrap = document.createElement('div')
  wrap.className = 'cl-wrap'
  wrap.innerHTML = `
    <div class="cl-poolbox ds-unit">
      <div class="cl-poolhead">
        <span class="cl-poollab">${svg(IC.head)} 一天的腦力預算</span>
        <span class="cl-budget"><b class="cl-bnum">100</b><small> / 100 分</small></span>
      </div>
      <div class="cl-pool"></div>
    </div>
    <div class="cl-stagearea ds-unit"></div>`

  const ctrls = document.createElement('div')
  ctrls.className = 'cl-ctrls ds-unit'

  let stage
  const pool = wrap.querySelector('.cl-pool')
  const bnum = wrap.querySelector('.cl-bnum')
  const budgetEl = wrap.querySelector('.cl-budget')
  const area = wrap.querySelector('.cl-stagearea')

  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  const dots = []
  for (let i = 0; i < 100; i++) { const d = document.createElement('div'); d.className = 'cl-dot'; pool.appendChild(d); dots.push(d) }

  let budget = 100
  function setBudget(v, { warn = false } = {}) {
    const from = budget; budget = Math.max(0, Math.min(100, Math.round(v)))
    countUp(bnum, budget, { from, dur: 550, fmt: n => Math.round(n) })
    budgetEl.classList.toggle('warn', warn)
  }
  // 從尾端取 n 顆「還可用」的點，套上 kind class
  function markDots(kind, n, { stagger = 22 } = {}) {
    let done = 0
    for (let i = 0; i < dots.length && done < n; i++) {
      const d = dots[i]
      if (d.dataset.used) continue
      d.dataset.used = kind
      T(() => { d.className = 'cl-dot ' + kind; pop(d, 1.3) }, done * stagger)
      done++
    }
  }
  function leakDots(n, { stagger = 45 } = {}) {
    let done = 0
    for (let i = dots.length - 1; i >= 0 && done < n; i--) {
      const d = dots[i]
      if (d.dataset.used) continue
      d.dataset.used = 'extr'
      T(() => { d.className = 'cl-dot leak' }, done * stagger)
      done++
    }
  }
  function resetPool() {
    dots.forEach(d => { d.className = 'cl-dot'; delete d.dataset.used })
    budget = 100; bnum.textContent = '100'; budgetEl.classList.remove('warn')
  }

  const btn = (label, cls = '') => { const b = document.createElement('button'); b.className = 'cl-btn ' + cls; b.textContent = label; return b }

  // ---------- 各拍場景 ----------
  function sceneEmpty() { clearT(); area.innerHTML = ''; ctrls.innerHTML = '' }

  function sceneIntrinsic() {
    sceneEmpty()
    area.innerHTML = `<div class="cl-cards">
      <div class="cl-card" data-c="0"><div class="t">${svg(IC.doc)}找 30 份資料的重點</div>
        <div class="d">任務本身很直白，不需要深度推理。</div>
        <span class="cl-tier" data-tier="0">建議：小模型檔位 Haiku</span>
        <span class="cl-cost">intrinsic 成本 <b>8 分</b></span></div>
      <div class="cl-card" data-c="1"><div class="t">${svg(IC.chart)}擬一份商業策略</div>
        <div class="d">要權衡、要推理、要跨領域判斷。</div>
        <span class="cl-tier" data-tier="1">建議：大模型檔位 Opus</span>
        <span class="cl-cost">intrinsic 成本 <b>22 分</b></span></div></div>`
    area.querySelectorAll('.cl-card').forEach((c, i) => enterFly(c, { y: 24, delay: i * 140, dur: 560 }))
    T(() => { area.querySelector('[data-tier="0"]').classList.add('show'); markDots('intr', 8) }, 900)
    T(() => { area.querySelector('[data-tier="1"]').classList.add('show'); markDots('intr', 22) }, 1500)
  }

  function sceneExtraneous(interactive) {
    sceneEmpty()
    const bubs = document.createElement('div'); bubs.className = 'cl-bubbles'
    area.appendChild(bubs)
    const texts = ['git 是什麼？', '按哪個鍵？', '這報錯什麼意思？', 'terminal 怎麼開？', 'PR 要怎麼發？', '為什麼卡住？']
    const pos = [[14, 18], [58, 12], [30, 46], [70, 52], [10, 72], [50, 78]]
    texts.forEach((t, i) => {
      const b = document.createElement('div'); b.className = 'cl-bub'
      b.style.left = pos[i][0] + '%'; b.style.top = pos[i][1] + '%'; b.textContent = t
      bubs.appendChild(b)
      T(() => { enterFly(b, { y: 20, dur: 400 }); leakDots(9); setBudget(budget - 12, { warn: true }); shake(budgetEl) }, 200 + i * 340)
    })
    const kill = () => {
      clearT()
      bubs.querySelectorAll('.cl-bub').forEach((b, i) => T(() => { b.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.4)' }], { duration: 300, easing: EASE, fill: 'forwards' }); T(() => b.remove(), 300) }, i * 60))
      budgetEl.classList.remove('warn')
      const skipB = ctrls.querySelector('.skip'); if (skipB) skipB.classList.add('hide')
    }
    if (interactive) {
      const s = btn('跳過 — 止血', 'skip'); s.onclick = () => { pop(s); kill() }; ctrls.appendChild(s)
    } else {
      T(() => kill(), 2600)
    }
  }

  function sceneGermane() {
    sceneEmpty()
    area.innerHTML = `<div class="cl-growthbox">
      <div class="cl-cards" style="margin-bottom:6px">
        <div class="cl-card" data-c="0"><div class="t">${svg(IC.check)}這個 skill 寫對了嗎？</div>
          <div class="d">讀懂它的邏輯、抓出邊界情況。</div><span class="cl-cost">germane 投資 <b>12 分</b></span></div>
        <div class="cl-card" data-c="1"><div class="t">${svg(IC.check)}這份輸出能發佈嗎？</div>
          <div class="d">建立「什麼叫夠好」的判準。</div><span class="cl-cost">germane 投資 <b>12 分</b></span></div>
      </div>
      <div class="gl"><span>判斷力</span><span><b class="cl-gnum">0</b> / 100</span></div>
      <div class="cl-gbar"><div class="cl-gfill"></div></div></div>`
    const gfill = area.querySelector('.cl-gfill'), gnum = area.querySelector('.cl-gnum')
    area.querySelectorAll('.cl-card').forEach((c, i) => enterFly(c, { y: 22, delay: i * 130, dur: 520 }))
    T(() => { markDots('germ', 12); gfill.style.width = '38%'; countUp(gnum, 38, { dur: 800 }) }, 800)
    T(() => { markDots('germ', 12); gfill.style.width = '74%'; countUp(gnum, 74, { from: 38, dur: 800 }) }, 1600)
  }

  function sceneCompare() {
    sceneEmpty()
    area.innerHTML = `<div class="cl-cmp">
      <div class="cl-person lose"><div>${svg(IC.head)}</div><div class="nm">阿凱</div>
        <div class="fed">50 分 <span style="color:${RED}">餵雜訊</span>（做任務時學工具）</div>
        <div class="out"><b class="o0">0</b><small> 件產出 / 天</small></div></div>
      <div class="cl-person win"><div>${svg(IC.head)}</div><div class="nm">小美</div>
        <div class="fed">50 分 <span style="color:${GOLD}">餵 germane</span>（練判斷力）</div>
        <div class="out"><b class="o1">0</b><small> 件產出 / 天</small></div></div></div>`
    area.querySelectorAll('.cl-person').forEach((p, i) => enterFly(p, { y: 24, delay: i * 160, dur: 560 }))
    T(() => { countUp(area.querySelector('.o0'), 3, { dur: 1100 }); countUp(area.querySelector('.o1'), 11, { dur: 1400 }) }, 900)
    T(() => { const p = area.querySelector('.win'); const r = p.getBoundingClientRect(), br = stage.body.getBoundingClientRect(); confettiBurst(stage.body, r.left - br.left + r.width / 2, r.top - br.top + 40, GOLD, 26) }, 2400)
  }

  // ---------- sandbox ----------
  const FLOW = [
    { q: '把 30 份 PDF 摘要', kind: 'intr', cost: 8, val: 2, tag: 'intrinsic · 選小模型' },
    { q: 'git rebase 是什麼？', kind: 'extr', cost: 14, val: 0, tag: 'extraneous · 雜訊' },
    { q: '這份自費醫令驗證對嗎？', kind: 'germ', cost: 12, val: 4, tag: 'germane · 練判斷' },
    { q: '快捷鍵按哪個？', kind: 'extr', cost: 12, val: 0, tag: 'extraneous · 雜訊' },
    { q: '規劃 Q3 產品策略', kind: 'intr', cost: 22, val: 3, tag: 'intrinsic · 選大模型' },
    { q: '這份報告能發給客戶嗎？', kind: 'germ', cost: 12, val: 4, tag: 'germane · 練判斷' },
  ]
  let sbIdx = 0, output = 0

  function renderSandbox() {
    resetPool(); sbIdx = 0; output = 0
    sceneEmpty()
    const flow = document.createElement('div'); flow.className = 'cl-flow'
    flow.innerHTML = FLOW.map((f, i) => `<div class="cl-slot" data-i="${i}">
      <div class="lab"><div class="q">${f.q}</div><div class="k">${f.tag}</div></div>
      <span class="verdict"></span>
      <div class="cl-acts">
        <button class="cl-btn primary" data-a="spend">花</button>
        <button class="cl-btn skip" data-a="skip">跳過</button></div></div>`).join('')
    area.appendChild(flow)
    flow.querySelectorAll('.cl-slot').forEach((s, i) => enterFly(s, { y: 16, delay: i * 70, dur: 420 }))
    flow.querySelectorAll('.cl-slot').forEach(slot => {
      slot.querySelectorAll('button').forEach(b => b.onclick = () => decide(slot, b.dataset.a))
    })
    const reset = btn('重來', ''); reset.onclick = () => { pop(reset); renderSandbox() }; ctrls.appendChild(reset)
  }

  function decide(slot, action) {
    if (slot.classList.contains('done')) return
    const f = FLOW[+slot.dataset.i]
    slot.classList.add('done'); slot.querySelector('.cl-acts').style.display = 'none'
    const v = slot.querySelector('.verdict')
    const productive = f.kind !== 'extr'
    let ok
    if (action === 'spend') {
      if (productive) { ok = true; output += f.val; markDots(f.kind, f.cost); setBudget(budget - f.cost); v.textContent = `+${f.val} 產出` }
      else { ok = false; leakDots(f.cost); setBudget(budget - f.cost, { warn: true }); shake(slot); v.textContent = `-${f.cost} 白花` }
    } else { // skip
      if (productive) { ok = false; v.textContent = `錯過 ${f.val} 產出` }
      else { ok = true; v.textContent = '省下腦力' }
    }
    slot.classList.add(ok ? 'ok' : 'bad'); pop(v)
    sbIdx++
    if (sbIdx >= FLOW.length) T(() => settle(), 500)
  }

  function settle() {
    sceneEmpty()
    const max = FLOW.filter(f => f.kind !== 'extr').reduce((a, f) => a + f.val, 0)
    area.innerHTML = `<div class="cl-result"><div class="big"><b class="rout">0</b><small> / ${max} 產出</small></div>
      <div class="sub">腦力剩 ${budget} 分。把雜訊跳過、把點數花在 intrinsic 選模型與 germane 練判斷 — 這就是滿分路線。</div></div>`
    countUp(area.querySelector('.rout'), output, { dur: 1000 })
    if (output >= max) { const br = stage.body.getBoundingClientRect(); confettiBurst(stage.body, br.width / 2, br.height / 2, GOLD, 34) }
    const reset = btn('再玩一次', 'primary'); reset.onclick = () => { pop(reset); renderSandbox() }; ctrls.appendChild(reset)
  }

  function resetScene() { clearT(); resetPool(); sceneEmpty() }

  function buildBeats() {
    return [
      { narration: '你的腦袋一天只有 <b>100 分</b>。每個動作都在花它。', focus: ['.cl-poolbox'], nextLabel: '這 100 分怎麼花？ →',
        enter() { resetScene(); dots.forEach((d, i) => T(() => enterFly(d, { y: 8, dur: 260 }), i * 6)); countUp(bnum, 100, { dur: 900 }) } },
      { narration: 'Intrinsic：任務本身的難度 — 用它<b>選模型</b>。難的餵大模型，簡單的餵小模型。', focus: ['.cl-stagearea', '.cl-poolbox'], nextLabel: '下一種 load →',
        enter() { resetScene(); sceneIntrinsic() } },
      { narration: 'Extraneous：<b>不必要的雜訊</b> — git 是什麼？按哪個鍵？遇到就跳過，別在做任務時學工具。', focus: ['.cl-stagearea', '.cl-poolbox'], nextLabel: '最值得的那種 →',
        enter() { resetScene(); sceneExtraneous(false) } },
      { narration: 'Germane：<b>建構判斷力</b> — 這 skill 對嗎？能發佈嗎？花點數，但判斷力長出來，最值得。', focus: ['.cl-stagearea', '.cl-poolbox'], nextLabel: '看兩個人的差距 →',
        enter() { resetScene(); sceneGermane() } },
      { narration: '同樣 100 分：一個拿 50 分餵雜訊，一個拿 50 分練判斷。一天下來 — 差距就這樣拉開。', focus: ['.cl-stagearea'], nextLabel: '換你當家 →',
        enter() { resetScene(); sceneCompare() } },
      { narration: '換你分配 — 六張任務進來，每張決定<b>花</b>還是<b>跳過</b>。看你的一日產出。', sandbox: true,
        enter() { resetScene(); renderSandbox() } },
    ]
  }

  stage = createStage(el, ctx, { beats: buildBeats() })
  stage.body.append(wrap, ctrls)

  return () => { clearT(); stage.destroy(); style.remove() }
}
