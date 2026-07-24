// Demo：Agentic Engineering 的 8 個等級（Martin Fowler）— DemoStage 導演版
// 5 拍：八級階梯全景｜L0–L3 AI 當打字員逐級亮｜L4–L7 AI 當工程師逐級亮｜4 題快問快答｜結果落點 + 下一級要學的一件事（sandbox）。
import { createStage, pop, shake, confettiBurst } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const GOLD = '#fbbf24'

// 八級：L0（底）→ L7（頂）。desc = 一句白話；step = 升上下一級要學會的一件事。
const LEVELS = [
  { n: 'L0', name: '補全', desc: 'AI 幫你把這一行、這個函式補完 — 你主導，它接話。', step: '打開編輯器的 AI 補全，讓它接你的下一行。' },
  { n: 'L1', name: '問答', desc: '卡住就把錯誤訊息整段貼給它問，它給解法你來貼回去。', step: '遇到不會的，先問 AI 一輪再動手。' },
  { n: 'L2', name: '單檔改', desc: '框選一段，說「改成這樣」，它改這一個檔案給你。', step: '學會框選一段、明確說出「改成…」。' },
  { n: 'L3', name: '多檔改', desc: '描述一個需求，它自己跨好幾個檔案一起改。', step: '一次描述跨檔需求，讓它自己找該動哪些檔。' },
  { n: 'L4', name: '整任務委派', desc: '把一整個任務丟給它，自己做完再回來給你收尾。', step: '把驗收標準寫清楚，敢把整個任務交出去。' },
  { n: 'L5', name: '長時間自主', desc: '它連續跑很久、自己開分支測試，你只看結果。', step: '建立 test / CI，讓它能自己驗證再回報。' },
  { n: 'L6', name: '多 agent', desc: '你開好幾個 agent 分工，各做一塊再合起來。', step: '學會拆任務、把工作分派給多個 agent。' },
  { n: 'L7', name: '編隊自治', desc: '一整支 agent 編隊自我協調，你設計制度不再逐一下令。', step: '你在頂端了 — 下一關是治理、邊界與品味。' },
]

const QUIZ = [
  { q: '一次交給 AI 多大的事？', opts: [['一行、一個函式片段', 1], ['一個檔案裡的一段', 2], ['跨多個檔案的一個需求', 4], ['一整個任務，自己收尾', 6]] },
  { q: '你多久看它一次？', opts: [['每一行都盯著', 1], ['每個檔案改完看一次', 3], ['跑完一個任務才看', 5], ['讓它跑很久才回報', 7]] },
  { q: '你同時讓幾個 AI 在跑？', opts: [['就一個對話，一次一件', 2], ['一個 agent 連續做多步', 4], ['開好幾個 agent 分工', 6], ['一整支編隊自我協調', 7]] },
  { q: '你主要在做什麼？', opts: [['自己寫，AI 偶爾補字', 1], ['我出需求，AI 出草稿我改', 3], ['我定架構與邊界，AI 執行', 5], ['我設計制度，讓 agent 群自治', 7]] },
]

