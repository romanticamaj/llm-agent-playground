// Demo：AI 是文字接龍（Next-token Prediction）— DemoStage 導演框架版
// 5 拍劇本：接龍 → 機率分布 → 換你接 → 開頭一改整串變 → sandbox。
// 場景一次蓋在 stage.body，beat 間用動畫轉場、不重繪；主句字級 ≥44px 是主角。

import { createStage, pop, enterFly, confettiBurst } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'

// 手繪 SVG icon（stroke=currentColor 1.6）
const SVG = {
  wand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19 15 9"/><path d="M18 3.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/><path d="M6.5 5.5l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4z"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10a8 8 0 0 1 13.7-4.2L20 8"/><path d="M20 4v4h-4"/><path d="M20 14a8 8 0 0 1-13.7 4.2L4 16"/><path d="M4 20v-4h4"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6"/></svg>',
}

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#8ea9e8'

  // ---- 假機率資料：多層 token 樹 ----
  const T = {
    a0: [
      { c: '好', p: 62, to: 'a_hao' }, { c: '冷', p: 15, to: 'a_leng' },
      { c: '熱', p: 11, to: 'a_re' }, { c: '棒', p: 7, to: 'a_bang' }, { c: '糟', p: 5, to: 'a_zao' },
    ],
    a_hao: [{ c: '，', p: 46, to: 'a_hao2' }, { c: '適', p: 32, to: 'a_shi' }, { c: '呢', p: 14, to: null }, { c: '啊', p: 8, to: null }],
    a_shi: [{ c: '合', p: 88, to: 'a_hao2' }, { c: '應', p: 12, to: 'a_hao2' }],
    a_hao2: [{ c: '出', p: 42, to: 'a_chu' }, { c: '去', p: 33, to: 'a_qu' }, { c: '散', p: 18, to: 'a_qu' }, { c: '睡', p: 7, to: null }],
    a_chu: [{ c: '門', p: 82, to: null }, { c: '遊', p: 18, to: null }],
    a_qu: [{ c: '走', p: 55, to: null }, { c: '玩', p: 45, to: null }],
    a_leng: [{ c: '，', p: 50, to: 'a_hao2' }, { c: '得', p: 34, to: null }, { c: '呢', p: 16, to: null }],
    a_re: [{ c: '，', p: 46, to: 'a_hao2' }, { c: '到', p: 34, to: null }, { c: '呢', p: 20, to: null }],
    a_bang: [{ c: '！', p: 58, to: null }, { c: '，', p: 30, to: 'a_hao2' }, { c: '呢', p: 12, to: null }],
    a_zao: [{ c: '透', p: 52, to: null }, { c: '糕', p: 40, to: null }, { c: '，', p: 8, to: null }],
    b0: [
      { c: '牛', p: 34, to: 'b_niu' }, { c: '拉', p: 26, to: 'b_la' }, { c: '火', p: 18, to: 'b_huo' },
      { c: '壽', p: 14, to: 'b_shou' }, { c: '披', p: 8, to: 'b_pi' },
    ],
    b_niu: [{ c: '肉', p: 96, to: 'b_niu2' }], b_niu2: [{ c: '麵', p: 70, to: 'b_end' }, { c: '飯', p: 22, to: 'b_end' }, { c: '湯', p: 8, to: 'b_end' }],
    b_la: [{ c: '麵', p: 100, to: 'b_end' }], b_huo: [{ c: '鍋', p: 92, to: 'b_end' }, { c: '腿', p: 8, to: 'b_end' }],
    b_shou: [{ c: '司', p: 100, to: 'b_end' }], b_pi: [{ c: '薩', p: 100, to: 'b_end' }],
    b_end: [{ c: '，', p: 48, to: 'b_zhen' }, { c: '。', p: 30, to: null }, { c: '呢', p: 22, to: null }],
    b_zhen: [{ c: '真', p: 62, to: 'b_zhen2' }, { c: '超', p: 38, to: 'b_zhen2' }],
    b_zhen2: [{ c: '好', p: 55, to: 'b_end2' }, { c: '美', p: 45, to: 'b_end2' }],
    b_end2: [{ c: '吃', p: 90, to: null }, { c: '味', p: 10, to: null }],
    c0: [
      { c: '爬', p: 30, to: 'c_pa' }, { c: '看', p: 26, to: 'c_kan' }, { c: '海', p: 18, to: 'c_hai' },
      { c: '逛', p: 16, to: 'c_guang' }, { c: '睡', p: 10, to: 'c_shui' },
    ],
    c_pa: [{ c: '山', p: 94, to: 'c_end' }], c_kan: [{ c: '電', p: 58, to: 'c_dian' }, { c: '海', p: 26, to: 'c_end' }, { c: '書', p: 16, to: 'c_end' }],
    c_dian: [{ c: '影', p: 100, to: 'c_end' }], c_hai: [{ c: '邊', p: 88, to: 'c_end' }, { c: '灘', p: 12, to: 'c_end' }],
    c_guang: [{ c: '街', p: 76, to: 'c_end' }, { c: '書', p: 24, to: 'c_dian' }], c_shui: [{ c: '覺', p: 82, to: null }, { c: '到', p: 18, to: null }],
    c_end: [{ c: '，', p: 46, to: 'c_fang' }, { c: '放', p: 32, to: 'c_fang2' }, { c: '。', p: 22, to: null }],
    c_fang: [{ c: '放', p: 70, to: 'c_fang2' }, { c: '順', p: 30, to: null }],
    c_fang2: [{ c: '鬆', p: 78, to: 'c_song' }, { c: '空', p: 22, to: null }], c_song: [{ c: '一', p: 60, to: null }, { c: '。', p: 40, to: null }],
  }
  const STARTERS = [
    { label: '今天天氣真＿', prefix: '今天天氣真', start: 'a0' },
    { label: '我最喜歡的食物是＿', prefix: '我最喜歡的食物是', start: 'b0' },
    { label: '這個週末我打算去＿', prefix: '這個週末我打算去', start: 'c0' },
  ]

  // ---- 狀態 ----
  let starterIdx = 0, text = '', node = 'a0'
  let auto = false, busy = false, interactive = false
  const timers = new Set()
  const setT = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearTimers = () => { timers.forEach(clearTimeout); timers.clear() }

  // ---- 樣式 ----
  const style = document.createElement('style')
  style.textContent = `
  .ntp-scene{display:flex;flex-direction:column;gap:22px;min-height:100%;font-family:var(--font-tc)}
  .ntp-starters{display:none;gap:10px;flex-wrap:wrap}
  .ntp-chip{font-size:15px;padding:9px 18px;border-radius:999px;cursor:pointer;border:1px solid var(--line);
    background:rgba(255,255,255,.03);color:var(--text-dim);transition:all .18s ${EASE}}
  .ntp-chip:hover{border-color:${accent};color:${accent}}
  .ntp-chip.on{background:${accent};color:#08090a;border-color:${accent};font-weight:700}
  .ntp-sentence-unit{display:flex;align-items:center;min-height:1.6em;padding:8px 4px}
  .ntp-sentence{font-size:clamp(44px,6vw,60px);line-height:1.4;font-weight:700;color:var(--text);
    letter-spacing:.02em;display:flex;flex-wrap:wrap;align-items:baseline}
  .ntp-tok{display:inline-block}
  .ntp-tok.new{color:${accent};animation:ntp-drop .34s ${EASE}}
  @keyframes ntp-drop{0%{transform:translateY(-14px) scale(.6);opacity:0}100%{transform:none;opacity:1}}
  .ntp-caret{display:inline-block;width:4px;height:.92em;background:${accent};margin-left:6px;
    transform:translateY(.06em);animation:ntp-blink 1s steps(1) infinite;border-radius:2px}
  @keyframes ntp-blink{50%{opacity:0}}
  .ntp-cands-unit{display:flex;flex-direction:column;gap:12px}
  .ntp-ptitle{font-family:var(--font-mono);font-size:14px;letter-spacing:.2em;text-transform:uppercase;color:var(--text-dim)}
  .ntp-cands{display:flex;flex-direction:column;gap:11px}
  .ntp-cand{display:flex;align-items:center;gap:18px;padding:8px 12px;border-radius:12px;
    border:1px solid transparent;transition:background .16s,border-color .16s}
  .ntp-cand.live{cursor:pointer}
  .ntp-cand.live:hover{background:rgba(255,255,255,.05);border-color:var(--line)}
  .ntp-char{font-size:32px;font-weight:700;color:var(--text);width:1.5em;text-align:center;flex:none}
  .ntp-cand.top .ntp-char{color:${accent}}
  .ntp-track{flex:1;height:26px;background:rgba(255,255,255,.05);border-radius:8px;overflow:hidden}
  .ntp-fill{height:100%;border-radius:8px;background:linear-gradient(90deg,${accent}88,${accent});transition:width .6s ${EASE}}
  .ntp-cand.top .ntp-fill{background:linear-gradient(90deg,${accent},#fff)}
  .ntp-pct{font-family:var(--font-mono);font-size:18px;font-variant-numeric:tabular-nums;color:var(--text-dim);width:3.2em;text-align:right;flex:none}
  .ntp-done{display:flex;align-items:center;gap:12px;font-size:18px;color:#5ecb7a;font-weight:600}
  .ntp-done svg{width:26px;height:26px;flex:none}
  .ntp-controls{display:none;gap:12px;flex-wrap:wrap;align-items:center}
  .ntp-btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-tc);font-size:15px;font-weight:600;
    padding:11px 20px;border-radius:999px;cursor:pointer;border:1px solid var(--line);
    background:rgba(255,255,255,.03);color:var(--text);transition:all .2s ${EASE}}
  .ntp-btn svg{width:18px;height:18px}
  .ntp-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .ntp-btn.primary{background:${accent};color:#08090a;border-color:${accent}}
  .ntp-fly{position:fixed;font-size:32px;font-weight:700;color:${accent};pointer-events:none;z-index:9999;
    font-family:var(--font-tc);transform-origin:center}
  `
  el.appendChild(style)

  // ---- 場景 DOM（一次蓋好）----
  const scene = document.createElement('div')
  scene.className = 'ntp-scene'
  scene.innerHTML = `
    <div class="ntp-starters ds-unit" id="ntp-starters"></div>
    <div class="ntp-sentence-unit ds-unit"><div class="ntp-sentence" id="ntp-sentence"></div></div>
    <div class="ntp-cands-unit ds-unit">
      <div class="ntp-ptitle" id="ntp-ptitle">下一個字 · 機率分布</div>
      <div class="ntp-cands" id="ntp-cands"></div>
    </div>
    <div class="ntp-controls ds-unit" id="ntp-controls">
      <button class="ntp-btn primary" id="ntp-auto">${SVG.wand}<span>自動生成</span></button>
      <button class="ntp-btn" id="ntp-reset">${SVG.refresh}<span>重來</span></button>
    </div>`

  const $ = (id) => scene.querySelector(id)
  const elStarters = $('#ntp-starters'), elSentence = $('#ntp-sentence')
  const elCands = $('#ntp-cands'), elPtitle = $('#ntp-ptitle')
  const elControls = $('#ntp-controls'), btnAuto = $('#ntp-auto'), btnReset = $('#ntp-reset')

  STARTERS.forEach((s, i) => {
    const b = document.createElement('button')
    b.className = 'ntp-chip' + (i === 0 ? ' on' : '')
    b.textContent = s.label
    b.addEventListener('click', () => { if (auto || busy) return; pop(b); pickStarter(i, true) })
    elStarters.appendChild(b)
  })
  const syncChips = () => [...elStarters.children].forEach((c, j) => c.classList.toggle('on', j === starterIdx))

  // ---- 渲染 ----
  function renderSentence(animLast) {
    elSentence.innerHTML = ''
    const chars = [...text]
    chars.forEach((ch, i) => {
      const s = document.createElement('span')
      s.className = 'ntp-tok' + (animLast && i === chars.length - 1 ? ' new' : '')
      s.textContent = ch
      elSentence.appendChild(s)
    })
    const c = document.createElement('span'); c.className = 'ntp-caret'
    elSentence.appendChild(c)
  }

  function showCands({ fly, live }) {
    const cands = T[node]
    elCands.innerHTML = ''
    if (!cands || !cands.length) {
      elPtitle.textContent = '接龍結束'
      const d = document.createElement('div'); d.className = 'ntp-done'
      d.innerHTML = SVG.check + `<span>句子接完了。${live ? '換個開頭，或按「重來」再玩。' : ''}</span>`
      elCands.appendChild(d)
      if (fly) enterFly(d)
      if (live) {
        const br = scene.getBoundingClientRect(), sr = elSentence.getBoundingClientRect()
        confettiBurst(scene, Math.min(sr.right, br.right) - br.left, sr.top - br.top + 24, accent)
      }
      return
    }
    elPtitle.textContent = '下一個字 · 機率分布'
    const sorted = [...cands].sort((a, b) => b.p - a.p)
    const max = sorted[0].p
    sorted.forEach((cand, i) => {
      const row = document.createElement('div')
      row.className = 'ntp-cand' + (cand.p === max ? ' top' : '') + (live ? ' live' : '')
      row.innerHTML = `<div class="ntp-char">${cand.c}</div>
        <div class="ntp-track"><div class="ntp-fill" style="width:0%"></div></div>
        <div class="ntp-pct">${cand.p}%</div>`
      if (live) row.addEventListener('click', () => onPick(cand, row))
      elCands.appendChild(row)
      if (fly) enterFly(row, { delay: i * 70 })
      requestAnimationFrame(() => { row.querySelector('.ntp-fill').style.width = cand.p + '%' })
    })
  }

  // 候選字飛到句尾
  function flyChar(ch, fromEl, done) {
    const a = fromEl.getBoundingClientRect()
    const caret = elSentence.querySelector('.ntp-caret')
    const b = (caret || elSentence).getBoundingClientRect()
    const fly = document.createElement('span')
    fly.className = 'ntp-fly'; fly.textContent = ch
    fly.style.left = a.left + 'px'; fly.style.top = a.top + 'px'
    document.body.appendChild(fly)
    const dx = b.left - a.left, dy = b.top - a.top
    const anim = fly.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 34}px) scale(1.35)`, opacity: 1, offset: .6 },
      { transform: `translate(${dx}px,${dy}px) scale(.85)`, opacity: 0 },
    ], { duration: 460, easing: EASE })
    anim.onfinish = () => { fly.remove(); done() }
  }

  function onPick(cand, row) {
    if (auto || busy || !interactive) return
    busy = true; pop(row)
    flyChar(cand.c, row.querySelector('.ntp-char'), () => {
      text += cand.c; node = cand.to
      renderSentence(true)
      showCands({ fly: true, live: interactive })
      busy = false
    })
  }

  // 逐字打出開頭
  function typeTo(full, cb) {
    text = ''; renderSentence(false)
    const chars = [...full]; let i = 0
    const tick = () => {
      if (!stage.alive) return
      if (i >= chars.length) { cb && cb(); return }
      text += chars[i++]; renderSentence(true); setT(tick, 130)
    }
    tick()
  }

  function pickStarter(i, type) {
    stopAuto(); starterIdx = i; node = STARTERS[i].start; syncChips()
    if (type) typeTo(STARTERS[i].prefix, () => showCands({ fly: true, live: interactive }))
    else { text = STARTERS[i].prefix; renderSentence(false) }
  }

  // 自動接龍（挑最高機率）
  function autoStep(cb) {
    if (!auto || !stage.alive) return
    const cands = T[node]
    if (!cands || !cands.length) { auto = false; syncAutoBtn(); cb && cb(); return }
    const best = cands.reduce((a, b) => (b.p > a.p ? b : a))
    text += best.c; node = best.to
    renderSentence(true); showCands({ fly: false, live: false })
    setT(() => autoStep(cb), 500)
  }
  function startAuto(cb) { auto = true; syncAutoBtn(); autoStep(cb) }
  function stopAuto() { auto = false; syncAutoBtn() }
  function syncAutoBtn() {
    btnAuto.querySelector('span').textContent = auto ? '停止' : '自動生成'
    btnAuto.classList.toggle('primary', !auto)
  }

  btnAuto.addEventListener('click', () => { if (busy) return; auto ? stopAuto() : startAuto() })
  btnReset.addEventListener('click', () => { if (busy) return; pop(btnReset); pickStarter(starterIdx, true) })

  // ---- 導演：5 拍 ----
  const stage = createStage(el, ctx, {
    beats: [
      { narration: 'AI 不是在思考，它在<b>接龍</b>。', focus: ['.ntp-sentence-unit'],
        enter() { stopAuto(); interactive = false; starterIdx = 0; node = 'a0'; elCands.innerHTML = ''; typeTo(STARTERS[0].prefix) } },
      { narration: '每一步，它只是從<b>機率分布</b>抽出下一個字。', focus: ['.ntp-cands-unit'],
        enter() { stopAuto(); interactive = false; if (text !== STARTERS[0].prefix || node !== 'a0') { starterIdx = 0; node = 'a0'; text = STARTERS[0].prefix; renderSentence(false) } showCands({ fly: true, live: false }) } },
      { narration: '換你接 — <b>點一個候選字</b>，看句子怎麼一個字一個字長出來。', focus: ['.ntp-sentence-unit', '.ntp-cands-unit'],
        enter() { stopAuto(); interactive = true; showCands({ fly: false, live: true }) },
        exit() { interactive = false } },
      { narration: '開頭改了，<b>後面整串跟著變</b> — 每個字都是上一個字的延伸。', focus: ['.ntp-sentence-unit'],
        enter() {
          stopAuto(); interactive = false
          elSentence.querySelectorAll('.ntp-tok').forEach((t, i) =>
            t.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(10px)' }], { duration: 300, delay: i * 24, easing: EASE, fill: 'forwards' }))
          elCands.innerHTML = ''
          setT(() => {
            starterIdx = 1; node = STARTERS[1].start; syncChips()
            typeTo(STARTERS[1].prefix, () => { showCands({ fly: true, live: false }); setT(() => startAuto(), 420) })
          }, 520)
        },
        exit() { stopAuto() } },
      { narration: '換你自由玩 — 選開頭、手動接龍、或按「自動生成」看它一路長出整句。', sandbox: true,
        enter() {
          stopAuto(); interactive = true
          elStarters.style.display = 'flex'; elControls.style.display = 'flex'
          enterFly(elStarters); enterFly(elControls, { delay: 80 })
          pickStarter(0, true)
        } },
    ],
  })

  stage.body.appendChild(scene)

  return () => {
    clearTimers()
    document.querySelectorAll('.ntp-fly').forEach(n => n.remove())
    style.remove()
    stage.destroy()
  }
}
