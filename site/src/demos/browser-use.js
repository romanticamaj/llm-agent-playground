// Demo：同一個網頁、三種讀法 — Web Search vs. Browser Use — DemoStage 導演版
// 7 拍：它根本沒開瀏覽器｜你讀的是收錄好的副本｜四個盲區一次塌下來（高潮）｜
//       共用你已登入的瀏覽器｜另開一個乾淨的｜蝦皮：CAPTCHA 把控制權交還給你｜sandbox。
import { createStage, pop, shake, enterFly, confettiBurst } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const GREEN = '#4ade80', RED = '#f87171', AMBER = '#fbbf24'
const SVG = (d, w = 1.6) => `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor"
  stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`

const IC = {
  search: SVG('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4L21 21"/>'),
  browser: SVG('<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M3 9h18"/><path d="M6.2 6.7h.01M8.7 6.7h.01"/>'),
  beaker: SVG('<path d="M9.5 3v6.2L4.6 17.4A2 2 0 0 0 6.3 20.5h11.4a2 2 0 0 0 1.7-3.1L14.5 9.2V3"/><path d="M8 3h8"/><path d="M7.4 14.4h9.2"/>'),
  doc: SVG('<path d="M6 3.5h7.5L19 9v11.5H6z"/><path d="M13.5 3.5V9H19"/><path d="M9 13h7M9 16.5h5"/>'),
  bolt: SVG('<path d="M13.5 3L5.5 13.5H11l-.5 7.5 8-10.5H13z"/>'),
  lock: SVG('<rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/>'),
  click: SVG('<path d="M8 4.5v9.8l2.6-2.2 2 4.6 2.2-1-2-4.5 3.4-.4z"/><path d="M4.5 8H3M8 4.5V3M5.4 5.4L4.3 4.3"/>'),
  clock: SVG('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.2V12l3.2 2"/>'),
  ok: SVG('<path d="M4 12.5l5 5L20 6.5"/>', 2),
  no: SVG('<path d="M6 6l12 12M18 6L6 18"/>', 2),
  hand: SVG('<path d="M9 11V5.2a1.7 1.7 0 0 1 3.4 0V11"/><path d="M12.4 11V6.6a1.7 1.7 0 0 1 3.4 0V11"/><path d="M15.8 11.4V8.8a1.7 1.7 0 0 1 3.4 0V15a6 6 0 0 1-6 6h-1.6a5 5 0 0 1-4.2-2.3l-2.6-4a1.7 1.7 0 0 1 2.6-2.1L9 14.4V11"/>'),
}

const TYPES = {
  static: { tag: '伺服器端就組好', icon: IC.doc },
  dynamic: { tag: '要跑起來才長出來', icon: IC.bolt },
  auth: { tag: '要登入才看得到', icon: IC.lock },
  interactive: { tag: '要點按鈕才出現', icon: IC.click },
  fresh: { tag: '今天剛發布', icon: IC.clock },
}

const METHODS = [
  { id: 'websearch', name: 'Web Search', icon: IC.search, sub: '不開瀏覽器，直接打搜尋 API',
    meta: '約一秒 · 成本極低 · 讀的是收錄好的副本' },
  { id: 'chrome', name: 'Claude in Chrome', icon: IC.browser, sub: '共用你已經登入的那個瀏覽器',
    meta: '登入狀態直接帶入 · 碰到 CAPTCHA 停下來交還給你' },
  { id: 'playwright', name: 'Playwright', icon: IC.beaker, sub: '另外開一個乾淨隔離的瀏覽器',
    meta: '乾淨 · 可重複 · 能上 CI · 但沒有你的登入狀態，吃 token 兇' },
]

const MATRIX = {
  websearch: {
    static: ['ok', '副本裡就有'], dynamic: ['no', '副本上是空殼'],
    auth: ['no', '搜尋引擎沒有你的帳號'], interactive: ['no', '沒人幫它點，副本上就沒有'],
    fresh: ['no', '還沒被收錄'],
  },
  chrome: {
    static: ['ok', '讀的是現在的頁面'], dynamic: ['ok', '跑完了，內容長出來了'],
    auth: ['ok', '帶著你已登入的狀態'], interactive: ['ok', 'AI 幫你點開'],
    fresh: ['ok', '看的就是此刻'],
  },
  playwright: {
    static: ['ok', '讀的是現在的頁面'], dynamic: ['ok', '跑完了，內容長出來了'],
    auth: ['no', '乾淨瀏覽器，沒有你的登入狀態'], interactive: ['ok', 'AI 幫你點開'],
    fresh: ['ok', '看的就是此刻'],
  },
}

