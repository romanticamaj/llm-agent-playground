// Demo：編輯鈕是時光機（Context Pollution & Rewind）— DemoStage 導演版
// 6 拍：乾淨對話樹｜標記誤解 → 汙染｜繼續修補 → 紅暈下傳、品質崩｜倒帶長綠枝｜分支同走兩路｜
// sandbox = 自己點節點汙染、倒帶、分支、重來。
import { createStage, pop, shake, confettiBurst } from './_stage.js'

const GREEN = '#4ade80', RED = '#f87171'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const icRewind = `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px"><path d="M11 6 L5 12 L11 18 Z"/><path d="M19 6 L13 12 L19 18 Z"/></svg>`
  const icBranch = `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px"><path d="M12 4 V10"/><path d="M12 10 C12 15 6 14 6 20"/><path d="M12 10 C12 15 18 14 18 20"/><circle cx="12" cy="4" r="1.6"/><circle cx="6" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/></svg>`

  const style = document.createElement('style')
  style.textContent = `
  .cpr-main{display:flex;gap:20px;margin-bottom:14px}
  @media (max-width:760px){.cpr-main{flex-direction:column}}
  .cpr-canvas{position:relative;flex:1;min-height:clamp(340px,52vh,460px);border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.015);overflow:hidden}
  .cpr-edges{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
  .cpr-node{position:absolute;width:212px;box-sizing:border-box;padding:9px 12px;border-radius:11px;border:1px solid rgba(255,255,255,.14);background:#161a24;transform:translate(-50%,0);transition:all .45s cubic-bezier(.4,0,.2,1);opacity:0}
  .cpr-node.show{opacity:1}
  .cpr-node .r{font-size:12px;letter-spacing:.12em;opacity:.6;margin-bottom:3px;font-family:var(--font-mono)}
  .cpr-node .t{font-size:15px;line-height:1.45;color:#e7e9f0}
  .cpr-node.user{background:#1a1f2b}
  .cpr-node.pick{cursor:pointer;border-color:${accent};box-shadow:0 0 0 1px ${accent} inset}
  .cpr-node.pick:hover{background:#1e2740}
  .cpr-node.pick::after{content:'點我標成誤解';position:absolute;right:8px;top:-9px;font-size:10px;background:${accent};color:#05060a;padding:2px 7px;border-radius:8px;letter-spacing:.05em}
  .cpr-node.polluted{border-color:${RED};background:#2a1618;box-shadow:0 0 18px ${RED}73}
  .cpr-node.polluted .r{color:${RED};opacity:.9}
  .cpr-node.origin{animation:cpr-pulse 1.6s ease-in-out infinite}
  .cpr-node.fixed{border-color:${GREEN};background:#132417;box-shadow:0 0 16px ${GREEN}59}
  .cpr-node.fixed .r{color:${GREEN};opacity:.95}
  @keyframes cpr-pulse{0%,100%{box-shadow:0 0 12px ${RED}66}50%{box-shadow:0 0 26px ${RED}cc}}
  .cpr-side{width:220px;display:flex;flex-direction:column;gap:14px}
  @media (max-width:760px){.cpr-side{width:auto}}
  .cpr-box{border:1px solid var(--line);border-radius:12px;padding:14px}
  .cpr-box h4{margin:0 0 10px;font-size:13px;letter-spacing:.14em;color:#8b91a4;font-weight:600;font-family:var(--font-mono)}
  .cpr-score{font-size:40px;font-weight:700;font-family:var(--font-en,'Space Grotesk',sans-serif);line-height:1}
  .cpr-track{height:9px;border-radius:6px;background:rgba(255,255,255,.08);margin-top:12px;overflow:hidden}
  .cpr-fill{height:100%;width:95%;border-radius:6px;transition:width .6s ease,background .6s}
  .cpr-note{font-size:15px;line-height:1.6;color:#9aa0b0}
  .cpr-ctrls{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
  .cpr-btn{font-family:var(--font-tc);font-size:15px;color:var(--text);background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:999px;padding:9px 17px;cursor:pointer;transition:all .2s}
  .cpr-btn:hover{border-color:var(--text)}
  .cpr-btn:disabled{opacity:.4;cursor:default}
  .cpr-btn.hide{display:none}
  .cpr-tag{font-size:13px;padding:3px 9px;border-radius:20px;letter-spacing:.05em}
  .cpr-tag.red{background:${RED}29;color:${RED}}.cpr-tag.green{background:${GREEN}29;color:${GREEN}}
  .cpr-tag.hide{display:none}
  `
  el.appendChild(style)

  const scene = document.createElement('div')
  scene.className = 'cpr-scene ds-unit'
  scene.innerHTML = `
    <div class="cpr-main">
      <div class="cpr-canvas" id="cpr-canvas"><svg class="cpr-edges" id="cpr-edges"></svg></div>
      <div class="cpr-side">
        <div class="cpr-box"><h4>回應品質</h4><div class="cpr-score" id="cpr-score">95%</div>
          <div class="cpr-track"><div class="cpr-fill" id="cpr-fill"></div></div>
          <div class="cpr-note" id="cpr-note" style="margin-top:12px">乾淨的 context，模型認真看你的指令。</div></div>
        <div class="cpr-box"><h4>觀察</h4><div class="cpr-note" id="cpr-obs">誤解一旦寫進 context，之後每一輪都帶著它走 — 不是修補，是複製自己上一個錯。</div></div>
      </div>
    </div>`

  const ctrls = document.createElement('div')
  ctrls.className = 'cpr-ctrls ds-unit'
  ctrls.innerHTML = `
    <button class="cpr-btn hide" data-b="more" disabled>繼續往下修補 →</button>
    <button class="cpr-btn hide" data-b="rewind" disabled>${icRewind} 倒帶到乾淨點</button>
    <button class="cpr-btn hide" data-b="branch" disabled>${icBranch} 分支比較</button>
    <button class="cpr-btn hide" data-b="reset">重來</button>
    <span class="cpr-tag red hide" data-t="p">汙染傳播中</span>
    <span class="cpr-tag green hide" data-t="c">乾淨重生</span>`

  const canvas = scene.querySelector('#cpr-canvas'), edges = scene.querySelector('#cpr-edges')
  const scoreEl = scene.querySelector('#cpr-score'), fillEl = scene.querySelector('#cpr-fill')
  const noteEl = scene.querySelector('#cpr-note'), obsEl = scene.querySelector('#cpr-obs')
  const btn = b => ctrls.querySelector(`[data-b="${b}"]`)
  const tag = t => ctrls.querySelector(`[data-t="${t}"]`)

  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  const COLW = 236, ROWH = 74, TOP = 22
  const POLL = [
    { role: 'user', t: '不是繪圖，是流程自動化。' },
    { role: 'ai', t: '好的，那我幫你做「自動化繪圖流程」…' },
    { role: 'user', t: '跟繪圖完全無關！' },
    { role: 'ai', t: '抱歉，那除了繪圖以外的繪圖自動化…' },
  ]
  const FIX = { role: 'ai', t: '了解，你要專注打造 agent。先從 tool use 開始，我列三步。' }
  const BRANCH = [
    { role: 'ai', t: '路線一：從 Claude Code 上手，邊用邊學 agent loop。' },
    { role: 'ai', t: '路線二：直接用 API 自己組 tool-use loop，理解最透。' },
  ]

  let nodes = [], phase = 'init', score = 95, anchor = null, originNode = null, pollStep = 0, stage
  const centerX = () => canvas.clientWidth / 2

  function place(n) { n.el.style.left = (centerX() + n.col * COLW) + 'px'; n.el.style.top = (TOP + n.row * ROWH) + 'px' }
  function redraw() {
    nodes.forEach(place)
    while (edges.firstChild) edges.removeChild(edges.firstChild)
    nodes.forEach(c => {
      if (!c.parent) return
      const p = c.parent
      const x1 = centerX() + p.col * COLW, y1 = TOP + p.row * ROWH + 30
      const x2 = centerX() + c.col * COLW, y2 = TOP + c.row * ROWH, my = (y1 + y2) / 2
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`)
      path.setAttribute('stroke', c.state === 'polluted' ? RED + '8c' : c.state === 'fixed' ? GREEN + '80' : 'rgba(255,255,255,.18)')
      path.setAttribute('stroke-width', '2'); path.setAttribute('fill', 'none')
      edges.appendChild(path)
    })
  }
  function add(o, parent) {
    const d = document.createElement('div')
    d.className = `cpr-node ${o.role} ${o.state || ''}`
    d.innerHTML = `<div class="r">${o.role === 'user' ? '你' : 'AI'}</div><div class="t">${o.t}</div>`
    canvas.appendChild(d)
    const node = { el: d, role: o.role, t: o.t, col: o.col, row: o.row, state: o.state || 'clean', parent: parent || null }
    place(node); requestAnimationFrame(() => { d.classList.add('show'); redraw() }); nodes.push(node)
    return node
  }
  function setScore(v, color) {
    score = Math.max(0, Math.min(100, v)); scoreEl.textContent = Math.round(score) + '%'; fillEl.style.width = score + '%'
    const c = color || (score > 75 ? GREEN : score > 45 ? '#facc15' : RED)
    fillEl.style.background = c; scoreEl.style.color = c
  }

  function buildClean(pickable) {
    canvas.querySelectorAll('.cpr-node').forEach(n => n.remove())
    nodes = []; phase = 'init'; pollStep = 0
    setScore(95, GREEN)
    noteEl.textContent = '乾淨的 context，模型認真看你的指令。'
    obsEl.textContent = '誤解一旦寫進 context，之後每一輪都帶著它走 — 不是修補，是複製自己上一個錯。'
    tag('p').classList.add('hide'); tag('c').classList.add('hide')
    btn('more').disabled = true; btn('rewind').disabled = true; btn('branch').disabled = true
    const a = add({ role: 'user', t: '幫我規劃學 AI 的路線。', col: 0, row: 0 }, null)
    const b = add({ role: 'ai', t: '好的，先從 LLM 基礎講起。', col: 0, row: 1 }, a)
    anchor = add({ role: 'user', t: '我想專注在 agent。', col: 0, row: 2 }, b)
    originNode = add({ role: 'ai', t: '了解，你要做「AI 繪圖 agent」對吧？', col: 0, row: 3 }, anchor)
    if (pickable) { originNode.el.classList.add('pick'); originNode.el.addEventListener('click', pollute, { once: true }) }
  }
  function pollute() {
    if (phase !== 'init') return
    phase = 'polluted'; originNode.el.classList.remove('pick')
    originNode.el.classList.add('polluted', 'origin'); originNode.state = 'polluted'
    shake(originNode.el); tag('p').classList.remove('hide')
    setScore(78)
    noteEl.textContent = '誤解被寫進 context。它現在是後面所有回應的地基。'
    btn('more').disabled = false; btn('rewind').disabled = false; redraw()
  }
  function addPoll(i) {
    const o = POLL[i], parent = nodes[nodes.length - 1]
    add({ role: o.role, t: o.t, col: 0, row: 4 + i, state: 'polluted' }, parent)
    if (o.role === 'ai') obsEl.textContent = '看到沒 — 模型開始複製自己上一個錯誤回應，而不是聽你的新指令。'
  }
  function more() {
    if (phase !== 'polluted' || pollStep >= POLL.length) return
    addPoll(pollStep++); setScore(score - 13)
    if (pollStep >= POLL.length) { btn('more').disabled = true; noteEl.textContent = '修補到死路。汙染只會累積，不會消失。' }
    else noteEl.textContent = '越修補越歪，品質持續下滑。'
  }
  function spreadAll(instant) {
    if (instant) { for (let i = 0; i < POLL.length; i++) addPoll(i); pollStep = POLL.length; setScore(78 - 13 * POLL.length); }
    else POLL.forEach((_, i) => T(() => more(), 500 + i * 650))
  }
  function rewind(instant) {
    if (phase !== 'polluted') return
    phase = 'rewinding'; btn('more').disabled = true; btn('rewind').disabled = true; tag('p').classList.add('hide')
    const doomed = nodes.filter(n => n.state === 'polluted').sort((a, b) => b.row - a.row)
    const finish = () => {
      const g = add({ role: FIX.role, t: FIX.t, col: 0, row: 3, state: 'fixed' }, anchor)
      pop(g.el); setScore(93, GREEN); tag('c').classList.remove('hide')
      noteEl.textContent = '回到乾淨點重新接龍 — 品質瞬間回升。這就是「編輯」在做的事。'
      phase = 'rewound'; btn('branch').disabled = false
    }
    if (instant) { doomed.forEach(n => { n.el.remove(); nodes = nodes.filter(x => x !== n) }); redraw(); finish(); return }
    let i = 0
    const step = () => {
      if (i < doomed.length) {
        const n = doomed[i++]; n.el.style.transition = 'all .3s'; n.el.style.opacity = '0'; n.el.style.transform = 'translate(-50%,-14px) scale(.85)'
        nodes = nodes.filter(x => x !== n); T(() => { n.el.remove(); redraw() }, 300); T(step, 170)
      } else T(finish, 200)
    }
    step()
  }
  function branch() {
    if (phase !== 'rewound' && phase !== 'branched') return
    nodes.filter(n => n.state === 'fixed').forEach(n => n.el.remove())
    nodes = nodes.filter(n => n.state !== 'fixed')
    const a = add({ role: BRANCH[0].role, t: BRANCH[0].t, col: -1, row: 3, state: 'fixed' }, anchor)
    const b = add({ role: BRANCH[1].role, t: BRANCH[1].t, col: 1, row: 3, state: 'fixed' }, anchor)
    pop(a.el); pop(b.el); phase = 'branched'; btn('branch').disabled = true; setScore(94, GREEN)
    noteEl.textContent = '同時走兩條路，各自在乾淨 context 裡跑 — 分支式對話 context 更小、品質更好。'
    obsEl.textContent = 'Branching = 回去之後開兩個平行宇宙，彼此不互相汙染。'
    const r = canvas.getBoundingClientRect(), br = stage.body.getBoundingClientRect()
    confettiBurst(stage.body, r.left - br.left + r.width / 2, r.top - br.top + 240, GREEN, 26)
    redraw()
  }
  function showCtrls(list) {
    ctrls.querySelectorAll('.cpr-btn').forEach(b => b.classList.toggle('hide', !list.includes(b.dataset.b)))
    if (!list.includes('more')) tag('p').classList.add('hide')
  }

  btn('more').addEventListener('click', () => { pop(btn('more')); more() })
  btn('rewind').addEventListener('click', () => { pop(btn('rewind')); rewind(false) })
  btn('branch').addEventListener('click', () => { pop(btn('branch')); branch() })
  btn('reset').addEventListener('click', () => { pop(btn('reset')); clearT(); buildClean(true) })

  const beats = [
    { narration: '跟 AI 對話是<b>文字接龍</b>。這是一段乾淨的 context，品質 <b>95%</b>。', focus: ['.cpr-canvas'], nextLabel: '標記誤解 →',
      enter() { clearT(); showCtrls([]); buildClean(false) } },

    { narration: '第四句 AI <b>會錯意</b>了。把這個誤會寫進 context — 它成了後面<b>所有回應的地基</b>。', focus: ['.cpr-canvas'], nextLabel: '繼續往下修補 →',
      enter() { clearT(); showCtrls([]); buildClean(false); T(() => pollute(), 500) } },

    { narration: '在汙染上<b>繼續修補</b>：模型開始複製自己的錯，紅暈往下傳，品質<b style="color:' + RED + '">一路崩到死路</b>。', focus: ['.cpr-canvas'], nextLabel: '倒帶救回 →',
      enter() { clearT(); showCtrls([]); buildClean(false); pollute(); spreadAll(false) } },

    { narration: '別再修補了 — <b>倒帶</b>回乾淨點重新接龍，品質<b style="color:' + GREEN + '">瞬間回升</b>。這就是編輯鈕在做的事。', focus: ['.cpr-canvas'], nextLabel: '再進一步：分支 →',
      enter() { clearT(); showCtrls([]); buildClean(false); pollute(); spreadAll(true); T(() => rewind(false), 500) } },

    { narration: '更進一步 <b>分支</b>：回去之後<b>同時走兩條路</b>，各自乾淨、互不汙染 — context 更小、品質更好。', focus: ['.cpr-canvas'], nextLabel: '換你玩 →',
      enter() { clearT(); showCtrls([]); buildClean(false); pollute(); spreadAll(true); rewind(true); T(() => branch(), 500) } },

    { narration: '換你玩 — <b>點那個發亮的 AI 節點</b>標成誤解，再用<b>倒帶</b>、<b>分支</b>救回，<b>重來</b>換一輪。', sandbox: true,
      enter() { clearT(); buildClean(true); showCtrls(['more', 'rewind', 'branch', 'reset']) } },
  ]

  stage = createStage(el, ctx, { beats })
  stage.body.append(scene, ctrls)
  const onResize = () => redraw()
  window.addEventListener('resize', onResize)

  return () => { clearT(); window.removeEventListener('resize', onResize); stage.destroy(); style.remove() }
}
