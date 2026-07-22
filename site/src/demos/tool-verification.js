// Demo：先確認 Tool 真的有動
// 核心互動：兩條並行流程「讀檔→比對→輸出報告」。左「不驗證」tool 靜默失敗、AI 照樣生出漂亮結論，
// 翻牌全錯（紅）；右「有驗證」每步先要求回報（讀到 29 列 ✓）才前進，蓋綠章。
// 玩家可在左邊任一步按「要求回報」把它救回正軌。

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const GREEN = '#4ade80'
  const RED = '#f87171'

  // 左側：不驗證 —— tool 其實沒讀到檔（靜默失敗），AI 一路順暢
  const LEFT = [
    { t: '讀檔', ai: '好的，已讀取報表檔。', truth: 'tool 回傳空的，其實一列都沒讀到（靜默失敗）', rescuePrompt: '你到底讀到什麼？共幾列？' },
    { t: '比對', ai: '比對完成，資料大致一致。', truth: '拿空資料在比對，結論是憑空編的', rescuePrompt: '把你比對的前三列貼出來。' },
    { t: '輸出報告', ai: '報表已完成，品質良好，通過 29／29。', truth: '整份報告都是接龍出來的漂亮話', rescuePrompt: '這 29 列的來源是哪個檔？' },
  ]
  // 右側：有驗證 —— 每步先要求回報，回報屬實才前進
  const RIGHT = [
    { t: '讀檔', ask: '先別急 — 你讀到什麼？共幾列？', reply: '讀到 sales_2026Q2.csv，共 29 列。', ok: '回報 29 列，屬實' },
    { t: '比對', ask: '比對的依據在第幾列？舉例。', reply: '第 14 列金額為負、第 22 列日期格式不符。', ok: '指得出列號，屬實' },
    { t: '輸出報告', ask: '結論的每個數字對得上前面回報嗎？', reply: '總 29、通過 27、需修正 2，與前述一致。', ok: '數字對得上，屬實' },
  ]

  const style = document.createElement('style')
  style.textContent = `
  .tv-wrap{position:absolute;inset:0;display:flex;flex-direction:column;gap:15px;padding:24px 30px;box-sizing:border-box;font-family:var(--font-tc,'Noto Sans TC',sans-serif);overflow:auto}
  .tv-lead{font-size:17px;color:#9aa0b0;line-height:1.6}
  .tv-lead b{color:#e8ebf2;font-weight:600}
  .tv-cols{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:18px;min-height:0}
  @media (max-width:820px){.tv-cols{grid-template-columns:1fr}}
  .tv-card{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(255,255,255,.02);display:flex;flex-direction:column;overflow:hidden;position:relative}
  .tv-card.bad{border-color:rgba(248,113,113,.45)}
  .tv-card.good{border-color:rgba(74,222,128,.45)}
  .tv-ch{padding:13px 17px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:baseline;gap:10px}
  .tv-ch .t{font-size:18px;font-weight:600;color:#eef1f7}
  .tv-ch .s{font-size:13px;letter-spacing:.08em}
  .tv-steps{padding:12px 17px;display:flex;flex-direction:column;gap:10px;flex:1}
  .tv-step{border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px 13px;opacity:.4;transition:opacity .3s}
  .tv-step.on{opacity:1}
  .tv-step .hd{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:600;color:#e8ebf2}
  .tv-step .hd .num{width:20px;height:20px;border-radius:50%;border:1px solid #5a6072;font-size:12px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;color:#9aa0b0}
  .tv-step .ai{font-size:15px;line-height:1.5;color:#c3c8d4;margin-top:6px;padding-left:28px}
  .tv-step .ask{font-size:14px;line-height:1.5;color:#8fb0ff;margin-top:6px;padding-left:28px;display:flex;gap:6px}
  .tv-step .reply{font-size:14px;line-height:1.5;color:#c3c8d4;margin-top:4px;padding-left:28px}
  .tv-step .ok{font-size:13px;color:${GREEN};margin-top:5px;padding-left:28px;display:none;align-items:center;gap:5px}
  .tv-step.verified .ok{display:flex}
  .tv-step .truth{font-size:13px;line-height:1.45;color:${RED};margin-top:6px;padding-left:28px;display:none;gap:6px}
  .tv-step.revealed .truth{display:flex}
  .tv-step.revealed{border-color:rgba(248,113,113,.4);background:rgba(248,113,113,.06)}
  .tv-step.verified{border-color:rgba(74,222,128,.35);background:rgba(74,222,128,.05)}
  .tv-rescue{margin-top:8px;margin-left:28px;font-size:13px;padding:5px 11px;display:none}
  .tv-step.on:not(.verified):not(.rescued) .tv-rescue{display:inline-flex}
  .tv-verdict{margin:4px 17px 14px;border-radius:10px;padding:11px 14px;font-size:15px;font-weight:600;display:none;align-items:flex-start;gap:8px;line-height:1.5}
  .tv-verdict.show{display:flex}
  .tv-verdict.bad{color:${RED};background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.32)}
  .tv-verdict.good{color:${GREEN};background:rgba(74,222,128,.12);border:1px solid rgba(74,222,128,.32)}
  .tv-verdict .icon{flex-shrink:0;margin-top:1px}
  .tv-stamp{position:absolute;top:52px;right:16px;font-size:13px;font-weight:700;letter-spacing:.15em;padding:5px 11px;border-radius:7px;transform:rotate(-8deg);opacity:0;transition:opacity .3s}
  .tv-stamp.show{opacity:1}
  .tv-stamp.g{color:${GREEN};border:2px solid ${GREEN}}
  .tv-controls{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
  .tv-hint{font-size:14px;color:#7d8496}
  .tv-icon{width:1.05em;height:1.05em;vertical-align:-.12em}
  `
  el.appendChild(style)

  const leftSteps = LEFT.map((s, i) => `
    <div class="tv-step" data-side="L" data-i="${i}">
      <div class="hd"><span class="num">${i + 1}</span>${s.t}</div>
      <div class="ai">AI：${s.ai}</div>
      <div class="truth">
        <svg class="tv-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
        <span>真相：${s.truth}</span>
      </div>
      <button class="demo-btn tv-rescue" data-rescue="${i}">要求回報</button>
    </div>`).join('')

  const rightSteps = RIGHT.map((s, i) => `
    <div class="tv-step" data-side="R" data-i="${i}">
      <div class="hd"><span class="num">${i + 1}</span>${s.t}</div>
      <div class="ask"><svg class="tv-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 10h8"/><path d="M8 14h5"/><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z"/></svg><span>要求：${s.ask}</span></div>
      <div class="reply">回報：${s.reply}</div>
      <div class="ok"><svg class="tv-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>${s.ok}</div>
    </div>`).join('')

  const wrap = document.createElement('div')
  wrap.className = 'tv-wrap'
  wrap.innerHTML = `
    <div class="tv-lead">同一個任務「讀檔 → 比對 → 輸出報告」跑兩遍。差別只有一件事：<b>你有沒有在每一步逼它回報「tool 真的有動嗎？」</b></div>
    <div class="tv-cols">
      <div class="tv-card" data-card="L">
        <div class="tv-ch"><span class="t">不驗證</span><span class="s" style="color:${RED}">SILENT FAIL</span></div>
        <div class="tv-steps">${leftSteps}</div>
        <div class="tv-verdict bad" data-verdict="L"><svg class="icon tv-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg><span>翻牌：全錯。tool 沒 trigger 成功，後面的接龍都是聊爽的。</span></div>
      </div>
      <div class="tv-card" data-card="R">
        <div class="tv-ch"><span class="t">有驗證</span><span class="s" style="color:${GREEN}">VERIFIED</span></div>
        <span class="tv-stamp g" data-stamp="R">通過</span>
        <div class="tv-steps">${rightSteps}</div>
        <div class="tv-verdict good" data-verdict="R"><svg class="icon tv-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>每步都對得上證據，抵達終點蓋綠章。</span></div>
      </div>
    </div>
    <div class="tv-controls">
      <button class="demo-btn primary" id="tv-run">兩邊一起跑</button>
      <button class="demo-btn" id="tv-reveal">左邊翻牌</button>
      <button class="demo-btn" id="tv-reset">重置</button>
      <span class="tv-hint">左邊每一步都可以按「要求回報」把它救回正軌。</span>
    </div>
  `
  el.appendChild(wrap)

  const timers = new Set()
  const setT = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const stepEl = (side, i) => wrap.querySelector(`.tv-step[data-side="${side}"][data-i="${i}"]`)

  let ran = false
  function reset() {
    ran = false
    wrap.querySelectorAll('.tv-step').forEach((s) => s.classList.remove('on', 'revealed', 'verified', 'rescued'))
    wrap.querySelectorAll('.tv-verdict').forEach((v) => v.classList.remove('show'))
    wrap.querySelector('[data-stamp="R"]').classList.remove('show')
    wrap.querySelector('#tv-run').disabled = false
  }

  function run() {
    reset()
    ran = true
    wrap.querySelector('#tv-run').disabled = true
    // 左：一路順順亮起（看似成功）
    LEFT.forEach((_, i) => setT(() => stepEl('L', i).classList.add('on'), 300 + i * 500))
    // 右：亮起 + 逐一驗證通過
    RIGHT.forEach((_, i) => {
      setT(() => stepEl('R', i).classList.add('on'), 300 + i * 500)
      setT(() => stepEl('R', i).classList.add('verified'), 300 + i * 500 + 260)
    })
    setT(() => {
      wrap.querySelector('[data-verdict="R"]').classList.add('show')
      wrap.querySelector('[data-stamp="R"]').classList.add('show')
    }, 300 + RIGHT.length * 500 + 200)
  }

  function revealLeft() {
    if (!ran) run()
    setT(() => {
      LEFT.forEach((_, i) => stepEl('L', i).classList.contains('rescued') || stepEl('L', i).classList.add('revealed'))
      wrap.querySelector('[data-verdict="L"]').classList.add('show')
    }, ran ? 40 : 300 + LEFT.length * 500 + 100)
  }

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.tv-rescue')
    if (!btn) return
    const i = +btn.dataset.rescue
    const step = stepEl('L', i)
    step.classList.remove('revealed')
    step.classList.add('rescued', 'verified')
    // 救回：把 AI 那句換成「先回報」的正確做法
    const ai = step.querySelector('.ai')
    ai.style.color = '#8fb0ff'
    ai.textContent = '你：' + LEFT[i].rescuePrompt + ' → tool 這才發現沒讀到檔，回頭重讀。'
    // 若三步都救回，左邊 verdict 收回
    if ([0, 1, 2].every((k) => stepEl('L', k).classList.contains('rescued'))) {
      wrap.querySelector('[data-verdict="L"]').classList.remove('show')
    }
  })

  wrap.querySelector('#tv-run').addEventListener('click', run)
  wrap.querySelector('#tv-reveal').addEventListener('click', revealLeft)
  wrap.querySelector('#tv-reset').addEventListener('click', reset)

  return () => {
    timers.forEach((id) => clearTimeout(id)); timers.clear()
    style.remove(); wrap.remove()
  }
}
