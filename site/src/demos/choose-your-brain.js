// Demo：選大腦
// 核心互動：上方任務滑桿（隨口聊 ↔ 小任務 ↔ 寫報表 ↔ 策略規劃）依位置高亮推薦大腦、
// 說明文字即時換；實驗：128k 腦做長任務跑到 60+ 題出現幻覺/遺忘，換 1M 腦穩定到底；
// 彩蛋「sonnet 一直亂講怎麼辦」→ 一鍵換 opus 重跑正確。

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const GREEN = '#4ade80', RED = '#f87171', GOLD = '#fbbf24'
  const ico = (d, s = 18) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
  const BRAIN = '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5 3 3 0 0 0 2 5 3 3 0 0 0 3 2V4z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 1 5 3 3 0 0 1-2 5 3 3 0 0 1-3 2V4z"/>'

  const BRAINS = [
    { id: 'lite', name: '輕量腦', model: 'haiku 128k', ctx: 128, tone: accent,
      desc: '128k context。快、省、便宜。適合隨口聊、翻譯、格式轉換這種一問一答。但問到六七十題就開始幻覺、忘掉前面設定。' },
    { id: 'mid', name: '中階腦', model: 'sonnet 200k', ctx: 200, tone: GOLD,
      desc: '200k context ≈ 小任務的甜蜜點。整理資料、寫段落、多步驟小任務都穩。要跑很長的專案或吃整包文件才會不夠。' },
    { id: 'flag', name: '旗艦腦', model: 'opus 1M', ctx: 1000, tone: GREEN,
      desc: '100 萬 token ≈ 50 萬中文字 = 一本小說。寫報表、讀整個 codebase、當策略顧問／長規劃，全程記得住、不掉設定。' }
  ]
  // 滑桿 0..3：隨口聊 / 小任務 / 寫報表 / 策略規劃 → 推薦腦 index
  const TASKS = [
    { name: '隨口聊聊', rec: 0 }, { name: '小任務整理', rec: 1 },
    { name: '寫報表', rec: 2 }, { name: '策略顧問／規劃', rec: 2 }
  ]

  const style = document.createElement('style')
  style.textContent = `
  .cb-wrap{position:absolute;inset:0;display:flex;flex-direction:column;gap:16px;padding:20px 30px;box-sizing:border-box;font-family:var(--font-tc,'Noto Sans TC',sans-serif);overflow:auto}
  .cb-lead{font-size:17px;color:#9aa0b0;line-height:1.55}
  .cb-lead b{color:#e8ebf2;font-weight:600}
  .cb-slider-wrap{padding:6px 4px}
  .cb-ticks{display:flex;justify-content:space-between;margin-bottom:8px}
  .cb-tick{font-size:14px;color:#7d8496;transition:color .25s;flex:1;text-align:center}
  .cb-tick.on{color:${accent};font-weight:600}
  .cb-slider{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:5px;background:linear-gradient(90deg,${accent},${GOLD},${GREEN});outline:none}
  .cb-slider::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#e8ebf2;border:3px solid ${accent};cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.5)}
  .cb-slider::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:#e8ebf2;border:3px solid ${accent};cursor:pointer}
  .cb-cards{display:flex;gap:14px;flex-wrap:wrap}
  .cb-card{flex:1;min-width:230px;border-radius:14px;border:1.6px solid rgba(255,255,255,.1);background:rgba(255,255,255,.02);padding:16px 17px;transition:all .3s;position:relative;overflow:hidden}
  .cb-card .ch{display:flex;align-items:center;gap:10px;margin-bottom:8px}
  .cb-card .ch .bi{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.06);flex:none}
  .cb-card .ch .nm{font-size:17px;color:#e8ebf2;font-weight:600}
  .cb-card .ch .md{font-size:13px;color:#7d8496;font-family:var(--font-mono,'JetBrains Mono',monospace)}
  .cb-card .cx{font-size:13.5px;color:#8b91a2;margin-bottom:8px;font-variant-numeric:tabular-nums}
  .cb-card .cd{font-size:14.5px;color:#9aa0b0;line-height:1.55}
  .cb-card.rec{border-color:var(--tone);background:color-mix(in srgb,var(--tone) 9%,transparent);box-shadow:0 0 0 1px var(--tone) inset}
  .cb-card.rec .bi{background:color-mix(in srgb,var(--tone) 22%,transparent);color:var(--tone)}
  .cb-card:not(.rec) .bi{color:#8b91a2}
  .cb-badge{position:absolute;top:12px;right:12px;font-size:12px;padding:3px 9px;border-radius:20px;background:var(--tone);color:#05060a;font-weight:700;opacity:0;transition:opacity .3s}
  .cb-card.rec .cb-badge{opacity:1}
  .cb-lab{margin-top:4px;border-radius:14px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.02);padding:15px 17px}
  .cb-lab h4{font-size:16px;color:#e8ebf2;margin:0 0 4px;font-weight:600}
  .cb-lab p{font-size:14px;color:#8b91a2;margin:0 0 12px;line-height:1.5}
  .cb-run{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:12px}
  .cb-counter{font-size:15px;color:#c3c8d4;font-variant-numeric:tabular-nums}
  .cb-counter b{font-size:24px;color:#e8ebf2}
  .cb-using{font-size:13.5px;padding:4px 11px;border-radius:20px;border:1px solid rgba(255,255,255,.16);color:#c3c8d4}
  .cb-chatlog{height:150px;overflow:auto;border-radius:10px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.07);padding:11px 13px;display:flex;flex-direction:column;gap:7px}
  .cb-msg{font-size:13.5px;line-height:1.45;padding:6px 10px;border-radius:8px;max-width:88%}
  .cb-msg.q{align-self:flex-end;background:${accent}1c;color:#c3c8d4}
  .cb-msg.a{align-self:flex-start;background:rgba(255,255,255,.05);color:#c3c8d4}
  .cb-msg.a.halluc{background:${RED}18;color:${RED};border:1px solid ${RED}44}
  .cb-msg.a.ok{border-left:2px solid ${GREEN}}
  .cb-controls{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:12px}
  .cb-note{font-size:14px;color:#7d8496;line-height:1.5;margin-left:auto;max-width:50%;text-align:right}
  .cb-note.bad{color:${RED}}.cb-note.good{color:${GREEN}}
  .cb-egg{margin-left:0}
  .demo-btn.cb-flag{border-color:${GREEN};color:${GREEN}}
  `
  el.appendChild(style)

  const wrap = document.createElement('div')
  wrap.className = 'cb-wrap'
  wrap.innerHTML = `
    <div class="cb-lead">同一件事，用哪顆<b>大腦</b>差很多。拉上面的滑桿描述你的任務，下面三顆腦會即時推薦該用哪顆、為什麼。<b>100 萬 token ≈ 50 萬中文字 = 一本小說。</b></div>

    <div class="cb-slider-wrap">
      <div class="cb-ticks" id="cb-ticks">
        ${TASKS.map((t, i) => `<span class="cb-tick" data-i="${i}">${t.name}</span>`).join('')}
      </div>
      <input type="range" class="cb-slider" id="cb-slider" min="0" max="3" step="1" value="1">
    </div>

    <div class="cb-cards" id="cb-cards">
      ${BRAINS.map((b, i) => `
        <div class="cb-card" data-i="${i}" style="--tone:${b.tone}">
          <span class="cb-badge">推薦</span>
          <div class="ch"><span class="bi">${ico(BRAIN, 22)}</span>
            <div><div class="nm">${b.name}</div><div class="md">${b.model}</div></div></div>
          <div class="cx">context：${b.ctx >= 1000 ? '1M' : b.ctx + 'k'} tokens</div>
          <div class="cd">${b.desc}</div>
        </div>`).join('')}
    </div>

    <div class="cb-lab">
      <h4>互動實驗：長任務誰撐得住</h4>
      <p>開場先告訴大腦一個設定「<b style="color:#c3c8d4">我的貓叫小魚</b>」，然後連續丟很多題。看它跑到六七十題會不會開始<b style="color:${RED}">幻覺、忘記小魚</b>。</p>
      <div class="cb-run">
        <span class="cb-using" id="cb-using">目前大腦：輕量腦（128k）</span>
        <span class="cb-counter">已對話 <b id="cb-count">0</b> 題</span>
      </div>
      <div class="cb-chatlog" id="cb-log"></div>
      <div class="cb-controls">
        <button class="demo-btn primary" id="cb-lite">用 128k 腦跑長任務</button>
        <button class="demo-btn" id="cb-1m">換 1M 腦重跑</button>
        <button class="demo-btn cb-egg" id="cb-egg">sonnet 一直亂講怎麼辦</button>
        <span class="cb-note" id="cb-note">先用 128k 腦跑跑看，觀察它什麼時候開始崩。</span>
      </div>
    </div>
  `
  el.appendChild(wrap)

  const $ = (s) => wrap.querySelector(s)
  const slider = $('#cb-slider'), cards = [...wrap.querySelectorAll('.cb-card')]
  const ticks = [...wrap.querySelectorAll('.cb-tick')]
  const log = $('#cb-log'), countEl = $('#cb-count'), usingEl = $('#cb-using'), note = $('#cb-note')

  const timers = new Set()
  const setT = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }

  // ---- 滑桿推薦 ----
  function applySlider() {
    const v = +slider.value
    const rec = TASKS[v].rec
    ticks.forEach((t, i) => t.classList.toggle('on', i === v))
    cards.forEach((c, i) => c.classList.toggle('rec', i === rec))
  }
  slider.addEventListener('input', applySlider)

  // ---- 長任務實驗 ----
  const QUESTIONS = ['幫我列重點', '這段翻成英文', '摘要一下', '改寫更正式', '列出待辦', '對比兩個方案', '生成標題', '找出風險']
  let running = false

  function askName(brainId) {
    // 128k 腦在 60+ 題會答錯名字
    return brainId === 'lite' ? '你的貓叫「小花」？（不確定…）' : '你的貓叫小魚。'
  }

  function runExperiment(brainId) {
    if (running) return
    running = true
    log.innerHTML = ''
    countEl.textContent = '0'
    const total = 78
    const isLite = brainId === 'lite'
    usingEl.textContent = '目前大腦：' + (isLite ? '輕量腦（128k）' : '旗艦腦（1M）')
    note.textContent = isLite ? '128k 腦執行中…注意 60 題之後的變化。' : '1M 腦執行中…全程盯著它記不記得小魚。'
    note.className = 'cb-note'

    addMsg('q', '記住：我的貓叫小魚。')
    addMsg('a', '好的，記住了 — 你的貓叫小魚。', 'ok')

    let i = 0
    const step = () => {
      if (i >= total) {
        // 結尾追問名字
        addMsg('q', '對了，我的貓叫什麼？')
        if (isLite) {
          addMsg('a', askName('lite'), 'halluc')
          note.textContent = '128k 腦到後段 context 塞爆，開始幻覺、把小魚忘成小花 — 這就是 128k 問六七十題後的樣子。'
          note.className = 'cb-note bad'
        } else {
          addMsg('a', askName('flag'), 'ok')
          note.textContent = '1M 腦全程穩定，78 題後仍記得小魚 — 長任務要用大 context 的腦。'
          note.className = 'cb-note good'
        }
        running = false
        return
      }
      i++
      countEl.textContent = i
      const q = QUESTIONS[i % QUESTIONS.length]
      addMsg('q', `第 ${i} 題：${q}`)
      if (isLite && i >= 62) {
        // 幻覺亂碼
        const garble = ['已完成◤▓ 內容 ⌑⌑ 參照上文（找不到）…', '好的，關於「' + q + '」— ▓▒░ 上下文已遺失', '這個…我記得你說過…（記憶模糊）'][i % 3]
        addMsg('a', garble, 'halluc')
      } else {
        addMsg('a', '已完成：' + q + '。', 'ok')
      }
      log.scrollTop = log.scrollHeight
      setT(step, i >= 60 ? 90 : 34)
    }
    setT(step, 300)
  }

  function addMsg(kind, text, extra) {
    const m = document.createElement('div')
    m.className = 'cb-msg ' + kind + (extra ? ' ' + extra : '')
    m.textContent = text
    log.appendChild(m)
    log.scrollTop = log.scrollHeight
  }

  $('#cb-lite').addEventListener('click', () => { running = false; timers.forEach((id) => clearTimeout(id)); timers.clear(); runExperiment('lite') })
  $('#cb-1m').addEventListener('click', () => {
    running = false; timers.forEach((id) => clearTimeout(id)); timers.clear()
    slider.value = 3; applySlider()
    runExperiment('flag')
  })

  // ---- 彩蛋 ----
  let eggShown = false
  $('#cb-egg').addEventListener('click', () => {
    running = false; timers.forEach((id) => clearTimeout(id)); timers.clear()
    log.innerHTML = ''
    countEl.textContent = '0'
    usingEl.textContent = '目前大腦：中階腦（sonnet 200k）'
    addMsg('q', '幫我分析這份 60 頁策略報告的三個風險。')
    addMsg('a', '風險有…嗯…（東拉西扯，抓不到重點，前後矛盾）', 'halluc')
    note.textContent = 'sonnet 一直亂講、hold 不住這個大任務？'
    note.className = 'cb-note bad'
    if (!eggShown) {
      eggShown = true
      const b = document.createElement('button')
      b.className = 'demo-btn cb-flag'; b.id = 'cb-swap'; b.textContent = '換 opus'
      b.addEventListener('click', () => {
        b.disabled = true
        usingEl.textContent = '目前大腦：旗艦腦（opus 1M）'
        slider.value = 3; applySlider()
        addMsg('q', '（同一題）幫我分析這份 60 頁策略報告的三個風險。')
        setT(() => {
          addMsg('a', '三個風險：1) 現金流集中在單一客戶 2) 交期承諾超出產能 3) 合約缺退出條款。逐條附因應。', 'ok')
          note.textContent = '換 opus（旗艦腦）後一次到位 — 大任務配大腦，別讓小腦硬扛。'
          note.className = 'cb-note good'
        }, 700)
      })
      wrap.querySelector('.cb-controls').insertBefore(b, note)
    }
  })

  applySlider()

  return () => {
    timers.forEach((id) => clearTimeout(id)); timers.clear()
    style.remove(); wrap.remove()
  }
}