export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#5b8cff'

  const style = document.createElement('style')
  style.textContent = `
  .el-wrap{--acc:${accent};display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:22px;align-items:start}
  @media(max-width:860px){.el-wrap{grid-template-columns:1fr}}
  .el-ladder{display:flex;flex-direction:column;gap:8px;padding:6px 4px}
  .el-rung{position:relative;display:flex;align-items:center;gap:12px;margin-left:calc(var(--i) * 22px);
    padding:11px 15px;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.03);
    opacity:.32;filter:saturate(.5);transition:all .55s ${EASE};cursor:pointer}
  .el-rung.on{opacity:1;filter:none;border-color:rgba(255,255,255,.28);background:rgba(255,255,255,.06)}
  .el-rung.lo.on{box-shadow:0 0 0 1px var(--acc)55,0 8px 22px -14px var(--acc)}
  .el-rung.hi.on{box-shadow:0 0 0 1px ${GOLD}66,0 10px 26px -12px ${GOLD}88}
  .el-badge{font-family:var(--font-mono);font-size:15px;font-weight:600;color:var(--acc);
    border:1px solid var(--acc)66;border-radius:8px;padding:3px 8px;flex:none;min-width:34px;text-align:center}
  .el-rung.hi .el-badge{color:${GOLD};border-color:${GOLD}66}
  .el-name{font-size:17px;font-weight:600;color:var(--text);flex:none;min-width:82px}
  .el-desc{font-size:15px;color:var(--text-dim);line-height:1.45}
  .el-you{position:absolute;left:-14px;top:50%;transform:translate(-100%,-50%);display:flex;align-items:center;gap:5px;
    font-family:var(--font-mono);font-size:14px;color:${GOLD};white-space:nowrap;opacity:0;transition:opacity .5s}
  .el-you.show{opacity:1}
  .el-you svg{width:22px;height:22px}
  .el-ground{margin-left:0;font-size:14px;color:var(--text-dim);letter-spacing:.04em;padding:6px 4px 0}
  .el-quiz{display:flex;flex-direction:column;gap:14px}
  .el-qcard{border:1px solid var(--line);border-radius:14px;padding:14px 16px;background:rgba(255,255,255,.02);
    opacity:0;transform:translateY(14px);transition:all .5s ${EASE}}
  .el-qcard.in{opacity:1;transform:none}
  .el-q{font-size:16px;font-weight:600;color:var(--text);margin-bottom:10px}
  .el-q b{color:var(--acc)}
  .el-opts{display:flex;flex-direction:column;gap:7px}
  .el-opt{text-align:left;font-family:var(--font-tc);font-size:15px;color:var(--text);cursor:pointer;
    background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:10px;padding:9px 13px;transition:all .2s}
  .el-opt:hover{border-color:var(--text)}
  .el-opt.sel{border-color:var(--acc);background:var(--acc)1f;font-weight:600}
  .el-result{border:1px solid ${GOLD}55;border-radius:14px;padding:16px 18px;background:${GOLD}10;
    display:none;flex-direction:column;gap:8px}
  .el-result.show{display:flex}
  .el-rlv{font-size:20px;font-weight:700;color:${GOLD}}
  .el-rlv small{font-size:15px;color:var(--text-dim);font-weight:400}
  .el-rstep{font-size:15.5px;color:var(--text);line-height:1.5}
  .el-rstep b{color:${GOLD}}
  .el-detail{font-size:15px;color:var(--text-dim);line-height:1.5;min-height:22px;padding:2px}
  .el-detail b{color:var(--acc)}
  .el-btn{font-family:var(--font-tc);font-size:15px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:9px 18px;cursor:pointer;transition:all .25s ${EASE};align-self:flex-start}
  .el-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  `
  el.appendChild(style)

  const PIN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21c4-5 6-8 6-11a6 6 0 1 0-12 0c0 3 2 6 6 11Z"/><circle cx="12" cy="10" r="2.3"/></svg>`

  const wrap = document.createElement('div')
  wrap.className = 'el-wrap'
  wrap.innerHTML = `
    <div class="el-side">
      <div class="el-ladder ds-unit">
        ${LEVELS.slice().reverse().map(l => {
          const idx = LEVELS.indexOf(l)
          const half = idx >= 4 ? 'hi' : 'lo'
          return `<div class="el-rung ${half}" data-lv="${idx}" style="--i:${idx}">
            <span class="el-you">${PIN}<span>你在這</span></span>
            <span class="el-badge">${l.n}</span><span class="el-name">${l.name}</span>
            <span class="el-desc"></span></div>`
        }).join('')}
        <div class="el-ground">地面 · 純手寫，完全不用 AI</div>
      </div>
    </div>
    <div class="el-panel">
      <div class="el-quiz ds-unit"></div>
      <div class="el-result ds-unit">
        <div class="el-rlv"></div>
        <div class="el-rstep"></div>
        <div class="el-detail">點階梯上任一級，看它是什麼。</div>
        <button class="el-btn" data-b="retest">重新測一次</button>
      </div>
    </div>`

  let stage
  const $ = s => wrap.querySelector(s)
  const $$ = s => [...wrap.querySelectorAll(s)]
  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  const rung = lv => wrap.querySelector(`.el-rung[data-lv="${lv}"]`)
  const answers = new Array(QUIZ.length).fill(null)

  const quizEl = $('.el-quiz')
  quizEl.innerHTML = QUIZ.map((item, qi) => `
    <div class="el-qcard" data-q="${qi}">
      <div class="el-q"><b>Q${qi + 1}.</b> ${item.q}</div>
      <div class="el-opts">${item.opts.map((o, oi) =>
        `<button class="el-opt" data-q="${qi}" data-o="${oi}" data-score="${o[1]}">${o[0]}</button>`).join('')}
    </div></div>`).join('')

  $$('.el-opt').forEach(b => b.addEventListener('click', () => {
    const qi = +b.dataset.q
    quizEl.querySelectorAll(`.el-opt[data-q="${qi}"]`).forEach(x => x.classList.remove('sel'))
    b.classList.add('sel'); pop(b)
    answers[qi] = +b.dataset.score
  }))

  let ladderClickable = false
  $$('.el-rung').forEach(r => r.addEventListener('click', () => {
    if (!ladderClickable) return
    const l = LEVELS[+r.dataset.lv]
    pop(r); $('.el-detail').innerHTML = `<b>${l.n} ${l.name}</b> — ${l.desc}`
  }))

  $('[data-b="retest"]').addEventListener('click', () => { pop($('[data-b="retest"]')); stage.goto(3) })

  function lightRung(lv) {
    const r = rung(lv); r.classList.add('on')
    r.querySelector('.el-desc').textContent = LEVELS[lv].desc
    pop(r.querySelector('.el-badge'))
  }
  function setRungs(from, to, on) {
    for (let lv = from; lv <= to; lv++) {
      const r = rung(lv)
      r.classList.toggle('on', on)
      r.querySelector('.el-desc').textContent = on ? LEVELS[lv].desc : ''
    }
  }
  function resetLadder() {
    clearT()
    $$('.el-rung').forEach(r => { r.classList.remove('on'); r.querySelector('.el-desc').textContent = ''; r.querySelector('.el-you').classList.remove('show') })
    ladderClickable = false
  }

  function computeLevel() {
    const filled = answers.map(a => a == null ? 3 : a)   // 未答給中間值
    const avg = filled.reduce((s, v) => s + v, 0) / filled.length   // 1..7
    return Math.max(0, Math.min(7, Math.round((avg - 1) / 6 * 7)))
  }

  function showResult() {
    const lv = computeLevel()
    for (let i = 0; i <= lv; i++) lightRung(i)   // 落點以下全亮
    const l = LEVELS[lv]
    $('.el-rlv').innerHTML = `你的落點：${l.n} ${l.name} <small>／ 共 8 級</small>`
    $('.el-rstep').innerHTML = `下一級你需要學會的一件事：<b>${l.step}</b>`
    $('.el-result').classList.add('show')
    const r = rung(lv), you = r.querySelector('.el-you')
    T(() => {
      you.classList.add('show'); shake(r)
      const wr = wrap.getBoundingClientRect(), rr = r.getBoundingClientRect()
      confettiBurst(stage.body, rr.left - wr.left + rr.width / 2, rr.top - wr.top, GOLD, 28)
    }, 400)
    ladderClickable = true
  }

  function buildBeats() {
    return [
      { narration: 'Agentic Engineering 有 <b>8 個等級</b> — 從純手寫的地面，一路爬到全自主編隊。你在第幾級？', focus: ['.el-ladder'], nextLabel: '看下半段 →',
        enter() { resetLadder(); $('.el-quiz').style.display = 'none'; $('.el-result').classList.remove('show'); LEVELS.forEach((_, i) => T(() => lightRung(i), i * 90)) } },

      { narration: 'L0–L3：<b>AI 當打字員</b>。你還是駕駛，它只是幫你打字 — 補全、問答、改單檔、改多檔。', focus: ['.el-rung.lo'], nextLabel: '往上一半 →',
        enter() { resetLadder(); LEVELS.forEach((_, i) => { if (i < 4) T(() => lightRung(i), i * 260) }) } },

      { narration: 'L4–L7：<b>AI 當工程師</b>。你退到指揮位 — 委派整個任務、讓它長時間自主、開多個 agent、最後整支編隊自治。', focus: ['.el-rung.hi'], nextLabel: '測測你在哪一級 →',
        enter() { resetLadder(); setRungs(0, 3, true); LEVELS.forEach((_, i) => { if (i >= 4) T(() => lightRung(i), (i - 4) * 300) }) } },

      { narration: '測測你在哪一級 — <b>4 個問題</b>，選最接近你現在的用法。', focus: ['.el-quiz'], nextLabel: '看我的落點 →',
        enter() {
          resetLadder(); setRungs(0, 7, false)
          $('.el-result').classList.remove('show')
          $('.el-quiz').style.display = 'flex'
          $$('.el-qcard').forEach((c, i) => { c.classList.remove('in'); T(() => c.classList.add('in'), 120 + i * 120) })
        } },

      { narration: '這是你今天的落點 — 階梯不是要你一次跳到頂，而是<b>看清下一級</b>。點任一級看它是什麼，或重測一次。', sandbox: true,
        enter() { resetLadder(); $('.el-quiz').style.display = 'none'; showResult() } },
    ]
  }

  stage = createStage(el, ctx, { beats: buildBeats() })
  stage.body.append(wrap)

  return () => { clearT(); stage.destroy(); style.remove() }
}
