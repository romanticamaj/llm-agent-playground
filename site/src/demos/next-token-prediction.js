// Demo：AI 是文字接龍（Next-token Prediction）
// 核心互動：看著一句未完成的話，從候選「下一個字」的機率長條中點字接龍，
// 或按「自動生成」看模型一路挑最高機率字長出整句，親手體會「每個字都是上個字的延伸」。

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'

  // ---- 假機率資料：多層 token 樹 ----
  // nodes[key] = 候選陣列 [{ c:字, p:機率%, to:下一個節點key 或 null(結束) }]
  const T = {
    // 開頭一：今天天氣真
    a0: [
      { c: '好', p: 62, to: 'a_hao' },
      { c: '冷', p: 15, to: 'a_leng' },
      { c: '熱', p: 11, to: 'a_re' },
      { c: '棒', p: 7, to: 'a_bang' },
      { c: '糟', p: 5, to: 'a_zao' },
    ],
    a_hao: [
      { c: '，', p: 44, to: 'a_hao2' },
      { c: '適', p: 30, to: 'a_shi' },
      { c: '呢', p: 18, to: null },
      { c: '啊', p: 8, to: null },
    ],
    a_shi: [{ c: '合', p: 88, to: 'a_hao2' }, { c: '應', p: 12, to: 'a_hao2' }],
    a_hao2: [
      { c: '出', p: 40, to: 'a_chu' },
      { c: '去', p: 33, to: 'a_qu' },
      { c: '散', p: 20, to: 'a_qu' },
      { c: '睡', p: 7, to: null },
    ],
    a_chu: [{ c: '門', p: 82, to: 'a_end' }, { c: '遊', p: 18, to: 'a_end' }],
    a_qu: [{ c: '走', p: 55, to: 'a_end' }, { c: '玩', p: 45, to: 'a_end' }],
    a_end: [{ c: '走', p: 60, to: null }, { c: '。', p: 40, to: null }],
    a_leng: [{ c: '，', p: 50, to: 'a_hao2' }, { c: '得', p: 34, to: null }, { c: '呢', p: 16, to: null }],
    a_re: [{ c: '，', p: 46, to: 'a_hao2' }, { c: '到', p: 34, to: null }, { c: '呢', p: 20, to: null }],
    a_bang: [{ c: '！', p: 58, to: null }, { c: '，', p: 30, to: 'a_hao2' }, { c: '呢', p: 12, to: null }],
    a_zao: [{ c: '透', p: 52, to: null }, { c: '糕', p: 40, to: null }, { c: '，', p: 8, to: null }],

    // 開頭二：我最喜歡的食物是
    b0: [
      { c: '牛', p: 34, to: 'b_niu' },
      { c: '拉', p: 26, to: 'b_la' },
      { c: '火', p: 18, to: 'b_huo' },
      { c: '壽', p: 14, to: 'b_shou' },
      { c: '披', p: 8, to: 'b_pi' },
    ],
    b_niu: [{ c: '肉', p: 96, to: 'b_niu2' }],
    b_niu2: [{ c: '麵', p: 70, to: 'b_end' }, { c: '飯', p: 22, to: 'b_end' }, { c: '湯', p: 8, to: 'b_end' }],
    b_la: [{ c: '麵', p: 100, to: 'b_end' }],
    b_huo: [{ c: '鍋', p: 92, to: 'b_end' }, { c: '腿', p: 8, to: 'b_end' }],
    b_shou: [{ c: '司', p: 100, to: 'b_end' }],
    b_pi: [{ c: '薩', p: 100, to: 'b_end' }],
    b_end: [
      { c: '，', p: 48, to: 'b_zhen' },
      { c: '。', p: 30, to: null },
      { c: '呢', p: 22, to: null },
    ],
    b_zhen: [{ c: '真', p: 62, to: 'b_zhen2' }, { c: '超', p: 38, to: 'b_zhen2' }],
    b_zhen2: [{ c: '好', p: 55, to: 'b_end2' }, { c: '美', p: 45, to: 'b_end2' }],
    b_end2: [{ c: '吃', p: 90, to: null }, { c: '味', p: 10, to: null }],

    // 開頭三：這個週末我打算去
    c0: [
      { c: '爬', p: 30, to: 'c_pa' },
      { c: '看', p: 26, to: 'c_kan' },
      { c: '海', p: 18, to: 'c_hai' },
      { c: '逛', p: 16, to: 'c_guang' },
      { c: '睡', p: 10, to: 'c_shui' },
    ],
    c_pa: [{ c: '山', p: 94, to: 'c_end' }],
    c_kan: [{ c: '電', p: 58, to: 'c_dian' }, { c: '海', p: 26, to: 'c_end' }, { c: '書', p: 16, to: 'c_end' }],
    c_dian: [{ c: '影', p: 100, to: 'c_end' }],
    c_hai: [{ c: '邊', p: 88, to: 'c_end' }, { c: '灘', p: 12, to: 'c_end' }],
    c_guang: [{ c: '街', p: 76, to: 'c_end' }, { c: '書', p: 24, to: 'c_dian' }],
    c_shui: [{ c: '覺', p: 82, to: null }, { c: '到', p: 18, to: null }],
    c_end: [
      { c: '，', p: 46, to: 'c_fang' },
      { c: '放', p: 32, to: 'c_fang2' },
      { c: '。', p: 22, to: null },
    ],
    c_fang: [{ c: '放', p: 70, to: 'c_fang2' }, { c: '順', p: 30, to: null }],
    c_fang2: [{ c: '鬆', p: 78, to: 'c_song' }, { c: '空', p: 22, to: null }],
    c_song: [{ c: '一', p: 60, to: null }, { c: '。', p: 40, to: null }],
  }

  const STARTERS = [
    { label: '今天天氣真___', prefix: '今天天氣真', start: 'a0' },
    { label: '我最喜歡的食物是___', prefix: '我最喜歡的食物是', start: 'b0' },
    { label: '這個週末我打算去___', prefix: '這個週末我打算去', start: 'c0' },
  ]

  // ---- 狀態 ----
  let starterIdx = 0
  let text = STARTERS[0].prefix
  let node = STARTERS[0].start
  let auto = false
  const timers = new Set()
  const raf = { id: 0 }
  const setT = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }

  // ---- 樣式 ----
  const style = document.createElement('style')
  style.textContent = `
  .ntp-wrap{position:absolute;inset:0;display:flex;flex-direction:column;gap:18px;padding:26px 32px;box-sizing:border-box;font-family:var(--font-tc,'Noto Sans TC',sans-serif);overflow:auto}
  .ntp-lead{font-size:17px;color:#9aa0b0;letter-spacing:.02em;line-height:1.55}
  .ntp-lead b{color:#e8ebf2;font-weight:600}
  .ntp-starters{display:flex;gap:10px;flex-wrap:wrap}
  .ntp-chip{font-size:15px;padding:8px 16px;border-radius:999px;cursor:pointer;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);color:#c3c8d4;transition:all .18s}
  .ntp-chip:hover{border-color:${accent};color:${accent}}
  .ntp-chip.on{background:${accent};color:#05060a;border-color:${accent};font-weight:600}
  .ntp-stage{flex:1;min-height:0;display:flex;flex-direction:column;gap:16px}
  .ntp-sentence{font-size:clamp(26px,4.4vw,44px);line-height:1.5;font-weight:600;color:#eef1f7;letter-spacing:.03em;min-height:1.5em;display:flex;flex-wrap:wrap;align-items:baseline}
  .ntp-tok{display:inline-block}
  .ntp-tok.new{color:${accent};animation:ntp-pop .32s ease}
  @keyframes ntp-pop{0%{transform:translateY(-8px) scale(.7);opacity:0}100%{transform:none;opacity:1}}
  .ntp-caret{display:inline-block;width:3px;height:1em;background:${accent};margin-left:4px;transform:translateY(.1em);animation:ntp-blink 1s steps(1) infinite}
  @keyframes ntp-blink{50%{opacity:0}}
  .ntp-panel-title{font-size:14px;color:#7d8496;letter-spacing:.12em;text-transform:uppercase}
  .ntp-cands{display:flex;flex-direction:column;gap:9px}
  .ntp-cand{display:flex;align-items:center;gap:14px;cursor:pointer;padding:6px 10px;border-radius:10px;transition:background .15s}
  .ntp-cand:hover{background:rgba(255,255,255,.05)}
  .ntp-cand.top .ntp-char{color:${accent}}
  .ntp-char{font-size:26px;font-weight:600;color:#e8ebf2;width:1.6em;text-align:center;flex:none}
  .ntp-bar-wrap{flex:1;height:22px;background:rgba(255,255,255,.05);border-radius:6px;overflow:hidden;position:relative}
  .ntp-bar{height:100%;border-radius:6px;background:linear-gradient(90deg,${accent},${accent}aa);transition:width .5s cubic-bezier(.2,.7,.2,1)}
  .ntp-cand.top .ntp-bar{background:linear-gradient(90deg,${accent},#fff6)}
  .ntp-pct{font-size:15px;font-variant-numeric:tabular-nums;color:#aeb4c2;width:3.4em;text-align:right;flex:none}
  .ntp-done{font-size:16px;color:#4ade80;display:flex;align-items:center;gap:8px}
  .ntp-controls{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
  .ntp-hint{font-size:14px;color:#7d8496;margin-left:auto;max-width:46%;text-align:right;line-height:1.5}
  `
  el.appendChild(style)

  const wrap = document.createElement('div')
  wrap.className = 'ntp-wrap'
  wrap.innerHTML = `
    <div class="ntp-lead">AI 不是在思考，而是在<b>接龍</b>。它每次只做一件事：看著前面所有的字，<b>預測下一個字最可能是什麼</b>，接上去，再重複。點下方候選字親手接龍，或按「自動生成」看它一路長出整句。</div>
    <div class="ntp-starters" id="ntp-starters"></div>
    <div class="ntp-stage">
      <div class="ntp-sentence" id="ntp-sentence"></div>
      <div>
        <div class="ntp-panel-title" id="ntp-ptitle">下一個字的機率</div>
        <div class="ntp-cands" id="ntp-cands"></div>
      </div>
    </div>
    <div class="ntp-controls">
      <button class="demo-btn primary" id="ntp-auto">自動生成</button>
      <button class="demo-btn" id="ntp-reset">重來</button>
      <div class="ntp-hint">觀察：換一個開頭，後面整串跟著變 — 每個字都是上一個字的延伸。</div>
    </div>
  `
  el.appendChild(wrap)

  const $ = (id) => wrap.querySelector(id)
  const elStarters = $('#ntp-starters')
  const elSentence = $('#ntp-sentence')
  const elCands = $('#ntp-cands')
  const elTitle = $('#ntp-ptitle')
  const btnAuto = $('#ntp-auto')
  const btnReset = $('#ntp-reset')

  STARTERS.forEach((s, i) => {
    const b = document.createElement('button')
    b.className = 'ntp-chip' + (i === 0 ? ' on' : '')
    b.textContent = s.label
    b.addEventListener('click', () => { if (auto) return; selectStarter(i) })
    elStarters.appendChild(b)
  })

  function selectStarter(i) {
    starterIdx = i
    text = STARTERS[i].prefix
    node = STARTERS[i].start
    ;[...elStarters.children].forEach((c, j) => c.classList.toggle('on', j === i))
    renderSentence(false)
    renderCands()
  }

  function renderSentence(isNew) {
    elSentence.innerHTML = ''
    const chars = [...text]
    chars.forEach((ch, i) => {
      const span = document.createElement('span')
      span.className = 'ntp-tok' + (isNew && i === chars.length - 1 ? ' new' : '')
      span.textContent = ch
      elSentence.appendChild(span)
    })
    const caret = document.createElement('span')
    caret.className = 'ntp-caret'
    elSentence.appendChild(caret)
  }

  function renderCands() {
    elCands.innerHTML = ''
    const cands = T[node]
    if (!cands || cands.length === 0) {
      elTitle.textContent = '接龍結束'
      const done = document.createElement('div')
      done.className = 'ntp-done'
      done.innerHTML = '✓ 句子接完了。換個開頭，或按「重來」再玩一次。'
      elCands.appendChild(done)
      return
    }
    elTitle.textContent = '下一個字的機率（模型的候選）'
    const sorted = [...cands].sort((x, y) => y.p - x.p)
    const max = sorted[0].p
    sorted.forEach((cand) => {
      const row = document.createElement('div')
      row.className = 'ntp-cand' + (cand.p === max ? ' top' : '')
      row.innerHTML = `
        <div class="ntp-char">${cand.c}</div>
        <div class="ntp-bar-wrap"><div class="ntp-bar" style="width:0%"></div></div>
        <div class="ntp-pct">${cand.p}%</div>`
      row.addEventListener('click', () => { if (auto) return; pick(cand) })
      elCands.appendChild(row)
      requestAnimationFrame(() => { row.querySelector('.ntp-bar').style.width = cand.p + '%' })
    })
  }

  function pick(cand) {
    text += cand.c
    node = cand.to
    renderSentence(true)
    renderCands()
  }

  function step() {
    const cands = T[node]
    if (!cands || cands.length === 0) { stopAuto(); return }
    const best = cands.reduce((a, b) => (b.p > a.p ? b : a))
    pick(best)
    setT(step, 620)
  }

  function startAuto() {
    auto = true
    btnAuto.textContent = '停止'
    elStarters.classList.add('ntp-locked')
    step()
  }
  function stopAuto() {
    auto = false
    btnAuto.textContent = '自動生成'
    elStarters.classList.remove('ntp-locked')
  }

  btnAuto.addEventListener('click', () => { if (auto) stopAuto(); else startAuto() })
  btnReset.addEventListener('click', () => { stopAuto(); selectStarter(starterIdx) })

  // 初始
  renderSentence(false)
  renderCands()

  return () => {
    stopAuto()
    timers.forEach((id) => clearTimeout(id))
    timers.clear()
    if (raf.id) cancelAnimationFrame(raf.id)
    style.remove()
    wrap.remove()
  }
}
