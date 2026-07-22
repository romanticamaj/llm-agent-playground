// first-pass-acceptance — 同一個任務，兩種問法
// 左：模糊 prompt → Frustration Loop；右：有效 Context → 第一次就對
export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#ff6b81'
  const OK = '#4ade80', BAD = '#f87171'
  const AGENT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="8.5" width="14" height="10.5" rx="2.5"/><path d="M12 8.5V5"/><circle cx="12" cy="3.6" r="1.2"/><circle cx="9.5" cy="13.5" r="1.1"/><circle cx="14.5" cy="13.5" r="1.1"/></svg>'

  const style = document.createElement('style')
  style.textContent = `
  .fpa-wrap{position:absolute;inset:0;--acc:${accent};display:flex;flex-direction:column;gap:14px;padding:20px 24px;color:#e7e9f0;font-family:var(--font-tc,'Noto Sans TC',sans-serif);box-sizing:border-box;min-height:0}
  .fpa-lead{font-size:17px;color:#c7cbd8;line-height:1.55}
  .fpa-lead b{color:var(--acc)}
  .fpa-cols{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:16px;min-height:0}
  .fpa-col{display:flex;flex-direction:column;border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(255,255,255,.03);overflow:hidden;min-height:0}
  .fpa-col.win{border-color:${OK}55}
  .fpa-top{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08)}
  .fpa-tag{font-size:13.5px;letter-spacing:.12em;font-weight:700;text-transform:uppercase}
  .fpa-col.vague .fpa-tag{color:${BAD}}
  .fpa-col.win .fpa-tag{color:${OK}}
  .fpa-prompt{margin-top:6px;font-size:15px;color:#aeb3c4;line-height:1.5;font-family:var(--font-en,monospace)}
  .fpa-log{flex:1;overflow:auto;padding:12px 14px;display:flex;flex-direction:column;gap:9px}
  .fpa-b{max-width:88%;padding:8px 12px;border-radius:12px;font-size:15.5px;line-height:1.45;opacity:0;transform:translateY(8px);animation:fpaIn .3s forwards;display:flex;gap:7px;align-items:flex-start}
  .fpa-b svg{width:19px;height:19px;flex:none;margin-top:1px}
  @keyframes fpaIn{to{opacity:1;transform:none}}
  .fpa-b.ai{align-self:flex-start;background:rgba(91,140,255,.14);border:1px solid rgba(91,140,255,.3)}
  .fpa-b.user{align-self:flex-end;background:rgba(248,113,113,.14);border:1px solid ${BAD}55;color:#ffd6d6}
  .fpa-b.ok{align-self:flex-end;background:rgba(74,222,128,.16);border:1px solid ${OK}66;color:#c9ffd8;font-weight:600}
  .fpa-foot{padding:9px 14px;border-top:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;font-size:14.5px;color:#9aa0b0}
  .fpa-foot b{color:#e7e9f0;font-size:16px}
  .fpa-dash{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
  .fpa-cell{border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:11px 14px;background:rgba(255,255,255,.03)}
  .fpa-cell .k{font-size:12.5px;letter-spacing:.08em;color:#8a90a2;text-transform:uppercase}
  .fpa-cell .v{font-size:25px;font-weight:700;margin-top:3px;font-family:var(--font-en,monospace)}
  .fpa-ctrl{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
  .fpa-seg{display:inline-flex;border:1px solid rgba(255,255,255,.14);border-radius:10px;overflow:hidden}
  .fpa-seg button{background:transparent;border:0;color:#aeb3c4;padding:9px 16px;font-size:16px;cursor:pointer;font-family:inherit}
  .fpa-seg button.on{background:var(--acc);color:#05060a;font-weight:700}
  .fpa-verdict{margin-left:auto;font-size:17px;font-weight:700;color:var(--acc);opacity:0;transition:opacity .5s}
  .fpa-verdict.show{opacity:1}
  @media(max-width:760px){.fpa-cols{grid-template-columns:1fr}.fpa-dash{grid-template-columns:1fr 1fr}}
  `
  document.head.appendChild(style)

  const TASKS = {
    code: { label: '寫 code',
      vague: '「幫我寫一個爬蟲」',
      good: '「讀 scraper.py 與 config.py，沿用既有 session 與 retry 邏輯，目標：抓 A 站商品價格寫入 db」',
      gen: ['產生一版通用爬蟲…', '換個寫法再產生…', '再改結構重寫…'],
      rej: ['沒接到我的 db', '還是沒沿用 retry', '架構又不一樣了'] },
    image: { label: '生圖',
      vague: '「幫我畫一張封面」',
      good: '「16:9、深色科技風、主色 #ff6b81、左側留白放標題、參考附圖構圖」',
      gen: ['隨機生一張…', '再抽一張…', '再試一次…'],
      rej: ['比例跟色調都不對', '構圖還是很亂', '風格又飄掉了'] },
    copy: { label: '寫文案',
      vague: '「幫我寫產品介紹」',
      good: '「對象是工程主管、痛點是 review 塞車、三段式、每段 ≤40 字、用我們既有品牌語氣」',
      gen: ['寫一版泛用文案…', '再改語氣重寫…', '再產一版…'],
      rej: ['沒打到痛點', '語氣還是不對', '太長又太空泛'] },
  }
  const SIM_PER_ROUND = 42 // 每回合模擬耗時（秒）

  el.innerHTML = `
  <div class="fpa-wrap">
    <div class="fpa-lead">同一個任務、兩種問法。按 <b>開始</b> 同時跑：左邊模糊 prompt 陷入 <b>Frustration Loop</b>，右邊給足 Context <b>第一次就對</b>。</div>
    <div class="fpa-cols">
      <div class="fpa-col vague" id="fpaL"><div class="fpa-top"><div class="fpa-tag">模糊 Prompt</div><div class="fpa-prompt" id="fpaLP"></div></div><div class="fpa-log" id="fpaLL"></div><div class="fpa-foot"><span>回合 <b id="fpaLR">0</b></span><span id="fpaLS">待機</span></div></div>
      <div class="fpa-col win" id="fpaW"><div class="fpa-top"><div class="fpa-tag">有效 Context</div><div class="fpa-prompt" id="fpaWP"></div></div><div class="fpa-log" id="fpaWL"></div><div class="fpa-foot"><span>回合 <b id="fpaWR">0</b></span><span id="fpaWS">待機</span></div></div>
    </div>
    <div class="fpa-dash">
      <div class="fpa-cell"><div class="k">左 · 總耗時</div><div class="v" id="fpaLT" style="color:${BAD}">0s</div></div>
      <div class="fpa-cell"><div class="k">左 · First-pass 率</div><div class="v" id="fpaLA" style="color:${BAD}">—</div></div>
      <div class="fpa-cell"><div class="k">右 · 總耗時</div><div class="v" id="fpaWT" style="color:${OK}">0s</div></div>
      <div class="fpa-cell"><div class="k">右 · First-pass 率</div><div class="v" id="fpaWA" style="color:${OK}">—</div></div>
    </div>
    <div class="fpa-ctrl">
      <button class="demo-btn primary" id="fpaGo">開始</button>
      <div class="fpa-seg" id="fpaSeg">
        <button data-t="code" class="on">寫 code</button><button data-t="image">生圖</button><button data-t="copy">寫文案</button>
      </div>
      <div class="fpa-verdict" id="fpaV">不要追求 AI 多快生出 code，要追求第一次就對。</div>
    </div>
  </div>`

  const $ = id => el.querySelector(id)
  const timers = new Set()
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn() }, ms); timers.add(t); return t }
  let raf = null, task = 'code', running = false
  let lTime = 0, wTime = 0, lRunning = false, wRunning = false, last = 0

  function bubble(box, cls, txt, icon) { const d = document.createElement('div'); d.className = 'fpa-b ' + cls; if (icon) { d.innerHTML = icon; const s = document.createElement('span'); s.textContent = txt; d.appendChild(s) } else d.textContent = txt; box.appendChild(d); box.scrollTop = box.scrollHeight }

  function clock(ts) {
    if (!last) last = ts
    const dt = (ts - last) / 1000; last = ts
    if (lRunning) { lTime += dt * 18; $('#fpaLT').textContent = Math.round(lTime) + 's' }
    if (wRunning) { wTime += dt * 18; $('#fpaWT').textContent = Math.round(wTime) + 's' }
    raf = requestAnimationFrame(clock)
  }

  function reset() {
    timers.forEach(clearTimeout); timers.clear()
    lRunning = wRunning = false; lTime = wTime = 0; last = 0
    $('#fpaLL').innerHTML = ''; $('#fpaWL').innerHTML = ''
    $('#fpaLR').textContent = '0'; $('#fpaWR').textContent = '0'
    $('#fpaLS').textContent = '待機'; $('#fpaWS').textContent = '待機'
    $('#fpaLT').textContent = '0s'; $('#fpaWT').textContent = '0s'
    $('#fpaLA').textContent = '—'; $('#fpaWA').textContent = '—'
    $('#fpaV').classList.remove('show')
    const T = TASKS[task]; $('#fpaLP').textContent = T.vague; $('#fpaWP').textContent = T.good
  }

  function run() {
    if (running) return
    running = true; $('#fpaGo').disabled = true; reset()
    const T = TASKS[task]
    lRunning = wRunning = true

    // 右欄：一次過關
    bubble($('#fpaWL'), 'ai', '讀完指定檔案，照目標產出…', AGENT)
    later(() => {
      $('#fpaWR').textContent = '1'
      bubble($('#fpaWL'), 'ok', 'Accepted ✓ 第一次就對')
      wRunning = false; wTime = SIM_PER_ROUND
      $('#fpaWT').textContent = wTime + 's'; $('#fpaWA').textContent = '100%'; $('#fpaWS').textContent = '通過'
    }, 1100)

    // 左欄：循環到第 6 回才勉強過
    const ROUNDS = 6
    let r = 0
    const step = () => {
      if (r >= ROUNDS) {
        bubble($('#fpaLL'), 'ok', 'Accepted…（第 6 回才勉強能用）')
        lRunning = false; lTime = ROUNDS * SIM_PER_ROUND
        $('#fpaLT').textContent = lTime + 's'
        $('#fpaLA').textContent = Math.round(100 / ROUNDS) + '%'
        $('#fpaLS').textContent = '終於過'
        $('#fpaV').classList.add('show')
        running = false; $('#fpaGo').disabled = false
        return
      }
      r++
      $('#fpaLR').textContent = String(r); $('#fpaLS').textContent = 'Generating…'
      bubble($('#fpaLL'), 'ai', T.gen[(r - 1) % T.gen.length], AGENT)
      later(() => {
        $('#fpaLS').textContent = 'Review：不太對'
        bubble($('#fpaLL'), 'user', T.rej[(r - 1) % T.rej.length])
        $('#fpaLA').textContent = '0%'
        later(step, 620)
      }, 640)
    }
    later(step, 300)
  }

  raf = requestAnimationFrame(clock)
  $('#fpaGo').addEventListener('click', run)
  $('#fpaSeg').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || running) return
    task = b.dataset.t
    $('#fpaSeg').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b))
    reset()
  })
  reset()

  return () => {
    timers.forEach(clearTimeout); timers.clear()
    if (raf) cancelAnimationFrame(raf)
    style.remove(); el.innerHTML = ''
  }
}
