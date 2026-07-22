// agent-anatomy — DemoStage 導演版
// 6 拍：三層結構｜只裝大腦（嘴砲）｜加身體 Tools（沒骨架失憶）｜加骨架 Harness（.md 飛進 context、眼睛亮、任務成功）｜抽掉零件看退化｜sandbox 自由裝拆。
import { createStage, pop, shake } from './_stage.js'

export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#5b8cff'
  const P = 'aa'
  const timers = new Set()
  const setT = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  const style = document.createElement('style')
  style.textContent = `
  .${P}-main{display:flex;gap:22px;min-height:0;flex-wrap:wrap}
  .${P}-parts{width:210px;display:flex;flex-direction:column;gap:12px;flex:none}
  .${P}-part{border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:12px 14px;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.02)}
  .${P}-part:hover{border-color:${accent};transform:translateX(3px)}
  .${P}-part.on{border-color:#4ade80;background:rgba(74,222,128,.08)}
  .${P}-part.locked{cursor:default}.${P}-part.locked:hover{border-color:rgba(255,255,255,.14);transform:none}
  .${P}-part .tt{display:flex;align-items:center;gap:9px;font-size:16px;font-weight:600}
  .${P}-part .ss{font-size:15.5px;color:#8b91a4;margin-top:4px;padding-left:33px}
  .${P}-part .st{font-size:15px;margin-top:6px;padding-left:33px;color:#8b91a4}
  .${P}-part.on .st{color:#4ade80}
  .${P}-stage{flex:1;min-width:300px;display:flex;flex-direction:column;gap:14px}
  .${P}-figbox{display:flex;gap:18px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.015);padding:16px;min-height:280px}
  .${P}-figwrap{width:200px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .${P}-fig{width:180px;height:280px}
  .${P}-part-svg{transition:all .5s;opacity:.12}
  .${P}-part-svg.on{opacity:1}
  .${P}-brain.on{filter:drop-shadow(0 0 8px ${accent})}
  .${P}-tools.on{filter:drop-shadow(0 0 7px #38e1c6)}
  .${P}-harness.on{filter:drop-shadow(0 0 7px #ffc24b)}
  .${P}-eye{fill:#2a2f3d;transition:all .4s}
  .${P}-fig.alive .${P}-eye{fill:#4ade80;filter:drop-shadow(0 0 6px #4ade80)}
  .${P}-run{flex:1;display:flex;flex-direction:column;min-width:0}
  .${P}-run h4{margin:0 0 8px;font-size:15px;letter-spacing:.14em;color:#8b91a4;font-weight:600}
  .${P}-log{flex:1;overflow:auto;font-size:15px;line-height:1.7;font-family:var(--font-mono,monospace)}
  .${P}-line{padding:4px 0;opacity:0;transform:translateY(6px);transition:all .3s;color:#c7cbd8}
  .${P}-line.show{opacity:1;transform:none}
  .${P}-line.bad{color:#f87171}.${P}-line.good{color:#4ade80}
  .${P}-line .who{color:#8b91a4;margin-right:7px}
  .${P}-ctx{border:1px solid var(--line);border-radius:12px;padding:12px 14px}
  .${P}-ctx .lab{font-size:15.5px;letter-spacing:.06em;color:#8b91a4;margin-bottom:9px;display:flex;justify-content:space-between}
  .${P}-slots{display:flex;gap:10px;flex-wrap:wrap;min-height:34px}
  .${P}-card{font-size:15px;font-family:var(--font-mono,monospace);padding:6px 12px;border-radius:8px;background:rgba(255,194,75,.12);border:1px solid rgba(255,194,75,.5);color:#ffc24b;opacity:0;transform:translateX(-40px) scale(.8);transition:all .5s cubic-bezier(.3,1.3,.5,1)}
  .${P}-card.in{opacity:1;transform:none}
  .${P}-ctrls{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:16px}
  .${P}-ctrls.hide{display:none}
  .${P}-btn{font-family:var(--font-tc);font-size:15px;color:var(--text);background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:999px;padding:9px 18px;cursor:pointer;transition:all .25s}
  .${P}-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .${P}-btn.primary{background:var(--accent);color:#08090a;border-color:var(--accent);font-weight:600}
  .${P}-btn:disabled{opacity:.4;cursor:default}
  .${P}-note{font-size:15.5px;color:#8b91a4}
  `
  el.appendChild(style)

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
  let locked = true

  const main = document.createElement('div'); main.className = `${P}-main`
  const partsEl = document.createElement('div'); partsEl.className = `${P}-parts ds-unit`
  const stageCol = document.createElement('div'); stageCol.className = `${P}-stage`
  const figbox = document.createElement('div'); figbox.className = `${P}-figbox ds-unit`
  figbox.innerHTML = `<div class="${P}-figwrap">${figSVG()}</div>
    <div class="${P}-run"><h4>執行輸出</h4><div class="${P}-log" id="${P}-log"></div></div>`
  const ctxBox = document.createElement('div'); ctxBox.className = `${P}-ctx ds-unit`
  ctxBox.innerHTML = `<div class="lab"><span>Context Window（Harness 組裝的全部世界）</span><span id="${P}-ctxstate">未組裝</span></div>
    <div class="${P}-slots" id="${P}-slots"></div>`
  stageCol.append(figbox, ctxBox)
  main.append(partsEl, stageCol)
  const ctrls = document.createElement('div'); ctrls.className = `${P}-ctrls ds-unit hide`
  ctrls.innerHTML = `<button class="${P}-btn primary" id="${P}-run">跑一個小任務</button>
    <button class="${P}-btn" id="${P}-reset">重來</button>
    <span class="${P}-note" id="${P}-note"></span>`

  const $ = id => (figbox.querySelector(`#${P}-${id}`) || ctxBox.querySelector(`#${P}-${id}`) || ctrls.querySelector(`#${P}-${id}`))
  const logEl = $('log'), slotsEl = $('slots'), ctxState = $('ctxstate')
  const btnRun = $('run'), noteEl = $('note')
  const fig = figbox.querySelector(`.${P}-fig`)

  PARTS.forEach(p => {
    const d = document.createElement('div'); d.className = `${P}-part locked`; d.dataset.key = p.key
    d.innerHTML = `<div class="tt"><span class="ic">${p.ic}</span>${p.name}</div><div class="ss">${p.sub}</div><div class="st">未安裝</div>`
    d.addEventListener('click', () => { if (!locked) { setPart(p.key, !on[p.key]); pop(d) } })
    partsEl.appendChild(d)
  })

  function setPart(key, val) {
    on[key] = val
    const chip = partsEl.querySelector(`[data-key="${key}"]`)
    chip.classList.toggle('on', val)
    chip.querySelector('.st').textContent = val ? '已安裝 ✓' : '未安裝'
    root_svg(key)?.classList.toggle('on', val)
    if (key === 'harness') { val ? installHarness() : clearHarness() }
    refresh()
  }
  const root_svg = key => figbox.querySelector(`.${P}-${key}`)

  function installHarness() {
    ctxState.textContent = '組裝中…'; slotsEl.innerHTML = ''
    CARDS.forEach((name, i) => {
      const c = document.createElement('div'); c.className = `${P}-card`; c.textContent = name
      slotsEl.appendChild(c); setT(() => c.classList.add('in'), 120 + i * 220)
    })
    setT(() => { ctxState.textContent = '已組裝 3 個檔案'; ctxState.style.color = '#ffc24b' }, 120 + CARDS.length * 220)
  }
  function clearHarness() {
    ctxState.textContent = '未組裝'; ctxState.style.color = ''
    slotsEl.querySelectorAll(`.${P}-card`).forEach((c, i) => setT(() => c.classList.remove('in'), i * 60))
    setT(() => { slotsEl.innerHTML = '' }, 400)
  }
  function refresh() {
    const all = on.brain && on.tools && on.harness
    fig.classList.toggle('alive', all)
    btnRun.disabled = !on.brain
    if (!on.brain) noteEl.textContent = '沒有大腦 — 它連話都不會說。先裝大腦。'
    else if (all) noteEl.textContent = '三層到齊：大腦想、工具做、骨架記得。'
    else if (!on.tools) noteEl.textContent = '只有大腦：會推理會說，但沒手腳 — 只能嘴砲。'
    else noteEl.textContent = '有腦有手、沒骨架：每步失憶、重複亂做。'
  }

  function script() {
    if (!on.brain) return [['系統', '（沒有大腦，什麼都不會發生）', 'bad']]
    if (on.brain && on.tools && on.harness) return [
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
      ['大腦', '（我沒有工具 — 做不到，只能「建議」你自己做）', 'bad'],
    ]
    return [
      ['使用者', '幫我把 report.csv 的總和寫進 summary.txt'],
      ['工具', 'read("report.csv") ✓', 'good'],
      ['大腦', '咦，我剛剛在做什麼？沒有 context…', 'bad'],
      ['工具', 'read("report.csv") ✓（又讀一次）', 'bad'],
      ['工具', 'write("report.csv", "??") ✗ 寫錯檔了', 'bad'],
      ['大腦', '（每步失憶、重複又搞錯 — 沒 harness 的 agent 只是 toy）', 'bad'],
    ]
  }
  let running = false
  function run(onDone) {
    if (running || !on.brain) { onDone && onDone(); return }
    running = true; btnRun.disabled = true; logEl.innerHTML = ''
    const lines = script()
    lines.forEach(([who, txt, cls], i) => {
      const ln = document.createElement('div'); ln.className = `${P}-line${cls ? ' ' + cls : ''}`
      ln.innerHTML = `<span class="who">${who}</span>${txt}`; logEl.appendChild(ln)
      setT(() => { ln.classList.add('show'); logEl.scrollTop = logEl.scrollHeight }, 200 + i * 520)
    })
    setT(() => { running = false; btnRun.disabled = !on.brain; onDone && onDone() }, 200 + lines.length * 520)
  }

  function resetScene() {
    clearT(); running = false
    on.brain = on.tools = on.harness = false
    partsEl.querySelectorAll(`.${P}-part`).forEach(c => { c.classList.remove('on'); c.querySelector('.st').textContent = '未安裝' })
    figbox.querySelectorAll(`.${P}-part-svg`).forEach(s => s.classList.remove('on'))
    fig.classList.remove('alive')
    logEl.innerHTML = ''; slotsEl.innerHTML = ''
    ctxState.textContent = '未組裝'; ctxState.style.color = ''
    refresh()
  }

  btnRun.addEventListener('click', () => { pop(btnRun); run() })
  $('reset').addEventListener('click', () => { resetScene() })

  const stage = createStage(el, ctx, {
    beats: [
      { narration: 'Agent = <b>三層結構</b>：大腦 LLM 想、身體 Tools 做、骨架 Harness 每回把 .md 組裝成 context。我們一層一層裝。', focus: [`.${P}-figbox`, `.${P}-parts`], nextLabel: '先裝大腦 →',
        enter() { locked = true; resetScene(); partsEl.querySelectorAll(`.${P}-part`).forEach(p => p.classList.add('locked')) } },

      { narration: '只裝<b>大腦 LLM</b>：它會推理、會說話，但沒有手腳 — 跑任務只能<b style="color:#f87171">嘴砲</b>，做不了事。', focus: [`.${P}-figbox`], nextLabel: '加上身體 →',
        enter() { resetScene(); setT(() => setPart('brain', true), 300); setT(() => run(), 900) } },

      { narration: '加上<b>身體 Tools</b>（file / bash / browser）能動手了 — 但還沒骨架：每步失憶、<b style="color:#f87171">重複又搞錯</b>。', focus: [`.${P}-figbox`], nextLabel: '加上骨架 →',
        enter() { resetScene(); setPart('brain', true); setT(() => setPart('tools', true), 300); setT(() => run(), 900) } },

      { narration: '裝上<b>骨架 Harness</b>：SOUL / TOOLS / MEMORY 一張張<b style="color:#ffc24b">飛進 context</b> — 眼睛亮起，任務一次做對。', focus: [`.${P}-figbox`, `.${P}-ctx`], nextLabel: '抽掉一個零件 →',
        enter() { resetScene(); setPart('brain', true); setPart('tools', true); setT(() => setPart('harness', true), 300); setT(() => run(), 1200) } },

      { narration: '抽掉<b>身體 Tools</b> 看退化：有腦有骨架，但沒手 — 又退回<b style="color:#f87171">只能建議、不會發生</b>。', focus: [`.${P}-figbox`], nextLabel: '換我裝 →',
        enter() { resetScene(); setPart('brain', true); setPart('harness', true); setT(() => run(), 1200) } },

      { narration: '換你玩 — 點左邊三個零件自由<b>裝上／抽掉</b>，按「跑一個小任務」看它是正常工作還是退化。', sandbox: true,
        enter() { resetScene(); locked = false; partsEl.querySelectorAll(`.${P}-part`).forEach(p => p.classList.remove('locked')); ctrls.classList.remove('hide') } },
    ],
  })
  stage.body.append(main, ctrls)

  return () => { clearT(); stage.destroy(); style.remove() }

  function figSVG() {
    return `<svg class="${P}-fig" viewBox="0 0 180 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="${P}-part-svg ${P}-tools" stroke="#38e1c6" stroke-width="3">
        <rect x="58" y="120" width="64" height="90" rx="16" fill="rgba(56,225,198,.08)"/>
        <path d="M58 140 L28 175 L34 210" stroke-linecap="round"/>
        <path d="M122 140 L152 175 L146 210" stroke-linecap="round"/>
        <path d="M74 210 L70 285" stroke-linecap="round"/>
        <path d="M106 210 L110 285" stroke-linecap="round"/></g>
      <g class="${P}-part-svg ${P}-harness" stroke="#ffc24b" stroke-width="3">
        <line x1="90" y1="120" x2="90" y2="205" stroke-linecap="round"/>
        <line x1="78" y1="140" x2="102" y2="140" stroke-linecap="round"/>
        <line x1="78" y1="160" x2="102" y2="160" stroke-linecap="round"/>
        <line x1="78" y1="180" x2="102" y2="180" stroke-linecap="round"/></g>
      <g class="${P}-part-svg ${P}-brain" stroke="${accent}" stroke-width="3">
        <circle cx="90" cy="78" r="42" fill="rgba(91,140,255,.08)"/>
        <circle class="${P}-eye" cx="76" cy="74" r="6" stroke="none"/>
        <circle class="${P}-eye" cx="104" cy="74" r="6" stroke="none"/>
        <path d="M74 96 Q90 104 106 96" stroke-linecap="round"/></g>
    </svg>`
  }
}
