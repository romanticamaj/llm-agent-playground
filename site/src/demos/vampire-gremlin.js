// Demo：肩膀上的吸血小鬼（Steve Yegge）— DemoStage 導演版
// 5 拍：任務桌擺滿雜事+難題｜吸血小鬼吸乾雜事｜桌上只剩難題（放大、沉重）｜判斷力密度時間軸對比｜自由丟任務（sandbox）。
import { createStage, pop, shake, countUp, confettiBurst } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const GREEN = '#4ade80', RED = '#f87171'

// 六種卡片：綠 = 雜事（會被吸走）、紅 = 難題（留下）
const CARDS = [
  { t: '填表單', hard: false }, { t: '查資料', hard: false }, { t: '寫樣板 code', hard: false },
  { t: '架構取捨', hard: true }, { t: '人事判斷', hard: true }, { t: '這值得做嗎', hard: true },
]

export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#a78bfa'

  // 手繪吸血小鬼剪影（尖耳、獠牙、小翅膀、蹲踞）
  const GREMLIN = `<svg viewBox="0 0 120 120" width="120" height="120" fill="none"
    stroke="${accent}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M34 30 L24 10 L44 26" fill="${accent}22"/>
    <path d="M86 30 L96 10 L76 26" fill="${accent}22"/>
    <path d="M38 40 Q60 22 82 40 Q92 60 82 82 Q60 100 38 82 Q28 60 38 40Z" fill="rgba(12,10,20,.85)"/>
    <circle cx="49" cy="56" r="4.2" fill="${accent}"/><circle cx="71" cy="56" r="4.2" fill="${accent}"/>
    <path d="M50 74 Q60 82 70 74"/><path d="M54 79 l2 6 M60 80 l0 6 M66 79 l-2 6"/>
    <path d="M32 60 Q12 52 8 66 Q22 66 32 74" fill="${accent}18"/>
    <path d="M88 60 Q108 52 112 66 Q98 66 88 74" fill="${accent}18"/></svg>`

  const style = document.createElement('style')
  style.textContent = `
  .vg-desk{position:relative;height:clamp(300px,50vh,440px);border-radius:16px;overflow:hidden;margin-bottom:16px;
    background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(0,0,0,.28));border:1px solid var(--line)}
  .vg-desk.grim{background:linear-gradient(180deg,${RED}14,rgba(0,0,0,.42))}
  .vg-grain{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% -10%,${accent}14,transparent 55%)}
  .vg-count{position:absolute;top:12px;right:16px;font-family:var(--font-mono);font-size:15px;color:var(--text-dim);
    padding:7px 13px;border-radius:999px;background:rgba(10,12,18,.7);border:1px solid var(--line)}
  .vg-count b{font-size:17px;color:${accent}}
  .vg-task{position:absolute;display:flex;align-items:center;justify-content:center;text-align:center;
    border-radius:10px;font-family:var(--font-tc);will-change:transform,opacity;
    transition:transform .5s ${EASE},opacity .5s,width .6s ${EASE},height .6s ${EASE},font-size .6s}
  .vg-task.chore{width:78px;height:44px;font-size:13.5px;color:#dff5e6;
    background:${GREEN}1c;border:1px solid ${GREEN}66;box-shadow:0 0 0 1px ${GREEN}22}
  .vg-task.hard{width:118px;height:78px;font-size:16px;font-weight:600;color:#ffe0e0;
    background:${RED}1e;border:1px solid ${RED};box-shadow:0 6px 22px -12px ${RED}}
  .vg-task.big{width:150px;height:104px;font-size:19px;box-shadow:0 0 0 1px ${RED}88,0 10px 30px -10px ${RED}}
  .vg-task.gone{opacity:0}
  .vg-gremlin{position:absolute;bottom:-14px;left:-140px;width:120px;height:120px;z-index:20;
    transition:left .7s ${EASE},bottom .7s ${EASE};filter:drop-shadow(0 0 12px ${accent}66)}
  .vg-gremlin.in{left:8px;bottom:8px}
  .vg-tether{position:absolute;height:2px;transform-origin:left center;z-index:15;pointer-events:none;
    background:linear-gradient(90deg,${accent},transparent);opacity:0}
  .vg-timeline{display:flex;flex-direction:column;gap:16px}
  .vg-tl{display:flex;flex-direction:column;gap:6px}
  .vg-tl .lb{font-size:15px;color:var(--text-dim)}.vg-tl .lb b{color:var(--text)}
  .vg-track{display:flex;height:38px;border-radius:9px;overflow:hidden;border:1px solid var(--line)}
  .vg-seg{display:flex;align-items:center;justify-content:center;font-size:14px;color:#0b0d12;font-weight:600;
    transition:width .9s ${EASE};white-space:nowrap;overflow:hidden}
  .vg-seg.chore{background:#6b7280;color:#e5e7eb}
  .vg-seg.judge{background:${accent};color:#0b0d12}
  .vg-seg.judge.full{background:${RED};color:#fff}
  .vg-tray{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
  .vg-card{font-family:var(--font-tc);font-size:15px;color:var(--text);cursor:pointer;padding:9px 15px;border-radius:999px;
    background:rgba(255,255,255,.04);border:1px solid var(--line);transition:all .2s ${EASE}}
  .vg-card:hover{transform:translateY(-1px)}
  .vg-card.chore{border-color:${GREEN}66}.vg-card.chore:hover{border-color:${GREEN}}
  .vg-card.hard{border-color:${RED}66}.vg-card.hard:hover{border-color:${RED}}
  .vg-card .dot{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:7px;vertical-align:middle}
  .vg-card.chore .dot{background:${GREEN}}.vg-card.hard .dot{background:${RED}}
  .vg-btn{font-family:var(--font-tc);font-size:15px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:9px 17px;cursor:pointer;transition:all .25s ${EASE}}
  .vg-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .vg-hidden{display:none}
  `
  el.appendChild(style)

  const wrap = document.createElement('div')
  wrap.innerHTML = `
    <div class="vg-desk ds-unit">
      <div class="vg-grain"></div>
      <div class="vg-count">吸走雜事 <b class="num">0</b></div>
      <div class="vg-gremlin">${GREMLIN}</div>
    </div>
    <div class="vg-timeline ds-unit vg-hidden">
      <div class="vg-tl">
        <div class="lb">以前的一天 — <b>80% 雜事</b>，只有 20% 在做判斷</div>
        <div class="vg-track"><div class="vg-seg chore" data-s="a-chore">雜事 80%</div><div class="vg-seg judge" data-s="a-judge">判斷 20%</div></div>
      </div>
      <div class="vg-tl">
        <div class="lb">現在的一天 — 雜事被吸乾，<b>100% 都是高認知負荷</b></div>
        <div class="vg-track"><div class="vg-seg chore" data-s="b-chore"></div><div class="vg-seg judge full" data-s="b-judge">判斷 100%</div></div>
      </div>
    </div>
    <div class="vg-tray ds-unit vg-hidden">
      ${CARDS.map((c, i) => `<button class="vg-card ${c.hard ? 'hard' : 'chore'}" data-i="${i}"><span class="dot"></span>${c.t}</button>`).join('')}
      <button class="vg-btn" data-b="reset">清空桌面</button>
    </div>`

  let stage
  const $ = s => wrap.querySelector(s)
  const desk = $('.vg-desk'), gremlin = $('.vg-gremlin'), numEl = $('.num')
  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  let sucked = 0, tasks = []   // {el, hard}
  function setCount(n) { sucked = n; countUp(numEl, n, { from: Math.max(0, n - 1), dur: 260, fmt: v => Math.round(v) }) }

  function deskRect() { return desk.getBoundingClientRect() }
  function place(taskEl, x, y) { taskEl.style.left = x + 'px'; taskEl.style.top = y + 'px' }

  // 在桌面上撒一顆任務
  function spawn(hard, atX, atY) {
    const r = deskRect()
    const w = hard ? 118 : 78, h = hard ? 78 : 44
    const card = CARDS.filter(c => c.hard === hard)
    const label = (card[Math.floor(Math.random() * card.length)] || { t: hard ? '難題' : '雜事' }).t
    const t = document.createElement('div')
    t.className = 'vg-task ' + (hard ? 'hard' : 'chore')
    t.textContent = label
    const x = atX != null ? atX : 24 + Math.random() * Math.max(20, r.width - w - 48)
    const y = atY != null ? atY : 20 + Math.random() * Math.max(20, r.height - h - 80)
    place(t, x, y)
    t.style.transform = 'scale(.4)'; t.style.opacity = '0'
    desk.appendChild(t)
    requestAnimationFrame(() => { t.style.transform = 'scale(1)'; t.style.opacity = '1' })
    const rec = { el: t, hard }
    tasks.push(rec)
    return rec
  }

  // 小鬼吸走一顆綠塊：拉出吸血索 → 塊飛向小鬼 → 消失、計數 +1
  function suck(rec, delay) {
    T(() => {
      if (!rec.el.isConnected) return
      const dr = deskRect(), tr = rec.el.getBoundingClientRect(), gr = gremlin.getBoundingClientRect()
      const fromX = tr.left - dr.left + tr.width / 2, fromY = tr.top - dr.top + tr.height / 2
      const toX = gr.left - dr.left + gr.width / 2, toY = gr.top - dr.top + gr.height / 2
      const tether = document.createElement('div')
      tether.className = 'vg-tether'
      const dx = toX - fromX, dy = toY - fromY, len = Math.hypot(dx, dy)
      tether.style.cssText += `left:${fromX}px;top:${fromY}px;width:${len}px;transform:rotate(${Math.atan2(dy, dx)}rad)`
      desk.appendChild(tether)
      tether.animate([{ opacity: 0 }, { opacity: .9 }, { opacity: 0 }], { duration: 460, easing: EASE }).onfinish = () => tether.remove()
      rec.el.style.transform = `translate(${toX - fromX}px,${toY - fromY}px) scale(.15) rotate(30deg)`
      rec.el.style.opacity = '0'
      pop(gremlin, 1.14)
      setCount(sucked + 1)
      T(() => { rec.el.remove(); tasks = tasks.filter(x => x !== rec) }, 480)
    }, delay)
  }

  function clearDesk() { tasks.forEach(t => t.el.remove()); tasks = [] }

  function fillDesk({ chores = 12, hards = 3 } = {}) {
    clearDesk()
    for (let i = 0; i < chores; i++) T(() => spawn(false), i * 70)
    for (let i = 0; i < hards; i++) T(() => spawn(true), 200 + i * 160)
  }

  // 小鬼進場，把所有綠塊逐一吸走（加速）
  function gremlinSweep() {
    gremlin.classList.add('in')
    const chores = tasks.filter(t => !t.hard)
    let d = 500
    chores.forEach((rec, i) => { suck(rec, d); d += Math.max(120, 340 - i * 26) })   // 越吸越快
    return d
  }

  // 只剩紅塊 → 放大佔滿、桌面轉沉重
  function grimMode() {
    desk.classList.add('grim')
    const hards = tasks.filter(t => t.hard)
    hards.forEach((rec, i) => T(() => { rec.el.classList.add('big'); pop(rec.el, 1.1) }, i * 180))
    T(() => shake(desk), hards.length * 180 + 100)
  }

  function animateTimeline() {
    // 先鋪 80/20，再壓成 0/100
    $('[data-s="a-chore"]').style.width = '80%'; $('[data-s="a-judge"]').style.width = '20%'
    $('[data-s="b-chore"]').style.width = '80%'; $('[data-s="b-judge"]').style.width = '20%'
    $('[data-s="b-judge"]').textContent = ''
    T(() => {
      $('[data-s="b-chore"]').style.width = '0%'
      $('[data-s="b-judge"]').style.width = '100%'
      $('[data-s="b-judge"]').textContent = '判斷 100%'
    }, 700)
  }

  // sandbox：丟一張卡到桌上；綠的會被小鬼吸走，紅的留下放大
  $('.vg-tray').addEventListener('click', e => {
    const card = e.target.closest('.vg-card')
    if (card) {
      pop(card)
      const c = CARDS[+card.dataset.i]
      const rec = spawn(c.hard)
      if (!c.hard) suck(rec, 480)
      else { T(() => { rec.el.classList.add('big'); pop(rec.el, 1.08) }, 260) }
      return
    }
    if (e.target.closest('[data-b="reset"]')) { pop(e.target); clearDesk(); setCount(0); desk.classList.remove('grim') }
  })

  function resetScene() {
    clearT(); clearDesk(); setCount(0)
    desk.classList.remove('grim'); gremlin.classList.remove('in')
    $('.vg-timeline').classList.add('vg-hidden'); $('.vg-tray').classList.add('vg-hidden')
    numEl.textContent = '0'
  }

  function buildBeats() {
    return [
      { narration: '這是你<b>今天的任務桌</b> — 一堆小綠塊是雜事（填表、查資料、寫樣板），幾顆大紅塊是難題（架構取捨、人事判斷）。', focus: ['.vg-desk'], nextLabel: 'AI 來了 →',
        enter() { resetScene(); fillDesk({ chores: 13, hards: 3 }) } },

      { narration: 'AI 來了 — 肩膀上的<b>吸血小鬼</b>。它把所有雜事一顆顆吸乾，越吸越快。', focus: ['.vg-desk'], nextLabel: '看桌上剩什麼 →',
        enter() { resetScene(); fillDesk({ chores: 13, hards: 3 }); T(() => gremlinSweep(), 900) } },

      { narration: '桌上剩下的，<b>全是難題</b>。它們放大、佔滿整張桌 — 每一顆都得你親自扛。', focus: ['.vg-desk'], nextLabel: '這代表什麼？ →',
        enter() { resetScene(); for (let i = 0; i < 3; i++) T(() => spawn(true, 40 + i * 170, 90 + (i % 2) * 40), i * 140); T(() => grimMode(), 700) } },

      { narration: '這不是變輕鬆 — 是<b>判斷力密度</b>變高了。以前 80% 時間在雜事，現在整天都是高認知負荷的硬決策。', focus: ['.vg-timeline'], nextLabel: '換你丟任務 →',
        enter() { resetScene(); $('.vg-timeline').classList.remove('vg-hidden'); T(() => animateTimeline(), 300) } },

      { narration: '換你玩 — 往桌上丟任務。<b>綠色雜事</b>會被小鬼吸走，<b>紅色難題</b>留下來給你。試試看桌上最後剩什麼。', sandbox: true,
        enter() { resetScene(); gremlin.classList.add('in'); $('.vg-tray').classList.remove('vg-hidden') } },
    ]
  }

  stage = createStage(el, ctx, { beats: buildBeats() })
  stage.body.append(wrap)

  return () => { clearT(); stage.destroy(); style.remove() }
}
