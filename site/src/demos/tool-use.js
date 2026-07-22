// tool-use — 可步進的 tool-use loop：訊息+清單 → 大腦 → 點單(id) → 工具箱執行 → 結果卡(同 id) → 重組 → 回答。
// 進階：平行 tool use，使用者手動把結果卡配對回正確 id；配錯 loop 卡住抖動。

export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#5b8cff'
  const P = 'tu'
  const timers = []
  const setT = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id }

  const brainPath = `<path d="M12 5 C9 4 6 6 7 9 C5 10 5 13 7 14 C7 17 10 18 12 16"/><path d="M12 5 C15 4 18 6 17 9 C19 10 19 13 17 14 C17 17 14 18 12 16"/><path d="M12 5 V16"/>`
  const icBrainSm = `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="flex:none">${brainPath}</svg>`
  const icBrainBig = `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${brainPath}</svg>`
  const icMail = `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#8b91a4" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M4 8 L12 13 L20 8"/></svg>`
  const icTools = `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#38e1c6" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><rect x="3" y="8" width="18" height="11" rx="2"/><path d="M8 8 V6 a2 2 0 0 1 2 -2 h4 a2 2 0 0 1 2 2 V8"/><path d="M3 13 H21"/><rect x="10" y="11" width="4" height="4" rx="1"/></svg>`
  const icGear = `<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#38e1c6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`

  const style = document.createElement('style')
  style.textContent = `
  .${P}-root{position:absolute;inset:0;display:flex;flex-direction:column;gap:14px;padding:22px 26px;box-sizing:border-box;color:#e7e9f0;font-family:var(--font-tc,'Noto Sans TC',sans-serif)}
  .${P}-guide{font-size:17px;line-height:1.6;color:#c7cbd8}
  .${P}-guide b{color:${accent}}
  .${P}-tabs{display:flex;gap:10px}
  .${P}-tab{font-size:15px;padding:7px 15px;border-radius:20px;border:1px solid rgba(255,255,255,.14);background:transparent;color:#c7cbd8;cursor:pointer}
  .${P}-tab.on{background:${accent};color:#05060a;border-color:${accent};font-weight:600}
  .${P}-stage{flex:1;position:relative;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(255,255,255,.015);padding:16px;display:flex;gap:16px;min-height:0}
  .${P}-col{flex:1;display:flex;flex-direction:column;gap:10px;min-width:0}
  .${P}-box{border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;transition:all .3s;background:#12151d}
  .${P}-box.active{border-color:${accent};box-shadow:0 0 18px rgba(91,140,255,.35)}
  .${P}-box h5{margin:0 0 8px;font-size:13px;letter-spacing:.12em;color:#8b91a4;font-weight:600;display:flex;align-items:center;gap:7px}
  .${P}-msgs{flex:1;overflow:auto;display:flex;flex-direction:column;gap:7px}
  .${P}-msg{font-size:15px;padding:7px 10px;border-radius:8px;background:rgba(255,255,255,.05);border-left:2px solid #454b5c;opacity:0;transform:translateY(6px);transition:all .35s;font-family:var(--font-en,'Space Grotesk',sans-serif)}
  .${P}-msg.show{opacity:1;transform:none}
  .${P}-msg .k{color:#8b91a4;font-size:11px;letter-spacing:.08em}
  .${P}-msg.tuse{border-left-color:${accent}}
  .${P}-msg.tres{border-left-color:#4ade80}
  .${P}-brain{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:8px}
  .${P}-brain .em{display:inline-flex;transition:transform .3s}
  .${P}-box.active .${P}-brain .em{transform:scale(1.12)}
  .${P}-brain .cap{font-size:14px;color:#8b91a4}
  .${P}-gear{display:inline-flex;transition:transform .2s}
  .${P}-gear.spin{animation:${P}-spin 1s linear infinite}
  @keyframes ${P}-spin{to{transform:rotate(360deg)}}
  .${P}-fly{position:absolute;z-index:20;font-size:13px;font-family:var(--font-en,'Space Grotesk',sans-serif);padding:7px 11px;border-radius:9px;background:${accent};color:#05060a;font-weight:600;transform:translate(-50%,-50%);transition:all .68s cubic-bezier(.5,0,.3,1);box-shadow:0 6px 20px rgba(0,0,0,.4);pointer-events:none;white-space:nowrap}
  .${P}-fly.res{background:#4ade80}
  .${P}-controls{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
  .${P}-controls .demo-btn{font-size:16px}
  .${P}-desc{font-size:15px;line-height:1.6;color:#c7cbd8;min-height:20px}
  .${P}-desc b{color:${accent}}
  /* 進階平行模式 */
  .${P}-slots{display:flex;flex-direction:column;gap:10px}
  .${P}-slot{border:1px dashed rgba(255,255,255,.25);border-radius:10px;padding:10px;font-size:14px;font-family:var(--font-en,'Space Grotesk',sans-serif)}
  .${P}-slot .id{color:${accent};font-weight:700}
  .${P}-slot .drop{margin-top:8px;min-height:34px;border-radius:8px;border:1px dashed rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;color:#6b7183;font-size:13px;transition:all .2s}
  .${P}-slot.filled{border-color:#4ade80}
  .${P}-slot.filled .drop{border-style:solid;border-color:#4ade80;background:rgba(74,222,128,.1);color:#4ade80}
  .${P}-slot.wrong{animation:${P}-shake .4s}
  @keyframes ${P}-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-7px)}40%,80%{transform:translateX(7px)}}
  .${P}-tray{display:flex;flex-direction:column;gap:9px}
  .${P}-rescard{border:1px solid rgba(74,222,128,.5);background:rgba(74,222,128,.08);border-radius:10px;padding:9px 11px;font-size:14px;cursor:pointer;font-family:var(--font-en,'Space Grotesk',sans-serif);transition:all .2s}
  .${P}-rescard:hover{border-color:#4ade80}
  .${P}-rescard.sel{outline:2px solid #4ade80;outline-offset:1px}
  .${P}-rescard.used{opacity:.25;pointer-events:none;text-decoration:line-through}
  .${P}-rescard .id{color:#8b91a4;font-size:11px}
  `
  el.appendChild(style)

  const root = document.createElement('div')
  root.className = `${P}-root`
  root.innerHTML = `
    <div class="${P}-guide">Tool use 是一個 loop。按 <b>下一步</b> 逐格看：訊息+工具清單 → 大腦吐「點單」(帶 id) → 工具箱執行 → 結果卡貼上<b>同一個 id</b> → 重組送回 → 大腦回答。全程 <b>LLM 只看到文字</b>。</div>
    <div class="${P}-tabs">
      <button class="${P}-tab on" id="${P}-tb-basic">基礎：單一工具</button>
      <button class="${P}-tab" id="${P}-tb-par">進階：平行工具（手動配 id）</button>
    </div>
    <div class="${P}-stage" id="${P}-stage"></div>
    <div class="${P}-desc" id="${P}-desc"></div>
    <div class="${P}-controls" id="${P}-controls"></div>`
  el.appendChild(root)

  const $ = id => root.querySelector(`#${P}-${id}`)
  const stage = $('stage'), descEl = $('desc'), controls = $('controls')
  const tbBasic = $('tb-basic'), tbPar = $('tb-par')

  function fly(from, to, html, cls, done) {
    const s = stage.getBoundingClientRect(), a = from.getBoundingClientRect(), b = to.getBoundingClientRect()
    const card = document.createElement('div')
    card.className = `${P}-fly ${cls || ''}`
    card.innerHTML = html
    stage.appendChild(card)
    card.style.left = (a.left - s.left + a.width / 2) + 'px'
    card.style.top = (a.top - s.top + a.height / 2) + 'px'
    requestAnimationFrame(() => {
      card.style.left = (b.left - s.left + b.width / 2) + 'px'
      card.style.top = (b.top - s.top + b.height / 2) + 'px'
    })
    setT(() => { card.remove(); done && done() }, 700)
  }

  // ---------- 基礎模式 ----------
  let step = 0, animating = false, refs = {}
  function buildBasic() {
    step = 0; animating = false
    stage.innerHTML = `
      <div class="${P}-col" style="flex:1.2">
        <div class="${P}-box" id="${P}-bx-msg" style="flex:1;display:flex;flex-direction:column">
          <h5>${icMail} Messages（LLM 眼中的全世界 = 文字）</h5>
          <div class="${P}-msgs" id="${P}-msgs"></div>
        </div>
      </div>
      <div class="${P}-col">
        <div class="${P}-box" id="${P}-bx-brain" style="flex:1">
          <h5>${icBrainSm} LLM 大腦</h5>
          <div class="${P}-brain"><div class="em">${icBrainBig}</div><div class="cap" id="${P}-bcap">等待輸入…</div></div>
        </div>
      </div>
      <div class="${P}-col">
        <div class="${P}-box" id="${P}-bx-tool" style="flex:1">
          <h5>${icTools} Executor 工具箱（LLM 看不到程式碼）</h5>
          <div class="${P}-brain"><div class="${P}-gear" id="${P}-gear">${icGear}</div><div class="cap" id="${P}-tcap">get_weather()</div></div>
        </div>
      </div>`
    refs = {
      msgs: $('msgs'), bxMsg: $('bx-msg'), bxBrain: $('bx-brain'), bxTool: $('bx-tool'),
      bcap: $('bcap'), tcap: $('tcap'), gear: $('gear'),
    }
    addMsg('user', '幫我查台北天氣', '')
    addMsg('tools schema', '[ get_weather(city) ]', '')
    descEl.innerHTML = '訊息與工具清單已備好。按 <b>下一步</b> 送進大腦。'
    controls.innerHTML = `<button class="demo-btn primary" id="${P}-next">下一步 →</button><button class="demo-btn" id="${P}-reset">重來</button><span class="${P}-desc" id="${P}-prog" style="color:#8b91a4">步驟 0 / 6</span>`
    $('next').addEventListener('click', nextBasic)
    $('reset').addEventListener('click', buildBasic)
  }
  function addMsg(k, v, cls) {
    const m = document.createElement('div')
    m.className = `${P}-msg ${cls || ''}`
    m.innerHTML = `<div class="k">${k}</div>${v}`
    refs.msgs.appendChild(m)
    requestAnimationFrame(() => { m.classList.add('show'); refs.msgs.scrollTop = refs.msgs.scrollHeight })
    return m
  }
  function active(box) {
    ;['bxMsg', 'bxBrain', 'bxTool'].forEach(k => refs[k].classList.remove('active'))
    if (box) refs[box].classList.add('active')
  }
  function nextBasic() {
    if (animating || step >= 6) return
    animating = true
    step++
    $('prog').textContent = `步驟 ${step} / 6`
    const done = () => { animating = false }
    if (step === 1) {
      active('bxBrain')
      descEl.innerHTML = '<b>第 1 步</b>：訊息＋工具清單一起送進大腦。LLM 從頭到尾只看到文字。'
      refs.bcap.textContent = '讀取中…'
      fly(refs.bxMsg, refs.bxBrain, 'messages + schema', '', done)
    } else if (step === 2) {
      descEl.innerHTML = '<b>第 2 步</b>：大腦讀清單，決定點 get_weather，吐回一張「點單」外加 unique id。'
      refs.bcap.textContent = '決定用 get_weather'
      addMsg('assistant · tool_use', 'get_weather(city="Taipei")　id=<b style="color:'+accent+'">abc123</b>', 'tuse')
      done()
    } else if (step === 3) {
      active('bxTool')
      descEl.innerHTML = '<b>第 3 步</b>：點單飛到工具箱，executor 真正執行 — 這一步發生在你的 harness，不在 LLM。'
      refs.gear.classList.add('spin')
      fly(refs.bxBrain, refs.bxTool, 'tool_use abc123', '', done)
    } else if (step === 4) {
      descEl.innerHTML = '<b>第 4 步</b>：結果貼上<b>同一個 id abc123</b>，配對塞回 messages。ID 就是重組時的信號線。'
      refs.gear.classList.remove('spin')
      fly(refs.bxTool, refs.bxMsg, '晴 31°C · abc123', 'res', () => {
        addMsg('tool · tool_result', '{ weather: "晴", temp: 31 }　id=<b style="color:#4ade80">abc123</b>', 'tres')
        done()
      })
    } else if (step === 5) {
      active('bxBrain')
      descEl.innerHTML = '<b>第 5 步</b>：harness 把整串 history 重新組裝送回大腦 — 無狀態的它，就像「記得」剛剛做了什麼。'
      refs.bcap.textContent = '看到結果，繼續推理…'
      fly(refs.bxMsg, refs.bxBrain, '整串 messages（含結果）', '', done)
    } else if (step === 6) {
      descEl.innerHTML = '<b>完成</b>：大腦看到結果，輸出人話回答。loop 結束。'
      refs.bcap.textContent = '輸出最終回答'
      addMsg('assistant', '台北現在天氣晴，氣溫約 31°C', '')
      active(null)
      $('next').disabled = true
      done()
    }
  }

  // ---------- 進階：平行工具 ----------
  const TOOLCALLS = [
    { tool: 'get_weather(city="Taipei")', id: 'abc123' },
    { tool: 'get_weather(city="Tokyo")', id: 'def456' },
  ]
  const RESULTS = [
    { txt: '{ 晴, 31°C }', id: 'def456' }, // 刻意打亂順序
    { txt: '{ 陰, 24°C }', id: 'abc123' },
  ]
  // 註：內容對應 → abc123=台北(晴31)、def456=東京(陰24)；為了製造配對難度先亂放
  let selected = null, paired = 0
  function buildPar() {
    const slotHTML = TOOLCALLS.map(t => `
      <div class="${P}-slot" data-id="${t.id}">
        <div>tool_use · <span class="id">id=${t.id}</span></div>
        <div>${t.tool}</div>
        <div class="drop">把對應 id 的結果卡點進來</div>
      </div>`).join('')
    // 正確對應：abc123→晴31、def456→陰24（依城市），這裡 RESULTS 內容其實應綁定城市；
    // 用 id 直接判定配對是否正確
    const R = [
      { txt: '{ 晴, 31°C } 台北', id: 'abc123' },
      { txt: '{ 陰, 24°C } 東京', id: 'def456' },
    ].sort(() => Math.random() - 0.5)
    const trayHTML = R.map((r, i) => `
      <div class="${P}-rescard" data-id="${r.id}" data-i="${i}">
        <div>${r.txt}</div><div class="id">結果卡 · id=???（你要配對）</div>
      </div>`).join('')
    stage.innerHTML = `
      <div class="${P}-col">
        <div class="${P}-box active" style="flex:1">
          <h5>${icBrainSm} 大腦一次 fire 兩張點單（parallel tool_use）</h5>
          <div class="${P}-slots">${slotHTML}</div>
        </div>
      </div>
      <div class="${P}-col">
        <div class="${P}-box" style="flex:1">
          <h5>${icTools} 工具箱吐回兩張結果卡（順序打亂）</h5>
          <div class="${P}-tray">${trayHTML}</div>
        </div>
      </div>`
    selected = null; paired = 0
    descEl.innerHTML = '兩個工具平行執行，結果卡回來了但順序亂了。<b>先點一張結果卡，再點對應 id 的 tool_use 槽</b>。配錯 → loop 卡住抖動。'
    controls.innerHTML = `<button class="demo-btn" id="${P}-reset">重來</button><span class="${P}-desc" id="${P}-prog" style="color:#8b91a4">已配對 0 / 2</span>`
    $('reset').addEventListener('click', buildPar)
    stage.querySelectorAll(`.${P}-rescard`).forEach(c => c.addEventListener('click', () => selectCard(c)))
    stage.querySelectorAll(`.${P}-slot`).forEach(s => s.addEventListener('click', () => dropInto(s)))
  }
  function selectCard(c) {
    if (c.classList.contains('used')) return
    stage.querySelectorAll(`.${P}-rescard`).forEach(x => x.classList.remove('sel'))
    c.classList.add('sel'); selected = c
    descEl.innerHTML = '已選一張結果卡。現在點 <b>id 相符</b>的 tool_use 槽把它配上去。'
  }
  function dropInto(slot) {
    if (!selected) { descEl.innerHTML = '先點一張結果卡再選槽。'; return }
    if (slot.classList.contains('filled')) return
    if (slot.dataset.id === selected.dataset.id) {
      slot.classList.add('filled')
      slot.querySelector('.drop').innerHTML = `✓ ${selected.querySelector('div').textContent} · <b>id=${slot.dataset.id}</b>`
      selected.classList.add('used'); selected.classList.remove('sel'); selected = null
      paired++
      $('prog').textContent = `已配對 ${paired} / 2`
      if (paired === 2) {
        descEl.innerHTML = '<b style="color:#4ade80">兩張都配對成功！</b> id 對上了，harness 重組 messages 送回大腦，loop 繼續。'
      } else descEl.innerHTML = '配對正確 ✓ 再配下一張。'
    } else {
      slot.classList.add('wrong')
      setT(() => slot.classList.remove('wrong'), 420)
      descEl.innerHTML = '<b style="color:#f87171">id 配錯了！</b>tool_result 對不上 tool_use — 整個 loop 卡住，模型會拿到錯亂的 history。'
    }
  }

  function setMode(m) {
    timers.forEach(clearTimeout); timers.length = 0
    tbBasic.classList.toggle('on', m === 'basic')
    tbPar.classList.toggle('on', m === 'par')
    if (m === 'basic') buildBasic(); else buildPar()
  }
  tbBasic.addEventListener('click', () => setMode('basic'))
  tbPar.addEventListener('click', () => setMode('par'))
  buildBasic()

  return () => {
    timers.forEach(clearTimeout)
    style.remove(); root.remove()
  }
}
