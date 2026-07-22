// Demo：LLM 根本沒有記憶（Stateless）— DemoStage 導演版
// 5 拍：對話與內視鏡登場｜送第一句看打包｜整串歷史重送 → AI 記得｜關掉重送 → AI 忘光光｜
// sandbox = 自由送出腳本、切換重送歷史、重來。
import { createStage, pop, shake, confettiBurst } from './_stage.js'

const GREEN = '#4ade80', RED = '#f87171'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const SYSTEM = { role: 'system', text: '你是一個友善的中文助理。' }
  const SCRIPT = ['我叫小明', '我叫什麼？', '我最喜歡藍色', '我最喜歡什麼顏色？']

  const style = document.createElement('style')
  style.textContent = `
  .sl-main{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:14px}
  @media (max-width:760px){.sl-main{grid-template-columns:1fr}}
  .sl-col{border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.02);display:flex;flex-direction:column;overflow:hidden;min-height:320px}
  .sl-h{padding:11px 16px;border-bottom:1px solid rgba(255,255,255,.08);font-size:15px;letter-spacing:.08em;color:#8b91a2;text-transform:uppercase;display:flex;justify-content:space-between;align-items:center;font-family:var(--font-mono)}
  .sl-chat{flex:1;overflow:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px}
  .sl-msg{max-width:82%;padding:9px 13px;border-radius:12px;font-size:15.5px;line-height:1.5;animation:sl-in .28s ease}
  @keyframes sl-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .sl-msg.user{align-self:flex-end;background:${accent};color:#05060a;font-weight:500;border-bottom-right-radius:3px}
  .sl-msg.ai{align-self:flex-start;background:rgba(255,255,255,.07);color:#e6e9f0;border-bottom-left-radius:3px}
  .sl-msg.ai.fail{background:${RED}1f;color:#fca5a5;border:1px solid ${RED}4d}
  .sl-msg.sys{align-self:center;font-size:15px;color:#6b7180;background:rgba(255,255,255,.03);border:1px dashed rgba(255,255,255,.12)}
  .sl-scope{flex:1;position:relative;padding:14px;display:flex;flex-direction:column;gap:8px;overflow:auto}
  .sl-note{font-size:15.5px;color:#7d8496;text-align:center;margin:auto;line-height:1.5}
  .sl-pkt{display:flex;flex-direction:column;gap:7px}
  .sl-card{border-radius:9px;padding:8px 12px;font-size:15.5px;border:1px solid rgba(255,255,255,.14);display:flex;gap:9px;align-items:center;opacity:0;transform:translateX(28px)}
  .sl-card.show{opacity:1;transform:none;transition:all .34s cubic-bezier(.2,.7,.2,1)}
  .sl-card .tag{font-size:14px;letter-spacing:.06em;padding:2px 7px;border-radius:5px;flex:none;font-weight:600;font-family:var(--font-mono)}
  .sl-card.sys{background:${accent}14}.sl-card.sys .tag{background:${accent}40;color:#bcd0ff}
  .sl-card.user{background:rgba(255,255,255,.05)}.sl-card.user .tag{background:rgba(255,255,255,.14);color:#cfd4e0}
  .sl-card.ai{background:rgba(255,255,255,.03)}.sl-card.ai .tag{background:rgba(255,255,255,.08);color:#9aa0b0}
  .sl-card .body{color:#dfe3ec;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .sl-foot{font-size:15.5px;color:#8b91a2;padding:8px 4px 0;border-top:1px solid rgba(255,255,255,.07);display:flex;justify-content:space-between}
  .sl-foot b{color:${accent};font-variant-numeric:tabular-nums}
  .sl-ctrls{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
  .sl-btn{font-family:var(--font-tc);font-size:15.5px;color:var(--text);background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:999px;padding:10px 18px;cursor:pointer;transition:all .2s}
  .sl-btn:hover{border-color:var(--text)}
  .sl-btn.primary{background:var(--accent);color:#08090a;border-color:var(--accent);font-weight:600}
  .sl-btn:disabled{opacity:.4;cursor:default}
  .sl-btn.hide{display:none}
  .sl-toggle{display:flex;align-items:center;gap:9px;cursor:pointer;user-select:none;font-size:15px;color:#c3c8d4}
  .sl-toggle.hide{display:none}
  .sl-sw{width:38px;height:21px;border-radius:999px;background:rgba(255,255,255,.14);position:relative;transition:background .2s;flex:none}
  .sl-sw::after{content:'';position:absolute;top:2px;left:2px;width:17px;height:17px;border-radius:50%;background:#fff;transition:transform .2s}
  .sl-toggle.on .sl-sw{background:${accent}}.sl-toggle.on .sl-sw::after{transform:translateX(17px)}
  .sl-prev{font-size:15.5px;color:#8b91a2}
  .sl-prev code{color:#e8ebf2;background:rgba(255,255,255,.06);padding:2px 8px;border-radius:5px}
  `
  el.appendChild(style)

  const scene = document.createElement('div')
  scene.className = 'sl-scene ds-unit'
  scene.innerHTML = `
    <div class="sl-main">
      <div class="sl-col"><div class="sl-h"><span>聊天視窗</span></div><div class="sl-chat" id="sl-chat"></div></div>
      <div class="sl-col"><div class="sl-h"><span>API CALL 內視鏡</span><span id="sl-state"></span></div>
        <div class="sl-scope" id="sl-scope"></div></div>
    </div>`

  const ctrls = document.createElement('div')
  ctrls.className = 'sl-ctrls ds-unit'
  ctrls.innerHTML = `
    <button class="sl-btn primary hide" id="sl-send">送出下一句</button>
    <button class="sl-btn hide" id="sl-reset">重來</button>
    <label class="sl-toggle on hide" id="sl-toggle"><span class="sl-sw"></span><span>重送歷史</span></label>
    <span class="sl-prev" id="sl-prev"></span>`

  const $ = s => scene.querySelector(s) || ctrls.querySelector(s)
  const chatEl = $('#sl-chat'), scopeEl = $('#sl-scope'), stateEl = $('#sl-state')
  const btnSend = $('#sl-send'), btnReset = $('#sl-reset'), toggle = $('#sl-toggle'), prev = $('#sl-prev')

  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  let history = [], scriptIdx = 0, resend = true, busy = false, stage

  function addChat(kind, text) {
    const d = document.createElement('div'); d.className = 'sl-msg ' + kind; d.textContent = text
    chatEl.appendChild(d); chatEl.scrollTop = chatEl.scrollHeight; return d
  }
  function updatePrev() {
    if (scriptIdx >= SCRIPT.length) { prev.innerHTML = '腳本結束，可按「重來」再玩一次。'; btnSend.disabled = true }
    else { prev.innerHTML = `下一句：<code>${SCRIPT[scriptIdx]}</code>`; btnSend.disabled = false }
  }
  function replyFor(packet) {
    const ut = packet.filter(p => p.role === 'user').map(p => p.text)
    const q = ut[ut.length - 1] || '', joined = ut.join('　')
    const nm = joined.match(/我叫([一-龥A-Za-z]+)/), name = nm && nm[1] !== '什麼' ? nm[1] : null
    const cm = joined.match(/喜歡(.{1,2})色/), color = cm && !/什麼/.test(cm[1]) ? cm[1] : null
    if (/我叫什麼|我的名字|我是誰/.test(q)) return name ? { text: `你叫${name}。`, ok: true } : { text: '抱歉，我不知道你叫什麼 — 這次送進來的內容裡沒有你的名字。', ok: false }
    if (/什麼顏色/.test(q)) return color ? { text: `你最喜歡的顏色是${color}色。`, ok: true } : { text: '嗯…我這次沒看到你提過任何顏色耶。', ok: false }
    if (/我叫/.test(q)) return { text: `你好${name || ''}！很高興認識你。`, ok: true }
    if (/喜歡/.test(q)) return { text: '收到，我知道了。', ok: true }
    return { text: '好的。', ok: true }
  }
  function renderScope(packet) {
    scopeEl.innerHTML = ''
    const pkt = document.createElement('div'); pkt.className = 'sl-pkt'; scopeEl.appendChild(pkt)
    const tokens = packet.reduce((s, p) => s + Math.ceil([...p.text].length * 1.4) + 4, 0)
    packet.forEach((item, i) => {
      const kind = item.role === 'system' ? 'sys' : item.role === 'user' ? 'user' : 'ai'
      const label = item.role === 'system' ? 'SYSTEM' : item.role === 'user' ? 'USER' : 'AI'
      const card = document.createElement('div'); card.className = 'sl-card ' + kind
      card.innerHTML = `<span class="tag">${label}</span><span class="body">${item.text}</span>`
      pkt.appendChild(card); T(() => card.classList.add('show'), 90 + i * 130)
    })
    const foot = document.createElement('div'); foot.className = 'sl-foot'
    foot.innerHTML = `<span>本次打包 <b>${packet.length}</b> 則訊息</span><span>約 <b>${tokens}</b> tokens</span>`
    T(() => scopeEl.appendChild(foot), 90 + packet.length * 130)
    stateEl.textContent = resend ? '完整歷史重送' : '只送當前訊息'
    stateEl.style.color = resend ? GREEN : RED
  }
  function buildPacket() { return resend ? [SYSTEM, ...history] : [SYSTEM, history[history.length - 1]] }

  // text 指定則送指定句；否則用腳本
  function doSend(text) {
    if (busy) return
    const userText = text != null ? text : SCRIPT[scriptIdx++]
    if (userText == null) return
    busy = true; btnSend.disabled = true
    addChat('user', userText); history.push({ role: 'user', text: userText })
    const packet = buildPacket(); renderScope(packet)
    T(() => {
      const reply = replyFor(packet)
      addChat('ai' + (reply.ok ? '' : ' fail'), reply.text)
      history.push({ role: 'assistant', text: reply.text })
      const isRecall = /我叫什麼|我的名字|我是誰|什麼顏色/.test(userText)
      if (reply.ok) {
        pop(chatEl.lastChild)
        if (isRecall) { const r = chatEl.lastChild.getBoundingClientRect(), br = stage.body.getBoundingClientRect(); confettiBurst(stage.body, r.left - br.left + 30, r.top - br.top, GREEN, 20) }
      } else shake(chatEl.lastChild)
      busy = false; updatePrev()
    }, 260 + packet.length * 130)
  }
  function resetScene({ script = 0, keepResend } = {}) {
    clearT(); busy = false; history = []; scriptIdx = script
    if (keepResend != null) { resend = keepResend; toggle.classList.toggle('on', resend) }
    chatEl.innerHTML = ''; scopeEl.innerHTML = '<div class="sl-note">按「送出下一句」，看這次到底送了什麼給 LLM。</div>'
    stateEl.textContent = ''; addChat('sys', SYSTEM.text); updatePrev()
  }
  function showCtrls(list) {
    btnSend.classList.toggle('hide', !list.includes('send'))
    btnReset.classList.toggle('hide', !list.includes('reset'))
    toggle.classList.toggle('hide', !list.includes('toggle'))
  }

  toggle.addEventListener('click', () => { resend = !resend; toggle.classList.toggle('on', resend) })
  btnSend.addEventListener('click', () => doSend())
  btnReset.addEventListener('click', () => resetScene({ script: 0, keepResend: true }))

  const beats = [
    { narration: '你以為的<b>對話</b>，其實每次送出都把<b>整段歷史</b>重新打包給 AI。右邊內視鏡讓你看見這一疊卡片。', focus: ['.sl-main'], nextLabel: '送第一句 →',
      enter() { resetScene({ keepResend: true }); showCtrls([]) } },

    { narration: '送第一句「我叫小明」— 內視鏡打包 <b>system + 這句</b> 送出，AI 收下。', focus: ['#sl-scope'], nextLabel: '再問一次 →',
      enter() { resetScene({ keepResend: true }); showCtrls([]); T(() => doSend('我叫小明'), 400) } },

    { narration: '再問「我叫什麼？」— 整串歷史<b>重新打包</b>，名字還在，所以 AI <b>答得出來</b>。這就是「對話感」的真相。', focus: ['#sl-scope'], nextLabel: '關掉重送歷史 →',
      enter() {
        resetScene({ keepResend: true }); showCtrls([])
        T(() => doSend('我叫小明'), 300); T(() => doSend('我叫什麼？'), 1500)
      } },

    { narration: '把<b>「重送歷史」關掉</b>，再問一次名字 — 內視鏡只剩<b style="color:' + RED + '">孤零零一張卡</b>，AI 忘光光，因為它<b>本來就沒記憶</b>。', focus: ['#sl-scope', '#sl-toggle'], nextLabel: '換你玩 →',
      enter() {
        resetScene({ keepResend: false }); showCtrls(['toggle'])
        T(() => doSend('我叫小明'), 300); T(() => doSend('我叫什麼？'), 1400)
      } },

    { narration: '換你玩 — 按<b>送出下一句</b>依序跑腳本，隨時切換<b>重送歷史</b>看 AI 記得或忘記，<b>重來</b>再試。', sandbox: true,
      enter() { resetScene({ script: 0, keepResend: true }); showCtrls(['send', 'reset', 'toggle']) } },
  ]

  stage = createStage(el, ctx, { beats })
  stage.body.append(scene, ctrls)

  return () => { clearT(); stage.destroy(); style.remove() }
}
