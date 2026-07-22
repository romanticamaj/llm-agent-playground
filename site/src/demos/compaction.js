// Demo：貨車滿了怎麼辦（Compaction）
// 核心互動：貨車從台中開往台北，貨物格隨「繼續聊天」增加、儀表逼近 100 萬 token；
// 99% 觸發 compaction：79 萬貨變灰蒸發、只留 20 萬精華繼續開。
// 防禦招式：①寫行程記錄表存 3 件關鍵貨進路邊倉庫，compaction 後撈回 ②換新車搬精華。

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const GREEN = '#4ade80', RED = '#f87171', GRAY = '#5a6070', GOLD = '#fbbf24'
  const CAP = 100 // 萬 token
  const ico = (d, s = 18) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
  const I = {
    disk: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v6h10V4"/><circle cx="15" cy="14" r="2"/>',
    doc: '<path d="M6 3h9l5 5v13H6z"/><path d="M14 3v6h6"/><path d="M9 13h7M9 17h5"/>',
    truck: '<path d="M3 6h11v9H3z"/><path d="M14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>'
  }

  const style = document.createElement('style')
  style.textContent = `
  .cp-wrap{position:absolute;inset:0;display:flex;flex-direction:column;gap:15px;padding:20px 28px;box-sizing:border-box;font-family:var(--font-tc,'Noto Sans TC',sans-serif);overflow:auto}
  .cp-lead{font-size:17px;color:#9aa0b0;line-height:1.55}
  .cp-lead b{color:#e8ebf2;font-weight:600}
  .cp-road{position:relative;height:58px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);margin-top:2px}
  .cp-mile{position:absolute;top:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:translateX(-50%);font-size:12.5px;color:#7d8496;gap:3px}
  .cp-mile i{width:2px;height:12px;background:rgba(255,255,255,.2);border-radius:2px}
  .cp-mile.reached{color:${accent}}.cp-mile.reached i{background:${accent}}
  .cp-truck{position:absolute;top:50%;transform:translate(-50%,-50%);transition:left 1.1s cubic-bezier(.4,.1,.3,1);color:${accent};z-index:3;display:flex;align-items:center;gap:6px}
  .cp-truck .cargobox{display:flex;gap:2px;background:rgba(20,22,30,.85);padding:3px;border-radius:6px;border:1px solid rgba(255,255,255,.12)}
  .cp-truck .cargobox b{width:6px;height:6px;border-radius:1.5px;display:block}
  .cp-gauge{display:flex;align-items:center;gap:14px}
  .cp-bar{flex:1;height:22px;border-radius:11px;background:rgba(255,255,255,.05);overflow:hidden;position:relative;border:1px solid rgba(255,255,255,.08)}
  .cp-fill{height:100%;width:0;background:linear-gradient(90deg,${accent},${GOLD});transition:width .5s;border-radius:11px}
  .cp-fill.warn{background:linear-gradient(90deg,${GOLD},${RED});animation:cp-flash .6s infinite}
  @keyframes cp-flash{50%{opacity:.5}}
  .cp-pct{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums;color:#e8ebf2;min-width:150px;text-align:right}
  .cp-pct small{font-size:13px;color:#7d8496;font-weight:400}
  .cp-hold{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start}
  .cp-cargo-wrap{flex:1;min-width:300px}
  .cp-htitle{font-size:13.5px;letter-spacing:.08em;text-transform:uppercase;color:#7d8496;margin-bottom:7px;display:flex;align-items:center;gap:7px}
  .cp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(30px,1fr));gap:4px;min-height:70px;padding:9px;border-radius:11px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.08)}
  .cp-box{aspect-ratio:1;border-radius:4px;background:${accent};opacity:.85;transition:all .7s;position:relative}
  .cp-box.key{background:${GOLD};opacity:1;box-shadow:0 0 0 1.5px ${GOLD}}
  .cp-box.saved{outline:1.5px dashed ${GREEN};outline-offset:1px}
  .cp-box.evap{background:${GRAY};opacity:0;transform:translateY(-24px) scale(.4)}
  .cp-box.kept{background:${GREEN};opacity:1}
  .cp-ware{width:190px;flex:none}
  .cp-warebox{min-height:70px;border-radius:11px;border:1.6px dashed rgba(255,255,255,.16);padding:10px;display:flex;flex-direction:column;gap:6px;background:rgba(255,255,255,.02)}
  .cp-witem{font-size:13px;color:#c3c8d4;display:flex;align-items:center;gap:7px;padding:5px 8px;border-radius:7px;background:${GREEN}12;border:1px solid ${GREEN}33}
  .cp-witem svg{color:${GREEN};flex:none}
  .cp-wempty{font-size:13px;color:#5a6070;line-height:1.5;text-align:center;margin:auto}
  .cp-controls{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
  .cp-defense{display:flex;gap:10px;flex-wrap:wrap;align-items:center;padding:11px 13px;border-radius:11px;background:rgba(91,140,255,.05);border:1px solid ${accent}22}
  .cp-defense .dl{font-size:13.5px;color:${accent};letter-spacing:.05em;font-weight:600;margin-right:2px}
  .cp-note{font-size:14.5px;color:#7d8496;line-height:1.5;min-height:20px}
  .cp-note.hot{color:${accent}}.cp-note.bad{color:${RED}}.cp-note.good{color:${GREEN}}
  .cp-score{display:flex;gap:20px;flex-wrap:wrap;font-size:15px;color:#c3c8d4}
  .cp-score b{font-variant-numeric:tabular-nums}
  .cp-score .ok{color:${GREEN}}.cp-score .lost{color:${RED}}
  .demo-btn.cp-active{border-color:${GREEN};color:${GREEN}}
  `
  el.appendChild(style)

  const MILES = [
    { name: '台中', at: 3 }, { name: '新竹', at: 36 }, { name: '苗栗', at: 63 }, { name: '台北', at: 97 }
  ]

  const wrap = document.createElement('div')
  wrap.className = 'cp-wrap'
  wrap.innerHTML = `
    <div class="cp-lead">一趟長對話就像貨車從<b>台中開往台北</b>：一直聊，貨（token）越裝越多。到 <b>99%</b> 車就塞爆，觸發 <b>compaction</b> — 大部分的貨被壓掉蒸發，只留一小撮精華繼續開。先看它預設怎麼「忘」，再用防禦招式保住關鍵貨。</div>

    <div class="cp-road" id="cp-road">
      <div class="cp-truck" id="cp-truck">${ico(I.truck, 30)}<span class="cargobox" id="cp-cargobox"></span></div>
    </div>

    <div class="cp-gauge">
      <div class="cp-bar"><div class="cp-fill" id="cp-fill"></div></div>
      <div class="cp-pct" id="cp-pct">0<small> 萬 / ${CAP} 萬 token</small></div>
    </div>

    <div class="cp-hold">
      <div class="cp-cargo-wrap">
        <div class="cp-htitle">${ico(I.truck, 15)} 車上貨物（每格 ≈ 一段對話）</div>
        <div class="cp-grid" id="cp-grid"></div>
      </div>
      <div class="cp-ware">
        <div class="cp-htitle">${ico(I.disk, 15)} 路邊倉庫（硬碟）</div>
        <div class="cp-warebox" id="cp-ware"><div class="cp-wempty">先按「寫行程記錄表」<br>才會把關鍵貨存進來</div></div>
      </div>
    </div>

    <div class="cp-defense">
      <span class="dl">防禦招式（重跑時可先按）</span>
      <button class="demo-btn" id="cp-def1">寫行程記錄表（存 3 件關鍵貨）</button>
      <button class="demo-btn" id="cp-def2">整理 context 換新車</button>
    </div>

    <div class="cp-controls">
      <button class="demo-btn primary" id="cp-chat">繼續聊天（+貨）</button>
      <button class="demo-btn" id="cp-go">直接開到滿 → compaction</button>
      <button class="demo-btn" id="cp-reset">重來</button>
    </div>
    <div class="cp-note" id="cp-note">按「繼續聊天」裝貨，或直接開到滿看貨車塞爆。</div>
    <div class="cp-score" id="cp-score" style="display:none"></div>
  `
  el.appendChild(wrap)

  const $ = (s) => wrap.querySelector(s)
  const road = $('#cp-road'), truck = $('#cp-truck'), cargobox = $('#cp-cargobox')
  const fill = $('#cp-fill'), pctEl = $('#cp-pct'), grid = $('#cp-grid')
  const ware = $('#cp-ware'), note = $('#cp-note'), scoreEl = $('#cp-score')
  const btnDef1 = $('#cp-def1'), btnDef2 = $('#cp-def2'), btnChat = $('#cp-chat'), btnGo = $('#cp-go')

  const timers = new Set()
  const setT = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }

  // 3 件關鍵貨（金色），其餘為一般貨
  const KEY_LABELS = ['客戶預算 80 萬', '交期 3/15', '窗口 Amy']
  let boxes = [] // {id,key,keyIdx}
  let uid = 0, tokens = 0, compacted = false, busy = false
  let savedToWarehouse = false, newTruck = false

  function keyCount() {
    // 車上還有幾件關鍵貨（沒蒸發）
    return boxes.filter((b) => b.key).length
  }

  function render() {
    const pct = Math.min(100, tokens)
    fill.style.width = pct + '%'
    fill.classList.toggle('warn', pct >= 85)
    pctEl.innerHTML = `${tokens}<small> 萬 / ${CAP} 萬 token</small>`
    // 貨車位置：沿路前進（token 對應里程 0→97%）
    const roadW = road.clientWidth
    const x = 26 + (roadW - 60) * Math.min(1, pct / 97)
    truck.style.left = x + 'px'
    MILES.forEach((m, i) => {
      const node = road.querySelector('.cp-mile[data-i="' + i + '"]')
      if (node) node.classList.toggle('reached', pct >= m.at - 1)
    })
    // 迷你貨櫃
    cargobox.innerHTML = ''
    boxes.slice(-6).forEach((b) => {
      const bb = document.createElement('b')
      bb.style.background = b.key ? GOLD : accent
      cargobox.appendChild(bb)
    })
  }

  function renderGrid() {
    grid.innerHTML = ''
    boxes.forEach((b) => {
      const d = document.createElement('div')
      d.className = 'cp-box' + (b.key ? ' key' : '') + (b.saved ? ' saved' : '')
      d.dataset.id = b.id
      if (b.key) d.title = KEY_LABELS[b.keyIdx]
      grid.appendChild(d)
    })
  }

  function buildMiles() {
    ;[...road.querySelectorAll('.cp-mile')].forEach((n) => n.remove())
    MILES.forEach((m, i) => {
      const node = document.createElement('div')
      node.className = 'cp-mile'; node.dataset.i = i
      node.style.left = m.at + '%'
      node.innerHTML = `<i></i>${m.name}`
      road.appendChild(node)
    })
  }

  function addCargo(n) {
    for (let k = 0; k < n; k++) {
      // 每隔幾格塞一件關鍵貨，直到 3 件都上車
      const placedKeys = boxes.filter((b) => b.key).length + boxes.filter((b) => b.wasKey).length
      const makeKey = placedKeys < 3 && (boxes.length % 5 === 2)
      boxes.push({ id: ++uid, key: makeKey, keyIdx: makeKey ? placedKeys : -1 })
      tokens = Math.min(99, tokens + 4)
    }
    render(); renderGrid()
  }

  let readyToCompact = false
  btnChat.addEventListener('click', () => {
    if (busy || compacted) return
    if (readyToCompact) { runCompaction(); return }
    addCargo(3)
    if (tokens >= 99) {
      readyToCompact = true
      note.textContent = '車滿了（99%）！再按一次「繼續聊天」就會觸發 compaction。'
      note.className = 'cp-note hot'
    }
  })

  btnGo.addEventListener('click', () => {
    if (busy || compacted) return
    busy = true
    setT(function step() {
      if (tokens < 99) { addCargo(4); setT(step, 120) }
      else { busy = false; runCompaction() }
    }, 120)
  })

  function runCompaction() {
    if (compacted || busy) return
    compacted = true; busy = true
    note.textContent = 'Compaction 觸發：貨物重整中…大部分的貨要被壓掉了。'
    note.className = 'cp-note hot'

    // 保留：關鍵貨若已存倉庫 → 之後可撈回；車上一律先蒸發大部分
    const nodes = [...grid.querySelectorAll('.cp-box')]
    const keepCount = Math.max(1, Math.round(boxes.length * 0.2)) // 留 20% 精華（≈20萬）
    // 若換了新車：精華貨（含 saved 的關鍵貨）直接保留、不蒸發
    boxes.forEach((b, i) => {
      const node = nodes[i]
      const isKept = i < keepCount // 前 20% 當作「精華摘要」
      const rescueLater = b.saved // 存過倉庫的關鍵貨可撈回
      if (isKept) {
        b.kept = true
        node && node.classList.add('kept')
      } else {
        if (b.key && !rescueLater) b.wasKey = true // 這件關鍵貨被忘了
        node && setT(() => node.classList.add('evap'), 60 + i * 12)
      }
    })

    setT(() => {
      // 重建：只留精華（前 20%）
      const kept = boxes.filter((b) => b.kept)
      const lostKeys = boxes.filter((b) => b.key && !b.kept && !b.saved).length
      boxes = kept
      tokens = 20
      renderGrid(); render()
      note.innerHTML = `壓縮完成：<b style="color:${RED}">79 萬</b>的貨變灰蒸發了，只留 20 萬精華繼續前進。剩下的 79 萬去哪？<b style="color:${RED}">忘了。</b>`
      note.className = 'cp-note bad'
      busy = false
      showScore()
    }, 900)
  }

  function showScore() {
    const onTruck = keyCount()
    const inWare = savedToWarehouse ? 3 : 0
    scoreEl.style.display = 'flex'
    scoreEl.innerHTML = `
      <span>關鍵貨保住：<b class="ok">${Math.max(onTruck, inWare ? 3 : onTruck)} / 3</b></span>
      ${inWare ? `<span>其中倉庫存有 <b class="ok">3</b> 件，可按「去查文件」撈回</span>` : `<span class="lost">沒先存倉庫 → compaction 後大多找不回</span>`}`
    if (savedToWarehouse) {
      // 提供撈回按鈕
      if (!$('#cp-fetch')) {
        const b = document.createElement('button')
        b.className = 'demo-btn'; b.id = 'cp-fetch'; b.textContent = '去查文件（撈回關鍵貨）'
        b.addEventListener('click', fetchBack)
        wrap.querySelector('.cp-defense').appendChild(b)
      }
    }
  }

  function fetchBack() {
    const btn = $('#cp-fetch'); if (!btn || btn.disabled) return
    btn.disabled = true
    KEY_LABELS.forEach((lb, i) => {
      setT(() => {
        boxes.push({ id: ++uid, key: true, keyIdx: i, saved: true, kept: true })
        tokens = Math.min(99, tokens + 3)
        renderGrid(); render()
      }, i * 260)
    })
    setT(() => {
      note.innerHTML = `從路邊倉庫把 <b style="color:${GREEN}">3 件關鍵貨</b>撈回車上 — 因為你先寫進了硬碟，compaction 燒不掉它。`
      note.className = 'cp-note good'
      scoreEl.innerHTML = `<span>關鍵貨保住：<b class="ok">3 / 3</b> — 靠「寫文件 + 去查文件」救回全部。</span>`
    }, 3 * 260 + 100)
  }

  // ---- 防禦招式 ----
  btnDef1.addEventListener('click', () => {
    if (compacted) return
    savedToWarehouse = true
    btnDef1.classList.add('cp-active'); btnDef1.disabled = true
    // 標記車上關鍵貨為 saved；若還沒上車，也先把 3 件登記進倉庫
    boxes.forEach((b) => { if (b.key) b.saved = true })
    ware.innerHTML = ''
    KEY_LABELS.forEach((lb) => {
      const it = document.createElement('div')
      it.className = 'cp-witem'
      it.innerHTML = `${ico(I.doc, 15)} ${lb}`
      ware.appendChild(it)
    })
    renderGrid()
    note.textContent = '已把 3 件關鍵貨寫進路邊倉庫（硬碟）。就算車上被 compaction 燒掉，文件還在。'
    note.className = 'cp-note good'
  })

  btnDef2.addEventListener('click', () => {
    if (busy) return
    newTruck = true
    btnDef2.classList.add('cp-active'); btnDef2.disabled = true
    // 換新車：把目前的關鍵貨 + 少量精華搬上新車，token 歸低
    const keys = boxes.filter((b) => b.key)
    boxes = keys.map((b) => ({ ...b, kept: true }))
    // 補一點精華一般貨
    for (let i = 0; i < 3; i++) boxes.push({ id: ++uid, key: false, kept: true })
    tokens = Math.max(12, keys.length * 4 + 8)
    compacted = false; readyToCompact = false
    scoreEl.style.display = 'none'
    renderGrid(); render()
    note.textContent = '整理 context 換新車：舊車靠邊，把精華貨（含關鍵貨）搬上新車，繼續開 — 沒有硬蒸發，主動選擇留什麼。'
    note.className = 'cp-note good'
  })

  $('#cp-reset').addEventListener('click', reset)
  function reset() {
    timers.forEach((id) => clearTimeout(id)); timers.clear()
    boxes = []; uid = 0; tokens = 0; compacted = busy = false
    savedToWarehouse = newTruck = readyToCompact = false
    btnDef1.disabled = btnDef2.disabled = false
    btnDef1.classList.remove('cp-active'); btnDef2.classList.remove('cp-active')
    const f = $('#cp-fetch'); if (f) f.remove()
    ware.innerHTML = '<div class="cp-wempty">先按「寫行程記錄表」<br>才會把關鍵貨存進來</div>'
    scoreEl.style.display = 'none'; scoreEl.innerHTML = ''
    note.textContent = '按「繼續聊天」裝貨，或直接開到滿看貨車塞爆。'
    note.className = 'cp-note'
    renderGrid(); render()
  }

  buildMiles()
  renderGrid()
  render()
  const onResize = () => render()
  window.addEventListener('resize', onResize)

  return () => {
    timers.forEach((id) => clearTimeout(id)); timers.clear()
    window.removeEventListener('resize', onResize)
    style.remove(); wrap.remove()
  }
}
