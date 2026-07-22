// Demo：確定性 vs 非確定性 — DemoStage 導演版
// 5 拍：兩台機器登場｜函式跑 10 次重合成一條｜LLM 跑 10 次散成煙火｜temperature 滑桿收斂/發散｜
// sandbox = 工作流分類器（六張任務卡分進「給程式 / 給 AI」兩籃）。
import { createStage, pop, shake, confettiBurst, countUp } from './_stage.js'

const GREEN = '#4ade80', GOLD = '#fbbf24', RED = '#f87171'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'

  const OUTPUTS = [
    '今天像被揉皺又攤平的一張紙。', '今天是溫吞的、剛剛好的一天。', '像一杯忘了加糖的咖啡。',
    '今天有點灰，但灰得很溫柔。', '一切都慢半拍，卻剛剛好。', '像午後突然想睡的那種鬆。',
    '平凡到值得被記住的一天。', '今天是還沒說完的一句話。', '像雨後還沒乾的柏油路。', '有點忙，但心是靜的。',
  ]
  const TASKS = [
    { id: 'invoice', name: '發票對帳', a: 'det', why: '抓金額、逐筆比對、標出差異 — 步驟講得出來，交給程式最穩。' },
    { id: 'schedule', name: '診所排班', a: 'non', why: '「排得公平」沒辦法量化成規則，只能靠判斷 — 交給 AI 或人。' },
    { id: 'report', name: '每月報表', a: 'det', why: '固定來源、固定欄位、固定格式，每月同一套步驟 — 寫成程式跑。' },
    { id: 'copy', name: '寫社群文案', a: 'non', why: '好不好、有沒有梗沒有標準答案，要的是變化 — 交給 AI。' },
    { id: 'backup', name: '備份檔案', a: 'det', why: '複製哪些檔、放哪裡、幾點跑，全說得出來 — 決定性流程。' },
    { id: 'reply', name: '客訴回覆草稿', a: 'non', why: '每封客訴的情緒脈絡都不同，要拿捏語氣 — AI 起草再由人確認。' },
  ]
  const OK = `<svg class="dvn-ic" viewBox="0 0 24 24" fill="none" stroke="${GREEN}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`

  const style = document.createElement('style')
  style.textContent = `
  .dvn-cols{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:14px}
  .dvn-card{border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.02);display:flex;flex-direction:column;overflow:hidden;min-height:300px}
  .dvn-head{padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:baseline;gap:10px}
  .dvn-head .t{font-size:19px;font-weight:600;color:#eef1f7}
  .dvn-head .s{font-size:14px;letter-spacing:.1em;text-transform:uppercase;font-family:var(--font-mono)}
  .dvn-in{font-size:15px;color:#8b91a2;padding:8px 18px 0}
  .dvn-in code{color:#e8ebf2;background:rgba(255,255,255,.06);padding:2px 7px;border-radius:5px}
  .dvn-cbox{flex:1;position:relative;min-height:130px}
  .dvn-cbox canvas{position:absolute;inset:0;width:100%;height:100%}
  .dvn-tag{position:absolute;top:10px;right:12px;font-size:15px;padding:3px 9px;border-radius:999px;font-weight:600;font-family:var(--font-mono)}
  .dvn-tag.det{color:${GREEN};background:${GREEN}1f;border:1px solid ${GREEN}4d}
  .dvn-tag.non{color:${GOLD};background:${GOLD}1f;border:1px solid ${GOLD}4d}
  .dvn-out{padding:8px 16px 12px;font-size:15px;line-height:1.5;height:118px;overflow:auto}
  .dvn-out .row{padding:2px 0;color:#c3c8d4;opacity:0;transform:translateX(-6px);transition:all .3s}
  .dvn-out .row.show{opacity:1;transform:none}
  .dvn-out .row .n{color:#6b7180;font-variant-numeric:tabular-nums;margin-right:8px;font-family:var(--font-mono)}
  .dvn-out .same{color:${GREEN};font-weight:600}
  .dvn-temp{display:flex;align-items:center;gap:14px;padding:12px 4px;flex-wrap:wrap}
  .dvn-temp label{font-size:16px;color:#c3c8d4}
  .dvn-temp input[type=range]{flex:1;accent-color:${accent};min-width:180px;max-width:380px}
  .dvn-temp .val{font-size:17px;font-weight:600;color:${accent};font-variant-numeric:tabular-nums;width:2.6em;text-align:right;font-family:var(--font-mono)}
  .dvn-temp .desc{font-size:15px;color:#7d8496;min-width:6em}
  .dvn-hide{display:none!important}
  .dvn-clf{display:flex;flex-direction:column;gap:16px}
  .dvn-crit{display:flex;gap:12px;flex-wrap:wrap;font-size:15.5px}
  .dvn-crit .c{flex:1;min-width:220px;border:1px solid var(--line);border-radius:10px;padding:9px 13px;line-height:1.5;color:#aeb4c2}
  .dvn-crit .c b{color:#e8ebf2}
  .dvn-pool{display:flex;gap:10px;flex-wrap:wrap;min-height:44px}
  .dvn-chip{font-size:16px;padding:9px 15px;border-radius:10px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.04);color:#e8ebf2;cursor:grab;user-select:none;transition:transform .12s,border-color .18s,opacity .2s}
  .dvn-chip:hover{border-color:rgba(255,255,255,.3)}
  .dvn-chip.sel{border-color:${accent};box-shadow:0 0 0 1px ${accent} inset}
  .dvn-chip.placed{display:none}
  .dvn-baskets{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  @media (max-width:760px){.dvn-baskets,.dvn-cols{grid-template-columns:1fr}}
  .dvn-basket{border:1.5px dashed rgba(255,255,255,.2);border-radius:14px;padding:13px 15px;display:flex;flex-direction:column;gap:6px;min-height:120px;transition:border-color .18s,background .18s}
  .dvn-basket.det{border-color:${GREEN}59}.dvn-basket.non{border-color:${GOLD}59}
  .dvn-basket.hot{background:rgba(255,255,255,.05)}
  .dvn-basket .bh{font-size:17px;font-weight:600;display:flex;align-items:center;gap:8px}
  .dvn-basket.det .bh{color:${GREEN}}.dvn-basket.non .bh{color:${GOLD}}
  .dvn-basket .bs{font-size:15px;color:#828a9c}
  .dvn-drop{display:flex;flex-direction:column;gap:7px;margin-top:6px}
  .dvn-item{border-radius:9px;padding:8px 11px;background:${GREEN}1a;border:1px solid ${GREEN}4d}
  .dvn-item .nm{font-weight:600;color:#eef1f7;display:flex;align-items:center;gap:6px;font-size:15px}
  .dvn-item .why{font-size:15.5px;color:#aeb4c2;margin-top:3px;line-height:1.5}
  .dvn-prog{font-size:16px;color:#7d8496}.dvn-prog b{color:${GREEN}}
  .dvn-ic{width:1.05em;height:1.05em;vertical-align:-.14em}
  .dvn-btn{font-family:var(--font-tc);font-size:15.5px;color:var(--text);background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:999px;padding:9px 18px;cursor:pointer}
  .dvn-btn:hover{border-color:var(--text)}
  `
  el.appendChild(style)

  // ---- 對比場景 ----
  const compare = document.createElement('div')
  compare.className = 'dvn-compare ds-unit'
  compare.innerHTML = `
    <div class="dvn-cols">
      <div class="dvn-card" id="dvn-cardL">
        <div class="dvn-head"><span class="t">函式機器</span><span class="s" style="color:${GREEN}">DETERMINISTIC</span></div>
        <div class="dvn-in">輸入 <code>add(2, 2)</code> → 固定輸出</div>
        <div class="dvn-cbox"><canvas id="dvn-cL"></canvas><span class="dvn-tag det">10/10 相同</span></div>
        <div class="dvn-out" id="dvn-outL"></div>
      </div>
      <div class="dvn-card" id="dvn-cardR">
        <div class="dvn-head"><span class="t">LLM</span><span class="s" style="color:${GOLD}">NON-DETERMINISTIC</span></div>
        <div class="dvn-in">輸入 <code>「用一句話形容今天」</code> → 抽樣輸出</div>
        <div class="dvn-cbox"><canvas id="dvn-cR"></canvas><span class="dvn-tag non" id="dvn-tagR">10 條散開</span></div>
        <div class="dvn-out" id="dvn-outR"></div>
      </div>
    </div>
    <div class="dvn-temp">
      <label>Temperature</label>
      <input type="range" id="dvn-temp" min="0" max="2" step="0.05" value="0.9">
      <span class="val" id="dvn-tval">0.90</span><span class="desc" id="dvn-tdesc">有創意、發散</span>
    </div>`

  // ---- 分類器場景（sandbox）----
  const clf = document.createElement('div')
  clf.className = 'dvn-clf ds-unit dvn-hide'
  clf.innerHTML = `
    <div class="dvn-crit">
      <div class="c"><b>說得出第一步第二步第三步</b> ＝ Deterministic，交給程式。</div>
      <div class="c"><b>像「公平」這種沒辦法量化的</b> ＝ 非決定性，交給 AI。</div>
    </div>
    <div class="dvn-pool" id="dvn-pool"></div>
    <div class="dvn-baskets">
      <div class="dvn-basket det" data-basket="det"><div class="bh">${OK.replace(GREEN,'currentColor')}Deterministic 給程式</div><div class="bs">步驟講得出、每次一致</div><div class="dvn-drop" data-drop="det"></div></div>
      <div class="dvn-basket non" data-basket="non"><div class="bh">${OK.replace(GREEN,'currentColor')}Non-deterministic 給 AI</div><div class="bs">要判斷、沒有標準答案</div><div class="dvn-drop" data-drop="non"></div></div>
    </div>
    <div style="display:flex;align-items:center;gap:16px"><span class="dvn-prog" id="dvn-prog">已正確分類 <b>0</b> / ${TASKS.length}</span><button class="dvn-btn" id="dvn-again">重來</button></div>`

  const $ = s => (compare.querySelector(s) || clf.querySelector(s))
  const cL = $('#dvn-cL'), cR = $('#dvn-cR')
  const outL = $('#dvn-outL'), outR = $('#dvn-outR'), tagR = $('#dvn-tagR')
  const slider = $('#dvn-temp'), tval = $('#dvn-tval'), tdesc = $('#dvn-tdesc')

  const timers = new Set(), rafs = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear(); rafs.forEach(cancelAnimationFrame); rafs.clear() }
  let temperature = 0.9, stage

  function fit(c) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2), r = c.getBoundingClientRect()
    c.width = Math.max(10, r.width * dpr); c.height = Math.max(10, r.height * dpr)
    c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)
    return { w: r.width, h: r.height }
  }
  function rnd32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
  function makePath(w, h, seed, spread) {
    const r = rnd32(seed), sy = h / 2, pts = [{ x: 8, y: sy }], n = 5
    for (let i = 1; i <= n; i++) { const x = 8 + (w - 16) * (i / n), j = (r() - .5) * 2 * spread * (i / n); pts.push({ x, y: Math.max(8, Math.min(h - 8, sy + j)) }) }
    return pts
  }
  function drawPaths(c, paths, color, prog) {
    const g = c.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2)
    g.clearRect(0, 0, c.width / dpr, c.height / dpr)
    paths.forEach(pts => {
      g.beginPath(); g.moveTo(pts[0].x, pts[0].y)
      const last = 1 + (pts.length - 1) * prog
      for (let k = 1; k < pts.length; k++) { const p = pts[k]; if (k <= last) g.lineTo(p.x, p.y); else { const pv = pts[k - 1], f = Math.max(0, Math.min(1, last - (k - 1))); g.lineTo(pv.x + (p.x - pv.x) * f, pv.y + (p.y - pv.y) * f); break } }
      g.strokeStyle = color; g.globalAlpha = .5; g.lineWidth = 2; g.stroke()
      if (prog >= 1) { const e = pts[pts.length - 1]; g.globalAlpha = 1; g.beginPath(); g.arc(e.x, e.y, 3.5, 0, 7); g.fillStyle = color; g.fill() }
    })
    g.globalAlpha = 1
  }
  function tempDesc(t) { return t <= .05 ? '幾乎收斂' : t < .5 ? '偏保守' : t < 1.1 ? '有創意、發散' : t < 1.6 ? '很發散' : '接近混亂' }

  function runSide(side) {
    const isL = side === 'L', c = isL ? cL : cR, out = isL ? outL : outR
    const dim = fit(c)
    let paths
    if (isL) paths = Array.from({ length: 10 }, () => makePath(dim.w, dim.h, 42, 0))
    else { const sp = (dim.h / 2 - 14) * (.02 + .98 * (temperature / 2)); paths = Array.from({ length: 10 }, (_, i) => makePath(dim.w, dim.h, 100 + i * 7, sp)) }
    out.innerHTML = ''
    if (!isL) tagR.textContent = temperature <= .05 ? '幾乎收斂' : '10 條散開'
    const t0 = performance.now()
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / 850)
      drawPaths(c, paths, isL ? GREEN : accent, p)
      if (p < 1) { const id = requestAnimationFrame(tick); rafs.add(id) }
      else reveal(isL, out)
    }
    const id = requestAnimationFrame(tick); rafs.add(id)
  }
  function reveal(isL, out) {
    const r = rnd32(Math.round(temperature * 1000) + 7)
    for (let i = 0; i < 10; i++) T(() => {
      let text
      if (isL) text = `<span class="same">4</span>`
      else if (temperature <= .08) text = OUTPUTS[0]
      else if (temperature < .5) text = OUTPUTS[Math.floor(r() * 3)]
      else text = OUTPUTS[Math.floor(r() * OUTPUTS.length)]
      const row = document.createElement('div'); row.className = 'row'
      row.innerHTML = `<span class="n">#${i + 1}</span>${text}`
      out.appendChild(row); requestAnimationFrame(() => row.classList.add('show'))
    }, i * 55)
  }
  function clearCanvas() { [cL, cR].forEach(c => { const d = fit(c); c.getContext('2d').clearRect(0, 0, d.w, d.h) }); outL.innerHTML = ''; outR.innerHTML = '' }

  slider.addEventListener('input', () => {
    temperature = parseFloat(slider.value); tval.textContent = temperature.toFixed(2); tdesc.textContent = tempDesc(temperature)
    clearT(); runSide('R')
  })

  // ---- 分類器互動 ----
  const pool = clf.querySelector('#dvn-pool'), prog = clf.querySelector('#dvn-prog')
  let selectedId = null, placed = 0
  function buildPool() {
    pool.innerHTML = ''; clf.querySelectorAll('.dvn-drop').forEach(d => d.innerHTML = '')
    selectedId = null; placed = 0
    prog.innerHTML = `已正確分類 <b>0</b> / ${TASKS.length}`
    TASKS.map(t => t).sort(() => Math.random() - .5).forEach(t => {
      const chip = document.createElement('button'); chip.className = 'dvn-chip'; chip.dataset.id = t.id; chip.draggable = true; chip.textContent = t.name; pool.appendChild(chip)
    })
  }
  function place(id, basket) {
    const task = TASKS.find(t => t.id === id), chip = pool.querySelector(`.dvn-chip[data-id="${id}"]`)
    if (!task || !chip || chip.classList.contains('placed')) return
    if (task.a === basket) {
      chip.classList.add('placed'); selectedId = null
      const drop = clf.querySelector(`.dvn-drop[data-drop="${basket}"]`)
      const item = document.createElement('div'); item.className = 'dvn-item'
      item.innerHTML = `<div class="nm">${OK}${task.name}</div><div class="why">${task.why}</div>`
      drop.appendChild(item); pop(item)
      const pb = prog.querySelector('b'); countUp(pb, ++placed, { from: placed - 1, dur: 300 })
      if (placed === TASKS.length) {
        prog.innerHTML = `全部分對了。<b>能拆成步驟的給程式、要靠判斷的給 AI</b> — 分派工作的第一準則。`
        const r = prog.getBoundingClientRect(), br = stage.body.getBoundingClientRect()
        confettiBurst(stage.body, r.left - br.left + 40, r.top - br.top, GREEN, 30)
      }
    } else {
      shake(chip)
      prog.innerHTML = `<span style="color:${RED}">「${task.name}」放錯了</span> — ${task.why.split('—')[0].trim()}它該去另一邊。`
    }
  }
  pool.addEventListener('click', e => {
    const chip = e.target.closest('.dvn-chip'); if (!chip || chip.classList.contains('placed')) return
    const same = chip.dataset.id === selectedId
    pool.querySelectorAll('.dvn-chip').forEach(c => c.classList.remove('sel'))
    selectedId = same ? null : (chip.classList.add('sel'), chip.dataset.id)
  })
  clf.querySelectorAll('.dvn-basket').forEach(b => {
    const basket = b.dataset.basket
    b.addEventListener('click', () => { if (selectedId) place(selectedId, basket) })
    b.addEventListener('dragover', e => { e.preventDefault(); b.classList.add('hot') })
    b.addEventListener('dragleave', () => b.classList.remove('hot'))
    b.addEventListener('drop', e => { e.preventDefault(); b.classList.remove('hot'); const id = e.dataTransfer.getData('text/plain'); if (id) place(id, basket) })
  })
  pool.addEventListener('dragstart', e => { const chip = e.target.closest('.dvn-chip'); if (chip && !chip.classList.contains('placed')) e.dataTransfer.setData('text/plain', chip.dataset.id) })
  clf.querySelector('#dvn-again').addEventListener('click', buildPool)

  function showCompare(on) { compare.classList.toggle('dvn-hide', !on); clf.classList.toggle('dvn-hide', on) }

  const beats = [
    { narration: '同樣的輸入，跑十次 — 左邊是<b>函式</b>，右邊是 <b>LLM</b>。準備好了嗎？', focus: ['.dvn-compare'], nextLabel: '先跑函式 →',
      enter() { showCompare(true); clearT(); clearCanvas(); tagR.textContent = '10 條散開' } },

    { narration: '函式跑十次，十條路<b>完全重合成一條</b>，答案永遠是 <b>4</b> — 這就是<b>確定</b>。', focus: ['#dvn-cardL'], nextLabel: '換 LLM 跑 →',
      enter() { showCompare(true); clearT(); outL.innerHTML = ''; runSide('L') } },

    { narration: '同一句 prompt 丟給 LLM，十次<b>散成十條不同的路</b>、十句不同的話 — <b>非確定</b>，它在機率上抽樣。', focus: ['#dvn-cardR'], nextLabel: '調 temperature →',
      enter() { showCompare(true); clearT(); temperature = 0.9; slider.value = '0.9'; tval.textContent = '0.90'; tdesc.textContent = tempDesc(0.9); outR.innerHTML = ''; runSide('R') } },

    { narration: '拉 <b>temperature</b>：拉到 0 右邊收斂到幾乎同一句，拉高越發散。抽樣是特性，不是 bug。<b>動手拉滑桿試試</b>。', focus: ['.dvn-temp', '#dvn-cardR'], nextLabel: '換你分派工作 →',
      enter() { showCompare(true); clearT(); temperature = 0; slider.value = '0'; tval.textContent = '0.00'; tdesc.textContent = tempDesc(0); outR.innerHTML = ''; runSide('R') } },

    { narration: '換你分派工作 — <b>說得出步驟的給程式，講不出的給 AI</b>。六張卡，點卡再點籃子（或直接拖）。', sandbox: true,
      enter() { showCompare(false); clearT(); buildPool() } },
  ]

  stage = createStage(el, ctx, { beats })
  stage.body.append(compare, clf)
  const onResize = () => { if (!compare.classList.contains('dvn-hide')) { fit(cL); fit(cR) } }
  window.addEventListener('resize', onResize)

  return () => { clearT(); window.removeEventListener('resize', onResize); stage.destroy(); style.remove() }
}
