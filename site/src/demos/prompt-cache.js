// prompt-cache — DemoStage 導演版
// 5 拍：token 色帶介紹｜第一次整條逐格算｜再送一輪前綴 HIT 免算｜點開頭改字全毀重算｜sandbox 自由玩。
// 核心對比保留：cache read 0.1x / write 1.25x / input 1x，兩條累計帳單。
import { createStage, pop, shake, countUp } from './_stage.js'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const P = 'pc'
  const UNIT = 0.0009 // 每 token input 單價（示意假資料）

  const style = document.createElement('style')
  style.textContent = `
  .${P}-main{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}
  .${P}-band{flex:1;min-width:320px}
  .${P}-grp{margin-bottom:14px}
  .${P}-grp .lab{font-size:14px;letter-spacing:.06em;color:#8b91a4;margin-bottom:7px;display:flex;gap:8px;align-items:center}
  .${P}-grp .lab .badge{font-size:11px;padding:2px 7px;border-radius:20px;background:rgba(255,255,255,.07);color:#9aa0b0}
  .${P}-grp.stable .lab .badge{background:${accent}28;color:${accent}}
  .${P}-cells{display:flex;flex-wrap:wrap;gap:5px}
  .${P}-cell{width:20px;height:20px;border-radius:5px;background:#232838;transition:all .25s;position:relative;cursor:default}
  .${P}-cell.computing{background:${accent};box-shadow:0 0 10px ${accent};transform:scale(1.18)}
  .${P}-cell.fresh{background:${accent}}
  .${P}-cell.cached{background:#3a2a12;box-shadow:0 0 9px rgba(251,191,36,.55);border:1px solid rgba(251,191,36,.7)}
  .${P}-cell.dirty{background:#2a1618;border:1px solid rgba(248,113,113,.6)}
  .${P}-cell.hit{cursor:pointer}
  .${P}-cell.hit:hover{outline:2px solid #fff;outline-offset:1px}
  .${P}-cell.edited::after{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f87171' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M4 20 h4 L18 10 L14 6 L4 16 Z'/><path d='M13 7 L17 11'/></svg>") center/13px no-repeat}
  .${P}-side{width:250px;display:flex;flex-direction:column;gap:14px}
  .${P}-box{border:1px solid var(--line);border-radius:12px;padding:14px}
  .${P}-box h4{margin:0 0 10px;font-size:13px;letter-spacing:.14em;color:#8b91a4;font-weight:600}
  .${P}-row{display:flex;justify-content:space-between;font-size:15px;padding:3px 0;color:#c7cbd8}
  .${P}-row .v{font-family:var(--font-mono,monospace)}
  .${P}-row.warm .v{color:#fbbf24}.${P}-row.hot .v{color:${accent}}
  .${P}-row.tot{border-top:1px solid var(--line);margin-top:6px;padding-top:8px}
  .${P}-bills{display:flex;gap:12px;margin-top:16px;flex-wrap:wrap}
  .${P}-bill{flex:1;min-width:150px;border:1px solid var(--line);border-radius:12px;padding:12px}
  .${P}-bill h5{margin:0 0 6px;font-size:12px;letter-spacing:.1em;color:#8b91a4;font-weight:600}
  .${P}-bill .amt{font-size:26px;font-weight:700;font-family:var(--font-mono,monospace)}
  .${P}-bill.cache .amt{color:#4ade80}.${P}-bill.nocache .amt{color:#f87171}
  .${P}-bill .sub{font-size:12px;color:#8b91a4;margin-top:3px}
  .${P}-ctrls{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:16px}
  .${P}-btn{font-family:var(--font-tc);font-size:15px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:9px 18px;cursor:pointer;transition:all .25s}
  .${P}-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .${P}-btn.primary{background:var(--accent);color:#08090a;border-color:var(--accent);font-weight:600}
  .${P}-ctrls.hide{display:none}
  .${P}-hint{font-size:14px;color:#8b91a4}
  `
  el.appendChild(style)

  const GROUPS = [
    { name: 'system prompt', badge: '穩定前綴', stable: true, n: 16 },
    { name: '工具定義 TOOLS', badge: '穩定前綴', stable: true, n: 10 },
    { name: '第 1 輪 · 使用者', badge: '對話', n: 7, round: 1 },
    { name: '第 2 輪 · 使用者', badge: '對話', n: 6, round: 2 },
    { name: '第 3 輪 · 使用者', badge: '對話', n: 6, round: 3 },
  ]

  let stage
  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  // ---- 場景 DOM（一次蓋好）----
  const main = document.createElement('div'); main.className = `${P}-main`
  const band = document.createElement('div'); band.className = `${P}-band ds-unit`
  const side = document.createElement('div'); side.className = `${P}-side ds-unit`
  side.innerHTML = `
    <div class="${P}-box">
      <h4>本輪帳單</h4>
      <div class="${P}-row hot"><span>新算 write ×1.25</span><span class="v" id="${P}-w">0 tok</span></div>
      <div class="${P}-row warm"><span>命中 read ×0.1</span><span class="v" id="${P}-r">0 tok</span></div>
      <div class="${P}-row tot"><span>本輪成本</span><span class="v" id="${P}-turn">$0.0000</span></div>
    </div>`
  main.append(band, side)
  const bills = document.createElement('div'); bills.className = `${P}-bills ds-unit`
  bills.innerHTML = `
    <div class="${P}-bill cache"><h5>有 cache（累計）</h5><div class="amt" id="${P}-billc">$0.0000</div><div class="sub" id="${P}-subc">前綴一直熱著</div></div>
    <div class="${P}-bill nocache"><h5>沒 cache（累計）</h5><div class="amt" id="${P}-billn">$0.0000</div><div class="sub">每輪整條重算 ×1.0</div></div>`
  const ctrls = document.createElement('div'); ctrls.className = `${P}-ctrls ds-unit hide`
  ctrls.innerHTML = `
    <button class="${P}-btn primary" id="${P}-send">送出下一輪 →</button>
    <button class="${P}-btn" id="${P}-reset">重來</button>
    <span class="${P}-hint" id="${P}-hint">點暖色前綴任一格 = 改一個字，看它從那格之後全毀。</span>`

  const $ = id => (side.querySelector(`#${P}-${id}`) || bills.querySelector(`#${P}-${id}`) || ctrls.querySelector(`#${P}-${id}`))
  const wEl = $('w'), rEl = $('r'), turnEl = $('turn'), hintEl = $('hint')
  const billC = $('billc'), billN = $('billn'), subC = $('subc')

  let cells = []      // {el, state, gi}
  let round = 0, busy = false, billCache = 0, billNo = 0
  const money = n => '$' + n.toFixed(4)

  function render() {
    band.innerHTML = ''; cells = []
    GROUPS.forEach((g, gi) => {
      const wrap = document.createElement('div')
      wrap.className = `${P}-grp${g.stable ? ' stable' : ''}`
      wrap.style.display = (g.round && g.round > Math.max(round, 1)) ? 'none' : ''
      wrap.innerHTML = `<div class="lab">${g.name}<span class="badge">${g.badge}</span></div>`
      const cc = document.createElement('div'); cc.className = `${P}-cells`
      for (let i = 0; i < g.n; i++) {
        const c = document.createElement('div'); c.className = `${P}-cell`
        cc.appendChild(c); cells.push({ el: c, state: 'cold', gi })
      }
      wrap.appendChild(cc); band.appendChild(wrap)
    })
  }
  const activeCells = () => cells.filter(c => { const g = GROUPS[c.gi]; return !g.round || g.round <= round })

  // 一輪送出：前綴掃暖 HIT，尾巴逐格計算
  function send(onDone) {
    if (busy) return
    if (round >= 3) { hintEl.textContent = '已到第 3 輪。改一格開頭試「全毀重算」，或按重來。'; return }
    busy = true; round++
    band.querySelectorAll(`.${P}-grp`).forEach((w, gi) => {
      const g = GROUPS[gi]; if (!g.round || g.round <= round) w.style.display = ''
    })
    const act = activeCells()
    const compute = act.filter(c => c.state === 'cold' || c.state === 'dirty')
    const cached = act.filter(c => c.state === 'fresh' || c.state === 'cached')
    cached.forEach((c, i) => T(() => { c.el.className = `${P}-cell cached`; c.state = 'cached' }, i * 20))
    const startDelay = cached.length * 20 + 120
    const wTok = compute.length, rTok = cached.length
    wEl.textContent = wTok + ' tok'; rEl.textContent = rTok + ' tok'
    let i = 0
    const stepDelay = compute.length > 24 ? 42 : 66
    const walk = () => {
      if (i < compute.length) {
        const c = compute[i++]; c.el.className = `${P}-cell computing`
        T(() => { c.el.className = `${P}-cell fresh`; c.state = 'fresh' }, stepDelay * 0.7)
        T(walk, stepDelay)
      } else finish(wTok, rTok, act.length, onDone)
    }
    T(walk, startDelay)
  }
  function finish(wTok, rTok, totalActive, onDone) {
    const turnCache = wTok * 1.25 * UNIT + rTok * 0.1 * UNIT
    turnEl.textContent = money(turnCache)
    billCache += turnCache; billNo += totalActive * UNIT
    billC.textContent = money(billCache); billN.textContent = money(billNo)
    const saved = billNo > 0 ? Math.round((1 - billCache / billNo) * 100) : 0
    subC.textContent = saved > 0 ? `比沒 cache 省 ${saved}%` : '前綴一直熱著'
    busy = false; onDone && onDone(saved)
  }

  function enableEdit() {
    cells.forEach((c, idx) => {
      if (c.state === 'fresh' || c.state === 'cached') { c.el.classList.add('hit'); c.el.onclick = () => editAt(idx) }
      else { c.el.classList.remove('hit'); c.el.onclick = null }
    })
  }
  function editAt(idx) {
    if (busy) return
    let dirtied = 0
    cells.forEach((c, i) => {
      const g = GROUPS[c.gi]; if (g.round && g.round > round) return
      if (i >= idx && (c.state === 'fresh' || c.state === 'cached')) {
        c.state = 'dirty'; c.el.className = `${P}-cell dirty`; c.el.onclick = null; dirtied++
      }
    })
    cells[idx].el.classList.add('edited'); shake(cells[idx].el)
    hintEl.textContent = `改了開頭一格 → 後面 ${dirtied} 格 KV 全部作廢，下次送出要重算。`
    stage.setNarration(`改一個字，後面 <b style="color:#f87171">${dirtied} 格全毀</b> — attention 是 causal 的，C 的 KV = f(A,…)，前面一動全變。中間斷一個就全毀。`)
    round-- // 下次送出重算這一輪
  }

  // 直接把前 nRounds 輪設成算好（無動畫），用於導覽鋪陳
  function preset(nRounds) {
    round = nRounds; render()
    cells.forEach(c => {
      const g = GROUPS[c.gi]
      if (!g.round || g.round <= round) { c.state = 'fresh'; c.el.className = `${P}-cell fresh` }
    })
  }
  function resetScene() {
    clearT(); busy = false; round = 0; billCache = 0; billNo = 0
    wEl.textContent = '0 tok'; rEl.textContent = '0 tok'; turnEl.textContent = money(0)
    billC.textContent = money(0); billN.textContent = money(0); subC.textContent = '前綴一直熱著'
    render(); ctrls.classList.add('hide')
  }
  function startSandboxRun() {
    resetScene(); ctrls.classList.remove('hide')
    hintEl.textContent = '送出幾輪看前綴一直熱著；再點暖色前綴任一格改字，看全毀重算。'
  }

  $('send').onclick = () => { pop($('send')); send(() => enableEdit()) }
  $('reset').onclick = () => { pop($('reset')); startSandboxRun() }

  stage = createStage(el, ctx, {
    beats: [
      { narration: '這是一段 <b>token 色帶</b> — 每格是一段 token 的 KV。穩定前綴在上、對話在下。', focus: [`.${P}-band`], nextLabel: '第一次送出 →',
        enter() { resetScene() } },

      { narration: '第一次送出：整條都是新的，<b>逐格計算</b>。兩邊帳單一起跳 — 這輪有 cache 沒 cache 一樣貴。', focus: [`.${P}-band`, `.${P}-bills`], nextLabel: '再送一輪 →',
        enter() { resetScene(); T(() => send(), 350) } },

      { narration: '再送一輪：前綴整段變<b style="color:#fbbf24">暖色 HIT</b> 免算，只有尾巴新訊息逐格計算 — 帳單只加一點點。', focus: [`.${P}-band`, `.${P}-side`], nextLabel: '啊哈時刻 →',
        enter() { resetScene(); preset(1); T(() => send(s => { if (s > 0) stage.setNarration(`前綴熱著 — 這輪已省 <b style="color:#4ade80">${s}%</b>。多輪對話天然一直命中 cache：只在尾巴追加。`) }), 400) } },

      { narration: '殺手級：改開頭一格會怎樣？看好前綴 — 我幫你點一格<b style="color:#f87171">改字</b>。', focus: [`.${P}-band`], nextLabel: '換我玩 →',
        enter() { resetScene(); preset(2); T(() => editAt(5), 700) } },

      { narration: '換你玩 — <b>送出下一輪</b>看前綴一直熱著，再<b>點暖色前綴改一個字</b>，親眼看兩條帳單怎麼分家。', sandbox: true,
        enter() { startSandboxRun() } },
    ],
  })
  stage.body.append(main, bills, ctrls)

  return () => { clearT(); stage.destroy(); style.remove() }
}
