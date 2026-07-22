// First-pass Acceptance — 同一個任務，兩種問法 · DemoStage 導演版
// 5 拍：兩欄對照｜左欄模糊 prompt 陷入 Frustration Loop｜右欄有效 Context 第一次就對｜
//        儀表板結算（耗時 × first-pass 率）｜sandbox 切任務自由重跑。
import { createStage, pop, shake, countUp, confettiBurst } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const OK = '#4ade80', BAD = '#f87171'
const SIM_PER_ROUND = 42     // 每回合模擬耗時（秒）
const ROUNDS = 6             // 左欄要來回幾次才勉強能用

export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#ff6b81'
  const AGENT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="8.5" width="14" height="10.5" rx="2.5"/><path d="M12 8.5V5"/><circle cx="12" cy="3.6" r="1.2"/><circle cx="9.5" cy="13.5" r="1.1"/><circle cx="14.5" cy="13.5" r="1.1"/></svg>'

  const TASKS = {
    code: { label: '寫 code', vague: '「幫我寫一個爬蟲」',
      good: '「讀 scraper.py 與 config.py，沿用既有 session 與 retry 邏輯，目標：抓 A 站商品價格寫入 db」',
      gen: ['產生一版通用爬蟲…', '換個寫法再產生…', '再改結構重寫…'],
      rej: ['沒接到我的 db', '還是沒沿用 retry', '架構又不一樣了'] },
    image: { label: '生圖', vague: '「幫我畫一張封面」',
      good: '「16:9、深色科技風、主色 #ff6b81、左側留白放標題、參考附圖構圖」',
      gen: ['隨機生一張…', '再抽一張…', '再試一次…'],
      rej: ['比例跟色調都不對', '構圖還是很亂', '風格又飄掉了'] },
    copy: { label: '寫文案', vague: '「幫我寫產品介紹」',
      good: '「對象是工程主管、痛點是 review 塞車、三段式、每段 ≤40 字、用我們既有品牌語氣」',
      gen: ['寫一版泛用文案…', '再改語氣重寫…', '再產一版…'],
      rej: ['沒打到痛點', '語氣還是不對', '太長又太空泛'] },
  }

  const style = document.createElement('style')
  style.textContent = `
  .fp-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px}
  .fp-col{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:14px;
    background:rgba(255,255,255,.02);overflow:hidden;min-height:280px}
  .fp-col.win{border-color:${OK}55}
  .fp-top{padding:12px 14px;border-bottom:1px solid var(--line)}
  .fp-tag{font-size:13px;letter-spacing:.12em;font-weight:700;text-transform:uppercase}
  .fp-col.vague .fp-tag{color:${BAD}}.fp-col.win .fp-tag{color:${OK}}
  .fp-prompt{margin-top:6px;font-size:14px;color:var(--text-dim);line-height:1.5;font-family:var(--font-mono)}
  .fp-log{flex:1;overflow:auto;padding:12px 14px;display:flex;flex-direction:column;gap:9px;min-height:150px}
  .fp-b{max-width:90%;padding:8px 12px;border-radius:12px;font-size:15px;line-height:1.45;
    display:flex;gap:7px;align-items:flex-start}
  .fp-b svg{width:19px;height:19px;flex:none;margin-top:1px}
  .fp-b.ai{align-self:flex-start;background:${accent}18;border:1px solid ${accent}44}
  .fp-b.user{align-self:flex-end;background:${BAD}18;border:1px solid ${BAD}55;color:#ffd6d6}
  .fp-b.ok{align-self:flex-end;background:${OK}1c;border:1px solid ${OK}66;color:#c9ffd8;font-weight:600}
  .fp-foot{padding:9px 14px;border-top:1px solid var(--line);display:flex;justify-content:space-between;
    font-size:14px;color:var(--text-dim)}
  .fp-foot b{color:var(--text);font-size:16px}
  .fp-dash{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:12px}
  .fp-cell{border:1px solid var(--line);border-radius:12px;padding:11px 14px;background:rgba(255,255,255,.02)}
  .fp-cell .k{font-size:12px;letter-spacing:.06em;color:var(--text-dim);text-transform:uppercase}
  .fp-cell .v{font-size:24px;font-weight:700;margin-top:3px;font-family:var(--font-mono)}
  .fp-ctrl{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
  .fp-btn{font-family:var(--font-tc);font-size:14px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:9px 18px;cursor:pointer;transition:all .25s ${EASE}}
  .fp-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .fp-btn.primary{background:var(--accent);color:#08090a;border-color:var(--accent);font-weight:600}
  .fp-btn.hide{display:none}
  .fp-seg{display:inline-flex;border:1px solid var(--line);border-radius:10px;overflow:hidden}
  .fp-seg button{background:transparent;border:0;color:var(--text-dim);padding:9px 16px;font-size:15px;
    cursor:pointer;font-family:var(--font-tc)}
  .fp-seg button.on{background:var(--accent);color:#05060a;font-weight:700}
  .fp-seg.hide{display:none}
  @keyframes fpIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  @media(max-width:760px){.fp-cols{grid-template-columns:1fr}.fp-dash{grid-template-columns:1fr 1fr}}
  `
  el.appendChild(style)

  const scene = document.createElement('div')
  scene.innerHTML = `
    <div class="fp-cols">
      <div class="fp-col vague ds-unit" data-side="L">
        <div class="fp-top"><div class="fp-tag">模糊 Prompt</div><div class="fp-prompt lp"></div></div>
        <div class="fp-log ll"></div>
        <div class="fp-foot"><span>回合 <b class="lr">0</b></span><span class="ls">待機</span></div>
      </div>
      <div class="fp-col win ds-unit" data-side="W">
        <div class="fp-top"><div class="fp-tag">有效 Context</div><div class="fp-prompt wp"></div></div>
        <div class="fp-log wl"></div>
        <div class="fp-foot"><span>回合 <b class="wr">0</b></span><span class="ws">待機</span></div>
      </div>
    </div>
    <div class="fp-dash">
      <div class="fp-cell ds-unit"><div class="k">左 · 總耗時</div><div class="v lt" style="color:${BAD}">0s</div></div>
      <div class="fp-cell ds-unit"><div class="k">左 · First-pass 率</div><div class="v la" style="color:${BAD}">—</div></div>
      <div class="fp-cell ds-unit"><div class="k">右 · 總耗時</div><div class="v wt" style="color:${OK}">0s</div></div>
      <div class="fp-cell ds-unit"><div class="k">右 · First-pass 率</div><div class="v wa" style="color:${OK}">—</div></div>
    </div>`

  const ctrls = document.createElement('div')
  ctrls.className = 'fp-ctrl ds-unit'
  ctrls.innerHTML = `
    <button class="fp-btn primary hide" data-b="go">開始</button>
    <div class="fp-seg hide" data-b="seg">
      <button data-t="code" class="on">寫 code</button><button data-t="image">生圖</button><button data-t="copy">寫文案</button>
    </div>
    <button class="fp-btn hide" data-b="reset">重來</button>`

  let stage
  const $ = s => scene.querySelector(s)
  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  let task = 'code', gen = 0
  function bubble(box, cls, txt, icon) {
    const d = document.createElement('div'); d.className = 'fp-b ' + cls
    d.style.animation = 'fpIn .3s'
    if (icon) { d.innerHTML = icon; const s = document.createElement('span'); s.textContent = txt; d.appendChild(s) }
    else d.textContent = txt
    box.appendChild(d); box.scrollTop = box.scrollHeight
    return d
  }

  // 左欄：Frustration Loop — Generate → 不太對 → Regenerate…
  function runLeft(g, onDone) {
    const Tk = TASKS[task]; let r = 0
    const step = () => {
      if (g !== gen) return
      if (r >= ROUNDS) {
        bubble($('.ll'), 'ok', 'Accepted…（第 6 回才勉強能用）')
        $('.ls').textContent = '終於過'
        countUp($('.lt'), ROUNDS * SIM_PER_ROUND, { dur: 700, fmt: v => Math.round(v) + 's' })
        $('.la').textContent = Math.round(100 / ROUNDS) + '%'
        onDone && onDone(); return
      }
      r++
      $('.lr').textContent = String(r); $('.ls').textContent = 'Generating…'
      bubble($('.ll'), 'ai', Tk.gen[(r - 1) % Tk.gen.length], AGENT)
      T(() => {
        if (g !== gen) return
        $('.ls').textContent = 'Review：不太對'
        shake(bubble($('.ll'), 'user', Tk.rej[(r - 1) % Tk.rej.length]))
        $('.la').textContent = '0%'
        T(step, 560)
      }, 600)
    }
    T(step, 260)
  }

  // 右欄：有效 Context → 第一次就對
  function runRight(g, onDone) {
    bubble($('.wl'), 'ai', '讀完指定檔案，照目標產出…', AGENT)
    T(() => {
      if (g !== gen) return
      $('.wr').textContent = '1'
      const ok = bubble($('.wl'), 'ok', 'Accepted ✓ 第一次就對'); pop(ok)
      $('.ws').textContent = '通過'
      countUp($('.wt'), SIM_PER_ROUND, { dur: 500, fmt: v => Math.round(v) + 's' })
      $('.wa').textContent = '100%'
      const r = ok.getBoundingClientRect(), br = stage.body.getBoundingClientRect()
      confettiBurst(stage.body, r.left - br.left + r.width / 2, r.top - br.top, OK, 22)
      onDone && onDone()
    }, 1050)
  }

  function resetScene() {
    clearT(); gen++
    $('.ll').innerHTML = ''; $('.wl').innerHTML = ''
    $('.lr').textContent = '0'; $('.wr').textContent = '0'
    $('.ls').textContent = '待機'; $('.ws').textContent = '待機'
    $('.lt').textContent = '0s'; $('.wt').textContent = '0s'
    $('.la').textContent = '—'; $('.wa').textContent = '—'
    const Tk = TASKS[task]; $('.lp').textContent = Tk.vague; $('.wp').textContent = Tk.good
    showBtns([])
  }

  function showBtns(list) {
    ctrls.querySelectorAll('[data-b]').forEach(b => b.classList.toggle('hide', !list.includes(b.dataset.b)))
  }
  function setSeg(t) {
    task = t
    ctrls.querySelectorAll('.fp-seg button').forEach(x => x.classList.toggle('on', x.dataset.t === t))
  }

  ctrls.querySelector('[data-b="go"]').onclick = e => { pop(e.currentTarget); startSandboxRun(false) }
  ctrls.querySelector('[data-b="reset"]').onclick = e => { pop(e.currentTarget); startSandboxRun(true) }
  ctrls.querySelector('[data-b="seg"]').onclick = e => {
    const b = e.target.closest('button'); if (!b) return
    setSeg(b.dataset.t); resetScene(); showBtns(['go', 'seg', 'reset'])
  }

  // sandbox：idle=只鋪好 prompt 等按開始；run=直接跑
  function startSandboxRun(reset) {
    resetScene(); showBtns(['go', 'seg', 'reset'])
    if (!reset) { const g = gen; runLeft(g); runRight(g) }
  }

  function buildBeats() {
    return [
      { narration: '同一個任務、兩種問法 — 左邊<b>模糊 prompt</b>，右邊給足<b>有效 Context</b>（指定讀哪些檔、講清楚目標）。', focus: ['.fp-cols'], nextLabel: '先看模糊 prompt →',
        enter() { resetScene() } },

      { narration: '左欄陷入 <b style="color:' + BAD + '">Frustration Loop</b>：Generate → 覺得不太對 → Regenerate → 還是錯…回合一直往上加。', focus: ['[data-side="L"]'], nextLabel: '右欄呢？ →',
        enter() { resetScene(); const g = gen; runLeft(g) } },

      { narration: '右欄先讀指定檔案、對齊目標 —<b style="color:' + OK + '"> 第一次就對</b>，一回合 Accepted。', focus: ['[data-side="W"]'], nextLabel: '看結算 →',
        enter() { resetScene(); const g = gen; runRight(g) } },

      { narration: '結算：追求的不是 AI 生得多快，是 <b>First-pass Acceptance</b> — 左欄時間爆掉、率停在低檔，右欄一次過關。', focus: ['.fp-dash'], nextLabel: '換我玩 →',
        enter() { resetScene(); const g = gen; runLeft(g); runRight(g) } },

      { narration: '換你玩 — 切 <b>寫 code / 生圖 / 寫文案</b> 按「開始」重跑，同樣的模式一再出現。<b>不要追求 AI 多快，要追求第一次就對。</b>', sandbox: true,
        enter() { startSandboxRun(false) } },
    ]
  }

  stage = createStage(el, ctx, { beats: buildBeats() })
  stage.body.append(scene, ctrls)

  return () => { clearT(); stage.destroy(); style.remove() }
}
