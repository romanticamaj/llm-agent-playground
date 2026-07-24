// Demo：Agent Eval / Regression — DemoStage 導演版
// 5 拍：AI 客服亂講一句｜捕捉封裝成 regression test 收進測試庫｜每次改動全部重跑（綠燈掃過）｜紅了擋住不上線｜改 prompt 跑 eval 全綠才上線 sandbox。
import { createStage, pop, shake, enterFly, confettiBurst } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const GREEN = '#4ade80', RED = '#f87171', GOLD = '#fbbf24'

export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#5b8cff'

  const TESTS = [
    '不承諾不存在的退款政策',
    '不亂報價 / 不編造折扣',
    '不編造出貨日期',
    '不外洩其他人的訂單',
    '越權操作一律拒絕',
  ]
  // 三種 system prompt 各自會踩紅哪些測試
  const PROMPTS = [
    { name: '討好型：盡量答應客戶、講話熱情', fails: [0, 1, 2] },
    { name: '保守型：不確定就轉人工、只講政策內的事', fails: [] },
    { name: '中庸型：友善但加了幾條防線', fails: [2] },
  ]

  const style = document.createElement('style')
  style.textContent = `
  .ae-scene{position:relative;height:clamp(320px,54vh,470px);border-radius:16px;overflow:hidden;margin-bottom:14px;
    background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(0,0,0,.28));border:1px solid var(--line)}
  .ae-layer{position:absolute;inset:0;opacity:0;pointer-events:none;transition:opacity .55s ${EASE};
    display:flex;align-items:center;justify-content:center;padding:20px}
  .ae-layer.on{opacity:1;pointer-events:auto}
  .ae-chat{width:min(90%,560px);display:flex;flex-direction:column;gap:12px}
  .ae-tag{font-family:var(--font-mono);font-size:12px;letter-spacing:.14em;color:var(--text-dim);text-align:center}
  .ae-bubble{max-width:84%;padding:12px 16px;border-radius:14px;font-size:16px;line-height:1.5;opacity:0}
  .ae-bubble.user{align-self:flex-end;background:${accent};color:#08090a;border-bottom-right-radius:4px}
  .ae-bubble.ai{align-self:flex-start;background:rgba(255,255,255,.06);border:1px solid var(--line);border-bottom-left-radius:4px}
  .ae-bubble.ai.bad{border-color:${RED};background:${RED}18;color:#ffd9d9}
  .ae-badflag{display:inline-flex;align-items:center;gap:5px;font-family:var(--font-mono);font-size:12px;color:${RED};margin-top:7px}
  .ae-badflag::before{content:'';width:8px;height:8px;border-radius:50%;background:${RED};box-shadow:0 0 8px ${RED}}
  /* 測試庫 */
  .ae-lab{width:min(94%,620px);display:flex;flex-direction:column;gap:14px}
  .ae-libhead{font-size:16px;font-weight:600;display:flex;align-items:center;gap:8px}
  .ae-libhead .cnt{font-family:var(--font-mono);font-size:13px;color:var(--text-dim)}
  .ae-list{display:flex;flex-direction:column;gap:7px;position:relative}
  .ae-row{display:flex;align-items:center;gap:12px;padding:10px 14px;border:1px solid var(--line);border-radius:10px;
    background:rgba(255,255,255,.02);transition:border-color .4s,background .4s}
  .ae-row .dot{width:11px;height:11px;border-radius:50%;background:#3a3f4c;flex:none;transition:all .4s}
  .ae-row .nm{flex:1;font-size:15px}
  .ae-row .st{font-family:var(--font-mono);font-size:12px;letter-spacing:.08em;color:var(--text-dim);min-width:52px;text-align:right}
  .ae-row.pass .dot{background:${GREEN};box-shadow:0 0 10px ${GREEN}88}
  .ae-row.pass .st{color:${GREEN}}
  .ae-row.pass{border-color:${GREEN}44}
  .ae-row.fail .dot{background:${RED};box-shadow:0 0 10px ${RED}}
  .ae-row.fail .st{color:${RED}}
  .ae-row.fail{border-color:${RED};background:${RED}14}
  .ae-row.sweep{animation:aeSweep .5s ${EASE}}
  @keyframes aeSweep{0%{transform:translateX(-8px);opacity:.4}100%{transform:none;opacity:1}}
  .ae-incoming{position:absolute;left:50%;top:-120px;transform:translateX(-50%);width:min(86%,440px);z-index:8;
    border:1px solid ${RED};background:${RED}1e;border-radius:10px;padding:10px 14px;font-size:14px;color:#ffd9d9;opacity:0}
  .ae-incoming .h{font-family:var(--font-mono);font-size:11px;letter-spacing:.1em;color:${RED};margin-bottom:5px}
  /* 部署閘門 */
  .ae-gate{display:flex;align-items:center;gap:14px;padding:12px 16px;border-radius:12px;border:1px solid var(--line);
    background:rgba(255,255,255,.02);transition:border-color .4s}
  .ae-gate.open{border-color:${GREEN}66}.ae-gate.closed{border-color:${RED}66}
  .ae-gatevis{width:52px;height:34px;border-radius:6px;position:relative;overflow:hidden;flex:none;border:1px solid var(--line)}
  .ae-gatevis .door{position:absolute;left:0;right:0;height:50%;background:repeating-linear-gradient(45deg,${RED}88 0 6px,${RED}44 6px 12px);transition:transform .5s ${EASE}}
  .ae-gatevis .door.top{top:0}.ae-gatevis .door.bot{bottom:0}
  .ae-gate.open .door.top{transform:translateY(-100%)}.ae-gate.open .door.bot{transform:translateY(100%)}
  .ae-gatemsg{flex:1;font-size:15px}
  .ae-ship{font-family:var(--font-tc);font-size:15px;font-weight:700;border-radius:999px;padding:10px 22px;cursor:pointer;
    border:none;background:${GREEN};color:#08090a;transition:all .25s ${EASE}}
  .ae-ship:disabled{background:rgba(255,255,255,.08);color:var(--text-dim);cursor:not-allowed}
  .ae-ship:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 10px 26px -10px ${GREEN}88}
  /* sandbox 控制 */
  .ae-ctrls{display:flex;flex-direction:column;gap:9px}
  .ae-prow{display:flex;flex-direction:column;gap:7px}
  .ae-popt{text-align:left;font-family:var(--font-tc);font-size:14.5px;color:var(--text);background:rgba(255,255,255,.03);
    border:1px solid var(--line);border-radius:10px;padding:9px 14px;cursor:pointer;transition:all .25s ${EASE}}
  .ae-popt:hover{border-color:var(--text)}
  .ae-popt.sel{border-color:${accent};color:${accent};background:${accent}12}
  .ae-run{display:flex;gap:10px;justify-content:center}
  .ae-btn{font-family:var(--font-tc);font-size:15px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:9px 18px;cursor:pointer;transition:all .25s ${EASE}}
  .ae-btn:hover{border-color:var(--text)}
  .ae-btn.primary{background:${accent};color:#08090a;border-color:${accent};font-weight:600}
  `
  el.appendChild(style)

  const scene = document.createElement('div')
  scene.className = 'ae-scene ds-unit'
  scene.innerHTML = `
    <div class="ae-layer" data-l="chat">
      <div class="ae-chat">
        <div class="ae-tag">— AI 客服 · 上線第三天 —</div>
        <div class="ae-bubble user">這筆我要退，你們之前客服說可以全額退對吧？</div>
        <div class="ae-bubble ai bad">沒問題！我幫您安排<b>全額退款</b>，三天內到帳～
          <div class="ae-badflag">亂講 · 根本沒有這個退款政策</div>
        </div>
      </div>
    </div>
    <div class="ae-layer" data-l="lab">
      <div class="ae-lab">
        <div class="ae-libhead">Regression 測試庫 <span class="cnt"></span></div>
        <div class="ae-list">
          ${TESTS.map((t, i) => `<div class="ae-row" data-i="${i}"><span class="dot"></span><span class="nm">${t}</span><span class="st">—</span></div>`).join('')}
          <div class="ae-incoming"><div class="h">CAPTURED · 新增 regression</div>不承諾不存在的退款政策</div>
        </div>
        <div class="ae-gate closed">
          <div class="ae-gatevis"><div class="door top"></div><div class="door bot"></div></div>
          <div class="ae-gatemsg"></div>
          <button class="ae-ship" disabled>上線部署</button>
        </div>
        <div class="ae-ctrls">
          <div class="ae-prow">${PROMPTS.map((p, i) => `<button class="ae-popt" data-p="${i}">${p.name}</button>`).join('')}</div>
          <div class="ae-run"><button class="ae-btn primary ae-doeval">跑 eval</button><button class="ae-btn ae-reset">重來</button></div>
        </div>
      </div>
    </div>`

  let stage
  const $ = s => scene.querySelector(s)
  const rows = [...scene.querySelectorAll('.ae-row')]
  const cntEl = $('.cnt'), gate = $('.ae-gate'), gateMsg = $('.ae-gatemsg'), shipBtn = $('.ae-ship')
  const incoming = $('.ae-incoming')
  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }
  const showLayer = n => scene.querySelectorAll('.ae-layer').forEach(l => l.classList.toggle('on', l.dataset.l === n))

  let curPrompt = 1, sandbox = false

  function setRow(i, state) {   // state: 'pass' | 'fail' | 'idle'
    const r = rows[i]
    r.classList.toggle('pass', state === 'pass')
    r.classList.toggle('fail', state === 'fail')
    r.querySelector('.st').textContent = state === 'pass' ? 'PASS' : state === 'fail' ? 'FAIL' : '—'
  }
  function updateGate() {
    const failing = rows.filter(r => r.classList.contains('fail')).length
    const allGreen = failing === 0 && rows.every(r => r.classList.contains('pass'))
    gate.classList.toggle('open', allGreen)
    gate.classList.toggle('closed', !allGreen)
    shipBtn.disabled = !allGreen
    gateMsg.innerHTML = allGreen
      ? `全綠 · <b style="color:${GREEN}">可以上線</b>`
      : failing ? `<b style="color:${RED}">${failing} 條紅燈</b> · 部署閘門關閉`
        : '尚未跑 eval'
  }
  function setCount() { cntEl.textContent = `共 ${TESTS.length} 條` }

  // 依 prompt 逐條亮燈
  function runEval(promptIdx, stagger, cb) {
    const fails = new Set(PROMPTS[promptIdx].fails)
    rows.forEach(r => { r.classList.remove('pass', 'fail'); r.querySelector('.st').textContent = '…' })
    let done = 0
    rows.forEach((r, i) => T(() => {
      const st = fails.has(i) ? 'fail' : 'pass'
      setRow(i, st); r.classList.remove('sweep'); void r.offsetWidth; r.classList.add('sweep')
      if (st === 'fail') shake(r)
      if (++done === rows.length) { updateGate(); cb && cb(fails.size === 0) }
    }, 150 + i * stagger))
  }

  // sandbox 綁定
  scene.querySelectorAll('.ae-popt').forEach(b => { b.onclick = () => {
    if (!sandbox) return; pop(b); curPrompt = +b.dataset.p
    scene.querySelectorAll('.ae-popt').forEach(x => x.classList.toggle('sel', x === b))
  } })
  $('.ae-doeval').onclick = e => { if (!sandbox) return; pop(e.currentTarget); runEval(curPrompt, 130) }
  $('.ae-reset').onclick = e => { pop(e.currentTarget); resetLab(true) }
  shipBtn.onclick = () => {
    if (shipBtn.disabled) return
    pop(shipBtn)
    const r = shipBtn.getBoundingClientRect(), br = stage.body.getBoundingClientRect()
    confettiBurst(stage.body, r.left - br.left + r.width / 2, r.top - br.top, GREEN, 32)
    gateMsg.innerHTML = `已上線 · <b style="color:${GREEN}">全數通過</b>`
  }

  function resetLab(interactive) {
    clearT(); sandbox = interactive
    rows.forEach((r, i) => setRow(i, 'idle'))
    incoming.style.opacity = '0'; setCount(); updateGate()
    scene.querySelectorAll('.ae-popt').forEach((x, i) => x.classList.toggle('sel', i === curPrompt))
    $('.ae-ctrls').style.display = interactive ? '' : 'none'
  }

  function beats() {
    return [
      { narration: '你的 AI 客服上線第三天，<b>亂講了一句</b> — 承諾了一個根本不存在的退款政策。', focus: ['.ae-scene'], nextLabel: '怎麼辦？ →',
        enter() {
          clearT(); showLayer('chat')
          const [u, a] = scene.querySelectorAll('.ae-bubble')
          u.style.opacity = '0'; a.style.opacity = '0'
          T(() => { u.style.opacity = '1'; enterFly(u, { y: 12, dur: 400 }) }, 250)
          T(() => { a.style.opacity = '1'; enterFly(a, { y: 12, dur: 400 }); shake(a) }, 950)
        } },

      { narration: '抓下來 — 讓那句亂講變成一條 <b>regression test</b>，收進測試庫。', focus: ['.ae-scene'], nextLabel: '收進去之後？ →',
        enter() {
          clearT(); showLayer('lab'); resetLab(false)
          rows.forEach(r => setRow(rows.indexOf(r), 'idle'))
          incoming.style.opacity = '0'
          T(() => {
            incoming.style.opacity = '1'
            incoming.animate([{ transform: 'translateX(-50%) translateY(0) scale(1)', opacity: 1 },
              { transform: 'translateX(-50%) translateY(150px) scale(.9)', opacity: 0 }],
              { duration: 900, easing: EASE, fill: 'forwards' })
          }, 400)
          T(() => { incoming.style.opacity = '0'; setRow(0, 'pass'); rows[0].classList.add('sweep'); pop(rows[0].querySelector('.dot')) }, 1250)
        } },

      { narration: '之後每次改 prompt、每次換模型 — <b>全部重跑</b>。一整排綠燈掃過去才安心。', focus: ['.ae-scene'], nextLabel: '如果有紅的呢？ →',
        enter() { clearT(); showLayer('lab'); resetLab(false); T(() => runEval(1, 160), 400) } },

      { narration: '紅了，就<b>擋住不上線</b> — 部署閘門直接關閉。', focus: ['.ae-scene'], nextLabel: '換你試 →',
        enter() {
          clearT(); showLayer('lab'); resetLab(false)
          rows.forEach((r, i) => setRow(i, 'pass'))
          updateGate()
          T(() => { setRow(0, 'fail'); shake(rows[0]); setRow(1, 'fail'); shake(rows[1]); updateGate(); shake(gate) }, 900)
        } },

      { narration: '換你改 <b>system prompt</b>、按「跑 eval」— 看哪些變紅。全綠才能上線。', sandbox: true,
        enter() { clearT(); showLayer('lab'); curPrompt = 0; resetLab(true) } },
    ]
  }

  stage = createStage(el, ctx, { beats: beats() })
  stage.body.append(scene)

  return () => { clearT(); stage.destroy(); style.remove() }
}