const PAGES = {
  doc: { label: '公開的說明文件', url: 'docs.example.com/guide', best: 'websearch',
    why: '不用開瀏覽器、一秒拿到、成本幾乎是零',
    blocks: [['static', '產品說明與規格'], ['static', '常見問答'], ['static', '聯絡方式']] },
  site: { label: '一般的現代網站', url: 'shop.example.com/item/8821', best: 'chrome',
    why: '真的把頁面跑起來，而且帶著你的登入狀態',
    blocks: [['static', '產品介紹'], ['dynamic', '即時庫存與報價'], ['auth', '你的會員專屬價'],
      ['interactive', '展開後的完整評論'], ['fresh', '今天剛發的公告']] },
  shopee: { label: '你的蝦皮訂單頁', url: 'shopee.tw/user/purchase', best: 'chrome',
    why: '沒開放 API ＋ 要登入 — 只剩「用你已登入的瀏覽器」這條路',
    blocks: [['static', '商城首頁'], ['auth', '我的訂單清單'], ['dynamic', '出貨進度'],
      ['interactive', '展開訂單明細']] },
  e2e: { label: '你要測的結帳流程', url: 'localhost:5173/checkout', best: 'playwright', needRepeat: true,
    why: '要乾淨、要每次結果都一樣、要能天天自動跑 — 只有它三個都給',
    blocks: [['static', '商品頁'], ['dynamic', '購物車金額'], ['interactive', '結帳表單'],
      ['dynamic', '付款結果頁']] },
}

