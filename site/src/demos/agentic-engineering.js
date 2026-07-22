// Agentic Engineering — 三條反轉 + Bounded Context 收尾 · DemoStage 導演版
// 5 拍：地板/天花板開場｜反轉01 Stateless↔Stateful（state externalize）｜反轉02 Code↔Architecture（決策樹爆紅）｜
//        反轉03 Deterministic↔Non-det（機率核心外建 boundary）｜sandbox 親手切 Bounded Context。
import { createStage, pop, shake, confettiBurst } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const OK = '#4ade80', BAD = '#f87171', BLUE = '#5b8cff', PUR = '#b98bff'

export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#ff6b81'
  const WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 20 18.5 4 18.5Z"/><path d="M12 9.5v4.5"/><circle cx="12" cy="16.8" r=".9" fill="currentColor" stroke="none"/></svg>'

  const style = document.createElement('style')
  style.textContent = `
  .ae-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px}
  .ae-card{perspective:1400px;height:300px;cursor:pointer}
  .ae-inner{position:relative;width:100%;height:100%;transition:transform .7s cubic-bezier(.4,0,.2,1);transform-style:preserve-3d}
  .ae-card.flip .ae-inner{transform:rotateY(180deg)}
  .ae-face{position:absolute;inset:0;backface-visibility:hidden;border:1px solid var(--line);border-radius:16px;
    padding:16px;box-sizing:border-box;overflow:hidden;background:rgba(255,255,255,.03)}
  .ae-back{transform:rotateY(180deg);background:rgba(10,12,18,.85)}
  .ae-num{font-family:var(--font-mono);font-size:15px;color:var(--acc);letter-spacing:.15em}
  .ae-ttl{font-size:20px;font-weight:700;margin:8px 0 4px}
  .ae-tsub{font-size:15px;color:var(--text-dim);letter-spacing:.06em}
  .ae-fdesc{margin-top:14px;font-size:15px;color:var(--text-dim);line-height:1.6}
  .ae-hint{position:absolute;bottom:14px;left:16px;font-size:15px;color:var(--text-dim)}
  .ae-btitle{font-size:16px;font-weight:700;color:var(--acc);margin-bottom:8px}
  .ae-orbit{position:relative;height:150px;margin-top:6px}
  .ae-llm{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:76px;height:76px;border-radius:50%;
    border:2px dashed ${PUR};display:flex;align-items:center;justify-content:center;font-size:14px;color:${PUR};text-align:center}
  .ae-ext{position:absolute;font-size:14px;padding:3px 7px;border-radius:16px;background:#38e1c61f;border:1px solid #38e1c666;
    color:#38e1c6;animation:aePulse 2.4s ease-in-out infinite}
  @keyframes aePulse{0%,100%{opacity:.55}50%{opacity:1}}
  .ae-inp{width:100%;box-sizing:border-box;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);
    border-radius:8px;color:var(--text);padding:8px 10px;font-size:15px;font-family:inherit}
  .ae-tree{margin-top:10px;display:flex;flex-wrap:wrap;gap:6px}
  .ae-chip{font-size:15px;padding:4px 9px;border-radius:8px;border:1px solid rgba(255,255,255,.18);color:var(--text);
    display:inline-flex;gap:4px;align-items:center;animation:aePop .3s}
  .ae-chip svg{width:14px;height:14px;flex:none}
  @keyframes aePop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}
  .ae-chip.red{border-color:${BAD};color:${BAD};background:${BAD}1f;cursor:pointer}
  .ae-cost{margin-top:8px;font-size:15px;color:${BAD};line-height:1.5;min-height:16px}
  .ae-cloud{position:relative;height:120px;margin-top:6px;display:flex;align-items:center;justify-content:center}
  .ae-core{width:96px;height:96px;border-radius:50%;background:radial-gradient(circle,${PUR}55,${BLUE}22);
    display:flex;align-items:center;justify-content:center;font-size:15px;color:var(--text);text-align:center;transition:all .5s}
  .ae-core.tame{background:radial-gradient(circle,${OK}44,${OK}11)}
  .ae-blocks{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}
  .ae-blk{flex:1;min-width:60px;font-size:15.5px;padding:7px 6px;border-radius:8px;border:1px dashed rgba(255,255,255,.25);
    text-align:center;cursor:pointer;color:var(--text-dim)}
  .ae-blk.on{border-style:solid;border-color:${OK};color:${OK};background:${OK}1a}
  .ae-outp{margin-top:9px;font-size:15.5px;text-align:center;font-family:var(--font-mono)}
  .ae-end{border:1px solid var(--line);border-radius:16px;padding:18px;background:rgba(255,255,255,.02)}
  .ae-end h3{margin:0 0 4px;font-size:18px}
  .ae-map{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:14px 0}
  .ae-region{border:2px solid rgba(255,255,255,.18);border-radius:12px;padding:14px;text-align:center;
    transition:all .5s;position:relative;overflow:hidden}
  .ae-region .rn{font-size:17px;font-weight:700}.ae-region .rs{font-size:14px;color:var(--text-dim);margin-top:3px}
  .ae-region .st{margin-top:8px;font-size:15px;min-height:16px}
  .ae-region.good{border-color:${OK};box-shadow:0 0 14px ${OK}33}
  .ae-region.bad{border-color:${BAD}}
  .ae-flood{position:absolute;inset:0;background:${BAD}33;transform:scaleX(0);transform-origin:left;transition:transform .8s}
  .ae-region.bad .ae-flood{transform:scaleX(1)}
  .ae-ctrl{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:2px}
  .ae-btn{font-family:var(--font-tc);font-size:15.5px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:9px 17px;cursor:pointer;transition:all .25s ${EASE}}
  .ae-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .ae-btn.primary{background:var(--accent);color:#08090a;border-color:var(--accent);font-weight:600}
  .ae-btn.hide{display:none}
  .ae-final{font-size:16px;font-weight:700;color:var(--acc);opacity:0;transition:opacity .6s}
  .ae-final.show{opacity:1}
  .ae-gen{margin-top:8px;padding:7px 15px;font-size:15.5px}
  @media(max-width:820px){.ae-cards,.ae-map{grid-template-columns:1fr}.ae-card{height:auto;min-height:260px}}
  `
  el.appendChild(style)

  const scene = document.createElement('div')
  scene.style.setProperty('--acc', accent)
  scene.innerHTML = `
    <div class="ae-cards">
      <div class="ae-card ds-unit" data-c="0"><div class="ae-inner">
        <div class="ae-face"><div class="ae-num">反轉 01</div><div class="ae-ttl">Stateless ↔ Stateful</div><div class="ae-tsub">傳統工程</div>
          <div class="ae-fdesc">幾十年都在學「怎麼把 state 包好」— state 被程式牢牢封裝在系統內部。</div><div class="ae-hint">▸ 點我翻到 Agent 時代</div></div>
        <div class="ae-face ae-back"><div class="ae-btitle">Agent 時代：state 被 externalize</div>
          <div class="ae-orbit"><div class="ae-llm">空心 LLM<br>每次失憶</div></div>
          <div class="ae-fdesc" style="margin-top:0">LLM 本身無狀態，「記憶」是外部每次把 relevant context 塞回去。</div></div>
      </div></div>
      <div class="ae-card ds-unit" data-c="1"><div class="ae-inner">
        <div class="ae-face"><div class="ae-num">反轉 02</div><div class="ae-ttl">Code ↔ Architecture</div><div class="ae-tsub">傳統工程</div>
          <div class="ae-fdesc">資深工程師先打架構，再實作成 code — 架構決策是被審視過的。</div><div class="ae-hint">▸ 點我翻到 Agent 時代</div></div>
        <div class="ae-face ae-back"><div class="ae-btitle">Agent 時代：寫 code 同時做架構決策</div>
          <input class="ae-inp inp" value="幫我做一個股票追蹤系統" readonly>
          <button class="ae-btn ae-gen gen">Enter ↵</button>
          <div class="ae-tree tree"></div><div class="ae-cost cost"></div></div>
      </div></div>
      <div class="ae-card ds-unit" data-c="2"><div class="ae-inner">
        <div class="ae-face"><div class="ae-num">反轉 03</div><div class="ae-ttl">Deterministic ↔ Non-det.</div><div class="ae-tsub">傳統工程</div>
          <div class="ae-fdesc">同樣 input 同樣 output — deterministic 是 code 的特性。</div><div class="ae-hint">▸ 點我翻到 Agent 時代</div></div>
        <div class="ae-face ae-back"><div class="ae-btitle">Agent 時代：在機率核心外建 boundary</div>
          <div class="ae-cloud"><div class="ae-core core">機率雲<br>亂數輸出</div></div>
          <div class="ae-blocks"><div class="ae-blk" data-b="Eval">Eval</div><div class="ae-blk" data-b="Guardrails">Guardrails</div><div class="ae-blk" data-b="Hooks">Hooks</div></div>
          <div class="ae-outp out" style="color:${BAD}">output: 不穩定 ~ ??</div></div>
      </div></div>
    </div>
    <div class="ae-end ds-unit">
      <h3>收尾 · 親手切 Bounded Context</h3>
      <div class="ae-tsub" style="line-height:1.55">User / Billing / Identity 這些大邊界最好由人定義。切對，agent 在各區內好好工作；切錯一條，它高速放大問題。</div>
      <div class="ae-map">
        <div class="ae-region" data-r="0"><div class="ae-flood"></div><div class="rn">User</div><div class="rs">帳號 · 個資</div><div class="st s0"></div></div>
        <div class="ae-region" data-r="1"><div class="ae-flood"></div><div class="rn">Billing</div><div class="rs">計費 · 金流</div><div class="st s1"></div></div>
        <div class="ae-region" data-r="2"><div class="ae-flood"></div><div class="rn">Identity</div><div class="rs">authn · authz</div><div class="st s2"></div></div>
      </div>
      <div class="ae-ctrl">
        <button class="ae-btn primary hide" data-b="good">正確切邊界</button>
        <button class="ae-btn hide" data-b="bad">故意切錯一條</button>
        <div class="ae-final final">可以外包 execution，不能外包 abstraction。</div>
      </div>
    </div>`

  let stage
  const $ = s => scene.querySelector(s)
  const $$ = s => [...scene.querySelectorAll(s)]
  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  // card1 外部元件環繞
  const EXT = ['CLAUDE.md', 'memory', 'compaction', 'context 塞回']
  const orbit = $('.ae-orbit')
  EXT.forEach((t, i) => {
    const a = (i / EXT.length) * Math.PI * 2 - Math.PI / 2
    const d = document.createElement('div')
    d.className = 'ae-ext'; d.textContent = t
    d.style.left = (50 + Math.cos(a) * 40) + '%'; d.style.top = (50 + Math.sin(a) * 40) + '%'
    d.style.transform = 'translate(-50%,-50%)'; d.style.animationDelay = (i * 0.4) + 's'
    orbit.appendChild(d)
  })

  function flipCard(idx, on = true) {
    const c = scene.querySelector(`.ae-card[data-c="${idx}"]`)
    c.classList.toggle('flip', on)
  }
  // 讓卡片本身可點翻（不影響內部控件）
  $$('.ae-card').forEach(card => card.addEventListener('click', e => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.ae-blk') || e.target.closest('.ae-chip')) return
    card.classList.toggle('flip')
  }))

  // card2 決策樹
  const TREE = [
    { t: 'React' }, { t: 'Tailwind' },
    { t: 'Supabase', red: true, cost: 'Supabase：把 auth + db + realtime 綁死，日後換供應商成本極高 — 未被審視的邊界決策' },
    { t: 'folder structure' },
    { t: 'REST（非 tRPC）', red: true, cost: 'REST：型別安全交界沒設計，前後端 contract 只能靠人工同步' },
    { t: 'user 表塞 billing 欄位', red: true, cost: '把 billing 塞進 user 表：錯的 bounded context，未來拆分代價高得多' },
  ]
  function genTree() {
    const tree = $('.tree'); tree.innerHTML = ''; $('.cost').textContent = ''
    TREE.forEach((n, i) => T(() => {
      const c = document.createElement('div')
      c.className = 'ae-chip' + (n.red ? ' red' : '')
      if (n.red) { c.innerHTML = WARN; const s = document.createElement('span'); s.textContent = n.t; c.appendChild(s); c.addEventListener('click', () => { $('.cost').textContent = '代價 → ' + n.cost }) }
      else c.textContent = n.t
      tree.appendChild(c); pop(c)
    }, i * 150))
    T(() => { $('.cost').textContent = '點紅色節點看它日後的代價 ↑' }, TREE.length * 150 + 200)
  }
  $('.gen').addEventListener('click', genTree)

  // card3 邊界積木
  const added = new Set()
  function refreshCore() {
    const core = $('.core'), out = $('.out')
    if (added.size >= 3) {
      core.classList.add('tame'); core.innerHTML = '機率核心<br>被框住'
      out.style.color = OK; out.textContent = 'output: 穩定 ✓（deterministic boundary）'; pop(core)
    } else {
      core.classList.remove('tame'); core.innerHTML = '機率雲<br>亂數輸出'
      out.style.color = BAD; out.textContent = `output: 不穩定 ~ ??（還差 ${3 - added.size} 塊）`
    }
  }
  $$('.ae-blk').forEach(b => b.addEventListener('click', () => {
    b.classList.toggle('on')
    if (b.classList.contains('on')) added.add(b.dataset.b); else added.delete(b.dataset.b)
    refreshCore()
  }))
  function autoBoundary() {
    added.clear(); $$('.ae-blk').forEach(b => b.classList.remove('on')); refreshCore()
    $$('.ae-blk').forEach((b, i) => T(() => { b.classList.add('on'); added.add(b.dataset.b); refreshCore() }, 500 + i * 500))
  }

  // endgame — Bounded Context
  const regions = () => $$('.ae-region')
  function clearMap() { regions().forEach((r, i) => { r.classList.remove('good', 'bad'); const s = $('.s' + i); s.textContent = ''; s.style.color = '' }); $('.final').classList.remove('show') }
  function cutGood() {
    clearMap()
    regions().forEach((r, i) => T(() => { r.classList.add('good'); const s = $('.s' + i); s.style.color = OK; s.textContent = 'agent 在邊界內工作 ✓'; pop(r) }, i * 300))
    T(() => {
      $('.final').classList.add('show')
      const r = $('.ae-map').getBoundingClientRect(), br = stage.body.getBoundingClientRect()
      confettiBurst(stage.body, r.left - br.left + r.width / 2, r.top - br.top + 20, OK, 26)
    }, 1100)
  }
  function cutBad() {
    clearMap()
    const rs = regions()
    rs[2].classList.add('bad'); $('.s2').style.color = BAD; $('.s2').textContent = '邊界切錯：authz 洩進 Billing'; shake(rs[2])
    T(() => { rs[1].classList.add('bad'); $('.s1').style.color = BAD; $('.s1').textContent = 'agent 高速放大 → 金流也被汙染'; shake(rs[1]) }, 500)
    T(() => { rs[0].classList.add('bad'); $('.s0').style.color = BAD; $('.s0').textContent = '整張地圖被拖下水 ✕'; shake(rs[0]) }, 1000)
    T(() => $('.final').classList.add('show'), 1500)
  }
  $('[data-b="good"]').addEventListener('click', e => { pop(e.currentTarget); cutGood() })
  $('[data-b="bad"]').addEventListener('click', e => { pop(e.currentTarget); cutBad() })

  function showEndBtns(on) { $$('.ae-end [data-b]').forEach(b => b.classList.toggle('hide', !on)) }

  function resetScene() {
    clearT()
    flipCard(0, false); flipCard(1, false); flipCard(2, false)
    $('.tree').innerHTML = ''; $('.cost').textContent = ''
    added.clear(); $$('.ae-blk').forEach(b => b.classList.remove('on')); refreshCore()
    clearMap(); showEndBtns(false)
  }

  function startSandboxRun() {
    clearT(); clearMap(); showEndBtns(true)
    // 三張卡保持翻開作為脈絡，收尾聚焦在親手切邊界
    flipCard(0, true); flipCard(1, true); flipCard(2, true)
  }

  function buildBeats() {
    return [
      { narration: 'Vibe coding <b>拉高地板</b>，Agentic engineering <b>拉高天花板</b> — 底下是三條根本反轉，逐一翻開看。', focus: ['.ae-cards'], nextLabel: '翻開反轉 01 →',
        enter() { resetScene() } },

      { narration: '<b>反轉 01 · Stateless ↔ Stateful</b>：LLM 本身無狀態，state 被 <b>externalize</b> 到 model 外 — CLAUDE.md、memory、compaction 每次把 context 塞回去。', focus: ['[data-c="0"]'], nextLabel: '翻開反轉 02 →',
        enter() { resetScene(); T(() => flipCard(0, true), 200) } },

      { narration: '<b>反轉 02 · Code ↔ Architecture</b>：一句「幫我做股票追蹤系統」，agent 瞬間替你決定 React/Supabase — <b style="color:' + BAD + '">未被審視的架構決策</b>就是新技術債。點紅節點看代價。', focus: ['[data-c="1"]'], nextLabel: '翻開反轉 03 →',
        enter() { resetScene(); flipCard(1, true); T(() => genTree(), 500) } },

      { narration: '<b>反轉 03 · Deterministic ↔ Non-det.</b>：不消滅機率核心，而是在外面用 <b>Eval / Guardrails / Hooks</b> 搭一圈 deterministic boundary，亂數輸出被框成穩定。', focus: ['[data-c="2"]'], nextLabel: '換我切邊界 →',
        enter() { resetScene(); flipCard(2, true); autoBoundary() } },

      { narration: '換你收尾 — 親手切 <b>Bounded Context</b>。<b>正確切</b>：agent 在各區工作；<b>切錯一條</b>：它高速放大到整張圖。<b>可以外包 execution，不能外包 abstraction。</b>', sandbox: true,
        enter() { startSandboxRun() } },
    ]
  }

  stage = createStage(el, ctx, { beats: buildBeats() })
  stage.body.append(scene)

  return () => { clearT(); stage.destroy(); style.remove() }
}
