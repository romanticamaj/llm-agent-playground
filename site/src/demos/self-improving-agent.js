// 自我學習 Agent — 記憶管線模擬器
// 核心互動：跑 session → 自動 capture observation → dual-gate 滿了自動 consolidate 成 L2 instinct，
// confidence 累積後 promote 到 L4；關掉 Verifier 會讓錯誤 observation 長成高信心規則、污染整條管線。

export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#5b8cff'
  const GREEN = '#4ade80'
  const RED = '#f87171'

  // 內嵌手繪 SVG icon（幾何極簡線條）
  const ico = (d, s = 18) => `<svg class="sia-ico" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
  const P_HOOK = '<path d="M14 4v8a4 4 0 1 1-4-4"/><circle cx="14" cy="3.4" r="0.9" fill="currentColor" stroke="none"/>'
  const P_SEARCH = '<circle cx="10.5" cy="10.5" r="6"/><path d="M20 20l-5.2-5.2"/>'
  const P_THUMBDOWN = '<path d="M17 4h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-2"/><path d="M17 4v9l-3.8 5.5a1.4 1.4 0 0 1-2.5-.4 3.8 3.8 0 0 1-.1-2.3L11 13H5.6a1.5 1.5 0 0 1-1.5-1.8l1.1-6A1.5 1.5 0 0 1 6.7 4H17"/>'
  const P_WARN = '<path d="M12 4l9 15H3z"/><path d="M12 10v4"/><path d="M12 16.4h.01"/>'
  const P_SKULL = '<path d="M6 17.2A8 8 0 1 1 18 17.2V19a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><path d="M12 15v2M10 20v-2M14 20v-2"/>'
  const P_FLASK = '<path d="M9 3h6M10 3v6l-4.7 8.2A1.5 1.5 0 0 0 6.6 20h10.8a1.5 1.5 0 0 0 1.3-2.8L14 9V3M7.5 15h9"/>'

  const style = document.createElement('style')
  style.textContent = `
    .sia-root{position:absolute;inset:0;display:flex;flex-direction:column;gap:14px;padding:20px;box-sizing:border-box;color:#e6e9f2;font-family:'Noto Sans TC',sans-serif;overflow:auto}
    .sia-ico{vertical-align:-.18em;flex:none}
    .sia-hook{color:${accent}}
    .sia-guide{font-size:17px;color:#c3c8d8;line-height:1.6}
    .sia-guide b{color:${accent}}
    .sia-top{display:flex;gap:16px;flex-wrap:wrap;align-items:stretch}
    .sia-gate{flex:1;min-width:220px;background:#12151d;border:1px solid #232838;border-radius:12px;padding:12px 14px}
    .sia-gate h4{margin:0 0 8px;font-size:15px;color:#9aa0b0;font-weight:600}
    .sia-bar{height:12px;border-radius:6px;background:#1c2130;overflow:hidden;margin:6px 0 2px}
    .sia-bar>span{display:block;height:100%;width:0;transition:width .4s ease}
    .sia-bar .fill-t{background:${accent}}
    .sia-bar .fill-s{background:#a78bfa}
    .sia-barlbl{font-size:14px;color:#7c8296;display:flex;justify-content:space-between}
    .sia-tokens{display:flex;align-items:center;gap:10px}
    .sia-tokens .num{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:700;color:#e6e9f2}
    .sia-veri{display:flex;align-items:center;gap:10px;background:#12151d;border:1px solid #232838;border-radius:12px;padding:12px 14px}
    .sia-switch{position:relative;width:52px;height:28px;border-radius:14px;background:#3a2030;border:1px solid #55283a;cursor:pointer;transition:.25s;flex:none}
    .sia-switch.on{background:#1e3a2a;border-color:#2f5c42}
    .sia-switch>i{position:absolute;top:2px;left:2px;width:22px;height:22px;border-radius:50%;background:${RED};transition:.25s}
    .sia-switch.on>i{left:26px;background:${GREEN}}
    .sia-veri-txt{font-size:15px}
    .sia-veri-txt small{display:block;color:#7c8296;font-size:13px}
    .sia-pipe{flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:12px;min-height:0}
    .sia-col{background:#101319;border:1px solid #232838;border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:8px;min-height:180px;transition:border-color .3s,box-shadow .3s}
    .sia-col.polluted{border-color:${RED};box-shadow:0 0 0 1px ${RED} inset}
    .sia-col h3{margin:0;font-size:16px;font-weight:700}
    .sia-col .tag{font-size:13px;color:#7c8296;font-weight:400}
    .sia-cards{display:flex;flex-direction:column;gap:6px;overflow:auto}
    .sia-card{background:#181c26;border:1px solid #2a3040;border-radius:8px;padding:7px 9px;font-size:15px;line-height:1.45;animation:sia-in .35s ease}
    .sia-card.obs{border-left:3px solid ${accent}}
    .sia-card.bad{border-left-color:${RED};color:#f2b8b8}
    .sia-card.rejected{opacity:.45;text-decoration:line-through;border-left-color:${RED}}
    .sia-card .kv{color:#9aa0b0}
    .sia-inst{background:#1a1f2b;border:1px solid #2f3547;border-radius:8px;padding:8px 9px;font-size:15px;animation:sia-in .35s ease}
    .sia-inst.good{border-left:3px solid ${GREEN}}
    .sia-inst.bad{border-left:3px solid ${RED};background:#241417;color:#f2b8b8}
    .sia-conf{height:8px;border-radius:4px;background:#0e1118;margin-top:6px;overflow:hidden}
    .sia-conf>span{display:block;height:100%;transition:width .5s ease}
    .sia-confnum{font-family:'Space Grotesk';font-size:13px;color:#9aa0b0;margin-top:3px}
    .sia-hook{display:inline-block;transition:transform .15s}
    .sia-hook.flash{transform:scale(1.5);filter:drop-shadow(0 0 8px ${accent})}
    .sia-ctrls{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
    .sia-ctrls .demo-btn{font-size:16.5px;display:inline-flex;align-items:center;gap:7px}
    .sia-note{font-size:15px;color:#8b90a2;flex:1;min-width:160px;line-height:1.5}
    .sia-warn{color:${RED};font-weight:600}
    @keyframes sia-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  `
  el.appendChild(style)

  const root = document.createElement('div')
  root.className = 'sia-root'
  root.innerHTML = `
    <div class="sia-guide">按 <b>跑一個 session</b>：Hook <span class="sia-hook">${ico(P_HOOK, 20)}</span> 一定觸發、自動 capture 一筆 observation。dual-gate 兩條都滿 → 自動 consolidate 成 L2 instinct，反覆出現 confidence 會升到 promote。試試<b>關掉 Verifier</b> 再跑幾次，看錯誤學習怎麼污染整條管線。</div>
    <div class="sia-top">
      <div class="sia-gate">
        <h4>Dual-gate 進度（兩條都滿才 consolidate）</h4>
        <div class="sia-barlbl"><span>時間 gate</span><span class="lbl-t">0%</span></div>
        <div class="sia-bar"><span class="fill-t"></span></div>
        <div class="sia-barlbl"><span>session gate</span><span class="lbl-s">0 / 3</span></div>
        <div class="sia-bar"><span class="fill-s"></span></div>
      </div>
      <div class="sia-gate sia-tokens-wrap">
        <h4>Token 成本</h4>
        <div class="sia-tokens"><span class="num">0</span><span style="color:#7c8296;font-size:12px">capture 便宜 · consolidate 貴</span></div>
      </div>
      <div class="sia-veri">
        <div class="sia-switch on"><i></i></div>
        <div class="sia-veri-txt">Verifier（獨立 Haiku ${ico(P_SEARCH, 16)}）<small>攔截自圓其說的錯誤 observation</small></div>
      </div>
    </div>
    <div class="sia-pipe">
      <div class="sia-col" data-col="l1"><h3>L1 <span class="tag">Raw Data</span></h3><div class="sia-cards"></div></div>
      <div class="sia-col" data-col="l2"><h3>L2 <span class="tag">Instincts</span></h3><div class="sia-cards"></div></div>
      <div class="sia-col" data-col="l3"><h3>L3 <span class="tag">Skills</span></h3><div class="sia-cards"></div></div>
      <div class="sia-col" data-col="l4"><h3>L4 <span class="tag">Strategic</span></h3><div class="sia-cards"></div></div>
    </div>
    <div class="sia-ctrls">
      <button class="demo-btn primary act-run">▶ 跑一個 session</button>
      <button class="demo-btn act-hit">${ico(P_THUMBDOWN, 17)} 打臉它（餵矛盾證據）</button>
      <button class="demo-btn act-reset">↺ 重置</button>
      <span class="sia-note"></span>
    </div>
  `
  el.appendChild(root)

  const $ = s => root.querySelector(s)
  const cols = {
    l1: $('[data-col="l1"] .sia-cards'),
    l2: $('[data-col="l2"] .sia-cards'),
    l3: $('[data-col="l3"] .sia-cards'),
    l4: $('[data-col="l4"] .sia-cards'),
  }
  const fillT = $('.fill-t'), fillS = $('.fill-s')
  const lblT = $('.lbl-t'), lblS = $('.lbl-s')
  const tokEl = $('.sia-tokens .num')
  const hook = $('.sia-hook')
  const sw = $('.sia-switch')
  const note = $('.sia-note')

  // 預先寫好的假 observation 腳本：每 3 好 1 壞
  const SCRIPT = [
    { c: '深色 UI 專案', m: '用純黑背景配深灰字', r: '對比不足看不清', why: '色差太小', adv: '深背景一律用白字', bad: false },
    { c: 'React 表單', m: '未受控 input', r: '狀態不同步', why: '沒 single source', adv: 'form state 集中管理', bad: false },
    { c: 'API 逾時', m: '無限重試', r: '雪崩', why: '沒退避', adv: '重試要指數退避', bad: false },
    { c: '一次隨機 flaky test', m: '重跑一次過了', r: '綠燈', why: '（我猜）環境剛好穩了', adv: 'flaky test 直接重跑即可', bad: true },
  ]

  const timers = new Set()
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }

  let state
  function reset() {
    timers.forEach(clearTimeout); timers.clear()
    state = { sessions: 0, timeGate: 0, sessionGate: 0, tokens: 0, verifier: true, pending: [], good: null, bad: null, scriptIdx: 0 }
    sw.classList.add('on')
    Object.values(cols).forEach(c => c.innerHTML = '')
    document.querySelectorAll('.sia-col').forEach(c => c.classList.remove('polluted'))
    render()
    note.textContent = ''
  }

  function render() {
    fillT.style.width = state.timeGate + '%'
    fillS.style.width = (state.sessionGate / 3 * 100) + '%'
    lblT.textContent = Math.round(state.timeGate) + '%'
    lblS.textContent = state.sessionGate + ' / 3'
    tokEl.textContent = state.tokens
  }

  function card(html, cls) {
    const d = document.createElement('div')
    d.className = 'sia-card ' + (cls || '')
    d.innerHTML = html
    return d
  }
  function trim(col, max) { while (col.children.length > max) col.removeChild(col.firstChild) }

  function runSession() {
    state.sessions++
    // Hook 閃一下
    hook.classList.add('flash'); later(() => hook.classList.remove('flash'), 200)
    // L1 掉一筆雜亂 transcript
    cols.l1.appendChild(card(`<span class="kv">session #${state.sessions} transcript</span><br>使用者：這裡壞了… / agent：試 patch… / 再試…`, ''))
    trim(cols.l1, 4)
    state.tokens += 2

    const obs = SCRIPT[state.scriptIdx % SCRIPT.length]
    state.scriptIdx++
    const obsHtml = `<b>Observation</b><br><span class="kv">情境</span> ${obs.c}<br><span class="kv">方法</span> ${obs.m}<br><span class="kv">結果</span> ${obs.r}<br><span class="kv">原因</span> ${obs.why}<br><span class="kv">建議</span> ${obs.adv}`

    later(() => {
      if (obs.bad && state.verifier) {
        const c = card(obsHtml + '<br><span class="warn" style="color:' + RED + '">✗ Verifier 攔截：自評不可靠，丟棄</span>', 'obs rejected')
        cols.l1.appendChild(c); trim(cols.l1, 5)
        note.innerHTML = 'Verifier 攔下一筆「flaky test 直接重跑」的錯誤結論，沒進 L2。'
        later(() => { if (c.parentNode) c.remove() }, 1600)
      } else {
        cols.l1.appendChild(card(obsHtml, 'obs ' + (obs.bad ? 'bad' : '')))
        trim(cols.l1, 5)
        state.pending.push(obs)
        if (obs.bad) note.innerHTML = '<span class="sia-warn">' + ico(P_WARN, 16) + ' 一筆錯誤 observation 溜進 pipeline（Verifier 關著）</span>'
      }
      // 推進 dual-gate
      state.timeGate = Math.min(100, state.timeGate + 40)
      state.sessionGate = Math.min(3, state.sessionGate + 1)
      state.tokens += 3
      render()
      if (state.timeGate >= 100 && state.sessionGate >= 3) later(consolidate, 500)
    }, 350)
  }

  function upsertInstinct(kind, delta) {
    let inst = state[kind]
    if (!inst) {
      inst = state[kind] = { conf: 0.3, layer: 2, el: null }
      const d = document.createElement('div')
      d.className = 'sia-inst ' + (kind === 'good' ? 'good' : 'bad')
      d.innerHTML = `<b>${kind === 'good' ? '深背景一律用白字' : 'flaky test 直接重跑即可'}</b>
        <span class="kv">${kind === 'good' ? '（多專案反覆驗證）' : '（未經驗證的錯誤模式）'}</span>
        <div class="sia-conf"><span></span></div><div class="sia-confnum"></div>`
      inst.el = d
      cols.l2.appendChild(d)
    } else {
      inst.conf = Math.max(0, Math.min(1, inst.conf + delta))
    }
    updateInstinct(inst, kind)
  }

  function updateInstinct(inst, kind) {
    const bar = inst.el.querySelector('.sia-conf>span')
    bar.style.width = (inst.conf * 100) + '%'
    bar.style.background = kind === 'good' ? GREEN : RED
    inst.el.querySelector('.sia-confnum').textContent = 'confidence ' + inst.conf.toFixed(1)
    // promote by layer
    let target = 2
    if (inst.conf >= 0.9) target = 4
    else if (inst.conf >= 0.6) target = 3
    if (target !== inst.layer) {
      inst.layer = target
      const dest = cols['l' + target]
      dest.appendChild(inst.el)
      inst.el.style.animation = 'none'; inst.el.offsetHeight; inst.el.style.animation = 'sia-in .35s ease'
      if (kind === 'good') note.innerHTML = `<span style="color:${GREEN}">✓</span> instinct 升到 <b>L${target}</b>（confidence ${inst.conf.toFixed(1)}）— 反覆出現 → promote`
      if (kind === 'bad' && target >= 3) pollute()
    }
  }

  function pollute() {
    document.querySelector('[data-col="l3"]').classList.add('polluted')
    document.querySelector('[data-col="l4"]').classList.add('polluted')
    note.innerHTML = '<span class="sia-warn">' + ico(P_SKULL, 16) + ' 管線被污染：沒有 Verifier，錯誤模式被學成高信心 L' + state.bad.layer + ' 規則。這就是為什麼實作者與評審必須分離。</span>'
  }

  function consolidate() {
    const goods = state.pending.filter(o => !o.bad).length
    const bads = state.pending.filter(o => o.bad).length
    state.pending = []
    state.timeGate = 0; state.sessionGate = 0; state.tokens += 12; render()
    // consolidate 動畫：合併成 instinct
    if (goods) upsertInstinct('good', 0.3)
    if (bads) upsertInstinct('bad', 0.3)
    if (!note.innerHTML || !note.innerHTML.includes('污染'))
      note.innerHTML = `${ico(P_FLASK, 16)} Consolidate：${goods + bads} 筆 observation 蒸餾成 instinct（貴，所以要 dual-gate 累積夠才做）`
  }

  function hit() {
    // 餵矛盾證據：優先衰減 bad instinct（示範可反轉），否則衰減 good
    const target = state.bad || state.good
    if (!target) { note.textContent = '目前還沒有 instinct 可打臉，先跑幾個 session。'; return }
    const kind = target === state.bad ? 'bad' : 'good'
    target.conf = Math.max(0, target.conf - 0.3)
    if (target.conf < 0.6 && (kind === 'bad')) {
      document.querySelector('[data-col="l3"]').classList.remove('polluted')
      document.querySelector('[data-col="l4"]').classList.remove('polluted')
    }
    updateInstinct(target, kind)
    note.innerHTML = `${ico(P_THUMBDOWN, 15)} 餵一筆矛盾證據 → confidence 衰減到 ${target.conf.toFixed(1)}`
  }

  const onRun = () => runSession()
  const onHit = () => hit()
  const onReset = () => reset()
  const onSw = () => { state.verifier = !state.verifier; sw.classList.toggle('on', state.verifier); note.textContent = state.verifier ? 'Verifier 開：錯誤 observation 進 L2 前被攔下。' : 'Verifier 關：跑到第 4 個 session 會混進錯誤結論，看它怎麼長成高信心規則。' }
  $('.act-run').addEventListener('click', onRun)
  $('.act-hit').addEventListener('click', onHit)
  $('.act-reset').addEventListener('click', onReset)
  sw.addEventListener('click', onSw)

  reset()

  return () => {
    timers.forEach(clearTimeout); timers.clear()
    $('.act-run').removeEventListener('click', onRun)
    $('.act-hit').removeEventListener('click', onHit)
    $('.act-reset').removeEventListener('click', onReset)
    sw.removeEventListener('click', onSw)
    style.remove(); root.remove()
  }
}
