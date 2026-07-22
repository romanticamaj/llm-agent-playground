// agent-anatomy — 組裝一隻 Agent：大腦 LLM / 身體 Tools / 骨架 Harness 三零件。
// 裝骨架時 .md 卡片飛進 context 條；全裝好眼睛亮起跑任務；抽掉零件看退化行為。

export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#5b8cff'
  const P = 'aa'
  const timers = []
  const setT = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id }

  const style = document.createElement('style')
  style.textContent = `
  .${P}-root{position:absolute;inset:0;display:flex;flex-direction:column;gap:14px;padding:22px 26px;box-sizing:border-box;color:#e7e9f0;font-family:var(--font-tc,'Noto Sans TC',sans-serif)}
  .${P}-guide{font-size:17px;line-height:1.6;color:#c7cbd8}
  .${P}-guide b{color:${accent}}
  .${P}-main{flex:1;display:flex;gap:22px;min-height:0}
  .${P}-parts{width:210px;display:flex;flex-direction:column;gap:12px}
  .${P}-part{border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:12px 14px;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.02)}
  .${P}-part:hover{border-color:${accent};transform:translateX(3px)}
  .${P}-part.on{border-color:#4ade80;background:rgba(74,222,128,.08)}
  .${P}-part .tt{display:flex;align-items:center;gap:9px;font-size:16px;font-weight:600}
  .${P}-part .tt .ic{display:inline-flex;align-items:center}
  .${P}-part .ss{font-size:14px;color:#8b91a4;margin-top:4px;padding-left:33px}
  .${P}-part .st{font-size:13px;margin-top:6px;padding-left:33px;color:#8b91a4}
  .${P}-part.on .st{color:#4ade80}
  .${P}-stage{flex:1;display:flex;flex-direction:column;gap:14px;min-width:0}
  .${P}-figbox{flex:1;display:flex;gap:18px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(255,255,255,.015);padding:16px;min-height:0}
  .${P}-figwrap{width:200px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .${P}-fig{width:180px;height:100%;max-height:320px}
  .${P}-part-svg{transition:all .5s;opacity:.12}
  .${P}-part-svg.on{opacity:1}
  .${P}-brain.on{filter:drop-shadow(0 0 8px ${accent})}
  .${P}-tools.on{filter:drop-shadow(0 0 7px #38e1c6)}
  .${P}-harness.on{filter:drop-shadow(0 0 7px #ffc24b)}
  .${P}-eye{fill:#2a2f3d;transition:all .4s}
  .${P}-fig.alive .${P}-eye{fill:#4ade80;filter:drop-shadow(0 0 6px #4ade80)}
  .${P}-run{flex:1;display:flex;flex-direction:column;min-width:0}
  .${P}-run h4{margin:0 0 8px;font-size:14px;letter-spacing:.14em;color:#8b91a4;font-weight:600}
  .${P}-log{flex:1;overflow:auto;font-size:15px;line-height:1.7;font-family:var(--font-en,'Space Grotesk',sans-serif)}
  .${P}-line{padding:4px 0;opacity:0;transform:translateY(6px);transition:all .3s;color:#c7cbd8}
  .${P}-line.show{opacity:1;transform:none}
  .${P}-line.bad{color:#f87171}
  .${P}-line.good{color:#4ade80}
  .${P}-line .who{color:#8b91a4;margin-right:7px}
  .${P}-ctx{border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:12px 14px}
  .${P}-ctx .lab{font-size:14px;letter-spacing:.1em;color:#8b91a4;margin-bottom:9px;display:flex;justify-content:space-between}
  .${P}-slots{display:flex;gap:10px;flex-wrap:wrap;min-height:34px;position:relative}
  .${P}-card{font-size:13px;font-family:var(--font-en,'Space Grotesk',sans-serif);padding:6px 12px;border-radius:8px;background:rgba(255,194,75,.12);border:1px solid rgba(255,194,75,.5);color:#ffc24b;opacity:0;transform:translateX(-40px) scale(.8);transition:all .5s cubic-bezier(.3,1.3,.5,1)}
  .${P}-card.in{opacity:1;transform:none}
  .${P}-controls{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
  .${P}-controls .demo-btn{font-size:16px}
  .${P}-note{font-size:15px;line-height:1.6;color:#9aa0b0}
  `
  el.appendChild(style)

  const root = document.createElement('div')
  root.className = `${P}-root`
  root.innerHTML = `
    <div class="${P}-guide">點三個零件把它裝到人形上：<b>大腦 LLM</b>（會說話、做不了事）、<b>身體 Tools</b>（能動手）、<b>骨架 Harness</b>（把 .md 組裝成 context）。全裝好眼睛亮起、能跑任務。<b>再點一次可抽掉</b>零件，看它退化成什麼樣。</div>
    <div class="${P}-main">
      <div class="${P}-parts" id="${P}-parts"></div>
      <div class="${P}-stage">
        <div class="${P}-figbox">
          <div class="${P}-figwrap">${figSVG()}</div>
          <div class="${P}-run">
            <h4>執行輸出</h4>
            <div class="${P}-log" id="${P}-log"></div>
          </div>
        </div>
        <div class="${P}-ctx">
          <div class="lab"><span>Context Window（Harness 組裝的全部世界）</span><span id="${P}-ctxstate">未組裝</span></div>
          <div class="${P}-slots" id="${P}-slots"></div>
        </div>
      </div>
    </div>
    <div class="${P}-controls">
      <button class="demo-btn primary" id="${P}-run" disabled><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M7 5 L19 12 L7 19 Z"/></svg> 跑一個小任務</button>
      <button class="demo-btn" id="${P}-reset">重來</button>
      <span class="${P}-note" id="${P}-note">先把大腦裝上 — 沒有大腦連話都不會說。</span>
    </div>`
  el.appendChild(root)

  const $ = id => root.querySelector(`#${P}-${id}`)
  const partsEl = $('parts'), logEl = $('log'), slotsEl = $('slots')
  const fig = root.querySelector(`.${P}-fig`)
  const ctxState = $('ctxstate'), btnRun = $('run'), btnReset = $('reset'), noteEl = $('note')

  const icBrain = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5 C9 4 6 6 7 9 C5 10 5 13 7 14 C7 17 10 18 12 16"/><path d="M12 5 C15 4 18 6 17 9 C19 10 19 13 17 14 C17 17 14 18 12 16"/><path d="M12 5 V16"/></svg>`
  const icTools = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#38e1c6" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`
  const icHarness = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ffc24b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 V20"/><path d="M8 7 H16"/><path d="M8 11 H16"/><path d="M8 15 H16"/></svg>`
  const PARTS = [
    { key: 'brain', ic: icBrain, name: '大腦 LLM', sub: '推理 · 理解 · 生成' },
    { key: 'tools', ic: icTools, name: '身體 Tools', sub: 'file · bash · browser' },
    { key: 'harness', ic: icHarness, name: '骨架 Harness', sub: '每回組裝 context' },
  ]
  const CARDS = ['SOUL.md', 'TOOLS.md', 'MEMORY.md']
  const on = { brain: false, tools: false, harness: false }

  PARTS.forEach(p => {
    const d = document.createElement('div')
    d.className = `${P}-part`
    d.dataset.key = p.key
    d.innerHTML = `<div class="tt"><span class="ic">${p.ic}</span>${p.name}</div><div class="ss">${p.sub}</div><div class="st">未安裝 · 點擊安裝</div>`
    d.addEventListener('click', () => toggle(p.key))
    partsEl.appendChild(d)
  })

  function toggle(key) {
    on[key] = !on[key]
    const chip = partsEl.querySelector(`[data-key="${key}"]`)
    chip.classList.toggle('on', on[key])
    chip.querySelector('.st').textContent = on[key] ? '已安裝 ✓' : '未安裝 · 點擊安裝'
    const svgPart = root.querySelector(`.${P}-${key}`)
    if (svgPart) svgPart.classList.toggle('on', on[key])
    if (key === 'harness') { on.harness ? installHarness() : clearHarness() }
    refresh()
  }

  function installHarness() {
    ctxState.textContent = '組裝中…'
    slotsEl.innerHTML = ''
    CARDS.forEach((name, i) => {
      const c = document.createElement('div')
      c.className = `${P}-card`
      c.textContent = name
      slotsEl.appendChild(c)
      setT(() => c.classList.add('in'), 120 + i * 220)
    })
    setT(() => { ctxState.textContent = '已組裝 3 個檔案'; ctxState.style.color = '#ffc24b' }, 120 + CARDS.length * 220)
  }
  function clearHarness() {
    ctxState.textContent = '未組裝'; ctxState.style.color = ''
    slotsEl.querySelectorAll(`.${P}-card`).forEach((c, i) => {
      setT(() => { c.classList.remove('in') }, i * 60)
    })
    setT(() => { slotsEl.innerHTML = '' }, 400)
  }

  function refresh() {
    const all = on.brain && on.tools && on.harness
    fig.classList.toggle('alive', all)
    btnRun.disabled = !on.brain
    if (!on.brain) noteEl.textContent = '沒有大腦 — 它連話都不會說。先裝大腦。'
    else if (all) noteEl.textContent = '三層到齊：大腦想、工具做、骨架記得。按「跑一個小任務」看它正常工作。'
    else if (on.brain && !on.tools) noteEl.textContent = '只有大腦：會推理、會說，但沒有手腳 — 只能嘴砲。試著跑任務看看。'
    else if (on.brain && on.tools && !on.harness) noteEl.textContent = '有腦有手、但沒骨架：沒人幫它組裝 context → 每步失憶、重複亂做。跑跑看。'
    else noteEl.textContent = '繼續裝零件…'
  }

  // 退化行為腳本
  function script() {
    if (!on.brain) return [['系統', '（沒有大腦，什麼都不會發生）', 'bad']]
    const all = on.brain && on.tools && on.harness
    if (all) return [
      ['使用者', '幫我把 report.csv 的總和寫進 summary.txt'],
      ['大腦', '好，我需要先讀檔 → 用 file 工具。'],
      ['工具', 'read("report.csv") → 1,240 列', 'good'],
      ['大腦', '計算總和 = 88,420，接著寫檔。'],
      ['工具', 'write("summary.txt", "總和 88,420") ✓', 'good'],
      ['大腦', '完成！summary.txt 已更新。', 'good'],
    ]
    if (on.brain && !on.tools) return [
      ['使用者', '幫我把 report.csv 的總和寫進 summary.txt'],
      ['大腦', '你可以打開 report.csv，把每列加起來…', 'bad'],
      ['大腦', '（我沒有工具 — 我做不到，只能「建議」你自己做）', 'bad'],
    ]
    // 有腦有手、沒骨架 → 失憶亂做
    return [
      ['使用者', '幫我把 report.csv 的總和寫進 summary.txt'],
      ['工具', 'read("report.csv") ✓', 'good'],
      ['大腦', '咦，我剛剛在做什麼來著？沒有 context…', 'bad'],
      ['工具', 'read("report.csv") ✓（又讀一次）', 'bad'],
      ['工具', 'write("report.csv", "??") ✗ 寫錯檔了', 'bad'],
      ['大腦', '（每一步都失憶，重複又搞錯 — 沒有 harness 的 agent 只是 toy）', 'bad'],
    ]
  }

  let running = false
  function run() {
    if (running || !on.brain) return
    running = true; btnRun.disabled = true
    logEl.innerHTML = ''
    const lines = script()
    lines.forEach(([who, txt, cls], i) => {
      const ln = document.createElement('div')
      ln.className = `${P}-line${cls ? ' ' + cls : ''}`
      ln.innerHTML = `<span class="who">${who}</span>${txt}`
      logEl.appendChild(ln)
      setT(() => { ln.classList.add('show'); logEl.scrollTop = logEl.scrollHeight }, 250 + i * 620)
    })
    setT(() => { running = false; btnRun.disabled = !on.brain }, 250 + lines.length * 620)
  }

  function reset() {
    timers.forEach(clearTimeout); timers.length = 0
    on.brain = on.tools = on.harness = false
    running = false
    partsEl.querySelectorAll(`.${P}-part`).forEach(c => { c.classList.remove('on'); c.querySelector('.st').textContent = '未安裝 · 點擊安裝' })
    root.querySelectorAll(`.${P}-part-svg`).forEach(s => s.classList.remove('on'))
    fig.classList.remove('alive')
    logEl.innerHTML = ''; slotsEl.innerHTML = ''
    ctxState.textContent = '未組裝'; ctxState.style.color = ''
    refresh()
  }

  btnRun.addEventListener('click', run)
  btnReset.addEventListener('click', reset)
  refresh()

  return () => {
    timers.forEach(clearTimeout)
    style.remove(); root.remove()
  }

  function figSVG() {
    return `<svg class="${P}-fig" viewBox="0 0 180 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- 身體 Tools：軀幹 + 手臂 -->
      <g class="${P}-part-svg ${P}-tools" stroke="#38e1c6" stroke-width="3">
        <rect x="58" y="120" width="64" height="90" rx="16" fill="rgba(56,225,198,.08)"/>
        <path d="M58 140 L28 175 L34 210" stroke-linecap="round"/>
        <path d="M122 140 L152 175 L146 210" stroke-linecap="round"/>
        <path d="M74 210 L70 285" stroke-linecap="round"/>
        <path d="M106 210 L110 285" stroke-linecap="round"/>
      </g>
      <!-- 骨架 Harness：脊椎 -->
      <g class="${P}-part-svg ${P}-harness" stroke="#ffc24b" stroke-width="3">
        <line x1="90" y1="120" x2="90" y2="205" stroke-linecap="round"/>
        <line x1="78" y1="140" x2="102" y2="140" stroke-linecap="round"/>
        <line x1="78" y1="160" x2="102" y2="160" stroke-linecap="round"/>
        <line x1="78" y1="180" x2="102" y2="180" stroke-linecap="round"/>
      </g>
      <!-- 大腦 LLM：頭 -->
      <g class="${P}-part-svg ${P}-brain" stroke="${accent}" stroke-width="3">
        <circle cx="90" cy="78" r="42" fill="rgba(91,140,255,.08)"/>
        <circle class="${P}-eye" cx="76" cy="74" r="6" stroke="none"/>
        <circle class="${P}-eye" cx="104" cy="74" r="6" stroke="none"/>
        <path d="M74 96 Q90 104 106 96" stroke-linecap="round"/>
      </g>
    </svg>`
  }
}
