// context-pollution-rewind — 對話樹：汙染傳播 vs 倒帶重生
// 核心：標一個「錯誤理解」節點 → 紅暈往下傳、品質下滑；Rewind 跳回乾淨點長綠枝；Branch 同時走兩條。

export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#5b8cff'
  const P = 'cpr'
  const timers = []
  const setT = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id }

  const icRewind = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px"><path d="M11 6 L5 12 L11 18 Z"/><path d="M19 6 L13 12 L19 18 Z"/></svg>`
  const icBranch = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px"><path d="M12 4 V10"/><path d="M12 10 C12 15 6 14 6 20"/><path d="M12 10 C12 15 18 14 18 20"/><circle cx="12" cy="4" r="1.6"/><circle cx="6" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/></svg>`

  const style = document.createElement('style')
  style.textContent = `
  .${P}-root{position:absolute;inset:0;display:flex;flex-direction:column;gap:14px;padding:22px 26px;box-sizing:border-box;color:#e7e9f0;font-family:var(--font-tc,'Noto Sans TC',sans-serif)}
  .${P}-guide{font-size:17px;line-height:1.6;color:#c7cbd8}
  .${P}-guide b{color:${accent}}
  .${P}-main{flex:1;display:flex;gap:20px;min-height:0}
  .${P}-canvas{position:relative;flex:1;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(255,255,255,.015);overflow:hidden}
  .${P}-edges{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
  .${P}-node{position:absolute;width:212px;box-sizing:border-box;padding:9px 12px;border-radius:11px;border:1px solid rgba(255,255,255,.14);background:#161a24;transform:translate(-50%,0);transition:all .45s cubic-bezier(.4,0,.2,1);opacity:0}
  .${P}-node.show{opacity:1}
  .${P}-node .r{font-size:12px;letter-spacing:.12em;opacity:.6;margin-bottom:3px}
  .${P}-node .t{font-size:15px;line-height:1.45}
  .${P}-node.user{background:#1a1f2b}
  .${P}-node.pick{cursor:pointer;border-color:${accent};box-shadow:0 0 0 1px ${accent} inset}
  .${P}-node.pick:hover{background:#1e2740}
  .${P}-node.pick::after{content:'點我標成誤解';position:absolute;right:8px;top:-9px;font-size:10px;background:${accent};color:#05060a;padding:2px 7px;border-radius:8px;letter-spacing:.05em}
  .${P}-node.polluted{border-color:#f87171;background:#2a1618;box-shadow:0 0 18px rgba(248,113,113,.45)}
  .${P}-node.polluted .r{color:#f87171;opacity:.9}
  .${P}-node.origin{animation:${P}-pulse 1.6s ease-in-out infinite}
  .${P}-node.fixed{border-color:#4ade80;background:#132417;box-shadow:0 0 16px rgba(74,222,128,.35)}
  .${P}-node.fixed .r{color:#4ade80;opacity:.95}
  @keyframes ${P}-pulse{0%,100%{box-shadow:0 0 12px rgba(248,113,113,.4)}50%{box-shadow:0 0 26px rgba(248,113,113,.8)}}
  .${P}-side{width:212px;display:flex;flex-direction:column;gap:14px}
  .${P}-box{border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px}
  .${P}-box h4{margin:0 0 10px;font-size:14px;letter-spacing:.14em;color:#8b91a4;font-weight:600}
  .${P}-score{font-size:40px;font-weight:700;font-family:var(--font-en,'Space Grotesk',sans-serif);line-height:1}
  .${P}-track{height:9px;border-radius:6px;background:rgba(255,255,255,.08);margin-top:12px;overflow:hidden}
  .${P}-fill{height:100%;width:95%;border-radius:6px;transition:width .6s ease,background .6s}
  .${P}-note{font-size:15px;line-height:1.6;color:#9aa0b0}
  .${P}-controls{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
  .${P}-controls .demo-btn{font-size:16px}
  .${P}-tag{font-size:13px;padding:3px 9px;border-radius:20px;letter-spacing:.05em}
  .${P}-tag.red{background:rgba(248,113,113,.16);color:#f87171}
  .${P}-tag.green{background:rgba(74,222,128,.16);color:#4ade80}
  `
  el.appendChild(style)

  const root = document.createElement('div')
  root.className = `${P}-root`
  root.innerHTML = `
    <div class="${P}-guide">跟 AI 對話。先<b>點下方那個標記的 AI 節點</b>把它設成「錯誤理解」，看汙染怎麼往下傳、品質怎麼掉；再用 <b>${icRewind} 倒帶</b> 跳回乾淨點重新接龍，或 <b>${icBranch} 分支</b> 同時走兩條路比較。</div>
    <div class="${P}-main">
      <div class="${P}-canvas" id="${P}-canvas"><svg class="${P}-edges" id="${P}-edges"></svg></div>
      <div class="${P}-side">
        <div class="${P}-box">
          <h4>回應品質</h4>
          <div class="${P}-score" id="${P}-score">95%</div>
          <div class="${P}-track"><div class="${P}-fill" id="${P}-fill"></div></div>
          <div class="${P}-note" id="${P}-note" style="margin-top:12px">乾淨的 context，模型認真看你的指令。</div>
        </div>
        <div class="${P}-box">
          <h4>觀察</h4>
          <div class="${P}-note" id="${P}-obs">誤解一旦寫進 context，之後每一輪都帶著它走 — 不是修補，是複製自己上一個錯。</div>
        </div>
      </div>
    </div>
    <div class="${P}-controls">
      <button class="demo-btn" id="${P}-more" disabled>繼續往下修補 →</button>
      <button class="demo-btn" id="${P}-rewind" disabled>${icRewind} 倒帶到乾淨點</button>
      <button class="demo-btn" id="${P}-branch" disabled>${icBranch} 分支比較</button>
      <button class="demo-btn" id="${P}-reset">重來</button>
      <span class="${P}-tag red" id="${P}-tagp" style="display:none">汙染傳播中</span>
      <span class="${P}-tag green" id="${P}-tagc" style="display:none">乾淨重生</span>
    </div>`
  el.appendChild(root)

  const $ = id => root.querySelector(`#${P}-${id}`)
  const canvas = $('canvas'), edges = $('edges')
  const scoreEl = $('score'), fillEl = $('fill'), noteEl = $('note'), obsEl = $('obs')
  const btnMore = $('more'), btnRewind = $('rewind'), btnBranch = $('branch'), btnReset = $('reset')
  const tagP = $('tagp'), tagC = $('tagc')

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

  let nodes = []
  let phase = 'init'
  let score = 95
  const centerX = () => canvas.clientWidth / 2

  function place(n) {
    n.el.style.left = (centerX() + n.col * COLW) + 'px'
    n.el.style.top = (TOP + n.row * ROWH) + 'px'
  }
  function redraw() {
    nodes.forEach(place)
    while (edges.firstChild) edges.removeChild(edges.firstChild)
    nodes.forEach(c => {
      if (!c.parent) return
      const p = c.parent
      const x1 = centerX() + p.col * COLW, y1 = TOP + p.row * ROWH + 30
      const x2 = centerX() + c.col * COLW, y2 = TOP + c.row * ROWH
      const my = (y1 + y2) / 2
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`)
      let col = 'rgba(255,255,255,.18)'
      if (c.state === 'polluted') col = 'rgba(248,113,113,.55)'
      else if (c.state === 'fixed') col = 'rgba(74,222,128,.5)'
      path.setAttribute('stroke', col); path.setAttribute('stroke-width', '2'); path.setAttribute('fill', 'none')
      edges.appendChild(path)
    })
  }
  function add(o, parent) {
    const d = document.createElement('div')
    d.className = `${P}-node ${o.role} ${o.state || ''}`
    d.innerHTML = `<div class="r">${o.role === 'user' ? '你' : 'AI'}</div><div class="t">${o.t}</div>`
    canvas.appendChild(d)
    const node = { el: d, role: o.role, t: o.t, col: o.col, row: o.row, state: o.state || 'clean', parent: parent || null }
    place(node)
    requestAnimationFrame(() => { d.classList.add('show'); redraw() })
    nodes.push(node)
    return node
  }
  function setScore(v, color) {
    score = Math.max(0, Math.min(100, v))
    scoreEl.textContent = Math.round(score) + '%'
    fillEl.style.width = score + '%'
    const c = color || (score > 75 ? '#4ade80' : score > 45 ? '#facc15' : '#f87171')
    fillEl.style.background = c
    scoreEl.style.color = c
  }

  let anchor = null, originNode = null, pollStep = 0

  function build() {
    canvas.querySelectorAll(`.${P}-node`).forEach(n => n.remove())
    nodes = []; phase = 'init'; pollStep = 0
    setScore(95, '#4ade80')
    noteEl.textContent = '乾淨的 context，模型認真看你的指令。'
    obsEl.textContent = '誤解一旦寫進 context，之後每一輪都帶著它走 — 不是修補，是複製自己上一個錯。'
    tagP.style.display = 'none'; tagC.style.display = 'none'
    btnMore.disabled = true; btnRewind.disabled = true; btnBranch.disabled = true
    const a = add({ role: 'user', t: '幫我規劃學 AI 的路線。', col: 0, row: 0 }, null)
    const b = add({ role: 'ai', t: '好的，先從 LLM 基礎講起。', col: 0, row: 1 }, a)
    anchor = add({ role: 'user', t: '我想專注在 agent。', col: 0, row: 2 }, b)
    originNode = add({ role: 'ai', t: '了解，你要做「AI 繪圖 agent」對吧？', col: 0, row: 3 }, anchor)
    originNode.el.classList.add('pick')
    originNode.el.addEventListener('click', pollute, { once: true })
  }

  function pollute() {
    if (phase !== 'init') return
    phase = 'polluted'
    originNode.el.classList.remove('pick')
    originNode.el.classList.add('polluted', 'origin')
    originNode.state = 'polluted'
    tagP.style.display = 'inline-block'
    setScore(78)
    noteEl.textContent = '誤解被寫進 context。它現在是後面所有回應的地基。'
    btnMore.disabled = false; btnRewind.disabled = false
    redraw()
  }

  function more() {
    if (phase !== 'polluted' || pollStep >= POLL.length) return
    const o = POLL[pollStep]
    const parent = nodes[nodes.length - 1]
    add({ role: o.role, t: o.t, col: 0, row: 4 + pollStep, state: 'polluted' }, parent)
    pollStep++
    setScore(score - 13)
    if (o.role === 'ai') obsEl.textContent = '看到沒 — 模型開始複製自己上一個錯誤回應，而不是聽你的新指令。'
    if (pollStep >= POLL.length) { btnMore.disabled = true; noteEl.textContent = '修補到死路。汙染只會累積，不會消失。' }
    else noteEl.textContent = '越修補越歪，品質持續下滑。'
  }

  function rewind() {
    if (phase !== 'polluted') return
    phase = 'rewinding'
    btnMore.disabled = true; btnRewind.disabled = true
    tagP.style.display = 'none'
    const doomed = nodes.filter(n => n.state === 'polluted').sort((a, b) => b.row - a.row)
    let i = 0
    const step = () => {
      if (i < doomed.length) {
        const n = doomed[i++]
        n.el.style.transition = 'all .3s'
        n.el.style.opacity = '0'
        n.el.style.transform = 'translate(-50%,-14px) scale(.85)'
        nodes = nodes.filter(x => x !== n)
        setT(() => { n.el.remove(); redraw() }, 300)
        setT(step, 170)
      } else {
        setT(() => {
          const g = add({ role: FIX.role, t: FIX.t, col: 0, row: 3, state: 'fixed' }, anchor)
          g.el.classList.add('fixed')
          setScore(93, '#4ade80')
          tagC.style.display = 'inline-block'
          noteEl.textContent = '回到乾淨點重新接龍 — 品質瞬間回升。這就是「編輯」在做的事。'
          phase = 'rewound'
          btnBranch.disabled = false
        }, 200)
      }
    }
    step()
  }

  function branch() {
    if (phase !== 'rewound' && phase !== 'branched') return
    nodes.filter(n => n.state === 'fixed').forEach(n => n.el.remove())
    nodes = nodes.filter(n => n.state !== 'fixed')
    const a = add({ role: BRANCH[0].role, t: BRANCH[0].t, col: -1, row: 3, state: 'fixed' }, anchor)
    const b = add({ role: BRANCH[1].role, t: BRANCH[1].t, col: 1, row: 3, state: 'fixed' }, anchor)
    a.el.classList.add('fixed'); b.el.classList.add('fixed')
    phase = 'branched'
    btnBranch.disabled = true
    setScore(94, '#4ade80')
    noteEl.textContent = '同時走兩條路，各自在乾淨 context 裡跑 — 分支式對話 context 更小、品質更好。'
    obsEl.textContent = 'Branching = 回去之後開兩個平行宇宙，彼此不互相汙染。'
    redraw()
  }

  btnMore.addEventListener('click', more)
  btnRewind.addEventListener('click', rewind)
  btnBranch.addEventListener('click', branch)
  btnReset.addEventListener('click', build)
  const onResize = () => redraw()
  window.addEventListener('resize', onResize)

  build()

  return () => {
    timers.forEach(clearTimeout)
    window.removeEventListener('resize', onResize)
    style.remove(); root.remove()
  }
}
