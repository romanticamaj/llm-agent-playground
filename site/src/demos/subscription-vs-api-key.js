// subscription-vs-api-key — DemoStage 導演版
// 6 拍：兩個錢包｜人在現場吃訂閱｜第三方 agent 撞訂閱被拒（高潮）｜換 API key：燒錢 vs Gmail 不計費｜側門被封鎖｜sandbox。
// 核心對比：訂閱＝固定額度／給人用；API key＝按量扣款／給程式用；繞道是漏洞不是架構。
import { createStage, pop, shake, enterFly, countUp, confettiBurst } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const GREEN = '#4ade80', RED = '#f87171', GOLD = '#fbbf24'
const START_BAL = 50, QUOTA_MAX = 100

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const P = 'sk'

  const svg = (d, w = 20) => `<svg class="icon" viewBox="0 0 24 24" width="${w}" height="${w}" fill="none"
    stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
  const I_CARD = svg('<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 9.5h19"/><path d="M6 14.5h4.5"/>', 21)
  const I_KEY = svg('<circle cx="7.5" cy="12" r="4"/><path d="M11.5 12H21"/><path d="M17.6 12v3.4"/><path d="M20.4 12v2.4"/>', 21)
  const I_PERSON = svg('<circle cx="12" cy="8" r="3.2"/><path d="M5.8 19.4a6.2 6.2 0 0 1 12.4 0"/>', 16)
  const I_BOT = svg('<rect x="4.5" y="8" width="15" height="10.5" rx="3"/><circle cx="9.6" cy="13" r="1.1"/><circle cx="14.4" cy="13" r="1.1"/><path d="M12 8V5"/>', 16)
  const I_BAN = svg('<circle cx="12" cy="12" r="8.4"/><path d="M6.1 6.1 17.9 17.9"/>', 19)
  const I_OPEN = svg('<rect x="4.5" y="10.6" width="15" height="9.4" rx="2.2"/><path d="M8.2 10.6V7.9a3.8 3.8 0 0 1 7.2-1.7"/>', 15)
  const I_SHUT = svg('<rect x="4.5" y="10.6" width="15" height="9.4" rx="2.2"/><path d="M8.2 10.6V7.9a3.8 3.8 0 0 1 7.6 0v2.7"/>', 15)

  // wallet: 這件事「本來」該吃哪個錢包；free = API key 只是身分憑證、不計費
  const TASKS = [
    { id: 'chat', label: '我在對話框問問題', who: '人在現場', icon: I_PERSON, wallet: 'sub', quota: 20, cost: 0.05 },
    { id: 'cron', label: '排程每週自動撈信', who: '無人排程', icon: I_BOT, wallet: 'api', cost: 0.42 },
    { id: 'lobster', label: '第三方 agent 通宵跑', who: 'OpenClaw 龍蝦', icon: I_BOT, wallet: 'api', cost: 3.6, sideDoor: true },
    { id: 'gmail', label: 'Gmail 抓附件', who: '身分憑證', icon: I_BOT, wallet: 'api', cost: 0, free: true },
  ]

  const style = document.createElement('style')
  style.textContent = `
  .${P}-deck{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:16px}
  .${P}-chip{font-family:var(--font-tc);text-align:left;display:flex;flex-direction:column;gap:2px;
    background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:12px;padding:9px 15px;
    color:var(--text);cursor:default;transition:all .25s ${EASE}}
  .${P}-chip .t{font-size:16px;display:flex;align-items:center;gap:7px}
  .${P}-chip .w{font-size:13px;color:var(--text-dim);letter-spacing:.05em;padding-left:23px}
  .${P}-deck.live .${P}-chip{cursor:pointer}
  .${P}-deck.live .${P}-chip:hover{border-color:var(--text);transform:translateY(-2px)}
  .${P}-chip.sel{border-color:var(--accent);background:${accent}1f;box-shadow:0 0 0 1px var(--accent)}
  .${P}-wallets{display:flex;gap:20px;align-items:stretch;flex-wrap:wrap;margin-bottom:14px}
  .${P}-wallet{flex:1;min-width:300px;position:relative;border:1px solid var(--line);border-radius:16px;padding:16px 18px 14px;
    background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(0,0,0,.22));transition:all .3s ${EASE}}
  .${P}-wallet h4{margin:0;font-size:19px;font-weight:600;display:flex;align-items:center;gap:9px}
  .${P}-wallet .who{margin-left:auto;font-size:13.5px;font-weight:400;color:var(--text-dim);
    border:1px solid var(--line);border-radius:999px;padding:3px 10px}
  .${P}-wallet .sub{font-size:14.5px;color:var(--text-dim);margin:6px 0 12px;font-family:var(--font-mono)}
  .${P}-wallet.sub h4{color:${accent}}.${P}-wallet.api h4{color:${GOLD}}
  .${P}-wallet.armed{cursor:pointer;border-color:var(--accent)}
  .${P}-wallet.armed:hover{transform:translateY(-3px);box-shadow:0 16px 40px -22px ${accent}}
  .${P}-meter{height:22px;border-radius:11px;background:rgba(255,255,255,.05);border:1px solid var(--line);
    overflow:hidden;position:relative}
  .${P}-meter i{display:block;height:100%;width:0;border-radius:11px;background:linear-gradient(90deg,${accent},${accent}bb);
    transition:width .6s ${EASE}}
  .${P}-meter.full i{background:linear-gradient(90deg,${GOLD},${RED})}
  .${P}-lab{font-size:14.5px;color:var(--text-dim);margin-top:7px;display:flex;justify-content:space-between}
  .${P}-lab b{font-family:var(--font-mono);color:var(--text);font-weight:600}
  .${P}-bal{font-family:var(--font-mono);font-size:38px;font-weight:700;color:${GOLD};line-height:1.15;transition:color .3s}
  .${P}-bal.drain{color:${RED}}
  .${P}-inbox{margin-top:12px;display:flex;flex-direction:column;gap:6px;min-height:104px;
    max-height:148px;overflow-y:auto;overflow-x:hidden}
  .${P}-row{display:flex;align-items:center;gap:8px;font-size:14.5px;color:#d3d7e2;padding:6px 10px;border-radius:8px;
    background:rgba(255,255,255,.04);border:1px solid var(--line);transition:all .4s ${EASE}}
  .${P}-row .dot{width:7px;height:7px;border-radius:2px;background:${accent};flex:none}
  .${P}-row .amt{margin-left:auto;font-family:var(--font-mono);font-size:13.5px;color:var(--text-dim)}
  .${P}-row.burn .dot{background:${RED}}.${P}-row.burn .amt{color:${RED}}
  .${P}-row.free .dot{background:${GREEN}}.${P}-row.free .amt{color:${GREEN}}
  .${P}-row.loop{border-style:dashed;border-color:${GOLD}88;background:${GOLD}14}
  .${P}-row.loop .dot{background:${GOLD}}.${P}-row.loop .amt{color:${GOLD}}
  .${P}-row.out{transform:translateY(-34px) scale(.9);opacity:0}
  .${P}-door{margin-top:10px;display:none;align-items:center;gap:7px;font-size:14px;font-family:var(--font-mono);
    color:${GOLD};border:1px dashed ${GOLD}88;border-radius:9px;padding:6px 10px;transition:all .4s ${EASE}}
  .${P}-door.on{display:flex}
  .${P}-door.shut{color:${RED};border-color:${RED};border-style:solid;background:${RED}14}
  .${P}-stamp{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-9deg) scale(.7);opacity:0;
    display:flex;align-items:center;gap:8px;font-size:19px;font-weight:700;color:${RED};letter-spacing:.06em;
    border:2.5px solid ${RED};border-radius:12px;padding:8px 18px;background:rgba(12,8,10,.86);
    pointer-events:none;z-index:6;transition:all .3s ${EASE}}
  .${P}-stamp.on{opacity:1;transform:translate(-50%,-50%) rotate(-9deg) scale(1)}
  .${P}-why{position:absolute;left:12px;right:12px;bottom:12px;font-size:14.5px;color:${RED};text-align:center;
    opacity:0;transition:opacity .3s;z-index:6}
  .${P}-why.on{opacity:1}
  .${P}-rule{display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;font-size:16px;
    color:var(--text-dim);border:1px solid var(--line);border-radius:12px;padding:10px 16px;margin-bottom:12px}
  .${P}-rule b{color:var(--text)}
  .${P}-rule .arm{display:flex;align-items:center;gap:7px}
  .${P}-rule .arm.s{color:${accent}}.${P}-rule .arm.a{color:${GOLD}}
  .${P}-ctrls{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
  .${P}-ctrls.hide{display:none}
  .${P}-btn{font-family:var(--font-tc);font-size:15px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:9px 18px;cursor:pointer;transition:all .25s ${EASE}}
  .${P}-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .${P}-btn:disabled{opacity:.35;cursor:default;transform:none}
  .${P}-hint{font-size:15px;color:var(--text-dim)}
  /* 飛行元素是 .ds-body 的直接子層 → 必須擋掉框架的 width:min(1240px,100%) 與 auto margin，否則撐出橫向捲動 */
  .${P}-ghost,.${P}-float{position:absolute;z-index:60;pointer-events:none;width:max-content;margin:0}
  .${P}-ghost{font-family:var(--font-tc);font-size:15px;
    color:var(--text);background:rgba(18,21,30,.96);border:1px solid var(--accent);border-radius:11px;
    padding:8px 13px;box-shadow:0 14px 34px -16px #000}
  .${P}-float{font-family:var(--font-mono);font-size:20px;font-weight:700}
  `
  el.appendChild(style)

  // ---------- 場景 DOM ----------
  const deck = document.createElement('div')
  deck.className = `${P}-deck ds-unit`
  deck.innerHTML = TASKS.map(t => `
    <button class="${P}-chip" data-t="${t.id}" type="button">
      <span class="t">${t.icon}${t.label}</span><span class="w">${t.who}</span>
    </button>`).join('')

  const wallets = document.createElement('div')
  wallets.className = `${P}-wallets`
  wallets.innerHTML = `
    <div class="${P}-wallet sub ds-unit" data-w="sub">
      <h4>${I_CARD}訂閱制<span class="who">給「人」用</span></h4>
      <div class="sub">$200 / 月 · 固定金額 · 有上限</div>
      <div class="${P}-meter"><i></i></div>
      <div class="${P}-lab"><span>本月額度</span><span><b class="q">0</b> / 100 · 每月重置</span></div>
      <div class="${P}-door">${I_OPEN}<span class="dt">側門 · 第三方繞道（廠商暫時容忍）</span></div>
      <div class="${P}-inbox"></div>
      <div class="${P}-stamp">${I_BAN}拒絕</div>
      <div class="${P}-why"></div>
    </div>
    <div class="${P}-wallet api ds-unit" data-w="api">
      <h4>${I_KEY}API key<span class="who">給「程式」用</span></h4>
      <div class="sub">按 token 計費 · 儲值扣款</div>
      <div class="${P}-bal">$50.00</div>
      <div class="${P}-lab"><span>餘額</span><span>用多少扣多少 · 跑多久燒多久</span></div>
      <div class="${P}-inbox"></div>
      <div class="${P}-stamp">${I_BAN}餘額不足</div>
      <div class="${P}-why"></div>
    </div>`

  const rule = document.createElement('div')
  rule.className = `${P}-rule ds-unit`
  rule.innerHTML = `<span>判斷法則 —— <b>這件事跑的時候，我人在不在？</b></span>
    <span class="arm s">${I_PERSON}人在 → 訂閱夠用</span>
    <span class="arm a">${I_BOT}人不在 → 準備 API key</span>`

  const ctrls = document.createElement('div')
  ctrls.className = `${P}-ctrls ds-unit hide`
  ctrls.innerHTML = `
    <button class="${P}-btn" data-b="door" type="button">廠商封鎖側門</button>
    <button class="${P}-btn" data-b="topup" type="button">儲值 +$20</button>
    <button class="${P}-btn" data-b="reset" type="button">重來</button>
    <span class="${P}-hint"></span>`

  // ---------- 參照 & 狀態 ----------
  const subW = wallets.querySelector(`.${P}-wallet.sub`), apiW = wallets.querySelector(`.${P}-wallet.api`)
  const W = { sub: subW, api: apiW }
  const meterEl = subW.querySelector(`.${P}-meter`), fillEl = subW.querySelector(`.${P}-meter i`)
  const quotaEl = subW.querySelector('.q'), doorEl = subW.querySelector(`.${P}-door`)
  const balEl = apiW.querySelector(`.${P}-bal`)
  const inbox = { sub: subW.querySelector(`.${P}-inbox`), api: apiW.querySelector(`.${P}-inbox`) }
  const chipOf = id => deck.querySelector(`[data-t="${id}"]`)
  const btn = b => ctrls.querySelector(`[data-b="${b}"]`)
  const hintEl = ctrls.querySelector(`.${P}-hint`)

  let stage
  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  let quota = 0, bal = START_BAL, loophole = false, busy = false, live = false, selected = null
  const money = v => '$' + v.toFixed(2)

  // ---------- 視覺工具 ----------
  function setQuota(v, anim = true) {
    quota = Math.max(0, Math.min(QUOTA_MAX, v))
    fillEl.style.width = quota + '%'
    meterEl.classList.toggle('full', quota >= QUOTA_MAX)
    if (anim) countUp(quotaEl, quota, { from: parseFloat(quotaEl.textContent) || 0, dur: 500, fmt: v2 => Math.round(v2) })
    else quotaEl.textContent = Math.round(quota)
  }
  function setBal(v, anim = true) {
    const from = bal
    bal = Math.max(0, v)
    if (anim) countUp(balEl, bal, { from, dur: 750, fmt: n => money(n) })
    else balEl.textContent = money(bal)
  }
  function floatText(target, text, color) {
    const br = stage.body.getBoundingClientRect(), r = target.getBoundingClientRect()
    const f = document.createElement('div')
    f.className = `${P}-float`; f.textContent = text; f.style.color = color
    f.style.left = (r.left - br.left + r.width / 2) + 'px'
    f.style.top = (r.top - br.top + 92) + 'px'
    stage.body.appendChild(f)
    const a = f.animate([
      { opacity: 0, transform: 'translate(-50%,4px)' },
      { opacity: 1, transform: 'translate(-50%,-16px)' },
      { opacity: 0, transform: 'translate(-50%,-40px)' },
    ], { duration: 1150, easing: EASE })
    a.onfinish = () => f.remove()
  }
  function showStamp(wid, why) {
    const w = W[wid], st = w.querySelector(`.${P}-stamp`), wy = w.querySelector(`.${P}-why`)
    wy.textContent = why || ''
    st.classList.add('on'); wy.classList.add('on'); shake(w)
    T(() => { st.classList.remove('on'); wy.classList.remove('on') }, 2600)
  }
  function addRow(wid, t, kind, amt) {
    const r = document.createElement('div')
    r.className = `${P}-row ${kind}`; r.dataset.t = t.id
    r.innerHTML = `<span class="dot"></span>${t.label}<span class="amt">${amt}</span>`
    inbox[wid].appendChild(r); enterFly(r, { y: 14, dur: 420 }); pop(r)
    return r
  }
  function flyGhost(fromEl, toEl, label, back, done) {
    const br = stage.body.getBoundingClientRect()
    const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect()
    const g = document.createElement('div')
    g.className = `${P}-ghost`; g.textContent = label
    g.style.left = (a.left - br.left) + 'px'; g.style.top = (a.top - br.top) + 'px'
    stage.body.appendChild(g)
    const dx = (b.left - br.left + b.width / 2) - (a.left - br.left + a.width / 2)
    const dy = (b.top - br.top + 74) - (a.top - br.top)
    const fwd = g.animate([{ transform: 'none' }, { transform: `translate(${dx}px,${dy}px) scale(.94)` }],
      { duration: 520, easing: EASE, fill: 'forwards' })
    fwd.onfinish = () => {
      if (!back) { g.remove(); done && done(); return }
      const bk = g.animate([
        { transform: `translate(${dx}px,${dy}px) scale(.94)` },
        { transform: `translate(${dx}px,${dy - 26}px) scale(1)` },
        { transform: 'none', opacity: .25 },
      ], { duration: 620, delay: 240, easing: EASE, fill: 'forwards' })
      bk.onfinish = () => { g.remove(); done && done() }
    }
  }

  // ---------- 規則 ----------
  function verdict(t, wid) {
    if (wid === 'api') {
      if (!t.free && bal < t.cost) return { ok: false, why: '餘額見底 —— 按量計費就是這樣，錢燒完就停。先儲值。' }
      return { ok: true, kind: t.free ? 'free' : 'burn' }
    }
    if (t.wallet === 'sub') {
      if (quota + t.quota > QUOTA_MAX) return { ok: false, why: '本月額度用完 —— 訂閱是固定量，只能等下個月重置。' }
      return { ok: true, kind: 'quota' }
    }
    if (t.sideDoor && loophole) return { ok: true, kind: 'loop' }
    if (t.free) return { ok: false, why: 'Gmail 憑證跟訂閱無關 —— 它是門禁卡，不是算力。' }
    return { ok: false, why: '訂閱只給「人坐在對話框前」用 —— 程式自己跑，吃不到。' }
  }

  function send(taskId, wid, done) {
    if (busy) return
    const t = TASKS.find(x => x.id === taskId)
    const chip = chipOf(taskId), w = W[wid]
    if (!t || !w) return
    busy = true
    const v = verdict(t, wid)
    flyGhost(chip, w, t.label, !v.ok, () => {
      if (v.ok) {
        if (v.kind === 'quota') { setQuota(quota + t.quota); addRow(wid, t, 'quota', `額度 −${t.quota}`) }
        else if (v.kind === 'free') { addRow(wid, t, 'free', '$0.00 · 不計費'); floatText(w, '$0.00', GREEN) }
        else if (v.kind === 'loop') { addRow(wid, t, 'loop', '鑽側門進來的') }
        else {
          addRow(wid, t, 'burn', '−' + money(t.cost)); floatText(w, '−' + money(t.cost), RED)
          balEl.classList.add('drain'); T(() => balEl.classList.remove('drain'), 900)
          setBal(bal - t.cost)
        }
        pop(w, 1.02)
      } else showStamp(wid, v.why)
      busy = false
      done && done(v)
    })
  }

  function openDoor() { loophole = true; doorEl.classList.add('on'); doorEl.classList.remove('shut'); doorEl.innerHTML = `${I_OPEN}<span class="dt">側門 · 第三方繞道（廠商暫時容忍）</span>`; enterFly(doorEl, { y: 10, dur: 420 }) }
  function shutDoor(done) {
    if (!loophole) { done && done(); return }
    loophole = false
    doorEl.classList.add('shut')
    doorEl.innerHTML = `${I_SHUT}<span class="dt">側門已封鎖 —— 它們要封隨時可以封掉</span>`
    doorEl.animate([{ transform: 'scaleY(1.5)' }, { transform: 'scaleY(1)' }], { duration: 340, easing: EASE })
    const ejected = [...inbox.sub.querySelectorAll(`.${P}-row.loop`)]
    ejected.forEach((r, i) => { T(() => { r.classList.add('out'); T(() => r.remove(), 500) }, 260 + i * 90) })
    T(() => { if (ejected.length) { shake(subW); showStamp('sub', '繞道被切斷 —— 靠漏洞撐著的自動化，當場停擺。') } done && done() }, 420)
  }

  // ---------- sandbox 互動 ----------
  function clearSel() {
    selected = null
    deck.querySelectorAll(`.${P}-chip`).forEach(c => c.classList.remove('sel'))
    Object.values(W).forEach(w => w.classList.remove('armed'))
  }
  function pickChip(id) {
    if (!live || busy) return
    if (selected === id) { clearSel(); hintEl.textContent = '先點一張任務卡，再點一個錢包丟進去。'; return }
    clearSel(); selected = id
    chipOf(id).classList.add('sel'); pop(chipOf(id), 1.05)
    Object.values(W).forEach(w => w.classList.add('armed'))
    hintEl.textContent = '再點一個錢包，把它丟進去 —— 猜猜會被接住還是彈回來。'
  }
  function dropOn(wid) {
    if (!live || busy || !selected) return
    const id = selected
    clearSel()
    hintEl.textContent = ''
    send(id, wid, v => {
      hintEl.textContent = v.ok
        ? (wid === 'sub' ? '訂閱接住了 —— 額度是有限的，多丟幾次看它滿。' : '進了 API key —— 看餘額往下掉。')
        : '被彈回來了。換另一個錢包試試。'
    })
  }
  deck.querySelectorAll(`.${P}-chip`).forEach(c => { c.onclick = () => pickChip(c.dataset.t) })
  Object.entries(W).forEach(([wid, w]) => { w.onclick = () => dropOn(wid) })

  btn('door').onclick = () => {
    pop(btn('door'))
    if (loophole) { shutDoor(); hintEl.textContent = '側門關了 —— 現在龍蝦再也進不去訂閱，只剩 API key。' }
    else { openDoor(); hintEl.textContent = '側門又開了 —— 但這是廠商的施捨，不是你的架構。' }
    btn('door').textContent = loophole ? '廠商封鎖側門' : '側門重新開放'
  }
  btn('topup').onclick = () => {
    pop(btn('topup')); setBal(bal + 20); floatText(apiW, '+$20.00', GREEN)
    hintEl.textContent = '儲值了 $20 —— API key 就是這樣，像儲值玩電動。'
  }
  btn('reset').onclick = () => { pop(btn('reset')); startSandboxRun() }

  // ---------- 場景重置 ----------
  function resetScene() {
    clearT(); busy = false; live = false; clearSel()
    stage?.body.querySelectorAll(`.${P}-ghost,.${P}-float`).forEach(n => n.remove())
    inbox.sub.innerHTML = ''; inbox.api.innerHTML = ''
    Object.values(W).forEach(w => {
      w.querySelector(`.${P}-stamp`).classList.remove('on')
      const wy = w.querySelector(`.${P}-why`); wy.classList.remove('on'); wy.textContent = ''
    })
    balEl.classList.remove('drain')
    loophole = false; doorEl.classList.remove('on', 'shut')
    setQuota(0, false); bal = START_BAL; setBal(START_BAL, false)
    deck.classList.remove('live'); ctrls.classList.add('hide')
    btn('door').textContent = '廠商封鎖側門'
  }
  function startSandboxRun() {
    resetScene()
    live = true; deck.classList.add('live'); ctrls.classList.remove('hide')
    openDoor()
    hintEl.textContent = '先點一張任務卡，再點一個錢包丟進去。'
  }

  // ---------- 劇本 ----------
  stage = createStage(el, ctx, {
    beats: [
      {
        narration: '你以為只有一個帳戶 —— 其實是<b>兩個完全不同的錢包</b>：左邊固定月費、有上限；右邊儲值扣款、按量計費。',
        focus: [`.${P}-wallets`], nextLabel: '人在對話框前 →',
        enter() { resetScene(); enterFly(subW, { y: 24, dur: 600 }); enterFly(apiW, { y: 24, dur: 600, delay: 120 }) },
      },
      {
        narration: '你坐在對話框前面打字問問題 —— <b>人在現場</b>。這種吃的是訂閱，額度扣一格，不另外收錢。',
        focus: [`.${P}-deck`, subW], nextLabel: '那自動化呢？ →',
        enter() { resetScene(); T(() => send('chat', 'sub'), 420) },
      },
      {
        narration: '換成<b>第三方 agent（OpenClaw 龍蝦）通宵跑</b> —— 同一顆大腦，卻被<b style="color:' + RED + '">擋在門外</b>。',
        focus: [`.${P}-deck`, subW], nextLabel: '那錢從哪出？ →',
        enter() {
          resetScene()
          T(() => send('lobster', 'sub', () => stage.setNarration(
            '不是技術做不到，是<b>商業不讓</b> —— 廠商不想賣「給你吃 200 塊用到爽」，它要你每一次發詢問就吃我 token。')), 420)
        },
      },
      {
        narration: '換一個錢包：丟進 <b>API key</b> —— 接住了，但<b style="color:' + RED + '">餘額真的在掉</b>。按量計費，通宵跑就通宵燒。',
        focus: [`.${P}-deck`, apiW], nextLabel: '那個側門呢？ →',
        enter() {
          resetScene()
          T(() => send('lobster', 'api'), 380)
          T(() => send('gmail', 'api', () => stage.setNarration(
            '但不是每把 key 都燒錢 —— Gmail 只是<b>身分憑證</b>，不生產內容，<b style="color:' + GREEN + '">$0.00</b>。刷門禁卡 vs 叫工人幹活。')), 1750)
        },
      },
      {
        narration: '那為什麼有人說「現在可以繞著訂閱用」？因為有一道<b style="color:' + GOLD + '">側門</b> —— 廠商在搶市占，暫時容忍。',
        focus: [subW], nextLabel: '換你玩 →',
        enter() {
          resetScene()
          T(() => openDoor(), 260)
          T(() => send('lobster', 'sub'), 700)
          T(() => shutDoor(() => stage.setNarration(
            '喀。<b style="color:' + RED + '">它們要封隨時可以封掉。</b>這是在鑽漏洞，不是架構 —— 別把「現在能鑽」寫進你的系統假設。')), 2500)
        },
      },
      {
        narration: '換你玩 —— <b>點一張任務卡，再點一個錢包</b>。額度丟到滿、餘額燒到乾、按下「封鎖側門」看它當場停擺。',
        sandbox: true,
        enter() { startSandboxRun() },
      },
    ],
  })
  stage.body.append(deck, wallets, rule, ctrls)

  return () => { clearT(); stage.destroy(); style.remove() }
}
