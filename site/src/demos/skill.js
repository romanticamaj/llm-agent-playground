// Demo：把成功流程變成 Skill
// 核心互動：跑一次成功的聊天流程 → Hardening 蒸餾成 SKILL.md 包 →
// 把 skill 裝進 agent 的 Skills 插槽，斜線選單彈出 /monthly-validator 自動快速重跑；
// 啊哈：裝進「錯誤位置」槽 → 選單找不到、抖動提示「放錯位置就 trigger 不到」。

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const GREEN = '#4ade80', RED = '#f87171'
  const ico = (d, s = 18) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
  const I = {
    up: '<path d="M12 16V5"/><path d="M7 10l5-5 5 5"/><path d="M5 19h14"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    diff: '<path d="M12 3v18"/><path d="M5 8l-2 4 2 4"/><path d="M19 8l2 4-2 4"/>',
    fix: '<path d="M14 4l6 6-9 9H5v-6z"/>',
    report: '<path d="M6 3h9l5 5v13H6z"/><path d="M14 3v6h6"/><path d="M9 13h7M9 17h5"/>',
    pkg: '<path d="M12 3l8 4v10l-8 4-8-4V7z"/><path d="M4 7l8 4 8-4"/><path d="M12 11v10"/>',
    slot: '<path d="M4 7h16v12H4z"/><path d="M4 7l3-3h10l3 3"/>',
    bot: '<rect x="5" y="8" width="14" height="11" rx="2"/><path d="M12 8V4M9 3h6"/><circle cx="9.5" cy="13" r="1"/><circle cx="14.5" cy="13" r="1"/>'
  }

  const style = document.createElement('style')
  style.textContent = `
  .sk-wrap{position:absolute;inset:0;display:flex;flex-direction:column;gap:14px;padding:20px 28px;box-sizing:border-box;font-family:var(--font-tc,'Noto Sans TC',sans-serif);overflow:auto}
  .sk-lead{font-size:17px;color:#9aa0b0;line-height:1.55}
  .sk-lead b{color:#e8ebf2;font-weight:600}
  .sk-stage{display:flex;gap:20px;align-items:stretch;flex-wrap:wrap}
  .sk-col{flex:1;min-width:300px;display:flex;flex-direction:column;gap:10px}
  .sk-htitle{font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:#7d8496;display:flex;align-items:center;gap:8px}
  .sk-flow{display:flex;flex-direction:column;gap:8px;position:relative}
  .sk-card{display:flex;align-items:center;gap:11px;padding:11px 13px;border-radius:11px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);transition:all .4s;opacity:.42}
  .sk-card .ic{width:32px;height:32px;flex:none;border-radius:9px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.06);color:#8b91a2;transition:all .4s}
  .sk-card .tx{font-size:15.5px;color:#c3c8d4;line-height:1.4}
  .sk-card .tx small{display:block;font-size:13px;color:#7d8496;margin-top:2px}
  .sk-card.on{opacity:1;border-color:${accent}66;background:rgba(91,140,255,.08)}
  .sk-card.on .ic{background:${accent}22;color:${accent}}
  .sk-card.done{opacity:1;border-color:${GREEN}55}
  .sk-card.done .ic{background:${GREEN}22;color:${GREEN}}
  .sk-flow.collapsing .sk-card{transform:translateY(var(--dy,0)) scale(.9);opacity:0}
  .sk-pkg{margin-top:4px;border-radius:12px;border:1px dashed ${accent}77;background:rgba(91,140,255,.07);padding:13px 15px;display:none;cursor:grab;user-select:none;transition:transform .2s,box-shadow .2s}
  .sk-pkg.show{display:block;animation:sk-pop .5s cubic-bezier(.2,.8,.2,1)}
  .sk-pkg:active{cursor:grabbing}
  .sk-pkg.drag{box-shadow:0 8px 30px rgba(0,0,0,.5);transform:scale(1.03)}
  @keyframes sk-pop{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}
  .sk-pkg .ph{display:flex;align-items:center;gap:9px;font-size:16px;color:#e8ebf2;font-weight:600;margin-bottom:8px}
  .sk-pkg .ph svg{color:${accent}}
  .sk-pkg .ln{font-size:13.5px;color:#9aa0b0;line-height:1.55;font-family:var(--font-mono,'JetBrains Mono',monospace)}
  .sk-pkg .ln b{color:#c3c8d4;font-weight:600}
  .sk-agent{border-radius:14px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.02);padding:16px;display:flex;flex-direction:column;gap:13px;min-height:100%}
  .sk-agent .ah{display:flex;align-items:center;gap:10px;font-size:16px;color:#e8ebf2;font-weight:600}
  .sk-agent .ah svg{color:${accent}}
  .sk-slots{display:flex;flex-direction:column;gap:11px}
  .sk-slot{border-radius:11px;border:1.6px dashed rgba(255,255,255,.18);padding:13px;display:flex;align-items:center;gap:11px;min-height:54px;transition:all .25s;cursor:pointer}
  .sk-slot .sl-ic{color:#7d8496;flex:none}
  .sk-slot .sl-tx{font-size:14.5px;color:#8b91a2}
  .sk-slot .sl-tx b{color:#c3c8d4}
  .sk-slot.hover{border-color:${accent};background:${accent}10}
  .sk-slot.wrong.hover{border-color:${RED};background:${RED}10}
  .sk-slot.filled{border-style:solid;border-color:${GREEN}66;background:${GREEN}0d;cursor:default}
  .sk-slot.filled .sl-ic{color:${GREEN}}
  .sk-slot.shake{animation:sk-shake .45s}
  @keyframes sk-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(3px)}}
  .sk-slash{position:relative}
  .sk-menu{position:absolute;left:0;top:calc(100% + 6px);z-index:20;min-width:240px;border-radius:11px;border:1px solid rgba(255,255,255,.14);background:#12141c;box-shadow:0 14px 40px rgba(0,0,0,.55);padding:6px;display:none}
  .sk-menu.show{display:block;animation:sk-pop .22s ease-out}
  .sk-menu .mh{font-size:12.5px;color:#7d8496;padding:6px 9px 4px;letter-spacing:.06em}
  .sk-cmd{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:8px;cursor:pointer;font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:14.5px;color:#e8ebf2}
  .sk-cmd:hover{background:${accent}1c}
  .sk-cmd svg{color:${accent}}
  .sk-cmd small{color:#7d8496;font-family:var(--font-tc,'Noto Sans TC',sans-serif);font-size:12.5px;margin-left:auto}
  .sk-empty{font-size:13.5px;color:${RED};padding:9px 10px;line-height:1.5}
  .sk-controls{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:2px}
  .sk-note{font-size:14.5px;color:#7d8496;margin-left:auto;max-width:54%;text-align:right;line-height:1.5}
  .sk-note.hot{color:${accent}}
  .sk-note.bad{color:${RED}}
  .sk-btn-slash{font-family:var(--font-mono,'JetBrains Mono',monospace)}
  `
  el.appendChild(style)

  const wrap = document.createElement('div')
  wrap.className = 'sk-wrap'
  wrap.innerHTML = `
    <div class="sk-lead">一段跑通的流程只做一次太浪費。把它<b>固化（Hardening）</b>成一個 Skill 包，之後用一行斜線指令就能重跑。試試看：<b>跑一次 → 固化 → 裝進插槽</b>。</div>
    <div class="sk-stage">
      <div class="sk-col">
        <div class="sk-htitle">${ico(I.report, 16)} 一次成功的月結對帳流程</div>
        <div class="sk-flow" id="sk-flow"></div>
        <div class="sk-pkg" id="sk-pkg" draggable="true">
          <div class="ph">${ico(I.pkg, 20)} SKILL.md</div>
          <div class="ln"><b>輸入</b>：員工自費請款表（xlsx）</div>
          <div class="ln"><b>流程</b>：讀 29 列 → 比對制度 → 標紅修正</div>
          <div class="ln"><b>輸出</b>：HTML 對帳報表（可列印）</div>
        </div>
      </div>
      <div class="sk-col">
        <div class="sk-htitle">${ico(I.bot, 16)} 你的 Agent</div>
        <div class="sk-agent">
          <div class="ah">${ico(I.bot, 22)} monthly-agent</div>
          <div class="sk-slots">
            <div class="sk-slot" id="sk-slot-ok" data-kind="ok">
              <span class="sl-ic">${ico(I.slot, 22)}</span>
              <span class="sl-tx"><b>Skills 插槽</b> — 放這裡才會被載入</span>
            </div>
            <div class="sk-slot wrong" id="sk-slot-bad" data-kind="bad">
              <span class="sl-ic">${ico(I.slot, 22)}</span>
              <span class="sl-tx">下載資料夾 <b>（錯誤位置）</b></span>
            </div>
          </div>
          <div class="sk-slash">
            <button class="demo-btn sk-btn-slash" id="sk-slash">輸入 /</button>
            <div class="sk-menu" id="sk-menu"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="sk-controls">
      <button class="demo-btn primary" id="sk-run">跑一次</button>
      <button class="demo-btn" id="sk-harden" disabled>Hardening 固化</button>
      <button class="demo-btn" id="sk-reset">重來</button>
      <span class="sk-note" id="sk-note">先按「跑一次」看流程逐步完成。</span>
    </div>
  `
  el.appendChild(wrap)

  const $ = (s) => wrap.querySelector(s)
  const flow = $('#sk-flow'), pkg = $('#sk-pkg'), note = $('#sk-note')
  const menu = $('#sk-menu'), slotOk = $('#sk-slot-ok'), slotBad = $('#sk-slot-bad')
  const btnRun = $('#sk-run'), btnHarden = $('#sk-harden')

  const timers = new Set()
  const setT = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }

  const STEPS = [
    { ic: I.up, t: '上傳員工自費請款表', s: '你：這個月的報帳幫我對一下' },
    { ic: I.check, t: 'AI 讀入並回報 29 列', s: '偵測到 29 筆請款、金額欄齊全' },
    { ic: I.diff, t: '逐列比對公司報帳制度', s: '交叉核對上限、發票類型、科目' },
    { ic: I.fix, t: '標出 3 筆異常並修正', s: '2 筆超額、1 筆缺統編 → 已標紅' },
    { ic: I.report, t: '輸出 HTML 對帳報表', s: '完成，可直接列印給會計' }
  ]

  function buildFlow() {
    flow.className = 'sk-flow'
    flow.innerHTML = ''
    STEPS.forEach((st) => {
      const c = document.createElement('div')
      c.className = 'sk-card'
      c.innerHTML = `<span class="ic">${ico(st.ic, 18)}</span><span class="tx">${st.t}<small>${st.s}</small></span>`
      flow.appendChild(c)
    })
  }

  let hardened = false, installed = false, busy = false

  function runFlow(fast, done) {
    if (busy) return
    busy = true
    const cards = [...flow.querySelectorAll('.sk-card')]
    cards.forEach((c) => c.classList.remove('on', 'done'))
    const gap = fast ? 260 : 620
    cards.forEach((c, i) => {
      setT(() => { c.classList.add('on') }, i * gap)
      setT(() => { c.classList.remove('on'); c.classList.add('done') }, i * gap + gap * 0.72)
    })
    setT(() => { busy = false; done && done() }, cards.length * gap + 200)
  }

  btnRun.addEventListener('click', () => {
    note.textContent = '流程執行中…卡片逐步亮起代表每一步完成。'
    note.className = 'sk-note hot'
    runFlow(false, () => {
      note.textContent = '跑通了。這麼好的流程只做一次太可惜 → 按「Hardening 固化」封裝成 Skill。'
      note.className = 'sk-note'
      btnHarden.disabled = false
      btnRun.disabled = true
    })
  })

  btnHarden.addEventListener('click', () => {
    if (busy) return
    busy = true
    btnHarden.disabled = true
    note.textContent = '蒸餾中：把整段對話壓成一個 SKILL.md 包（只留輸入 / 流程 / 輸出）。'
    note.className = 'sk-note hot'
    const cards = [...flow.querySelectorAll('.sk-card')]
    const h = flow.getBoundingClientRect().height
    cards.forEach((c, i) => { c.style.setProperty('--dy', (h * 0.5 - i * 40) + 'px') })
    setT(() => flow.classList.add('collapsing'), 60)
    setT(() => {
      pkg.classList.add('show')
      hardened = true; busy = false
      note.textContent = '得到 SKILL.md 包。把它拖進右邊 Agent 的插槽（或點它自動安裝）。'
      note.className = 'sk-note'
    }, 720)
  })

  // ---- 安裝：拖放 或 點擊 ----
  function tryInstall(kind) {
    if (!hardened || installed) return
    if (kind === 'ok') {
      installed = true
      slotOk.classList.add('filled')
      slotOk.querySelector('.sl-tx').innerHTML = '<b>monthly-validator</b> — 已載入'
      note.textContent = '安裝成功。現在按「輸入 /」叫出斜線選單。'
      note.className = 'sk-note hot'
    } else {
      slotBad.classList.add('shake')
      setT(() => slotBad.classList.remove('shake'), 500)
      note.textContent = 'skill 放錯位置就 trigger 不到 — agent 只掃描 Skills 插槽，不會掃你的下載資料夾。'
      note.className = 'sk-note bad'
    }
  }

  slotOk.addEventListener('click', () => tryInstall('ok'))
  slotBad.addEventListener('click', () => tryInstall('bad'))

  pkg.addEventListener('dragstart', (e) => { pkg.classList.add('drag'); if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy' })
  pkg.addEventListener('dragend', () => { pkg.classList.remove('drag'); slotOk.classList.remove('hover'); slotBad.classList.remove('hover') })
  ;[slotOk, slotBad].forEach((sl) => {
    sl.addEventListener('dragover', (e) => { e.preventDefault(); sl.classList.add('hover') })
    sl.addEventListener('dragleave', () => sl.classList.remove('hover'))
    sl.addEventListener('drop', (e) => { e.preventDefault(); sl.classList.remove('hover'); tryInstall(sl.dataset.kind) })
  })

  // ---- 斜線選單 ----
  $('#sk-slash').addEventListener('click', () => {
    if (menu.classList.contains('show')) { menu.classList.remove('show'); return }
    if (installed) {
      menu.innerHTML = `<div class="mh">可用指令</div>
        <div class="sk-cmd" id="sk-cmd">${ico(I.pkg, 18)} /monthly-validator <small>重跑對帳</small></div>`
      menu.querySelector('#sk-cmd').addEventListener('click', () => {
        menu.classList.remove('show')
        note.textContent = '觸發 /monthly-validator — 同一套流程被快速重跑一遍。'
        note.className = 'sk-note hot'
        buildFlow()
        runFlow(true, () => {
          note.textContent = '一行指令就重現了整段流程。這就是 Skill 的價值：把成功變成可複用的能力。'
          note.className = 'sk-note'
        })
      })
    } else {
      menu.innerHTML = `<div class="mh">可用指令</div><div class="sk-empty">（沒有可用的 skill，先把 SKILL.md 裝進 Skills 插槽）</div>`
    }
    menu.classList.add('show')
  })
  const onDoc = (e) => { if (!menu.contains(e.target) && e.target.id !== 'sk-slash') menu.classList.remove('show') }
  document.addEventListener('click', onDoc, true)

  $('#sk-reset').addEventListener('click', () => {
    timers.forEach((id) => clearTimeout(id)); timers.clear()
    hardened = installed = busy = false
    pkg.classList.remove('show', 'drag')
    slotOk.className = 'sk-slot'; slotOk.dataset.kind = 'ok'
    slotOk.querySelector('.sl-tx').innerHTML = '<b>Skills 插槽</b> — 放這裡才會被載入'
    slotBad.className = 'sk-slot wrong'
    menu.classList.remove('show')
    btnRun.disabled = false; btnHarden.disabled = true
    note.textContent = '先按「跑一次」看流程逐步完成。'
    note.className = 'sk-note'
    buildFlow()
  })

  buildFlow()

  return () => {
    timers.forEach((id) => clearTimeout(id)); timers.clear()
    document.removeEventListener('click', onDoc, true)
    style.remove(); wrap.remove()
  }
}
