// new-signals — 方向歪了：砍掉重跑 vs 拉新訊號進來
export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#ff6b81'
  const OK = '#4ade80', BAD = '#f87171', BLUE = '#5b8cff', TEAL = '#38e1c6', PUR = '#b98bff'

  const style = document.createElement('style')
  style.textContent = `
  .ns-wrap{position:absolute;inset:0;--acc:${accent};display:flex;flex-direction:column;gap:14px;padding:20px 24px;color:#e7e9f0;font-family:var(--font-tc,'Noto Sans TC',sans-serif);box-sizing:border-box}
  .ns-lead{font-size:17px;color:#c7cbd8;line-height:1.55}.ns-lead b{color:var(--acc)}
  .ns-stage{flex:1;position:relative;border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(255,255,255,.02);padding:18px;overflow:auto;min-height:0}
  .ns-pipe{display:flex;align-items:center;gap:0;margin-bottom:6px}
  .ns-node{flex:1;text-align:center;padding:10px 6px;border:1px solid rgba(255,255,255,.14);border-radius:10px;font-size:15px;color:#8a90a2;background:rgba(255,255,255,.03);transition:all .3s}
  .ns-node.on{color:#fff;border-color:${BLUE};box-shadow:0 0 14px ${BLUE}55;background:rgba(91,140,255,.12)}
  .ns-arrow{width:26px;text-align:center;color:#5a6072}
  .ns-keep{display:inline-block;margin-left:10px;font-size:13px;color:${OK};border:1px solid ${OK}55;border-radius:20px;padding:2px 10px;opacity:0;transition:opacity .3s}
  .ns-keep.show{opacity:1}
  .ns-out{margin-top:14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:13px 15px;background:rgba(255,255,255,.03);position:relative}
  .ns-out h4{margin:0 0 8px;font-size:14px;letter-spacing:.1em;color:#aeb3c4}
  .ns-row{font-size:15.5px;line-height:1.6;color:#cfd3de}
  .ns-flaw{color:${BAD};border-bottom:1px dashed ${BAD}}
  .ns-branch{margin-top:14px;border-left:2px solid ${PUR};padding-left:14px;opacity:0;max-height:0;overflow:hidden;transition:opacity .4s}
  .ns-branch.show{opacity:1;max-height:600px}
  .ns-sub{display:flex;align-items:center;gap:10px;font-size:15px;color:#e7e9f0;margin-bottom:10px;flex-wrap:wrap}
  .ns-chip{font-size:13px;padding:3px 10px;border-radius:20px;border:1px solid ${PUR}66;color:${PUR};background:${PUR}18}
  .ns-diff{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .ns-diff>div{border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:10px 12px;font-size:15px;line-height:1.5}
  .ns-diff .old{border-color:${BAD}44}.ns-diff .new{border-color:${OK}55}
  .ns-diff .lbl{font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:5px;color:#8a90a2}
  .ns-add{color:${OK}}
  .ns-ctrl{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
  .ns-sel{display:inline-flex;gap:6px;align-items:center;font-size:14px;color:#9aa0b0}
  .ns-sel button{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);color:#c7cbd8;border-radius:8px;padding:8px 13px;font-size:15px;cursor:pointer;font-family:inherit}
  .ns-sel button.on{border-color:var(--acc);color:var(--acc)}
  .ns-dash{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .ns-cell{border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:11px 14px;background:rgba(255,255,255,.03)}
  .ns-cell .k{font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;color:#8a90a2}
  .ns-cell .v{font-size:15px;margin-top:4px;line-height:1.5;color:#cfd3de}
  .ns-tpl{border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:12px 14px;background:rgba(255,255,255,.02)}
  .ns-tpl h4{margin:0 0 8px;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#8a90a2}
  .ns-tpl .t{font-size:15px;color:#cfd3de;line-height:1.55;margin:5px 0;font-family:var(--font-en,monospace)}
  .ns-tpl .t b{color:${TEAL}}
  @media(max-width:760px){.ns-diff,.ns-dash{grid-template-columns:1fr}}
  `
  document.head.appendChild(style)

  const NODES = ['需求拆解', 'Scaffolding', '工具呼叫', '市場分析', '產出草稿']
  const FLAWS = [
    { name: '市場分析', row: '市場分析：<span class="ns-flaw">僅憑模型知識、缺外部佐證</span>', sig: 'web search 查證', fix: '補上即時財報 + 3 篇近月報導交叉驗證' },
    { name: 'API 設計', row: 'API 設計：<span class="ns-flaw">錯誤處理與權限檢查未覆蓋</span>', sig: 'security review', fix: '補齊 authz 檢查、輸入驗證、rate limit' },
    { name: '行程規劃', row: '行程規劃：<span class="ns-flaw">只排自家想像、沒對照熱門選項</span>', sig: '外部行程參考', fix: '對照 KKday / Klook 熱門行程抓 3 個重點' },
  ]

  el.innerHTML = `
  <div class="ns-wrap">
    <div class="ns-lead">Agent 跑完了，但 output <b>方向有點歪</b>。你有兩種選擇——<b>砍掉重跑</b>（賭運氣）還是<b>拉新訊號進來</b>（保留 context、開新路驗證再對照）？</div>
    <div class="ns-stage">
      <div style="font-size:13.5px;letter-spacing:.08em;color:#8a90a2;margin-bottom:8px">主管線（Static Scaffolding）<span class="ns-keep" id="nsKeep">原 context 保留中</span></div>
      <div class="ns-pipe" id="nsPipe"></div>
      <div class="ns-out"><h4>OUTPUT</h4><div class="ns-row" id="nsOut">按下方「跑一次管線」開始</div></div>
      <div class="ns-branch" id="nsBranch">
        <div class="ns-sub">↳ <span>spawn sub-agent</span><span class="ns-chip" id="nsChip">新訊號</span><span style="color:#8a90a2;font-size:14px">帶不同 context 開新路驗證</span></div>
        <div class="ns-diff">
          <div class="old"><div class="lbl">原 output（歪的地方）</div><div id="nsD1"></div></div>
          <div class="new"><div class="lbl">拉回來對照 diff</div><div id="nsD2"></div></div>
        </div>
        <button class="demo-btn" id="nsMerge" style="margin-top:12px">整合回主線 ✓</button>
      </div>
    </div>
    <div class="ns-ctrl">
      <button class="demo-btn primary" id="nsRun">跑一次管線</button>
      <button class="demo-btn" id="nsRerun" disabled>砍掉重跑</button>
      <button class="demo-btn" id="nsSignal" disabled>拉新訊號進來</button>
      <div class="ns-sel">訊號來源：
        <button data-s="0" class="on">web search</button><button data-s="1">security</button><button data-s="2">外部參考</button>
      </div>
    </div>
    <div class="ns-dash">
      <div class="ns-cell"><div class="k">砍掉重跑</div><div class="v" id="nsC1">耗時翻倍，新 output 隨機又歪別處——賭運氣</div></div>
      <div class="ns-cell"><div class="k">拉新訊號</div><div class="v" id="nsC2">保留成果 + 局部補驗證，最省時且方向收斂</div></div>
    </div>
    <div class="ns-tpl">
      <h4>可複製的救援 prompt 範本</h4>
      <div class="t"><b>[驗證類]</b> 保留目前結論，spawn 一個乾淨 context 的 sub-agent，用 web search 查最新數據交叉驗證上面的分析。</div>
      <div class="t"><b>[卡關類]</b> 去找這個 repo 相關的 GitHub Discussion / Issue，看看別人怎麼解，抓重點回來對照。</div>
      <div class="t"><b>[反思類]</b> 這次修正的原因是什麼？把它寫回 CLAUDE.md / 抽成一個 Skill，讓下次的 Scaffolding 更準。</div>
    </div>
  </div>`

  const $ = id => el.querySelector(id)
  const timers = new Set()
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn() }, ms); timers.add(t); return t }
  let flawIdx = 0, runCount = 0, busy = false

  function renderPipe() {
    $('#nsPipe').innerHTML = NODES.map((n, i) =>
      `<div class="ns-node" id="nsN${i}">${n}</div>` + (i < NODES.length - 1 ? '<div class="ns-arrow">→</div>' : '')
    ).join('')
  }
  function clearBranch() { $('#nsBranch').classList.remove('show'); $('#nsKeep').classList.remove('show'); $('#nsMerge').disabled = false }

  function runPipeline() {
    busy = true; clearBranch(); renderPipe(); $('#nsOut').innerHTML = ''
    $('#nsRerun').disabled = $('#nsSignal').disabled = $('#nsRun').disabled = true
    let i = 0
    const lite = () => {
      if (i >= NODES.length) {
        $('#nsOut').innerHTML = FLAWS[flawIdx].row
        busy = false; $('#nsRun').disabled = false
        $('#nsRerun').disabled = $('#nsSignal').disabled = false
        return
      }
      $('#nsN' + i).classList.add('on'); i++; later(lite, 260)
    }
    later(lite, 200)
  }

  $('#nsRun').addEventListener('click', () => { if (busy) return; runCount = 1; flawIdx = 0; runPipeline() })

  $('#nsRerun').addEventListener('click', () => {
    if (busy) return
    runCount++
    flawIdx = (flawIdx + 1) % FLAWS.length // 隨機又歪在別處
    $('#nsC1').innerHTML = `第 ${runCount} 次重跑：耗時 <b style="color:${BAD}">×${runCount}</b>，方向又歪到「${FLAWS[flawIdx].name}」——賭運氣`
    runPipeline()
  })

  $('#nsSignal').addEventListener('click', () => {
    if (busy) return
    const f = FLAWS[flawIdx]
    $('#nsKeep').classList.add('show')          // 主線不動
    $('#nsChip').textContent = f.sig
    $('#nsD1').innerHTML = f.row
    $('#nsD2').innerHTML = '<span style="color:#8a90a2">sub-agent 查證中…</span>'
    $('#nsBranch').classList.add('show')
    later(() => { $('#nsD2').innerHTML = `<span class="ns-add">＋ ${f.fix}</span>` }, 600)
    $('#nsMerge').disabled = false
  })

  $('#nsMerge').addEventListener('click', () => {
    const f = FLAWS[flawIdx]
    $('#nsOut').innerHTML = f.row.replace(/<span class="ns-flaw">.*?<\/span>/, `<span style="color:${OK}">已補：${f.fix} ✓</span>`)
    $('#nsMerge').disabled = true
    $('#nsC2').innerHTML = `已整合：主線 context 不動，只補了「${f.sig}」的驗證——<b style="color:${OK}">一次收斂</b>`
  })

  el.querySelector('.ns-sel').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return
    el.querySelectorAll('.ns-sel button').forEach(x => x.classList.toggle('on', x === b))
  })

  renderPipe()
  return () => { timers.forEach(clearTimeout); timers.clear(); style.remove(); el.innerHTML = '' }
}
