// Demo：跑在哪，是開關，不是屬性 — DemoStage 導演版
// 6 拍：local 四口全亮｜切 cloud，shell/MCP 熄燈（課堂那一幕）｜檔案繞回 Desktop、關掉就斷｜
//       廠商靜默改預設｜本地也會沙箱逃逸｜sandbox 自由切模式／開關 Desktop／點口看說明。
import { createStage, pop, shake, enterFly } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const GREEN = '#4ade80', RED = '#f87171', AMBER = '#fbbf24'
const P = 'ee'

const sv = d => `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor"
  stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
const IC = {
  cloud: sv('<path d="M7 18h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 5.7 11.2 3.4 3.4 0 0 0 7 18z"/>'),
  monitor: sv('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M9 20h6M12 16v4"/>'),
  vm: sv('<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/>'),
  desk: sv('<rect x="3" y="5" width="18" height="11" rx="2"/><path d="M2 19h20"/><path d="M8 16l-1 3M16 16l1 3"/>'),
  globe: sv('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.4 2.6 2.4 14.4 0 17-2.4-2.6-2.4-14.4 0-17z"/>'),
  folder: sv('<path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4L10.5 8h9A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z"/>'),
  term: sv('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3"/><path d="M12.5 15H17"/>'),
  plug: sv('<rect x="3" y="8" width="11" height="8" rx="2"/><path d="M14 11h6M14 15h6M20 9.5v7"/><path d="M6 8V4.5M11 8V4.5"/>'),
  x: sv('<path d="M6 6l12 12M18 6L6 18"/>'),
  loop: sv('<path d="M4 11a8 8 0 0 1 13.7-5.6L20 8"/><path d="M20 13a8 8 0 0 1-13.7 5.6L4 16"/><path d="M20 4v4h-4M4 20v-4h4"/>'),
}

// 四個能力口 × 兩種模式
const PORTS = [
  { id: 'web', name: 'web 工具', icon: IC.globe,
    local: ['on', '搜尋、抓網頁 — <b>兩種模式都有</b>這個口，這一項沒有差別。'],
    cloud: ['on', '搜尋、抓網頁 — <b>兩種模式都有</b>這個口，這一項沒有差別。'] },
  { id: 'files', name: '本地資料夾', icon: IC.folder,
    local: ['on', 'agent loop 就在你機器上，<b>直接</b>讀寫你連結的資料夾。'],
    cloud: ['proxy', '雲端 session 要碰你的檔案，得<b>繞回你電腦上的 Claude Desktop</b> — 只限你明確連結的資料夾，每一次工具呼叫都對照權限檢查。'],
    dead: ['off', '<b>Claude Desktop 離線 → 雲端 session 就碰不到你的電腦了。</b>那條線是活的，不是永久打通。'] },
  { id: 'shell', name: 'shell 指令', icon: IC.term,
    local: ['on', '指令跑在<b>本機隔離 VM</b> 裡（macOS: Virtualization.framework／Windows: Hyper-V）。'],
    cloud: ['off', '雲端模式<b>沒開這個口</b>。不是「比較弱」— 是這個模式根本沒有 shell。'] },
  { id: 'mcp', name: 'plugin MCP server', icon: IC.plug,
    local: ['on', '<b>只有 local session</b> 支援 plugin MCP server。'],
    cloud: ['off', '課堂那一幕：在 Cowork 裡下指令裝 MCP，<b>裝不動</b> — 因為這個模式沒有 shell，也不支援 plugin MCP。'] },
]

const SUMMARY = {
  local: '<b>Local session</b>：agent loop 在你的裝置上，程式在本機隔離 VM 執行 — 四個口全開。點任一個口看細節。',
  cloud: '<b>Cloud session</b>：agent loop 與程式執行都在 Anthropic 的隔離 sandbox — shell 與 MCP 兩個口沒開。點任一個口看細節。',
}

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'

  const style = document.createElement('style')
  style.textContent = `
  .${P}-top{display:flex;align-items:center;gap:13px;flex-wrap:wrap;margin-bottom:13px}
  .${P}-top .lb{font-size:15.5px;color:var(--text-dim)}
  .${P}-sw{position:relative;display:flex;padding:4px;border-radius:999px;
    background:rgba(255,255,255,.05);border:1px solid var(--line)}
  .${P}-sw button{position:relative;z-index:1;font-family:var(--font-tc);font-size:15.5px;color:var(--text-dim);
    background:none;border:none;border-radius:999px;padding:8px 18px;cursor:pointer;transition:color .35s ${EASE}}
  .${P}-sw button.on{color:#08090a;font-weight:700}
  .${P}-sw .knob{position:absolute;top:4px;bottom:4px;left:4px;width:0;border-radius:999px;background:${accent};
    transition:left .55s ${EASE},width .55s ${EASE}}
  .${P}-btn{font-family:var(--font-tc);font-size:15px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:9px 17px;cursor:pointer;transition:all .25s ${EASE}}
  .${P}-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .${P}-btn.hide{display:none}
  .${P}-btn.dead{color:${RED};border-color:${RED}66}

  .${P}-diagram{position:relative;display:grid;
    grid-template-columns:1fr clamp(190px,19vw,260px) 1fr;align-items:stretch}
  .${P}-env{position:relative;border:1px solid var(--line);border-radius:14px;background:rgba(18,22,32,.82);
    padding:12px 14px;display:flex;flex-direction:column;gap:8px;
    transition:border-color .45s ${EASE},background .45s ${EASE}}
  .${P}-env.active{border-color:${accent}88;background:rgba(24,30,44,.94)}
  .${P}-hd{display:flex;align-items:center;gap:9px}
  .${P}-hd .ic{width:21px;height:21px;flex:none;color:var(--text-dim);transition:color .45s}
  .${P}-env.active .${P}-hd .ic{color:${accent}}
  .${P}-hd b{font-size:16.5px;color:var(--text);letter-spacing:.01em}
  .${P}-hd i{font-style:normal;margin-left:auto;font-family:var(--font-mono);font-size:11.5px;
    letter-spacing:.14em;color:var(--text-dim)}
  .${P}-note{font-size:14px;line-height:1.5;color:var(--text-dim);display:flex;gap:7px}
  .${P}-note s{text-decoration:none;color:${accent};flex:none}
  .${P}-slot{height:44px;border-radius:11px;border:1px dashed rgba(255,255,255,.15)}
  .${P}-vm{position:relative;border:1px solid rgba(255,255,255,.15);border-radius:12px;
    padding:9px 11px;background:rgba(255,255,255,.03);display:flex;flex-direction:column;gap:7px}
  .${P}-vm .t{font-size:14.5px;color:var(--text);display:flex;align-items:center;gap:7px}
  .${P}-vm .t .ic{width:16px;height:16px;flex:none;color:var(--text-dim)}
  .${P}-crack{position:absolute;inset:-1px;width:calc(100% + 2px);height:calc(100% + 2px);
    opacity:0;pointer-events:none;transition:opacity .3s}
  .${P}-crack path{stroke:${RED};stroke-width:2;fill:none;filter:drop-shadow(0 0 6px ${RED}aa)}
  .${P}-leak{position:absolute;width:8px;height:8px;border-radius:50%;background:${RED};
    box-shadow:0 0 12px ${RED};opacity:0;pointer-events:none}
  .${P}-fold{display:flex;align-items:center;gap:8px;font-size:14.5px;color:var(--text-dim);
    padding:8px 11px;border-radius:11px;background:rgba(255,255,255,.03);border:1px solid var(--line);
    transition:all .4s ${EASE}}
  .${P}-fold .ic{width:17px;height:17px;flex:none}
  .${P}-fold.lit{color:var(--text);border-color:${AMBER}77}
  .${P}-fold.lit .ic{color:${AMBER}}

  .${P}-chan{display:grid;grid-template-columns:1fr auto 1fr;align-items:center}
  .${P}-wire{position:relative;height:2px;
    background:repeating-linear-gradient(90deg,rgba(255,255,255,.2) 0 6px,transparent 6px 12px)}
  .${P}-wire.on{background:repeating-linear-gradient(90deg,${AMBER} 0 6px,transparent 6px 12px)}
  .${P}-wire.cut{background:repeating-linear-gradient(90deg,${RED}66 0 4px,transparent 4px 11px)}
  .${P}-wire .dot{position:absolute;top:50%;left:0;width:7px;height:7px;border-radius:50%;background:${AMBER};
    box-shadow:0 0 12px ${AMBER};transform:translate(-50%,-50%);opacity:0}
  .${P}-wire .cx{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
    width:15px;height:15px;color:${RED};opacity:0;transition:opacity .3s}
  .${P}-wire.cut .cx{opacity:1}
  .${P}-desk{width:clamp(112px,11.5vw,150px);display:flex;flex-direction:column;align-items:center;gap:5px;
    padding:11px 9px;border:1px solid var(--line);border-radius:13px;background:rgba(18,22,32,.94);
    transition:all .42s ${EASE}}
  .${P}-desk .ic{width:24px;height:24px;color:var(--text-dim);transition:color .4s}
  .${P}-desk.on{border-color:${AMBER}88}
  .${P}-desk.on .ic{color:${AMBER}}
  .${P}-desk.dead{opacity:.5;border-color:${RED}66}
  .${P}-desk.dead .ic{color:${RED}}
  .${P}-desk b{font-size:14.5px;color:var(--text);text-align:center;line-height:1.35;font-weight:600}
  .${P}-desk i{font-style:normal;font-family:var(--font-mono);font-size:11px;letter-spacing:.1em;color:var(--text-dim)}

  .${P}-loop{position:absolute;z-index:20;width:max-content;margin:0;display:flex;align-items:center;gap:8px;
    padding:9px 15px;border-radius:999px;background:${accent};color:#08090a;font-size:14.5px;font-weight:700;
    box-shadow:0 12px 34px -12px ${accent};transition:left .8s ${EASE},top .8s ${EASE}}
  .${P}-loop .ic{width:16px;height:16px;flex:none;animation:${P}spin 3.4s linear infinite}
  @keyframes ${P}spin{to{transform:rotate(360deg)}}

  .${P}-ports{display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-top:13px}
  .${P}-port{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:12px;
    background:rgba(18,22,32,.8);border:1px solid var(--line);cursor:pointer;text-align:left;
    font-family:var(--font-tc);transition:all .38s ${EASE}}
  .${P}-port:hover{border-color:var(--text)}
  .${P}-port.sel{border-color:${accent}}
  .${P}-port .lamp{width:28px;height:28px;flex:none;border-radius:9px;display:flex;align-items:center;
    justify-content:center;color:var(--text-dim);background:rgba(255,255,255,.05);transition:all .4s ${EASE}}
  .${P}-port .lamp>svg{width:17px;height:17px}
  .${P}-port.on .lamp{color:${GREEN};background:${GREEN}1e;box-shadow:0 0 15px ${GREEN}33}
  .${P}-port.proxy .lamp{color:${AMBER};background:${AMBER}1e;box-shadow:0 0 15px ${AMBER}33}
  .${P}-port.off{opacity:.55}
  .${P}-port.off .lamp{color:${RED};background:${RED}16}
  .${P}-port .nm{display:block;font-size:15.5px;color:var(--text);line-height:1.3}
  .${P}-port .st{display:block;font-size:12.5px;font-family:var(--font-mono);color:var(--text-dim);margin-top:3px}
  .${P}-port.on .st{color:${GREEN}}
  .${P}-port.proxy .st{color:${AMBER}}
  .${P}-port.off .st{color:${RED}}

  .${P}-detail{margin-top:11px;padding:12px 16px;border-radius:12px;border:1px dashed var(--line);
    background:rgba(255,255,255,.03);font-size:15.5px;line-height:1.55;color:var(--text);min-height:56px;
    display:flex;align-items:center}
  .${P}-detail b{color:var(--accent)}

  /* 浮動元素放在 .ee-diagram（position:relative）內，不是 .ds-body 直接子層 */
  .${P}-ghost{position:absolute;z-index:40;width:max-content;max-width:min(360px,44vw);margin:0;
    font-family:var(--font-tc);font-size:14.5px;line-height:1.45;padding:9px 13px;border-radius:11px;
    background:rgba(14,17,24,.97);border:1px solid var(--accent);color:var(--text);
    box-shadow:0 16px 38px -18px #000;pointer-events:none}
  .${P}-ghost.warn{border-color:${RED};color:${RED}}
  .${P}-ghost.mono{font-family:var(--font-mono);font-size:13.5px}
  @media (max-width:980px){
    .${P}-diagram{grid-template-columns:1fr}
    .${P}-chan{grid-template-columns:1fr auto 1fr;padding:10px 0}
    .${P}-ports{grid-template-columns:repeat(2,1fr)}
    .${P}-loop{display:none}
  }
  `
  el.appendChild(style)

  /* ---------- 場景 DOM ---------- */
  const top = document.createElement('div')
  top.className = `${P}-top ds-unit`
  top.innerHTML = `
    <span class="lb">執行模式</span>
    <div class="${P}-sw"><i class="knob"></i>
      <button type="button" data-mode="local">Local session</button>
      <button type="button" data-mode="cloud">Cloud session</button>
    </div>
    <button class="${P}-btn hide" data-b="desk" type="button">Claude Desktop：開著</button>
    <button class="${P}-btn hide" data-b="reset" type="button">重來</button>`

  const diagram = document.createElement('div')
  diagram.className = `${P}-diagram`
  diagram.innerHTML = `
    <div class="${P}-env ds-unit" data-env="cloud">
      <div class="${P}-hd"><span class="ic">${IC.cloud}</span><b>Anthropic 雲端 sandbox</b><i>REMOTE</i></div>
      <div class="${P}-slot" data-slot="cloud"></div>
      <div class="${P}-note"><s>—</s><span>agent loop 與程式執行<b>都在這裡</b></span></div>
      <div class="${P}-note"><s>—</s><span>每個 session 一個，結束即銷毀、不共用狀態</span></div>
      <div class="${P}-note"><s>—</s><span>連不到內網／link-local／cloud metadata；對外流量強制走 proxy，改不掉也繞不過</span></div>
    </div>
    <div class="${P}-chan ds-unit">
      <span class="${P}-wire" data-w="l"><i class="dot"></i><span class="cx">${IC.x}</span></span>
      <div class="${P}-desk" data-desk><span class="ic">${IC.desk}</span><b>Claude Desktop</b><i>在你電腦上</i></div>
      <span class="${P}-wire" data-w="r"><i class="dot"></i><span class="cx">${IC.x}</span></span>
    </div>
    <div class="${P}-env ds-unit" data-env="local">
      <div class="${P}-hd"><span class="ic">${IC.monitor}</span><b>你的電腦</b><i>LOCAL</i></div>
      <div class="${P}-vm" data-vm>
        <div class="t"><span class="ic">${IC.vm}</span>本機隔離 VM</div>
        <div class="${P}-slot" data-slot="local"></div>
        <div class="${P}-note"><s>—</s><span>macOS: Virtualization.framework／Windows: Hyper-V — shell 在這裡跑</span></div>
        <svg class="${P}-crack" viewBox="0 0 100 60" preserveAspectRatio="none">
          <path d="M14 0 L26 17 L15 28 L33 41 L27 60" vector-effect="non-scaling-stroke"/></svg>
      </div>
      <div class="${P}-fold" data-fold><span class="ic">${IC.folder}</span>你明確連結的資料夾</div>
      <span class="${P}-leak" data-leak></span>
    </div>
    <div class="${P}-loop" data-loop><span class="ic">${IC.loop}</span>agent loop</div>`

  const ports = document.createElement('div')
  ports.className = `${P}-ports ds-unit`
  ports.innerHTML = PORTS.map(p => `
    <button class="${P}-port" type="button" data-p="${p.id}">
      <span class="lamp">${p.icon}</span>
      <span><span class="nm">${p.name}</span><span class="st">—</span></span>
    </button>`).join('')

  const detail = document.createElement('div')
  detail.className = `${P}-detail ds-unit`
  detail.innerHTML = SUMMARY.local

  /* ---------- 狀態與工具 ---------- */
  const timers = new Set(), intervals = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear(); intervals.forEach(clearInterval); intervals.clear() }

  const q = s => diagram.querySelector(s)
  const loopEl = q('[data-loop]'), deskEl = q('[data-desk]'), foldEl = q('[data-fold]')
  const vmEl = q('[data-vm]'), crackEl = q(`.${P}-crack`), crackPath = crackEl.querySelector('path')
  const leakEl = q('[data-leak]')
  const wireL = q('[data-w="l"]'), wireR = q('[data-w="r"]')
  const knob = top.querySelector('.knob')
  const modeBtn = m => top.querySelector(`[data-mode="${m}"]`)
  const ctlBtn = b => top.querySelector(`[data-b="${b}"]`)
  const portEl = id => ports.querySelector(`[data-p="${id}"]`)

  let mode = 'local', deskOn = true, interactive = false, selected = null, stage = null

  const ST_LABEL = { on: '開著', proxy: '繞 Desktop', off: '沒開' }

  function portState(p) {
    if (mode === 'cloud' && !deskOn && p.dead) return p.dead
    return mode === 'cloud' ? p.cloud : p.local
  }

  function placeLoop() {
    const slot = q(`[data-slot="${mode === 'cloud' ? 'cloud' : 'local'}"]`)
    if (!slot || !loopEl.offsetWidth) return
    const dr = diagram.getBoundingClientRect(), sr = slot.getBoundingClientRect()
    if (!dr.width) return
    loopEl.style.left = `${sr.left - dr.left + sr.width / 2 - loopEl.offsetWidth / 2}px`
    loopEl.style.top = `${sr.top - dr.top + sr.height / 2 - loopEl.offsetHeight / 2}px`
  }

  function placeKnob() {
    const b = modeBtn(mode)
    if (!b || !b.offsetWidth) return
    knob.style.left = `${b.offsetLeft}px`
    knob.style.width = `${b.offsetWidth}px`
  }

  function flowOnce() {
    const seq = [[wireL, 0], [wireR, 260]]
    seq.forEach(([w, delay]) => {
      const dot = w.querySelector('.dot')
      dot.animate(
        [{ left: '0%', opacity: 0 }, { left: '12%', opacity: 1 }, { left: '88%', opacity: 1 }, { left: '100%', opacity: 0 }],
        { duration: 900, delay, easing: 'linear' }
      )
    })
  }

  function render() {
    // 模式開關
    ;['local', 'cloud'].forEach(m => modeBtn(m).classList.toggle('on', m === mode))
    placeKnob()
    // 環境框
    q(`.${P}-env[data-env="cloud"]`).classList.toggle('active', mode === 'cloud')
    q(`.${P}-env[data-env="local"]`).classList.toggle('active', mode === 'local')
    placeLoop()
    // Desktop 代理通道
    const proxyLive = mode === 'cloud' && deskOn
    deskEl.classList.toggle('on', proxyLive)
    deskEl.classList.toggle('dead', mode === 'cloud' && !deskOn)
    ;[wireL, wireR].forEach(w => {
      w.classList.toggle('on', proxyLive)
      w.classList.toggle('cut', mode === 'cloud' && !deskOn)
    })
    foldEl.classList.toggle('lit', proxyLive)
    ctlBtn('desk').textContent = `Claude Desktop：${deskOn ? '開著' : '離線'}`
    ctlBtn('desk').classList.toggle('dead', !deskOn)
    // 封包流動
    intervals.forEach(clearInterval); intervals.clear()
    if (proxyLive) {
      flowOnce()
      const iv = setInterval(flowOnce, 1700)
      intervals.add(iv)
    }
    // 四個口
    PORTS.forEach(p => {
      const [st] = portState(p)
      const node = portEl(p.id)
      node.className = `${P}-port ${st}${selected === p.id ? ' sel' : ''}`
      node.querySelector('.st').textContent = ST_LABEL[st]
    })
    // 說明
    detail.innerHTML = selected ? portState(PORTS.find(p => p.id === selected))[1] : SUMMARY[mode]
  }

  function setMode(m, { quiet } = {}) {
    if (mode === m) { render(); return }
    mode = m
    render()
    if (!quiet) pop(modeBtn(m), 1.08)
  }

  function selectPort(id) {
    selected = selected === id ? null : id
    render()
    if (selected) { pop(portEl(selected)); enterFly(detail, { y: 6, dur: 300 }) }
  }

  /* ---------- 戲劇動作 ---------- */
  function ghost(html, { host = diagram, x, y, cx, cy, cls = '', life = 2600 } = {}) {
    const g = document.createElement('div')
    g.className = `${P}-ghost ${cls}`
    g.innerHTML = html
    g.style.left = '0px'; g.style.top = '0px'
    host.appendChild(g)
    const gx = cx != null ? cx - g.offsetWidth / 2 : x
    const gy = cy != null ? cy - g.offsetHeight / 2 : y
    g.style.left = `${Math.max(4, Math.min(gx, host.clientWidth - g.offsetWidth - 4))}px`
    g.style.top = `${Math.max(0, gy)}px`
    enterFly(g, { y: 10, dur: 420 })
    if (life) T(() => { g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320 }).onfinish = () => g.remove() }, life)
    return g
  }
  const clearGhosts = () => {
    diagram.querySelectorAll(`.${P}-ghost`).forEach(g => g.remove())
    stage?.body.querySelectorAll(`.${P}-ghost`).forEach(g => g.remove())
  }

  let crackAnim = null, leakAnim = null
  function crackVM(on) {
    if (!on) {
      crackAnim?.cancel(); leakAnim?.cancel(); crackAnim = leakAnim = null
      crackEl.style.opacity = '0'; leakEl.style.opacity = '0'
      return
    }
    const len = crackPath.getTotalLength ? crackPath.getTotalLength() : 120
    crackPath.style.strokeDasharray = `${len}`
    crackPath.style.strokeDashoffset = `${len}`
    crackEl.style.opacity = '1'
    crackAnim = crackPath.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
      { duration: 900, easing: EASE, fill: 'forwards' })
    shake(vmEl)
    T(() => {
      const vr = vmEl.getBoundingClientRect(), er = q(`.${P}-env[data-env="local"]`).getBoundingClientRect()
      leakEl.style.left = `${vr.left - er.left + vr.width * 0.28}px`
      leakEl.style.top = `${vr.top - er.top + vr.height * 0.55}px`
      leakEl.style.opacity = '1'
      leakAnim = leakEl.animate(
        [{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${vr.width * 0.42}px, ${vr.height * 0.72}px)`, opacity: .25 }],
        { duration: 1300, easing: EASE, fill: 'forwards' }
      )
    }, 780)
  }

  /* ---------- 場景重置 / sandbox ---------- */
  function setInteractive(on) {
    interactive = on
    ctlBtn('desk').classList.toggle('hide', !on)
    ctlBtn('reset').classList.toggle('hide', !on)
  }

  function resetScene() {
    clearT(); clearGhosts(); crackVM(false)
    selected = null; deskOn = true
    setInteractive(false)
    render()
  }

  function startSandboxRun() {
    resetScene()
    mode = 'local'
    setInteractive(true)
    render()
    enterFly(diagram, { y: 14, dur: 480 })
    ports.querySelectorAll(`.${P}-port`).forEach((n, i) => enterFly(n, { y: 12, dur: 400, delay: i * 70 }))
  }

  /* ---------- 互動綁定（全程可用；導演拍會用 dim 擋住） ---------- */
  top.addEventListener('click', e => {
    const m = e.target.closest('[data-mode]')
    if (m) { setMode(m.dataset.mode); clearGhosts(); return }
    const b = e.target.closest('[data-b]')
    if (!b) return
    if (b.dataset.b === 'desk') {
      pop(b); deskOn = !deskOn; render()
      if (!deskOn && mode === 'cloud') shake(deskEl)
    } else if (b.dataset.b === 'reset') {
      pop(b); startSandboxRun()
    }
  })
  ports.addEventListener('click', e => {
    const p = e.target.closest(`[data-p]`)
    if (p) selectPort(p.dataset.p)
  })

  /* ---------- beats ---------- */
  const beats = [
    {
      narration: '先看 <b>Local session</b>：agent loop 跑在<b>你的裝置上</b>，程式在你電腦裡的一台隔離 VM 執行 — 四個口全開。',
      focus: [`.${P}-env[data-env="local"]`, `.${P}-ports`], nextLabel: '切到雲端 →',
      enter() { resetScene(); setMode('local', { quiet: true }); T(placeLoop, 60) },
    },
    {
      narration: '切成 <b>Cloud session</b>：agent loop 和程式執行整組搬到 Anthropic 的隔離 sandbox — <b>shell 和 MCP 兩個口直接沒開</b>，課堂上那句裝 MCP 的指令才會送不出去。',
      focus: [`.${P}-env[data-env="cloud"]`, `.${P}-ports`], nextLabel: '那檔案怎麼碰得到？ →',
      enter() {
        clearT(); clearGhosts(); crackVM(false); selected = null; deskOn = true
        setMode('cloud', { quiet: true })
        T(() => {
          [portEl('shell'), portEl('mcp')].forEach((n, i) => T(() => { shake(n); pop(n.querySelector('.lamp'), 1.2) }, i * 180))
        }, 850)
        T(() => {
          const dr = diagram.getBoundingClientRect()
          const pr = portEl('mcp').getBoundingClientRect()
          const cx = pr.left - dr.left + pr.width / 2
          ghost('claude mcp add my-server …', { cx, y: dr.height - 86, cls: 'mono', life: 0 })
          T(() => {
            const g = ghost('沒有 shell — 指令送不出去', { cx, y: dr.height - 38, cls: 'warn', life: 0 })
            shake(g); shake(portEl('mcp'))
          }, 800)
        }, 1500)
      },
    },
    {
      narration: '那雲端 session 怎麼還讀得到你的檔案？它<b>繞回你電腦上的 Claude Desktop</b>，只限你明確連結的資料夾。把 Desktop 關掉 — <b>整條線就斷了</b>。',
      focus: [`.${P}-chan`, `.${P}-port[data-p="files"]`, `.${P}-fold`], nextLabel: '還有一個陷阱 →',
      enter() {
        clearT(); clearGhosts(); crackVM(false)
        deskOn = true; selected = 'files'
        setMode('cloud', { quiet: true })
        T(() => {
          deskOn = false; render(); shake(deskEl); shake(portEl('files'))
          const dr = diagram.getBoundingClientRect(), kr = deskEl.getBoundingClientRect()
          ghost('Desktop 離線 → 雲端 session 碰不到你的電腦',
            { cx: kr.left - dr.left + kr.width / 2, y: kr.bottom - dr.top + 18, cls: 'warn', life: 3600 })
        }, 3000)
      },
    },
    {
      narration: '2026-07-07 起，廠商<b>逐步把預設改成雲端執行，而且沒有 in-app 提示</b> — 開關在 Claude Desktop → Settings → Cowork →「Run new tasks in the cloud」。',
      focus: [`.${P}-top`, `.${P}-diagram`], nextLabel: '本地就安全嗎？ →',
      enter() {
        clearT(); clearGhosts(); crackVM(false)
        deskOn = true; selected = null
        setMode('local', { quiet: true })
        T(() => {
          setMode('cloud', { quiet: true }); pop(knob, 1.12)
          const br = stage.body.getBoundingClientRect(), sr = top.querySelector(`.${P}-sw`).getBoundingClientRect()
          ghost('預設值已被改成雲端 · 沒有任何提示',
            { host: stage.body, x: sr.right - br.left + 18, cy: sr.top - br.top + sr.height / 2, cls: 'warn', life: 4200 })
        }, 1000)
        T(() => {
          const dr = diagram.getBoundingClientRect()
          const lr = q(`.${P}-slot[data-slot="local"]`).getBoundingClientRect()
          shake(ghost('你以為：還在本地',
            { cx: lr.left - dr.left + lr.width / 2, cy: lr.top - dr.top + lr.height / 2, life: 3600 }))
        }, 1900)
      },
    },
    {
      narration: '本地也不是保險箱 — 2026-07-27 研究者揭露 Mac 上的<b>沙箱逃逸</b>：跳出那台 VM、讀寫整台機器。隔離牆是軟體做的，軟體就會有洞。',
      focus: [`.${P}-env[data-env="local"]`], nextLabel: '換我玩 →',
      enter() {
        clearT(); clearGhosts()
        deskOn = true; selected = null
        setMode('local', { quiet: true })
        T(() => crackVM(true), 500)
      },
    },
    {
      narration: '換你玩 — 問法不是「這個產品跑在哪」，是<b>我這個 session 跑在哪、開了哪三個口</b>。',
      sandbox: true,
      enter() { startSandboxRun() },
    },
  ]

  stage = createStage(el, ctx, { beats })
  stage.body.append(top, diagram, ports, detail)

  const ro = new ResizeObserver(() => { placeLoop(); placeKnob() })
  ro.observe(diagram)
  ro.observe(top)
  requestAnimationFrame(() => { placeKnob(); placeLoop() })

  return () => { clearT(); ro.disconnect(); stage.destroy(); style.remove() }
}
