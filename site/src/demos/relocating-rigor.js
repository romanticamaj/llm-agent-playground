// Relocating Rigor — 嚴謹度搬家 · DemoStage 導演版
// 6 拍：群暉模式嚴謹全堆中間｜AI 產出暴增中游佇列爆「瓶頸：你」｜搬家能量流向兩頭｜
//        中間掏空由 Cross Model/Context 補上｜Acceptance Metrics 明確擋下 vs 含糊溜過｜sandbox。
import { createStage, pop, shake } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const OK = '#4ade80', BAD = '#f87171', BLUE = '#5b8cff', PUR = '#b98bff', TEAL = '#38e1c6'

export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#ff6b81'
  const AGENT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="8.5" width="14" height="10.5" rx="2.5"/><path d="M12 8.5V5"/><circle cx="12" cy="3.6" r="1.2"/><circle cx="9.5" cy="13.5" r="1.1"/><circle cx="14.5" cy="13.5" r="1.1"/></svg>'
  const WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 20 18.5 4 18.5Z"/><path d="M12 9.5v4.5"/><circle cx="12" cy="16.8" r=".9" fill="currentColor" stroke="none"/></svg>'
  const SHIELD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 19 6v5.2c0 4.3-3 7.2-7 8.6-4-1.4-7-4.3-7-8.6V6Z"/><path d="M9 11.6 11.2 13.9 15.2 9.4"/></svg>'

  const UP = ['spec 對不對？', '業務需求抓到了嗎？', 'intention 有被正確翻譯嗎？', '角色：editor / architect']
  const MID = ['逐行讀 diff', '這裡會不會 race？', 'edge case 顧到了嗎？', '兩人開 DiffMerge 一行行看']
  const DOWN = ['Conceptual Map 看圖不看 code', 'Acceptance Metrics 先定義', 'Cross Model 換 model 看', 'Cross Context 乾淨 session']

  const style = document.createElement('style')
  style.textContent = `
  .rr-stage{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:14px}
  .rr-seg{position:relative;display:flex;flex-direction:column;border:1px solid var(--line);border-radius:14px;
    background:rgba(255,255,255,.02);padding:14px;overflow:hidden;min-height:250px}
  .rr-seg h3{margin:0;font-size:16px}.rr-seg .sub{font-size:13px;color:var(--text-dim);margin-top:2px}
  .rr-bar{margin-top:10px;height:14px;border-radius:8px;background:rgba(255,255,255,.06);overflow:hidden}
  .rr-fill{height:100%;width:10%;border-radius:8px;transition:width 1s cubic-bezier(.5,0,.3,1)}
  .rr-up .rr-fill{background:linear-gradient(90deg,${OK},${OK}aa)}
  .rr-mid .rr-fill{background:linear-gradient(90deg,${accent},${accent}aa)}
  .rr-down .rr-fill{background:linear-gradient(90deg,${BLUE},${PUR})}
  .rr-pct{font-size:13px;color:var(--text-dim);margin-top:5px}
  .rr-body{flex:1;margin-top:10px;position:relative;overflow:hidden}
  .rr-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
  .rr-list li{font-size:13.5px;color:var(--text-dim);padding:6px 9px;border:1px solid var(--line);border-radius:8px;
    opacity:.32;transition:opacity .5s,border-color .5s}
  .rr-list li.lit{opacity:1;border-color:rgba(255,255,255,.22);color:var(--text)}
  .rr-queue{position:absolute;left:50%;top:52%;transform:translate(-50%,-50%);text-align:center;opacity:0;transition:opacity .4s}
  .rr-queue.show{opacity:1}
  .rr-queue .n{font-size:38px;font-weight:800;color:${BAD};font-family:var(--font-mono)}
  .rr-queue .l{font-size:13px;color:${BAD};letter-spacing:.06em}
  .rr-agents{display:flex;gap:8px;margin-top:8px;opacity:0;transition:opacity .6s}
  .rr-agents.show{opacity:1}
  .rr-ag{flex:1;border:1px dashed rgba(255,255,255,.25);border-radius:10px;padding:8px;text-align:center;font-size:14px}
  .rr-ag.claude{border-color:${accent}88;color:${accent}}.rr-ag.codex{border-color:${TEAL}88;color:${TEAL}}
  .rr-ag .cx{display:block;font-size:12px;color:var(--text-dim);margin-top:3px}
  .rr-fall{position:absolute;left:8px;right:8px;top:-30px;height:24px;border-radius:6px;font-size:13px;
    display:flex;gap:5px;align-items:center;justify-content:center;color:var(--text);
    background:${BLUE}2e;border:1px solid ${BLUE}66}
  .rr-fall svg{width:15px;height:15px;flex:none}
  .rr-fall.flaw{background:${BAD}22;border-color:${BAD}}
  .rr-dialog{position:absolute;left:8px;right:8px;bottom:8px;padding:9px 11px;border-radius:9px;font-size:14px;
    line-height:1.4;display:flex;gap:6px;align-items:center;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.2);
    opacity:0;transition:opacity .3s}
  .rr-dialog svg{width:17px;height:17px;flex:none}
  .rr-dialog.show{opacity:1}
  .rr-obs{font-size:16px;color:var(--text);line-height:1.55;border-left:2px solid var(--accent);padding-left:12px;
    min-height:22px;margin-bottom:12px}
  .rr-ctrl{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
  .rr-btn{font-family:var(--font-tc);font-size:14px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:9px 17px;cursor:pointer;transition:all .25s ${EASE}}
  .rr-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .rr-btn.primary{background:var(--accent);color:#08090a;border-color:var(--accent);font-weight:600}
  .rr-btn.hide{display:none}
  .rr-tog{display:inline-flex;align-items:center;gap:8px;font-size:14px;color:var(--text-dim)}
  .rr-tog.hide{display:none}
  .rr-seg2{display:inline-flex;border:1px solid var(--line);border-radius:9px;overflow:hidden}
  .rr-seg2 button{background:transparent;border:0;color:var(--text-dim);padding:8px 14px;font-size:14px;
    cursor:pointer;font-family:var(--font-tc)}
  .rr-seg2 button.on{background:var(--accent);color:#05060a;font-weight:700}
  @media(max-width:820px){.rr-stage{grid-template-columns:1fr}}
  `
  el.appendChild(style)

  const scene = document.createElement('div')
  scene.innerHTML = `
    <div class="rr-obs"></div>
    <div class="rr-stage">
      <div class="rr-seg rr-up ds-unit"><h3>上游 · Spec / Intention</h3><div class="sub">無法外包，人工做</div>
        <div class="rr-bar"><div class="rr-fill fu"></div></div><div class="rr-pct pu">10%</div>
        <div class="rr-body"><ul class="rr-list lu"></ul></div></div>
      <div class="rr-seg rr-mid ds-unit"><h3>中游 · 逐行 Code Review</h3><div class="sub">AI 時代交給 agent</div>
        <div class="rr-bar"><div class="rr-fill fm" style="width:80%"></div></div><div class="rr-pct pm">80%</div>
        <div class="rr-body"><ul class="rr-list lm"></ul>
          <div class="rr-queue q"><div class="n qn">0</div><div class="l">等待佇列 · 瓶頸：你</div></div>
          <div class="rr-agents ag"><div class="rr-ag claude">Claude<span class="cx">乾淨 context</span></div><div class="rr-ag codex">Codex<span class="cx">乾淨 context</span></div></div>
        </div></div>
      <div class="rr-seg rr-down ds-unit"><h3>下游 · Verification</h3><div class="sub">自動化驗證</div>
        <div class="rr-bar"><div class="rr-fill fd"></div></div><div class="rr-pct pd">10%</div>
        <div class="rr-body"><ul class="rr-list ld"></ul><div class="rr-dialog dlg"></div></div></div>
    </div>`

  const ctrls = document.createElement('div')
  ctrls.className = 'rr-ctrl ds-unit'
  ctrls.innerHTML = `
    <button class="rr-btn primary hide" data-b="move">搬家 →</button>
    <button class="rr-btn hide" data-b="flaw">丟一張瑕疵 commit</button>
    <div class="rr-tog hide" data-b="tog">Acceptance Metrics：
      <div class="rr-seg2 met"><button data-m="clear" class="on">指標明確</button><button data-m="vague">指標含糊</button></div>
    </div>
    <button class="rr-btn hide" data-b="reset">重來</button>`

  let stage
  const $ = s => scene.querySelector(s)
  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  function fillList(ul, items) { ul.innerHTML = items.map(t => `<li>${t}</li>`).join('') }
  fillList($('.lu'), UP); fillList($('.lm'), MID); fillList($('.ld'), DOWN)

  let moved = false, metric = 'clear', queue = 0, flowing = false, gen = 0

  function setEnergy(u, m, d) {
    $('.fu').style.width = u + '%'; $('.pu').textContent = u + '%'
    $('.fm').style.width = m + '%'; $('.pm').textContent = m + '%'
    $('.fd').style.width = d + '%'; $('.pd').textContent = d + '%'
  }
  function litList(sel, on) { $(sel).querySelectorAll('li').forEach(li => li.classList.toggle('lit', on)) }

  // 瀑布：AI 產出卡片持續落下
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
      if (!moved) T(() => { queue++; $('.qn').textContent = queue; c.remove() }, dur)
      else T(() => c.remove(), dur + 100)
    }
    return dur
  }
  function spawn(g) {
    if (g !== gen || !flowing) return
    dropCard(false)
    T(() => spawn(g), moved ? 720 : 1200)
  }
  function startFlow() { if (flowing) return; flowing = true; $('.q').classList.add('show'); spawn(gen) }

  function doMove() {
    if (moved) return
    moved = true
    setEnergy(45, 12, 45)
    litList('.lu', true); litList('.ld', true); litList('.lm', false)
    $('.ag').classList.add('show')
    // 佇列排空
    const drain = () => {
      queue = Math.max(0, queue - 3); $('.qn').textContent = queue
      if (queue > 0) T(drain, 110)
      else $('.q').classList.remove('show')
    }
    drain()
    $('.rr-obs').textContent = '嚴謹往兩頭搬：上游查 spec/intention、下游看 Conceptual Map + Acceptance Metrics + Cross Model/Context，中間掏空由 Claude + Codex 各自在乾淨 context 補上。'
  }

  function flawCommit() {
    const dur = dropCard(true)
    const dlg = $('.dlg')
    T(() => {
      if (metric === 'vague') {
        dlg.style.borderColor = BAD; dlg.style.color = '#ffd6d6'
        dlg.innerHTML = AGENT; const s = document.createElement('span')
        s.textContent = '「這樣就可以了」— 指標含糊，瑕疵溜過去了'; dlg.appendChild(s)
      } else {
        dlg.style.borderColor = OK; dlg.style.color = '#c9ffd8'
        dlg.innerHTML = SHIELD; const s = document.createElement('span')
        s.textContent = 'Acceptance Metrics 不符 → 瑕疵被擋下'; dlg.appendChild(s)
        pop($('.rr-down'))
      }
      dlg.classList.add('show')
      T(() => dlg.classList.remove('show'), 2400)
    }, dur)
  }

  function showBtns(list) { ctrls.querySelectorAll('[data-b]').forEach(b => b.classList.toggle('hide', !list.includes(b.dataset.b))) }
  function setMetric(m) { metric = m; ctrls.querySelectorAll('.met button').forEach(x => x.classList.toggle('on', x.dataset.m === m)) }

  ctrls.querySelector('[data-b="move"]').onclick = e => { pop(e.currentTarget); doMove() }
  ctrls.querySelector('[data-b="flaw"]').onclick = e => { pop(e.currentTarget); flawCommit() }
  ctrls.querySelector('[data-b="reset"]').onclick = e => { pop(e.currentTarget); startSandboxRun() }
  ctrls.querySelector('.met').onclick = e => { const b = e.target.closest('button'); if (b) setMetric(b.dataset.m) }

  function resetScene() {
    clearT(); gen++; flowing = false; moved = false; queue = 0
    el.querySelectorAll('.rr-fall').forEach(n => n.remove())
    setEnergy(10, 80, 10); $('.qn').textContent = '0'
    $('.q').classList.remove('show'); $('.ag').classList.remove('show'); $('.dlg').classList.remove('show')
    litList('.lu', false); litList('.ld', false); litList('.lm', true)
    $('.rr-obs').textContent = '10 年前群暉模式：嚴謹全堆在中間逐行 review。'
    showBtns([])
  }

  function startSandboxRun() {
    resetScene(); setMetric('clear')
    $('.rr-obs').textContent = '換你玩：按「搬家」把嚴謹推向兩頭，切「指標明確 / 含糊」再「丟瑕疵 commit」看差別。'
    showBtns(['move', 'flaw', 'tog', 'reset']); startFlow()
  }

  function buildBeats() {
    return [
      { narration: '嚴謹度不會消失，只是<b>換位置</b>。開場是 10 年前群暉模式：嚴謹全堆在<b>中間</b>逐行 review。', focus: ['.rr-mid'], nextLabel: 'AI 產出暴增 →',
        enter() { resetScene(); litList('.lm', true); startFlow() } },

      { narration: 'AI 產出暴增，瀑布般落下 — 中游那條佇列<b style="color:' + BAD + '">越排越長</b>。越資深看得越仔細，越可能變成<b>瓶頸：你</b>。', focus: ['.rr-mid'], nextLabel: '搬家 →',
        enter() { resetScene(); litList('.lm', true); startFlow() } },

      { narration: 'Relocating Rigor：嚴謹往<b>兩頭搬</b> — 上游 spec / intention（無法外包），下游 Conceptual Map + Acceptance Metrics 自動驗證。', focus: ['.rr-up', '.rr-down'], nextLabel: '中間誰來補？ →',
        enter() { resetScene(); litList('.lm', true); startFlow(); T(() => doMove(), 900) } },

      { narration: '中間掏空那層交給 <b>Cross Model + Cross Context</b>：Claude、Codex 各自在<b>乾淨 session</b> 只看最終產物 — 寫的人不 review 自己的 code。', focus: ['.rr-mid'], nextLabel: '指標的差別 →',
        enter() { resetScene(); doMove(); startFlow() } },

      { narration: 'Acceptance Metrics 決定成敗：<b style="color:' + BAD + '">指標含糊</b>，AI 用「這樣就可以了」敷衍溜過；<b style="color:' + OK + '">指標明確</b>，瑕疵被擋下。', focus: ['.rr-down'], nextLabel: '換我玩 →',
        enter() {
          resetScene(); doMove(); startFlow()
          setMetric('vague'); T(() => flawCommit(), 700)
          T(() => { setMetric('clear'); flawCommit() }, 3600)
        } },

      { narration: '換你玩 — 按 <b>搬家</b> 把嚴謹推向兩頭，切 <b>指標明確 / 含糊</b> 再 <b>丟瑕疵 commit</b>，看指標明確度擋不擋得住。', sandbox: true,
        enter() { startSandboxRun() } },
    ]
  }

  stage = createStage(el, ctx, { beats: buildBeats() })
  stage.body.append(scene, ctrls)

  return () => { clearT(); stage.destroy(); style.remove() }
}
