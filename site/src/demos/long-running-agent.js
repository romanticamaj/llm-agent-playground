// Long-running Agent — session 接力賽
// 核心互動：完成 10 個 feature。One-shot 硬跑會在 context（RAM）燒完時倒地、留半成品爛攤子並觸發失敗模式；
// 接力模式先由 Initializer 把計畫落地到 Disk，之後每棒讀日誌→做一個→E2E→commit→寫日誌→交棒。
// 隨時「Kill session」：接力模式下砍掉沒差，下一棒讀日誌照樣接手 —— 每個 session 都是 disposable。

export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#5b8cff'
  const GREEN = '#4ade80'
  const RED = '#f87171'
  const TOTAL = 10

  // 內嵌手繪 SVG icon（幾何極簡線條）
  const ico = (d, s = 22) => `<svg class="lr-ico" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
  const P_RUNNER = '<circle cx="14" cy="5" r="2"/><path d="M14 7.5l-1.5 4.5M14 9l3 1.5M12.5 9.5l-2.5 2M12.5 12l1.5 5M12.5 12l-2.5 3 1 3"/>'
  const P_STAND = '<circle cx="12" cy="5" r="2"/><path d="M12 7.5v6.5M12 14l-2.5 5M12 14l2.5 5M12 9l-3 2M12 9l3 2"/>'
  const P_GEAR = '<circle cx="12" cy="12" r="3.2"/><path d="M12 3.5v2.5M12 18v2.5M20.5 12H18M6 12H3.5M17.7 6.3l-1.8 1.8M8.1 15.9l-1.8 1.8M17.7 17.7l-1.8-1.8M8.1 8.1L6.3 6.3"/>'
  const P_FIRE = '<path d="M12 3c3 3 4 5.5 4 8a4 4 0 0 1-8 0c0-1.5.6-2.7 1.5-3.7C9.7 8.8 12 7 12 3z"/><path d="M12 21a4 4 0 0 1-2.2-7.3"/>'
  const P_FLAG = '<path d="M6 3v18"/><path d="M6 4h11l-2 3 2 3H6"/>'
  const P_SKULL = '<path d="M6 17.2A8 8 0 1 1 18 17.2V19a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><path d="M12 15v2M10 20v-2M14 20v-2"/>'
  const P_BATT = '<rect x="3" y="8" width="16" height="8" rx="2"/><path d="M21 11v2"/><path d="M6 11v2"/>'
  const P_TROPHY = '<path d="M7 4h10v3a5 5 0 0 1-10 0z"/><path d="M7 6H4.5a2.5 2.5 0 0 0 3 2.6M17 6h2.5a2.5 2.5 0 0 1-3 2.6"/><path d="M12 12v4M10 20h4M10 16h4l.6 4H9.4z"/>'
  const P_SPEECH = '<path d="M4 5h16v11H9l-4 4v-4H4z"/>'
  const P_PUZZLE = '<path d="M10 4a1.6 1.6 0 0 1 3.2 0c0 .5.4.9.9.9H16v2.9c0 .5.4.9.9.9a1.6 1.6 0 0 1 0 3.2c-.5 0-.9.4-.9.9V19h-2.9c-.5 0-.9-.4-.9-.9a1.6 1.6 0 0 0-3.2 0c0 .5-.4.9-.9.9H5v-3.1c0-.5-.4-.9-.9-.9a1.6 1.6 0 0 1 0-3.2c.5 0 .9-.4.9-.9V5h3.1c.5 0 .9-.4.9-.9z"/>'
  const P_LOG = '<ellipse cx="7" cy="12" rx="2.5" ry="4"/><path d="M7 8h9a2.5 4 0 0 1 0 8H7"/><path d="M16 9.5a2 2.5 0 0 0 0 5"/>'
  const P_WRENCH = '<path d="M15.5 4a4 4 0 0 0-5 5L4 15.5 8.5 20l6.5-6.5a4 4 0 0 0 5-5l-2.8 2.8-2.2-.5-.5-2.2z"/>'
  const P_FILE = '<path d="M6 3h7l5 5v13H6z"/><path d="M13 3v5h5"/>'
  const P_QUESTION = '<path d="M9 9a3 3 0 1 1 4 2.8c-.8.5-1 1-1 2"/><path d="M12 17h.01"/>'

  const style = document.createElement('style')
  style.textContent = `
    .lr-root{position:absolute;inset:0;display:flex;flex-direction:column;gap:12px;padding:20px;box-sizing:border-box;color:#e6e9f2;font-family:'Noto Sans TC',sans-serif;overflow:auto}
    .lr-ico{vertical-align:-.2em;flex:none}
    .lr-guide{font-size:17px;color:#c3c8d8;line-height:1.6}
    .lr-guide b{color:${accent}}
    .lr-body{flex:1;display:grid;grid-template-columns:1fr 220px;gap:16px;min-height:0}
    .lr-main{display:flex;flex-direction:column;gap:12px;min-height:0}
    .lr-runnerbox{background:#101319;border:1px solid #232838;border-radius:10px;padding:12px 14px}
    .lr-runnerhead{display:flex;justify-content:space-between;align-items:center;font-size:15px;color:#9aa0b0;margin-bottom:6px}
    .lr-runnerhead .who{color:#e6e9f2;font-weight:600;display:inline-flex;align-items:center;gap:7px}
    .lr-ram{height:16px;border-radius:8px;background:#0c0f16;overflow:hidden}
    .lr-ram>span{display:block;height:100%;width:100%;background:${GREEN};transition:width .45s ease,background .3s}
    .lr-runner-emoji{display:inline-flex;align-items:center;color:${accent}}
    .lr-track{position:relative;display:grid;grid-template-columns:repeat(${TOTAL},1fr);gap:6px;background:#101319;border:1px solid #232838;border-radius:10px;padding:14px 12px}
    .lr-cell{position:relative;height:48px;border-radius:8px;background:#161b26;border:1px solid #262c3c;display:flex;align-items:center;justify-content:center;font-size:13px;color:#6b7186;flex-direction:column;gap:2px}
    .lr-cell.active{border-color:${accent};box-shadow:0 0 0 1px ${accent} inset}
    .lr-cell.done{background:#132318;border-color:${GREEN};color:#bff0d0}
    .lr-cell.done .stamp{color:${GREEN};font-weight:700}
    .lr-cell.broken{background:#241417;border-color:${RED};color:#f2b8b8}
    .lr-cell .fnum{font-family:'Space Grotesk';font-size:12px}
    .lr-marker{position:absolute;top:-14px;color:${accent};transition:left .45s ease;transform:translateX(-50%);display:flex}
    .lr-debris{display:flex;gap:8px;flex-wrap:wrap;min-height:26px;font-size:15px;align-items:center;color:#8b90a2}
    .lr-dialog{background:#1a1420;border:1px solid #4a2a3a;border-radius:10px;padding:10px 12px;font-size:15px;color:#f0c0d0;display:none;animation:lr-in .3s ease;line-height:1.5}
    .lr-dialog .lr-ico{color:#f0c0d0}
    .lr-dialog.show{display:block}
    .lr-side{background:#0e1119;border:1px solid #232838;border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:10px}
    .lr-side h4{margin:0;font-size:15px;color:#9aa0b0}
    .lr-mem{display:flex;flex-direction:column;gap:6px}
    .lr-memrow{display:flex;justify-content:space-between;font-size:14px;background:#141824;border:1px solid #242a3a;border-radius:7px;padding:6px 9px}
    .lr-memrow b{color:${accent}}
    .lr-disk{display:flex;flex-direction:column;gap:6px}
    .lr-file{font-size:14px;font-family:'Space Grotesk',monospace;background:#141824;border:1px solid #242a3a;border-radius:7px;padding:7px 9px;color:#8b90a2;transition:.2s}
    .lr-file .fv{color:#c3c8d8;display:block;margin-top:2px;font-size:13px}
    .lr-file.flash{border-color:${accent};color:#e6e9f2;box-shadow:0 0 14px -4px ${accent}}
    .lr-file.empty{opacity:.4}
    .lr-ctrls{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
    .lr-ctrls .demo-btn{font-size:16.5px;display:inline-flex;align-items:center;gap:7px}
    .lr-note{font-size:15px;color:#8b90a2;flex:1;min-width:180px;line-height:1.5}
    @keyframes lr-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
    @keyframes lr-fall{to{transform:translateY(10px) rotate(80deg);opacity:.3}}
  `
  el.appendChild(style)

  const root = document.createElement('div')
  root.className = 'lr-root'
  let cells = ''
  for (let i = 0; i < TOTAL; i++) cells += `<div class="lr-cell" data-i="${i}"><span class="fnum">#${i + 1}</span><span class="stamp"></span></div>`
  root.innerHTML = `
    <div class="lr-guide">目標：完成 <b>${TOTAL} 個 feature</b>。比一比 <b>One-shot 硬跑</b>（一個 session 撐到 context 燒完）和 <b>接力模式</b>（無限 session 接力）。跑到一半按 <b>Kill session</b> 看兩種模式差多少。</div>
    <div class="lr-body">
      <div class="lr-main">
        <div class="lr-runnerbox">
          <div class="lr-runnerhead"><span class="who"><span class="lr-runner-emoji">${ico(P_STAND, 22)}</span> 待命中</span><span class="ram-lbl">context (RAM) 100%</span></div>
          <div class="lr-ram"><span class="lr-rambar"></span></div>
        </div>
        <div class="lr-track"><div class="lr-marker" style="left:5%">${ico(P_RUNNER, 22)}</div>${cells}</div>
        <div class="lr-debris"></div>
        <div class="lr-dialog"></div>
      </div>
      <div class="lr-side">
        <h4>Context = RAM</h4>
        <div class="lr-mem"><div class="lr-memrow"><span>目前 runner 的工作記憶</span><b class="lr-ramnum">100%</b></div><div style="font-size:13px;color:#6b7186">session 結束就清空 — disposable</div></div>
        <h4 style="margin-top:4px">Filesystem = Disk（落地才不會消失）</h4>
        <div class="lr-disk">
          <div class="lr-file empty" data-f="list">feature-list.json<span class="fv">— 尚未建立</span></div>
          <div class="lr-file empty" data-f="log">claude-progress.txt<span class="fv">— 尚未建立</span></div>
          <div class="lr-file empty" data-f="git">git log<span class="fv">— 尚未 commit</span></div>
        </div>
      </div>
    </div>
    <div class="lr-ctrls">
      <button class="demo-btn act-oneshot">${ico(P_FIRE, 17)} One-shot 硬跑</button>
      <button class="demo-btn primary act-relay">${ico(P_FLAG, 17)} 接力模式</button>
      <button class="demo-btn act-kill">${ico(P_SKULL, 17)} Kill session</button>
      <button class="demo-btn act-reset">↺ 重置</button>
      <span class="lr-note"></span>
    </div>
  `
  el.appendChild(root)

  const $ = s => root.querySelector(s)
  const $$ = s => Array.from(root.querySelectorAll(s))
  const rambar = $('.lr-rambar'), ramLbl = $('.ram-lbl'), ramNum = $('.lr-ramnum')
  const who = $('.who'), marker = $('.lr-marker'), debris = $('.lr-debris'), dialog = $('.lr-dialog')
  const note = $('.lr-note')
  const cellEls = $$('.lr-cell')

  const timers = new Set()
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearTimers = () => { timers.forEach(clearTimeout); timers.clear() }

  let st
  function reset() {
    clearTimers()
    st = { mode: null, done: 0, ram: 100, runner: 0, gen: 0, running: false }
    setRam(100); who.innerHTML = `<span class="lr-runner-emoji">${ico(P_STAND, 22)}</span> 待命中`
    marker.style.left = '5%'; debris.innerHTML = ''; dialog.className = 'lr-dialog'
    cellEls.forEach(c => { c.className = 'lr-cell'; c.querySelector('.stamp').textContent = '' })
    setFile('list', '— 尚未建立', true); setFile('log', '— 尚未建立', true); setFile('git', '— 尚未 commit', true)
    note.textContent = '選一個模式開始。'
  }

  function setRam(v) {
    st.ram = Math.max(0, Math.min(100, v))
    rambar.style.width = st.ram + '%'
    rambar.style.background = st.ram < 25 ? RED : (st.ram < 55 ? '#e0b050' : GREEN)
    ramLbl.textContent = 'context (RAM) ' + Math.round(st.ram) + '%'
    ramNum.textContent = Math.round(st.ram) + '%'
  }
  function setFile(f, txt, empty, flash) {
    const e = $(`.lr-file[data-f="${f}"]`)
    e.querySelector('.fv').textContent = txt
    e.classList.toggle('empty', !!empty)
    if (flash) { e.classList.add('flash'); later(() => e.classList.remove('flash'), 600) }
  }
  function markerTo(i) { marker.style.left = ((i + 0.5) / TOTAL * 100) + '%' }
  function activate(i) { cellEls.forEach(c => c.classList.remove('active')); if (cellEls[i]) cellEls[i].classList.add('active'); markerTo(i) }
  function completeCell(i) { const c = cellEls[i]; c.classList.remove('active'); c.classList.add('done'); c.querySelector('.stamp').textContent = '✓可merge' }

  // ---------- One-shot ----------
  function oneShot() {
    if (st.running) return
    reset(); st.mode = 'oneshot'; st.running = true
    who.innerHTML = `<span class="lr-runner-emoji">${ico(P_RUNNER, 22)}</span> Session 1（一口氣做完全部）`
    note.innerHTML = 'One-shot：一個 session 想 <b>one-shot 整個 app</b>，context 邊做邊燒…'
    const gen = st.gen
    stepOneShot(0, gen)
  }
  function stepOneShot(i, gen) {
    if (gen !== st.gen || !st.running) return
    if (i >= TOTAL) { win(); return }
    activate(i); setRam(st.ram - 26)
    later(() => {
      if (gen !== st.gen) return
      if (st.ram <= 0) { collapse(i, gen); return }
      completeCell(i); st.done = i + 1
      later(() => stepOneShot(i + 1, gen), 350)
    }, 620)
  }
  function collapse(i, gen) {
    who.innerHTML = `<span class="lr-runner-emoji" style="color:${RED}">${ico(P_BATT, 22)}</span> Session 1 倒地（context 燒完）`
    cellEls[i].classList.add('broken')
    // 半成品碎片
    debris.innerHTML = '半成品爛攤子：'
    ;[P_PUZZLE, P_LOG, P_WRENCH, P_FILE, P_QUESTION].forEach((p, k) => { const s = document.createElement('span'); s.className = 'lr-frag'; s.innerHTML = ico(p, 20); s.style.animation = `lr-fall .6s ${k * 0.08}s ease forwards`; debris.appendChild(s) })
    note.innerHTML = `<span style="color:${RED}">Session 1 在 feature #${i + 1} context 燒完倒下，沒東西落地到 disk。</span>`
    later(() => { if (gen === st.gen) nextSessionSeesMess(gen) }, 1000)
  }
  function nextSessionSeesMess(gen) {
    who.innerHTML = `<span class="lr-runner-emoji">${ico(P_STAND, 22)}</span> Session 2 接手一個爛攤子`
    setRam(100)
    const fails = [
      '看起來差不多了，宣布完成！（其實只做了幾個 feature 就提早下班）',
      'unit test 過了，標記 done ✓（但 E2E 根本是壞的）',
      '前面好像有進度，那我也不用重做了 → 直接 close。',
    ]
    const f = fails[Math.floor(Math.random() * fails.length)]
    dialog.className = 'lr-dialog show'
    dialog.innerHTML = ico(P_SPEECH, 16) + ' Session 2：「' + f + '」'
    if (f.includes('E2E')) cellEls.forEach((c, k) => { if (c.classList.contains('done')) { c.classList.remove('done'); c.classList.add('broken'); c.querySelector('.stamp').textContent = 'E2E✗' } })
    note.innerHTML = `<span style="color:${RED}">失敗模式：沒有交班紀錄，下一棒重建 context 還理解錯。這就是 one-shot 的下場。</span>`
    st.running = false
  }

  // ---------- Relay ----------
  function relay() {
    if (st.running) return
    reset(); st.mode = 'relay'; st.running = true
    const gen = st.gen
    who.innerHTML = `<span class="lr-runner-emoji">${ico(P_GEAR, 22)}</span> Initializer 建環境`
    note.innerHTML = 'Initializer：把計畫和軌道落地到 <b>Disk</b>（agent 會偷改 markdown，所以 checklist 用 JSON）。'
    later(() => { if (gen !== st.gen) return; setFile('list', `10 features · JSON`, false, true) }, 400)
    later(() => { if (gen !== st.gen) return; setFile('log', '（空白，待第一棒）', false, true) }, 800)
    later(() => { if (gen !== st.gen) return; setFile('git', 'initial commit', false, true) }, 1200)
    later(() => { if (gen === st.gen) runnerEnters(gen) }, 1700)
  }

  function runnerEnters(gen) {
    if (gen !== st.gen || !st.running) return
    if (st.done >= TOTAL) { win(); return }
    st.runner++
    const n = st.runner, fi = st.done
    setRam(100)
    who.innerHTML = `<span class="lr-runner-emoji">${ico(P_RUNNER, 22)}</span> Runner ${n}（乾淨的一棒）`
    activate(fi)
    const seq = [
      () => { note.innerHTML = `Runner ${n}：<b>讀交班日誌</b> → 知道做到 #${fi} 了。`; setFile('log', `讀取：已完成 ${fi}/${TOTAL}`, false, true) },
      () => { note.textContent = `Runner ${n}：挑一個 feature（只做 #${fi + 1}） → 跑 smoke test`; setRam(78) },
      () => { note.textContent = `Runner ${n}：實作 feature #${fi + 1}…`; setRam(52) },
      () => { note.innerHTML = `Runner ${n}：<b style="color:${GREEN}">E2E 綠燈</b>（不是只跑 unit test）`; setRam(40) },
      () => { note.textContent = `Runner ${n}：git commit`; setFile('git', `commit: feat #${fi + 1}`, false, true) },
      () => {
        completeCell(fi); st.done = fi + 1
        setFile('log', `更新：已完成 ${st.done}/${TOTAL}`, false, true)
        note.innerHTML = `Runner ${n}：寫交班日誌 → 這一棒結束時 code 是<b style="color:${GREEN}">可 merge</b> 的，交棒 ${ico(P_FLAG, 15)}`
      },
    ]
    runSeq(seq, 0, gen, () => later(() => runnerEnters(gen), 500))
  }

  function runSeq(seq, i, gen, done) {
    if (gen !== st.gen || !st.running) return
    if (i >= seq.length) { done(); return }
    seq[i]()
    later(() => runSeq(seq, i + 1, gen, done), 700)
  }

  function kill() {
    if (!st.running || !st.mode) { note.textContent = '目前沒有正在跑的 session。'; return }
    st.gen++ // 讓所有排程中的 callback 失效
    clearTimers()
    if (st.mode === 'oneshot') {
      who.innerHTML = `<span class="lr-runner-emoji" style="color:${RED}">${ico(P_SKULL, 22)}</span> Session 被砍 — 全部消失`
      debris.innerHTML = '沒落地的東西全丟了：'
      ;[P_PUZZLE, P_LOG, P_FILE].forEach(p => { const s = document.createElement('span'); s.className = 'lr-frag'; s.innerHTML = ico(p, 20); debris.appendChild(s) })
      note.innerHTML = `<span style="color:${RED}">One-shot 下 Kill = 大災難：context 只在 RAM，砍掉就歸零。</span>`
      st.running = false
    } else {
      // 接力模式：這棒死了，下一棒讀日誌照樣接手
      cellEls.forEach(c => c.classList.remove('active'))
      who.innerHTML = `<span class="lr-runner-emoji" style="color:${RED}">${ico(P_SKULL, 22)}</span> 這一棒被砍…`
      note.innerHTML = `<span style="color:${GREEN}">接力模式砍掉完全沒差 — 進度在 disk（已完成 ${st.done}/${TOTAL}），下一棒讀日誌接手。</span>`
      const gen = st.gen
      later(() => { if (gen === st.gen && st.running) runnerEnters(gen) }, 900)
    }
  }

  function win() {
    st.running = false
    cellEls.forEach(c => c.classList.remove('active'))
    who.innerHTML = `<span class="lr-runner-emoji" style="color:${GREEN}">${ico(P_TROPHY, 22)}</span> 10/10 完成`
    note.innerHTML = st.mode === 'relay'
      ? `<b style="color:${GREEN}">接力賽完成：</b>無限 session 一棒接一棒，交接零成本，每棒都可 merge。`
      : `完成！但這只有在 context 沒燒完時才可能 — 真實大專案幾乎撐不到。`
  }

  const onOne = () => oneShot(), onRelay = () => relay(), onKill = () => kill(), onReset = () => reset()
  $('.act-oneshot').addEventListener('click', onOne)
  $('.act-relay').addEventListener('click', onRelay)
  $('.act-kill').addEventListener('click', onKill)
  $('.act-reset').addEventListener('click', onReset)

  reset()

  return () => {
    clearTimers()
    $('.act-oneshot').removeEventListener('click', onOne)
    $('.act-relay').removeEventListener('click', onRelay)
    $('.act-kill').removeEventListener('click', onKill)
    $('.act-reset').removeEventListener('click', onReset)
    style.remove(); root.remove()
  }
}
