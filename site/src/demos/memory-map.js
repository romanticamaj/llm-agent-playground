// Demo：記憶不在 AI 裡，在外面 — DemoStage 導演版
// 6 拍：兩窗接同一 LLM｜對話 A 自我介紹｜開新對話問名字（stateless 答不出）｜開記憶層看 inject 管線｜Vector vs KG 走圖譜｜sandbox。
// 核心互動保留：injection 管線動畫（記憶被塞回 prompt）＋ Vector/KG representation 對照。
import { createStage, pop, enterFly } from './_stage.js'

const P = 'mem'
export default function mount(el, ctx) {
  const accent = ctx?.accent || '#ffc24b'
  const RED = '#f87171', GREEN = '#4ade80'
  const style = document.createElement('style')
  style.textContent = `
  .${P}-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
  @media(max-width:820px){.${P}-cols{grid-template-columns:1fr}}
  .${P}-chat{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#0c0f16;display:flex;flex-direction:column;min-height:300px}
  .${P}-chat h3{margin:0;padding:12px 14px;font-size:16px;border-bottom:1px solid rgba(255,255,255,.08);
    display:flex;align-items:center;gap:8px;color:#e8ebf2}
  .${P}-tag{font-family:var(--font-mono);font-size:12.5px;padding:2px 9px;border-radius:20px;font-weight:600;letter-spacing:.08em}
  .${P}-tag.off{background:rgba(248,113,113,.15);color:${RED}}
  .${P}-tag.on{background:rgba(74,222,128,.15);color:${GREEN}}
  .${P}-msgs{flex:1;padding:14px;display:flex;flex-direction:column;gap:9px;overflow:auto}
  .${P}-b{max-width:84%;padding:8px 12px;border-radius:12px;font-size:15px;line-height:1.5}
  .${P}-b.user{align-self:flex-end;background:rgba(91,140,240,.16);border:1px solid rgba(91,140,240,.35);color:#e8ebf2}
  .${P}-b.ai{align-self:flex-start;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:#e8ebf2}
  .${P}-b.ai.fail{border-color:rgba(248,113,113,.5);color:#ffd5d5}
  .${P}-b.ai b{color:${accent}}
  .${P}-b.sys{align-self:center;font-size:14px;color:#8b93a7;background:none;border:1px dashed rgba(255,255,255,.18);border-radius:20px;padding:4px 12px}
  .${P}-inject{align-self:flex-start;max-width:92%;border:1px solid ${accent};border-radius:12px;padding:8px 10px;
    background:rgba(255,194,75,.08)}
  .${P}-inject .h{color:${accent};font-weight:600;margin-bottom:5px;font-size:14px;letter-spacing:.04em}
  .${P}-card{display:inline-block;background:rgba(255,194,75,.14);border:1px solid rgba(255,194,75,.4);
    border-radius:8px;padding:3px 9px;margin:2px 4px 2px 0;font-size:15px;color:#f4e3c3}
  .${P}-ctrls{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:6px}
  .${P}-adv{margin-top:8px;border-top:1px solid rgba(255,255,255,.1);padding-top:16px}
  .${P}-adv h3{margin:0 0 4px;font-size:17px;color:#e8ebf2}
  .${P}-adv .sub{font-size:15px;color:#8b93a7;margin-bottom:12px}
  .${P}-q{font-size:15px;color:#dfe3ec;background:rgba(91,140,240,.14);border:1px solid rgba(91,140,240,.32);
    border-radius:10px;padding:8px 12px;display:inline-block;margin-bottom:12px}
  .${P}-advctrls{display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap}
  .${P}-advctrls .demo-btn.on{background:${accent};color:#120a00;border-color:${accent}}
  .${P}-stage2{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#0c0f16;padding:16px;min-height:170px}
  .${P}-vecwrap{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
  .${P}-frag{border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:8px 12px;font-size:15.5px;background:rgba(255,255,255,.03);color:#d3d7e2}
  .${P}-canvas{display:block;width:100%;height:150px}
  .${P}-answer{margin-top:12px;font-size:15px;min-height:24px}
  .${P}-answer .ok{color:${GREEN};font-weight:600}.${P}-answer .bad{color:${RED};font-weight:600}
  .${P}-answer b{color:${accent}}
  `
  document.head.appendChild(style)

  const cols = document.createElement('div')
  cols.className = `${P}-cols`
  cols.innerHTML = `
    <div class="${P}-chat ds-unit">
      <h3>對話 A <span class="${P}-tag off">STATELESS</span></h3>
      <div class="${P}-msgs" data-msgs="A"></div>
    </div>
    <div class="${P}-chat ds-unit">
      <h3>對話 B <span class="${P}-tag off" data-btag>記憶層：關</span></h3>
      <div class="${P}-msgs" data-msgs="B"></div>
    </div>`

  const ctrls = document.createElement('div')
  ctrls.className = `${P}-ctrls ds-unit`
  ctrls.innerHTML = `
    <button class="demo-btn" data-act="intro">① 自我介紹「我叫 Gary，偏好 dark mode」</button>
    <button class="demo-btn" data-act="ask">② 開新對話問「我叫什麼？」</button>
    <button class="demo-btn primary" data-act="mem">開啟記憶層</button>`

  const adv = document.createElement('div')
  adv.className = `${P}-adv ds-unit`
  adv.innerHTML = `
    <h3>呈現形式的分水嶺：Vector vs Knowledge Graph</h3>
    <div class="sub">同一個問題，兩種 representation 差在哪。</div>
    <div class="${P}-q">賈伯斯的接班人是哪裡人？</div>
    <div class="${P}-advctrls">
      <button class="demo-btn on" data-mode="vector">Vector 模式</button>
      <button class="demo-btn" data-mode="kg">Knowledge Graph 模式</button>
    </div>
    <div class="${P}-stage2">
      <div data-vecbox>
        <div style="font-size:14px;color:#8b93a7;margin-bottom:8px;letter-spacing:.04em">語意相似的片段（湊不出答案）：</div>
        <div class="${P}-vecwrap">
          <div class="${P}-frag">賈伯斯</div><div class="${P}-frag">庫克</div>
          <div class="${P}-frag">Apple</div><div class="${P}-frag">iPhone</div><div class="${P}-frag">CEO</div>
        </div>
      </div>
      <canvas class="${P}-canvas" style="display:none"></canvas>
      <div class="${P}-answer" data-answer><span class="bad">Vector：只知道這些詞語意相關，拼不出「哪裡人」。</span></div>
    </div>`

  let stage
  const timers = new Set()
  const after = (ms, fn) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  const msgsA = cols.querySelector('[data-msgs="A"]')
  const msgsB = cols.querySelector('[data-msgs="B"]')
  const btag = cols.querySelector('[data-btag]')
  let memOn = false, introduced = false

  function bubble(container, cls, html, delay = 0) {
    const b = document.createElement('div')
    b.className = `${P}-b ${cls}`
    b.innerHTML = html
    container.appendChild(b)
    after(delay, () => { enterFly(b, { y: 8, dur: 380 }); container.scrollTop = container.scrollHeight })
    return b
  }

  function doIntro() {
    msgsA.innerHTML = ''
    bubble(msgsA, 'user', '我叫 Gary，我偏好 dark mode', 60)
    bubble(msgsA, 'ai', '好的 Gary！已幫你切換 dark mode', 560)
    bubble(msgsA, 'sys', '↑ 這些話只留在「對話 A」的 context 裡', 1060)
    introduced = true
  }

  function doAsk() {
    msgsB.innerHTML = ''
    bubble(msgsB, 'sys', '開新對話 — 全新的一次 API call', 60)
    bubble(msgsB, 'user', '我叫什麼？', 640)
    if (!memOn) {
      bubble(msgsB, 'ai fail', '抱歉，我沒有你的資訊，無法得知你的名字。', 1300)
      bubble(msgsB, 'sys', 'LLM 是 stateless — 每次 API call 都是全新的', 1900)
    } else {
      const inj = document.createElement('div')
      inj.className = `${P}-inject`
      inj.innerHTML = `<div class="h">↓ application layer 從外部儲存撈出記憶，塞進 prompt 上方</div>
        <span class="${P}-card">user 叫 Gary</span><span class="${P}-card">偏好 dark mode</span>`
      msgsB.appendChild(inj)
      after(1300, () => { enterFly(inj, { y: 0, dur: 460 }); pop(inj, 1.04); msgsB.scrollTop = msgsB.scrollHeight })
      bubble(msgsB, 'sys', '↑ 記憶不在模型裡，是每次被 inject 進去的', 2000)
      bubble(msgsB, 'ai', '你叫 <b>Gary</b>，順帶一提，我知道你偏好 dark mode。', 2700)
    }
  }

  function enableMem() {
    memOn = true
    btag.textContent = '記憶層：開'
    btag.classList.remove('off'); btag.classList.add('on')
  }

  ctrls.addEventListener('click', e => {
    const act = e.target.closest('[data-act]')
    if (!act) return
    pop(act)
    if (act.dataset.act === 'intro') doIntro()
    if (act.dataset.act === 'ask') doAsk()
    if (act.dataset.act === 'mem') { enableMem(); doAsk() }
  })

  // ---- Vector vs KG canvas ----
  const canvas = adv.querySelector(`.${P}-canvas`)
  const vecbox = adv.querySelector('[data-vecbox]')
  const answer = adv.querySelector('[data-answer]')
  const cx = canvas.getContext('2d')
  let raf = 0, kgProgress = 0, kgActive = false, W = 0, H = 0, dpr = 1, kgDone = false
  const KG = [
    { label: '賈伯斯', x: .08 }, { label: '接班人', x: .3 }, { label: '庫克', x: .52 },
    { label: '出生於', x: .74 }, { label: 'Alabama', x: .95 },
  ]

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = canvas.clientWidth; H = canvas.clientHeight
    canvas.width = W * dpr; canvas.height = H * dpr
    cx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  function switchMode(mode) {
    adv.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('on', b.dataset.mode === mode))
    if (mode === 'vector') {
      kgActive = false; canvas.style.display = 'none'; vecbox.style.display = 'block'
      answer.innerHTML = `<span class="bad">Vector：只知道這些詞語意相關，拼不出「哪裡人」。</span>`
    } else {
      vecbox.style.display = 'none'; canvas.style.display = 'block'
      resize(); kgProgress = 0; kgDone = false; kgActive = true
      answer.innerHTML = `<span style="color:#8b93a7">沿著關係走…</span>`
    }
  }
  function roundRect(x, y, w, h, r) {
    cx.beginPath(); cx.moveTo(x + r, y)
    cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r)
    cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath()
  }
  function kgFrame() {
    raf = requestAnimationFrame(kgFrame)
    if (!kgActive) return
    cx.clearRect(0, 0, W, H)
    const y = H / 2
    if (kgProgress < 1) kgProgress += 0.006
    const nodes = KG.map(n => ({ ...n, px: 20 + n.x * (W - 40) }))
    for (let i = 0; i < nodes.length - 1; i++) {
      const lit = kgProgress > i / (nodes.length - 1)
      cx.strokeStyle = lit ? accent : 'rgba(255,255,255,.12)'; cx.lineWidth = lit ? 2.5 : 1.5
      cx.beginPath(); cx.moveTo(nodes[i].px + 26, y); cx.lineTo(nodes[i + 1].px - 26, y); cx.stroke()
      if (lit) {
        const ax = nodes[i + 1].px - 26
        cx.fillStyle = accent; cx.beginPath(); cx.moveTo(ax, y); cx.lineTo(ax - 7, y - 4); cx.lineTo(ax - 7, y + 4); cx.fill()
      }
    }
    nodes.forEach((n, i) => {
      const lit = kgProgress > (i - 0.5) / (nodes.length - 1)
      const rel = n.label === '接班人' || n.label === '出生於'
      cx.fillStyle = lit ? (rel ? 'rgba(255,194,75,.12)' : 'rgba(255,194,75,.2)') : 'rgba(255,255,255,.05)'
      cx.strokeStyle = lit ? accent : 'rgba(255,255,255,.15)'; cx.lineWidth = 1.5
      cx.font = '600 14px sans-serif'
      const w = Math.max(46, cx.measureText(n.label).width + 24)
      roundRect(n.px - w / 2, y - 15, w, 30, 8); cx.fill(); cx.stroke()
      cx.fillStyle = lit ? '#fff' : '#7b8296'; cx.textAlign = 'center'; cx.textBaseline = 'middle'
      cx.fillText(n.label, n.px, y)
    })
    if (kgProgress >= 1 && !kgDone) {
      kgDone = true
      answer.innerHTML = `<span class="ok">KG：走完路徑 → 庫克出生於 <b>Alabama</b>。關係性推理答得出來。</span>`
    }
  }
  adv.addEventListener('click', e => {
    const m = e.target.closest('[data-mode]')
    if (m) switchMode(m.dataset.mode)
  })

  function resetScene() {
    clearT()
    msgsA.innerHTML = ''; msgsB.innerHTML = ''
    memOn = false; introduced = false
    btag.textContent = '記憶層：關'; btag.classList.remove('on'); btag.classList.add('off')
    switchMode('vector')
  }

  const beats = [
    { narration: '兩個聊天視窗接<b>同一個 LLM</b>。你以為它「記得」你 — 這一關拆穿這個假象。',
      focus: [`.${P}-cols`], nextLabel: '先在對話 A 自我介紹 →', enter() { resetScene() } },

    { narration: '在對話 A 自我介紹：<b>我叫 Gary、偏好 dark mode</b>。這些話留在對話 A 的 context 裡。',
      focus: ['[data-msgs="A"]'], nextLabel: '開新對話再問一次 →',
      enter() { resetScene(); doIntro() } },

    { narration: '開一個新對話問「我叫什麼？」— 它<b>答不出來</b>。LLM 是 stateless，每次 API call 都是全新的。',
      focus: ['[data-msgs="B"]'], nextLabel: '開啟記憶層 →',
      enter() { resetScene(); introduced = true; doAsk() } },

    { narration: '記憶不在模型裡 — <b>application layer 每次把它 inject 回 prompt 上方</b>。是有人每次都重新把你介紹給它。',
      focus: ['[data-msgs="B"]'], nextLabel: 'Vector vs KG →',
      enter() { resetScene(); introduced = true; enableMem(); doAsk() } },

    { narration: '呈現形式的分水嶺：Vector 只知道「語意相似」，<b>Knowledge Graph</b> 才能走「賈伯斯→接班人→庫克→出生於→Alabama」的關係路徑。',
      focus: [`.${P}-adv`], nextLabel: '換你玩 →',
      enter() { resetScene(); after(300, () => switchMode('kg')) } },

    { narration: '換你玩 — 自我介紹、開新對話、開關記憶層，再切 <b>Vector / KG</b> 感受 representation 的差別。',
      sandbox: true, enter() { resetScene() } },
  ]

  stage = createStage(el, ctx, { beats })
  stage.body.append(cols, ctrls, adv)
  raf = requestAnimationFrame(kgFrame)
  const onResize = () => { if (kgActive) resize() }
  window.addEventListener('resize', onResize)

  return () => {
    cancelAnimationFrame(raf); clearT()
    window.removeEventListener('resize', onResize)
    stage.destroy(); style.remove()
  }
}
