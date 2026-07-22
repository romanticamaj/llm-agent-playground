// 假記憶拆穿機 — stateless vs stateful
// 左邊純 stateless：新對話問「我叫什麼」答不出來。按「開啟記憶層」後右邊出現 injection 管線：
// 記憶卡片被動畫式塞進 prompt 上方，LLM 才答得出來。進階：Vector vs KG 的接班人查詢對照。
export default function mount(el, ctx) {
  const accent = ctx?.accent || '#ffc24b'
  const RED = '#f87171', GREEN = '#4ade80'
  const P = 'mem'
  const style = document.createElement('style')
  style.textContent = `
  .${P}-root{position:absolute;inset:0;overflow:auto;padding:20px 24px;color:#e8ebf2;box-sizing:border-box;
    font-family:var(--font-tc,'Noto Sans TC',sans-serif)}
  .${P}-guide{font-size:17px;color:#aeb4c4;margin-bottom:14px;line-height:1.6}
  .${P}-guide b{color:${accent}}
  .${P}-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px}
  .${P}-chat{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#0c0f16;display:flex;flex-direction:column;min-height:340px}
  .${P}-chat h3{margin:0;padding:12px 14px;font-size:16px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:8px}
  .${P}-tag{font-size:12px;padding:2px 8px;border-radius:20px;font-weight:600}
  .${P}-tag.off{background:rgba(248,113,113,.15);color:${RED}}
  .${P}-tag.on{background:rgba(74,222,128,.15);color:${GREEN}}
  .${P}-msgs{flex:1;padding:14px;display:flex;flex-direction:column;gap:9px;overflow:auto}
  .${P}-b{max-width:82%;padding:8px 12px;border-radius:12px;font-size:15px;line-height:1.5;opacity:0;transform:translateY(6px);transition:.3s}
  .${P}-b.show{opacity:1;transform:none}
  .${P}-b.user{align-self:flex-end;background:rgba(91,140,240,.16);border:1px solid rgba(91,140,240,.35)}
  .${P}-b.ai{align-self:flex-start;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12)}
  .${P}-b.ai.fail{border-color:rgba(248,113,113,.5);color:#ffd5d5}
  .${P}-b.sys{align-self:center;font-size:13px;color:#8b93a7;background:none;border:1px dashed rgba(255,255,255,.18);border-radius:20px;padding:4px 12px}
  .${P}-inject{align-self:flex-start;max-width:92%;border:1px solid ${accent};border-radius:12px;padding:8px 10px;
    background:rgba(255,194,75,.08);font-size:13.5px;opacity:0;transform:translateX(-14px);transition:.4s}
  .${P}-inject.show{opacity:1;transform:none}
  .${P}-inject .h{color:${accent};font-weight:600;margin-bottom:5px;font-size:13px;letter-spacing:.05em}
  .${P}-card{display:inline-block;background:rgba(255,194,75,.14);border:1px solid rgba(255,194,75,.4);
    border-radius:8px;padding:3px 9px;margin:2px 4px 2px 0;font-size:13.5px}
  .${P}-ctrls{display:flex;gap:10px;justify-content:center;margin:6px 0 4px;flex-wrap:wrap}
  .${P}-big{font-size:17px;padding:12px 26px}
  .${P}-adv{margin-top:18px;border-top:1px solid rgba(255,255,255,.1);padding-top:16px}
  .${P}-adv h3{margin:0 0 6px;font-size:17px}
  .${P}-adv .sub{font-size:14px;color:#8b93a7;margin-bottom:12px}
  .${P}-advctrls{display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap}
  .${P}-advctrls .demo-btn.on{background:${accent};color:#120a00;border-color:${accent}}
  .${P}-q{font-size:15px;color:#dfe3ec;background:rgba(91,140,240,.14);border:1px solid rgba(91,140,240,.32);
    border-radius:10px;padding:8px 12px;display:inline-block;margin-bottom:12px}
  .${P}-stage2{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#0c0f16;padding:16px;min-height:180px}
  .${P}-vecwrap{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
  .${P}-frag{border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:8px 12px;font-size:14px;background:rgba(255,255,255,.03)}
  .${P}-canvas{display:block;width:100%;height:150px}
  .${P}-answer{margin-top:12px;font-size:15px;min-height:24px}
  .${P}-answer .ok{color:${GREEN};font-weight:600}
  .${P}-answer .bad{color:${RED};font-weight:600}
  @media(max-width:820px){.${P}-cols{grid-template-columns:1fr}}
  `
  document.head.appendChild(style)

  const svg = (p, s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block">${p}</svg>`
  const ICO = {
    bubble: '<path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>',
    brain: '<path d="M9 6.5A2.5 2.5 0 0 0 6.5 9 2.5 2.5 0 0 0 5 11.3 2.5 2.5 0 0 0 6 16v.5A2.5 2.5 0 0 0 9 19a2 2 0 0 0 3-.8 2 2 0 0 0 3 .8 2.5 2.5 0 0 0 3-2.5V16a2.5 2.5 0 0 0 1-4.7A2.5 2.5 0 0 0 17.5 9 2.5 2.5 0 0 0 15 6.5a2 2 0 0 0-3 .8 2 2 0 0 0-3-.8Z"/><path d="M12 7.3v11"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14-4.5L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14 4.5L20 16"/><path d="M20 20v-4h-4"/>',
    idcard: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5.5 15.5c.4-1.3 1.4-2 2.5-2s2.1.7 2.5 2"/><path d="M14 10h4M14 13h3"/>',
    palette: '<path d="M12 4a8 8 0 0 0 0 16c1.3 0 1.8-1 1.3-1.8-.6-1 .1-2.2 1.3-2.2H16a4 4 0 0 0 4-4c0-4.4-3.6-8-8-8Z"/><circle cx="8.5" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="10" r="1" fill="currentColor" stroke="none"/>',
  }

  const root = document.createElement('div')
  root.className = `${P}-root`
  root.innerHTML = `
    <div class="${P}-guide">兩個聊天視窗接同一個 LLM。先在左邊自我介紹、開新對話再問一次 —— 看它記不記得。然後按 <b>開啟記憶層</b>，看記憶怎麼被「塞」回去。</div>
    <div class="${P}-cols">
      <div class="${P}-chat">
        <h3>${svg(ICO.bubble, 18)} 對話 A <span class="${P}-tag off">Stateless</span></h3>
        <div class="${P}-msgs" data-msgs="A"></div>
      </div>
      <div class="${P}-chat">
        <h3>${svg(ICO.brain, 18)} 對話 B <span class="${P}-tag off" data-btag>記憶層：關</span></h3>
        <div class="${P}-msgs" data-msgs="B"></div>
      </div>
    </div>
    <div class="${P}-ctrls">
      <button class="demo-btn" data-act="intro">① 自我介紹「我叫 Gary，偏好 dark mode」</button>
      <button class="demo-btn" data-act="ask" disabled>② 開新對話問「我叫什麼？」</button>
      <button class="demo-btn primary ${P}-big" data-act="mem" disabled>${svg(ICO.brain, 18)} 開啟記憶層</button>
    </div>
    <div class="${P}-adv">
      <h3>進階：Vector vs Knowledge Graph</h3>
      <div class="sub">同一個問題，兩種 representation 差在哪 —— 這是分水嶺。</div>
      <div class="${P}-q">賈伯斯的接班人是哪裡人？</div>
      <div class="${P}-advctrls">
        <button class="demo-btn on" data-mode="vector">Vector 模式</button>
        <button class="demo-btn" data-mode="kg">Knowledge Graph 模式</button>
      </div>
      <div class="${P}-stage2">
        <div data-vecbox>
          <div style="font-size:13px;color:#8b93a7;margin-bottom:8px;letter-spacing:.05em">語意相似的片段（湊不出答案）：</div>
          <div class="${P}-vecwrap">
            <div class="${P}-frag">賈伯斯</div><div class="${P}-frag">庫克</div>
            <div class="${P}-frag">Apple</div><div class="${P}-frag">iPhone</div><div class="${P}-frag">CEO</div>
          </div>
        </div>
        <canvas class="${P}-canvas" style="display:none"></canvas>
        <div class="${P}-answer" data-answer><span class="bad">Vector：只知道這些詞語意相關，拼不出「哪裡人」。</span></div>
      </div>
    </div>`
  el.appendChild(root)

  const timers = new Set()
  const after = (ms, fn) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }

  const msgsA = root.querySelector('[data-msgs="A"]')
  const msgsB = root.querySelector('[data-msgs="B"]')
  const btnAsk = root.querySelector('[data-act="ask"]')
  const btnMem = root.querySelector('[data-act="mem"]')
  const btag = root.querySelector('[data-btag]')
  let memOn = false, introduced = false

  function bubble(container, cls, html, delay) {
    const b = document.createElement('div')
    b.className = `${P}-b ${cls}`
    b.innerHTML = html
    container.appendChild(b)
    after(delay, () => { b.classList.add('show'); container.scrollTop = container.scrollHeight })
    return b
  }

  function doIntro() {
    msgsA.innerHTML = ''
    bubble(msgsA, 'user', '我叫 Gary，我偏好 dark mode', 100)
    bubble(msgsA, 'ai', '好的 Gary！已幫你切換 dark mode', 600)
    bubble(msgsA, 'sys', '↑ 這些話留在「對話 A」的 context 裡', 1100)
    introduced = true
    btnAsk.disabled = false
  }

  function doAsk() {
    msgsB.innerHTML = ''
    bubble(msgsB, 'sys', `${svg(ICO.refresh, 14)} 開新對話 — 全新的一次 API call`, 100)
    bubble(msgsB, 'user', '我叫什麼？', 700)
    if (!memOn) {
      bubble(msgsB, 'ai fail', '抱歉，我沒有你的資訊，無法得知你的名字。', 1400)
      bubble(msgsB, 'sys', '✗ 每次 API call 都是全新的 — LLM 是 stateless', 2000)
      btnMem.disabled = false
    } else {
      // injection 管線動畫
      const inj = document.createElement('div')
      inj.className = `${P}-inject`
      inj.innerHTML = `<div class="h">↓ application layer 從外部儲存撈出記憶，塞進 prompt 上方</div>
        <span class="${P}-card">${svg(ICO.idcard, 14)} user 叫 Gary</span><span class="${P}-card">${svg(ICO.palette, 14)} 偏好 dark mode</span>`
      msgsB.appendChild(inj)
      after(1400, () => { inj.classList.add('show'); msgsB.scrollTop = msgsB.scrollHeight })
      bubble(msgsB, 'sys', '↑ 記憶不在模型裡，是每次被 inject 進去的', 2100)
      bubble(msgsB, 'ai', '你叫 <b>Gary</b>，順帶一提，我知道你偏好 dark mode。', 2800)
    }
  }

  root.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act
    if (act === 'intro') doIntro()
    if (act === 'ask') { if (introduced) doAsk() }
    if (act === 'mem') {
      memOn = true
      btag.textContent = '記憶層：開'
      btag.classList.remove('off'); btag.classList.add('on')
      btnMem.disabled = true
      doAsk()
    }
    const mode = e.target.closest('[data-mode]')?.dataset.mode
    if (mode) switchMode(mode)
  })

  // ---- Vector vs KG ----
  const canvas = root.querySelector(`.${P}-canvas`)
  const vecbox = root.querySelector('[data-vecbox]')
  const answer = root.querySelector('[data-answer]')
  const cx = canvas.getContext('2d')
  let raf = 0, kgProgress = 0, kgActive = false, W = 0, H = 0, dpr = 1
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
    root.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('on', b.dataset.mode === mode))
    if (mode === 'vector') {
      kgActive = false; canvas.style.display = 'none'; vecbox.style.display = 'block'
      answer.innerHTML = `<span class="bad">Vector：只知道這些詞語意相關，拼不出「哪裡人」。</span>`
    } else {
      vecbox.style.display = 'none'; canvas.style.display = 'block'
      resize(); kgProgress = 0; kgActive = true
      answer.innerHTML = `<span style="color:#8b93a7">沿著關係走…</span>`
    }
  }

  function kgFrame() {
    raf = requestAnimationFrame(kgFrame)
    if (!kgActive) return
    cx.clearRect(0, 0, W, H)
    const y = H / 2
    if (kgProgress < 1) kgProgress += 0.006
    const nodes = KG.map(n => ({ ...n, px: 20 + n.x * (W - 40), py: y }))
    // 邊
    for (let i = 0; i < nodes.length - 1; i++) {
      const seg = i / (nodes.length - 1)
      const lit = kgProgress > seg
      cx.strokeStyle = lit ? accent : 'rgba(255,255,255,.12)'
      cx.lineWidth = lit ? 2.5 : 1.5
      cx.beginPath(); cx.moveTo(nodes[i].px + 26, y); cx.lineTo(nodes[i + 1].px - 26, y); cx.stroke()
      if (lit) { // 箭頭
        const ax = nodes[i + 1].px - 26
        cx.fillStyle = accent; cx.beginPath()
        cx.moveTo(ax, y); cx.lineTo(ax - 7, y - 4); cx.lineTo(ax - 7, y + 4); cx.fill()
      }
    }
    // 節點
    nodes.forEach((n, i) => {
      const lit = kgProgress > (i - 0.5) / (nodes.length - 1)
      const isRel = n.label === '接班人' || n.label === '出生於'
      cx.fillStyle = lit ? (isRel ? 'rgba(255,194,75,.12)' : 'rgba(255,194,75,.2)') : 'rgba(255,255,255,.05)'
      cx.strokeStyle = lit ? accent : 'rgba(255,255,255,.15)'; cx.lineWidth = 1.5
      const w = Math.max(46, cx.measureText(n.label).width + 24)
      roundRect(n.px - w / 2, y - 15, w, 30, 8); cx.fill(); cx.stroke()
      cx.fillStyle = lit ? '#fff' : '#7b8296'; cx.font = '600 14px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'
      cx.fillText(n.label, n.px, y)
    })
    if (kgProgress >= 1 && !answer.dataset.done) {
      answer.dataset.done = '1'
      answer.innerHTML = `<span class="ok">KG：走完路徑 → 庫克出生於 <b>Alabama</b>。關係性推理答得出來。</span>`
    }
  }

  function roundRect(x, y, w, h, r) {
    cx.beginPath()
    cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r)
    cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath()
  }

  const onResize = () => { if (kgActive) resize() }
  window.addEventListener('resize', onResize)
  raf = requestAnimationFrame(kgFrame)

  return () => {
    cancelAnimationFrame(raf)
    timers.forEach(t => clearTimeout(t)); timers.clear()
    window.removeEventListener('resize', onResize)
    style.remove()
    el.innerHTML = ''
  }
}
