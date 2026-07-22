// Demo：貨車滿了怎麼辦（Compaction）— DemoStage 導演版
// 6 拍劇本：貨車台中→台北｜堆貨｜爆車 compaction 大蒸發｜寫記錄表存硬碟｜換新車｜sandbox 完整旅程。
import { createStage, pop, shake, enterFly, countUp, confettiBurst } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const GREEN = '#4ade80', RED = '#f87171', GRAY = '#565d70', GOLD = '#fbbf24'
const KEY_LABELS = ['客戶預算 80 萬', '交期 3/15', '窗口 Amy']
const P = { taichung: 9, hsinchu: 34, miaoli: 60, taipei: 88 }
const MILES = [
  { name: '台中', at: P.taichung }, { name: '新竹', at: P.hsinchu },
  { name: '苗栗', at: P.miaoli }, { name: '台北', at: P.taipei },
]

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#8ea9e8'

  // ---- 手繪 SVG（側視貨車 / 倉庫硬碟 / 旗幟）----
  const TRUCK = (tone) => `<svg viewBox="0 0 230 140" width="230" height="140" fill="none"
    stroke="${tone}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <rect x="8" y="40" width="124" height="66" rx="4" fill="rgba(10,12,18,.72)"/>
    <path d="M132 106 V58 h30 l24 26 v22 z" fill="rgba(10,12,18,.72)"/>
    <path d="M165 62 h13 l14 16 h-27 z" fill="rgba(255,255,255,.05)"/>
    <path d="M8 106 h182"/>
    <circle cx="46" cy="112" r="15" fill="rgba(10,12,18,.9)"/><circle cx="46" cy="112" r="5"/>
    <circle cx="164" cy="112" r="15" fill="rgba(10,12,18,.9)"/><circle cx="164" cy="112" r="5"/>
    <path d="M200 78 h8"/></svg>`
  const WAREHOUSE = `<svg viewBox="0 0 130 120" width="130" height="120" fill="none"
    stroke="${accent}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 52 L65 20 L118 52" fill="rgba(10,12,18,.7)"/>
    <rect x="22" y="52" width="86" height="56" fill="rgba(10,12,18,.7)"/>
    <rect x="38" y="66" width="54" height="34" rx="3"/>
    <path d="M38 78 h54"/><circle cx="65" cy="89" r="5"/><path d="M65 84 v-4"/></svg>`
  const FLAG = `<svg viewBox="0 0 22 44" width="22" height="44" fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 42 V4"/><path d="M6 6 h13 l-4 5 l4 5 h-13" fill="currentColor" fill-opacity=".22"/></svg>`

  const style = document.createElement('style')
  style.textContent = `
  .cp-scene{position:relative;height:clamp(300px,54vh,470px);border-radius:16px;
    background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(0,0,0,.25));
    border:1px solid var(--line);overflow:hidden;margin-bottom:16px}
  .cp-sky{position:absolute;inset:0;background:radial-gradient(120% 80% at 20% 0%,rgba(142,169,232,.10),transparent 60%)}
  .cp-road{position:absolute;left:0;right:0;bottom:24px;height:6px;background:rgba(255,255,255,.14);border-radius:3px}
  .cp-road:before{content:'';position:absolute;top:2px;left:2%;right:2%;height:2px;
    background:repeating-linear-gradient(90deg,rgba(255,255,255,.4) 0 16px,transparent 16px 34px)}
  .cp-flag{position:absolute;bottom:26px;transform:translateX(-50%);display:flex;flex-direction:column;
    align-items:center;color:#727a90;transition:color .5s}
  .cp-flag .lb{font-size:15px;margin-top:2px;letter-spacing:.04em}
  .cp-flag.reached{color:${accent}}
  .cp-truck{position:absolute;bottom:22px;left:9%;transform:translateX(-50%);
    transition:left 1.2s ${EASE},bottom .7s ${EASE},opacity .7s,filter .7s;z-index:4}
  .cp-truck.stopped{filter:grayscale(1) brightness(.5);bottom:14px}
  .cp-bed{position:absolute;left:14px;top:44px;width:120px;height:62px;display:flex;flex-wrap:wrap-reverse;
    align-content:flex-start;gap:3px;padding:3px;overflow:hidden}
  .cp-block{width:16px;height:16px;border-radius:3px;background:${accent};box-shadow:0 0 0 1px rgba(0,0,0,.3);
    transition:background .5s,transform .6s ${EASE},opacity .6s}
  .cp-block.key{background:${GOLD};box-shadow:0 0 0 1.5px ${GOLD},0 0 8px ${GOLD}66}
  .cp-block.kept{background:${GREEN}}
  .cp-block.evap{background:${GRAY}!important;box-shadow:none!important;
    transform:translateY(-46px) scale(.35) rotate(24deg);opacity:0}
  .cp-newtruck{position:absolute;bottom:22px;left:-18%;transform:translateX(-50%);
    transition:left 1.3s ${EASE};z-index:5}
  .cp-warehouse{position:absolute;bottom:22px;left:${P.miaoli}%;transform:translateX(-50%);z-index:2}
  .cp-ware{position:absolute;left:calc(50% - 62px);bottom:98px;width:150px;display:flex;flex-direction:column;gap:4px}
  .cp-witem{font-size:12.5px;color:#d3d7e2;display:flex;align-items:center;gap:6px;padding:4px 8px;border-radius:6px;
    background:${GREEN}18;border:1px solid ${GREEN}44;font-family:var(--font-mono)}
  .cp-witem .dot{width:8px;height:8px;border-radius:2px;background:${GOLD};flex:none}
  .cp-hidden{opacity:0;pointer-events:none}
  .cp-fly{position:absolute;width:16px;height:16px;border-radius:3px;z-index:40;pointer-events:none}
  .cp-score{position:absolute;top:14px;right:16px;font-family:var(--font-mono);font-size:15px;
    padding:8px 14px;border-radius:999px;background:rgba(10,12,18,.7);border:1px solid var(--line);color:#d3d7e2}
  .cp-score b{font-size:16px}.cp-score.full b{color:${GREEN}}.cp-score.hurt b{color:${RED}}
  .cp-gauge{display:flex;align-items:center;gap:16px}
  .cp-bar{flex:1;height:20px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid var(--line);overflow:hidden}
  .cp-fill{height:100%;width:0;border-radius:10px;background:linear-gradient(90deg,${accent},${GOLD});transition:width .6s ${EASE}}
  .cp-fill.warn{background:linear-gradient(90deg,${GOLD},${RED});animation:cpFlash .5s infinite}
  @keyframes cpFlash{50%{opacity:.45}}
  .cp-pct{font-family:var(--font-mono);font-size:19px;font-weight:600;color:var(--text);min-width:168px;text-align:right}
  .cp-pct small{font-size:14px;color:var(--text-dim);font-weight:400}
  .cp-ctrls{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
  .cp-btn{font-family:var(--font-tc);font-size:15.5px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:9px 18px;cursor:pointer;transition:all .25s ${EASE}}
  .cp-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .cp-btn.primary{background:var(--accent);color:#08090a;border-color:var(--accent);font-weight:600}
  .cp-btn.hide{display:none}
  `
  el.appendChild(style)

  const scene = document.createElement('div')
  scene.className = 'cp-scene ds-unit'
  scene.innerHTML = `
    <div class="cp-sky"></div>
    <div class="cp-road"></div>
    ${MILES.map(m => `<div class="cp-flag" data-at="${m.at}" style="left:${m.at}%">${FLAG}<span class="lb">${m.name}</span></div>`).join('')}
    <div class="cp-warehouse cp-hidden"><div class="cp-ware"></div>${WAREHOUSE}</div>
    <div class="cp-truck">${TRUCK(accent)}<div class="cp-bed"></div></div>
    <div class="cp-newtruck cp-hidden">${TRUCK(GREEN)}<div class="cp-bed nb"></div></div>
    <div class="cp-score cp-hidden"></div>`

  const gauge = document.createElement('div')
  gauge.className = 'cp-gauge ds-unit'
  gauge.innerHTML = `<div class="cp-bar"><div class="cp-fill"></div></div>
    <div class="cp-pct"><span class="num">0</span><small> 萬 / 100 萬 token</small></div>`

  const ctrls = document.createElement('div')
  ctrls.className = 'cp-ctrls ds-unit'
  ctrls.innerHTML = `
    <button class="cp-btn primary hide" data-b="chat">繼續聊天（+貨）</button>
    <button class="cp-btn hide" data-b="save">寫行程記錄表</button>
    <button class="cp-btn hide" data-b="fetch">去查文件（撈回）</button>
    <button class="cp-btn hide" data-b="swap">整理 context 換新車</button>
    <button class="cp-btn hide" data-b="arrive">開到台北（結算）</button>
    <button class="cp-btn hide" data-b="reset">重來一趟</button>`

  let stage  // 於所有輔助函式定義後才建立（避免 enter() 在初始化前觸發）

  // ---- 場景參照 & 狀態 ----
  const $ = s => scene.querySelector(s)
  const truck = $('.cp-truck'), bed = $('.cp-bed'), newTruck = $('.cp-newtruck'), newBed = $('.nb')
  // 換車後所有動作（開車/堆貨/計位）都要跟著新車 — 用 act 指向目前的車
  let act = { t: truck, b: bed }
  const warehouse = $('.cp-warehouse'), ware = $('.cp-ware'), scoreEl = $('.cp-score')
  const fill = gauge.querySelector('.cp-fill'), pctNum = gauge.querySelector('.num')
  const flags = [...scene.querySelectorAll('.cp-flag')]
  const btn = b => ctrls.querySelector(`[data-b="${b}"]`)

  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  let blocks = []            // {el,key,keyIdx}
  const keys = KEY_LABELS.map(() => ({ onTruck: false, inWarehouse: false }))
  let tokens = 0, busy = false

  // ---- 基礎動作 ----
  function setGauge(to, { warn = false, anim = true } = {}) {
    tokens = Math.max(0, Math.min(100, to))
    fill.style.width = tokens + '%'
    fill.classList.toggle('warn', warn)
    if (anim) countUp(pctNum, tokens, { from: parseFloat(pctNum.textContent) || 0, dur: 550, fmt: v => Math.round(v) })
    else pctNum.textContent = Math.round(tokens)
  }
  function drive(pct) { act.t.style.left = pct + '%'; flags.forEach(f => f.classList.toggle('reached', +f.dataset.at <= pct + 0.5)) }
  function makeBlock(key, keyIdx, silent) {
    const b = document.createElement('div')
    b.className = 'cp-block' + (key ? ' key' : '')
    if (key) { b.dataset.k = keyIdx; b.title = KEY_LABELS[keyIdx] }
    act.b.appendChild(b)
    if (!silent) { enterFly(b, { y: 44, dur: 500 }); pop(b) }
    blocks.push({ el: b, key, keyIdx })
    return b
  }
  function addNormals(n, stepMs = 150) {
    for (let i = 0; i < n; i++) T(() => makeBlock(false), i * stepMs)
  }
  function clearBed() { blocks.forEach(b => b.el.remove()); blocks = []; bed.innerHTML = '' }

  function compact(keepN = 4) {
    const survivors = []
    blocks.forEach((b, i) => {
      if (!b.key && survivors.length < keepN) { survivors.push(b); b.el.classList.add('kept') }
      else { const el = b.el; T(() => el.classList.add('evap'), i * 40); T(() => el.remove(), 720 + i * 40) }
    })
    blocks = survivors
    keys.forEach(k => { k.onTruck = false })
    shake(act.t); setGauge(20)
    updateScore()
  }

  function flyGhost(fromR, toR, color) {
    const bodyR = stage.body.getBoundingClientRect()
    const g = document.createElement('div')
    g.className = 'cp-fly'
    g.style.cssText += `left:${fromR.left - bodyR.left}px;top:${fromR.top - bodyR.top}px;background:${color};box-shadow:0 0 8px ${color}`
    stage.body.appendChild(g)
    const a = g.animate([{ transform: 'translate(0,0) scale(1)' },
      { transform: `translate(${toR.left - fromR.left}px,${toR.top - fromR.top}px) scale(.7)`, opacity: .5 }],
      { duration: 620, easing: EASE, fill: 'forwards' })
    a.onfinish = () => g.remove()
  }

  function addWareItem(idx) {
    if (ware.querySelector(`[data-w="${idx}"]`)) return
    const it = document.createElement('div')
    it.className = 'cp-witem'; it.dataset.w = idx
    it.innerHTML = `<span class="dot"></span>${KEY_LABELS[idx]}`
    ware.appendChild(it); enterFly(it, { y: 12, dur: 400 })
  }

  function saveKeys() {
    const tr = act.t.getBoundingClientRect()
    let any = false
    keys.forEach((k, i) => {
      if (!k.inWarehouse) {
        k.inWarehouse = true; any = true
        addWareItem(i)
        const wi = ware.querySelector(`[data-w="${i}"]`)
        if (wi) T(() => flyGhost(tr, wi.getBoundingClientRect(), GOLD), 40)
      }
    })
    if (any) pop(warehouse)
    updateScore()
  }

  function fetchBack() {
    keys.forEach((k, i) => {
      if (k.inWarehouse && !k.onTruck) {
        k.onTruck = true
        const b = makeBlock(true, i, true)
        const wi = ware.querySelector(`[data-w="${i}"]`)
        const br = b.getBoundingClientRect()
        const wr = wi ? wi.getBoundingClientRect() : br
        b.animate([{ transform: `translate(${wr.left - br.left}px,${wr.top - br.top}px) scale(.7)`, opacity: .4 },
          { transform: 'none', opacity: 1 }], { duration: 620, easing: EASE })
        pop(b)
        tokens = Math.min(99, tokens + 3)
      }
    })
    setGauge(tokens)
    updateScore()
  }

  function chat() {
    if (busy) return
    if (tokens >= 99) { busy = true; compact(); T(() => { busy = false }, 900); return }
    for (let i = 0; i < 2; i++) makeBlock(false)
    setGauge(Math.min(99, tokens + 14), { warn: tokens + 14 >= 85 })
  }

  function swapSimple() {
    // 舊車熄火 → 新車開到舊車旁 → 精華貨+關鍵貨搬上 → 主控權交給新車、token 歸低
    if (busy) return
    if (act.t === newTruck) { shake(btn('swap')); return } // 已換過車
    busy = true
    const oldPos = parseFloat(truck.style.left) || P.taichung
    truck.classList.add('stopped')
    newBed.innerHTML = ''
    newTruck.classList.remove('cp-hidden')
    newTruck.style.transition = 'none'; newTruck.style.left = '-18%'
    void newTruck.offsetWidth; newTruck.style.transition = ''
    T(() => { newTruck.style.left = Math.min(oldPos + 9, P.taipei - 8) + '%' }, 60)
    const onTruckKeys = keys.map((k, i) => k.onTruck ? i : -1).filter(i => i >= 0)
    T(() => {
      blocks = []
      for (let i = 0; i < 3; i++) {
        const b = document.createElement('div'); b.className = 'cp-block kept'
        newBed.appendChild(b); enterFly(b, { y: 30, dur: 420, delay: i * 90 })
        blocks.push({ el: b, key: false })
      }
      onTruckKeys.forEach((ki, i) => {
        const b = document.createElement('div'); b.className = 'cp-block key'
        b.dataset.k = ki; b.title = KEY_LABELS[ki]
        newBed.appendChild(b); enterFly(b, { y: 30, dur: 420, delay: 300 + i * 90 })
        blocks.push({ el: b, key: true, keyIdx: ki })
      })
    }, 900)
    T(() => {
      const r = newTruck.getBoundingClientRect(), br = stage.body.getBoundingClientRect()
      confettiBurst(stage.body, r.left - br.left + 60, r.top - br.top + 40, GREEN)
      act = { t: newTruck, b: newBed }           // 主控權交接：之後開車/堆貨都是新車
      setGauge(22)
      T(() => { truck.style.opacity = '0.25' }, 600)
      busy = false
    }, 1500)
  }

  function updateScore() {
    const safe = keys.filter(k => k.onTruck || k.inWarehouse).length
    scoreEl.innerHTML = `關鍵貨保住 <b>${safe} / 3</b>`
    scoreEl.classList.toggle('full', safe === 3)
    scoreEl.classList.toggle('hurt', safe < 3)
  }

  function arrive() {
    if (busy) return
    busy = true
    drive(P.taipei)
    const safe = keys.filter(k => k.onTruck || k.inWarehouse).length
    T(() => {
      const r = act.t.getBoundingClientRect(), br = stage.body.getBoundingClientRect()
      if (safe === 3) { confettiBurst(stage.body, r.left - br.left + 80, r.top - br.top - 10, GOLD, 34); stage.setNarration('抵達台北，<b>3 件關鍵貨全數保住</b> — 這就是先存硬碟＋換新車的威力。按「重來」再開一趟。') }
      else stage.setNarration(`抵達台北，只保住 <b style="color:${RED}">${safe} / 3</b> — 沒存的關鍵貨在 compaction 時被忘了。按「重來」，這次先寫記錄表。`)
      showBtns(['reset'])
      busy = false
    }, 1350)
  }

  function showBtns(list) {
    ctrls.querySelectorAll('.cp-btn').forEach(b => b.classList.toggle('hide', !list.includes(b.dataset.b)))
  }
  btn('chat').onclick = () => { pop(btn('chat')); chat() }
  btn('save').onclick = () => { pop(btn('save')); saveKeys() }
  btn('fetch').onclick = () => { pop(btn('fetch')); fetchBack() }
  btn('swap').onclick = () => { pop(btn('swap')); swapSimple() }
  btn('arrive').onclick = () => { pop(btn('arrive')); arrive() }
  btn('reset').onclick = () => { pop(btn('reset')); startSandboxRun() }

  // 每拍開場先歸零場景，再照劇本演
  function resetScene() {
    clearT(); busy = false
    act = { t: truck, b: bed }                     // 主控權還給原車
    clearBed(); newBed.innerHTML = ''; ware.innerHTML = ''
    keys.forEach(k => { k.onTruck = false; k.inWarehouse = false })
    setGauge(0, { anim: false })
    truck.classList.remove('stopped'); truck.style.opacity = ''
    truck.style.transition = 'none'; drive(P.taichung)
    void truck.offsetWidth; truck.style.transition = ''
    newTruck.classList.add('cp-hidden')
    newTruck.style.transition = 'none'; newTruck.style.left = '-18%'
    void newTruck.offsetWidth; newTruck.style.transition = ''
    warehouse.classList.add('cp-hidden'); scoreEl.classList.add('cp-hidden')
    showBtns([])
  }

  // sandbox 的一趟：可由「重來一趟」重複啟動
  function startSandboxRun() {
    resetScene()
    scoreEl.classList.remove('cp-hidden')
    warehouse.classList.remove('cp-hidden'); enterFly(warehouse, { y: 40, dur: 600 })
    addNormals(6, 120)
    keys.forEach((k, i) => T(() => { makeBlock(true, i); k.onTruck = true; updateScore() }, 250 + i * 200))
    T(() => setGauge(38), 900)
    updateScore(); showBtns(['chat', 'save', 'fetch', 'swap', 'arrive'])
  }

  function buildBeats() {
    return [
      { narration: '你的對話是一台<b>貨車</b> — 從台中出發，要開到台北。', focus: ['.cp-scene'], nextLabel: '開始堆貨 →',
        enter() { resetScene(); truck.style.transition = 'none'; truck.style.left = '-16%'; void truck.offsetWidth; truck.style.transition = ''; T(() => drive(P.taichung), 40) } },

      { narration: '每聊一句，就是往車上<b>堆一件貨</b>。token 儀表跟著往上爬。', focus: ['.cp-scene', '.cp-gauge'], nextLabel: '一路開到滿 →',
        enter() { resetScene(); addNormals(8, 170); T(() => { setGauge(42); drive(P.hsinchu) }, 700) } },

      { narration: '<b>滿了。</b>AI 自動觸發 compaction — 大部分的貨直接蒸發。剩下的 79 萬去哪？<b style="color:' + RED + '">忘了。</b>', focus: ['.cp-scene', '.cp-gauge'], nextLabel: '有救嗎？ →',
        enter() { resetScene(); drive(P.miaoli); addNormals(18, 55); T(() => { setGauge(99, { warn: true }); shake(truck) }, 1150); T(() => compact(4), 1900) } },

      { narration: '防禦第一招：重要的貨，先寫<b>行程記錄表</b>存到硬碟。就算車被壓縮，文件還在 — 按「去查文件」撈回。', focus: ['.cp-scene', '.cp-ctrls'], nextLabel: '還有第二招 →',
        enter() {
          resetScene(); drive(P.miaoli); scoreEl.classList.remove('cp-hidden')
          warehouse.classList.remove('cp-hidden'); enterFly(warehouse, { y: 46, dur: 650 })
          addNormals(11, 90)
          keys.forEach((k, i) => T(() => { makeBlock(true, i); k.onTruck = true; updateScore() }, 300 + i * 240))
          T(() => { setGauge(82); updateScore() }, 1300)
          T(() => saveKeys(), 1900)                 // 寫記錄表：3 件關鍵貨進硬碟
          T(() => { setGauge(99, { warn: true }); shake(truck) }, 2700)
          T(() => compact(4), 3200)                 // compaction 再來，關鍵貨在硬碟安全
          T(() => showBtns(['fetch']), 3400)
        } },

      { narration: '防禦第二招：<b>整理 context，換一台新車</b>。舊車熄火靠邊，精華貨搬上乾淨空車，繼續開。', focus: ['.cp-scene'], nextLabel: '換我開整趟 →',
        enter() {
          resetScene(); drive(P.miaoli)
          addNormals(11, 70)
          keys.forEach((k, i) => T(() => { makeBlock(true, i); k.onTruck = true }, 250 + i * 200))
          T(() => setGauge(90, { warn: true }), 1100)
          T(() => swapSimple(), 1700)
        } },

      { narration: '換你開完整趟 — <b>繼續聊天</b>裝貨、<b>寫記錄表</b>存硬碟、<b>查文件</b>撈回、<b>換新車</b>。開到台北看你保住幾件關鍵貨。', sandbox: true,
        enter() { startSandboxRun() } },
    ]
  }

  stage = createStage(el, ctx, { beats: buildBeats() })
  stage.body.append(scene, gauge, ctrls)

  return () => { clearT(); stage.destroy(); style.remove() }
}
