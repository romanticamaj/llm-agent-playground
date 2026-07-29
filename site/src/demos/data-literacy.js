// Demo：資料素養三層 — 友善 / 轉換 / 接口 — DemoStage 導演版
// 5 拍：金字塔登場｜資料友善（讀得動）｜資料轉換（目的地決定格式）｜資料接口（固化成規範/MCP）｜sandbox 分類遊戲。
import { createStage, pop, shake, enterFly, countUp, confettiBurst } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const GOLD = '#fbbf24', RED = '#f87171', GREEN = '#4ade80', TEAL = '#2dd4bf'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const LAYER = { friendly: accent, transform: TEAL, interface: GOLD }

  const IC = {
    doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h4"/>',
    img: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 16l5-5l4 4l3-3l6 6"/><circle cx="9" cy="9" r="1.5"/>',
    plug: '<path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0z"/><path d="M12 16v5"/>',
    mold: '<path d="M4 7l8-4l8 4v10l-8 4l-8-4z"/><path d="M12 3v18M4 7l8 4l8-4"/>',
    skill: '<path d="M12 3l2.5 5.5L20 9l-4 4l1 6l-5-3l-5 3l1-6l-4-4l5.5-.5z"/>',
  }
  const svg = (p, c = 'currentColor') => `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`

  const style = document.createElement('style')
  style.textContent = `
  .dl-wrap{display:flex;gap:26px;align-items:center}
  .dl-wrap svg{width:1.4em;height:1.4em;vertical-align:-.3em}
  .dl-pyr{flex:none;width:340px;display:flex;flex-direction:column;align-items:center;gap:7px}
  .dl-tier{position:relative;height:74px;display:flex;flex-direction:column;align-items:center;justify-content:center;
    color:#08090a;font-weight:700;transition:transform .5s ${EASE},filter .5s,box-shadow .4s;cursor:default}
  .dl-tier .n{font-size:18px;letter-spacing:.02em}
  .dl-tier .s{font-size:12.5px;font-weight:500;opacity:.8;margin-top:2px;font-family:var(--font-mono)}
  .dl-tier.t0{width:150px;clip-path:polygon(24% 0,76% 0,100% 100%,0 100%);background:${LAYER.interface}}
  .dl-tier.t1{width:250px;clip-path:polygon(12% 0,88% 0,100% 100%,0 100%);background:${LAYER.transform}}
  .dl-tier.t2{width:340px;clip-path:polygon(6% 0,94% 0,100% 100%,0 100%);background:${LAYER.friendly}}
  .dl-tier.lit{box-shadow:0 0 0 2px #fff,0 0 26px -4px currentColor;transform:scale(1.04)}
  .dl-tier.drop{outline:2px dashed rgba(255,255,255,.7);outline-offset:3px}
  .dl-side{flex:1;min-width:0;min-height:300px;display:flex;flex-direction:column;justify-content:center;gap:14px}
  .dl-h{font-size:15px;color:var(--text-dim);text-align:center}
  .dl-cmp{display:flex;gap:16px}
  .dl-panel{flex:1;border:1px solid var(--line);border-radius:14px;padding:14px;background:rgba(255,255,255,.03)}
  .dl-panel .pt{font-size:14.5px;font-weight:600;margin-bottom:10px;display:flex;align-items:center;gap:8px}
  .dl-panel.bad .pt svg{color:${RED}}.dl-panel.good .pt svg{color:${GREEN}}
  .dl-garble{font-family:var(--font-mono);font-size:12px;color:#8b93a7;line-height:1.7;
    filter:blur(.4px);letter-spacing:.5px;word-break:break-all;height:96px;overflow:hidden}
  .dl-fields{display:flex;flex-direction:column;gap:6px;height:96px}
  .dl-field{font-family:var(--font-mono);font-size:12.5px;display:flex;gap:8px;padding:5px 9px;border-radius:7px;
    background:${GREEN}14;border:1px solid ${GREEN}33}
  .dl-field b{color:${GREEN};min-width:56px}
  .dl-rate{margin-top:12px;display:flex;align-items:center;gap:10px}
  .dl-rate .rl{font-size:13px;color:var(--text-dim);min-width:74px}
  .dl-rbar{flex:1;height:14px;border-radius:7px;background:rgba(255,255,255,.06);overflow:hidden}
  .dl-rfill{height:100%;width:0;border-radius:7px;transition:width 1s ${EASE}}
  .dl-panel.bad .dl-rfill{background:${RED}}.dl-panel.good .dl-rfill{background:${GREEN}}
  .dl-rpct{font-family:var(--font-mono);font-size:14px;font-weight:600;min-width:44px;text-align:right}
  .dl-morph{display:flex;flex-direction:column;align-items:center;gap:18px}
  .dl-src{border:1px solid var(--line);border-radius:12px;padding:12px 18px;background:rgba(255,255,255,.04);
    font-size:15px;display:flex;align-items:center;gap:8px}
  .dl-fmts{display:flex;gap:14px}
  .dl-fmt{border:1px solid var(--line);border-radius:10px;padding:12px 20px;background:rgba(255,255,255,.03);
    font-family:var(--font-mono);font-size:15px;font-weight:600;opacity:0}
  .dl-fmt[data-f="md"]{color:${accent}}.dl-fmt[data-f="csv"]{color:${TEAL}}.dl-fmt[data-f="html"]{color:${GOLD}}
  .dl-iface{display:flex;flex-direction:column;align-items:center;gap:16px}
  .dl-mold{display:flex;align-items:center;gap:20px}
  .dl-mold .box{border:1px solid var(--line);border-radius:12px;padding:14px 18px;display:flex;flex-direction:column;
    align-items:center;gap:6px;font-size:13.5px;color:var(--text-dim);min-width:118px;transition:all .4s}
  .dl-mold .box svg{width:30px;height:30px}
  .dl-mold .box.molded{border-color:${GOLD};color:${GOLD};background:${GOLD}12}
  .dl-mold .box.molded svg{color:${GOLD}}
  .dl-mold .box.plugon{border-color:${GREEN};color:${GREEN};background:${GREEN}12}
  .dl-mold .box.plugon svg{color:${GREEN}}
  .dl-arrow{color:var(--text-dim);font-size:22px}
  .dl-note{font-size:14.5px;color:var(--text);border:1px solid var(--line);border-radius:12px;padding:12px 18px;
    background:rgba(255,255,255,.03);text-align:center;max-width:440px;opacity:0}
  .dl-note b{color:${accent}}
  .dl-cards{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
  .dl-card{border:1px solid var(--line);border-radius:12px;padding:11px 15px;background:rgba(255,255,255,.04);
    font-size:14.5px;cursor:pointer;transition:all .25s ${EASE};display:flex;align-items:center;gap:8px}
  .dl-card:hover{transform:translateY(-2px);border-color:var(--text)}
  .dl-card.sel{border-color:#fff;box-shadow:0 0 0 2px #fff}
  .dl-card.placed{opacity:.4;pointer-events:none;border-color:${GREEN}}
  .dl-card svg{width:1.3em;height:1.3em;color:var(--text-dim)}
  .dl-status{text-align:center;font-size:14px;color:var(--text-dim);min-height:22px}
  .dl-status b{color:var(--text)}
  .dl-ctrls{display:flex;gap:10px;justify-content:center}
  .dl-btn{font-family:var(--font-tc);font-size:15px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:9px 18px;cursor:pointer;transition:all .25s ${EASE}}
  .dl-btn:hover{border-color:var(--text)}
  .dl-btn.hide{display:none}
  `
  el.appendChild(style)

  const wrap = document.createElement('div')
  wrap.className = 'dl-wrap'
  wrap.innerHTML = `
    <div class="dl-pyr ds-unit">
      <div class="dl-tier t0" data-layer="interface"><span class="n">資料接口</span><span class="s">可重複 · 固化</span></div>
      <div class="dl-tier t1" data-layer="transform"><span class="n">資料轉換</span><span class="s">目的地決定格式</span></div>
      <div class="dl-tier t2" data-layer="friendly"><span class="n">資料友善</span><span class="s">讀得動的形式</span></div>
    </div>
    <div class="dl-side ds-unit"></div>`

  const ctrls = document.createElement('div')
  ctrls.className = 'dl-ctrls ds-unit'

  let stage
  const side = wrap.querySelector('.dl-side')
  const tiers = { friendly: wrap.querySelector('[data-layer="friendly"]'), transform: wrap.querySelector('[data-layer="transform"]'), interface: wrap.querySelector('[data-layer="interface"]') }

  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  function litOnly(key) { Object.entries(tiers).forEach(([k, t]) => t.classList.toggle('lit', k === key)) }
  function clearScene() { clearT(); side.innerHTML = ''; ctrls.innerHTML = ''; Object.values(tiers).forEach(t => t.classList.remove('lit', 'drop')) }

  function sceneFriendly() {
    clearScene(); litOnly('friendly')
    side.innerHTML = `<div class="dl-h">同一份自費表，餵給 AI 的兩種形式 — 它讀得動嗎？</div>
      <div class="dl-cmp">
        <div class="dl-panel bad"><div class="pt">${svg(IC.img)}一坨截圖亂文</div>
          <div class="dl-garble">§ 自%費 項目　　金額?? 玻尿酸 12,0OO 元 || 肉毒 —— 8OOO NT 雷射 3次 15000（含 稅?）備註:vip 打9折…亂碼��</div>
          <div class="dl-rate"><span class="rl">讀取成功率</span><div class="dl-rbar"><div class="dl-rfill"></div></div><span class="dl-rpct r0">0%</span></div></div>
        <div class="dl-panel good"><div class="pt">${svg(IC.doc)}結構化欄位文字</div>
          <div class="dl-fields">
            <div class="dl-field"><b>項目</b>玻尿酸</div><div class="dl-field"><b>金額</b>12000</div>
            <div class="dl-field"><b>項目</b>肉毒</div><div class="dl-field"><b>金額</b>8000</div></div>
          <div class="dl-rate"><span class="rl">讀取成功率</span><div class="dl-rbar"><div class="dl-rfill"></div></div><span class="dl-rpct r1">0%</span></div></div>
      </div>`
    side.querySelectorAll('.dl-panel').forEach((p, i) => enterFly(p, { y: 22, delay: i * 150, dur: 540 }))
    T(() => { side.querySelector('.bad .dl-rfill').style.width = '30%'; countUp(side.querySelector('.r0'), 30, { dur: 900, fmt: v => Math.round(v) + '%' }); shake(side.querySelector('.bad')) }, 1000)
    T(() => { side.querySelector('.good .dl-rfill').style.width = '96%'; countUp(side.querySelector('.r1'), 96, { dur: 1000, fmt: v => Math.round(v) + '%' }) }, 1300)
  }

  function sceneTransform() {
    clearScene(); litOnly('transform')
    side.innerHTML = `<div class="dl-morph">
      <div class="dl-src">${svg(IC.doc, accent)} 一份排班資料</div>
      <div class="dl-h">目的地決定格式 — 同一份資料變身三種樣子</div>
      <div class="dl-fmts">
        <div class="dl-fmt" data-f="md">.md 給文件</div>
        <div class="dl-fmt" data-f="csv">.csv 給 Excel</div>
        <div class="dl-fmt" data-f="html">.html 給列印</div></div></div>`
    enterFly(side.querySelector('.dl-src'), { y: 18, dur: 500 })
    const fmts = side.querySelectorAll('.dl-fmt')
    fmts.forEach((f, i) => T(() => { f.style.opacity = '1'; enterFly(f, { y: 26, dur: 480 }); pop(f) }, 700 + i * 320))
  }

  function sceneInterface() {
    clearScene(); litOnly('interface')
    side.innerHTML = `<div class="dl-iface">
      <div class="dl-h">轉換要<b style="color:${GOLD}">可重複</b> — 就把它固化成規範</div>
      <div class="dl-mold">
        <div class="box src">${svg(IC.doc)}<span>.md 轉換步驟</span></div>
        <span class="dl-arrow">→</span>
        <div class="box mold">${svg(IC.mold)}<span>規範模具</span></div>
        <span class="dl-arrow">→</span>
        <div class="box skill">${svg(IC.skill)}<span>SKILL 包</span></div>
      </div>
      <div class="dl-mold" style="margin-top:2px">
        <div class="box plug">${svg(IC.plug)}<span>MCP 插頭</span></div>
      </div>
      <div class="dl-note">skill ＝ <b>流程</b>的接口、MCP ＝ <b>工具</b>的接口 — 同一件事：把可重複的東西固化下來。</div></div>`
    const src = side.querySelector('.src'), mold = side.querySelector('.mold'), skill = side.querySelector('.skill'), plug = side.querySelector('.plug'), note = side.querySelector('.dl-note')
    enterFly(src, { y: 16, dur: 460 })
    T(() => { mold.classList.add('molded'); pop(mold) }, 700)
    T(() => { skill.classList.add('molded'); enterFly(skill, { y: 20, dur: 480 }); pop(skill); const r = skill.getBoundingClientRect(), br = stage.body.getBoundingClientRect(); confettiBurst(stage.body, r.left - br.left + r.width / 2, r.top - br.top + 20, GOLD, 20) }, 1300)
    T(() => { plug.classList.add('plugon'); pop(plug) }, 1900)
    T(() => { note.style.opacity = '1'; enterFly(note, { y: 14, dur: 500 }) }, 2400)
  }

  // ---------- sandbox ----------
  const CASES = [
    { q: '自費表截圖 → 整理成欄位', layer: 'friendly', ic: IC.img },
    { q: '排班表轉成 .ics 檔', layer: 'transform', ic: IC.doc },
    { q: 'SKILL.md 驗證規範', layer: 'interface', ic: IC.skill },
    { q: 'Gmail MCP 連接', layer: 'interface', ic: IC.plug },
    { q: '知識庫逐份建檔', layer: 'friendly', ic: IC.doc },
    { q: '會議記錄轉 HTML', layer: 'transform', ic: IC.doc },
  ]
  const LAYNAME = { friendly: '資料友善', transform: '資料轉換', interface: '資料接口' }
  let sel = null, placed = 0

  function renderSandbox() {
    clearScene(); sel = null; placed = 0
    side.innerHTML = `<div class="dl-h">點一張案例卡，再點金字塔對應的那一層。</div>
      <div class="dl-cards"></div><div class="dl-status">還沒分類</div>`
    const cardsEl = side.querySelector('.dl-cards')
    CASES.forEach((c, i) => {
      const card = document.createElement('div'); card.className = 'dl-card'; card.dataset.i = i
      card.innerHTML = `${svg(c.ic)}${c.q}`
      card.onclick = () => selectCard(card)
      cardsEl.appendChild(card); enterFly(card, { y: 14, delay: i * 60, dur: 400 })
    })
    Object.entries(tiers).forEach(([k, t]) => { t.classList.add('drop'); t.style.cursor = 'pointer'; t.onclick = () => dropTo(k) })
    const reset = document.createElement('button'); reset.className = 'dl-btn'; reset.textContent = '重來'
    reset.onclick = () => { pop(reset); renderSandbox() }; ctrls.appendChild(reset)
  }

  function selectCard(card) {
    if (card.classList.contains('placed')) return
    side.querySelectorAll('.dl-card').forEach(c => c.classList.remove('sel'))
    card.classList.add('sel'); sel = card; pop(card)
    setStatus(`已選「<b>${CASES[+card.dataset.i].q}</b>」— 點它該進哪一層`)
  }

  function dropTo(layer) {
    if (!sel) { setStatus('先點一張案例卡'); shake(tiers[layer]); return }
    const c = CASES[+sel.dataset.i]
    if (c.layer === layer) {
      sel.classList.add('placed'); sel.classList.remove('sel')
      pop(tiers[layer]); const r = tiers[layer].getBoundingClientRect(), br = stage.body.getBoundingClientRect()
      confettiBurst(stage.body, r.left - br.left + r.width / 2, r.top - br.top + 30, LAYER[layer], 14)
      placed++; sel = null
      setStatus(`對！這是 <b>${LAYNAME[layer]}</b>（${placed}/${CASES.length}）`)
      if (placed >= CASES.length) T(() => finishSandbox(), 500)
    } else {
      shake(tiers[layer]); shake(sel)
      setStatus(`不對 — 這張不屬於 ${LAYNAME[layer]}，再想想`)
    }
  }

  function finishSandbox() {
    setStatus('<b>六張全歸位。</b>友善→讀得動、轉換→變格式、接口→固化成規範。')
    Object.values(tiers).forEach(t => t.classList.remove('drop'))
    const br = stage.body.getBoundingClientRect(); confettiBurst(stage.body, br.width / 2, br.height / 2, GOLD, 30)
  }

  function setStatus(html) { const s = side.querySelector('.dl-status'); if (s) { s.innerHTML = html; enterFly(s, { y: 6, dur: 300 }) } }

  function resetScene() { clearScene(); Object.values(tiers).forEach(t => { t.onclick = null; t.style.cursor = ''; t.classList.remove('drop') }) }

  function buildBeats() {
    return [
      { narration: 'AI 協作，其實是一門<b>資料素養</b> — 由下而上三層：友善、轉換、接口。', focus: ['.dl-pyr'], nextLabel: '從最底層開始 →',
        enter() { resetScene(); const ts = [tiers.friendly, tiers.transform, tiers.interface]; ts.forEach((t, i) => T(() => { enterFly(t, { y: 26, dur: 560 }); pop(t) }, i * 260)) } },
      { narration: '第一層 資料友善：餵給 AI 的東西，要是它<b>讀得動</b>的形式。', focus: ['.dl-side', '[data-layer="friendly"]'], nextLabel: '第二層 →',
        enter() { resetScene(); sceneFriendly() } },
      { narration: '第二層 資料轉換：<b>目的地決定格式</b>。同一份資料，該給誰就變成誰讀的樣子。', focus: ['.dl-side', '[data-layer="transform"]'], nextLabel: '第三層 →',
        enter() { resetScene(); sceneTransform() } },
      { narration: '第三層 資料接口：轉換要<b>可重複</b>，就固化成規範 — skill 是流程接口、MCP 是工具接口。', focus: ['.dl-side', '[data-layer="interface"]'], nextLabel: '換你分類 →',
        enter() { resetScene(); sceneInterface() } },
      { narration: '換你分類 — 六張課堂案例，各自屬於哪一層？點卡片，再點金字塔。', sandbox: true,
        enter() { resetScene(); renderSandbox() } },
    ]
  }

  stage = createStage(el, ctx, { beats: buildBeats() })
  stage.body.append(wrap, ctrls)

  return () => { clearT(); Object.values(tiers).forEach(t => t.onclick = null); stage.destroy(); style.remove() }
}
