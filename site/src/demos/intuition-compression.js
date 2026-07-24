// Demo：直覺就是壓縮（Intuition = Compression）— DemoStage 導演版
// 5 拍：專家一眼標出問題｜幾萬次經驗壓縮進大腦｜人腦 vs LLM 並排同步跑｜沒見過的分布兩邊同時猜錯｜sandbox 閃卡快答當直覺機器。
import { createStage, pop, shake, enterFly, countUp, confettiBurst } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const GREEN = '#4ade80', RED = '#f87171'

const BRAIN = `<svg viewBox="0 0 120 100" width="100%" height="100%" fill="none" stroke="currentColor"
  stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
  <path d="M60 16 C44 10 28 16 26 34 C14 38 14 58 26 64 C26 80 44 88 60 82"/>
  <path d="M60 16 C76 10 92 16 94 34 C106 38 106 58 94 64 C94 80 76 88 60 82"/>
  <path d="M60 16 V82"/><path d="M40 34 q10 8 0 16 q-10 8 0 16"/><path d="M80 34 q-10 8 0 16 q10 8 0 16"/></svg>`
// 三種情境卡的內容
const CASES = [
  { name: '電路板', svg: `<svg viewBox="0 0 120 80" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
      <rect x="8" y="10" width="104" height="60" rx="4"/><path d="M24 24h30M24 40h44M24 56h22"/>
      <circle cx="70" cy="24" r="4"/><circle cx="86" cy="56" r="4"/><path d="M78 40h20"/></svg>`, spot: [78, 62] },
  { name: '病歷', svg: `<svg viewBox="0 0 120 80" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <rect x="20" y="8" width="80" height="64" rx="5"/><rect x="46" y="4" width="28" height="12" rx="3"/>
      <path d="M32 34h18l6 12 8-22 6 10h14"/><path d="M32 58h40"/></svg>`, spot: [64, 44] },
  { name: 'code review', svg: `<svg viewBox="0 0 120 80" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <rect x="8" y="10" width="104" height="60" rx="4"/><path d="M8 24h104"/><path d="M22 40h30M22 52h44M60 40h24"/></svg>`, spot: [40, 52] },
]

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#8ea9e8'

  const style = document.createElement('style')
  style.textContent = `
  .ic-scene{position:relative;height:clamp(330px,58vh,500px);border-radius:16px;overflow:hidden;
    background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(0,0,0,.28));border:1px solid var(--line);margin-bottom:14px}
  .ic-layer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:clamp(12px,3vw,40px);
    padding:26px;opacity:0;transform:translateY(14px);pointer-events:none;transition:opacity .5s ${EASE},transform .5s ${EASE}}
  .ic-layer.show{opacity:1;transform:none;pointer-events:auto}
  .ic-card{position:relative;width:clamp(140px,22vw,210px);border-radius:14px;padding:16px 14px 40px;
    background:rgba(18,22,32,.92);border:1px solid var(--line);color:var(--text);transition:box-shadow .4s,border-color .4s}
  .ic-card .cn{font-size:14px;color:var(--text-dim);font-family:var(--font-mono);margin-bottom:10px;text-align:center}
  .ic-card .cbody{height:clamp(80px,13vh,120px);color:${accent}bb}
  .ic-card.flash{animation:icFlash .5s ease-out}
  @keyframes icFlash{0%{filter:brightness(2.6)}100%{filter:none}}
  .ic-mark{position:absolute;width:34px;height:34px;border-radius:50%;border:2.5px solid ${RED};
    box-shadow:0 0 16px ${RED}88;transform:translate(-50%,-50%) scale(0);opacity:0;transition:transform .4s ${EASE},opacity .4s}
  .ic-mark.on{transform:translate(-50%,-50%) scale(1);opacity:1}
  .ic-mark .lb{position:absolute;top:-24px;left:50%;transform:translateX(-50%);white-space:nowrap;
    font-size:13px;color:${RED};font-family:var(--font-mono)}
  .ic-brainbox{width:clamp(160px,26vw,240px);height:clamp(150px,26vh,220px);color:${accent};position:relative;
    filter:drop-shadow(0 0 0 transparent);transition:filter .6s}
  .ic-brainbox.glow{filter:drop-shadow(0 0 24px ${accent}aa)}
  .ic-tile{position:absolute;width:16px;height:16px;border-radius:3px;background:${accent};opacity:.85;
    box-shadow:0 0 6px ${accent}66;transition:transform 1.1s ${EASE},opacity 1s,width 1s,height 1s;z-index:3}
  .ic-pat{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);
    font-size:15px;color:${GREEN};opacity:0;transition:opacity .5s}
  .ic-pat.on{opacity:1}
  .ic-pipe{width:clamp(210px,40%,320px);border-radius:14px;padding:18px 16px;background:rgba(18,22,32,.9);
    border:1px solid var(--line);display:flex;flex-direction:column;gap:12px}
  .ic-pipe h4{font-size:16px;margin:0 0 4px;color:var(--text);text-align:center;letter-spacing:.02em}
  .ic-pipe h4 span{font-size:12.5px;color:var(--text-dim);font-family:var(--font-mono);display:block;margin-top:3px}
  .ic-stage{display:flex;align-items:center;gap:11px;font-size:15px;color:var(--text);padding:9px 12px;border-radius:10px;
    background:rgba(255,255,255,.03);border:1px solid var(--line);transition:all .35s ${EASE}}
  .ic-stage .dot{width:9px;height:9px;border-radius:50%;background:var(--text-dim);flex:none;transition:all .35s}
  .ic-stage.lit{border-color:${accent};background:${accent}18}
  .ic-stage.lit .dot{background:${accent};box-shadow:0 0 10px ${accent}}
  .ic-stage .sub{font-family:var(--font-mono);font-size:12px;color:var(--text-dim);margin-left:auto}
  .ic-verdict{display:flex;gap:16px;margin-top:14px}
  .ic-vchip{display:flex;align-items:center;gap:9px;padding:10px 16px;border-radius:12px;font-size:15px;
    background:rgba(18,22,32,.9);border:1px solid var(--line);color:var(--text)}
  .ic-vchip .who{font-family:var(--font-mono);font-size:13px;color:var(--text-dim)}
  .ic-vchip.wrong{border-color:${RED};color:${RED}}
  .ic-x{width:18px;height:18px;color:${RED};opacity:0;transition:opacity .3s}
  .ic-vchip.wrong .ic-x{opacity:1}
  .ic-novel{width:clamp(150px,24vw,220px);border-radius:14px;padding:22px;text-align:center;
    background:rgba(18,22,32,.92);border:1px dashed ${accent}88;color:${accent};font-size:44px;font-family:var(--font-mono)}
  /* game */
  .ic-game{flex-direction:column;gap:16px}
  .ic-grid{display:grid;gap:8px}
  .ic-cell{width:clamp(38px,6vw,54px);height:clamp(38px,6vw,54px);border-radius:9px;background:rgba(255,255,255,.05);
    border:1px solid var(--line);cursor:pointer;transition:all .2s ${EASE};position:relative}
  .ic-cell.anom{background:${RED};box-shadow:0 0 14px ${RED}}
  .ic-grid.recall .ic-cell{background:rgba(255,255,255,.05)!important;box-shadow:none!important}
  .ic-grid.recall .ic-cell:hover{border-color:var(--text);transform:scale(1.06)}
  .ic-cell.right{background:${GREEN}!important;box-shadow:0 0 14px ${GREEN}}
  .ic-cell.miss{background:${RED}!important}
  .ic-gq{font-size:16px;color:var(--text);height:24px}
  .ic-score{font-family:var(--font-mono);font-size:15px;color:var(--text-dim)}
  .ic-score b{color:${accent};font-size:20px}
  .ic-ctrls{display:flex;gap:10px;justify-content:center;margin-top:12px}
  .ic-btn{font-family:var(--font-tc);font-size:15.5px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:9px 18px;cursor:pointer;transition:all .25s ${EASE}}
  .ic-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .ic-btn.primary{background:var(--accent);color:#08090a;border-color:var(--accent);font-weight:600}
  .ic-btn.hide{display:none}
  `
  el.appendChild(style)

  const scene = document.createElement('div')
  scene.className = 'ic-scene ds-unit'
  scene.innerHTML = `
    <div class="ic-layer" data-l="case">${CASES.map((c, i) => `
      <div class="ic-card" data-c="${i}"><div class="cn">${c.name}</div><div class="cbody">${c.svg}</div>
        <div class="ic-mark" style="left:${c.spot[0]}%;top:${c.spot[1]}%"><span class="lb">這裡</span></div></div>`).join('')}
    </div>
    <div class="ic-layer" data-l="compress"><div class="ic-brainbox">${BRAIN}<div class="ic-pat">pattern 成形</div></div></div>
    <div class="ic-layer" data-l="twin">
      <div class="ic-pipe" data-p="brain"><h4>人腦<span>老師傅的直覺</span></h4>
        <div class="ic-stage" data-s="0"><span class="dot"></span>幾萬次經驗<span class="sub">input</span></div>
        <div class="ic-stage" data-s="1"><span class="dot"></span>壓縮成 pattern<span class="sub">weights</span></div>
        <div class="ic-stage" data-s="2"><span class="dot"></span>一眼秒判斷<span class="sub">output</span></div></div>
      <div class="ic-pipe" data-p="llm"><h4>LLM<span>文字接龍</span></h4>
        <div class="ic-stage" data-s="0"><span class="dot"></span>幾兆字語料<span class="sub">input</span></div>
        <div class="ic-stage" data-s="1"><span class="dot"></span>壓縮成參數<span class="sub">weights</span></div>
        <div class="ic-stage" data-s="2"><span class="dot"></span>predict next token<span class="sub">output</span></div></div>
    </div>
    <div class="ic-layer" data-l="novel"><div style="display:flex;flex-direction:column;align-items:center">
      <div class="ic-novel">? ? ?</div>
      <div class="ic-verdict">
        <div class="ic-vchip" data-w="專家"><span class="who">專家</span><span class="ans">「應該是 A」</span>
          <svg class="ic-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></div>
        <div class="ic-vchip" data-w="LLM"><span class="who">LLM</span><span class="ans">「應該是 A」</span>
          <svg class="ic-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></div>
      </div></div></div>
    <div class="ic-layer ic-game" data-l="game">
      <div class="ic-gq">準備…</div><div class="ic-grid"></div>
      <div class="ic-score">壓縮命中 <b class="sc">0</b> / <span class="tot">3</span></div></div>`

  const ctrls = document.createElement('div')
  ctrls.className = 'ic-ctrls ds-unit'
  ctrls.innerHTML = `<button class="ic-btn primary hide" data-b="start">開始快答</button>
    <button class="ic-btn hide" data-b="reset">重來</button>`

  let stage
  const layer = n => scene.querySelector(`[data-l="${n}"]`)
  const btn = b => ctrls.querySelector(`[data-b="${b}"]`)
  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  function show(name) {
    scene.querySelectorAll('.ic-layer').forEach(l => l.classList.toggle('show', l.dataset.l === name))
  }

  // B1：三張卡閃現 → 各自標出問題點
  function runCase() {
    const cards = [...layer('case').querySelectorAll('.ic-card')]
    cards.forEach((c, i) => {
      c.querySelector('.ic-mark').classList.remove('on')
      T(() => { c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash') }, i * 500)
      T(() => { c.querySelector('.ic-mark').classList.add('on'); pop(c.querySelector('.ic-mark')) }, i * 500 + 500)
    })
  }

  // B2：一堆案例 tile 壓縮進大腦
  function runCompress() {
    const box = layer('compress').querySelector('.ic-brainbox')
    const pat = box.querySelector('.ic-pat')
    box.classList.remove('glow'); pat.classList.remove('on')
    box.querySelectorAll('.ic-tile').forEach(t => t.remove())
    const r = box.getBoundingClientRect()
    const cx = box.clientWidth / 2, cy = box.clientHeight / 2
    for (let i = 0; i < 40; i++) {
      const t = document.createElement('div')
      t.className = 'ic-tile'
      const ang = Math.random() * Math.PI * 2, rad = 120 + Math.random() * 120
      const sx = cx + Math.cos(ang) * rad, sy = cy + Math.sin(ang) * rad
      t.style.left = sx + 'px'; t.style.top = sy + 'px'
      box.appendChild(t)
      T(() => { t.style.transform = `translate(${cx - sx}px,${cy - sy}px) scale(.15)`; t.style.opacity = '0' }, 120 + i * 22)
    }
    T(() => { box.classList.add('glow'); pop(box); pat.classList.add('on') }, 120 + 40 * 22 + 400)
  }

  // B3：兩條 pipeline 同步點亮
  function runTwin() {
    const stages = [...layer('twin').querySelectorAll('.ic-stage')]
    stages.forEach(s => s.classList.remove('lit'))
    for (let step = 0; step < 3; step++) {
      T(() => layer('twin').querySelectorAll(`.ic-stage[data-s="${step}"]`).forEach(s => { s.classList.add('lit'); pop(s) }), 500 + step * 700)
    }
  }

  // B4：新情境兩邊同時猜錯
  function runNovel() {
    const chips = [...layer('novel').querySelectorAll('.ic-vchip')]
    chips.forEach(c => c.classList.remove('wrong'))
    layer('novel').querySelector('.ic-novel').style.opacity = '1'
    T(() => chips.forEach((c, i) => T(() => { c.classList.add('wrong'); shake(c) }, i * 260)), 700)
  }

  // B5：閃卡快答小遊戲
  let round = 0, score = 0
  const grid = layer('game').querySelector('.ic-grid')
  const gq = layer('game').querySelector('.ic-gq')
  const scEl = layer('game').querySelector('.sc'), totEl = layer('game').querySelector('.tot')
  const SIZES = [3, 4, 5]

  function nextRound() {
    if (round >= SIZES.length) {
      gq.textContent = score >= 2 ? '你的壓縮很行 — 直覺機器上線' : '再練幾萬次就準了'
      const r = scene.getBoundingClientRect()
      if (score >= 2) confettiBurst(scene, r.width / 2, r.height / 2, GREEN, 30)
      btn('reset').classList.remove('hide'); btn('start').classList.add('hide')
      return
    }
    const n = SIZES[round]
    grid.className = 'ic-grid'
    grid.style.gridTemplateColumns = `repeat(${n},1fr)`
    grid.innerHTML = ''
    const anom = Math.floor(Math.random() * n * n)
    for (let i = 0; i < n * n; i++) {
      const c = document.createElement('div')
      c.className = 'ic-cell' + (i === anom ? ' anom' : '')
      grid.appendChild(c)
    }
    gq.textContent = `第 ${round + 1} 題 — 記住紅格位置`
    T(() => {
      grid.classList.add('recall')
      gq.textContent = '哪一格有問題？快點它'
      grid.querySelectorAll('.ic-cell').forEach((c, i) => {
        c.onclick = () => {
          grid.querySelectorAll('.ic-cell').forEach(x => x.onclick = null)
          if (i === anom) { c.classList.add('right'); pop(c); score++; scEl.textContent = score; pop(scEl) }
          else { c.classList.add('miss'); shake(c); grid.children[anom].classList.add('right') }
          round++
          T(nextRound, 900)
        }
      })
    }, 750)
  }

  function startGame() {
    round = 0; score = 0; scEl.textContent = '0'; totEl.textContent = SIZES.length
    btn('start').classList.add('hide'); btn('reset').classList.add('hide')
    nextRound()
  }

  function resetGameUI() {
    clearT(); grid.innerHTML = ''; gq.textContent = '準備…'
    round = 0; score = 0; scEl.textContent = '0'
    btn('start').classList.remove('hide'); btn('reset').classList.add('hide')
  }

  function buildBeats() {
    return [
      { narration: '老師傅<b>一眼</b>就知道哪裡有問題 — 這叫<b>直覺</b>。', focus: ['.ic-scene'], nextLabel: '直覺是什麼？ →',
        enter() { clearT(); show('case'); runCase() } },

      { narration: '直覺不是魔法 — 是大腦把<b>幾萬次經驗壓縮成 pattern</b>。', focus: ['.ic-scene'], nextLabel: '這不就是… →',
        enter() { clearT(); show('compress'); runCompress() } },

      { narration: '等等，這不就是<b>文字接龍</b>嗎？經驗→壓縮→判斷，兩邊是同一件事。', focus: ['.ic-scene'], nextLabel: '那會出錯嗎？ →',
        enter() { clearT(); show('twin'); runTwin() } },

      { narration: '直覺會失準的地方：<b>沒見過的分布</b>。丟個全新情境，兩邊<b>一起猜錯</b>。', focus: ['.ic-scene'], nextLabel: '換我當直覺機器 →',
        enter() { clearT(); show('novel'); runNovel() } },

      { narration: '換你當<b>直覺機器</b> — 3 題閃卡，紅格閃一下就消失，看你的「壓縮」夠不夠。', sandbox: true,
        enter() { clearT(); show('game'); resetGameUI(); btn('start').classList.remove('hide'); btn('start').onclick = () => { pop(btn('start')); startGame() }; btn('reset').onclick = () => { pop(btn('reset')); resetGameUI() } } },
    ]
  }

  stage = createStage(el, ctx, { beats: buildBeats() })
  stage.body.append(scene, ctrls)

  return () => { clearT(); stage.destroy(); style.remove() }
}