const SHELL = {
  websearch: p => `<span class="bu-ci">${IC.search}</span><span class="bu-cu">搜尋引擎的收錄副本 · ${p.url}</span>
    <span class="bu-cb snap">抄於 3 天前</span>`,
  chrome: p => `<span class="bu-dots"><i></i><i></i><i></i></span><span class="bu-cu">${p.url}</span>
    <span class="bu-cb live">你的登入狀態 · 已帶入</span>`,
  playwright: p => `<span class="bu-dots"><i></i><i></i><i></i></span><span class="bu-cu">${p.url}</span>
    <span class="bu-cb clean">全新的隔離環境 · 沒有你的登入狀態</span>`,
}

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#8ea9e8'

  const style = document.createElement('style')
  style.textContent = `
  .bu-pages{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:13px}
  .bu-chip{font-family:var(--font-tc);font-size:15.5px;color:var(--text-dim);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:7px 16px;cursor:pointer;transition:all .28s ${EASE}}
  .bu-chip:hover{color:var(--text);border-color:var(--text)}
  .bu-chip.on{color:#08090a;background:var(--accent);border-color:var(--accent);font-weight:600}
  .bu-chip[disabled]{cursor:default;opacity:.5}
  .bu-chip[disabled]:hover{color:var(--text-dim);border-color:var(--line)}
  .bu-chip.on[disabled]{opacity:1;color:#08090a}
  .bu-main{margin-bottom:11px;display:grid;grid-template-columns:clamp(206px,21vw,258px) minmax(0,1fr);
    gap:clamp(13px,1.9vw,22px);align-items:start}
  .bu-lens{display:flex;flex-direction:column;gap:11px}
  .bu-card{position:relative;text-align:left;font-family:var(--font-tc);padding:13px 15px 13px 17px;border-radius:13px;
    background:rgba(18,22,32,.85);border:1px solid var(--line);cursor:default;transition:all .35s ${EASE};overflow:hidden}
  .bu-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--accent);
    transform:scaleY(0);transform-origin:center;transition:transform .4s ${EASE}}
  .bu-card.on{border-color:${accent}88;background:rgba(25,31,46,.95)}
  .bu-card.on::before{transform:scaleY(1)}
  .bu-card.pick{cursor:pointer}
  .bu-card.pick:hover{border-color:var(--text)}
  .bu-ch{display:flex;align-items:center;gap:9px}
  .bu-ch .ic{width:21px;height:21px;flex:none;color:var(--text-dim);transition:color .35s}
  .bu-card.on .bu-ch .ic{color:${accent}}
  .bu-ch b{font-size:16.5px;color:var(--text);line-height:1.25;letter-spacing:.01em}
  .bu-cs{display:block;font-size:13.5px;line-height:1.45;color:var(--text-dim);margin-top:5px}
  .bu-cm{display:block;font-size:12.5px;line-height:1.45;color:var(--text-dim);opacity:0;max-height:0;
    margin-top:0;transition:opacity .4s ${EASE},max-height .4s ${EASE},margin-top .4s ${EASE}}
  .bu-card.on .bu-cm{opacity:.9;max-height:60px;margin-top:7px;color:${accent}}
  .bu-win{position:relative;border-radius:14px;border:1px solid var(--line);background:rgba(13,16,23,.9);
    overflow:hidden;transition:border-color .45s ${EASE},background .45s ${EASE}}
  .bu-win.snap{border-style:dashed;border-color:rgba(255,255,255,.24);background:rgba(16,16,20,.75)}
  .bu-win.live{border-color:${GREEN}55}
  .bu-win.clean{border-color:${AMBER}44}
  .bu-crm{display:flex;align-items:center;gap:10px;padding:9px 13px;min-height:38px;
    border-bottom:1px solid var(--line);background:rgba(255,255,255,.028)}
  .bu-ci{width:16px;height:16px;flex:none;color:var(--text-dim)}
  .bu-dots{display:flex;gap:5px;flex:none}
  .bu-dots i{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.16)}
  .bu-cu{flex:1;min-width:0;font-family:var(--font-mono);font-size:13px;color:var(--text-dim);
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .bu-cb{flex:none;font-size:12.5px;padding:3px 10px;border-radius:999px;border:1px solid var(--line);
    color:var(--text-dim);white-space:nowrap}
  .bu-cb.snap{font-family:var(--font-mono)}
  .bu-cb.live{color:${GREEN};border-color:${GREEN}66;background:${GREEN}14}
  .bu-cb.clean{color:${AMBER};border-color:${AMBER}55;background:${AMBER}12}
  .bu-blocks{display:flex;flex-direction:column;gap:1px;background:var(--line)}
  .bu-b{display:grid;grid-template-columns:22px minmax(120px,1fr) 64px minmax(0,1.1fr);
    gap:clamp(9px,1.3vw,15px);align-items:center;padding:11px 16px;background:rgba(13,16,23,.94);
    transition:background .4s ${EASE},opacity .4s ${EASE}}
  .bu-b .bic{width:20px;height:20px;color:var(--text-dim);transition:color .4s}
  .bu-bt{min-width:0}
  .bu-bt b{display:block;font-size:16.5px;line-height:1.3;color:var(--text);transition:color .4s}
  .bu-bt i{display:block;font-style:normal;font-size:13.5px;line-height:1.4;color:var(--text-dim);margin-top:2px}
  .bu-bars{display:flex;flex-direction:column;gap:3px}
  .bu-bars b{display:block;height:5px;border-radius:3px;box-sizing:border-box;background:rgba(255,255,255,.11);
    border:1px solid transparent;transition:all .45s ${EASE}}
  .bu-bars b:nth-child(1){width:100%}.bu-bars b:nth-child(2){width:78%}.bu-bars b:nth-child(3){width:52%}
  .bu-b.ok .bu-bars b{background:${accent}99}
  .bu-b.no .bu-bars b{background:transparent;border:1px dashed ${RED}88}
  .bu-b.no .bu-bt b{color:${RED}}
  .bu-b.no .bic{color:${RED}}
  .bu-b.ok .bic{color:${accent}}
  .bu-v{display:flex;align-items:center;gap:8px;min-width:0}
  .bu-lamp{width:20px;height:20px;flex:none;border-radius:6px;display:flex;align-items:center;justify-content:center;
    background:rgba(255,255,255,.05);color:var(--text-dim);transition:all .35s ${EASE}}
  .bu-lamp>svg{width:13px;height:13px}
  .bu-lamp.ok{color:${GREEN};background:${GREEN}1e;box-shadow:0 0 12px ${GREEN}33}
  .bu-lamp.no{color:${RED};background:${RED}1e;box-shadow:0 0 12px ${RED}33}
  .bu-why{font-size:15px;line-height:1.4;color:var(--text-dim);min-width:0}
  .bu-b.no .bu-why{color:${RED}cc}
  .bu-b.ok .bu-why{color:var(--text)}
  .bu-scan{position:absolute;left:0;right:0;top:0;height:2px;margin:0;pointer-events:none;opacity:0;
    background:linear-gradient(90deg,transparent,${accent},transparent);box-shadow:0 0 18px 3px ${accent}66;z-index:8}
  .bu-stamp{position:absolute;right:12px;bottom:10px;width:max-content;margin:0;z-index:9;
    font-family:var(--font-mono);font-size:11.5px;letter-spacing:.14em;color:${AMBER};
    border:1px dashed ${AMBER}88;border-radius:8px;padding:4px 10px;background:rgba(20,16,8,.7);
    opacity:0;transform:rotate(-5deg) scale(1.5);transition:opacity .4s ${EASE},transform .4s ${EASE}}
  .bu-stamp.show{opacity:1;transform:rotate(-5deg) scale(1)}
  .bu-cap{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.94);width:max-content;
    max-width:min(400px,86%);margin:0;z-index:30;padding:15px 18px;border-radius:14px;text-align:center;
    background:rgba(16,14,8,.97);border:1px solid ${AMBER};box-shadow:0 26px 60px -20px #000;
    opacity:0;pointer-events:none;transition:opacity .35s ${EASE},transform .35s ${EASE}}
  .bu-cap.show{opacity:1;transform:translate(-50%,-50%) scale(1);pointer-events:auto}
  .bu-cap .h{display:flex;align-items:center;justify-content:center;gap:8px;font-size:16px;color:${AMBER};font-weight:600}
  .bu-cap .h .ic{width:19px;height:19px}
  .bu-cap p{margin:8px 0 12px;font-size:14.5px;line-height:1.5;color:var(--text)}
  .bu-cap p b{color:${AMBER}}
  .bu-veil{position:absolute;inset:0;margin:0;z-index:20;background:rgba(8,9,12,.6);backdrop-filter:blur(2px);
    opacity:0;pointer-events:none;transition:opacity .35s ${EASE}}
  .bu-veil.show{opacity:1}
  .bu-rule{margin-bottom:9px;display:flex;align-items:center;gap:14px;padding:13px 18px;border-radius:12px;
    border:1px dashed var(--line);background:rgba(255,255,255,.03)}
  .bu-score{flex:none;font-family:var(--font-mono);font-size:14px;color:var(--text-dim);
    border-right:1px solid var(--line);padding-right:14px;white-space:nowrap}
  .bu-score em{font-style:normal;font-size:19px;color:var(--text)}
  .bu-rt{min-width:0;font-size:16px;line-height:1.45;color:var(--text);text-align:left}
  .bu-rt b{color:var(--accent)}
  .bu-rt b.bad{color:${RED}}
  .bu-rt .sub{display:block;margin-top:3px;font-size:14px;line-height:1.4;color:var(--text-dim)}
  .bu-ctrls{display:flex;gap:10px;justify-content:center}
  .bu-btn{font-family:var(--font-tc);font-size:15.5px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:8px 18px;cursor:pointer;transition:all .25s ${EASE}}
  .bu-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .bu-btn.primary{color:#08090a;background:${AMBER};border-color:${AMBER};font-weight:600}
  .bu-btn.hide{display:none}
  @media (max-width:860px){
    .bu-main{grid-template-columns:minmax(0,1fr)}
    .bu-lens{flex-direction:row;flex-wrap:wrap}
    .bu-card{flex:1 1 200px}
    .bu-b{grid-template-columns:22px minmax(0,1fr);row-gap:6px}
    .bu-bars{display:none}
  }`
  el.appendChild(style)

  /* ---------- DOM ---------- */
  const pagesEl = document.createElement('div')
  pagesEl.className = 'bu-pages ds-unit'
  pagesEl.innerHTML = Object.entries(PAGES)
    .map(([k, p]) => `<button class="bu-chip" data-page="${k}" disabled>${p.label}</button>`).join('')

  const main = document.createElement('div')
  main.className = 'bu-main'
  main.innerHTML = `
    <div class="bu-lens">${METHODS.map(m => `
      <div class="bu-card ds-unit" data-m="${m.id}">
        <div class="bu-ch"><span class="ic">${m.icon}</span><b>${m.name}</b></div>
        <span class="bu-cs">${m.sub}</span><span class="bu-cm">${m.meta}</span>
      </div>`).join('')}</div>
    <div class="bu-win ds-unit">
      <div class="bu-crm"></div>
      <div class="bu-blocks"></div>
      <div class="bu-scan"></div>
      <div class="bu-stamp">可重複 · 能上 CI</div>
      <div class="bu-veil"></div>
      <div class="bu-cap">
        <div class="h"><span class="ic">${IC.hand}</span>這一步需要你本人</div>
        <p>碰到登入頁 / CAPTCHA — AI <b>停下來</b>，把控制權交還給你。</p>
        <button class="bu-btn primary" data-b="cap">我處理好了，繼續 →</button>
      </div>
    </div>`

  const rule = document.createElement('div')
  rule.className = 'bu-rule ds-unit'
  rule.innerHTML = `<div class="bu-score">讀得到 <em>—</em></div><div class="bu-rt">選一種讀法，看同一個網頁能讀到多少</div>`

  const ctrls = document.createElement('div')
  ctrls.className = 'bu-ctrls ds-unit'
  ctrls.innerHTML = '<button class="bu-btn hide" data-b="reset">重來</button>'

  const win = main.querySelector('.bu-win')
  const crm = main.querySelector('.bu-crm')
  const blocksEl = main.querySelector('.bu-blocks')
  const scanEl = main.querySelector('.bu-scan')
  const stampEl = main.querySelector('.bu-stamp')
  const veilEl = main.querySelector('.bu-veil')
  const capEl = main.querySelector('.bu-cap')
  const capBtn = capEl.querySelector('[data-b="cap"]')
  const resetBtn = ctrls.querySelector('[data-b="reset"]')
  const scoreEl = rule.querySelector('.bu-score em')
  const rtEl = rule.querySelector('.bu-rt')
  const card = id => main.querySelector(`.bu-card[data-m="${id}"]`)

  /* ---------- timers ---------- */
  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  /* ---------- state ---------- */
  let curPage = 'doc', curMethod = 'websearch', pickable = false

  function renderPage(id, { animate } = {}) {
    curPage = id
    const p = PAGES[id]
    pagesEl.querySelectorAll('.bu-chip').forEach(c => c.classList.toggle('on', c.dataset.page === id))
    blocksEl.innerHTML = p.blocks.map(([t, name]) => `
      <div class="bu-b" data-t="${t}">
        <span class="bic">${TYPES[t].icon}</span>
        <span class="bu-bt"><b>${name}</b><i>${TYPES[t].tag}</i></span>
        <span class="bu-bars"><b></b><b></b><b></b></span>
        <span class="bu-v"><span class="bu-lamp"></span><span class="bu-why">待判讀</span></span>
      </div>`).join('')
    if (animate) blocksEl.querySelectorAll('.bu-b').forEach((b, i) => enterFly(b, { y: 12, dur: 420, delay: i * 60 }))
  }

  function setShell(mid) {
    curMethod = mid
    win.classList.remove('snap', 'live', 'clean')
    win.classList.add(mid === 'websearch' ? 'snap' : mid === 'chrome' ? 'live' : 'clean')
    crm.innerHTML = SHELL[mid](PAGES[curPage])
    METHODS.forEach(m => card(m.id).classList.toggle('on', m.id === mid))
    stampEl.classList.toggle('show', mid === 'playwright')
  }

  function resolveBlock(b, mid) {
    const [st, why] = MATRIX[mid][b.dataset.t]
    b.classList.remove('ok', 'no')
    b.classList.add(st)
    const lamp = b.querySelector('.bu-lamp')
    lamp.className = `bu-lamp ${st}`
    lamp.innerHTML = IC[st]
    b.querySelector('.bu-why').textContent = why
    if (st === 'no') shake(b.querySelector('.bu-bars'))
    else pop(lamp, 1.2)
  }

  function stuckOf(pageId, mid) {
    const p = PAGES[pageId]
    const bad = p.blocks.filter(([bt]) => MATRIX[mid][bt][0] === 'no')
    if (bad.length >= 2) return `拿不到內容 — ${bad.length} 塊在副本裡都是空的`
    if (bad.length === 1)
      return bad[0][0] === 'auth'
        ? (mid === 'playwright' ? '過不了登入 — 乾淨瀏覽器沒有你的帳號' : '過不了登入 — 搜尋引擎沒有你的帳號')
        : `拿不到內容 — ${MATRIX[mid][bad[0][0]][1]}`
    if (p.needRepeat && mid !== 'playwright') return '不可重複 — 跑在你自己的瀏覽器上，每次環境都不一樣'
    return null
  }

  function updateRule(mid) {
    const p = PAGES[curPage]
    const okN = p.blocks.filter(([t]) => MATRIX[mid][t][0] === 'ok').length
    scoreEl.textContent = `${okN}/${p.blocks.length}`
    const stuck = stuckOf(curPage, mid)
    const bestName = METHODS.find(m => m.id === p.best).name
    const meName = METHODS.find(m => m.id === mid).name
    rtEl.innerHTML = stuck
      ? `這一題卡在：<b class="bad">${stuck}</b><span class="sub">走得通的是 <b>${bestName}</b> — ${p.why}</span>`
      : `<b>${meName}</b> 走得通<span class="sub">${mid === p.best ? p.why : `不過最划算的是 <b>${bestName}</b> — ${p.why}`}</span>`
    enterFly(rtEl, { y: 6, dur: 300 })
  }

  /* ---------- 掃描：一道光帶掃過，區塊逐一判讀 ---------- */
  function runRead(mid, { animate = true, onDone, hold } = {}) {
    clearT()
    hideCaptcha()
    setShell(mid)
    const rows = [...blocksEl.querySelectorAll('.bu-b')]
    if (!animate) {
      rows.forEach(b => { if (b.dataset.t !== hold) resolveBlock(b, mid) })
      updateRule(mid)
      onDone?.()
      return
    }
    rows.forEach(b => {
      b.classList.remove('ok', 'no')
      b.querySelector('.bu-lamp').className = 'bu-lamp'
      b.querySelector('.bu-lamp').innerHTML = ''
      b.querySelector('.bu-why').textContent = b.dataset.t === hold ? '等你本人處理…' : '判讀中…'
    })
    const h = win.clientHeight || 320
    const top = crm.offsetHeight
    scanEl.style.opacity = '1'
    scanEl.animate(
      [{ transform: `translateY(${top}px)` }, { transform: `translateY(${h - 2}px)` }],
      { duration: 240 + rows.length * 150, easing: 'cubic-bezier(.4,0,.5,1)' }
    )
    rows.forEach((b, i) => { if (b.dataset.t !== hold) T(() => resolveBlock(b, mid), 200 + i * 150) })
    T(() => { scanEl.style.opacity = '0' }, 260 + rows.length * 150)
    T(() => {
      if (hold) {
        const p = PAGES[curPage]
        scoreEl.textContent = `${p.blocks.length - 1}/${p.blocks.length}`
        rtEl.innerHTML = `這一題卡在：<b class="bad">CAPTCHA — AI 過不去，也不會硬闖</b>` +
          `<span class="sub">它停下來把控制權交還給你，等你處理完再繼續</span>`
        enterFly(rtEl, { y: 6, dur: 300 })
      } else updateRule(mid)
      onDone?.()
    }, 320 + rows.length * 150)
  }

  function showCaptcha() {
    veilEl.classList.add('show')
    capEl.classList.add('show')
    win.style.borderColor = AMBER
    pop(capEl, 1.05)
  }
  function hideCaptcha() {
    veilEl.classList.remove('show')
    capEl.classList.remove('show')
    win.style.borderColor = ''
  }
  capBtn.onclick = () => {
    pop(capBtn)
    hideCaptcha()
    const b = blocksEl.querySelector('.bu-b[data-t="auth"]')
    if (b) {
      resolveBlock(b, 'chrome')
      pop(b, 1.03)
      const r = b.getBoundingClientRect(), w = win.getBoundingClientRect()
      confettiBurst(win, r.width * 0.5, r.top - w.top + r.height / 2, GREEN, 16)
    }
    updateRule('chrome')
  }

  function setPickable(on) {
    pickable = on
    METHODS.forEach(m => {
      const c = card(m.id)
      c.classList.toggle('pick', on)
      c.onclick = on ? () => { pop(c); runRead(m.id) } : null
    })
    pagesEl.querySelectorAll('.bu-chip').forEach(c => {
      c.disabled = !on
      c.onclick = on ? () => { pop(c); renderPage(c.dataset.page, { animate: true }); runRead(curMethod) } : null
    })
  }

  function resetScene() {
    clearT()
    hideCaptcha()
    setPickable(false)
    resetBtn.classList.add('hide')
    stampEl.classList.remove('show')
  }

  function startSandboxRun() {
    resetScene()
    renderPage('site', { animate: true })
    runRead('websearch')
    setPickable(true)
    resetBtn.classList.remove('hide')
    resetBtn.onclick = () => { pop(resetBtn); startSandboxRun() }
  }

  /* ---------- beats ---------- */
  const beats = [
    {
      narration: '你叫 AI「上網查一下」，腦中的畫面是它開瀏覽器在讀網頁。<b>其實大部分時候，它根本沒開瀏覽器。</b>',
      focus: ['.bu-card[data-m="websearch"]', '.bu-win'], nextLabel: '那它讀的是什麼？ →',
      enter() { resetScene(); renderPage('doc'); runRead('websearch') },
    },
    {
      narration: '它走的是 <b>Web Search</b> — 直接打搜尋 API。而搜尋引擎給你的，是它<b>事先收錄好</b>的那份副本。',
      focus: ['.bu-win'], nextLabel: '副本有什麼問題？ →',
      enter() {
        resetScene(); renderPage('doc'); runRead('websearch', { animate: false })
        T(() => { pop(crm.querySelector('.bu-cb'), 1.35); shake(crm.querySelector('.bu-cb')) }, 320)
        T(() => enterFly(rtEl, { y: 8, dur: 380 }), 520)
      },
    },
    {
      narration: '換一個真實一點的網站 — 副本拿不到的，剛好就<b>四種</b>：要跑起來才長出來的、要登入的、要點才出現的、太新的。',
      focus: ['.bu-win', '.bu-rule'], nextLabel: '那就把瀏覽器開起來 →',
      enter() {
        resetScene(); renderPage('site', { animate: true })
        T(() => runRead('websearch'), 260)
      },
    },
    {
      narration: '要開瀏覽器，分水嶺是<b>共用你已登入的，還是另開一個乾淨的</b>。先看共用的 — 登入牆後面直接亮。',
      focus: ['.bu-card[data-m="chrome"]', '.bu-win', '.bu-rule'], nextLabel: '那乾淨的那條呢？ →',
      enter() {
        resetScene(); renderPage('site'); runRead('websearch', { animate: false })
        T(() => { pop(card('chrome').querySelector('.ic'), 1.35); runRead('chrome') }, 320)
      },
    },
    {
      narration: '<b>Playwright</b> 另開一個乾淨的：動態內容一樣讀得到，<b>但登入牆照樣擋住</b> — 代價換來的是乾淨、可重複、能上 CI。',
      focus: ['.bu-card[data-m="playwright"]', '.bu-win', '.bu-rule'], nextLabel: '看一個真實案例 →',
      enter() {
        resetScene(); renderPage('site'); runRead('chrome', { animate: false })
        T(() => { pop(card('playwright').querySelector('.ic'), 1.35); runRead('playwright') }, 320)
        T(() => shake(blocksEl.querySelector('.bu-b[data-t="auth"]')), 1000)
      },
    },
    {
      narration: '幫媽媽從蝦皮抄訂單：<b>沒開 API ＋ 要登入</b>，只剩這條路。而它碰到 CAPTCHA 會<b>停下來，把控制權交還給你</b>。',
      focus: ['.bu-win', '.bu-rule'], nextLabel: '換你玩 →',
      enter() {
        resetScene(); renderPage('shopee', { animate: true })
        T(() => runRead('chrome', { hold: 'auth', onDone: showCaptcha }), 300)
      },
      exit() { hideCaptcha() },
    },
    {
      narration: '換你切 — 不要問哪條最強，要問<b>我這件事卡在哪一關</b>：拿不到內容？過不了登入？還是要可重複？',
      sandbox: true,
      enter() { startSandboxRun() },
    },
  ]

  const stage = createStage(el, ctx, { beats })
  stage.body.append(pagesEl, main, rule, ctrls)

  return () => { clearT(); stage.destroy(); style.remove() }
}
