// Agent Communication — 作業系統的 IPC 問題重演
// 核心互動：五層決策模型由下往上點選（Environment→Transport→Topology→Protocol），前一層的選擇會即時
// constrain 後一層（灰掉不可用）；右側自動 highlight 最接近的真實系統。最後 Layer 4 二選一：傳 raw dump
// 讓對方 context 爆掉，或傳結構化摘要讓任務繼續 — 「前四層只是把 bytes 送到，第五層才決定對方能不能用」。

export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#5b8cff'
  const GREEN = '#4ade80'
  const RED = '#f87171'

  // 內嵌手繪 SVG icon（幾何極簡線條）
  const ico = (d, s = 18) => `<svg class="ac-ico" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
  const P_UPLOAD = '<path d="M4 4h16"/><path d="M12 20V8"/><path d="M8 12l4-4 4 4"/>'
  const P_BOX = '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>'
  const P_BURST = '<path d="M12 2l2.2 5.2L20 5l-2.4 5.6L23 12l-5.4 1.4L20 19l-5.8-2.2L12 22l-2.2-5.2L4 19l2.4-5.6L1 12l5.4-1.4L4 5l5.8 2.2z"/>'

  const style = document.createElement('style')
  style.textContent = `
    .ac-root{position:absolute;inset:0;display:flex;flex-direction:column;gap:12px;padding:20px;box-sizing:border-box;color:#e6e9f2;font-family:'Noto Sans TC',sans-serif;overflow:auto}
    .ac-ico{vertical-align:-.18em;flex:none}
    .ac-guide{font-size:17px;color:#c3c8d8;line-height:1.6}
    .ac-guide b{color:${accent}}
    .ac-body{flex:1;display:grid;grid-template-columns:1.6fr 1fr;gap:16px;min-height:0}
    .ac-layers{display:flex;flex-direction:column-reverse;gap:8px}
    .ac-layer{background:#101319;border:1px solid #232838;border-radius:10px;padding:10px 12px;transition:opacity .25s}
    .ac-layer.locked{opacity:.4}
    .ac-lhead{display:flex;align-items:baseline;gap:8px;margin-bottom:8px}
    .ac-lhead .n{font-family:'Space Grotesk';font-size:13px;font-weight:700;color:${accent};background:#161b28;border-radius:6px;padding:1px 7px}
    .ac-lhead h4{margin:0;font-size:16px;font-weight:700}
    .ac-lhead .q{font-size:14px;color:#8b90a2}
    .ac-opts{display:flex;flex-wrap:wrap;gap:7px}
    .ac-opt{font-size:15px;padding:7px 12px;border-radius:8px;border:1px solid #2a3040;background:#181c26;color:#c3c8d8;cursor:pointer;transition:.15s}
    .ac-opt:hover:not(.dis){border-color:${accent}}
    .ac-opt.sel{background:${accent};color:#0b0d12;border-color:${accent};font-weight:600}
    .ac-opt.dis{opacity:.28;cursor:not-allowed;text-decoration:line-through}
    .ac-side{display:flex;flex-direction:column;gap:10px;min-height:0}
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
    .ac-node .box{width:44px;height:44px;margin:0 auto 3px;border-radius:50%;background:#181c26;border:1.6px solid ${accent};display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:${accent};font-family:'Space Grotesk',sans-serif}
    .ac-track{flex:1;height:14px;border-radius:7px;background:#0c0f16;position:relative;overflow:hidden}
    .ac-track>.msg{position:absolute;top:1px;height:12px;border-radius:6px;left:-30%;width:26%;background:${accent}}
    .ac-recv{margin-top:6px}
    .ac-recv .lbl{font-size:14px;color:#7c8296;display:flex;justify-content:space-between}
    .ac-recv .bar{height:14px;border-radius:7px;background:#0c0f16;overflow:hidden;margin-top:3px}
    .ac-recv .bar>span{display:block;height:100%;width:20%;background:${GREEN};transition:width .6s ease}
    .ac-l4btns{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
    .ac-verdict{font-size:15px;margin-top:8px;min-height:18px;font-weight:600;line-height:1.5}
    .ac-ctrls{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
    .ac-l4btns .demo-btn,.ac-ctrls .demo-btn{font-size:16.5px;display:inline-flex;align-items:center;gap:7px}
    .ac-note{font-size:15px;color:#8b90a2;flex:1;min-width:160px;line-height:1.5}
    @keyframes ac-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
    @keyframes ac-send{from{left:-30%}to{left:104%}}
  `
  el.appendChild(style)

  // 五層資料。deps: 該選項需要上一層某個 key 才可用（null = 永遠可用）
  const L0 = [
    { k: 'proc', t: 'same process' }, { k: 'machine', t: 'same machine' },
    { k: 'network', t: 'same network' }, { k: 'internet', t: 'open internet' },
  ]
  const L1 = [
    { k: 'mem', t: '共享記憶體', envs: ['proc'] },
    { k: 'pipe', t: 'pipe (stdin/stdout)', envs: ['proc', 'machine'] },
    { k: 'file', t: 'file + flock', envs: ['machine'] },
    { k: 'ws', t: 'WebSocket', envs: ['network', 'internet'] },
    { k: 'http', t: 'HTTP + 認證', envs: ['internet', 'network'] },
  ]
  const L2 = [
    { k: 'hier', t: 'Hierarchy (parent→child)', trs: ['pipe', 'mem'] },
    { k: 'star', t: 'Star (中央樞紐)', trs: ['ws', 'file'] },
    { k: 'peer', t: 'Peer (點對點)', trs: ['http', 'ws'] },
    { k: 'pubsub', t: 'Pub/Sub', trs: ['ws', 'file'] },
  ]
  const L3 = [
    { k: 'json', t: 'JSON in inbox', tops: ['star', 'pubsub', 'hier'] },
    { k: 'rpc', t: 'JSON-RPC', tops: ['peer', 'star'] },
    { k: 'card', t: 'Agent Card + JSON-RPC', tops: ['peer'] },
  ]

  const root = document.createElement('div')
  root.className = 'ac-root'
  root.innerHTML = `
    <div class="ac-guide">Agent 溝通 = 作業系統 IPC 重演。由下往上一層層選：<b>前一層的選擇會 constrain 後一層</b>（灰掉的就是不可用）。選完看右側哪個真實系統亮起，最後一層才是戲肉。</div>
    <div class="ac-body">
      <div class="ac-layers">
        <div class="ac-layer" data-l="0"><div class="ac-lhead"><span class="n">L0</span><h4>Environment</h4><span class="q">你的 agent 跑在哪？</span></div><div class="ac-opts"></div></div>
        <div class="ac-layer locked" data-l="1"><div class="ac-lhead"><span class="n">L1</span><h4>Transport</h4><span class="q">怎麼傳？</span></div><div class="ac-opts"></div></div>
        <div class="ac-layer locked" data-l="2"><div class="ac-lhead"><span class="n">L2</span><h4>Topology</h4><span class="q">誰跟誰講？</span></div><div class="ac-opts"></div></div>
        <div class="ac-layer locked" data-l="3"><div class="ac-lhead"><span class="n">L3</span><h4>Protocol</h4><span class="q">什麼格式？</span></div><div class="ac-opts"></div></div>
      </div>
      <div class="ac-side">
        <div class="ac-syshead">最接近的真實系統</div>
        <div class="ac-sys" data-sys="teams"><h5>Claude Teams</h5><p>檔案系統當 message bus，JSON 寫 inbox、flock 上鎖、polling 讀。</p><div class="why">✓ 直接 cat 那個 inbox 就能 debug。</div></div>
        <div class="ac-sys" data-sys="openclaw"><h5>OpenClaw</h5><p>WebSocket Gateway 當中央樞紐，agent 都連到中心。</p><div class="why">✓ 即時、雙向，適合 same/network 的 star。</div></div>
        <div class="ac-sys" data-sys="a2a"><h5>Google A2A</h5><p>Agent Card 做 discovery、JSON-RPC 跨網路互通。</p><div class="why">✓ 跨組織 open internet 的 peer 互通。</div></div>
        <div class="ac-l4" data-l="4">
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
    <div class="ac-ctrls">
      <button class="demo-btn act-reset">↺ 重新決策</button>
      <span class="ac-note">先從最下面的 L0 開始選。</span>
    </div>
  `
  el.appendChild(root)

  const $ = s => root.querySelector(s)
  const $$ = s => Array.from(root.querySelectorAll(s))
  const note = $('.ac-note')
  const timers = new Set()
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }

  let sel = { 0: null, 1: null, 2: null, 3: null }

  function optsFor(layer) {
    if (layer === 0) return L0.map(o => ({ ...o, ok: true }))
    if (layer === 1) return L1.map(o => ({ ...o, ok: sel[0] && o.envs.includes(sel[0]) }))
    if (layer === 2) return L2.map(o => ({ ...o, ok: sel[1] && o.trs.includes(sel[1]) }))
    if (layer === 3) return L3.map(o => ({ ...o, ok: sel[2] && o.tops.includes(sel[2]) }))
  }

  function renderLayer(layer) {
    const wrap = $(`.ac-layer[data-l="${layer}"] .ac-opts`)
    wrap.innerHTML = ''
    const enabled = layer === 0 || sel[layer - 1]
    $(`.ac-layer[data-l="${layer}"]`).classList.toggle('locked', !enabled)
    optsFor(layer).forEach(o => {
      const b = document.createElement('button')
      b.className = 'ac-opt' + (sel[layer] === o.k ? ' sel' : '') + (o.ok ? '' : ' dis')
      b.textContent = o.t
      if (o.ok) b.addEventListener('click', () => pick(layer, o.k))
      wrap.appendChild(b)
    })
  }

  function pick(layer, k) {
    sel[layer] = k
    // 清掉下游選擇
    for (let i = layer + 1; i <= 3; i++) sel[i] = null
    for (let i = 0; i <= 3; i++) renderLayer(i)
    highlightSystem()
    if (layer < 3) {
      note.innerHTML = `選了 <b>${labelOf(layer, k)}</b> → L${layer + 1} 只剩相容選項可用（其餘灰掉）。`
    }
    if (sel[3]) {
      note.innerHTML = '四層都定了 — 現在來到 <b>Content Contract</b>：同樣的管線，傳什麼決定成敗。'
      $('.ac-l4').classList.add('show')
      resetL4()
    } else {
      $('.ac-l4').classList.remove('show')
    }
  }

  function labelOf(layer, k) {
    const src = [L0, L1, L2, L3][layer]
    const f = src.find(x => x.k === k)
    return f ? f.t : k
  }

  function highlightSystem() {
    $$('.ac-sys').forEach(s => s.classList.remove('hot'))
    if (!sel[2]) return
    let sys = null
    if (sel[1] === 'file' || (sel[2] === 'star' && sel[1] === 'file')) sys = 'teams'
    else if (sel[1] === 'ws') sys = 'openclaw'
    else if (sel[3] === 'card' || sel[2] === 'peer') sys = 'a2a'
    else if (sel[2] === 'star' || sel[2] === 'pubsub') sys = 'teams'
    else if (sel[1] === 'pipe' || sel[1] === 'mem') sys = 'teams'
    if (sys) $(`.ac-sys[data-sys="${sys}"]`).classList.add('hot')
  }

  // ---- L4 Content Contract ----
  const msg = () => $('.ac-l4 .msg')
  const recvBar = () => $('.ac-recv .bar>span')
  const rpct = () => $('.ac-rpct')
  const verdict = () => $('.ac-verdict')

  function resetL4() {
    recvBar().style.width = '20%'; recvBar().style.background = GREEN
    rpct().textContent = '20%'; verdict().textContent = ''
    msg().style.animation = 'none'
  }

  function sendMsg(kind) {
    const m = msg()
    m.style.background = kind === 'raw' ? RED : accent
    m.style.width = kind === 'raw' ? '55%' : '26%'
    m.style.animation = 'none'; m.offsetHeight
    m.style.animation = 'ac-send 1.1s ease forwards'
    verdict().textContent = ''
    later(() => {
      if (kind === 'raw') {
        recvBar().style.width = '100%'; recvBar().style.background = RED; rpct().innerHTML = ico(P_BURST, 15) + ' 爆掉'
        verdict().style.color = RED
        verdict().textContent = '✗ raw context dump 灌爆 Agent B 的 context window — 溝通失敗。'
        note.innerHTML = '<b>啊哈：</b>完美的 transport 也救不了。傳一大坨 raw dump，接收方直接爆掉。'
      } else {
        recvBar().style.width = '48%'; recvBar().style.background = GREEN; rpct().textContent = '48% ✓'
        verdict().style.color = GREEN
        verdict().textContent = '✓ 經 memory selection + compression 的結構化摘要順利進入，任務繼續。'
        note.innerHTML = '前四層把 bytes 送到，<b>第五層才決定對方能不能用</b> — Content Contract 是成敗真正的關鍵。'
      }
    }, 1120)
  }

  const onRaw = () => sendMsg('raw')
  const onStruct = () => sendMsg('struct')
  const onReset = () => { sel = { 0: null, 1: null, 2: null, 3: null }; for (let i = 0; i <= 3; i++) renderLayer(i); highlightSystem(); $('.ac-l4').classList.remove('show'); note.textContent = '先從最下面的 L0 開始選。' }
  $('.act-raw').addEventListener('click', onRaw)
  $('.act-struct').addEventListener('click', onStruct)
  $('.act-reset').addEventListener('click', onReset)

  for (let i = 0; i <= 3; i++) renderLayer(i)

  return () => {
    timers.forEach(clearTimeout); timers.clear()
    $('.act-raw').removeEventListener('click', onRaw)
    $('.act-struct').removeEventListener('click', onStruct)
    $('.act-reset').removeEventListener('click', onReset)
    style.remove(); root.remove()
  }
}
