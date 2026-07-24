// Demo：品味決勝（全站 ending）— DemoStage 導演版
// 5 拍：人人都做得出來（快速生成）｜產出趨同（灰階化）｜一件被品味點亮跳出｜品味怎麼練（三步驟）｜品味挑戰 5 組 A/B（sandbox）。
import { createStage, pop, confettiBurst } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const WIN = 2   // 第幾件作品被品味點亮

// 品味挑戰：5 組 A/B，maj = 多數人選的一邊、pct = 比例、why = 為什麼
const CH = [
  { dim: '排版', a: '<div class="mini cramp"><div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div></div>',
    b: '<div class="mini airy"><div class="ln w6"></div><div class="ln w4"></div><div class="blk"></div></div>', maj: 'b', pct: 76, why: '留白讓重點喘得過氣，眼睛知道先看哪。' },
  { dim: '配色', a: '<div class="mini"><div class="sw" style="background:#ef4444"></div><div class="sw" style="background:#22c55e"></div><div class="sw" style="background:#3b82f6"></div><div class="sw" style="background:#eab308"></div></div>',
    b: '<div class="mini"><div class="sw" style="background:#1e3a5f"></div><div class="sw" style="background:#2f5c8a"></div><div class="sw" style="background:#6b9bd1"></div><div class="sw" style="background:#c7ddf2"></div></div>', maj: 'b', pct: 81, why: '同一色系拉明度，比四種搶眼色更耐看。' },
  { dim: '文案', a: '<div class="mini copy">本產品採用業界領先的先進技術與整合解決方案，全面提升生產力。</div>',
    b: '<div class="mini copy big">三秒鐘，<br>把想法變成一個網站。</div>', maj: 'b', pct: 68, why: '具體的畫面比空泛的形容詞有力。' },
  { dim: '命名', a: '<div class="mini name">DataSync Pro<br>Manager 2.0</div>',
    b: '<div class="mini name big">Drift</div>', maj: 'b', pct: 63, why: '短、好唸、有個性的名字站得住。' },
  { dim: '照片構圖', a: '<div class="mini photo"><div class="grid"></div><div class="subj" style="left:50%;top:50%"></div></div>',
    b: '<div class="mini photo"><div class="grid on"></div><div class="subj" style="left:33%;top:66%"></div></div>', maj: 'b', pct: 72, why: '主體落在三分線，比擺正中更有張力。' },
]

