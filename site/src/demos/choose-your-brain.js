// choose-your-brain — DemoStage 導演版
// 6 拍：三顆大腦｜任務滑桿即時推薦｜128k 腦長任務跑到崩｜換 1M 腦穩到底｜彩蛋 sonnet 亂講換 opus｜sandbox 自由玩。
import { createStage, pop, shake } from './_stage.js'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const GREEN = '#4ade80', RED = '#f87171', GOLD = '#fbbf24'
  const ico = (d, s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
  const BRAIN = '<path d="M12 5 C9 4 6 6 7 9 C5 10 5 13 7 14 C7 17 10 18 12 16"/><path d="M12 5 C15 4 18 6 17 9 C19 10 19 13 17 14 C17 17 14 18 12 16"/><path d="M12 5 V16"/>'

  const BRAINS = [
    { id: 'lite', name: '輕量腦', model: 'haiku 128k', ctx: 128, tone: accent,
      desc: '128k context。快、省、便宜。適合隨口聊、翻譯、格式轉換這種一問一答。但問到六七十題就開始幻覺、忘掉前面設定。' },
    { id: 'mid', name: '中階腦', model: 'sonnet 200k', ctx: 200, tone: GOLD,
      desc: '200k context ≈ 小任務的甜蜜點。整理資料、寫段落、多步驟小任務都穩。要跑很長的專案或吃整包文件才會不夠。' },
    { id: 'flag', name: '旗艦腦', model: 'opus 1M', ctx: 1000, tone: GREEN,
      desc: '100 萬 token ≈ 50 萬中文字 = 一本小說。寫報表、讀整個 codebase、當策略顧問／長規劃，全程記得住、不掉設定。' }
  ]
  const TASKS = [
    { name: '隨口聊聊', rec: 0 }, { name: '小任務整理', rec: 1 },
    { name: '寫報表', rec: 2 }, { name: '策略顧問／規劃', rec: 2 }
  ]

  const style = document.createElement('style')
  style.textContent = `
  .cb-slider-wrap{padding:6px 4px}
  .cb-ticks{display:flex;justify-content:space-between;margin-bottom:8px}
  .cb-tick{font-size:15.5px;color:#7d8496;transition:color .25s;flex:1;text-align:center}
  .cb-tick.on{color:${accent};font-weight:600}
  .cb-slider{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:5px;background:linear-gradient(90deg,${accent},${GOLD},${GREEN});outline:none}
  .cb-slider::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#e8ebf2;border:3px solid ${accent};cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.5)}
  .cb-slider::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:#e8ebf2;border:3px solid ${accent};cursor:pointer}
  .cb-cards{display:flex;gap:14px;flex-wrap:wrap;margin-top:16px}
  .cb-card{flex:1;min-width:230px;border-radius:14px;border:1.6px solid var(--line);background:rgba(255,255,255,.02);padding:16px 17px;transition:all .3s;position:relative;overflow:hidden}
  .cb-card .ch{display:flex;align-items:center;gap:10px;margin-bottom:8px}
  .cb-card .ch .bi{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.06);flex:none}
  .cb-card .ch .nm{font-size:17px;color:#e8ebf2;font-weight:600}
  .cb-card .ch .md{font-size:15px;color:#7d8496;font-family:var(--font-mono,monospace)}
  .cb-card .cx{font-size:15px;color:#8b91a2;margin-bottom:8px;font-variant-numeric:tabular-nums}
  .cb-card .cd{font-size:15.5px;color:#9aa0b0;line-height:1.55}
  .cb-card.rec{border-color:var(--tone);background:color-mix(in srgb,var(--tone) 9%,transparent);box-shadow:0 0 0 1px var(--tone) inset}
  .cb-card.rec .bi{background:color-mix(in srgb,var(--tone) 22%,transparent);color:var(--tone)}
  .cb-card:not(.rec) .bi{color:#8b91a2}
  .cb-badge{position:absolute;top:12px;right:12px;font-size:14px;padding:3px 9px;border-radius:20px;background:var(--tone);color:#05060a;font-weight:700;opacity:0;transition:opacity .3s}
  .cb-card.rec .cb-badge{opacity:1}
  .cb-lab{margin-top:16px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.02);padding:15px 17px}
  .cb-run{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:12px}
  .cb-counter{font-size:15px;color:#c3c8d4;font-variant-numeric:tabular-nums}
  .cb-counter b{font-size:24px;color:#e8ebf2}
  .cb-using{font-size:15px;padding:4px 11px;border-radius:20px;border:1px solid rgba(255,255,255,.16);color:#c3c8d4}
  .cb-chatlog{height:150px;overflow:auto;border-radius:10px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.07);padding:11px 13px;display:flex;flex-direction:column;gap:7px}
  .cb-msg{font-size:15px;line-height:1.45;padding:6px 10px;border-radius:8px;max-width:88%}
  .cb-msg.q{align-self:flex-end;background:${accent}1c;color:#c3c8d4}
  .cb-msg.a{align-self:flex-start;background:rgba(255,255,255,.05);color:#c3c8d4}
  .cb-msg.a.halluc{background:${RED}18;color:${RED};border:1px solid ${RED}44}
  .cb-msg.a.ok{border-left:2px solid ${GREEN}}
  .cb-controls{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:12px}
  .cb-controls.hide{display:none}
  .cb-note{font-size:15.5px;color:#7d8496;line-height:1.5;margin-left:auto;max-width:50%;text-align:right}
  .cb-note.bad{color:${RED}}.cb-note.good{color:${GREEN}}
  .cb-btn{font-family:var(--font-tc);font-size:15px;color:var(--text);background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:999px;padding:9px 18px;cursor:pointer;transition:all .25s}
  .cb-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .cb-btn.primary{background:var(--accent);color:#08090a;border-color:var(--accent);font-weight:600}
  .cb-btn.flag{border-color:${GREEN};color:${GREEN}}
  `
  el.appendChild(style)

  const sliderWrap = document.createElement('div'); sliderWrap.className = 'cb-slider-wrap ds-unit'
  sliderWrap.innerHTML = `
    <div class="cb-ticks">${TASKS.map((t, i) => `<span class="cb-tick" data-i="${i}">${t.name}</span>`).join('')}</div>
    <input type="range" class="cb-slider" id="cb-slider" min="0" max="3" step="1" value="1">`
  const cardsEl = document.createElement('div'); cardsEl.className = 'cb-cards ds-unit'
  cardsEl.innerHTML = BRAINS.map((b, i) => `
    <div class="cb-card" data-i="${i}" style="--tone:${b.tone}">
      <span class="cb-badge">推薦</span>
      <div class="ch"><span class="bi">${ico(BRAIN)}</span>
        <div><div class="nm">${b.name}</div><div class="md">${b.model}</div></div></div>
      <div class="cx">context：${b.ctx >= 1000 ? '1M' : b.ctx + 'k'} tokens</div>
      <div class="cd">${b.desc}</div>
    </div>`).join('')
  const lab = document.createElement('div'); lab.className = 'cb-lab ds-unit'
  lab.innerHTML = `
    <div class="cb-run">
      <span class="cb-using" id="cb-using">目前大腦：輕量腦（128k）</span>
      <span class="cb-counter">已對話 <b id="cb-count">0</b> 題</span>
    </div>
    <div class="cb-chatlog" id="cb-log"></div>
    <div class="cb-controls hide" id="cb-controls">
      <button class="cb-btn primary" id="cb-lite">用 128k 腦跑長任務</button>
      <button class="cb-btn" id="cb-1m">換 1M 腦重跑</button>
      <button class="cb-btn" id="cb-egg">sonnet 一直亂講怎麼辦</button>
      <span class="cb-note" id="cb-note">先用 128k 腦跑跑看，觀察它什麼時候開始崩。</span>
    </div>`

  const $ = s => (lab.querySelector(s) || sliderWrap.querySelector(s))
  const slider = $('#cb-slider'), ticks = [...sliderWrap.querySelectorAll('.cb-tick')]
  const cards = [...cardsEl.querySelectorAll('.cb-card')]
  const log = $('#cb-log'), countEl = $('#cb-count'), usingEl = $('#cb-using'), note = $('#cb-note')
  const controls = $('#cb-controls')

  const timers = new Set()
  const setT = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  function applySlider() {
    const v = +slider.value, rec = TASKS[v].rec
    ticks.forEach((t, i) => t.classList.toggle('on', i === v))
    cards.forEach((c, i) => c.classList.toggle('rec', i === rec))
  }
  slider.addEventListener('input', applySlider)

  const QUESTIONS = ['幫我列重點', '這段翻成英文', '摘要一下', '改寫更正式', '列出待辦', '對比兩個方案', '生成標題', '找出風險']
  const askName = id => id === 'lite' ? '你的貓叫「小花」？（不確定…）' : '你的貓叫小魚。'
  let running = false

  function addMsg(kind, text, extra) {
    const m = document.createElement('div')
    m.className = 'cb-msg ' + kind + (extra ? ' ' + extra : '')
    m.textContent = text; log.appendChild(m); log.scrollTop = log.scrollHeight
  }
  function runExperiment(brainId, fast) {
    running = true; log.innerHTML = ''; countEl.textContent = '0'
    const total = fast ? 66 : 78, isLite = brainId === 'lite'
    usingEl.textContent = '目前大腦：' + (isLite ? '輕量腦（128k）' : '旗艦腦（1M）')
    note.textContent = isLite ? '128k 腦執行中…注意 60 題之後的變化。' : '1M 腦執行中…全程盯著它記不記得小魚。'
    note.className = 'cb-note'
    addMsg('q', '記住：我的貓叫小魚。'); addMsg('a', '好的，記住了 — 你的貓叫小魚。', 'ok')
    let i = 0
    const step = () => {
      if (i >= total) {
        addMsg('q', '對了，我的貓叫什麼？')
        if (isLite) { addMsg('a', askName('lite'), 'halluc'); note.textContent = '128k 腦到後段 context 塞爆，把小魚忘成小花 — 這就是問六七十題後的樣子。'; note.className = 'cb-note bad' }
        else { addMsg('a', askName('flag'), 'ok'); note.textContent = '1M 腦全程穩定，題後仍記得小魚 — 長任務要用大 context 的腦。'; note.className = 'cb-note good' }
        running = false; return
      }
      i++; countEl.textContent = i
      const q = QUESTIONS[i % QUESTIONS.length]
      addMsg('q', `第 ${i} 題：${q}`)
      if (isLite && i >= 60) {
        addMsg('a', ['已完成◤▓ 內容 ⌑⌑ 參照上文（找不到）…', '好的，關於「' + q + '」— ▓▒░ 上下文已遺失', '這個…我記得你說過…（記憶模糊）'][i % 3], 'halluc')
      } else addMsg('a', '已完成：' + q + '。', 'ok')
      log.scrollTop = log.scrollHeight
      setT(step, fast ? (i >= 58 ? 40 : 16) : (i >= 60 ? 90 : 34))
    }
    setT(step, 200)
  }

  let eggShown = false
  function runEgg() {
    running = false; clearT(); log.innerHTML = ''; countEl.textContent = '0'
    usingEl.textContent = '目前大腦：中階腦（sonnet 200k）'
    addMsg('q', '幫我分析這份 60 頁策略報告的三個風險。')
    addMsg('a', '風險有…嗯…（東拉西扯，抓不到重點，前後矛盾）', 'halluc')
    note.textContent = 'sonnet 一直亂講、hold 不住這個大任務？'; note.className = 'cb-note bad'
    if (eggShown) return
    eggShown = true
    const b = document.createElement('button'); b.className = 'cb-btn flag'; b.textContent = '換 opus'
    b.addEventListener('click', () => {
      b.disabled = true; usingEl.textContent = '目前大腦：旗艦腦（opus 1M）'; slider.value = 3; applySlider()
      addMsg('q', '（同一題）幫我分析這份 60 頁策略報告的三個風險。')
      setT(() => {
        addMsg('a', '三個風險：1) 現金流集中在單一客戶 2) 交期承諾超出產能 3) 合約缺退出條款。逐條附因應。', 'ok')
        note.textContent = '換 opus 後一次到位 — 大任務配大腦，別讓小腦硬扛。'; note.className = 'cb-note good'
      }, 700)
    })
    controls.insertBefore(b, note)
  }

  $('#cb-lite').addEventListener('click', () => { running = false; clearT(); runExperiment('lite') })
  $('#cb-1m').addEventListener('click', () => { running = false; clearT(); slider.value = 3; applySlider(); runExperiment('flag') })
  $('#cb-egg').addEventListener('click', runEgg)

  function resetScene() {
    clearT(); running = false; eggShown = false
    slider.value = 1; applySlider()
    log.innerHTML = ''; countEl.textContent = '0'
    usingEl.textContent = '目前大腦：輕量腦（128k）'
    note.textContent = '先用 128k 腦跑跑看，觀察它什麼時候開始崩。'; note.className = 'cb-note'
    controls.querySelector('.cb-btn.flag')?.remove()
    controls.classList.add('hide')
  }

  const stage = createStage(el, ctx, {
    beats: [
      { narration: '同一件事，用哪顆<b>大腦</b>差很多 — 看兩件事：多聰明，加記性多大（context window）。', focus: ['.cb-cards'], nextLabel: '拉滑桿看推薦 →',
        enter() { resetScene() } },

      { narration: '任務越難、要記越多，就往右挑更強的腦。看滑桿走一遍 — 推薦即時跟著換。', focus: ['.cb-slider-wrap', '.cb-cards'], nextLabel: '記性不夠會怎樣？ →',
        enter() { resetScene(); [0, 1, 2, 3].forEach((v, i) => setT(() => { slider.value = v; applySlider(); pop(cards[TASKS[v].rec]) }, 500 + i * 650)) } },

      { narration: '拿 <b>128k 輕量腦</b>跑長任務：先說「我的貓叫小魚」，連丟六七十題 — 看它<b style="color:#f87171">後段開始幻覺、忘記小魚</b>。', focus: ['.cb-lab'], nextLabel: '換大腦重跑 →',
        enter() { resetScene(); setT(() => runExperiment('lite', true), 400) } },

      { narration: '同一份長任務，換 <b style="color:#4ade80">1M 旗艦腦</b>重跑：78 題後仍記得小魚 — 桌子夠大，舊東西不會被擠掉。', focus: ['.cb-lab'], nextLabel: '一個彩蛋 →',
        enter() { resetScene(); slider.value = 3; applySlider(); setT(() => runExperiment('flag', true), 400) } },

      { narration: '反過來也成立：<b>sonnet 一直亂講</b>怎麼講都不通 — 別硬凹，<b style="color:#4ade80">馬上換 opus</b>，一句話就通。', focus: ['.cb-lab'], nextLabel: '換我玩 →',
        enter() { resetScene(); setT(() => { runEgg(); const swap = controls.querySelector('.cb-btn.flag'); if (swap) shake(swap) }, 400) } },

      { narration: '換你玩 — 拉滑桿選腦、按按鈕跑長任務、按「sonnet 亂講」試彩蛋。', sandbox: true,
        enter() { resetScene(); controls.classList.remove('hide') } },
    ],
  })
  stage.body.append(sliderWrap, cardsEl, lab)

  return () => { clearT(); stage.destroy(); style.remove() }
}
