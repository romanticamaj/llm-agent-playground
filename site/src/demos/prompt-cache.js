// prompt-cache — token 色帶：第一次逐格算，之後前綴熱快取只算尾巴；改開頭一格全毀重算。
// 常駐兩條帳單：有 cache vs 沒 cache。核心對比：cache read 0.1x、write 1.25x、input 1x。

export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#5b8cff'
  const P = 'pc'
  const timers = []
  const setT = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id }
  const UNIT = 0.0009 // 每 token 的 input 單價（假資料，示意用）

  const style = document.createElement('style')
  style.textContent = `
  .${P}-root{position:absolute;inset:0;display:flex;flex-direction:column;gap:14px;padding:22px 26px;box-sizing:border-box;color:#e7e9f0;font-family:var(--font-tc,'Noto Sans TC',sans-serif)}
  .${P}-guide{font-size:17px;line-height:1.6;color:#c7cbd8}
  .${P}-guide b{color:${accent}}
  .${P}-main{flex:1;display:flex;gap:22px;min-height:0}
  .${P}-band{flex:1;overflow:auto;padding-right:6px}
  .${P}-grp{margin-bottom:14px}
  .${P}-grp .lab{font-size:14px;letter-spacing:.08em;color:#8b91a4;margin-bottom:7px;display:flex;gap:8px;align-items:center}
  .${P}-grp .lab .badge{font-size:11px;padding:2px 7px;border-radius:20px;background:rgba(255,255,255,.07);color:#9aa0b0}
  .${P}-grp.stable .lab .badge{background:rgba(91,140,255,.16);color:${accent}}
  .${P}-cells{display:flex;flex-wrap:wrap;gap:5px}
  .${P}-cell{width:20px;height:20px;border-radius:5px;background:#232838;transition:all .25s;position:relative;cursor:default}
  .${P}-cell.computing{background:${accent};box-shadow:0 0 10px ${accent};transform:scale(1.18)}
  .${P}-cell.fresh{background:${accent}}
  .${P}-cell.cached{background:#3a2a12;box-shadow:0 0 9px rgba(251,191,36,.55);border:1px solid rgba(251,191,36,.7)}
  .${P}-cell.dirty{background:#2a1618;border:1px solid rgba(248,113,113,.6)}
  .${P}-cell.hit{cursor:pointer}
  .${P}-cell.hit:hover{outline:2px solid #fff;outline-offset:1px}
  .${P}-cell.edited::after{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f87171' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M4 20 h4 L18 10 L14 6 L4 16 Z'/><path d='M13 7 L17 11'/></svg>") center/13px no-repeat}
  .${P}-side{width:262px;display:flex;flex-direction:column;gap:14px}
  .${P}-box{border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px}
  .${P}-box h4{margin:0 0 10px;font-size:14px;letter-spacing:.14em;color:#8b91a4;font-weight:600}
  .${P}-row{display:flex;justify-content:space-between;font-size:15px;padding:3px 0;color:#c7cbd8}
  .${P}-row .v{font-family:var(--font-en,'Space Grotesk',sans-serif)}
  .${P}-row.warm .v{color:#fbbf24}
  .${P}-row.hot .v{color:${accent}}
  .${P}-bills{display:flex;gap:12px}
  .${P}-bill{flex:1;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:12px}
  .${P}-bill h5{margin:0 0 6px;font-size:12px;letter-spacing:.1em;color:#8b91a4;font-weight:600}
  .${P}-bill .amt{font-size:26px;font-weight:700;font-family:var(--font-en,'Space Grotesk',sans-serif)}
  .${P}-bill.cache .amt{color:#4ade80}
  .${P}-bill.nocache .amt{color:#f87171}
  .${P}-bill .sub{font-size:12px;color:#8b91a4;margin-top:3px}
  .${P}-controls{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
  .${P}-controls .demo-btn{font-size:16px}
  .${P}-note{font-size:15px;line-height:1.6;color:#9aa0b0}
  `
  el.appendChild(style)

  const root = document.createElement('div')
  root.className = `${P}-root`
  root.innerHTML = `
    <div class="${P}-guide">每格 = 一段 token 的 KV。按 <b>送出下一輪</b>：第一次整條逐格計算；之後前綴變<b style="color:#fbbf24">暖色 HIT</b> 免算、只算尾巴新訊息。啊哈時刻：<b>點前綴任一格改字</b> — 從那格之後全部作廢重算，成本暴增。</div>
    <div class="${P}-main">
      <div class="${P}-band" id="${P}-band"></div>
      <div class="${P}-side">
        <div class="${P}-box">
          <h4>本輪帳單</h4>
          <div class="${P}-row hot"><span>新算 write ×1.25</span><span class="v" id="${P}-w">0 tok</span></div>
          <div class="${P}-row warm"><span>命中 read ×0.1</span><span class="v" id="${P}-r">0 tok</span></div>
          <div class="${P}-row" style="border-top:1px solid rgba(255,255,255,.1);margin-top:6px;padding-top:8px"><span>本輪成本</span><span class="v" id="${P}-turn">$0.0000</span></div>
        </div>
        <div class="${P}-box">
          <h4>觀察</h4>
          <div class="${P}-note" id="${P}-note">穩定內容往前放、動態內容往後放 — 天然順著 causal attention 的數學。</div>
        </div>
      </div>
    </div>
    <div class="${P}-bills">
      <div class="${P}-bill cache"><h5>有 cache（累計）</h5><div class="amt" id="${P}-billc">$0.0000</div><div class="sub" id="${P}-subc">前綴一直熱著</div></div>
      <div class="${P}-bill nocache"><h5>沒 cache（累計）</h5><div class="amt" id="${P}-billn">$0.0000</div><div class="sub">每輪整條重算 ×1.0</div></div>
    </div>
    <div class="${P}-controls">
      <button class="demo-btn primary" id="${P}-send">送出下一輪 →</button>
      <button class="demo-btn" id="${P}-reset">重來</button>
      <span class="${P}-note" id="${P}-hint">按「送出下一輪」開始第 1 輪。</span>
    </div>`
  el.appendChild(root)

  const $ = id => root.querySelector(`#${P}-${id}`)
  const band = $('band')
  const wEl = $('w'), rEl = $('r'), turnEl = $('turn'), noteEl = $('note'), hintEl = $('hint')
  const billC = $('billc'), billN = $('billn'), subC = $('subc')
  const btnSend = $('send'), btnReset = $('reset')

  // 群組：前綴（穩定）在上，對話輪次在下。lazy = 該輪一開始不存在，逐輪解鎖。
  const GROUPS = [
    { name: 'system prompt', badge: '穩定前綴', stable: true, n: 16 },
    { name: '工具定義 TOOLS', badge: '穩定前綴', stable: true, n: 10 },
    { name: '第 1 輪 · 使用者', badge: '對話', n: 7, round: 1 },
    { name: '第 2 輪 · 使用者', badge: '對話', n: 6, round: 2 },
    { name: '第 3 輪 · 使用者', badge: '對話', n: 6, round: 3 },
  ]
  let cells = []      // {el, state, gi, editable}
  let round = 0
  let busy = false
  let billCache = 0, billNo = 0

  function render() {
    band.innerHTML = ''
    cells = []
    GROUPS.forEach((g, gi) => {
      const wrap = document.createElement('div')
      wrap.className = `${P}-grp${g.stable ? ' stable' : ''}`
      wrap.dataset.gi = gi
      wrap.style.display = (g.round && g.round > Math.max(round, 1)) ? 'none' : ''
      wrap.innerHTML = `<div class="lab">${g.name}<span class="badge">${g.badge}</span></div>`
      const cc = document.createElement('div')
      cc.className = `${P}-cells`
      for (let i = 0; i < g.n; i++) {
        const c = document.createElement('div')
        c.className = `${P}-cell`
        cc.appendChild(c)
        cells.push({ el: c, state: 'cold', gi })
      }
      wrap.appendChild(cc)
      band.appendChild(wrap)
    })
  }
  // 目前這一輪「已存在」的 cell（前綴 + 已解鎖輪次）
  function activeCells() {
    return cells.filter(c => {
      const g = GROUPS[c.gi]
      return !g.round || g.round <= round
    })
  }
  function money(n) { return '$' + n.toFixed(4) }

  function send() {
    if (busy) return
    if (round >= 3) { hintEl.textContent = '已到第 3 輪。改一格開頭試試「全毀重算」，或按重來。'; return }
    busy = true
    round++
    // 顯示本輪新解鎖群組
    band.querySelectorAll(`.${P}-grp`).forEach(w => {
      const g = GROUPS[+w.dataset.gi]
      if (!g.round || g.round <= round) w.style.display = ''
    })
    const act = activeCells()
    const compute = act.filter(c => c.state === 'cold' || c.state === 'dirty')
    const cached = act.filter(c => c.state === 'fresh' || c.state === 'cached')
    // 前綴先掃成暖色 HIT
    cached.forEach((c, i) => setT(() => { c.el.className = `${P}-cell cached`; c.state = 'cached' }, i * 22))
    const startDelay = cached.length * 22 + 120

    let wTok = compute.length, rTok = cached.length
    wEl.textContent = wTok + ' tok'; rEl.textContent = rTok + ' tok'

    // 逐格計算新 token
    let i = 0
    const stepDelay = compute.length > 24 ? 45 : 70
    const walk = () => {
      if (i < compute.length) {
        const c = compute[i++]
        c.el.className = `${P}-cell computing`
        setT(() => { c.el.className = `${P}-cell fresh`; c.state = 'fresh' }, stepDelay * 0.7)
        setT(walk, stepDelay)
      } else finish(wTok, rTok, act.length)
    }
    setT(walk, startDelay)

    if (round === 1) { hintEl.textContent = '第 1 輪：整條都是新的，全部逐格計算。'; noteEl.textContent = '注意：第一次連 cache write 都比純 input 貴一點（×1.25）— 存起來要成本。' }
    else hintEl.textContent = `第 ${round} 輪：前綴 ${rTok} 格直接 HIT 暖光免算，只算尾巴 ${wTok} 格。`
  }

  function finish(wTok, rTok, totalActive) {
    const turnCache = wTok * 1.25 * UNIT + rTok * 0.1 * UNIT
    const turnNo = totalActive * 1.0 * UNIT
    turnEl.textContent = money(turnCache)
    billCache += turnCache; billNo += turnNo
    billC.textContent = money(billCache); billN.textContent = money(billNo)
    const saved = billNo > 0 ? Math.round((1 - billCache / billNo) * 100) : 0
    subC.textContent = saved > 0 ? `比沒 cache 省 ${saved}%` : '前綴一直熱著'
    if (round >= 2) noteEl.textContent = `多輪對話一直偷吃 cache：每輪只在尾巴追加，前面 KV 還熱著。已省 ${saved}%。`
    // 開放點格改字（僅已計算的前綴群組，讓「中間斷一個」更戲劇）
    enableEdit()
    busy = false
  }

  function enableEdit() {
    cells.forEach((c, idx) => {
      if (c.state === 'fresh' || c.state === 'cached') {
        c.el.classList.add('hit')
        c.el.onclick = () => editAt(idx)
      } else { c.el.classList.remove('hit'); c.el.onclick = null }
    })
  }

  function editAt(idx) {
    if (busy) return
    // 從 idx 起（含）全部作廢 → dirty；之前的維持 cached
    let dirtied = 0
    cells.forEach((c, i) => {
      const g = GROUPS[c.gi]
      const active = !g.round || g.round <= round
      if (!active) return
      if (i >= idx && (c.state === 'fresh' || c.state === 'cached')) {
        c.state = 'dirty'; c.el.className = `${P}-cell dirty`; c.el.onclick = null
        dirtied++
      }
    })
    cells[idx].el.classList.add('edited')
    hintEl.textContent = `你改了開頭一格 → 後面 ${dirtied} 格 KV 全部作廢。下次送出要重算。`
    noteEl.textContent = 'attention 是 causal 的：改了前面的 A，後面每個 token 的 KV = f(A,…) 全變 — 中間斷一個就全毀。'
    // 讓「送出下一輪」重算目前這一輪（不推進輪次）
    round--
  }

  function reset() {
    timers.forEach(clearTimeout); timers.length = 0
    round = 0; busy = false; billCache = 0; billNo = 0
    wEl.textContent = '0 tok'; rEl.textContent = '0 tok'; turnEl.textContent = money(0)
    billC.textContent = money(0); billN.textContent = money(0); subC.textContent = '前綴一直熱著'
    noteEl.textContent = '穩定內容往前放、動態內容往後放 — 天然順著 causal attention 的數學。'
    hintEl.textContent = '按「送出下一輪」開始第 1 輪。'
    render()
  }

  btnSend.addEventListener('click', send)
  btnReset.addEventListener('click', reset)
  render()

  return () => {
    timers.forEach(clearTimeout)
    style.remove(); root.remove()
  }
}
