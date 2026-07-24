// Demo：Project = 接龍的固定開頭 — DemoStage 導演版
// 5 拍：三塊拼裝｜固定記憶＋輸入｜Project 起始點是可換的開頭｜換開頭風格整個變｜sandbox 自由切。
import { createStage, pop, enterFly } from './_stage.js'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const MEMORY = '（記得：品牌叫「晨露」，主打無添加、給忙碌上班族。）'
  const INPUT = '幫我寫一段產品介紹'
  const PRESETS = {
    social: {
      name: '社群寫手', prefix: '你是社群小編。用輕鬆有梗的口吻寫，短句、多換行，結尾放一句能被截圖轉發的話。',
      output: '早餐這件事，別再將就了。\n晨露，無添加，三分鐘搞定你的一餐。\n給每個趕捷運還想對自己好一點的你。\n\n忙，不代表要虧待自己。',
    },
    consultant: {
      name: '嚴謹顧問', prefix: '你是資深行銷顧問。輸出要有結構：一句定位、三個賣點（各附理由）、一個行動呼籲。語氣專業克制。',
      output: '定位：專為忙碌上班族設計的無添加即食早餐。\n\n三個賣點：\n1. 無添加——成分表乾淨，通勤也能安心吃。\n2. 三分鐘備餐——省下的時間還給睡眠。\n3. 均衡配比——蛋白質與纖維兼顧，不只是填飽。\n\n行動呼籲：本週首購體驗價，先試一週再決定。',
    },
    blank: {
      name: '空白', prefix: '',
      output: '晨露是一款產品，適合需要的人使用。它有一些特色，可以帶來便利。\n如果你有興趣，歡迎進一步了解。',
    },
  }

  const style = document.createElement('style')
  style.textContent = `
  .pp-assembly{display:flex;align-items:stretch;gap:10px;flex-wrap:wrap;margin-bottom:18px}
  .pp-seg{flex:1;min-width:150px;border-radius:12px;padding:12px 14px;box-sizing:border-box;border:1px solid transparent}
  .pp-seg .lbl{font-size:15px;letter-spacing:.08em;font-weight:600;opacity:.9;margin-bottom:6px}
  .pp-seg .txt{font-size:15px;line-height:1.55;white-space:pre-wrap}
  .pp-seg.mem{background:rgba(123,97,255,.1);border-color:rgba(123,97,255,.4)}
  .pp-seg.mem .lbl{color:#b6a6ff}
  .pp-seg.pre{background:rgba(91,140,255,.12);border-color:${accent}}
  .pp-seg.pre .lbl{color:#8fb0ff}
  .pp-seg.inp{background:rgba(74,222,128,.1);border-color:rgba(74,222,128,.42)}
  .pp-seg.inp .lbl{color:#7ee0a2}
  .pp-plus{align-self:center;font-size:22px;color:#5a6072;font-weight:300}
  .pp-flow{display:flex;align-items:center;gap:12px;justify-content:center;color:#7d8496;font-size:15px;flex-wrap:wrap;margin-bottom:18px}
  .pp-llm{display:inline-flex;align-items:center;gap:9px;padding:8px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.04);color:#e8ebf2;font-size:16px;font-weight:600}
  .pp-icon{width:1.1em;height:1.1em;vertical-align:-.15em}
  .pp-out{border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(255,255,255,.02);padding:16px 20px;min-height:120px;margin-bottom:18px}
  .pp-out .oh{font-size:15px;letter-spacing:.1em;text-transform:uppercase;color:#6b7180;margin-bottom:8px}
  .pp-out .ot{font-size:16px;line-height:1.7;color:#dfe3ec;white-space:pre-wrap;transition:opacity .22s}
  .pp-out .ot.fade{opacity:0}
  .pp-tabs{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
  .pp-tab{display:flex;flex-direction:column;gap:2px;align-items:flex-start;padding:9px 15px;border-radius:11px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);cursor:pointer;transition:all .18s;min-width:140px;font-family:inherit}
  .pp-tab .tn{font-size:17px;font-weight:600;color:#e8ebf2}
  .pp-tab .td{font-size:15px;color:#828a9c}
  .pp-tab:hover{border-color:rgba(255,255,255,.28)}
  .pp-tab.on{border-color:${accent};background:rgba(91,140,255,.12);box-shadow:0 0 0 1px ${accent} inset}
  .pp-reset{font-family:var(--font-tc);font-size:15.5px;color:var(--text);background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:999px;padding:9px 18px;cursor:pointer}
  .pp-reset:hover{border-color:var(--text)}
  .pp-reset.hide{display:none}
  `
  el.appendChild(style)

  const assembly = document.createElement('div')
  assembly.className = 'pp-assembly ds-unit'
  assembly.innerHTML = `
    <div class="pp-seg mem ds-unit"><div class="lbl">記憶</div><div class="txt">${MEMORY}</div></div>
    <span class="pp-plus">+</span>
    <div class="pp-seg pre ds-unit"><div class="lbl">Claude Projects 開頭</div><div class="txt" id="pp-prefix"></div></div>
    <span class="pp-plus">+</span>
    <div class="pp-seg inp ds-unit"><div class="lbl">你這次的輸入</div><div class="txt">${INPUT}</div></div>`

  const arrow = `<svg class="pp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h13"/><path d="M13 7l5 5-5 5"/></svg>`
  const flow = document.createElement('div')
  flow.className = 'pp-flow ds-unit'
  flow.innerHTML = `${arrow}拼成一整段話，一起送進
    <span class="pp-llm"><svg class="pp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a4 4 0 0 1 4 4 4 4 0 0 1 0 8 4 4 0 0 1-8 0 4 4 0 0 1 0-8 4 4 0 0 1 4-4z"/><path d="M12 7v10"/></svg>LLM</span>
    ${arrow}吐出一句話`

  const outBox = document.createElement('div')
  outBox.className = 'pp-out ds-unit'
  outBox.innerHTML = `<div class="oh">輸出</div><div class="ot" id="pp-out"></div>`

  const tabs = document.createElement('div')
  tabs.className = 'pp-tabs ds-unit'
  tabs.innerHTML = `
    <button class="pp-tab on" data-k="social"><span class="tn">社群寫手</span><span class="td">貼文口吻、短句</span></button>
    <button class="pp-tab" data-k="consultant"><span class="tn">嚴謹顧問</span><span class="td">結構化、講證據</span></button>
    <button class="pp-tab" data-k="blank"><span class="tn">空白</span><span class="td">沒有開頭</span></button>
    <button class="pp-reset hide" data-k="reset">重來</button>`

  const prefixEl = assembly.querySelector('#pp-prefix')
  const outEl = outBox.querySelector('#pp-out')
  const llmPill = flow.querySelector('.pp-llm')
  const resetBtn = tabs.querySelector('.pp-reset')

  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  let current = 'social', interactive = false, stage

  function setTab(k) {
    tabs.querySelectorAll('.pp-tab').forEach(b => b.classList.toggle('on', b.dataset.k === k))
  }
  function setPreset(k, animate) {
    current = k
    const p = PRESETS[k]
    setTab(k)
    prefixEl.textContent = p.prefix || '（沒有開頭 — 這一格是空的）'
    prefixEl.style.color = p.prefix ? '#dfe3ec' : '#7d8496'
    if (animate) {
      pop(llmPill)
      outEl.classList.add('fade')
      T(() => { outEl.textContent = p.output; outEl.classList.remove('fade') }, 210)
    } else {
      outEl.textContent = p.output
    }
  }

  function assemble() {
    enterFly(assembly.querySelector('.mem'), { y: 20, dur: 480, delay: 0 })
    enterFly(assembly.querySelector('.pre'), { y: 20, dur: 480, delay: 140 })
    enterFly(assembly.querySelector('.inp'), { y: 20, dur: 480, delay: 280 })
  }

  function resetScene() {
    clearT(); interactive = false
    setPreset('social', false)
    resetBtn.classList.add('hide')
  }
  function startSandboxRun() {
    resetScene(); interactive = true
    resetBtn.classList.remove('hide')
    tabs.querySelectorAll('.pp-tab').forEach((b, i) => enterFly(b, { y: 14, dur: 420, delay: i * 90 }))
  }

  tabs.addEventListener('click', e => {
    const btn = e.target.closest('button'); if (!btn) return
    if (btn.dataset.k === 'reset') { pop(btn); setPreset('social', true); return }
    if (!interactive || btn.dataset.k === current) return
    pop(btn); setPreset(btn.dataset.k, true)
  })

  function buildBeats() {
    return [
      { narration: '同一句輸入 <b>「幫我寫一段產品介紹」</b>，AI 真正拿到的其實是<b>三塊拼在一起</b>。', focus: ['.pp-assembly'], nextLabel: '哪三塊？ →',
        enter() { resetScene(); assemble() } },

      { narration: '第一塊是<b>記憶</b>、第三塊是<b>你這次的輸入</b> — 這兩塊我們先固定不動。', focus: ['.mem', '.inp'], nextLabel: '那中間呢？ →',
        enter() { resetScene(); pop(assembly.querySelector('.mem')); T(() => pop(assembly.querySelector('.inp')), 180) } },

      { narration: '中間這塊 <b>Claude Projects 起始點</b>，就是被鎖在接龍最前面的一段固定開頭。', focus: ['.pre', '.pp-flow'], nextLabel: '換掉它會怎樣？ →',
        enter() { resetScene(); pop(assembly.querySelector('.pre')); T(() => pop(llmPill), 300) } },

      { narration: '把開頭換成<b>嚴謹顧問</b> — 同一句輸入，開頭一換，輸出的風格整個變了。', focus: ['.pp-tabs', '.pp-out'], nextLabel: '換我切切看 →',
        enter() { resetScene(); T(() => setPreset('consultant', true), 500) } },

      { narration: '換你切 — 三個開頭任你換。<b>ChatGPT 專案、Gemini Gem、Claude Projects 只是行銷名字</b> — 它就是把一段話接在接龍的最前面。', sandbox: true,
        enter() { startSandboxRun() } },
    ]
  }

  stage = createStage(el, ctx, { beats: buildBeats() })
  stage.body.append(assembly, flow, outBox, tabs)

  return () => { clearT(); stage.destroy(); style.remove() }
}