export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#f472b6'

  const style = document.createElement('style')
  style.textContent = `
  .ta-wrap{--acc:${accent}}
  .ta-row{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;min-height:200px;align-items:center}
  .ta-work{width:130px;height:180px;border-radius:12px;border:1px solid var(--line);padding:12px;box-sizing:border-box;
    background:rgba(255,255,255,.04);display:flex;flex-direction:column;gap:8px;position:relative;
    opacity:0;transform:translateY(18px) scale(.96);transition:all .55s ${EASE}}
  .ta-work.in{opacity:1;transform:none}
  .ta-work.same{filter:grayscale(1) brightness(.82)}
  .ta-work.win{filter:none;transform:translateY(-10px) scale(1.08);z-index:5;
    border-color:var(--acc);box-shadow:0 0 0 1px var(--acc),0 18px 40px -16px var(--acc)}
  .ta-wbar{height:34px;border-radius:7px;background:#5b6472;transition:background .5s}
  .ta-work.win .ta-wbar{background:var(--acc)}
  .ta-wline{height:9px;border-radius:5px;background:rgba(255,255,255,.16)}
  .ta-wline.s{width:70%}
  .ta-wshape{margin-top:auto;width:40px;height:40px;border-radius:9px;background:rgba(255,255,255,.12)}
  .ta-work.win .ta-wshape{background:var(--acc)44;border:1px solid var(--acc)}
  .ta-tag{position:absolute;left:0;right:0;bottom:-30px;text-align:center;font-size:14px;color:var(--acc);
    opacity:0;transition:opacity .5s}
  .ta-work.win .ta-tag{opacity:1}
  .ta-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  @media(max-width:760px){.ta-steps{grid-template-columns:1fr}}
  .ta-step{border:1px solid var(--line);border-radius:14px;padding:18px 16px;text-align:center;background:rgba(255,255,255,.02);
    opacity:0;transform:translateY(14px);transition:all .5s ${EASE}}
  .ta-step.in{opacity:1;transform:none}
  .ta-step svg{width:38px;height:38px;color:var(--acc);margin-bottom:10px}
  .ta-step .st{font-size:17px;font-weight:700;color:var(--text);margin-bottom:5px}
  .ta-step .sd{font-size:15px;color:var(--text-dim);line-height:1.5}
  .ta-challenge{border:1px solid var(--line);border-radius:16px;padding:18px 20px;background:rgba(255,255,255,.02)}
  .ta-chd{font-size:16px;color:var(--text);margin-bottom:14px}
  .ta-chd b{color:var(--acc)}.ta-chd .idx{font-family:var(--font-mono);color:var(--text-dim)}
  .ta-pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .ta-opt{border:1px solid var(--line);border-radius:12px;padding:12px;cursor:pointer;transition:all .2s ${EASE};
    background:rgba(255,255,255,.03);min-height:150px;display:flex;flex-direction:column}
  .ta-opt:hover{border-color:var(--text);transform:translateY(-2px)}
  .ta-opt.picked{border-color:var(--acc);box-shadow:0 0 0 1px var(--acc)}
  .ta-opt.maj{border-color:${accent}88}
  .ta-opt .cap{font-family:var(--font-mono);font-size:13px;color:var(--text-dim);margin-bottom:8px}
  .ta-opt.locked{cursor:default}.ta-opt.locked:hover{transform:none}
  .mini{flex:1;border-radius:8px;background:rgba(255,255,255,.05);padding:11px;display:flex;flex-direction:column;gap:7px;justify-content:center}
  .mini .ln{height:8px;border-radius:4px;background:rgba(255,255,255,.28)}
  .mini.cramp{gap:5px;padding:8px}.mini.cramp .ln{height:7px}
  .mini.airy{gap:13px;padding:16px}.mini .w6{width:60%}.mini .w4{width:40%}
  .mini .blk{height:34px;border-radius:6px;background:var(--acc)55;margin-top:4px}
  .mini .sw{height:20px;border-radius:5px}
  .mini.copy{font-family:var(--font-tc);font-size:13px;color:#c7ccd6;line-height:1.5;text-align:left}
  .mini.copy.big{font-size:18px;font-weight:600;color:var(--text);line-height:1.35}
  .mini.name{font-family:var(--font-mono);font-size:15px;color:#c7ccd6;align-items:center;text-align:center}
  .mini.name.big{font-size:30px;font-weight:700;color:var(--text);letter-spacing:.02em}
  .mini.photo{position:relative;padding:0;overflow:hidden}
  .mini.photo .grid{position:absolute;inset:0;opacity:0}
  .mini.photo .grid.on{opacity:1;background:
    linear-gradient(90deg,transparent 33%,rgba(255,255,255,.18) 33% 34%,transparent 34% 66%,rgba(255,255,255,.18) 66% 67%,transparent 67%),
    linear-gradient(0deg,transparent 33%,rgba(255,255,255,.18) 33% 34%,transparent 34% 66%,rgba(255,255,255,.18) 66% 67%,transparent 67%)}
  .mini.photo .subj{position:absolute;width:30px;height:30px;border-radius:50%;background:var(--acc);transform:translate(-50%,-50%)}
  .ta-reveal{margin-top:14px;font-size:15px;color:var(--text-dim);line-height:1.55;min-height:20px}
  .ta-reveal b{color:var(--text)}.ta-reveal .ok{color:var(--acc)}
  .ta-foot{display:flex;align-items:center;gap:14px;margin-top:14px}
  .ta-btn{font-family:var(--font-tc);font-size:15px;font-weight:600;color:#08090a;background:var(--acc);border:none;
    border-radius:999px;padding:10px 20px;cursor:pointer;transition:all .25s ${EASE}}
  .ta-btn:hover{transform:translateY(-1px)}.ta-btn.ghost{background:rgba(255,255,255,.04);color:var(--text);border:1px solid var(--line)}
  .ta-btn.hide{display:none}
  .ta-prog{font-family:var(--font-mono);font-size:14px;color:var(--text-dim)}
  .ta-hidden{display:none}
  `
  el.appendChild(style)

  const ICON = {
    see: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
    pick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="7" height="14" rx="1.5"/><rect x="14" y="5" width="7" height="14" rx="1.5"/><path d="M14 12h-4M12 10l-2 2 2 2"/></svg>',
    why: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H8l-4 4Z"/><path d="M12 8.5a1.6 1.6 0 1 1 1.6 1.6c-.9.4-1.6.9-1.6 2"/><circle cx="13.5" cy="13.6" r=".5" fill="currentColor" stroke="none"/></svg>',
  }

  const wrap = document.createElement('div')
  wrap.className = 'ta-wrap'
  wrap.innerHTML = `
    <div class="ta-row ds-unit">
      ${Array.from({ length: 5 }, (_, i) => `
        <div class="ta-work" data-w="${i}">
          <div class="ta-wbar"></div>
          <div class="ta-wline"></div><div class="ta-wline s"></div>
          <div class="ta-wshape"></div>
          <div class="ta-tag">多了一點品味</div>
        </div>`).join('')}
    </div>
    <div class="ta-steps ds-unit ta-hidden">
      <div class="ta-step"><div>${ICON.see}</div><div class="st">大量看</div><div class="sd">看夠多好的與壞的，眼睛才有基準線。</div></div>
      <div class="ta-step"><div>${ICON.pick}</div><div class="st">大量選</div><div class="sd">每天在 A / B 之間做選擇，累積偏好。</div></div>
      <div class="ta-step"><div>${ICON.why}</div><div class="st">說得出為什麼</div><div class="sd">把「感覺比較好」翻成一句理由 — 那才是品味。</div></div>
    </div>
    <div class="ta-challenge ds-unit ta-hidden">
      <div class="ta-chd"><span class="idx">第 <span class="cur">1</span> / 5</span> · <b class="dim"></b> — 你選哪一個？</div>
      <div class="ta-pair">
        <div class="ta-opt" data-s="a"><div class="cap">A</div><div class="av"></div></div>
        <div class="ta-opt" data-s="b"><div class="cap">B</div><div class="bv"></div></div>
      </div>
      <div class="ta-reveal"></div>
      <div class="ta-foot">
        <span class="ta-prog"></span>
        <button class="ta-btn hide" data-b="next">下一組 →</button>
        <button class="ta-btn ghost hide" data-b="again">再玩一次</button>
      </div>
    </div>`

  let stage
  const $ = s => wrap.querySelector(s)
  const $$ = s => [...wrap.querySelectorAll(s)]
  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  const works = $$('.ta-work')

  /* ---- B1–B3 作品列 ---- */
  function showWorks() { works.forEach((w, i) => T(() => w.classList.add('in'), 120 + i * 130)) }
  function convergeWorks() { works.forEach((w, i) => T(() => w.classList.add('same'), i * 90)) }
  function tasteWin() {
    const w = works[WIN]; w.classList.remove('same'); w.classList.add('win'); pop(w, 1.05)
    T(() => {
      const wr = wrap.getBoundingClientRect(), rr = w.getBoundingClientRect()
      confettiBurst(stage.body, rr.left - wr.left + rr.width / 2, rr.top - wr.top + 10, accent, 26)
    }, 250)
  }
  function resetWorks() { works.forEach(w => w.classList.remove('in', 'same', 'win')) }

  /* ---- B5 品味挑戰 ---- */
  let idx = 0, matches = 0, locked = false
  function loadChallenge(i) {
    if (i < 0 || i >= CH.length) return
    locked = false
    const c = CH[i]
    $('.cur').textContent = i + 1
    $('.dim').textContent = c.dim
    $('.av').innerHTML = c.a; $('.bv').innerHTML = c.b
    $$('.ta-opt').forEach(o => o.classList.remove('picked', 'maj', 'locked'))
    $('.ta-reveal').innerHTML = ''
    $('[data-b="next"]').classList.add('hide')
    $('[data-b="again"]').classList.add('hide')
    $('.ta-prog').textContent = `已完成 ${i} / 5`
  }
  function choose(side) {
    if (locked) return
    locked = true
    const c = CH[idx], hit = side === c.maj
    if (hit) matches++
    $$('.ta-opt').forEach(o => {
      o.classList.add('locked')
      if (o.dataset.s === side) o.classList.add('picked')
      if (o.dataset.s === c.maj) o.classList.add('maj')
    })
    pop($(`.ta-opt[data-s="${side}"]`))
    const verdict = hit
      ? `<span class="ok">你和多數一致</span>`
      : `你選的和多數不同 — <span class="ok">沒關係</span>`
    $('.ta-reveal').innerHTML = `多數人選 <b>${c.maj.toUpperCase()}</b>（${c.pct}%）· ${verdict}。<br>為什麼：${c.why}`
    $('.ta-prog').textContent = `已完成 ${idx + 1} / 5`
    if (idx < CH.length - 1) $('[data-b="next"]').classList.remove('hide')
    else T(() => showSummary(), 400)
  }
  function showSummary() {
    $('.ta-chd').innerHTML = `品味挑戰 · 完成`
    $('.ta-pair').classList.add('ta-hidden')
    $('.ta-reveal').innerHTML = `這沒有標準答案。你和多數的一致度：<b>${matches} / 5</b>。<br>但真正的品味不是猜中多數 — 而是你每一次<span class="ok">說得出為什麼</span>。`
    $('[data-b="next"]').classList.add('hide')
    $('[data-b="again"]').classList.remove('hide')
    const wr = wrap.getBoundingClientRect(), rr = $('.ta-challenge').getBoundingClientRect()
    confettiBurst(stage.body, rr.left - wr.left + rr.width / 2, rr.top - wr.top + 30, accent, 28)
  }
  function startChallenge() {
    idx = 0; matches = 0
    $('.ta-pair').classList.remove('ta-hidden')
    $('.ta-chd').innerHTML = `<span class="idx">第 <span class="cur">1</span> / 5</span> · <b class="dim"></b> — 你選哪一個？`
    loadChallenge(0)
  }

  $('.ta-pair').addEventListener('click', e => { const o = e.target.closest('.ta-opt'); if (o) choose(o.dataset.s) })
  $('.ta-foot').addEventListener('click', e => {
    if (e.target.closest('[data-b="next"]')) { pop(e.target); if (idx < CH.length - 1) { idx++; loadChallenge(idx) } }
    else if (e.target.closest('[data-b="again"]')) { pop(e.target); startChallenge() }
  })

  function hideAll() {
    $('.ta-steps').classList.add('ta-hidden'); $('.ta-challenge').classList.add('ta-hidden')
    $('.ta-row').classList.remove('ta-hidden')
  }

  function buildBeats() {
    return [
      { narration: 'AI 把<b>驗證想法的速度</b>壓到極限 — 同一個點子，現在<b>每個人</b>幾分鐘就做得出來。', focus: ['.ta-row'], nextLabel: '然後呢？ →',
        enter() { clearT(); hideAll(); resetWorks(); showWorks() } },

      { narration: '於是產出開始<b>趨同</b> — 一整排作品，慢慢變得幾乎一模一樣。', focus: ['.ta-row'], nextLabel: '那靠什麼分高下？ →',
        enter() { clearT(); hideAll(); resetWorks(); works.forEach(w => w.classList.add('in')); T(() => convergeWorks(), 300) } },

      { narration: '最後決定勝負的 — 是<b>品味</b>。同樣的骨架，換個字體、多點留白、一句更好的文案，它就跳出來了。', focus: ['.ta-row'], nextLabel: '品味怎麼練？ →',
        enter() { clearT(); hideAll(); resetWorks(); works.forEach(w => w.classList.add('in', 'same')); T(() => tasteWin(), 500) } },

      { narration: '品味不是天生 — 是練出來的：<b>大量看、大量選、說得出為什麼</b>。', focus: ['.ta-steps'], nextLabel: '換你練 →',
        enter() { clearT(); $('.ta-row').classList.add('ta-hidden'); $('.ta-challenge').classList.add('ta-hidden'); $('.ta-steps').classList.remove('ta-hidden'); $$('.ta-step').forEach((s, i) => { s.classList.remove('in'); T(() => s.classList.add('in'), 150 + i * 180) }) } },

      { narration: '品味挑戰 — <b>5 組 A / B</b>，選你覺得比較好的那個。這沒有標準答案，能<b>說得出為什麼</b>就是品味。', sandbox: true,
        enter() { clearT(); $('.ta-row').classList.add('ta-hidden'); $('.ta-steps').classList.add('ta-hidden'); $('.ta-challenge').classList.remove('ta-hidden'); startChallenge() } },
    ]
  }

  stage = createStage(el, ctx, { beats: buildBeats() })
  stage.body.append(wrap)

  return () => { clearT(); stage.destroy(); style.remove() }
}
