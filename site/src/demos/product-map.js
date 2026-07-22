// Demo：同一顆大腦，不同的身體
// 核心互動：四張產品卡並排，按「派任務」同時跑進度，各自在能力邊界處停下並標記；
// 點卡片展開「工具／權限／記憶在哪」三行規格。

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const GREEN = '#4ade80'
  const AMBER = '#fbbf24'

  const TASK = '幫我讀桌面的報表檔並整理成 HTML'

  // stop：進度停在哪（0~1），kind：邊界類型
  const CARDS = [
    {
      id: 'web', name: 'ChatGPT／Claude 網頁版', tag: '只能聊 + web search',
      stop: 0.30, kind: 'wall',
      steps: ['讀懂你的任務', '想去打開桌面的檔案…', '停：碰不到你的電腦'],
      boundary: '不能碰你的電腦，只能聊天和搜尋網路。桌面的檔案它看不到。',
      spec: { tool: '只有內建的網路搜尋，沒有讀寫檔案的手', perm: '完全碰不到你的本機', mem: '關掉分頁就忘光' },
    },
    {
      id: 'cowork', name: 'Cowork', tag: '有限工具、介面漂亮',
      stop: 0.68, kind: 'partial',
      steps: ['讀懂你的任務', '用有限工具讀到報表', '整理內容', '停：能寫回你電腦，但工具有限'],
      boundary: '有幾樣工具、能把結果寫回你的電腦，介面漂亮好用，但能做的動作是被框住的。',
      spec: { tool: '一組精選、受控的工具', perm: '可讀、可寫到你指定的地方', mem: '單次工作階段內記得' },
    },
    {
      id: 'code', name: 'Claude Code', tag: '全工具、跑完整流程',
      stop: 1.0, kind: 'done',
      steps: ['讀懂你的任務', '讀取報表檔', '解析與整理', '產生 HTML', '寫檔完成'],
      boundary: '幾乎所有工具都能用，能一路把完整流程跑完並交出成品。',
      spec: { tool: '終端機、讀寫檔案、執行程式，全都有', perm: '在你的專案目錄裡放手去做', mem: '靠專案內的檔案（如 CLAUDE.md）延續' },
    },
    {
      id: 'claw', name: 'OpenClaw 龍蝦', tag: '跑完還記進常駐記憶',
      stop: 1.0, kind: 'done-mem',
      steps: ['讀懂你的任務', '讀取報表檔', '解析與整理', '產生 HTML', '寫檔完成', '把結果記進常駐記憶'],
      boundary: '做完 Claude Code 的全部，還多一步：把這次的結果記進自己長期常駐的記憶。',
      spec: { tool: '全套工具 + 常駐執行', perm: '長期在你環境裡運作', mem: '寫進自己的長期記憶，下次還記得' },
    },
  ]

  const style = document.createElement('style')
  style.textContent = `
  .pm-wrap{position:absolute;inset:0;display:flex;flex-direction:column;gap:16px;padding:24px 30px;box-sizing:border-box;font-family:var(--font-tc,'Noto Sans TC',sans-serif);overflow:auto}
  .pm-lead{font-size:17px;color:#9aa0b0;line-height:1.6}
  .pm-lead b{color:#e8ebf2;font-weight:600}
  .pm-task{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
  .pm-task .q{font-size:16px;color:#c3c8d4;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);padding:8px 15px;border-radius:10px}
  .pm-task .q b{color:#e8ebf2}
  .pm-grid{flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:14px;min-height:0}
  @media (max-width:900px){.pm-grid{grid-template-columns:repeat(2,1fr)}}
  .pm-card{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(255,255,255,.02);display:flex;flex-direction:column;overflow:hidden;transition:border-color .2s}
  .pm-card.done{border-color:rgba(74,222,128,.4)}
  .pm-card.wall,.pm-card.partial{border-color:rgba(251,191,36,.38)}
  .pm-ch{padding:13px 15px 10px}
  .pm-ch .nm{font-size:16px;font-weight:600;color:#eef1f7;line-height:1.35}
  .pm-ch .tg{font-size:13px;color:#828a9c;margin-top:3px}
  .pm-bar{height:7px;background:rgba(255,255,255,.06);border-radius:99px;margin:4px 15px;overflow:hidden}
  .pm-bar i{display:block;height:100%;width:0;border-radius:99px;transition:width .1s linear}
  .pm-steps{padding:8px 15px 4px;display:flex;flex-direction:column;gap:5px;flex:1}
  .pm-step{font-size:14px;color:#5f6577;display:flex;align-items:flex-start;gap:7px;line-height:1.4;opacity:.35;transition:opacity .25s,color .25s}
  .pm-step.on{opacity:1;color:#c3c8d4}
  .pm-step .dot{width:14px;height:14px;flex-shrink:0;margin-top:2px}
  .pm-badge{margin:6px 15px 12px;font-size:14px;font-weight:600;padding:7px 11px;border-radius:9px;display:none;align-items:flex-start;gap:7px;line-height:1.45}
  .pm-badge.show{display:flex}
  .pm-badge.stop{color:${AMBER};background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.32)}
  .pm-badge.ok{color:${GREEN};background:rgba(74,222,128,.12);border:1px solid rgba(74,222,128,.32)}
  .pm-badge .icon{flex-shrink:0;margin-top:1px}
  .pm-more{margin:0 15px 12px;font-size:13px;color:#8b91a2;cursor:pointer;user-select:none;display:inline-flex;align-items:center;gap:5px}
  .pm-more:hover{color:#c3c8d4}
  .pm-spec{margin:0 15px 12px;display:none;flex-direction:column;gap:6px;border-top:1px dashed rgba(255,255,255,.14);padding-top:10px}
  .pm-spec.show{display:flex}
  .pm-spec .r{font-size:13px;line-height:1.45;color:#aeb4c2;display:flex;gap:7px}
  .pm-spec .r b{color:#e8ebf2;font-weight:600;flex-shrink:0;min-width:4.6em}
  .pm-controls{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
  .pm-hint{font-size:14px;color:#7d8496}
  .pm-icon{width:14px;height:14px}
  .pm-i11{width:1.05em;height:1.05em;vertical-align:-.12em}
  `
  el.appendChild(style)

  const wrap = document.createElement('div')
  wrap.className = 'pm-wrap'
  const cardsHtml = CARDS.map((c) => `
    <div class="pm-card" data-id="${c.id}">
      <div class="pm-ch"><div class="nm">${c.name}</div><div class="tg">${c.tag}</div></div>
      <div class="pm-bar"><i data-bar="${c.id}"></i></div>
      <div class="pm-steps">${c.steps.map((s, i) => `
        <div class="pm-step" data-step="${c.id}-${i}">
          <svg class="dot" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/></svg>
          <span>${s}</span>
        </div>`).join('')}
      </div>
      <div class="pm-badge" data-badge="${c.id}"></div>
      <div class="pm-more" data-more="${c.id}">
        <svg class="pm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></svg>
        工具／權限／記憶在哪
      </div>
      <div class="pm-spec" data-spec="${c.id}">
        <div class="r"><b>工具</b><span>${c.spec.tool}</span></div>
        <div class="r"><b>權限</b><span>${c.spec.perm}</span></div>
        <div class="r"><b>記憶</b><span>${c.spec.mem}</span></div>
      </div>
    </div>`).join('')

  wrap.innerHTML = `
    <div class="pm-lead">同一顆大腦（LLM），裝進<b>不同的身體</b>：能碰的工具、能寫的權限、記不記得住，全都不一樣。</div>
    <div class="pm-task">
      <span class="pm-hint">同一句任務：</span>
      <span class="q"><b>「${TASK}」</b></span>
    </div>
    <div class="pm-grid">${cardsHtml}</div>
    <div class="pm-controls">
      <button class="demo-btn primary" id="pm-run">派任務</button>
      <button class="demo-btn" id="pm-reset">重置</button>
      <span class="pm-hint">按下後四張卡同時跑，各自在能力邊界處停下。點每張卡看規格。</span>
    </div>
  `
  el.appendChild(wrap)

  const rafs = new Set()
  const timers = new Set()
  const setT = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }

  const okIcon = '<svg class="icon pm-i11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>'
  const stopIcon = '<svg class="icon pm-i11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6"/><path d="M9 9l6 6"/></svg>'
  const memIcon = '<svg class="icon pm-i11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 5v14"/><path d="M12 9h4"/><path d="M12 13h4"/></svg>'

  let running = false
  function reset() {
    running = false
    CARDS.forEach((c) => {
      wrap.querySelector(`[data-bar="${c.id}"]`).style.width = '0'
      wrap.querySelector(`[data-bar="${c.id}"]`).style.background = accent
      const card = wrap.querySelector(`.pm-card[data-id="${c.id}"]`)
      card.className = 'pm-card'
      const badge = wrap.querySelector(`[data-badge="${c.id}"]`)
      badge.className = 'pm-badge'; badge.innerHTML = ''
      c.steps.forEach((_, i) => wrap.querySelector(`[data-step="${c.id}-${i}"]`).classList.remove('on'))
    })
    wrap.querySelector('#pm-run').disabled = false
  }

  function run() {
    if (running) return
    reset()
    running = true
    wrap.querySelector('#pm-run').disabled = true
    const t0 = performance.now()
    const DUR = 2000
    const revealed = {}
    CARDS.forEach((c) => { revealed[c.id] = -1 })

    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / DUR)
      let allStopped = true
      CARDS.forEach((c) => {
        const cur = Math.min(p, c.stop)
        if (p < c.stop) allStopped = false
        const bar = wrap.querySelector(`[data-bar="${c.id}"]`)
        bar.style.width = (cur / (c.stop || 1)) * 100 + '%'
        const total = c.steps.length
        const shouldShow = Math.floor((cur / c.stop) * total + 0.0001)
        while (revealed[c.id] < shouldShow - 1 && revealed[c.id] < total - 1) {
          revealed[c.id]++
          const st = wrap.querySelector(`[data-step="${c.id}-${revealed[c.id]}"]`)
          if (st) st.classList.add('on')
        }
        if (cur >= c.stop && !c.__done) {
          c.__done = true
          finishCard(c)
        }
      })
      if (p < 1 && !allStopped) { const id = requestAnimationFrame(tick); rafs.add(id) }
      else {
        rafs.clear()
        CARDS.forEach((c) => { if (!c.__done) { c.__done = true; finishCard(c) } })
        setT(() => { running = false; wrap.querySelector('#pm-run').disabled = false; CARDS.forEach((c) => { c.__done = false }) }, 100)
      }
    }
    CARDS.forEach((c) => { c.__done = false })
    const id = requestAnimationFrame(tick); rafs.add(id)
  }

  function finishCard(c) {
    // 確保所有已抵達的步驟亮起
    const upto = Math.round(c.steps.length)
    for (let i = 0; i < upto; i++) wrap.querySelector(`[data-step="${c.id}-${i}"]`).classList.add('on')
    const card = wrap.querySelector(`.pm-card[data-id="${c.id}"]`)
    const badge = wrap.querySelector(`[data-badge="${c.id}"]`)
    const bar = wrap.querySelector(`[data-bar="${c.id}"]`)
    if (c.kind === 'done' || c.kind === 'done-mem') {
      card.classList.add('done')
      bar.style.background = GREEN
      badge.className = 'pm-badge ok show'
      badge.innerHTML = (c.kind === 'done-mem' ? memIcon : okIcon) + '<span>' + c.boundary + '</span>'
    } else {
      card.classList.add(c.kind)
      bar.style.background = AMBER
      badge.className = 'pm-badge stop show'
      badge.innerHTML = stopIcon + '<span>' + c.boundary + '</span>'
    }
  }

  wrap.addEventListener('click', (e) => {
    const more = e.target.closest('.pm-more')
    if (more) {
      const spec = wrap.querySelector(`[data-spec="${more.dataset.more}"]`)
      spec.classList.toggle('show')
    }
  })
  wrap.querySelector('#pm-run').addEventListener('click', run)
  wrap.querySelector('#pm-reset').addEventListener('click', reset)

  return () => {
    rafs.forEach((id) => cancelAnimationFrame(id)); rafs.clear()
    timers.forEach((id) => clearTimeout(id)); timers.clear()
    style.remove(); wrap.remove()
  }
}
