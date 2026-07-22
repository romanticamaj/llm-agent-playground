// Demo：LLM 根本沒有記憶（Stateless）
// 核心互動：聊天視窗 + 右側「API call 內視鏡」，每次送出都把整串歷史打包成一疊卡片飛進 LLM；
// 關掉「重送歷史」開關後，內視鏡只剩孤零零一張卡，AI 就答不出你的名字了。

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const SYSTEM = { role: 'system', text: '你是一個友善的中文助理。' }

  // 固定腳本：使用者依序送出這幾句
  const SCRIPT = ['我叫小明', '我叫什麼？', '我最喜歡藍色', '我最喜歡什麼顏色？']

  const style = document.createElement('style')
  style.textContent = `
  .sl-wrap{position:absolute;inset:0;display:flex;flex-direction:column;gap:14px;padding:22px 28px;box-sizing:border-box;font-family:var(--font-tc,'Noto Sans TC',sans-serif);overflow:auto}
  .sl-lead{font-size:17px;color:#9aa0b0;line-height:1.55}
  .sl-lead b{color:#e8ebf2;font-weight:600}
  .sl-main{flex:1;min-height:360px;display:grid;grid-template-columns:1fr 1fr;gap:18px}
  .sl-col{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(255,255,255,.02);display:flex;flex-direction:column;overflow:hidden}
  .sl-col-h{padding:11px 16px;border-bottom:1px solid rgba(255,255,255,.08);font-size:14px;letter-spacing:.08em;color:#8b91a2;text-transform:uppercase;display:flex;justify-content:space-between;align-items:center}
  .sl-chat{flex:1;overflow:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px}
  .sl-msg{max-width:82%;padding:9px 13px;border-radius:12px;font-size:15.5px;line-height:1.5;animation:sl-in .28s ease}
  @keyframes sl-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .sl-msg.user{align-self:flex-end;background:${accent};color:#05060a;font-weight:500;border-bottom-right-radius:3px}
  .sl-msg.ai{align-self:flex-start;background:rgba(255,255,255,.07);color:#e6e9f0;border-bottom-left-radius:3px}
  .sl-msg.ai.fail{background:rgba(248,113,113,.12);color:#fca5a5;border:1px solid rgba(248,113,113,.3)}
  .sl-msg.sys{align-self:center;font-size:13px;color:#6b7180;background:rgba(255,255,255,.03);border:1px dashed rgba(255,255,255,.12)}
  .sl-scope{flex:1;position:relative;padding:14px;display:flex;flex-direction:column;gap:8px;overflow:auto}
  .sl-scope-note{font-size:14px;color:#7d8496;text-align:center;margin-top:auto;margin-bottom:auto;line-height:1.5}
  .sl-pkt{display:flex;flex-direction:column;gap:7px;align-items:stretch}
  .sl-card{border-radius:9px;padding:8px 12px;font-size:14.5px;border:1px solid rgba(255,255,255,.14);display:flex;gap:9px;align-items:center;opacity:0;transform:translateX(28px)}
  .sl-card.show{opacity:1;transform:none;transition:all .34s cubic-bezier(.2,.7,.2,1)}
  .sl-card .tag{font-size:12px;letter-spacing:.06em;padding:2px 7px;border-radius:5px;flex:none;font-weight:600}
  .sl-card.sys{background:rgba(91,140,255,.08)} .sl-card.sys .tag{background:rgba(91,140,255,.25);color:#bcd0ff}
  .sl-card.user{background:rgba(255,255,255,.05)} .sl-card.user .tag{background:rgba(255,255,255,.14);color:#cfd4e0}
  .sl-card.ai{background:rgba(255,255,255,.03)} .sl-card.ai .tag{background:rgba(255,255,255,.08);color:#9aa0b0}
  .sl-card .body{color:#dfe3ec;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .sl-scope-foot{font-size:14px;color:#8b91a2;padding:8px 4px 0;border-top:1px solid rgba(255,255,255,.07);display:flex;justify-content:space-between}
  .sl-scope-foot b{color:${accent};font-variant-numeric:tabular-nums}
  .sl-toggle{display:flex;align-items:center;gap:9px;cursor:pointer;user-select:none;font-size:15px;color:#c3c8d4}
  .sl-sw{width:38px;height:21px;border-radius:999px;background:rgba(255,255,255,.14);position:relative;transition:background .2s;flex:none}
  .sl-sw::after{content:'';position:absolute;top:2px;left:2px;width:17px;height:17px;border-radius:50%;background:#fff;transition:transform .2s}
  .sl-toggle.on .sl-sw{background:${accent}}
  .sl-toggle.on .sl-sw::after{transform:translateX(17px)}
  .sl-controls{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
  .sl-next-preview{font-size:14.5px;color:#8b91a2}
  .sl-next-preview code{color:#e8ebf2;background:rgba(255,255,255,.06);padding:2px 8px;border-radius:5px}
  .sl-flying{position:absolute;font-size:13px;pointer-events:none;z-index:5}
  `
  el.appendChild(style)

  const wrap = document.createElement('div')
  wrap.className = 'sl-wrap'
  wrap.innerHTML = `
    <div class="sl-lead">你以為的「對話」，其實是每次送出時，系統把<b>整段歷史重新打包</b>再塞給 AI。右邊的內視鏡讓你看見這一疊卡片。把<b>「重送歷史」關掉</b>，AI 就會忘光光 — 因為它<b>本來就沒有記憶</b>。</div>
    <div class="sl-main">
      <div class="sl-col">
        <div class="sl-col-h"><span>聊天視窗</span></div>
        <div class="sl-chat" id="sl-chat"></div>
      </div>
      <div class="sl-col">
        <div class="sl-col-h"><span>API CALL 內視鏡</span><span id="sl-scope-state"></span></div>
        <div class="sl-scope" id="sl-scope">
          <div class="sl-scope-note" id="sl-scope-note">按「送出下一句」，看這次到底送了什麼給 LLM。</div>
        </div>
      </div>
    </div>
    <div class="sl-controls">
      <button class="demo-btn primary" id="sl-send">送出下一句</button>
      <button class="demo-btn" id="sl-reset">重來</button>
      <label class="sl-toggle on" id="sl-toggle"><span class="sl-sw"></span><span>重送歷史</span></label>
      <span class="sl-next-preview" id="sl-preview"></span>
    </div>
  `
  el.appendChild(wrap)

  const $ = (id) => wrap.querySelector(id)
  const chatEl = $('#sl-chat'), scopeEl = $('#sl-scope')
  const btnSend = $('#sl-send'), btnReset = $('#sl-reset')
  const toggle = $('#sl-toggle'), preview = $('#sl-preview')
  const scopeState = $('#sl-scope-state')

  const timers = new Set()
  const setT = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }

  let history = []      // {role, text}（不含 system）
  let scriptIdx = 0
  let resend = true
  let busy = false

  function reset() {
    history = []; scriptIdx = 0; busy = false
    chatEl.innerHTML = ''
    scopeEl.innerHTML = '<div class="sl-scope-note" id="sl-scope-note">按「送出下一句」，看這次到底送了什麼給 LLM。</div>'
    scopeState.textContent = ''
    addChat('sys', SYSTEM.text)
    updatePreview()
  }

  function addChat(kind, text) {
    const d = document.createElement('div')
    d.className = 'sl-msg ' + kind
    d.textContent = text
    chatEl.appendChild(d)
    chatEl.scrollTop = chatEl.scrollHeight
    return d
  }

  function updatePreview() {
    if (scriptIdx >= SCRIPT.length) {
      preview.innerHTML = '腳本結束，可按「重來」再玩一次。'
      btnSend.disabled = true
    } else {
      preview.innerHTML = `下一句：<code>${SCRIPT[scriptIdx]}</code>`
      btnSend.disabled = false
    }
  }

  // 從封包推理回覆
  function replyFor(packet) {
    const userTexts = packet.filter((p) => p.role === 'user').map((p) => p.text)
    const q = userTexts[userTexts.length - 1] || ''
    const joined = userTexts.join('　')
    const nameM = joined.match(/我叫([一-龥A-Za-z]+)/)
    const name = nameM && nameM[1] !== '什麼' ? nameM[1] : null
    const colorM = joined.match(/喜歡(.{1,2})色/)
    const color = colorM && !/什麼/.test(colorM[1]) ? colorM[1] : null

    if (/我叫什麼|我的名字|我是誰/.test(q)) {
      return name
        ? { text: `你叫${name}。`, ok: true }
        : { text: '抱歉，我不知道你叫什麼 — 這次送進來的內容裡沒有你的名字。', ok: false }
    }
    if (/什麼顏色/.test(q)) {
      return color
        ? { text: `你最喜歡的顏色是${color}色。`, ok: true }
        : { text: '嗯…我這次沒看到你提過任何顏色耶。', ok: false }
    }
    if (/我叫/.test(q)) return { text: `你好${name || ''}！很高興認識你。`, ok: true }
    if (/喜歡/.test(q)) return { text: '收到，我知道了。', ok: true }
    return { text: '好的。', ok: true }
  }

  function buildPacket(includeHistory) {
    return includeHistory ? [SYSTEM, ...history] : [SYSTEM, history[history.length - 1]]
  }

  function renderScope(packet) {
    scopeEl.innerHTML = ''
    const pkt = document.createElement('div')
    pkt.className = 'sl-pkt'
    scopeEl.appendChild(pkt)
    const tokens = packet.reduce((s, p) => s + Math.ceil([...p.text].length * 1.4) + 4, 0)

    packet.forEach((item, i) => {
      const card = document.createElement('div')
      const kind = item.role === 'system' ? 'sys' : item.role === 'user' ? 'user' : 'ai'
      card.className = 'sl-card ' + kind
      const label = item.role === 'system' ? 'SYSTEM' : item.role === 'user' ? 'USER' : 'AI'
      card.innerHTML = `<span class="tag">${label}</span><span class="body">${item.text}</span>`
      pkt.appendChild(card)
      setT(() => card.classList.add('show'), 90 + i * 130)
    })

    const foot = document.createElement('div')
    foot.className = 'sl-scope-foot'
    foot.innerHTML = `<span>本次打包 <b>${packet.length}</b> 則訊息</span><span>約 <b>${tokens}</b> tokens</span>`
    setT(() => scopeEl.appendChild(foot), 90 + packet.length * 130)

    scopeState.textContent = resend ? '完整歷史重送' : '只送當前訊息'
    scopeState.style.color = resend ? '#4ade80' : '#f87171'
  }

  function send() {
    if (busy || scriptIdx >= SCRIPT.length) return
    busy = true; btnSend.disabled = true
    const userText = SCRIPT[scriptIdx++]
    addChat('user', userText)
    history.push({ role: 'user', text: userText })

    const packet = buildPacket(resend)
    renderScope(packet)

    const revealDelay = 260 + packet.length * 130
    setT(() => {
      const reply = replyFor(packet)
      const d = addChat('ai' + (reply.ok ? '' : ' fail'), reply.text)
      if (!reply.ok) d.classList.add('fail')
      history.push({ role: 'assistant', text: reply.text })
      busy = false
      updatePreview()
    }, revealDelay)
  }

  toggle.addEventListener('click', () => {
    resend = !resend
    toggle.classList.toggle('on', resend)
  })
  btnSend.addEventListener('click', send)
  btnReset.addEventListener('click', reset)

  reset()

  return () => {
    timers.forEach((id) => clearTimeout(id)); timers.clear()
    style.remove(); wrap.remove()
  }
}
