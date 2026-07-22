// Demo：Project = 接龍的固定開頭
// 核心互動：切換三種 Project 預設（社群寫手／嚴謹顧問／空白），同一句輸入，
// 看【記憶】+【Project 開頭】+【你這次的輸入】拼成一段話流進 LLM，輸出風格即時改變。

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'

  const MEMORY = '（記得：品牌叫「晨露」，主打無添加、給忙碌上班族。）'
  const INPUT = '幫我寫一段產品介紹'

  const PRESETS = {
    social: {
      prefix: '你是社群小編。用輕鬆有梗的口吻寫，短句、多換行，結尾放一句能被截圖轉發的話。',
      output:
        '早餐這件事，別再將就了。\n晨露，無添加，三分鐘搞定你的一餐。\n給每個趕捷運還想對自己好一點的你。\n\n忙，不代表要虧待自己。',
    },
    consultant: {
      prefix: '你是資深行銷顧問。輸出要有結構：一句定位、三個賣點（各附理由）、一個行動呼籲。語氣專業克制。',
      output:
        '定位：專為忙碌上班族設計的無添加即食早餐。\n\n三個賣點：\n1. 無添加——成分表乾淨，通勤也能安心吃。\n2. 三分鐘備餐——省下的時間還給睡眠。\n3. 均衡配比——蛋白質與纖維兼顧，不只是填飽。\n\n行動呼籲：本週首購體驗價，先試一週再決定。',
    },
    blank: {
      prefix: '',
      output:
        '晨露是一款產品，適合需要的人使用。它有一些特色，可以帶來便利。\n如果你有興趣，歡迎進一步了解。',
    },
  }

  const style = document.createElement('style')
  style.textContent = `
  .pp-wrap{position:absolute;inset:0;display:flex;flex-direction:column;gap:16px;padding:24px 30px;box-sizing:border-box;font-family:var(--font-tc,'Noto Sans TC',sans-serif);overflow:auto}
  .pp-lead{font-size:17px;color:#9aa0b0;line-height:1.6}
  .pp-lead b{color:#e8ebf2;font-weight:600}
  .pp-tabs{display:flex;gap:10px;flex-wrap:wrap}
  .pp-tab{display:flex;flex-direction:column;gap:2px;align-items:flex-start;padding:9px 15px;border-radius:11px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);cursor:pointer;transition:all .18s;min-width:140px}
  .pp-tab .tn{font-size:17px;font-weight:600;color:#e8ebf2}
  .pp-tab .td{font-size:13px;color:#828a9c}
  .pp-tab:hover{border-color:rgba(255,255,255,.28)}
  .pp-tab.on{border-color:${accent};background:rgba(91,140,255,.12);box-shadow:0 0 0 1px ${accent} inset}
  .pp-assembly{display:flex;align-items:stretch;gap:10px;flex-wrap:wrap}
  .pp-seg{flex:1;min-width:150px;border-radius:12px;padding:12px 14px;box-sizing:border-box;border:1px solid transparent}
  .pp-seg .lbl{font-size:13px;letter-spacing:.08em;font-weight:600;opacity:.9;margin-bottom:6px}
  .pp-seg .txt{font-size:15px;line-height:1.55;white-space:pre-wrap}
  .pp-seg.mem{background:rgba(123,97,255,.1);border-color:rgba(123,97,255,.4)}
  .pp-seg.mem .lbl{color:#b6a6ff}
  .pp-seg.pre{background:rgba(91,140,255,.12);border-color:${accent}}
  .pp-seg.pre .lbl{color:#8fb0ff}
  .pp-seg.inp{background:rgba(74,222,128,.1);border-color:rgba(74,222,128,.42)}
  .pp-seg.inp .lbl{color:#7ee0a2}
  .pp-plus{align-self:center;font-size:22px;color:#5a6072;font-weight:300}
  .pp-flow{display:flex;align-items:center;gap:12px;justify-content:center;color:#7d8496;font-size:15px;flex-wrap:wrap}
  .pp-llm{display:inline-flex;align-items:center;gap:9px;padding:8px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.04);color:#e8ebf2;font-size:16px;font-weight:600}
  .pp-out{border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(255,255,255,.02);padding:16px 20px;min-height:120px}
  .pp-out .oh{font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#6b7180;margin-bottom:8px}
  .pp-out .ot{font-size:16px;line-height:1.7;color:#dfe3ec;white-space:pre-wrap;transition:opacity .22s}
  .pp-out .ot.fade{opacity:0}
  .pp-card{border:1px dashed rgba(255,255,255,.22);border-radius:12px;padding:13px 17px;font-size:16px;line-height:1.6;color:#c3c8d4;display:flex;gap:11px;align-items:flex-start}
  .pp-card b{color:#e8ebf2}
  .pp-card .icon{color:${accent};flex-shrink:0;margin-top:2px}
  .pp-icon{width:1.1em;height:1.1em;vertical-align:-.15em}
  `
  el.appendChild(style)

  const wrap = document.createElement('div')
  wrap.className = 'pp-wrap'
  wrap.innerHTML = `
    <div class="pp-lead">同一句輸入 <b>「${INPUT}」</b>，只換掉最前面那段「Project 開頭」，輸出的風格就完全不同。點下面三個看看。</div>
    <div class="pp-tabs" id="pp-tabs">
      <button class="pp-tab on" data-k="social"><span class="tn">社群寫手</span><span class="td">貼文口吻、短句</span></button>
      <button class="pp-tab" data-k="consultant"><span class="tn">嚴謹顧問</span><span class="td">結構化、講證據</span></button>
      <button class="pp-tab" data-k="blank"><span class="tn">空白</span><span class="td">沒有開頭</span></button>
    </div>
    <div class="pp-assembly">
      <div class="pp-seg mem"><div class="lbl">記憶</div><div class="txt">${MEMORY}</div></div>
      <span class="pp-plus">+</span>
      <div class="pp-seg pre"><div class="lbl">PROJECT 開頭</div><div class="txt" id="pp-prefix"></div></div>
      <span class="pp-plus">+</span>
      <div class="pp-seg inp"><div class="lbl">你這次的輸入</div><div class="txt">${INPUT}</div></div>
    </div>
    <div class="pp-flow">
      <svg class="pp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h13"/><path d="M13 7l5 5-5 5"/></svg>
      拼成一整段話，一起送進
      <span class="pp-llm">
        <svg class="pp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a4 4 0 0 1 4 4 4 4 0 0 1 0 8 4 4 0 0 1-8 0 4 4 0 0 1 0-8 4 4 0 0 1 4-4z"/><path d="M12 7v10"/></svg>
        LLM
      </span>
      <svg class="pp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h13"/><path d="M13 7l5 5-5 5"/></svg>
      吐出一句話
    </div>
    <div class="pp-out">
      <div class="oh">輸出</div>
      <div class="ot" id="pp-out"></div>
    </div>
    <div class="pp-card">
      <svg class="icon pp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.5 5 5.5.8-4 3.9.95 5.5L12 16.6 7.1 18.2 8 12.7l-4-3.9L9.5 8z"/></svg>
      <div><b>GPTs、Gem、Project 只是行銷名字</b> — 它就是把一段話接在接龍的最前面。換的是開頭，不是換了一顆新的大腦。</div>
    </div>
  `
  el.appendChild(wrap)

  const prefixEl = wrap.querySelector('#pp-prefix')
  const outEl = wrap.querySelector('#pp-out')
  const timers = new Set()
  const setT = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }

  let current = 'social'
  function render(k, animate) {
    const p = PRESETS[k]
    prefixEl.textContent = p.prefix ? p.prefix : '（沒有開頭 — 這一格是空的）'
    prefixEl.style.color = p.prefix ? '#dfe3ec' : '#7d8496'
    if (animate) {
      outEl.classList.add('fade')
      setT(() => { outEl.textContent = p.output; outEl.classList.remove('fade') }, 210)
    } else {
      outEl.textContent = p.output
    }
  }

  wrap.querySelector('#pp-tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.pp-tab')
    if (!btn) return
    const k = btn.dataset.k
    if (k === current) return
    current = k
    wrap.querySelectorAll('.pp-tab').forEach((b) => b.classList.toggle('on', b === btn))
    render(k, true)
  })

  render('social', false)

  return () => {
    timers.forEach((id) => clearTimeout(id)); timers.clear()
    style.remove(); wrap.remove()
  }
}
