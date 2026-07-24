// Demo：MCP — AI 工具的 USB 接口 — DemoStage 導演版
// 5 拍：人肉複製貼上搬 Gmail｜MCP 端口插上 Gmail 燈亮｜工具清單暴增｜一個協定接萬物｜sandbox 自由插拔＋派任務兩種結局。
import { createStage, pop, shake, enterFly, countUp, confettiBurst } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const GREEN = '#4ade80', RED = '#f87171'

const SERVERS = [
  { id: 'gmail', name: 'Gmail', tools: ['search_mail', 'label_message', 'create_draft', 'send_mail', 'list_labels'] },
  { id: 'calendar', name: 'Calendar', tools: ['list_events', 'create_event', 'find_free_slot'] },
  { id: 'drive', name: 'Drive', tools: ['search_files', 'read_file', 'create_doc'] },
  { id: 'slack', name: 'Slack', tools: ['post_message', 'list_channels', 'search_messages'] },
]
const BASE = ['read_file (本機)', 'run_shell', 'web_search']
const ENV = `<svg viewBox="0 0 40 28" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.6"
  stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="34" height="20" rx="3"/><path d="M4 6l16 11L36 6"/></svg>`
const PLUG = `<svg viewBox="0 0 34 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.6"
  stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="7" width="16" height="10" rx="2"/><path d="M20 10h7M20 14h7M27 9v6"/><path d="M8 7V4M14 7V4"/></svg>`

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#8ea9e8'

  const style = document.createElement('style')
  style.textContent = `
  .mc-scene{position:relative;height:clamp(360px,60vh,520px);border-radius:16px;overflow:hidden;
    background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(0,0,0,.28));border:1px solid var(--line);margin-bottom:14px}
  .mc-layer{position:absolute;inset:0;padding:22px;opacity:0;transform:translateY(14px);pointer-events:none;
    transition:opacity .5s ${EASE},transform .5s ${EASE}}
  .mc-layer.show{opacity:1;transform:none;pointer-events:auto}
  /* manual */
  .mc-manual{display:flex;align-items:center;justify-content:space-between;gap:20px;height:100%}
  .mc-inbox,.mc-chat{width:38%;border-radius:14px;padding:14px;background:rgba(18,22,32,.9);border:1px solid var(--line);
    height:82%;display:flex;flex-direction:column}
  .mc-inbox h4,.mc-chat h4{margin:0 0 12px;font-size:15px;color:var(--text-dim);font-family:var(--font-mono)}
  .mc-mail{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:9px;margin-bottom:8px;
    background:rgba(255,255,255,.04);border:1px solid var(--line);font-size:13.5px;color:var(--text)}
  .mc-mail .ic{width:26px;height:20px;color:${accent};flex:none}
  .mc-manual .mid{font-family:var(--font-mono);font-size:14px;color:var(--text-dim);text-align:center;width:18%}
  .mc-manual .mid b{color:${RED};font-size:18px;display:block;margin-top:6px}
  .mc-fly{position:absolute;width:150px;height:38px;z-index:40;pointer-events:none;display:flex;align-items:center;gap:8px;
    padding:6px 10px;border-radius:9px;background:rgba(28,32,44,.98);border:1px solid ${accent}66;font-size:13px;color:var(--text)}
  /* agent */
  .mc-agent-wrap{display:flex;gap:clamp(16px,3vw,40px);height:100%;align-items:stretch}
  .mc-rail{width:30%;display:flex;flex-direction:column;gap:11px;justify-content:center}
  .mc-srv{display:flex;align-items:center;gap:10px;padding:11px 13px;border-radius:11px;cursor:pointer;
    background:rgba(18,22,32,.9);border:1px solid var(--line);color:var(--text);font-size:15px;transition:all .25s ${EASE}}
  .mc-srv .pl{width:26px;height:20px;color:var(--text-dim);flex:none;transition:color .3s}
  .mc-srv:hover{border-color:var(--text)}
  .mc-srv.on{border-color:${GREEN};background:${GREEN}14}
  .mc-srv.on .pl{color:${GREEN}}
  .mc-srv .st{margin-left:auto;font-family:var(--font-mono);font-size:12px;color:var(--text-dim)}
  .mc-srv.on .st{color:${GREEN}}
  .mc-agent{flex:1;border-radius:14px;background:rgba(14,17,24,.95);border:1px solid ${accent}44;
    display:flex;flex-direction:column;padding:16px;min-width:0}
  .mc-agent h3{margin:0 0 12px;font-size:16px;color:var(--text);display:flex;align-items:center;gap:10px}
  .mc-agent h3 .c{margin-left:auto;font-family:var(--font-mono);font-size:14px;color:var(--text-dim)}
  .mc-agent h3 .c b{color:${accent};font-size:19px}
  .mc-ports{display:flex;gap:8px;margin-bottom:12px}
  .mc-sock{flex:1;height:26px;border-radius:7px;border:1.5px dashed var(--line);display:flex;align-items:center;
    justify-content:center;font-size:11px;font-family:var(--font-mono);color:var(--text-dim);transition:all .3s}
  .mc-sock.lit{border-style:solid;border-color:${GREEN};color:${GREEN};background:${GREEN}12;box-shadow:0 0 12px ${GREEN}44}
  .mc-tools{flex:1;overflow:auto;display:flex;flex-direction:column;gap:6px;padding-right:4px}
  .mc-tool{display:flex;align-items:center;gap:9px;padding:7px 11px;border-radius:8px;font-family:var(--font-mono);
    font-size:13.5px;color:var(--text);background:rgba(255,255,255,.03);border:1px solid var(--line)}
  .mc-tool.base{color:var(--text-dim)}
  .mc-tool .dt{width:7px;height:7px;border-radius:50%;background:${accent};flex:none}
  .mc-tool.base .dt{background:var(--text-dim)}
  .mc-task{margin-top:12px;border-top:1px solid var(--line);padding-top:12px}
  .mc-task .q{font-size:14px;color:var(--text);margin-bottom:9px}
  .mc-log{font-family:var(--font-mono);font-size:13px;line-height:1.7;color:var(--text-dim);min-height:20px;white-space:pre-wrap}
  .mc-log .ok{color:${GREEN}}.mc-log .no{color:${RED}}
  .mc-ctrls{display:flex;gap:10px;justify-content:center;margin-top:12px}
  .mc-btn{font-family:var(--font-tc);font-size:15.5px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:9px 18px;cursor:pointer;transition:all .25s ${EASE}}
  .mc-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .mc-btn.primary{background:var(--accent);color:#08090a;border-color:var(--accent);font-weight:600}
  .mc-btn.hide{display:none}
  `
  el.appendChild(style)

  const scene = document.createElement('div')
  scene.className = 'mc-scene ds-unit'
  scene.innerHTML = `
    <div class="mc-layer" data-l="manual"><div class="mc-manual">
      <div class="mc-inbox"><h4>你的 Gmail</h4><div class="mc-mails"></div></div>
      <div class="mid">手動搬運<b class="cnt">0 / 6</b></div>
      <div class="mc-chat"><h4>聊天視窗（貼上）</h4><div class="mc-pasted" style="display:flex;flex-direction:column;gap:8px"></div></div>
    </div></div>
    <div class="mc-layer" data-l="agent"><div class="mc-agent-wrap">
      <div class="mc-rail">${SERVERS.map(s => `<div class="mc-srv" data-srv="${s.id}"><span class="pl">${PLUG}</span>${s.name}<span class="st">未連接</span></div>`).join('')}</div>
      <div class="mc-agent">
        <h3>Agent<span class="c">可用工具 <b class="tc">3</b></span></h3>
        <div class="mc-ports">${SERVERS.map(s => `<div class="mc-sock" data-srv="${s.id}">${s.name}</div>`).join('')}</div>
        <div class="mc-tools">${BASE.map(t => `<div class="mc-tool base"><span class="dt"></span>${t}</div>`).join('')}</div>
        <div class="mc-task hide"><div class="q">派任務：<b>找出上週的發票郵件</b></div><div class="mc-log"></div></div>
      </div></div></div>`

  const ctrls = document.createElement('div')
  ctrls.className = 'mc-ctrls ds-unit'
  ctrls.innerHTML = `<button class="mc-btn primary hide" data-b="run">執行任務</button>
    <button class="mc-btn hide" data-b="reset">全部拔掉</button>`

  let stage
  const layer = n => scene.querySelector(`[data-l="${n}"]`)
  const btn = b => ctrls.querySelector(`[data-b="${b}"]`)
  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }
  const show = name => scene.querySelectorAll('.mc-layer').forEach(l => l.classList.toggle('show', l.dataset.l === name))

  const connected = new Set()
  const toolsEl = () => layer('agent').querySelector('.mc-tools')
  const tcEl = () => layer('agent').querySelector('.tc')
  const srvEl = id => layer('agent').querySelector(`.mc-srv[data-srv="${id}"]`)
  const sockEl = id => layer('agent').querySelector(`.mc-sock[data-srv="${id}"]`)

  function refreshCount(anim) {
    const n = BASE.length + [...connected].reduce((a, id) => a + SERVERS.find(s => s.id === id).tools.length, 0)
    if (anim) countUp(tcEl(), n, { from: parseInt(tcEl().textContent) || 0, dur: 500, fmt: v => Math.round(v) })
    else tcEl().textContent = n
    pop(tcEl())
  }

  function connect(id, stagger) {
    if (connected.has(id)) return
    connected.add(id)
    const srv = SERVERS.find(s => s.id === id)
    srvEl(id)?.classList.add('on'); const st = srvEl(id)?.querySelector('.st'); if (st) st.textContent = '已連接'
    const sock = sockEl(id); sock.classList.add('lit'); pop(sock)
    const r = scene.getBoundingClientRect(), sr = sock.getBoundingClientRect()
    confettiBurst(scene, sr.left + sr.width / 2 - r.left, sr.top + sr.height / 2 - r.top, GREEN, 12)
    srv.tools.forEach((t, i) => T(() => {
      const row = document.createElement('div')
      row.className = 'mc-tool'; row.dataset.srv = id
      row.innerHTML = `<span class="dt"></span>${t}`
      toolsEl().appendChild(row); enterFly(row, { y: 14, dur: 380 }); pop(row)
      row.scrollIntoView?.({ block: 'nearest' })
    }, (stagger || 0) + i * 130))
    T(() => refreshCount(true), (stagger || 0) + srv.tools.length * 130)
  }

  function disconnect(id) {
    if (!connected.has(id)) return
    connected.delete(id)
    srvEl(id)?.classList.remove('on'); const st = srvEl(id)?.querySelector('.st'); if (st) st.textContent = '未連接'
    sockEl(id)?.classList.remove('lit')
    toolsEl().querySelectorAll(`.mc-tool[data-srv="${id}"]`).forEach(r => r.remove())
    refreshCount(true)
  }

  function resetAgent() {
    clearT(); [...connected].forEach(disconnect); connected.clear()
    toolsEl().querySelectorAll('.mc-tool[data-srv]').forEach(r => r.remove())
    SERVERS.forEach(s => { srvEl(s.id)?.classList.remove('on'); sockEl(s.id)?.classList.remove('lit'); const st = srvEl(s.id)?.querySelector('.st'); if (st) st.textContent = '未連接' })
    refreshCount(false)
    layer('agent').querySelector('.mc-task').classList.add('hide')
    layer('agent').querySelector('.mc-log').innerHTML = ''
  }

  // B1：人肉搬運
  function runManual() {
    const mails = layer('manual').querySelector('.mc-mails'), pasted = layer('manual').querySelector('.mc-pasted'), cnt = layer('manual').querySelector('.cnt')
    mails.innerHTML = ''; pasted.innerHTML = ''; cnt.textContent = '0 / 6'
    const subjects = ['發票 #A-2231', '週報 3/18', '客戶回信 Amy', '出貨通知', '訂閱電子報', '會議邀請']
    subjects.forEach((s, i) => {
      const m = document.createElement('div'); m.className = 'mc-mail'
      m.innerHTML = `<span class="ic">${ENV}</span>${s}`; mails.appendChild(m)
    })
    let done = 0
    ;[...mails.children].forEach((m, i) => T(() => {
      const r = scene.getBoundingClientRect(), mr = m.getBoundingClientRect()
      const ghost = document.createElement('div'); ghost.className = 'mc-fly'
      ghost.innerHTML = `<span style="width:22px;height:18px;color:${accent};flex:none">${ENV}</span>${subjects[i]}`
      ghost.style.left = (mr.left - r.left) + 'px'; ghost.style.top = (mr.top - r.top) + 'px'
      scene.appendChild(ghost)
      const chatR = pasted.getBoundingClientRect()
      ghost.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${chatR.left - mr.left}px,${chatR.top - mr.top + done * 42}px) scale(.9)` }],
        { duration: 900, easing: EASE, fill: 'forwards' }).onfinish = () => {
        ghost.remove(); const p = document.createElement('div'); p.className = 'mc-mail'
        p.innerHTML = `<span class="ic">${ENV}</span>${subjects[i]}`; pasted.appendChild(p); enterFly(p, { y: 8, dur: 300 })
        m.style.opacity = '.3'; done++; cnt.textContent = `${done} / 6`; pop(cnt)
      }
    }, 400 + i * 900))
  }

  // B5：任務兩種結局
  function runTask() {
    const log = layer('agent').querySelector('.mc-log'); log.innerHTML = ''
    const has = connected.has('gmail')
    const lines = has
      ? ['> 規劃：需要讀取郵件', '> 呼叫 <b>search_mail("invoice 上週")</b>', '> 命中 3 封發票郵件', '<span class="ok">完成：已列出 3 張發票</span>']
      : ['> 規劃：需要讀取郵件', '> 尋找 mail 工具…', '<span class="no">找不到任何 mail 工具</span>', '<span class="no">失敗：請先插上 Gmail MCP</span>']
    lines.forEach((ln, i) => T(() => {
      const d = document.createElement('div'); d.innerHTML = ln; log.appendChild(d); enterFly(d, { y: 8, dur: 260 })
      if (i === lines.length - 1) {
        if (has) { const r = scene.getBoundingClientRect(); confettiBurst(scene, r.width / 2, r.height / 2, GREEN, 26) }
        else shake(log)
      }
    }, i * 550))
  }

  function bindSandbox() {
    SERVERS.forEach(s => srvEl(s.id).onclick = () => { pop(srvEl(s.id)); connected.has(s.id) ? disconnect(s.id) : connect(s.id, 0) })
    layer('agent').querySelector('.mc-task').classList.remove('hide')
    btn('run').classList.remove('hide'); btn('run').onclick = () => { pop(btn('run')); runTask() }
    btn('reset').classList.remove('hide'); btn('reset').onclick = () => { pop(btn('reset')); [...connected].forEach(disconnect); layer('agent').querySelector('.mc-log').innerHTML = '' }
  }

  function buildBeats() {
    return [
      { narration: '想讓 AI 讀你的 Gmail？<b>複製、貼上、複製、貼上…</b>一封一封人肉搬。', focus: ['.mc-scene'], nextLabel: '有更好的嗎？ →',
        enter() { clearT(); show('manual'); runManual() } },

      { narration: 'MCP：AI 工具的 <b>USB 接口</b>。把 Gmail 插頭插進 agent 的端口。', focus: ['.mc-scene'], nextLabel: '插上之後？ →',
        enter() { clearT(); resetAgent(); show('agent'); btn('run').classList.add('hide'); btn('reset').classList.add('hide'); T(() => connect('gmail', 300), 500) } },

      { narration: '一插上，工具清單<b>直接長出一排</b> — search_mail、create_draft、send_mail… 從 3 個變 8 個。', focus: ['.mc-scene'], nextLabel: '不只 Gmail →',
        enter() { clearT(); resetAgent(); show('agent'); T(() => connect('gmail', 200), 400) } },

      { narration: '一個協定，<b>接萬物</b>。Calendar、Drive、Slack 排隊插上 — 插一個，亮一排。', focus: ['.mc-scene'], nextLabel: '換我插 →',
        enter() {
          clearT(); resetAgent(); show('agent')
          connect('gmail', 0)
          T(() => connect('calendar', 0), 900)
          T(() => connect('drive', 0), 1800)
          T(() => connect('slack', 0), 2700)
        } },

      { narration: '換你<b>自由插拔</b>四種 MCP server，再派任務「找出上週的發票郵件」— 有沒有插 Gmail，結局不一樣。', sandbox: true,
        enter() { clearT(); resetAgent(); show('agent'); connect('gmail', 200); bindSandbox() } },
    ]
  }

  stage = createStage(el, ctx, { beats: buildBeats() })
  stage.body.append(scene, ctrls)

  return () => { clearT(); stage.destroy(); style.remove() }
}
