// Demo：Connector → CLI → MCP → API Key 的存取權限光譜 — DemoStage 導演版
// 7 拍：connector 點開就能用｜日常任務全包｜下載附件卡住（高潮）｜掉下一層前先問「有沒有 CLI」｜
//       Gmail 沒 CLI 才輪到 MCP｜再掉到 API key、代價全開｜sandbox 自由切任務。
import { createStage, pop, shake, enterFly, confettiBurst } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const GREEN = '#4ade80', RED = '#f87171', AMBER = '#fbbf24'

const IC = {
  shield: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.6"
    stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg>`,
  term: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.6"
    stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M7.5 10l3 2.5-3 2.5"/><path d="M13 15.5h4"/></svg>`,
  plug: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.6"
    stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="11" height="8" rx="2"/><path d="M14 11h6M14 15h6M20 9.5v7"/><path d="M6 8V4.5M11 8V4.5"/></svg>`,
  key: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.6"
    stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="12" r="4"/><path d="M11.5 12H21"/><path d="M18 12v3.5M15 12v2.5"/></svg>`,
  ok: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>`,
  warn: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.8"
    stroke-linecap="round" stroke-linejoin="round"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.2v.2"/></svg>`,
  no: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
}

const LAYERS = [
  { id: 'connector', name: 'Connector', sub: '服務商幫你封裝好，點開授權就能用', icon: IC.shield,
    m: [['設定', 1, '五分鐘'], ['權限', 1, '服務商鎖死'], ['風險', 1, '服務商扛']] },
  { id: 'cli', name: 'CLI', sub: '工具剛好有命令列 — 掉下一層時的第一個分支', icon: IC.term,
    m: [['設定', 1, '一句話授權'], ['權限', 2, '這支 CLI 有的全有'], ['風險', 2, '用你本人的身分']] },
  { id: 'mcp', name: 'MCP', sub: 'connector 底下實作的協定 — 給沒有 CLI 的工具用', icon: IC.plug,
    m: [['設定', 2, '半小時起'], ['權限', 2, '你挑的 server 決定'], ['風險', 2, '一半自負']] },
  { id: 'apikey', name: 'API Key', sub: '最底層 — 那把鑰匙能開你 Gmail 的一切', icon: IC.key,
    m: [['設定', 3, '一小時起'], ['權限', 3, '幾乎全開'], ['風險', 3, '100% 自負']] },
]

const TASKS = {
  read: { label: '讀最新 10 封信', rule: 'connector 五分鐘搞定 — 往下掉只是自找麻煩',
    r: { connector: ['ok', '內建讀信工具，點開授權就有'],
         cli: ['no', 'Gmail 沒有官方 CLI — 先問這一句，答案是沒有'],
         mcp: ['ok', '做得到，但你得自己裝一台 server'],
         apikey: ['ok', '做得到，為這件事開 Cloud 專案太重了'] } },
  label: { label: '幫信件加標籤', rule: '授權時勾一個寫入就好 — 風險還有服務商幫你扛',
    r: { connector: ['ok', '授權勾了寫入，就能貼 label、封存'],
         cli: ['no', '一樣卡在「Gmail 沒有官方 CLI」這件事上'],
         mcp: ['ok', '同樣做得到，只是多繞一圈'],
         apikey: ['ok', '殺雞用牛刀，但當然做得到'] } },
  attach: { label: '下載附件打包成一包', rule: 'connector 攤手 → 先問有沒有 CLI（Gmail 沒有）→ 才輪到 MCP：授權自己過、別人的 code 自己信',
    r: { connector: ['no', '工具清單裡沒有這一項 — 讀信、加 label、寫信、回信，就是不能下載附件'],
         cli: ['no', '掉下一層先問「有沒有 CLI」— Gmail 沒有官方 CLI，這條分支斷了'],
         mcp: ['warn', '第三方或自架 server 可以（本機 127.0.0.1，不用走外網），但授權要自己過'],
         apikey: ['ok', '完整權限，附件想抓幾封抓幾封'] } },
  auto: { label: '每週自動跑、沒人在旁邊', rule: 'connector 綁在對話裡 → Gmail 沒 CLI → MCP 要機器開著 → API key 才真的無人值守，但鑰匙全開',
    r: { connector: ['no', '綁在你的對話裡 — 你不開它就不動'],
         cli: ['no', '有 CLI 的話 cron 一行就排程了 — 可惜 Gmail 沒有'],
         mcp: ['warn', '本機 server ＋ 排程可以，前提是那台機器要一直開著'],
         apikey: ['ok', '憑證直連、無人值守 — 也代表出事沒人在旁邊擋'] } },
  push: { label: '把 code 推上 private repo', rule: '有官方 CLI 的工具就別再裝 MCP — 文字進、文字出，本來就是 LLM 最順的介面',
    r: { connector: ['no', 'GitHub connector 讀得到 repo／issue／PR，但範圍受限 — push 這種底層操作不在裡面'],
         cli: ['ok', '官方 <code>gh</code>：說一句「幫我串接 GitHub CLI」，瀏覽器授權完，建 repo、push、開 PR 全在手上'],
         mcp: ['warn', '有 GitHub MCP server，但都有官方 CLI 了還多裝一層協定 — 繞遠路'],
         apikey: ['ok', 'Personal access token 當然行，token 的權限與外洩風險你自己扛'] } },
}

