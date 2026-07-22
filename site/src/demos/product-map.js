// Demo：同一顆大腦，不同的身體 — DemoStage 導演版
// 5 拍：同一句任務｜四張卡同時開跑｜保守兩個止步｜開放兩個跑完｜sandbox 自由派任務＋看規格。
import { createStage, pop, shake, enterFly } from './_stage.js'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const GREEN = '#4ade80', AMBER = '#fbbf24'
  const TASK = '幫我讀桌面的報表檔並整理成 HTML'

  const CARDS = [
    { id: 'web', name: 'ChatGPT／Claude 網頁版', tag: '只能聊 + web search', stop: 0.30, kind: 'wall',
      steps: ['讀懂你的任務', '想去打開桌面的檔案…', '停：碰不到你的電腦'],
      boundary: '不能碰你的電腦，只能聊天和搜尋網路。桌面的檔案它看不到。',
      spec: { tool: '只有內建的網路搜尋，沒有讀寫檔案的手', perm: '完全碰不到你的本機', mem: '關掉分頁就忘光' } },
    { id: 'cowork', name: 'Cowork', tag: '有限工具、介面漂亮', stop: 0.68, kind: 'partial',
      steps: ['讀懂你的任務', '用有限工具讀到報表', '整理內容', '停：能寫回你電腦，但工具有限'],
      boundary: '有幾樣工具、能把結果寫回你的電腦，介面漂亮好用，但能做的動作是被框住的。',
      spec: { tool: '一組精選、受控的工具', perm: '可讀、可寫到你指定的地方', mem: '單次工作階段內記得' } },
    { id: 'code', name: 'Claude Code', tag: '全工具、跑完整流程', stop: 1.0, kind: 'done',
      steps: ['讀懂你的任務', '讀取報表檔', '解析與整理', '產生 HTML', '寫檔完成'],
      boundary: '幾乎所有工具都能用，能一路把完整流程跑完並交出成品。',
      spec: { tool: '終端機、讀寫檔案、執行程式，全都有', perm: '在你的專案目錄裡放手去做', mem: '靠專案內的檔案（如 CLAUDE.md）延續' } },
    { id: 'claw', name: 'OpenClaw 龍蝦', tag: '跑完還記進常駐記憶', stop: 1.0, kind: 'done-mem',
      steps: ['讀懂你的任務', '讀取報表檔', '解析與整理', '產生 HTML', '寫檔完成', '把結果記進常駐記憶'],
      boundary: '做完 Claude Code 的全部，還多一步：把這次的結果記進自己長期常駐的記憶。',
      spec: { tool: '全套工具 + 常駐執行', perm: '長期在你環境裡運作', mem: '寫進自己的長期記憶，下次還記得' } },
  ]

  const style = document.createElement('style')
  style.textContent = `
  .pm-task{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px}
  .pm-task .hint{font-size:15.5px;color:#7d8496}
  .pm-task .q{font-size:16px;color:#c3c8d4;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);padding:8px 15px;border-radius:10px}
  .pm-task .q b{color:#e8ebf2}
  .pm-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px}
  @media (max-width:900px){.pm-grid{grid-template-columns:repeat(2,1fr)}}
  .pm-card{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(255,255,255,.02);display:flex;flex-direction:column;overflow:hidden;transition:border-color .2s}
  .pm-card.done{border-color:rgba(74,222,128,.4)}
  .pm-card.wall,.pm-card.partial{border-color:rgba(251,191,36,.38)}
  .pm-ch{padding:13px 15px 10px}
  .pm-ch .nm{font-size:16px;font-weight:600;color:#eef1f7;line-height:1.35}
  .pm-ch .tg{font-size:15px;color:#828a9c;margin-top:3px}
  .pm-bar{height:7px;background:rgba(255,255,255,.06);border-radius:99px;margin:4px 15px;overflow:hidden}
  .pm-bar i{display:block;height:100%;width:0;border-radius:99px;transition:width .1s linear}
  .pm-steps{padding:8px 15px 4px;display:flex;flex-direction:column;gap:5px;flex:1}
  .pm-step{font-size:15.5px;color:#5f6577;display:flex;align-items:flex-start;gap:7px;line-height:1.4;opacity:.35;transition:opacity .25s,color .25s}
  .pm-step.on{opacity:1;color:#c3c8d4}
  .pm-step .dot{width:14px;height:14px;flex-shrink:0;margin-top:2px}
  .pm-badge{margin:6px 15px 12px;font-size:15.5px;font-weight:600;padding:7px 11px;border-radius:9px;display:none;align-items:flex-start;gap:7px;line-height:1.45}
  .pm-badge.show{display:flex}
  .pm-badge.stop{color:${AMBER};background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.32)}
  .pm-badge.ok{color:${GREEN};background:rgba(74,222,128,.12);border:1px solid rgba(74,222,128,.32)}
  .pm-badge .icon{flex-shrink:0;margin-top:1px}
  .pm-more{margin:0 15px 12px;font-size:15px;color:#8b91a2;cursor:pointer;user-select:none;display:inline-flex;align-items:center;gap:5px}
  .pm-more:hover{color:#c3c8d4}
  .pm-spec{margin:0 15px 12px;display:none;flex-direction:column;gap:6px;border-top:1px dashed rgba(255,255,255,.14);padding-top:10px}
  .pm-spec.show{display:flex}
  .pm-spec .r{font-size:15px;line-height:1.45;color:#aeb4c2;display:flex;gap:7px}
  .pm-spec .r b{color:#e8ebf2;font-weight:600;flex-shrink:0;min-width:4.6em}
  .pm-controls{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
  .pm-btn{font-family:var(--font-tc);font-size:15.5px;color:var(--text);background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:999px;padding:9px 18px;cursor:pointer;transition:all .2s}
  .pm-btn:hover{border-color:var(--text)}
  .pm-btn.primary{background:var(--accent);color:#08090a;border-color:var(--accent);font-weight:600}
  .pm-btn.hide{display:none}
  .pm-icon{width:14px;height:14px}
  .pm-i11{width:1.05em;height:1.05em;vertical-align:-.12em}
  `
  el.appendChild(style)

  const task = document.createElement('div')
  task.className = 'pm-task ds-unit'
  task.innerHTML = `<span class="hint">同一句任務：</span><span class="q"><b>「${TASK}」</b></span>`

  const grid = document.createElement('div')
  grid.className = 'pm-grid ds-unit'
  grid.innerHTML = CARDS.map(c => `
    <div class="pm-card ds-unit" data-id="${c.id}">
      <div class="pm-ch"><div class="nm">${c.name}</div><div class="tg">${c.tag}</div></div>
      <div class="pm-bar"><i data-bar="${c.id}"></i></div>
      <div class="pm-steps">${c.steps.map((s, i) => `
        <div class="pm-step" data-step="${c.id}-${i}">
          <svg class="dot" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/></svg>
          <span>${s}</span></div>`).join('')}
      </div>
      <div class="pm-badge" data-badge="${c.id}"></div>
      <div class="pm-more" data-more="${c.id}">
        <svg class="pm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></svg>
        工具／權限／記憶在哪</div>
      <div class="pm-spec" data-spec="${c.id}">
        <div class="r"><b>工具</b><span>${c.spec.tool}</span></div>
        <div class="r"><b>權限</b><span>${c.spec.perm}</span></div>
        <div class="r"><b>記憶</b><span>${c.spec.mem}</span></div>
      </div>
    </div>`).join('')

  const controls = document.createElement('div')
  controls.className = 'pm-controls ds-unit'
  controls.innerHTML = `
    <button class="pm-btn primary hide" data-b="run">派任務</button>
    <button class="pm-btn hide" data-b="reset">重置</button>`

  const $ = s => grid.querySelector(s)
  const btn = b => controls.querySelector(`[data-b="${b}"]`)

  const okIcon = '<svg class="icon pm-i11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>'
  const stopIcon = '<svg class="icon pm-i11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6"/><path d="M9 9l6 6"/></svg>'
  const memIcon = '<svg class="icon pm-i11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 5v14"/><path d="M12 9h4"/><path d="M12 13h4"/></svg>'

  const rafs = new Set()
  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearAll = () => { rafs.forEach(cancelAnimationFrame); rafs.clear(); timers.forEach(clearTimeout); timers.clear() }

  let running = false, interactive = false, stage

  function clearCards() {
    CARDS.forEach(c => {
      const bar = $(`[data-bar="${c.id}"]`); bar.style.width = '0'; bar.style.background = accent
      $(`.pm-card[data-id="${c.id}"]`).className = 'pm-card ds-unit'
      const badge = $(`[data-badge="${c.id}"]`); badge.className = 'pm-badge'; badge.innerHTML = ''
      $(`[data-spec="${c.id}"]`).classList.remove('show')
      c.steps.forEach((_, i) => $(`[data-step="${c.id}-${i}"]`).classList.remove('on'))
      c.__done = false
    })
  }

  function finishCard(c) {
    for (let i = 0; i < c.steps.length; i++) $(`[data-step="${c.id}-${i}"]`).classList.add('on')
    const card = $(`.pm-card[data-id="${c.id}"]`), badge = $(`[data-badge="${c.id}"]`), bar = $(`[data-bar="${c.id}"]`)
    if (c.kind === 'done' || c.kind === 'done-mem') {
      card.classList.add('done'); bar.style.background = GREEN; badge.className = 'pm-badge ok show'
      badge.innerHTML = (c.kind === 'done-mem' ? memIcon : okIcon) + '<span>' + c.boundary + '</span>'
    } else {
      card.classList.add(c.kind); bar.style.background = AMBER; badge.className = 'pm-badge stop show'
      badge.innerHTML = stopIcon + '<span>' + c.boundary + '</span>'
      shake(card)
    }
    pop(badge)
  }

  function finishAllInstant() {
    CARDS.forEach(c => {
      const bar = $(`[data-bar="${c.id}"]`); bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth; bar.style.transition = ''
      if (!c.__done) { c.__done = true; finishCard(c) }
    })
    running = false
  }

  function run() {
    if (running) return
    clearCards(); running = true
    if (interactive) btn('run').disabled = true
    const t0 = performance.now(), DUR = 2000
    const revealed = {}; CARDS.forEach(c => { revealed[c.id] = -1 })
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / DUR)
      let allStopped = true
      CARDS.forEach(c => {
        const cur = Math.min(p, c.stop)
        if (p < c.stop) allStopped = false
        $(`[data-bar="${c.id}"]`).style.width = (cur / (c.stop || 1)) * 100 + '%'
        const shouldShow = Math.floor((cur / c.stop) * c.steps.length + 0.0001)
        while (revealed[c.id] < shouldShow - 1 && revealed[c.id] < c.steps.length - 1) {
          revealed[c.id]++; $(`[data-step="${c.id}-${revealed[c.id]}"]`)?.classList.add('on')
        }
        if (cur >= c.stop && !c.__done) { c.__done = true; finishCard(c) }
      })
      if (p < 1 && !allStopped) { const id = requestAnimationFrame(tick); rafs.add(id) }
      else {
        rafs.clear()
        CARDS.forEach(c => { if (!c.__done) { c.__done = true; finishCard(c) } })
        T(() => { running = false; if (interactive) btn('run').disabled = false }, 100)
      }
    }
    const id = requestAnimationFrame(tick); rafs.add(id)
  }

  grid.addEventListener('click', e => {
    const more = e.target.closest('.pm-more'); if (!more) return
    $(`[data-spec="${more.dataset.more}"]`).classList.toggle('show')
  })
  btn('run').onclick = () => { pop(btn('run')); run() }
  btn('reset').onclick = () => { pop(btn('reset')); clearAll(); clearCards() }

  function showBtns(list) { controls.querySelectorAll('.pm-btn').forEach(b => b.classList.toggle('hide', !list.includes(b.dataset.b))) }

  function resetScene() {
    clearAll(); running = false; interactive = false
    clearCards(); showBtns([])
  }
  function startSandboxRun() {
    resetScene(); interactive = true
    showBtns(['run', 'reset'])
    CARDS.forEach((c, i) => enterFly($(`.pm-card[data-id="${c.id}"]`), { y: 18, dur: 460, delay: i * 80 }))
  }

  function buildBeats() {
    return [
      { narration: '同一句任務，交給四個產品 — 背後可能是<b>同一顆大腦</b>（同一個模型）。', focus: ['.pm-task', '.pm-grid'], nextLabel: '派下去 →',
        enter() { resetScene() } },

      { narration: '按下去，四張卡<b>同時開跑</b> — 各自在能力邊界處停下。', focus: ['.pm-grid'], nextLabel: '誰止步了？ →',
        enter() { resetScene(); T(() => run(), 400) } },

      { narration: '最保守的兩個：網頁版<b>碰不到你的電腦</b>、Cowork 能寫回檔案但<b>工具受限</b>。', focus: ['.pm-card[data-id="web"]', '.pm-card[data-id="cowork"]'], nextLabel: '那開放的呢？ →',
        enter() { finishAllInstant() } },

      { narration: '最開放的兩個：Claude Code <b>全工具跑完整流程</b>；龍蝦跑完還<b>記進常駐記憶</b>。', focus: ['.pm-card[data-id="code"]', '.pm-card[data-id="claw"]'], nextLabel: '換我派任務 →',
        enter() { finishAllInstant() } },

      { narration: '差別不在腦子 — 在<b>身體多大、能碰你多少東西</b>。換你派任務，點開每張卡的工具／權限／記憶。', sandbox: true,
        enter() { startSandboxRun() } },
    ]
  }

  stage = createStage(el, ctx, { beats: buildBeats() })
  stage.body.append(task, grid, controls)

  return () => { clearAll(); stage.destroy(); style.remove() }
}
