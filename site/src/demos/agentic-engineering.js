// agentic-engineering — 三條反轉翻卡 + Bounded Context 收尾
export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#ff6b81'
  const OK = '#4ade80', BAD = '#f87171', BLUE = '#5b8cff', TEAL = '#38e1c6', PUR = '#b98bff', GOLD = '#ffc24b'
  const WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4 20 18.5 4 18.5Z"/><path d="M12 9.5v4.5"/><circle cx="12" cy="16.8" r=".9" fill="currentColor" stroke="none"/></svg>'

  const style = document.createElement('style')
  style.textContent = `
  .ae-wrap{position:absolute;inset:0;--acc:${accent};display:flex;flex-direction:column;gap:14px;padding:20px 24px;color:#e7e9f0;font-family:var(--font-tc,'Noto Sans TC',sans-serif);box-sizing:border-box;overflow:auto}
  .ae-lead{font-size:17px;color:#c7cbd8;line-height:1.55}.ae-lead b{color:var(--acc)}
  .ae-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .ae-card{perspective:1400px;height:300px;cursor:pointer}
  .ae-inner{position:relative;width:100%;height:100%;transition:transform .7s cubic-bezier(.4,0,.2,1);transform-style:preserve-3d}
  .ae-card.flip .ae-inner{transform:rotateY(180deg)}
  .ae-face{position:absolute;inset:0;backface-visibility:hidden;border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:16px;box-sizing:border-box;overflow:hidden;background:rgba(255,255,255,.03)}
  .ae-back{transform:rotateY(180deg);background:rgba(10,12,18,.85)}
  .ae-num{font-family:var(--font-en,monospace);font-size:13px;color:var(--acc);letter-spacing:.15em}
  .ae-ttl{font-size:20px;font-weight:700;margin:8px 0 4px}
  .ae-tsub{font-size:13px;color:#8a90a2;letter-spacing:.06em}
  .ae-fdesc{margin-top:14px;font-size:15px;color:#aeb3c4;line-height:1.6}
  .ae-hint{position:absolute;bottom:14px;left:16px;font-size:13px;color:#7a8090}
  .ae-btitle{font-size:16px;font-weight:700;color:var(--acc);margin-bottom:8px}
  /* card1 */
  .ae-orbit{position:relative;height:150px;margin-top:6px}
  .ae-llm{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:76px;height:76px;border-radius:50%;border:2px dashed ${PUR};display:flex;align-items:center;justify-content:center;font-size:12px;color:${PUR};text-align:center}
  .ae-ext{position:absolute;font-size:12px;padding:3px 7px;border-radius:16px;background:rgba(56,225,198,.12);border:1px solid ${TEAL}66;color:${TEAL};animation:aePulse 2.4s ease-in-out infinite}
  @keyframes aePulse{0%,100%{opacity:.55}50%{opacity:1}}
  /* card2 */
  .ae-inp{width:100%;box-sizing:border-box;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);border-radius:8px;color:#e7e9f0;padding:8px 10px;font-size:15px;font-family:inherit}
  .ae-tree{margin-top:10px;display:flex;flex-wrap:wrap;gap:6px}
  .ae-chip{font-size:13px;padding:4px 9px;border-radius:8px;border:1px solid rgba(255,255,255,.18);color:#cfd3de;opacity:0;transform:scale(.6);animation:aePop .3s forwards;display:inline-flex;gap:4px;align-items:center}
  .ae-chip svg{width:14px;height:14px;flex:none}
  @keyframes aePop{to{opacity:1;transform:none}}
  .ae-chip.red{border-color:${BAD};color:${BAD};background:rgba(248,113,113,.12);cursor:pointer}
  .ae-cost{margin-top:8px;font-size:14px;color:${BAD};line-height:1.5;min-height:16px}
  /* card3 */
  .ae-cloud{position:relative;height:120px;margin-top:6px;display:flex;align-items:center;justify-content:center}
  .ae-core{width:96px;height:96px;border-radius:50%;background:radial-gradient(circle,${PUR}55,${BLUE}22);display:flex;align-items:center;justify-content:center;font-size:13px;color:#dfe2ea;filter:blur(.3px);transition:all .5s}
  .ae-core.tame{background:radial-gradient(circle,${OK}44,${OK}11);filter:none}
  .ae-blocks{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}
  .ae-blk{flex:1;min-width:60px;font-size:14px;padding:7px 6px;border-radius:8px;border:1px dashed rgba(255,255,255,.25);text-align:center;cursor:pointer;color:#aeb3c4}
  .ae-blk.on{border-style:solid;border-color:${OK};color:${OK};background:rgba(74,222,128,.1)}
  .ae-outp{margin-top:9px;font-size:14px;text-align:center;font-family:var(--font-en,monospace)}
  /* endgame */
  .ae-end{border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:18px;background:rgba(255,255,255,.02);opacity:.4;transition:opacity .5s}
  .ae-end.live{opacity:1}
  .ae-end h3{margin:0 0 4px;font-size:18px}
  .ae-map{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:14px 0}
  .ae-region{border:2px solid rgba(255,255,255,.18);border-radius:12px;padding:14px;text-align:center;transition:all .5s;position:relative;overflow:hidden}
  .ae-region .rn{font-size:17px;font-weight:700}.ae-region .rs{font-size:12.5px;color:#8a90a2;margin-top:3px}
  .ae-region .st{margin-top:8px;font-size:13.5px;min-height:16px}
  .ae-region.good{border-color:${OK};box-shadow:0 0 14px ${OK}33}
  .ae-region.bad{border-color:${BAD}}
  .ae-flood{position:absolute;inset:0;background:${BAD}33;transform:scaleX(0);transform-origin:left;transition:transform .8s}
  .ae-region.bad .ae-flood{transform:scaleX(1)}
  .ae-ctrl{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
  .ae-final{font-size:17px;font-weight:700;color:var(--acc);opacity:0;transition:opacity .6s}
  .ae-final.show{opacity:1}
  @media(max-width:820px){.ae-cards,.ae-map{grid-template-columns:1fr}.ae-card{height:auto;min-height:260px}}
  `
  document.head.appendChild(style)

  el.innerHTML = `
  <div class="ae-wrap">
    <div class="ae-lead">Vibe coding 拉高地板，Agentic engineering 拉高天花板。點<b>翻開三張卡</b>，看傳統工程被反轉成 Agent 時代——三張都翻完，最後親手切 <b>Bounded Context</b>。</div>
    <div class="ae-cards">
      <div class="ae-card" data-c="0"><div class="ae-inner">
        <div class="ae-face"><div class="ae-num">反轉 01</div><div class="ae-ttl">Stateless ↔ Stateful</div><div class="ae-tsub">傳統工程</div>
          <div class="ae-fdesc">幾十年都在學「怎麼把 state 包好」——state 被程式牢牢封裝在系統內部。</div><div class="ae-hint">▸ 點我翻到 Agent 時代</div></div>
        <div class="ae-face ae-back"><div class="ae-btitle">Agent 時代：state 被 externalize</div>
          <div class="ae-orbit"><div class="ae-llm">空心 LLM<br>每次失憶</div></div>
          <div class="ae-fdesc" style="margin-top:0">LLM 本身無狀態，「記憶」是外部每次把 relevant context 塞回去。</div></div>
      </div></div>
      <div class="ae-card" data-c="1"><div class="ae-inner">
        <div class="ae-face"><div class="ae-num">反轉 02</div><div class="ae-ttl">Code ↔ Architecture</div><div class="ae-tsub">傳統工程</div>
          <div class="ae-fdesc">資深工程師先打架構，再實作成 code——架構決策是被審視過的。</div><div class="ae-hint">▸ 點我翻到 Agent 時代</div></div>
        <div class="ae-face ae-back"><div class="ae-btitle">Agent 時代：寫 code 同時做架構決策</div>
          <input class="ae-inp" id="aeInp" value="幫我做一個股票追蹤系統" readonly>
          <button class="demo-btn" id="aeGen" style="margin-top:8px;padding:7px 15px;font-size:14px">Enter ↵</button>
          <div class="ae-tree" id="aeTree"></div><div class="ae-cost" id="aeCost"></div></div>
      </div></div>
      <div class="ae-card" data-c="2"><div class="ae-inner">
        <div class="ae-face"><div class="ae-num">反轉 03</div><div class="ae-ttl">Deterministic ↔ Non-det.</div><div class="ae-tsub">傳統工程</div>
          <div class="ae-fdesc">同樣 input 同樣 output——deterministic 是 code 的特性。</div><div class="ae-hint">▸ 點我翻到 Agent 時代</div></div>
        <div class="ae-face ae-back"><div class="ae-btitle">Agent 時代：在機率核心外建 boundary</div>
          <div class="ae-cloud"><div class="ae-core" id="aeCore">機率雲<br>亂數輸出</div></div>
          <div class="ae-blocks"><div class="ae-blk" data-b="Eval">Eval</div><div class="ae-blk" data-b="Guardrails">Guardrails</div><div class="ae-blk" data-b="Hooks">Hooks</div></div>
          <div class="ae-outp" id="aeOut" style="color:${BAD}">output: 不穩定 ~ ??</div></div>
      </div></div>
    </div>
    <div class="ae-end" id="aeEnd">
      <h3>收尾 · 親手切 Bounded Context</h3>
      <div class="ae-tsub" style="color:#8a90a2;font-size:14px;line-height:1.55">User / Billing / Identity 這些大邊界最好由人定義。切對，agent 在各區內好好工作；切錯一條，它高速放大問題。</div>
      <div class="ae-map" id="aeMap">
        <div class="ae-region" data-r="User"><div class="ae-flood"></div><div class="rn">User</div><div class="rs">帳號 · 個資</div><div class="st" id="aeS0"></div></div>
        <div class="ae-region" data-r="Billing"><div class="ae-flood"></div><div class="rn">Billing</div><div class="rs">計費 · 金流</div><div class="st" id="aeS1"></div></div>
        <div class="ae-region" data-r="Identity"><div class="ae-flood"></div><div class="rn">Identity</div><div class="rs">authn · authz</div><div class="st" id="aeS2"></div></div>
      </div>
      <div class="ae-ctrl">
        <button class="demo-btn primary" id="aeGood" disabled>正確切邊界</button>
        <button class="demo-btn" id="aeBad" disabled>故意切錯一條</button>
        <div class="ae-final" id="aeFinal">可以外包 execution，不能外包 abstraction。</div>
      </div>
    </div>
  </div>`

  const $ = id => el.querySelector(id)
  const timers = new Set()
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn() }, ms); timers.add(t); return t }
  const flipped = new Set()

  // card1 外部元件環繞
  const EXT = ['CLAUDE.md', 'memory', 'compaction', 'context 塞回']
  const orbit = $('.ae-orbit')
  EXT.forEach((t, i) => {
    const a = (i / EXT.length) * Math.PI * 2 - Math.PI / 2
    const d = document.createElement('div')
    d.className = 'ae-ext'; d.textContent = t
    d.style.left = (50 + Math.cos(a) * 40) + '%'
    d.style.top = (50 + Math.sin(a) * 40) + '%'
    d.style.transform = 'translate(-50%,-50%)'; d.style.animationDelay = (i * 0.4) + 's'
    orbit.appendChild(d)
  })

  function onFlip(idx) {
    flipped.add(idx)
    if (flipped.size === 3) {
      $('#aeEnd').classList.add('live')
      $('#aeGood').disabled = false; $('#aeBad').disabled = false
    }
  }

  el.querySelectorAll('.ae-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.ae-blk') || e.target.closest('.ae-chip')) return
      card.classList.toggle('flip')
      if (card.classList.contains('flip')) onFlip(+card.dataset.c)
    })
  })

  // card2 決策樹
  const TREE = [
    { t: 'React', red: false }, { t: 'Tailwind', red: false }, { t: 'Supabase', red: true, cost: 'Supabase：把 auth + db + realtime 綁死，日後換供應商成本極高——未被審視的邊界決策' },
    { t: 'folder structure', red: false }, { t: 'REST（非 tRPC）', red: true, cost: 'REST：型別安全交界沒設計，前後端 contract 只能靠人工同步' },
    { t: 'user 表塞 billing 欄位', red: true, cost: '把 billing 塞進 user 表：錯的 bounded context，未來拆分代價高得多' },
  ]
  $('#aeGen').addEventListener('click', () => {
    const tree = $('#aeTree'); tree.innerHTML = ''; $('#aeCost').textContent = ''
    TREE.forEach((n, i) => later(() => {
      const c = document.createElement('div')
      c.className = 'ae-chip' + (n.red ? ' red' : '')
      if (n.red) { c.innerHTML = WARN; const s = document.createElement('span'); s.textContent = n.t; c.appendChild(s) }
      else c.textContent = n.t
      c.style.animationDelay = '0s'
      if (n.red) c.addEventListener('click', () => { $('#aeCost').textContent = '代價 → ' + n.cost })
      tree.appendChild(c)
    }, i * 160))
    later(() => { $('#aeCost').textContent = '點紅色節點看它日後的代價 ↑' }, TREE.length * 160 + 200)
  })

  // card3 邊界積木
  const added = new Set()
  el.querySelectorAll('.ae-blk').forEach(b => b.addEventListener('click', () => {
    b.classList.toggle('on')
    if (b.classList.contains('on')) added.add(b.dataset.b); else added.delete(b.dataset.b)
    const core = $('#aeCore'), out = $('#aeOut')
    if (added.size >= 3) {
      core.classList.add('tame'); core.innerHTML = '機率核心<br>被框住'
      out.style.color = OK; out.textContent = 'output: 穩定 ✓（deterministic boundary）'
    } else {
      core.classList.remove('tame'); core.innerHTML = '機率雲<br>亂數輸出'
      out.style.color = BAD; out.textContent = `output: 不穩定 ~ ??（還差 ${3 - added.size} 塊）`
    }
  }))

  // endgame
  const regions = () => el.querySelectorAll('.ae-region')
  function clearMap() { regions().forEach((r, i) => { r.classList.remove('good', 'bad'); $('#aeS' + i).textContent = ''; $('#aeS' + i).style.color = '' }) }
  $('#aeGood').addEventListener('click', () => {
    clearMap(); $('#aeFinal').classList.remove('show')
    regions().forEach((r, i) => later(() => { r.classList.add('good'); const s = $('#aeS' + i); s.style.color = OK; s.textContent = 'agent 在邊界內工作 ✓' }, i * 300))
    later(() => $('#aeFinal').classList.add('show'), 1100)
  })
  $('#aeBad').addEventListener('click', () => {
    clearMap(); $('#aeFinal').classList.remove('show')
    // 切錯：Identity 邊界劃進 Billing，錯誤高速放大到整張圖
    const rs = regions()
    rs[2].classList.add('bad'); $('#aeS2').style.color = BAD; $('#aeS2').textContent = '邊界切錯：authz 洩進 Billing'
    later(() => { rs[1].classList.add('bad'); $('#aeS1').style.color = BAD; $('#aeS1').textContent = 'agent 高速放大 → 金流也被汙染' }, 500)
    later(() => { rs[0].classList.add('bad'); $('#aeS0').style.color = BAD; $('#aeS0').textContent = '整張地圖被拖下水 ✕' }, 1000)
    later(() => $('#aeFinal').classList.add('show'), 1500)
  })

  return () => { timers.forEach(clearTimeout); timers.clear(); style.remove(); el.innerHTML = '' }
}