const CONN_TOOLS = ['search_mail', 'label_message', 'create_draft', 'send_mail', 'list_labels']
const MISSING_TOOL = 'download_attachment'
const MCP_NOTE = '課堂實測：接 Notion 時授權卡在 callback 壞掉 — 工具會壞，別太相信別人寫的 code。'
const CLI_CMD = 'gh repo create clinic-tools --private && git push'
const CLI_TAIL = '文字進、文字出 — LLM 本來就是文字接龍引擎，這是它最自然的介面'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#8ea9e8'

  const style = document.createElement('style')
  style.textContent = `
  .as-tasks{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:12px}
  .as-chip{font-family:var(--font-tc);font-size:15.5px;color:var(--text-dim);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:8px 16px;cursor:pointer;transition:all .28s ${EASE}}
  .as-chip:hover{color:var(--text);border-color:var(--text)}
  .as-chip.on{color:#08090a;background:var(--accent);border-color:var(--accent);font-weight:600}
  .as-chip[disabled]{cursor:default;opacity:.55}
  .as-chip[disabled]:hover{color:var(--text-dim);border-color:var(--line)}
  .as-chip.on[disabled]{opacity:1;color:#08090a}
  .as-tracks{display:flex;flex-direction:column;gap:6px}
  .as-row{display:grid;grid-template-columns:clamp(176px,19vw,224px) 1fr;gap:clamp(14px,2vw,26px);
    padding:9px 15px;border-radius:13px;background:rgba(18,22,32,.85);border:1px solid var(--line);
    transition:border-color .4s ${EASE},background .4s ${EASE}}
  .as-row.lit{border-color:${accent}77;background:rgba(24,30,44,.92)}
  .as-id{display:flex;align-items:center;gap:10px;min-width:0}
  .as-id .ic{width:24px;height:24px;flex:none;color:var(--text-dim);transition:color .4s}
  .as-row.lit .as-id .ic{color:${accent}}
  .as-id b{display:block;font-size:16.5px;color:var(--text);letter-spacing:.01em;line-height:1.3}
  .as-id i{display:block;font-style:normal;font-size:13.5px;line-height:1.4;color:var(--text-dim);margin-top:2px}
  .as-right{min-width:0;display:flex;flex-direction:column;gap:6px;justify-content:center}
  .as-verdict{display:flex;align-items:flex-start;gap:10px}
  .as-lamp{width:22px;height:22px;flex:none;border-radius:7px;display:flex;align-items:center;justify-content:center;
    color:var(--text-dim);background:rgba(255,255,255,.05);transition:all .35s ${EASE}}
  .as-lamp>svg{width:15px;height:15px}
  .as-lamp.ok{color:${GREEN};background:${GREEN}1e;box-shadow:0 0 14px ${GREEN}33}
  .as-lamp.warn{color:${AMBER};background:${AMBER}1e;box-shadow:0 0 14px ${AMBER}33}
  .as-lamp.no{color:${RED};background:${RED}1e;box-shadow:0 0 14px ${RED}33}
  .as-why{font-size:15px;line-height:1.45;color:var(--text)}
  .as-why code{font-family:var(--font-mono);font-size:14px;color:var(--accent)}
  .as-row .as-lamp.no ~ .as-why{color:${RED}}
  .as-tools{display:none;flex-wrap:wrap;gap:6px;padding-left:32px}
  .as-tools.show{display:flex}
  .as-tools span{font-family:var(--font-mono);font-size:13px;color:var(--text-dim);padding:2px 8px;border-radius:6px;
    background:rgba(255,255,255,.04);border:1px solid var(--line)}
  .as-tools span.miss{color:${RED};border-color:${RED}88;border-style:dashed;background:${RED}12}
  .as-note{display:none;font-size:13.5px;line-height:1.45;color:${AMBER};padding-left:32px}
  .as-note.show{display:block}
  .as-note.good{color:var(--text-dim)}
  .as-note .cmd{font-family:var(--font-mono);font-size:13.5px;color:${accent};white-space:pre}
  .as-note .cmd::after{content:'▌';opacity:.75;animation:asCaret 1.1s steps(1) infinite}
  .as-note .cmd.done::after{content:''}
  @keyframes asCaret{50%{opacity:0}}
  .as-meters{display:flex;flex-wrap:wrap;gap:7px;padding-left:32px}
  .as-m{display:flex;align-items:center;gap:7px;padding:2px 9px;border-radius:999px;
    background:rgba(255,255,255,.035);border:1px solid var(--line)}
  .as-m i{font-style:normal;font-size:13px;color:var(--text-dim)}
  .as-m .segs{display:flex;gap:3px}
  .as-m .segs b{width:11px;height:6px;border-radius:2px;background:rgba(255,255,255,.12);
    transform:scaleX(0);transform-origin:left;transition:transform .5s ${EASE},background .5s ${EASE}}
  .as-m.fill .segs b{transform:scaleX(1)}
  .as-m em{font-style:normal;font-size:13px;color:var(--text);opacity:0;transition:opacity .5s ${EASE}}
  .as-m.fill em{opacity:1}
  .as-rule{margin-top:9px;padding:10px 18px;border-radius:12px;border:1px dashed var(--line);
    background:rgba(255,255,255,.03);font-size:16px;line-height:1.5;color:var(--text);text-align:center}
  .as-rule b{color:var(--accent)}
  .as-rule .sub{display:block;margin-top:4px;font-size:14.5px;line-height:1.45;color:var(--text-dim)}
  .as-ctrls{display:flex;gap:10px;justify-content:center;margin-top:8px}
  .as-btn{font-family:var(--font-tc);font-size:15.5px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:8px 18px;cursor:pointer;transition:all .25s ${EASE}}
  .as-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .as-btn.hide{display:none}
  @media (max-width:820px){.as-row{grid-template-columns:1fr;gap:10px}
    .as-tools,.as-note,.as-meters{padding-left:0}}
  `
  el.appendChild(style)

  const tasksEl = document.createElement('div')
  tasksEl.className = 'as-tasks ds-unit'
  tasksEl.innerHTML = Object.entries(TASKS)
    .map(([k, t]) => `<button class="as-chip" data-task="${k}" disabled>${t.label}</button>`).join('')

  const tracks = document.createElement('div')
  tracks.className = 'as-tracks'
  tracks.innerHTML = LAYERS.map(L => `
    <div class="as-row ds-unit" data-layer="${L.id}">
      <div class="as-id"><span class="ic">${L.icon}</span><span><b>${L.name}</b><i>${L.sub}</i></span></div>
      <div class="as-right">
        <div class="as-verdict"><span class="as-lamp"></span><span class="as-why">選一個任務，看這一層做不做得到</span></div>
        ${L.id === 'connector' ? `<div class="as-tools">${CONN_TOOLS.map(t => `<span>${t}</span>`).join('')}<span class="miss">${MISSING_TOOL}</span></div>` : ''}
        ${L.id === 'cli' ? `<div class="as-note good"><span class="cmd"></span>　${CLI_TAIL}</div>` : ''}
        ${L.id === 'mcp' ? `<div class="as-note">${MCP_NOTE}</div>` : ''}
        <div class="as-meters">${L.m.map(([n, lv, v]) => `
          <span class="as-m" data-lv="${lv}"><i>${n}</i><span class="segs">${[1, 2, 3].map(i =>
            `<b data-i="${i}"></b>`).join('')}</span><em>${v}</em></span>`).join('')}</div>
      </div>
    </div>`).join('')

  const rule = document.createElement('div')
  rule.className = 'as-rule ds-unit'
  rule.innerHTML = '選一個任務，四條軌道即時給答案'

  const ctrls = document.createElement('div')
  ctrls.className = 'as-ctrls ds-unit'
  ctrls.innerHTML = '<button class="as-btn hide" data-b="reset">重來</button>'

  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  const row = id => tracks.querySelector(`.as-row[data-layer="${id}"]`)
  const cliCmd = () => row('cli').querySelector('.cmd')
  const resetBtn = ctrls.querySelector('[data-b="reset"]')
  const METER_COLOR = [AMBER, accent, RED]

  function fillMeters(layerId, on) {
    row(layerId).querySelectorAll('.as-m').forEach((m, mi) => {
      const lv = Number(m.dataset.lv)
      m.classList.toggle('fill', !!on)
      m.querySelectorAll('.segs b').forEach(b => {
        const i = Number(b.dataset.i)
        b.style.background = on && i <= lv ? METER_COLOR[mi] : 'rgba(255,255,255,.12)'
        b.style.transitionDelay = on ? `${i * 70}ms` : '0ms'
      })
    })
  }

  function setLit(ids) {
    LAYERS.forEach(L => row(L.id).classList.toggle('lit', ids.includes(L.id)))
  }

  // CLI 那條的字元流：文字進、文字出
  function typeCmd(animate) {
    const c = cliCmd()
    if (!animate) { c.textContent = CLI_CMD; c.classList.add('done'); return }
    c.textContent = ''
    c.classList.remove('done')
    for (let i = 1; i <= CLI_CMD.length; i++) {
      T(() => {
        c.textContent = CLI_CMD.slice(0, i)
        if (i === CLI_CMD.length) T(() => c.classList.add('done'), 700)
      }, 120 + i * 26)
    }
  }

  function applyTask(id, { silent } = {}) {
    tasksEl.querySelectorAll('.as-chip').forEach(c => c.classList.toggle('on', c.dataset.task === id))
    const t = TASKS[id]
    LAYERS.forEach(L => {
      const [st, why] = t.r[L.id]
      const r = row(L.id)
      const lamp = r.querySelector('.as-lamp')
      lamp.className = `as-lamp ${st}`
      lamp.innerHTML = IC[st]
      r.querySelector('.as-why').innerHTML = why
      if (!silent) enterFly(r.querySelector('.as-verdict'), { y: 8, dur: 320 })
      if (L.id === 'mcp') r.querySelector('.as-note').classList.toggle('show', st === 'warn')
      if (L.id === 'cli') {
        const show = st === 'ok'
        r.querySelector('.as-note').classList.toggle('show', show)
        if (show) typeCmd(false)
      }
    })
    // 工具清單只在「下載附件」這一題攤開 — 那才是清單缺口的現場
    row('connector').querySelector('.as-tools').classList.toggle('show', id === 'attach')
    const first = LAYERS.find(L => t.r[L.id][0] !== 'no')
    rule.innerHTML = `最淺可行的一層：<b>${first.name}</b><span class="sub">${t.rule}</span>`
    if (!silent) enterFly(rule, { y: 8, dur: 320 })
  }

  function resetScene() {
    clearT()
    LAYERS.forEach(L => fillMeters(L.id, false))
    setLit([])
    tasksEl.querySelectorAll('.as-chip').forEach(c => { c.disabled = true; c.classList.remove('on') })
    row('connector').querySelector('.as-tools').classList.remove('show')
    row('cli').querySelector('.as-note').classList.remove('show')
    row('mcp').querySelector('.as-note').classList.remove('show')
    resetBtn.classList.add('hide')
  }

  // 高潮拍：攤開 connector 工具清單，最後一格是缺口
  function revealToolGap() {
    const tools = row('connector').querySelector('.as-tools')
    tools.classList.add('show')
    const chips = [...tools.children]
    chips.forEach((c, i) => {
      c.style.opacity = '0'
      T(() => { c.style.opacity = ''; enterFly(c, { y: 6, dur: 280 }) }, 220 + i * 160)
    })
    const miss = tools.querySelector('.miss')
    T(() => { pop(miss, 1.22); shake(miss); shake(row('connector').querySelector('.as-why')) }, 220 + chips.length * 160 + 240)
  }

  function startSandboxRun() {
    resetScene()
    LAYERS.forEach((L, i) => T(() => fillMeters(L.id, true), i * 180))
    tasksEl.querySelectorAll('.as-chip').forEach(c => {
      c.disabled = false
      c.onclick = () => { pop(c); setLit([]); applyTask(c.dataset.task) }
    })
    applyTask('read', { silent: true })
    resetBtn.classList.remove('hide')
    resetBtn.onclick = () => { pop(resetBtn); startSandboxRun() }
  }

  const beats = [
    {
      narration: '同一件事有四種接法。最上層是 <b>Connector</b> — 服務商幫你封裝好，點開授權就能用。',
      focus: ['.as-row[data-layer="connector"]'], nextLabel: '日常任務夠用嗎？ →',
      enter() { resetScene(); applyTask('read', { silent: true }); setLit(['connector']); T(() => fillMeters('connector', true), 350) },
    },
    {
      narration: '讀信、<b>加標籤</b>，connector 全包 — 設定五分鐘，出事還有服務商幫你扛。',
      focus: ['.as-row[data-layer="connector"]', '.as-rule'], nextLabel: '那這一個呢？ →',
      enter() {
        clearT(); setLit(['connector']); fillMeters('connector', true); applyTask('label')
        const r = row('connector').getBoundingClientRect(), b = tracks.getBoundingClientRect()
        T(() => confettiBurst(tracks, r.width * 0.55, r.top - b.top + r.height / 2, GREEN, 14), 300)
      },
    },
    {
      narration: '診所要的是<b>把發票附件下載打包</b>。攤開 connector 的工具清單 — 讀信、加 label、寫信、回信…<b>就是沒有下載附件</b>。',
      focus: ['.as-row[data-layer="connector"]'], nextLabel: '那就直接裝 MCP？ →',
      enter() {
        clearT(); setLit(['connector']); fillMeters('connector', true)
        applyTask('attach'); revealToolGap()
      },
    },
    {
      narration: '先別急。掉下一層的<b>第一個分支是：這工具有沒有 CLI？</b> 看真實例子 — GitHub 只串 connector 範圍受限，改用 <b>gh</b> 就通了。',
      focus: ['.as-row[data-layer="cli"]', '.as-rule'], nextLabel: '那 Gmail 呢？ →',
      enter() {
        clearT(); applyTask('push', { silent: true }); fillMeters('connector', true)
        setLit(['cli'])
        T(() => { fillMeters('cli', true); pop(row('cli').querySelector('.as-id .ic'), 1.3) }, 300)
        T(() => { enterFly(row('cli').querySelector('.as-note'), { y: 8, dur: 400 }); typeCmd(true) }, 620)
      },
    },
    {
      narration: '回到 Gmail 這題 — <b>Gmail 沒有官方 CLI</b>，這條分支斷了，才輪到 <b>MCP</b>：connector 底下實作的協定，只是這次沒人幫你封裝。',
      focus: ['.as-row[data-layer="mcp"]'], nextLabel: '再往下呢？ →',
      enter() {
        clearT(); applyTask('attach', { silent: true }); fillMeters('connector', true); fillMeters('cli', true)
        setLit(['mcp'])
        T(() => shake(row('cli').querySelector('.as-lamp')), 200)
        T(() => { fillMeters('mcp', true); pop(row('mcp').querySelector('.as-lamp'), 1.25) }, 420)
        T(() => enterFly(row('mcp').querySelector('.as-note'), { y: 8, dur: 400 }), 780)
      },
    },
    {
      narration: '最底層是 <b>API key</b> — 你就等於天神了。能力全開，但設定繁瑣，而且<b>風險 100% 自負</b>。',
      focus: ['.as-row[data-layer="apikey"]'], nextLabel: '所以怎麼選？ →',
      enter() {
        clearT(); applyTask('attach', { silent: true })
        fillMeters('connector', true); fillMeters('cli', true); fillMeters('mcp', true)
        setLit(['apikey'])
        T(() => { fillMeters('apikey', true); pop(row('apikey').querySelector('.as-id .ic'), 1.3) }, 300)
        T(() => shake(row('apikey').querySelectorAll('.as-m')[2]), 900)
      },
    },
    {
      narration: '換你切任務 — <b>能用 connector 就別往下掉；要掉之前，先問有沒有 CLI</b>。往下一層＝能力變大、設定變繁瑣、風險移到你身上。',
      sandbox: true,
      enter() { startSandboxRun() },
    },
  ]

  const stage = createStage(el, ctx, { beats })
  stage.body.append(tasksEl, tracks, rule, ctrls)

  return () => { clearT(); stage.destroy(); style.remove() }
}
