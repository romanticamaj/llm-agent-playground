// Agent Communication — 作業系統的 IPC 問題重演（DemoStage 導演版）
// 6 拍：① Agent 溝通 = OS IPC，由下往上五層 ② 前一層 constrain 後一層（選 same machine → 灰掉不相容的）
// ③ 一路選到 L3，右側真實系統亮起 ④ L4 傳 raw dump → 接收方 context 爆掉
// ⑤ L4 傳結構化摘要 → 順利進入、任務繼續 ⑥ sandbox 自由決策 + 重來。
import { createStage, pop, shake, confettiBurst } from './_stage.js'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const GREEN = '#4ade80', RED = '#f87171'
  const ico = (d, s = 18) => `<svg class="ac-ico" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
  const P_UPLOAD = '<path d="M4 4h16"/><path d="M12 20V8"/><path d="M8 12l4-4 4 4"/>'
  const P_BOX = '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>'
  const P_BURST = '<path d="M12 2l2.2 5.2L20 5l-2.4 5.6L23 12l-5.4 1.4L20 19l-5.8-2.2L12 22l-2.2-5.2L4 19l2.4-5.6L1 12l5.4-1.4L4 5l5.8 2.2z"/>'

  const style = document.createElement('style')
  style.id = 'ac-css'
  style.textContent = `
    .ac-ico{vertical-align:-.18em;flex:none}
    .ac-body{display:grid;grid-template-columns:1.6fr 1fr;gap:16px;align-items:start}
    .ac-layers{display:flex;flex-direction:column-reverse;gap:8px}
    .ac-layer{background:#101319;border:1px solid #232838;border-radius:10px;padding:10px 12px;transition:opacity .25s}
    .ac-layer.locked{opacity:.4}
    .ac-lhead{display:flex;align-items:baseline;gap:8px;margin-bottom:8px}
    .ac-lhead .n{font-family:var(--font-en,'Space Grotesk');font-size:13px;font-weight:700;color:${accent};background:#161b28;border-radius:6px;padding:1px 7px}
    .ac-lhead h4{margin:0;font-size:16px;font-weight:700}
    .ac-lhead .q{font-size:14px;color:#8b90a2}
    .ac-opts{display:flex;flex-wrap:wrap;gap:7px}
    .ac-opt{font-size:15px;padding:7px 12px;border-radius:8px;border:1px solid #2a3040;background:#181c26;color:#c3c8d8;cursor:pointer;transition:.15s}
    .ac-opt:hover:not(.dis){border-color:${accent}}
    .ac-opt.sel{background:${accent};color:#0b0d12;border-color:${accent};font-weight:600}
    .ac-opt.dis{opacity:.28;cursor:not-allowed;text-decoration:line-through}
    .ac-side{display:flex;flex-direction:column;gap:10px}
    .ac-syshead{font-size:15px;color:#9aa0b0;font-weight:600}
    .ac-sys{background:#101319;border:1px solid #232838;border-radius:10px;padding:10px 12px;transition:.25s}
    .ac-sys.hot{border-color:${accent};box-shadow:0 0 0 1px ${accent} inset,0 0 24px -6px ${accent}}
    .ac-sys h5{margin:0 0 3px;font-size:16px}
    .ac-sys p{margin:0;font-size:14px;color:#8b90a2;line-height:1.5}
    .ac-sys .why{color:${accent};font-size:14px;margin-top:5px;display:none}
    .ac-sys.hot .why{display:block}
    .ac-l4{background:#0e1119;border:1px solid #232838;border-radius:10px;padding:12px;display:none}
    .ac-l4.show{display:block;animation:ac-in .3s ease}
    .ac-l4 h4{margin:0 0 4px;font-size:16px}
    .ac-l4 .sub{font-size:14px;color:#8b90a2;margin-bottom:10px}
    .ac-wire{display:flex;align-items:center;gap:8px;margin:8px 0}
    .ac-node{flex:none;width:56px;text-align:center;font-size:14px}
    .ac-node .box{width:44px;height:44px;margin:0 auto 3px;border-radius:50%;background:#181c26;border:1.6px solid ${accent};display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:${accent};font-family:var(--font-en,'Space Grotesk'),sans-serif}
    .ac-track{flex:1;height:14px;border-radius:7px;background:#0c0f16;position:relative;overflow:hidden}
    .ac-track>.msg{position:absolute;top:1px;height:12px;border-radius:6px;left:-30%;width:26%;background:${accent}}
    .ac-recv{margin-top:6px}
    .ac-recv .lbl{font-size:14px;color:#7c8296;display:flex;justify-content:space-between}
    .ac-recv .bar{height:14px;border-radius:7px;background:#0c0f16;overflow:hidden;margin-top:3px}
    .ac-recv .bar>span{display:block;height:100%;width:20%;background:${GREEN};transition:width .6s ease}
    .ac-l4btns{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
    .ac-verdict{font-size:15px;margin-top:8px;min-height:18px;font-weight:600;line-height:1.5}
    .ac-l4btns .demo-btn,.ac-ctrls .demo-btn{font-size:16px;display:inline-flex;align-items:center;gap:7px}
    .ac-ctrls{display:none;gap:10px;align-items:center;flex-wrap:wrap;margin-top:16px}
    .ac-ctrls.show{display:flex}
    .ac-note{font-size:15px;color:#8b90a2;flex:1;min-width:160px;line-height:1.5}
    @keyframes ac-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
    @keyframes ac-send{from{left:-30%}to{left:104%}}
    @media(max-width:820px){.ac-body{grid-template-columns:1fr}}
  `

  const L0 = [{ k: 'proc', t: 'same process' }, { k: 'machine', t: 'same machine' }, { k: 'network', t: 'same network' }, { k: 'internet', t: 'open internet' }]
  const L1 = [
    { k: 'mem', t: '共享記憶體', envs: ['proc'] }, { k: 'pipe', t: 'pipe (stdin/stdout)', envs: ['proc', 'machine'] },
    { k: 'file', t: 'file + flock', envs: ['machine'] }, { k: 'ws', t: 'WebSocket', envs: ['network', 'internet'] },
    { k: 'http', t: 'HTTP + 認證', envs: ['internet', 'network'] },
  ]
  const L2 = [
    { k: 'hier', t: 'Hierarchy (parent→child)', trs: ['pipe', 'mem'] }, { k: 'star', t: 'Star (中央樞紐)', trs: ['ws', 'file'] },
    { k: 'peer', t: 'Peer (點對點)', trs: ['http', 'ws'] }, { k: 'pubsub', t: 'Pub/Sub', trs: ['ws', 'file'] },
  ]
  const L3 = [
    { k: 'json', t: 'JSON in inbox', tops: ['star', 'pubsub', 'hier'] }, { k: 'rpc', t: 'JSON-RPC', tops: ['peer', 'star'] },
    { k: 'card', t: 'Agent Card + JSON-RPC', tops: ['peer'] },
  ]

  const stage = createStage(el, ctx, { beats: buildBeats() })
  document.head.appendChild(style)

  stage.body.innerHTML = `
    <div class="ac-body">
      <div class="ac-layers ds-unit">
        <div class="ac-layer" data-l="0"><div class="ac-lhead"><span class="n">L0</span><h4>Environment</h4><span class="q">你的 agent 跑在哪？</span></div><div class="ac-opts"></div></div>
        <div class="ac-layer locked" data-l="1"><div class="ac-lhead"><span class="n">L1</span><h4>Transport</h4><span class="q">怎麼傳？</span></div><div class="ac-opts"></div></div>
        <div class="ac-layer locked" data-l="2"><div class="ac-lhead"><span class="n">L2</span><h4>Topology</h4><span class="q">誰跟誰講？</span></div><div class="ac-opts"></div></div>
        <div class="ac-layer locked" data-l="3"><div class="ac-lhead"><span class="n">L3</span><h4>Protocol</h4><span class="q">什麼格式？</span></div><div class="ac-opts"></div></div>
      </div>
      <div class="ac-side">
        <div class="ac-syshead ds-unit">最接近的真實系統</div>
        <div class="ac-sys ds-unit" data-sys="teams"><h5>Claude Teams</h5><p>檔案系統當 message bus，JSON 寫 inbox、flock 上鎖、polling 讀。</p><div class="why">直接 cat 那個 inbox 就能 debug。</div></div>
        <div class="ac-sys ds-unit" data-sys="openclaw"><h5>OpenClaw</h5><p>WebSocket Gateway 當中央樞紐，agent 都連到中心。</p><div class="why">即時、雙向，適合 same/network 的 star。</div></div>
        <div class="ac-sys ds-unit" data-sys="a2a"><h5>Google A2A</h5><p>Agent Card 做 discovery、JSON-RPC 跨網路互通。</p><div class="why">跨組織 open internet 的 peer 互通。</div></div>
        <div class="ac-l4 ds-unit" data-l="4">
          <h4>L4 · Content Contract <span style="font-weight:400;color:#8b90a2;font-size:14px">傳什麼？</span></h4>
          <div class="sub">前四層只是把 bytes 送到。這一層決定對方能不能用。</div>
          <div class="ac-wire">
            <div class="ac-node"><div class="box">A</div>Agent A</div>
            <div class="ac-track"><span class="msg"></span></div>
            <div class="ac-node"><div class="box">B</div>Agent B</div>
          </div>
          <div class="ac-recv"><div class="lbl"><span>Agent B 的 context window</span><span class="ac-rpct">20%</span></div><div class="bar"><span></span></div></div>
          <div class="ac-l4btns">
            <button class="demo-btn act-raw">${ico(P_UPLOAD, 17)} 傳 raw context dump</button>
            <button class="demo-btn primary act-struct">${ico(P_BOX, 17)} 傳結構化摘要</button>
          </div>
          <div class="ac-verdict"></div>
        </div>
      </div>
    </div>
    <div class="ac-ctrls ds-unit">
      <button class="demo-btn act-reset">重來</button>
      <span class="ac-note"></span>
    </div>`

  const $ = s => stage.body.querySelector(s)
  const $$ = s => Array.from(stage.body.querySelectorAll(s))
  const note = $('.ac-note'), ctrls = $('.ac-ctrls')
  const timers = new Set()
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }
  let sel = { 0: null, 1: null, 2: null, 3: null }, guided = false

  function optsFor(layer) {
    if (layer === 0) return L0.map(o => ({ ...o, ok: true }))
    if (layer === 1) return L1.map(o => ({ ...o, ok: sel[0] && o.envs.includes(sel[0]) }))
    if (layer === 2) return L2.map(o => ({ ...o, ok: sel[1] && o.trs.includes(sel[1]) }))
    return L3.map(o => ({ ...o, ok: sel[2] && o.tops.includes(sel[2]) }))
  }
  function renderLayer(layer) {
    const wrap = $(`.ac-layer[data-l="${layer}"] .ac-opts`); wrap.innerHTML = ''
    $(`.ac-layer[data-l="${layer}"]`).classList.toggle('locked', !(layer === 0 || sel[layer - 1]))
    optsFor(layer).forEach(o => {
      const b = document.createElement('button')
      b.className = 'ac-opt' + (sel[layer] === o.k ? ' sel' : '') + (o.ok ? '' : ' dis')
      b.textContent = o.t
      if (o.ok) b.addEventListener('click', () => { pop(b); pick(layer, o.k) })
      wrap.appendChild(b)
    })
  }
  function labelOf(layer, k) { const f = [L0, L1, L2, L3][layer].find(x => x.k === k); return f ? f.t : k }

  function pick(layer, k) {
    sel[layer] = k
    for (let i = layer + 1; i <= 3; i++) sel[i] = null
    for (let i = 0; i <= 3; i++) renderLayer(i)
    highlightSystem()
    if (sel[3]) { $('.ac-l4').classList.add('show'); resetL4() } else $('.ac-l4').classList.remove('show')
    if (!guided) {
      if (layer < 3 && !sel[3]) note.innerHTML = `選了 <b>${labelOf(layer, k)}</b> → L${layer + 1} 只剩相容選項可用（其餘灰掉）。`
      else if (sel[3]) note.innerHTML = '四層都定了 — 來到 <b>Content Contract</b>：同樣的管線，傳什麼決定成敗。'
    }
  }
  function highlightSystem() {
    $$('.ac-sys').forEach(s => s.classList.remove('hot'))
    if (!sel[2]) return
    let sys = null
    if (sel[1] === 'file') sys = 'teams'
    else if (sel[1] === 'ws') sys = 'openclaw'
    else if (sel[3] === 'card' || sel[2] === 'peer') sys = 'a2a'
    else if (sel[2] === 'star' || sel[2] === 'pubsub') sys = 'teams'
    else if (sel[1] === 'pipe' || sel[1] === 'mem') sys = 'teams'
    if (sys) { const c = $(`.ac-sys[data-sys="${sys}"]`); c.classList.add('hot'); pop(c) }
  }

  const msg = () => $('.ac-l4 .msg'), recvBar = () => $('.ac-recv .bar>span'), rpct = () => $('.ac-rpct'), verdict = () => $('.ac-verdict')
  function resetL4() {
    recvBar().style.width = '20%'; recvBar().style.background = GREEN
    rpct().textContent = '20%'; verdict().textContent = ''; msg().style.animation = 'none'
  }
  function sendMsg(kind) {
    const m = msg()
    m.style.background = kind === 'raw' ? RED : accent
    m.style.width = kind === 'raw' ? '55%' : '26%'
    m.style.animation = 'none'; m.offsetHeight; m.style.animation = 'ac-send 1.1s ease forwards'
    verdict().textContent = ''
    later(() => {
      if (kind === 'raw') {
        recvBar().style.width = '100%'; recvBar().style.background = RED; rpct().innerHTML = ico(P_BURST, 15) + ' 爆掉'
        verdict().style.color = RED; verdict().textContent = '✗ raw context dump 灌爆 Agent B 的 context window — 溝通失敗。'
        shake($('.ac-l4'))
        if (!guided) note.innerHTML = '<b>啊哈：</b>完美的 transport 也救不了。傳一大坨 raw dump，接收方直接爆掉。'
      } else {
        recvBar().style.width = '48%'; recvBar().style.background = GREEN; rpct().textContent = '48% ✓'
        verdict().style.color = GREEN; verdict().textContent = '✓ 經 memory selection + compression 的結構化摘要順利進入，任務繼續。'
        const r = $('.ac-l4').getBoundingClientRect(), br = stage.body.getBoundingClientRect()
        confettiBurst(stage.body, r.left - br.left + 80, r.top - br.top + 60, GREEN, 18)
        if (!guided) note.innerHTML = '前四層把 bytes 送到，<b>第五層才決定對方能不能用</b> — Content Contract 是成敗真正的關鍵。'
      }
    }, 1120)
  }

  function pickPath(path, gap = 550) { path.forEach((k, i) => later(() => pick(i, k), 200 + i * gap)) }

  function resetScene() {
    clearT(); sel = { 0: null, 1: null, 2: null, 3: null }
    for (let i = 0; i <= 3; i++) renderLayer(i)
    $$('.ac-sys').forEach(s => s.classList.remove('hot'))
    $('.ac-l4').classList.remove('show'); resetL4()
    note.textContent = ''; ctrls.classList.remove('show')
  }

  $('.act-raw').addEventListener('click', () => { pop($('.act-raw')); sendMsg('raw') })
  $('.act-struct').addEventListener('click', () => { pop($('.act-struct')); sendMsg('struct') })
  $('.act-reset').addEventListener('click', () => { pop($('.act-reset')); guided = true; resetScene(); ctrls.classList.add('show'); note.textContent = '從最下面的 L0 開始選，一路往上。' })

  function buildBeats() {
    return [
      { narration: 'Agent 溝通就是<b>作業系統的 IPC 問題</b>重演一遍 — 由下往上五層逐一決定。', focus: ['.ac-layers'], nextLabel: '選第一層 →',
        enter() { guided = true; resetScene() } },

      { narration: '<b>前一層 constrain 後一層</b> — 選了 same machine，L1 只剩 pipe / file 亮著，其餘灰掉。', focus: ['.ac-layer[data-l="0"]', '.ac-layer[data-l="1"]'], nextLabel: '一路選到頂 →',
        enter() { guided = true; resetScene(); later(() => pick(0, 'machine'), 400) } },

      { narration: '一路選到 <b>Protocol</b> — 右側自動亮起最接近的真實系統：檔案當 bus 的 <b>Claude Teams</b>。', focus: ['.ac-side'], nextLabel: '第五層才是戲肉 →',
        enter() { guided = true; resetScene(); pickPath(['machine', 'file', 'star', 'json']) } },

      { narration: '前四層只是把 bytes 送到。傳 <b>raw context dump</b> — 接收方 context window 瞬間<b>爆掉</b>。', focus: ['.ac-l4'], nextLabel: '換一種傳法 →',
        enter() { guided = true; resetScene(); pickPath(['machine', 'file', 'star', 'json'], 200); later(() => sendMsg('raw'), 1300) } },

      { narration: '同一條管線，改傳<b>結構化摘要</b>（memory selection + compression）— 順利進入，任務繼續。', focus: ['.ac-l4'], nextLabel: '換我決策 →',
        enter() { guided = true; resetScene(); pickPath(['machine', 'file', 'star', 'json'], 200); later(() => sendMsg('struct'), 1300) } },

      { narration: '換你決策 — 從 <b>L0</b> 往上選、看哪個系統亮起，到 <b>L4</b> 試 raw dump vs 結構化摘要，<b>重來</b>重置。', sandbox: true,
        enter() { guided = false; resetScene(); ctrls.classList.add('show'); note.textContent = '從最下面的 L0 開始選，一路往上。' } },
    ]
  }

  return () => { clearT(); style.remove(); stage.destroy() }
}
