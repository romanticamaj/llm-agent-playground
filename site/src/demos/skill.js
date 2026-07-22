// Demo：把成功的流程，變成可重複的工具（Skills）— DemoStage 導演版
// 6 拍：① 聊出一次成功的對帳流程 ② 聊天的成功只成功一次（要重打）
// ③ Hardening 把流程蒸餾成 SKILL.md 包 ④ 裝進 agent 的 Skills 插槽（含錯誤陷阱槽）
// ⑤ 一行斜線指令 /monthly-validator 自動重跑全綠 ⑥ sandbox 自由重玩。
import { createStage, pop, shake, enterFly, countUp, confettiBurst } from './_stage.js'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const GREEN = '#4ade80', RED = '#f87171', GRAY = '#6b7280'
  const ico = (d, s = 18) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
  const I = {
    up: '<path d="M12 16V5"/><path d="M7 10l5-5 5 5"/><path d="M5 19h14"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    diff: '<path d="M12 3v18"/><path d="M5 8l-2 4 2 4"/><path d="M19 8l2 4-2 4"/>',
    fix: '<path d="M14 4l6 6-9 9H5v-6z"/>',
    report: '<path d="M6 3h9l5 5v13H6z"/><path d="M14 3v6h6"/><path d="M9 13h7M9 17h5"/>',
    pkg: '<path d="M12 3l8 4v10l-8 4-8-4V7z"/><path d="M4 7l8 4 8-4"/><path d="M12 11v10"/>',
    slot: '<path d="M4 7h16v12H4z"/><path d="M4 7l3-3h10l3 3"/>',
    bot: '<rect x="5" y="8" width="14" height="11" rx="2"/><path d="M12 8V4M9 3h6"/><circle cx="9.5" cy="13" r="1"/><circle cx="14.5" cy="13" r="1"/>',
    slash: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 9l3 3-3 3"/><path d="M14 15h3"/>'
  }

  const style = document.createElement('style')
  style.id = 'sk-css'
  style.textContent = `
  .sk-stage{display:flex;gap:22px;align-items:stretch;flex-wrap:wrap;min-height:100%}
  .sk-col{flex:1;min-width:290px;display:flex;flex-direction:column;gap:11px}
  .sk-mid{flex:none;width:300px;display:flex;flex-direction:column;justify-content:center}
  .sk-htitle{font-size:13px;letter-spacing:.09em;text-transform:uppercase;color:#7d8496;display:flex;align-items:center;gap:8px}
  .sk-flow{display:flex;flex-direction:column;gap:8px;position:relative;transition:transform .5s}
  .sk-retype{display:none;align-items:center;gap:9px;font-size:13.5px;color:${RED};font-family:var(--font-mono);padding:2px 2px 6px}
  .sk-left.retyping .sk-retype{display:flex}
  .sk-retype i{width:6px;height:6px;border-radius:50%;background:${RED};animation:sk-blink 1s infinite}
  .sk-retype i:nth-child(2){animation-delay:.15s}.sk-retype i:nth-child(3){animation-delay:.3s}
  @keyframes sk-blink{0%,100%{opacity:.25}50%{opacity:1}}
  .sk-card{display:flex;align-items:center;gap:11px;padding:11px 13px;border-radius:11px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);opacity:0;transform:translateY(14px);transition:border-color .4s,background .4s}
  .sk-card.in{opacity:1;transform:none}
  .sk-card .ic{width:32px;height:32px;flex:none;border-radius:9px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.06);color:#8b91a2;transition:all .4s}
  .sk-card .tx{font-size:15.5px;color:#c3c8d4;line-height:1.4;flex:1}
  .sk-card .tx small{display:block;font-size:13px;color:#7d8496;margin-top:2px}
  .sk-card .tx b{color:${accent};font-variant-numeric:tabular-nums}
  .sk-card .ck{color:${GREEN};opacity:0;transform:scale(.5);transition:all .3s;flex:none}
  .sk-card.on{border-color:${accent}66;background:rgba(91,140,255,.08)}
  .sk-card.on .ic{background:${accent}22;color:${accent}}
  .sk-card.done{border-color:${GREEN}55}
  .sk-card.done .ic{background:${GREEN}22;color:${GREEN}}
  .sk-card.done .tx b{color:${GREEN}}
  .sk-card.done .ck{opacity:1;transform:scale(1)}
  .sk-left.retyping .sk-card{filter:grayscale(1) brightness(.7);border-color:rgba(255,255,255,.08);animation:sk-nudge 1.1s ease-in-out infinite}
  .sk-left.retyping .sk-card .ic{background:rgba(255,255,255,.05);color:${GRAY}}
  @keyframes sk-nudge{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
  .sk-flow.collapsing{transform:translateY(30px) scale(.72);opacity:0;filter:blur(3px)}
  /* SKILL.md 包 — 視覺主角 */
  .sk-pack{border-radius:16px;padding:20px 20px 18px;border:1.6px solid ${accent}77;
    background:linear-gradient(160deg,rgba(91,140,255,.14),rgba(91,140,255,.04));
    box-shadow:0 0 0 1px ${accent}22,0 18px 50px -18px ${accent}cc;cursor:grab;user-select:none;
    opacity:0;transform:scale(.9) translateY(10px);pointer-events:none;transition:opacity .5s,transform .5s}
  .sk-pack.show{opacity:1;transform:none;pointer-events:auto;animation:sk-glow 3s ease-in-out infinite}
  @keyframes sk-glow{50%{box-shadow:0 0 0 1px ${accent}44,0 22px 60px -16px ${accent}}}
  .sk-pack:active{cursor:grabbing}
  .sk-pack.drag{transform:scale(1.04) rotate(-1deg);box-shadow:0 26px 60px rgba(0,0,0,.6)}
  .sk-pack .ph{display:flex;align-items:center;gap:10px;font-size:20px;font-weight:700;color:#eef1f8;margin-bottom:13px;font-family:var(--font-mono)}
  .sk-pack .ph svg{color:${accent}}
  .sk-pack .ln{font-size:13.5px;color:#aab0c0;line-height:1.5;font-family:var(--font-mono);margin-top:6px;display:flex;gap:7px}
  .sk-pack .ln b{color:#e8ebf2;font-weight:600;flex:none;min-width:34px}
  .sk-packcap{font-size:12px;color:${accent};letter-spacing:.14em;text-transform:uppercase;text-align:center;margin-top:12px;font-family:var(--font-mono);opacity:.85}
  /* agent 面板 */
  .sk-agent{border-radius:14px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.02);padding:16px;display:flex;flex-direction:column;gap:13px;
    opacity:0;transform:translateX(34px);pointer-events:none;transition:opacity .5s,transform .5s;flex:1}
  .sk-agent.show{opacity:1;transform:none;pointer-events:auto}
  .sk-agent .ah{display:flex;align-items:center;gap:10px;font-size:16px;color:#e8ebf2;font-weight:600}
  .sk-agent .ah svg{color:${accent}}
  .sk-slots{display:flex;flex-direction:column;gap:11px}
  .sk-slot{border-radius:11px;border:1.6px dashed rgba(255,255,255,.18);padding:13px;display:flex;align-items:center;gap:11px;min-height:56px;transition:all .25s;cursor:pointer}
  .sk-slot .sl-ic{color:#7d8496;flex:none}
  .sk-slot .sl-tx{font-size:14.5px;color:#8b91a2;line-height:1.4}
  .sk-slot .sl-tx b{color:#c3c8d4}
  .sk-slot.hover{border-color:${accent};background:${accent}12}
  .sk-slot.wrong.hover{border-color:${RED};background:${RED}12}
  .sk-slot.filled{border-style:solid;border-color:${GREEN}88;background:${GREEN}10;cursor:default;box-shadow:0 0 0 1px ${GREEN}33,0 0 22px -6px ${GREEN}}
  .sk-slot.filled .sl-ic{color:${GREEN}}
  .sk-slash{position:relative;margin-top:2px}
  .sk-slashbtn{font-family:var(--font-mono);font-size:14px;color:#c3c8d4;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);border-radius:9px;padding:9px 14px;cursor:pointer;display:inline-flex;align-items:center;gap:8px;transition:all .2s}
  .sk-slashbtn:hover{border-color:${accent};color:#e8ebf2}
  .sk-slashbtn svg{color:${accent}}
  .sk-menu{position:absolute;left:0;top:calc(100% + 7px);z-index:20;min-width:244px;border-radius:11px;border:1px solid rgba(255,255,255,.14);background:#12141c;box-shadow:0 16px 46px rgba(0,0,0,.6);padding:6px;display:none}
  .sk-menu.show{display:block;animation:sk-pop .2s ease-out}
  @keyframes sk-pop{from{transform:translateY(-6px) scale(.96);opacity:0}to{transform:none;opacity:1}}
  .sk-menu .mh{font-size:12px;color:#7d8496;padding:6px 9px 4px;letter-spacing:.06em}
  .sk-cmd{display:flex;align-items:center;gap:9px;padding:10px;border-radius:8px;cursor:pointer;font-family:var(--font-mono);font-size:14.5px;color:#eef1f8}
  .sk-cmd:hover{background:${accent}1e}
  .sk-cmd svg{color:${accent}}
  .sk-cmd small{color:#7d8496;font-family:var(--font-tc);font-size:12.5px;margin-left:auto}
  .sk-empty{font-size:13px;color:${RED};padding:9px 10px;line-height:1.5}
  .sk-controls{display:none;gap:10px;flex-wrap:wrap;align-items:center;margin-top:14px}
  .sk-controls.show{display:flex}
  .sk-controls .demo-btn{font-size:14px}
  `

  const stage = createStage(el, ctx, { beats: buildBeats() })
  document.head.appendChild(style)

  stage.body.innerHTML = `
    <div class="sk-stage">
      <div class="sk-col sk-left ds-unit">
        <div class="sk-htitle">${ico(I.report, 15)} 一次成功的月結對帳流程</div>
        <div class="sk-retype">${ico(I.up, 14)} 重打中<i></i><i></i><i></i></div>
        <div class="sk-flow" id="sk-flow"></div>
      </div>
      <div class="sk-mid ds-unit">
        <div class="sk-pack" id="sk-pack" draggable="true">
          <div class="ph">${ico(I.pkg, 22)} SKILL.md</div>
          <div class="ln"><b>輸入</b>員工自費請款表（xlsx）</div>
          <div class="ln"><b>流程</b>讀 29 列 → 比對制度 → 標紅修正</div>
          <div class="ln"><b>輸出</b>HTML 對帳報表（可列印）</div>
          <div class="sk-packcap">拖進插槽 或 點插槽安裝</div>
        </div>
      </div>
      <div class="sk-col ds-unit" style="max-width:340px">
        <div class="sk-htitle">${ico(I.bot, 15)} 你的 Agent</div>
        <div class="sk-agent" id="sk-agent">
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
            <button class="sk-slashbtn" id="sk-slash">${ico(I.slash, 16)} 輸入 /</button>
            <div class="sk-menu" id="sk-menu"></div>
          </div>
          <div class="sk-controls" id="sk-controls">
            <button class="demo-btn" id="c-reset">重置</button>
            <button class="demo-btn primary" id="c-run">跑一次流程</button>
            <button class="demo-btn" id="c-harden">Hardening 固化</button>
          </div>
        </div>
      </div>
    </div>`

  const $ = (s) => stage.body.querySelector(s)
  const flow = $('#sk-flow'), pack = $('#sk-pack'), agent = $('#sk-agent')
  const slotOk = $('#sk-slot-ok'), slotBad = $('#sk-slot-bad')
  const menu = $('#sk-menu'), leftCol = stage.body.querySelector('.sk-left')
  const controls = $('#sk-controls')

  const STEPS = [
    { ic: I.up, t: '上傳員工自費請款表', s: '你：這個月的報帳幫我對一下' },
    { ic: I.check, t: '回報 <b>0</b> 列已讀入', s: '偵測到請款、金額欄齊全', n: 29 },
    { ic: I.diff, t: '逐列比對公司報帳制度', s: '交叉核對上限、發票類型、科目' },
    { ic: I.fix, t: '標出 3 筆異常並修正', s: '2 筆超額、1 筆缺統編 → 已標紅' },
    { ic: I.report, t: '輸出 HTML 對帳報表', s: '完成，可直接列印給會計' }
  ]
  flow.innerHTML = STEPS.map(st =>
    `<div class="sk-card"><span class="ic">${ico(st.ic, 18)}</span><span class="tx">${st.t}<small>${st.s}</small></span><span class="ck">${ico(I.check, 18)}</span></div>`
  ).join('')
  const cards = [...flow.querySelectorAll('.sk-card')]

  const timers = new Set()
  const setT = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearTimers = () => { timers.forEach(clearTimeout); timers.clear() }
  let hardened = false, installed = false, busy = false

  function burstAt(node, color) {
    const br = stage.body.getBoundingClientRect(), r = node.getBoundingClientRect()
    confettiBurst(stage.body, r.left - br.left + r.width / 2, r.top - br.top + r.height / 2, color, 22)
  }

  // ---- 流程動畫 ----
  function lightFlow(fast, cb) {
    if (busy) return
    busy = true
    cards.forEach(c => c.classList.remove('on', 'done'))
    const gap = fast ? 200 : 500
    cards.forEach((c, i) => {
      setT(() => {
        c.classList.add('in', 'on')
        if (!fast) enterFly(c)
        const b = c.querySelector('.tx b')
        if (b) countUp(b, STEPS[i].n, { dur: 480, fmt: v => Math.round(v) })
      }, i * gap)
      setT(() => { c.classList.remove('on'); c.classList.add('done'); pop(c.querySelector('.ck')) }, i * gap + gap * 0.7)
    })
    setT(() => { busy = false; cb && cb() }, cards.length * gap + 160)
  }

  function showPack() {
    pack.classList.add('show'); hardened = true
    pop(pack, 1.06); setT(() => burstAt(pack, accent), 120)
  }

  function installTo(kind) {
    if (!hardened || installed) return
    if (kind === 'ok') {
      installed = true
      slotOk.classList.add('filled')
      slotOk.querySelector('.sl-tx').innerHTML = '<b>monthly-validator</b> — 已載入'
      pop(slotOk); burstAt(slotOk, GREEN)
      stage.setNarration('插槽亮起 — skill 上線了。之後打一個 <b>/</b> 就叫得到它。')
    } else {
      shake(slotBad)
      stage.setNarration('<b>放錯位置就 trigger 不到</b> — agent 只掃描 Skills 插槽，不看你的下載資料夾。')
    }
  }

  function openSlash() {
    if (installed) {
      menu.innerHTML = `<div class="mh">可用指令</div>
        <div class="sk-cmd" id="sk-cmd">${ico(I.pkg, 18)} /monthly-validator <small>重跑對帳</small></div>`
      menu.querySelector('#sk-cmd').addEventListener('click', triggerReplay)
    } else {
      menu.innerHTML = `<div class="mh">可用指令</div><div class="sk-empty">（找不到 skill — 先把 SKILL.md 裝進 Skills 插槽）</div>`
    }
    menu.classList.add('show')
  }

  function triggerReplay() {
    menu.classList.remove('show')
    stage.setNarration('觸發 <b>/monthly-validator</b> — 同一套流程一鍵自動重跑。')
    lightFlow(true, () => {
      burstAt(flow, GREEN)
      stage.setNarration('一行斜線指令就重現整段流程 — 成功從<b>只成功一次</b>，變成<b>每次都能重跑</b>。')
    })
  }

  // ---- 一次性互動綁定 ----
  slotOk.addEventListener('click', () => installTo('ok'))
  slotBad.addEventListener('click', () => installTo('bad'))
  pack.addEventListener('click', () => { if (hardened && !installed) pop(pack) })
  pack.addEventListener('dragstart', e => { pack.classList.add('drag'); if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy' })
  pack.addEventListener('dragend', () => { pack.classList.remove('drag'); slotOk.classList.remove('hover'); slotBad.classList.remove('hover') })
  ;[slotOk, slotBad].forEach(sl => {
    sl.addEventListener('dragover', e => { e.preventDefault(); if (hardened && !installed) sl.classList.add('hover') })
    sl.addEventListener('dragleave', () => sl.classList.remove('hover'))
    sl.addEventListener('drop', e => { e.preventDefault(); sl.classList.remove('hover'); installTo(sl.dataset.kind) })
  })
  $('#sk-slash').addEventListener('click', () => { menu.classList.contains('show') ? menu.classList.remove('show') : openSlash() })
  const onDoc = e => { if (!menu.contains(e.target) && e.target.closest('#sk-slash') == null) menu.classList.remove('show') }
  document.addEventListener('click', onDoc, true)

  // sandbox 控制
  $('#c-reset').addEventListener('click', fullReset)
  $('#c-run').addEventListener('click', () => lightFlow(false))
  $('#c-harden').addEventListener('click', () => { if (!hardened) { collapse(showPack) } })

  function collapse(cb) {
    cards.forEach(c => c.classList.add('in', 'done'))
    flow.classList.add('collapsing')
    setT(() => { flow.classList.remove('collapsing'); cards.forEach(c => c.classList.remove('done', 'on')); cb && cb() }, 520)
  }

  function fullReset() {
    clearTimers(); busy = false; hardened = false; installed = false
    flow.classList.remove('collapsing'); leftCol.classList.remove('retyping')
    cards.forEach(c => c.classList.remove('in', 'on', 'done'))
    pack.classList.remove('show', 'drag')
    slotOk.className = 'sk-slot'; slotOk.dataset.kind = 'ok'
    slotOk.querySelector('.sl-tx').innerHTML = '<b>Skills 插槽</b> — 放這裡才會被載入'
    slotBad.className = 'sk-slot wrong'
    menu.classList.remove('show')
    stage.setNarration('自由重玩：跑一次 → 固化 → 拖進插槽 → 打 / 重跑。')
    lightFlow(false)
  }

  // ---- beat 劇本 ----
  function buildBeats() {
    return [
      { narration: '你花了一小時，聊出<b>一次成功</b>的對帳流程。', focus: ['.sk-left'],
        enter() {
          clearTimers(); hardened = false; installed = false
          leftCol.classList.remove('retyping'); flow.classList.remove('collapsing')
          pack.classList.remove('show'); agent.classList.remove('show'); controls.classList.remove('show')
          slotOk.className = 'sk-slot'; slotBad.className = 'sk-slot wrong'
          slotOk.querySelector('.sl-tx').innerHTML = '<b>Skills 插槽</b> — 放這裡才會被載入'
          lightFlow(false)
        } },
      { narration: '但聊天的成功<b>只成功一次</b> — 明天，你要把全部 prompt 重打一遍。', focus: ['.sk-left'],
        enter() {
          clearTimers(); busy = false; flow.classList.remove('collapsing')
          cards.forEach(c => c.classList.add('in', 'done'))
          leftCol.classList.add('retyping'); shake(flow)
        },
        exit() { leftCol.classList.remove('retyping') } },
      { narration: '<b>Hardening</b>：把整段流程蒸餾成一個 SKILL.md。',
        enter() {
          clearTimers(); busy = false; leftCol.classList.remove('retyping')
          agent.classList.remove('show'); pack.classList.remove('show'); hardened = false
          cards.forEach(c => c.classList.add('in', 'done'))
          setT(() => flow.classList.add('collapsing'), 60)
          setT(() => { showPack(); stage.focus(['.sk-mid']) }, 560)
        } },
      { narration: '裝進 agent 的 <b>Skills 插槽</b> — 位置對了，才 trigger 得到。', focus: ['.sk-mid', '.sk-slots'],
        enter() {
          clearTimers(); installed = false
          flow.classList.remove('collapsing'); pack.classList.add('show'); hardened = true
          slotOk.className = 'sk-slot'; slotBad.className = 'sk-slot wrong'
          slotOk.querySelector('.sl-tx').innerHTML = '<b>Skills 插槽</b> — 放這裡才會被載入'
          agent.classList.add('show'); enterFly(agent, { y: 0 })
        } },
      { narration: '以後，<b>一行斜線指令</b>就重跑整套流程。', focus: ['.sk-left', '.sk-slash'],
        enter() {
          clearTimers(); busy = false; agent.classList.add('show'); pack.classList.add('show'); hardened = true
          cards.forEach(c => c.classList.add('in', 'done'))
          if (!installed) installTo('ok')
          setT(openSlash, 500)
        },
        exit() { menu.classList.remove('show') } },
      { narration: '換你玩 — 跑一次、固化、安裝、trigger 全開放。', sandbox: true,
        enter() {
          clearTimers(); busy = false
          agent.classList.add('show'); controls.classList.add('show')
          cards.forEach(c => c.classList.add('in'))
        } }
    ]
  }

  return () => {
    clearTimers()
    document.removeEventListener('click', onDoc, true)
    style.remove()
    stage.destroy()
  }
}
