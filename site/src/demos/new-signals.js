// Demo：方向歪了？拉新訊號進來 — DemoStage 導演版
// 6 拍：跑管線出歪的 output｜砍掉重跑＝賭運氣｜拉新訊號開新路｜對照 diff 整合回主線｜第一個 tool 是 web search｜sandbox 自由救援。
import { createStage, pop, shake, enterFly, countUp } from './_stage.js'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#ff6b81'
  const OK = '#4ade80', BAD = '#f87171', BLUE = '#5b8cff', PUR = '#b98bff'

  const NODES = ['需求拆解', 'Scaffolding', '工具呼叫', '分析', '產出草稿']
  const FLAWS = [
    { name: '市場分析', src: 'web search', row: '市場分析：<span class="ns-flaw">僅憑模型知識、缺外部佐證</span>', fix: '補上即時財報 + 3 篇近月報導交叉驗證' },
    { name: 'API 設計', src: 'security', row: 'API 設計：<span class="ns-flaw">錯誤處理與權限檢查未覆蓋</span>', fix: '補齊 authz 檢查、輸入驗證、rate limit' },
    { name: '行程規劃', src: '外部參考', row: '行程規劃：<span class="ns-flaw">只排自家想像、沒對照熱門選項</span>', fix: '對照 KKday / Klook 熱門行程抓 3 個重點' },
  ]

  const style = document.createElement('style')
  style.textContent = `
  .ns-pipewrap{margin-bottom:16px}
  .ns-pipehd{font-size:15px;letter-spacing:.08em;color:#8a90a2;margin-bottom:8px}
  .ns-keep{display:inline-block;margin-left:10px;font-size:15px;color:${OK};border:1px solid ${OK}55;border-radius:20px;padding:2px 10px;opacity:0;transition:opacity .3s}
  .ns-keep.show{opacity:1}
  .ns-pipe{display:flex;align-items:center;gap:0}
  .ns-node{flex:1;text-align:center;padding:10px 6px;border:1px solid rgba(255,255,255,.14);border-radius:10px;font-size:15px;color:#8a90a2;background:rgba(255,255,255,.03);transition:all .3s}
  .ns-node.on{color:#fff;border-color:${BLUE};box-shadow:0 0 14px ${BLUE}55;background:rgba(91,140,255,.12)}
  .ns-arrow{width:24px;text-align:center;color:#5a6072}
  .ns-out{border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:13px 15px;background:rgba(255,255,255,.03);margin-bottom:16px}
  .ns-out h4{margin:0 0 8px;font-size:15.5px;letter-spacing:.1em;color:#aeb3c4}
  .ns-row{font-size:15.5px;line-height:1.6;color:#cfd3de}
  .ns-flaw{color:${BAD};border-bottom:1px dashed ${BAD}}
  .ns-branch{border-left:2px solid ${PUR};padding-left:14px;margin-bottom:16px;opacity:0;max-height:0;overflow:hidden;transition:opacity .4s}
  .ns-branch.show{opacity:1;max-height:600px}
  .ns-sub{display:flex;align-items:center;gap:10px;font-size:15px;color:#e7e9f0;margin-bottom:10px;flex-wrap:wrap}
  .ns-chip{font-size:15px;padding:3px 10px;border-radius:20px;border:1px solid ${PUR}66;color:${PUR};background:${PUR}18}
  .ns-diff{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .ns-diff>div{border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:10px 12px;font-size:15px;line-height:1.5}
  .ns-diff .old{border-color:${BAD}44}.ns-diff .new{border-color:${OK}55}
  .ns-diff .lbl{font-size:14px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:5px;color:#8a90a2}
  .ns-add{color:${OK}}
  .ns-dash{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
  .ns-cell{border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:11px 14px;background:rgba(255,255,255,.03)}
  .ns-cell .k{font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#8a90a2}
  .ns-cell .v{font-size:15px;margin-top:4px;line-height:1.5;color:#cfd3de}
  .ns-tpl{border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:12px 14px;background:rgba(255,255,255,.02);margin-bottom:16px}
  .ns-tpl h4{margin:0 0 8px;font-size:15px;letter-spacing:.1em;text-transform:uppercase;color:#8a90a2}
  .ns-tpl .t{font-size:15px;color:#cfd3de;line-height:1.55;margin:5px 0;font-family:var(--font-en,monospace)}
  .ns-tpl .t b{color:#38e1c6}
  .ns-ctrl{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
  .ns-btn{font-family:var(--font-tc);font-size:15.5px;color:var(--text);background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:999px;padding:9px 16px;cursor:pointer;transition:all .2s}
  .ns-btn:hover:not(:disabled){border-color:var(--text)}
  .ns-btn.primary{background:var(--accent);color:#08090a;border-color:var(--accent);font-weight:600}
  .ns-btn:disabled{opacity:.35;cursor:default}
  .ns-btn.hide{display:none}
  .ns-sel{display:inline-flex;gap:6px;align-items:center;font-size:15.5px;color:#9aa0b0}
  .ns-sel button{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);color:#c7cbd8;border-radius:8px;padding:8px 12px;font-size:15.5px;cursor:pointer;font-family:inherit}
  .ns-sel button.on{border-color:var(--acc,${accent});color:${accent}}
  @media(max-width:760px){.ns-diff,.ns-dash{grid-template-columns:1fr}}
  `
  el.appendChild(style)

  const pipeWrap = document.createElement('div')
  pipeWrap.className = 'ns-pipewrap ds-unit'
  pipeWrap.innerHTML = `<div class="ns-pipehd">主管線（Static Scaffolding）<span class="ns-keep" id="nsKeep">原 context 保留中</span></div><div class="ns-pipe" id="nsPipe"></div>`

  const out = document.createElement('div')
  out.className = 'ns-out ds-unit'
  out.innerHTML = `<h4>OUTPUT</h4><div class="ns-row" id="nsOut">按「跑一次管線」開始</div>`

  const branch = document.createElement('div')
  branch.className = 'ns-branch ds-unit'
  branch.innerHTML = `
    <div class="ns-sub">↳ <span>spawn sub-agent</span><span class="ns-chip" id="nsChip">新訊號</span><span style="color:#8a90a2;font-size:15.5px">帶不同 context 開新路驗證</span></div>
    <div class="ns-diff">
      <div class="old"><div class="lbl">原 output（歪的地方）</div><div id="nsD1"></div></div>
      <div class="new"><div class="lbl">拉回來對照 diff</div><div id="nsD2"></div></div>
    </div>`

  const dash = document.createElement('div')
  dash.className = 'ns-dash ds-unit'
  dash.innerHTML = `
    <div class="ns-cell"><div class="k">砍掉重跑</div><div class="v" id="nsC1">耗時翻倍，新 output 隨機又歪別處 — 賭運氣</div></div>
    <div class="ns-cell"><div class="k">拉新訊號</div><div class="v" id="nsC2">保留成果 + 局部補驗證，最省時且方向收斂</div></div>`

  const tpl = document.createElement('div')
  tpl.className = 'ns-tpl ds-unit'
  tpl.innerHTML = `
    <h4>可複製的救援 prompt 範本</h4>
    <div class="t"><b>[驗證類]</b> 保留目前結論，spawn 一個乾淨 context 的 sub-agent，用 web search 查最新數據交叉驗證上面的分析。</div>
    <div class="t"><b>[卡關類]</b> 去找這個 repo 相關的 GitHub Discussion / Issue，看看別人怎麼解，抓重點回來對照。</div>
    <div class="t"><b>[反思類]</b> 這次修正的原因是什麼？把它寫回 CLAUDE.md / 抽成一個 Skill，讓下次的 Scaffolding 更準。</div>`

  const ctrl = document.createElement('div')
  ctrl.className = 'ns-ctrl ds-unit'
  ctrl.innerHTML = `
    <button class="ns-btn primary hide" data-b="run">跑一次管線</button>
    <button class="ns-btn hide" data-b="rerun" disabled>砍掉重跑</button>
    <button class="ns-btn hide" data-b="signal" disabled>拉新訊號進來</button>
    <button class="ns-btn hide" data-b="merge" disabled>整合回主線</button>
    <div class="ns-sel" style="display:none">訊號來源：
      <button data-s="0" class="on">web search</button><button data-s="1">security</button><button data-s="2">外部參考</button></div>`

  const pipeEl = pipeWrap.querySelector('#nsPipe')
  const keepEl = pipeWrap.querySelector('#nsKeep')
  const outEl = out.querySelector('#nsOut')
  const chipEl = branch.querySelector('#nsChip')
  const d1 = branch.querySelector('#nsD1'), d2 = branch.querySelector('#nsD2')
  const c1 = dash.querySelector('#nsC1'), c2 = dash.querySelector('#nsC2')
  const sel = ctrl.querySelector('.ns-sel')
  const btn = b => ctrl.querySelector(`[data-b="${b}"]`)

  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  let flawIdx = 0, runCount = 0, busy = false, interactive = false, stage

  function renderPipe() { pipeEl.innerHTML = NODES.map((n, i) => `<div class="ns-node" id="nsN${i}">${n}</div>` + (i < NODES.length - 1 ? '<div class="ns-arrow">→</div>' : '')).join('') }
  function clearBranch() { branch.classList.remove('show'); keepEl.classList.remove('show') }

  function runPipeline(done) {
    busy = true; clearBranch(); renderPipe(); outEl.innerHTML = ''
    if (interactive) { btn('rerun').disabled = btn('signal').disabled = btn('run').disabled = true }
    let i = 0
    const step = () => {
      if (i >= NODES.length) {
        outEl.innerHTML = FLAWS[flawIdx].row; enterFly(outEl, { y: 10, dur: 400 })
        busy = false
        if (interactive) { btn('run').disabled = false; btn('rerun').disabled = btn('signal').disabled = false }
        done?.(); return
      }
      const n = document.getElementById('nsN' + i); n.classList.add('on'); pop(n); i++; T(step, 240)
    }
    T(step, 200)
  }

  function doRerun() {
    if (busy) return
    runCount++; flawIdx = (flawIdx + 1) % FLAWS.length   // 又隨機歪在別處
    setSource(flawIdx)
    c1.innerHTML = `第 ${runCount} 次重跑：耗時 <b style="color:${BAD}">×<span id="nsMul">1</span></b>，方向又歪到「${FLAWS[flawIdx].name}」 — 賭運氣`
    countUp(dash.querySelector('#nsMul'), runCount + 1, { from: runCount, dur: 500, fmt: v => Math.round(v) })
    shake(dash.querySelectorAll('.ns-cell')[0])
    runPipeline()
  }

  function doSignal() {
    if (busy) return
    const f = FLAWS[flawIdx]
    keepEl.classList.add('show')          // 主線 context 不動
    chipEl.textContent = f.src
    d1.innerHTML = f.row
    d2.innerHTML = '<span style="color:#8a90a2">sub-agent 查證中…</span>'
    branch.classList.add('show'); enterFly(branch, { y: 14, dur: 450 })
    T(() => { d2.innerHTML = `<span class="ns-add">＋ ${f.fix}</span>`; pop(d2) }, 650)
    if (interactive) btn('merge').disabled = false
  }

  function doMerge() {
    const f = FLAWS[flawIdx]
    outEl.innerHTML = f.row.replace(/<span class="ns-flaw">.*?<\/span>/, `<span style="color:${OK}">已補：${f.fix}</span>`)
    pop(outEl)
    c2.innerHTML = `已整合：主線 context 不動，只補了「${f.src}」的驗證 — <b style="color:${OK}">一次收斂</b>`
    if (interactive) btn('merge').disabled = true
  }

  function setSource(i) {
    flawIdx = i
    sel.querySelectorAll('button').forEach(b => b.classList.toggle('on', +b.dataset.s === i))
  }

  sel.addEventListener('click', e => { const b = e.target.closest('button'); if (b && interactive) setSource(+b.dataset.s) })
  btn('run').onclick = () => { if (!interactive) return; pop(btn('run')); runCount = 0; runPipeline() }
  btn('rerun').onclick = () => { if (!interactive) return; pop(btn('rerun')); doRerun() }
  btn('signal').onclick = () => { if (!interactive) return; pop(btn('signal')); doSignal() }
  btn('merge').onclick = () => { if (!interactive) return; pop(btn('merge')); doMerge() }

  function showBtns(list) { ctrl.querySelectorAll('.ns-btn').forEach(b => b.classList.toggle('hide', !list.includes(b.dataset.b))) }

  function resetScene() {
    clearT(); busy = false; interactive = false; runCount = 0
    setSource(0); renderPipe(); clearBranch()
    outEl.innerHTML = '按「跑一次管線」開始'
    d1.innerHTML = ''; d2.innerHTML = ''
    c1.innerHTML = '耗時翻倍，新 output 隨機又歪別處 — 賭運氣'
    c2.innerHTML = '保留成果 + 局部補驗證，最省時且方向收斂'
    sel.style.display = 'none'
    showBtns([]); btn('rerun').disabled = btn('signal').disabled = btn('merge').disabled = true
  }
  function startSandboxRun() {
    resetScene(); interactive = true
    sel.style.display = 'inline-flex'
    showBtns(['run', 'rerun', 'signal', 'merge'])
    runPipeline()
  }

  function buildBeats() {
    return [
      { narration: 'Agent 跑完了，但 output <b>方向有點歪</b> — 市場分析只憑模型知識、缺外部佐證。', focus: ['.ns-pipewrap', '.ns-out'], nextLabel: '怎麼救？ →',
        enter() { resetScene(); flawIdx = 0; runPipeline() } },

      { narration: '選項一：<b>砍掉重跑</b> — 耗時翻倍，方向又隨機歪在別處，純粹賭運氣。', focus: ['.ns-out', '.ns-dash'], nextLabel: '有更好的嗎？ →',
        enter() { resetScene(); flawIdx = 0; runPipeline(() => T(() => doRerun(), 700)) } },

      { narration: '選項二：<b>拉新訊號進來</b> — 主線 context 不動，spawn 一個 sub-agent 帶不同 context 開新路驗證。', focus: ['.ns-pipewrap', '.ns-branch'], nextLabel: '結果呢？ →',
        enter() { resetScene(); flawIdx = 0; runPipeline(() => T(() => doSignal(), 600)) } },

      { narration: '結果拉回來<b>對照 diff</b>，整合回主線 — 主線不動、只補那一塊，<b>一次收斂</b>。', focus: ['.ns-branch', '.ns-dash'], nextLabel: '第一個該學的 tool →',
        enter() { resetScene(); flawIdx = 0; runPipeline(() => { T(() => doSignal(), 500); T(() => doMerge(), 1500) }) } },

      { narration: '該學會的第一個 tool 是 <b>web search</b> — 模型知識凍結在過去，新訊號要你主動拉進來。', focus: ['.ns-tpl'], nextLabel: '換我來救 →',
        enter() { resetScene(); tpl.querySelectorAll('.t').forEach((t, i) => enterFly(t, { y: 12, dur: 400, delay: i * 140 })) } },

      { narration: '換你救援 — <b>跑管線</b>、選訊號來源，比較<b>砍掉重跑</b>與<b>拉新訊號 + 整合</b>兩條路。', sandbox: true,
        enter() { startSandboxRun() } },
    ]
  }

  stage = createStage(el, ctx, { beats: buildBeats() })
  stage.body.append(pipeWrap, out, branch, dash, tpl, ctrl)

  return () => { clearT(); stage.destroy(); style.remove() }
}
