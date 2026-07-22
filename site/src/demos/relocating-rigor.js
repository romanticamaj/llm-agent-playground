// relocating-rigor — 嚴謹度搬家：中間逐行 review → 往上游 spec、下游 verification 兩頭搬
export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#ff6b81'
  const OK = '#4ade80', BAD = '#f87171', BLUE = '#5b8cff', PUR = '#b98bff'
  const AGENT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="8.5" width="14" height="10.5" rx="2.5"/><path d="M12 8.5V5"/><circle cx="12" cy="3.6" r="1.2"/><circle cx="9.5" cy="13.5" r="1.1"/><circle cx="14.5" cy="13.5" r="1.1"/></svg>'
  const WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4 20 18.5 4 18.5Z"/><path d="M12 9.5v4.5"/><circle cx="12" cy="16.8" r=".9" fill="currentColor" stroke="none"/></svg>'
  const SHIELD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 19 6v5.2c0 4.3-3 7.2-7 8.6-4-1.4-7-4.3-7-8.6V6Z"/><path d="M9 11.6 11.2 13.9 15.2 9.4"/></svg>'

  const style = document.createElement('style')
  style.textContent = `
  .rr-wrap{position:absolute;inset:0;--acc:${accent};display:flex;flex-direction:column;gap:14px;padding:20px 24px;color:#e7e9f0;font-family:var(--font-tc,'Noto Sans TC',sans-serif);box-sizing:border-box}
  .rr-lead{font-size:17px;color:#c7cbd8;line-height:1.55}.rr-lead b{color:var(--acc)}
  .rr-mode{font-size:14px;color:#8a90a2;margin-left:6px}
  .rr-stage{flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:14px;min-height:0}
  .rr-seg{position:relative;display:flex;flex-direction:column;border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(255,255,255,.02);padding:14px;overflow:hidden}
  .rr-seg h3{margin:0;font-size:16px}.rr-seg .sub{font-size:13px;color:#8a90a2;margin-top:2px}
  .rr-bar{margin-top:10px;height:14px;border-radius:8px;background:rgba(255,255,255,.06);overflow:hidden}
  .rr-fill{height:100%;width:10%;border-radius:8px;transition:width 1s cubic-bezier(.5,0,.3,1)}
  .rr-up .rr-fill{background:linear-gradient(90deg,${OK},${OK}aa)}
  .rr-mid .rr-fill{background:linear-gradient(90deg,${accent},${accent}aa)}
  .rr-down .rr-fill{background:linear-gradient(90deg,${BLUE},${PUR})}
  .rr-pct{font-size:13px;color:#9aa0b0;margin-top:5px}
  .rr-body{flex:1;margin-top:10px;position:relative;overflow:hidden}
  .rr-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
  .rr-list li{font-size:14px;color:#aeb3c4;padding:6px 9px;border:1px solid rgba(255,255,255,.09);border-radius:8px;opacity:.35;transition:opacity .5s,border-color .5s}
  .rr-list li.lit{opacity:1;border-color:rgba(255,255,255,.22);color:#dfe2ea}
  .rr-queue{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;opacity:0;transition:opacity .4s}
  .rr-queue.show{opacity:1}
  .rr-queue .n{font-size:38px;font-weight:800;color:${BAD};font-family:var(--font-en,monospace)}
  .rr-queue .l{font-size:13px;color:${BAD};letter-spacing:.08em}
  .rr-agents{display:flex;gap:8px;margin-top:8px;opacity:0;transition:opacity .6s}
  .rr-agents.show{opacity:1}
  .rr-ag{flex:1;border:1px dashed rgba(255,255,255,.25);border-radius:10px;padding:8px;text-align:center;font-size:14px}
  .rr-ag.claude{border-color:${accent}88;color:${accent}}.rr-ag.codex{border-color:${TEALc()}88;color:${TEALc()}}
  .rr-ag .cx{display:block;font-size:12px;color:#8a90a2;margin-top:3px}
  .rr-fall{position:absolute;left:0;right:0;top:-30px;height:24px;border-radius:6px;font-size:13px;display:flex;gap:5px;align-items:center;justify-content:center;color:#dfe2ea;background:rgba(91,140,255,.18);border:1px solid rgba(91,140,255,.4)}
  .rr-fall svg{width:15px;height:15px;flex:none}
  .rr-fall.flaw{background:rgba(248,113,113,.16);border-color:${BAD}}
  .rr-dialog{position:absolute;left:8px;right:8px;bottom:8px;padding:9px 11px;border-radius:9px;font-size:14.5px;line-height:1.4;display:flex;gap:6px;align-items:center;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.2);opacity:0;transition:opacity .3s}
  .rr-dialog svg{width:17px;height:17px;flex:none}
  .rr-dialog.show{opacity:1}
  .rr-ctrl{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
  .rr-tog{display:inline-flex;align-items:center;gap:8px;font-size:14px;color:#9aa0b0}
  .rr-tog .seg{display:inline-flex;border:1px solid rgba(255,255,255,.14);border-radius:9px;overflow:hidden}
  .rr-tog .seg button{background:transparent;border:0;color:#aeb3c4;padding:8px 14px;font-size:15px;cursor:pointer;font-family:inherit}
  .rr-tog .seg button.on{background:var(--acc);color:#05060a;font-weight:700}
  .rr-obs{font-size:17px;color:#c7cbd8;line-height:1.55;border-left:2px solid var(--acc);padding-left:12px;min-height:22px}
  @media(max-width:820px){.rr-stage{grid-template-columns:1fr;overflow:auto}.rr-seg{min-height:150px}}
  `
  document.head.appendChild(style)
  function TEALc() { return '#38e1c6' }

  const UP = ['spec 對不對？', '業務需求抓到了嗎？', 'intention 有被正確翻譯嗎？', '角色：editor / architect']
  const MID = ['逐行讀 diff', '這裡會不會 race？', 'edge case 顧到了嗎？', '兩人開 DiffMerge 一行行看']
  const DOWN = ['Conceptual Map 看圖不看 code', 'Acceptance Metrics 先定義', 'Cross Model 換 model 看', 'Cross Context 乾淨 session']

  el.innerHTML = `
  <div class="rr-wrap">
    <div class="rr-lead">嚴謹度不會消失，只是<b>換位置</b>。開場是「10 年前群暉模式」——嚴謹全堆在中間逐行 review，AI 產出暴增後你成了瓶頸。按 <b>搬家</b> 看它往兩頭流。<span class="rr-mode" id="rrMode">目前：群暉模式</span></div>
    <div class="rr-stage">
      <div class="rr-seg rr-up"><h3>上游 · Spec / Intention</h3><div class="sub">無法外包，人工做</div>
        <div class="rr-bar"><div class="rr-fill" id="rrFU"></div></div><div class="rr-pct" id="rrPU">10%</div>
        <div class="rr-body"><ul class="rr-list" id="rrLU"></ul></div></div>
      <div class="rr-seg rr-mid"><h3>中游 · 逐行 Code Review</h3><div class="sub">AI 時代交給 agent</div>
        <div class="rr-bar"><div class="rr-fill" id="rrFM" style="width:80%"></div></div><div class="rr-pct" id="rrPM">80%</div>
        <div class="rr-body"><ul class="rr-list" id="rrLM"></ul>
          <div class="rr-queue" id="rrQ"><div class="n" id="rrQN">0</div><div class="l">等待佇列 · 瓶頸：你</div></div>
          <div class="rr-agents" id="rrAG"><div class="rr-ag claude">Claude<span class="cx">乾淨 context</span></div><div class="rr-ag codex">Codex<span class="cx">乾淨 context</span></div></div>
        </div></div>
      <div class="rr-seg rr-down"><h3>下游 · Verification</h3><div class="sub">自動化驗證</div>
        <div class="rr-bar"><div class="rr-fill" id="rrFD"></div></div><div class="rr-pct" id="rrPD">10%</div>
        <div class="rr-body"><ul class="rr-list" id="rrLD"></ul>
          <div class="rr-dialog" id="rrDlg"></div></div></div>
    </div>
    <div class="rr-ctrl">
      <button class="demo-btn primary" id="rrMove">搬家 →</button>
      <button class="demo-btn" id="rrReset">重來</button>
      <div class="rr-tog">Acceptance Metrics：
        <div class="seg" id="rrMet"><button data-m="clear" class="on">指標明確</button><button data-m="vague">指標含糊</button></div>
      </div>
      <button class="demo-btn" id="rrFlaw">丟一張瑕疵 commit</button>
    </div>
    <div class="rr-obs" id="rrObs">中間那條能量條旁的佇列正在越排越長——越資深、看得越仔細，越可能變成拖慢全隊的瓶頸。</div>
  </div>`

  const $ = id => el.querySelector(id)
  const timers = new Set()
  const iv = new Set()
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn() }, ms); timers.add(t); return t }
  const every = (fn, ms) => { const t = setInterval(fn, ms); iv.add(t); return t }
  let moved = false, metric = 'clear', queue = 0, spawnIv = null

  function fillList(ul, items) { ul.innerHTML = items.map(t => `<li>${t}</li>`).join('') }
  fillList($('#rrLU'), UP); fillList($('#rrLM'), MID); fillList($('#rrLD'), DOWN)
  // 開場：中游全亮，兩頭暗
  $('#rrLM').querySelectorAll('li').forEach(li => li.classList.add('lit'))

  function setEnergy(u, m, d) {
    $('#rrFU').style.width = u + '%'; $('#rrPU').textContent = u + '%'
    $('#rrFM').style.width = m + '%'; $('#rrPM').textContent = m + '%'
    $('#rrFD').style.width = d + '%'; $('#rrPD').textContent = d + '%'
  }

  // 瀑布：程式碼卡片持續落下
  function dropCard(flaw) {
    const seg = flaw ? $('.rr-down .rr-body') : $('.rr-mid .rr-body')
    const c = document.createElement('div')
    c.className = 'rr-fall' + (flaw ? ' flaw' : '')
    if (flaw) { c.innerHTML = WARN; const s = document.createElement('span'); s.textContent = '未做完的 commit'; c.appendChild(s) }
    else c.textContent = 'AI 產出 +1'
    seg.appendChild(c)
    const dur = moved ? 900 : 1500
    c.animate([{ top: '-26px' }, { top: (seg.clientHeight - 4) + 'px' }], { duration: dur, easing: 'linear', fill: 'forwards' })
    if (!flaw) {
      if (!moved) { // 群嗨模式：卡在中游，佇列 +1
        later(() => { queue++; $('#rrQN').textContent = queue; c.remove() }, dur)
      } else {
        later(() => c.remove(), dur + 100)
      }
    }
    return { el: c, dur }
  }

  function startFlow() {
    if (spawnIv) return
    spawnIv = every(() => dropCard(false), moved ? 700 : 1200)
    $('#rrQ').classList.add('show')
  }

  $('#rrMove').addEventListener('click', () => {
    if (moved) return
    moved = true
    setEnergy(45, 12, 45)
    $('#rrLU').querySelectorAll('li').forEach(li => li.classList.add('lit'))
    $('#rrLD').querySelectorAll('li').forEach(li => li.classList.add('lit'))
    $('#rrLM').querySelectorAll('li').forEach(li => li.classList.remove('lit'))
    $('#rrAG').classList.add('show')
    $('#rrMode').textContent = '目前：搬家後 · 上游 + 下游'
    // 佇列排空
    if (spawnIv) { clearInterval(spawnIv); iv.delete(spawnIv); spawnIv = null }
    const drain = every(() => {
      queue = Math.max(0, queue - 3); $('#rrQN').textContent = queue
      if (queue === 0) { clearInterval(drain); iv.delete(drain); $('#rrQ').classList.remove('show'); startFlow() }
    }, 120)
    $('#rrObs').textContent = '嚴謹往兩頭搬：上游查 spec/intention、下游看 Conceptual Map + Acceptance Metrics + Cross Model/Context，中間掏空由 Claude + Codex 各自在乾淨 context 補上。瀑布順暢流過、佇列消失。'
  })

  $('#rrReset').addEventListener('click', () => {
    iv.forEach(clearInterval); iv.clear(); spawnIv = null
    timers.forEach(clearTimeout); timers.clear()
    el.querySelectorAll('.rr-fall').forEach(n => n.remove())
    moved = false; queue = 0
    setEnergy(10, 80, 10); $('#rrQN').textContent = '0'
    $('#rrQ').classList.remove('show'); $('#rrAG').classList.remove('show'); $('#rrDlg').classList.remove('show')
    $('#rrLU').querySelectorAll('li').forEach(li => li.classList.remove('lit'))
    $('#rrLD').querySelectorAll('li').forEach(li => li.classList.remove('lit'))
    $('#rrLM').querySelectorAll('li').forEach(li => li.classList.add('lit'))
    $('#rrMode').textContent = '目前：群暉模式'
    $('#rrObs').textContent = '中間那條能量條旁的佇列正在越排越長——越資深、看得越仔細，越可能變成拖慢全隊的瓶頸。'
    startFlow()
  })

  $('#rrMet').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return
    metric = b.dataset.m
    $('#rrMet').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b))
  })

  $('#rrFlaw').addEventListener('click', () => {
    const { dur } = dropCard(true)
    const dlg = $('#rrDlg')
    later(() => {
      if (metric === 'vague') {
        dlg.style.borderColor = BAD; dlg.style.color = '#ffd6d6'
        dlg.innerHTML = AGENT; const s1 = document.createElement('span')
        s1.textContent = '「這樣就可以了」— 指標含糊，瑕疵溜過去了'; dlg.appendChild(s1)
      } else {
        dlg.style.borderColor = OK; dlg.style.color = '#c9ffd8'
        dlg.innerHTML = SHIELD; const s2 = document.createElement('span')
        s2.textContent = '指標明確：Acceptance Metrics 不符 → 瑕疵被擋下 ✕'; dlg.appendChild(s2)
      }
      dlg.classList.add('show')
      later(() => dlg.classList.remove('show'), 2600)
    }, dur)
  })

  setEnergy(10, 80, 10)
  startFlow()

  return () => {
    iv.forEach(clearInterval); iv.clear()
    timers.forEach(clearTimeout); timers.clear()
    style.remove(); el.innerHTML = ''
  }
}
