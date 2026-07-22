// Demo：自我學習，就是超有紀律的記憶管理 — DemoStage 導演版
// 6 拍：四層管線｜跑 session 自動 capture｜dual-gate 滿→consolidate 成 L2｜confidence 升→promote L4｜關 Verifier→污染｜sandbox。
// 核心互動保留：runSession / dual-gate / consolidate / promote / Verifier 開關污染 / 打臉衰減。
import { createStage, pop, shake } from './_stage.js'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const GREEN = '#4ade80', RED = '#f87171'

  const style = document.createElement('style')
  style.textContent = `
    .sia-top{display:flex;gap:16px;flex-wrap:wrap;align-items:stretch;margin-bottom:14px}
    .sia-gate{flex:1;min-width:200px;background:#12151d;border:1px solid #232838;border-radius:12px;padding:12px 14px}
    .sia-gate h4{margin:0 0 8px;font-size:14px;color:#9aa0b0;font-weight:600}
    .sia-bar{height:12px;border-radius:6px;background:#1c2130;overflow:hidden;margin:6px 0 2px}
    .sia-bar>span{display:block;height:100%;width:0;transition:width .4s ease}
    .sia-bar .fill-t{background:${accent}}.sia-bar .fill-s{background:#a78bfa}
    .sia-barlbl{font-size:13px;color:#7c8296;display:flex;justify-content:space-between;font-family:var(--font-mono)}
    .sia-tokens{display:flex;align-items:center;gap:10px}
    .sia-tokens .num{font-family:var(--font-en,'Space Grotesk');font-size:26px;font-weight:700;color:#e6e9f2}
    .sia-veri{display:flex;align-items:center;gap:10px;background:#12151d;border:1px solid #232838;border-radius:12px;padding:12px 14px}
    .sia-switch{position:relative;width:52px;height:28px;border-radius:14px;background:#3a2030;border:1px solid #55283a;cursor:pointer;transition:.25s;flex:none}
    .sia-switch.on{background:#1e3a2a;border-color:#2f5c42}
    .sia-switch>i{position:absolute;top:2px;left:2px;width:22px;height:22px;border-radius:50%;background:${RED};transition:.25s}
    .sia-switch.on>i{left:26px;background:${GREEN}}
    .sia-veri-txt{font-size:14.5px;color:#e6e9f2}.sia-veri-txt small{display:block;color:#7c8296;font-size:12.5px}
    .sia-pipe{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px}
    .sia-col{background:#101319;border:1px solid #232838;border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:8px;min-height:190px;transition:border-color .3s,box-shadow .3s}
    .sia-col.polluted{border-color:${RED};box-shadow:0 0 0 1px ${RED} inset}
    .sia-col h3{margin:0;font-size:16px;font-weight:700;color:#e6e9f2}
    .sia-col .tag{font-size:12px;color:#7c8296;font-weight:400}
    .sia-cards{display:flex;flex-direction:column;gap:6px;overflow:auto}
    .sia-card{background:#181c26;border:1px solid #2a3040;border-radius:8px;padding:7px 9px;font-size:14px;line-height:1.45;color:#dfe3ec;animation:sia-in .35s ease}
    .sia-card.obs{border-left:3px solid ${accent}}
    .sia-card.bad{border-left-color:${RED};color:#f2b8b8}
    .sia-card.rejected{opacity:.5;text-decoration:line-through;border-left-color:${RED}}
    .sia-card .kv{color:#9aa0b0}
    .sia-inst{background:#1a1f2b;border:1px solid #2f3547;border-radius:8px;padding:8px 9px;font-size:14px;color:#e6e9f2;animation:sia-in .35s ease}
    .sia-inst.good{border-left:3px solid ${GREEN}}
    .sia-inst.bad{border-left:3px solid ${RED};background:#241417;color:#f2b8b8}
    .sia-conf{height:8px;border-radius:4px;background:#0e1118;margin-top:6px;overflow:hidden}
    .sia-conf>span{display:block;height:100%;transition:width .5s ease}
    .sia-confnum{font-family:var(--font-mono);font-size:12px;color:#9aa0b0;margin-top:3px}
    .sia-ctrls{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
    .sia-ctrls .demo-btn{font-size:15px}
    .sia-note{font-size:14px;color:#8b90a2;flex:1;min-width:160px;line-height:1.5}
    .sia-note .warn{color:${RED};font-weight:600}.sia-note .good{color:${GREEN};font-weight:600}
    @keyframes sia-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  `
  el.appendChild(style)

  const top = document.createElement('div')
  top.className = 'sia-top'
  top.innerHTML = `
    <div class="sia-gate ds-unit" data-u="gate">
      <h4>Dual-gate（兩條都滿才 consolidate）</h4>
      <div class="sia-barlbl"><span>時間 gate</span><span class="lbl-t">0%</span></div>
      <div class="sia-bar"><span class="fill-t"></span></div>
      <div class="sia-barlbl"><span>session gate</span><span class="lbl-s">0 / 3</span></div>
      <div class="sia-bar"><span class="fill-s"></span></div>
    </div>
    <div class="sia-gate ds-unit" data-u="tok">
      <h4>Token 成本</h4>
      <div class="sia-tokens"><span class="num">0</span><span style="color:#7c8296;font-size:12px">capture 便宜 · consolidate 貴</span></div>
    </div>
    <div class="sia-veri ds-unit" data-u="veri">
      <div class="sia-switch on"><i></i></div>
      <div class="sia-veri-txt">Verifier（獨立 Haiku）<small>攔截自圓其說的錯誤 observation</small></div>
    </div>`

  const pipe = document.createElement('div')
  pipe.className = 'sia-pipe ds-unit'
  pipe.innerHTML = `
    <div class="sia-col" data-col="l1"><h3>L1 <span class="tag">Raw Data</span></h3><div class="sia-cards"></div></div>
    <div class="sia-col" data-col="l2"><h3>L2 <span class="tag">Instincts</span></h3><div class="sia-cards"></div></div>
    <div class="sia-col" data-col="l3"><h3>L3 <span class="tag">Skills</span></h3><div class="sia-cards"></div></div>
    <div class="sia-col" data-col="l4"><h3>L4 <span class="tag">Strategic</span></h3><div class="sia-cards"></div></div>`

  const ctrls = document.createElement('div')
  ctrls.className = 'sia-ctrls ds-unit'
  ctrls.innerHTML = `
    <button class="demo-btn primary act-run">跑一個 session</button>
    <button class="demo-btn act-hit">打臉它（餵矛盾證據）</button>
    <button class="demo-btn act-reset">重來</button>
    <span class="sia-note"></span>`

  let stage
  const $ = s => (top.querySelector(s) || pipe.querySelector(s) || ctrls.querySelector(s))
  const cols = {
    l1: pipe.querySelector('[data-col="l1"] .sia-cards'), l2: pipe.querySelector('[data-col="l2"] .sia-cards'),
    l3: pipe.querySelector('[data-col="l3"] .sia-cards'), l4: pipe.querySelector('[data-col="l4"] .sia-cards'),
  }
  const fillT = $('.fill-t'), fillS = $('.fill-s'), lblT = $('.lbl-t'), lblS = $('.lbl-s')
  const tokEl = $('.sia-tokens .num'), sw = $('.sia-switch'), note = $('.sia-note')

  const SCRIPT = [
    { c: '深色 UI 專案', m: '純黑背景配深灰字', r: '對比不足看不清', why: '色差太小', adv: '深背景一律用白字', bad: false },
    { c: 'React 表單', m: '未受控 input', r: '狀態不同步', why: '沒 single source', adv: 'form state 集中管理', bad: false },
    { c: 'API 逾時', m: '無限重試', r: '雪崩', why: '沒退避', adv: '重試要指數退避', bad: false },
    { c: '一次 flaky test', m: '重跑一次過了', r: '綠燈', why: '（我猜）環境剛好穩了', adv: 'flaky test 直接重跑即可', bad: true },
  ]

  const timers = new Set()
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  let state
  function resetScene() {
    clearT()
    state = { sessions: 0, timeGate: 0, sessionGate: 0, tokens: 0, verifier: true, pending: [], good: null, bad: null, scriptIdx: 0 }
    sw.classList.add('on')
    Object.values(cols).forEach(c => c.innerHTML = '')
    pipe.querySelectorAll('.sia-col').forEach(c => c.classList.remove('polluted'))
    note.textContent = ''
    render()
  }
  function render() {
    fillT.style.width = state.timeGate + '%'
    fillS.style.width = (state.sessionGate / 3 * 100) + '%'
    lblT.textContent = Math.round(state.timeGate) + '%'
    lblS.textContent = state.sessionGate + ' / 3'
    tokEl.textContent = state.tokens
  }
  function card(html, cls) { const d = document.createElement('div'); d.className = 'sia-card ' + (cls || ''); d.innerHTML = html; return d }
  function trim(col, max) { while (col.children.length > max) col.removeChild(col.firstChild) }

  function runSession() {
    state.sessions++
    cols.l1.appendChild(card(`<span class="kv">session #${state.sessions} transcript</span><br>使用者：這裡壞了… / agent：試 patch…`, ''))
    trim(cols.l1, 4); state.tokens += 2
    const obs = SCRIPT[state.scriptIdx % SCRIPT.length]; state.scriptIdx++
    const obsHtml = `<b>Observation</b><br><span class="kv">情境</span> ${obs.c}<br><span class="kv">方法</span> ${obs.m}<br><span class="kv">結果</span> ${obs.r}<br><span class="kv">建議</span> ${obs.adv}`
    later(() => {
      if (obs.bad && state.verifier) {
        const c = card(obsHtml + `<br><span style="color:${RED}">✗ Verifier 攔截：自評不可靠，丟棄</span>`, 'obs rejected')
        cols.l1.appendChild(c); trim(cols.l1, 5)
        note.innerHTML = 'Verifier 攔下一筆「flaky test 直接重跑」的錯誤結論，沒進 L2。'
        later(() => c.remove(), 1600)
      } else {
        cols.l1.appendChild(card(obsHtml, 'obs ' + (obs.bad ? 'bad' : ''))); trim(cols.l1, 5)
        state.pending.push(obs)
        if (obs.bad) note.innerHTML = '<span class="warn">一筆錯誤 observation 溜進 pipeline（Verifier 關著）</span>'
      }
      state.timeGate = Math.min(100, state.timeGate + 40)
      state.sessionGate = Math.min(3, state.sessionGate + 1)
      state.tokens += 3; render()
      if (state.timeGate >= 100 && state.sessionGate >= 3) later(consolidate, 500)
    }, 350)
  }

  function upsertInstinct(kind, delta = 0.3) {
    let inst = state[kind]
    if (!inst) {
      inst = state[kind] = { conf: 0.3, layer: 2, el: null }
      const d = document.createElement('div')
      d.className = 'sia-inst ' + kind
      d.innerHTML = `<b>${kind === 'good' ? '深背景一律用白字' : 'flaky test 直接重跑即可'}</b>
        <span class="kv">${kind === 'good' ? '（多專案反覆驗證）' : '（未驗證的錯誤模式）'}</span>
        <div class="sia-conf"><span></span></div><div class="sia-confnum"></div>`
      inst.el = d; cols.l2.appendChild(d)
    } else inst.conf = Math.max(0, Math.min(1, inst.conf + delta))
    updateInstinct(inst, kind)
  }
  function updateInstinct(inst, kind) {
    const bar = inst.el.querySelector('.sia-conf>span')
    bar.style.width = (inst.conf * 100) + '%'; bar.style.background = kind === 'good' ? GREEN : RED
    inst.el.querySelector('.sia-confnum').textContent = 'confidence ' + inst.conf.toFixed(1)
    let target = 2
    if (inst.conf >= 0.9) target = 4; else if (inst.conf >= 0.6) target = 3
    if (target !== inst.layer) {
      inst.layer = target; cols['l' + target].appendChild(inst.el)
      inst.el.style.animation = 'none'; inst.el.offsetHeight; inst.el.style.animation = 'sia-in .35s ease'; pop(inst.el)
      if (kind === 'good') note.innerHTML = `<span class="good">✓</span> instinct 升到 <b>L${target}</b>（confidence ${inst.conf.toFixed(1)}）— 反覆出現 → promote`
      if (kind === 'bad' && target >= 3) pollute()
    }
  }
  function pollute() {
    pipe.querySelector('[data-col="l3"]').classList.add('polluted')
    pipe.querySelector('[data-col="l4"]').classList.add('polluted')
    shake(pipe)
    note.innerHTML = `<span class="warn">管線被污染：沒有 Verifier，錯誤模式被學成高信心 L${state.bad.layer} 規則。這就是為什麼實作者與評審必須分離。</span>`
  }
  function consolidate() {
    const goods = state.pending.filter(o => !o.bad).length
    const bads = state.pending.filter(o => o.bad).length
    state.pending = []; state.timeGate = 0; state.sessionGate = 0; state.tokens += 12; render()
    if (goods) upsertInstinct('good')
    if (bads) upsertInstinct('bad')
    if (!note.innerHTML.includes('污染'))
      note.innerHTML = `Consolidate：${goods + bads} 筆 observation 蒸餾成 instinct（貴，所以要 dual-gate 累積夠才做）`
  }
  function hit() {
    const target = state.bad || state.good
    if (!target) { note.textContent = '目前還沒有 instinct 可打臉，先跑幾個 session。'; return }
    const kind = target === state.bad ? 'bad' : 'good'
    target.conf = Math.max(0, target.conf - 0.3)
    if (target.conf < 0.6 && kind === 'bad') {
      pipe.querySelector('[data-col="l3"]').classList.remove('polluted')
      pipe.querySelector('[data-col="l4"]').classList.remove('polluted')
    }
    updateInstinct(target, kind)
    note.innerHTML = `餵一筆矛盾證據 → confidence 衰減到 ${target.conf.toFixed(1)}`
  }
  function setVerifier(on) { state.verifier = on; sw.classList.toggle('on', on) }

  $('.act-run').addEventListener('click', () => { pop($('.act-run')); runSession() })
  $('.act-hit').addEventListener('click', () => { pop($('.act-hit')); hit() })
  $('.act-reset').addEventListener('click', () => { resetScene() })
  sw.addEventListener('click', () => {
    setVerifier(!state.verifier)
    note.textContent = state.verifier ? 'Verifier 開：錯誤 observation 進 L2 前被攔下。' : 'Verifier 關：跑到第 4 個 session 會混進錯誤結論。'
  })

  const beats = [
    { narration: '記憶不是一種東西，是<b>四層</b>：L1 原始資料 → L2 本能 → L3 技能 → L4 策略。學習就是資訊沿著它往上蒸餾。',
      focus: ['[data-col="l1"]', '[data-col="l2"]', '[data-col="l3"]', '[data-col="l4"]'], nextLabel: '跑一個 session →',
      enter() { resetScene() } },

    { narration: '按跑一個 session：Hook <b>一定觸發</b>，自動 capture 一筆 observation 掉進 L1，dual-gate 開始累積。',
      focus: ['[data-u="gate"]', '[data-col="l1"]'], nextLabel: 'gate 滿了會怎樣 →',
      enter() { resetScene(); later(runSession, 300) } },

    { narration: 'dual-gate 兩條都滿 → 自動 <b>consolidate</b>：多筆 observation 被蒸餾成一條 L2 instinct（capture 便宜、consolidate 貴）。',
      focus: ['[data-u="gate"]', '[data-col="l2"]'], nextLabel: 'confidence 會怎樣 →',
      enter() { resetScene(); [0, 550, 1100].forEach((d, i) => later(runSession, d + i * 40)) } },

    { narration: '同一條 instinct 在不同專案反覆出現，<b>confidence 一路升到 0.9 → promote</b> 到 L4 策略層。',
      focus: ['[data-col="l2"]', '[data-col="l3"]', '[data-col="l4"]'], nextLabel: '關掉 Verifier 看看 →',
      enter() {
        resetScene()
        later(() => upsertInstinct('good'), 300)
        later(() => upsertInstinct('good', 0.3), 1100)
        later(() => upsertInstinct('good', 0.3), 1900)
      } },

    { narration: '<b>關掉 Verifier</b>：一筆自圓其說的錯誤結論沒被攔，長成高信心規則 — 整條管線被污染。這就是為什麼實作者與評審必須分離。',
      focus: ['[data-u="veri"]', '[data-col="l3"]', '[data-col="l4"]'], nextLabel: '換你養 →',
      enter() {
        resetScene(); setVerifier(false)
        later(() => { cols.l1.appendChild(card('<b>Observation</b><br><span class="kv">建議</span> flaky test 直接重跑即可', 'obs bad')); trim(cols.l1, 5) }, 300)
        later(() => upsertInstinct('bad'), 900)
        later(() => upsertInstinct('bad', 0.3), 1600)
      } },

    { narration: '換你養一隻會學習的 agent — 跑 session、開關 Verifier、<b>打臉它</b>餵矛盾證據看 confidence 衰減。',
      sandbox: true, enter() { resetScene() } },
  ]

  stage = createStage(el, ctx, { beats })
  stage.body.append(top, pipe, ctrls)

  return () => { clearT(); stage.destroy(); style.remove() }
}
