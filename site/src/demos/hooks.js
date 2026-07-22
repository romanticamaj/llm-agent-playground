// 攔不攔得住 — Prompt 派 vs Hook 派
// 同一條規則「先寫測試再寫實作」。按「派任務」，看 Prompt 派靠機率、
// 有時被 rationalization 繞過而 token 暴走；Hook 派在 tool boundary 被 exit 2 擋回，成本收斂。
export default function mount(el, ctx) {
  const accent = ctx?.accent || '#38e1c6'
  const GREEN = '#4ade80', RED = '#f87171'
  const P = 'hk'
  const style = document.createElement('style')
  style.textContent = `
  .${P}-root{position:absolute;inset:0;overflow:auto;padding:20px 24px;color:#e8ebf2;box-sizing:border-box;
    font-family:var(--font-tc,'Noto Sans TC',sans-serif)}
  .${P}-guide{font-size:17px;color:#aeb4c4;margin-bottom:12px;line-height:1.6}
  .${P}-guide b{color:${accent}}
  .${P}-rule{display:inline-block;font-size:15px;color:#dfe3ec;background:rgba(255,255,255,.06);
    border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:5px 12px;margin-bottom:14px}
  .${P}-ctrls{display:flex;gap:10px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
  .${P}-runs{font-size:15px;color:#8b93a7}
  .${P}-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .${P}-col{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#0c0f16;padding:16px;min-height:300px;position:relative}
  .${P}-col h3{margin:0 0 4px;font-size:17px}
  .${P}-col .sub{font-size:14px;color:#7b8296;margin-bottom:12px}
  .${P}-agent{display:flex;align-items:center;gap:10px;margin-bottom:10px}
  .${P}-face{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;
    color:${accent};background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);flex:0 0 auto}
  .${P}-dice{font-size:14px;color:#8b93a7}
  .${P}-log{font-size:15px;line-height:1.55;min-height:120px}
  .${P}-log .row{padding:3px 0;opacity:0;transform:translateX(-6px);transition:.3s}
  .${P}-log .row.show{opacity:1;transform:none}
  .${P}-bubble{background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.4);color:#ffd5d5;
    border-radius:10px;padding:6px 10px;display:inline-block;font-size:14px}
  .${P}-ok{color:${GREEN}} .${P}-bad{color:${RED}} .${P}-dim{color:#8b93a7}
  .${P}-gate{color:${accent};font-weight:600}
  .${P}-tok{margin-top:12px;font-size:13px;color:#8b93a7}
  .${P}-tok b{font-family:var(--font-en,monospace);font-size:18px;color:#e8ebf2}
  .${P}-chart{margin-top:16px;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 16px;background:rgba(255,255,255,.02)}
  .${P}-chart .lab{font-size:13px;color:#8b93a7;margin-bottom:10px;letter-spacing:.06em}
  .${P}-crow{display:flex;align-items:center;gap:10px;margin:8px 0;font-size:14px}
  .${P}-crow .name{width:80px;flex:0 0 auto}
  .${P}-cbar{flex:1;height:14px;border-radius:8px;background:rgba(255,255,255,.06);overflow:hidden}
  .${P}-cbar>i{display:block;height:100%;border-radius:8px;transition:width .5s ease}
  .${P}-crow .n{width:56px;text-align:right;font-family:var(--font-en,monospace)}
  .${P}-stack{margin-top:18px;border-top:1px solid rgba(255,255,255,.1);padding-top:16px}
  .${P}-stackhead{display:flex;align-items:center;gap:10px;margin-bottom:12px}
  .${P}-stackhead .t{font-size:16px;font-weight:700}
  .${P}-layers{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
  .${P}-layer{border:1px dashed rgba(255,255,255,.18);border-radius:12px;padding:14px;cursor:pointer;transition:.2s;background:rgba(255,255,255,.02)}
  .${P}-layer:hover{border-color:${accent}}
  .${P}-layer.on{border-style:solid;border-color:${accent};background:rgba(56,225,198,.08)}
  .${P}-layer .lt{font-weight:700;font-size:15px;margin-bottom:2px}
  .${P}-layer .ld{font-size:13px;color:#8b93a7;margin-bottom:10px}
  .${P}-meter{font-size:12px;color:#9aa0b0;display:flex;justify-content:space-between;margin:3px 0}
  .${P}-mbar{height:6px;border-radius:6px;background:rgba(255,255,255,.08);overflow:hidden;margin-bottom:6px}
  .${P}-mbar>i{display:block;height:100%;border-radius:6px}
  .${P}-hint{font-size:14px;color:#aeb4c4;margin-top:10px;min-height:20px}
  @media(max-width:820px){.${P}-cols{grid-template-columns:1fr}.${P}-layers{grid-template-columns:1fr}}
  `
  document.head.appendChild(style)

  const svg = (p, s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block">${p}</svg>`
  const ICO = {
    robot: '<rect x="5" y="8" width="14" height="11" rx="2.5"/><path d="M12 5v3"/><circle cx="12" cy="4" r="1" fill="currentColor" stroke="none"/><circle cx="9.5" cy="13" r="1.2" fill="currentColor" stroke="none"/><circle cx="14.5" cy="13" r="1.2" fill="currentColor" stroke="none"/><path d="M9.5 16.5h5"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.1" fill="currentColor" stroke="none"/>',
    ruler: '<rect x="3" y="8" width="18" height="8" rx="1"/><path d="M7 8v3"/><path d="M11 8v4"/><path d="M15 8v3"/>',
    gate: '<rect x="4" y="5" width="16" height="14" rx="1"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M16 5v14"/>',
    bubble: '<path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>',
    ban: '<circle cx="12" cy="12" r="8"/><path d="M6.5 6.5l11 11"/>',
    uturn: '<path d="M9 7H6a3 3 0 0 0 0 6h9"/><path d="M12 4 9 7l3 3"/>',
    brick: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 9.7h18M3 14.3h18M9 5v4.7M15 5v4.7M6 9.7v4.6M12 9.7v4.6M18 9.7v4.6M9 14.3V19M15 14.3V19"/>',
  }

  const RATIONALIZATIONS = [
    '這個 case 太簡單，測過就好',
    '我已經手動測過了',
    '這次情況不一樣',
    '只是 typo 修正不需要測試',
    '先寫 code，等等再補測試',
  ]

  function meter(name, v, col) {
    return `<div class="${P}-meter"><span>${name}</span><span>${v}%</span></div>
      <div class="${P}-mbar"><i style="width:${v}%;background:${col}"></i></div>`
  }

  const root = document.createElement('div')
  root.className = `${P}-root`
  root.innerHTML = `
    <div class="${P}-guide">同一條紀律，兩種執法方式。按 <b>派任務</b>，讓模擬 agent 去寫 production code — 看誰真的擋得住。</div>
    <div class="${P}-rule">${svg(ICO.ruler, 17)} 規則：<b>先寫測試，再寫實作</b></div>
    <div class="${P}-ctrls">
      <button class="demo-btn primary" data-act="run">▶ 派任務</button>
      <button class="demo-btn" data-act="x10">連派 10 次</button>
      <button class="demo-btn" data-act="reset">重置</button>
      <span class="${P}-runs">已派任務 <b data-runs>0</b> 次</span>
    </div>
    <div class="${P}-cols">
      <div class="${P}-col">
        <h3>Prompt 派 <span class="${P}-dim" style="font-size:13px">（說服 · 修辭）</span></h3>
        <div class="sub">CLAUDE.md 寫了紀律，但遵守與否是機率問題</div>
        <div class="${P}-agent"><div class="${P}-face">${svg(ICO.robot, 26)}</div><div class="${P}-dice">${svg(ICO.dice, 16)} 每次擲骰決定聽不聽話</div></div>
        <div class="${P}-log" data-log="prompt"></div>
        <div class="${P}-tok">本輪 token：<b data-t="prompt">0</b></div>
      </div>
      <div class="${P}-col">
        <h3>Hook 派 <span class="${P}-dim" style="font-size:13px">（約束 · 工程）</span></h3>
        <div class="sub">tool boundary 有一道 exit-2 閘門，繞不過去</div>
        <div class="${P}-agent"><div class="${P}-face">${svg(ICO.robot, 26)}</div><div class="${P}-gate">${svg(ICO.gate, 16)} tool boundary 閘門啟動</div></div>
        <div class="${P}-log" data-log="hook"></div>
        <div class="${P}-tok">本輪 token：<b data-t="hook">0</b></div>
      </div>
    </div>
    <div class="${P}-chart">
      <div class="lab">累積 TOKEN 成本（連派愈多，差距愈大）</div>
      <div class="${P}-crow"><span class="name">Prompt 派</span>
        <div class="${P}-cbar"><i data-c="prompt" style="background:${RED}"></i></div><span class="n" data-cn="prompt">0</span></div>
      <div class="${P}-crow"><span class="name">Hook 派</span>
        <div class="${P}-cbar"><i data-c="hook" style="background:${GREEN}"></i></div><span class="n" data-cn="hook">0</span></div>
    </div>
    <div class="${P}-stack">
      <div class="${P}-stackhead"><span class="t">${svg(ICO.brick, 18)} Enforcement Stack</span>
        <span class="${P}-dim" style="font-size:13px">— 把「先寫測試」這條規則放在哪一層？點一層看看</span></div>
      <div class="${P}-layers">
        <div class="${P}-layer" data-layer="L1"><div class="lt">L1 · Harness</div><div class="ld">prompt 說服模型</div>
          ${meter('強度', 33, RED)}${meter('成本', 15, GREEN)}${meter('靈活度', 95, accent)}</div>
        <div class="${P}-layer" data-layer="L2"><div class="lt">L2 · Tools（Hook）</div><div class="ld">程式碼限制模型</div>
          ${meter('強度', 92, GREEN)}${meter('成本', 45, '#facc15')}${meter('靈活度', 50, accent)}</div>
        <div class="${P}-layer" data-layer="L3"><div class="lt">L3 · Model</div><div class="ld">權重塑造模型</div>
          ${meter('強度', 100, GREEN)}${meter('成本', 100, RED)}${meter('靈活度', 8, RED)}</div>
      </div>
      <div class="${P}-hint" data-hint>個人偏好用 L1，團隊紀律用 L2；L3 是 Anthropic 的領地，我們碰不了。</div>
    </div>`
  el.appendChild(root)

  const timers = new Set()
  const after = (ms, fn) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }

  const logP = root.querySelector('[data-log="prompt"]')
  const logH = root.querySelector('[data-log="hook"]')
  const runsEl = root.querySelector('[data-runs]')
  let runs = 0, cumP = 0, cumH = 0, busy = false

  function addRow(log, html, delay) {
    const r = document.createElement('div')
    r.className = 'row'
    r.innerHTML = html
    log.appendChild(r)
    after(delay, () => r.classList.add('show'))
  }

  function animTok(which, target, delay) {
    after(delay, () => {
      const elT = root.querySelector(`[data-t="${which}"]`)
      let v = 0
      const iv = setInterval(() => {
        v++; elT.textContent = v * 40
        if (v >= target) { clearInterval(iv); timers.delete(iv) }
      }, 45)
      timers.add(iv)
    })
  }

  function updateChart() {
    const max = Math.max(cumP, cumH, 1) * 40
    root.querySelector('[data-c="prompt"]').style.width = (cumP * 40 / max * 100) + '%'
    root.querySelector('[data-c="hook"]').style.width = (cumH * 40 / max * 100) + '%'
    root.querySelector('[data-cn="prompt"]').textContent = cumP * 40
    root.querySelector('[data-cn="hook"]').textContent = cumH * 40
  }

  function runOnce(onDone) {
    logP.innerHTML = ''; logH.innerHTML = ''
    const obeys = Math.random() < 0.45
    let tP, d = 0
    const step = 260

    if (obeys) {
      addRow(logP, `<span class="${P}-ok">✓ 先寫測試</span> <span class="${P}-dim">test_fix.py</span>`, d += step)
      addRow(logP, `<span class="${P}-ok">✓ 寫實作，測試綠燈</span>`, d += step)
      tP = 3
    } else {
      const excuse = RATIONALIZATIONS[(Math.random() * RATIONALIZATIONS.length) | 0]
      addRow(logP, `<span class="${P}-bubble">${svg(ICO.bubble, 15)}「${excuse}」</span>`, d += step)
      addRow(logP, `<span class="${P}-bad">✗ 跳過測試，直接寫 code</span>`, d += step)
      addRow(logP, `<span class="${P}-bad">✗ 跑出 bug → 寫 fix</span>`, d += step)
      addRow(logP, `<span class="${P}-bad">✗ 又壞了 → 再 fix</span>`, d += step)
      addRow(logP, `<span class="${P}-dim">…bad branch 一路暴走</span>`, d += step)
      tP = 12
    }
    animTok('prompt', tP, d + 200)

    let dh = 0
    addRow(logH, `<span class="${P}-dim">agent 想直接寫 code…</span>`, dh += step)
    addRow(logH, `<span class="${P}-gate">${svg(ICO.gate, 15)} tool call 撞上 boundary</span>`, dh += step)
    addRow(logH, `<span class="${P}-bad">${svg(ICO.ban, 15)} exit 2：先寫測試再來</span>`, dh += step)
    addRow(logH, `<span class="${P}-ok">${svg(ICO.uturn, 15)} 被迫轉向 → 先寫測試</span>`, dh += step)
    addRow(logH, `<span class="${P}-ok">✓ 寫實作，測試綠燈</span>`, dh += step)
    const tH = 4
    animTok('hook', tH, dh + 200)

    cumP += tP; cumH += tH
    updateChart()
    after(Math.max(d, dh) + 400, () => onDone && onDone())
  }

  function bump() { runs++; runsEl.textContent = runs }

  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]')
    if (btn) {
      const act = btn.dataset.act
      if (act === 'reset') {
        timers.forEach(t => { clearTimeout(t); clearInterval(t) }); timers.clear()
        runs = 0; cumP = 0; cumH = 0; busy = false
        runsEl.textContent = 0; logP.innerHTML = ''; logH.innerHTML = ''
        root.querySelector('[data-t="prompt"]').textContent = 0
        root.querySelector('[data-t="hook"]').textContent = 0
        updateChart(); return
      }
      if (busy) return
      if (act === 'run') { busy = true; bump(); runOnce(() => busy = false) }
      if (act === 'x10') {
        busy = true
        let n = 0
        const loop = () => { if (n++ >= 10) { busy = false; return } bump(); runOnce(loop) }
        loop()
      }
      return
    }
    const layer = e.target.closest('[data-layer]')
    if (layer) {
      root.querySelectorAll(`.${P}-layer`).forEach(l => l.classList.toggle('on', l === layer))
      const hint = {
        L1: 'L1 說服模型：便宜、超靈活，但只是統計性有效 — 合規率約 33%→72%，永遠有非零機率被繞過。',
        L2: 'L2 限制模型：Hook 攔在 tool boundary，強、可靠、失敗成本 bounded；代價是要寫程式、彈性下降。',
        L3: 'L3 塑造模型：藏在權重裡最強，但成本最高、最不靈活 — 那是 Anthropic 的領地，我們碰不了。',
      }[layer.dataset.layer]
      root.querySelector('[data-hint]').textContent = hint
    }
  })

  updateChart()

  return () => {
    timers.forEach(t => { clearTimeout(t); clearInterval(t) }); timers.clear()
    style.remove()
    el.innerHTML = ''
  }
}
