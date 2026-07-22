// Sub-agents — 卡住了？叫 AI 去找幫手（DemoStage 導演版）
// 5 拍：① 主 agent 在同一個 context window 繞太久、思路被污染 ② 繼續凹 → context 爆掉（對照）
// ③ Spawn 一個乾淨腦袋，把問題摘要壓成封包飛過去、乾淨視角想一次 ④ feedback 飛回、盲點被戳破、污染下降
// ⑤ sandbox 自由 spawn / 繼續凹 / 重來。
import { createStage, pop, shake, confettiBurst } from './_stage.js'

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#5b8cff'
  const GREEN = '#4ade80', RED = '#f87171'
  const ico = (d, s = 18) => `<svg class="sa-ico" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
  const P_EYE = '<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>'
  const P_PERSON = '<circle cx="12" cy="8" r="3.2"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>'
  const P_LOOP = '<path d="M4 9a8 8 0 0 1 13.5-4M20 5v4h-4"/><path d="M20 15a8 8 0 0 1-13.5 4M4 19v-4h4"/>'
  const P_BURST = '<path d="M12 2l2.2 5.2L20 5l-2.4 5.6L23 12l-5.4 1.4L20 19l-5.8-2.2L12 22l-2.2-5.2L4 19l2.4-5.6L1 12l5.4-1.4L4 5l5.8 2.2z"/>'
  const P_BOX = '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>'
  const P_THINK = '<rect x="3" y="5" width="18" height="12" rx="3"/><circle cx="8" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="11" r="1" fill="currentColor" stroke="none"/>'
  const P_BULB = '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.2V16h6v-.3c0-.8.4-1.6 1-2.2A6 6 0 0 0 12 3z"/>'

  const style = document.createElement('style')
  style.id = 'sa-css'
  style.textContent = `
    .sa-ico{vertical-align:-.18em;flex:none}
    .sa-stage{display:grid;grid-template-columns:1fr 88px 1fr;gap:0;min-height:320px}
    .sa-col{background:#101319;border:1px solid #232838;border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:10px;min-height:0}
    .sa-col h3{margin:0;font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px}
    .sa-col h3 .dot{width:9px;height:9px;border-radius:50%;background:#555;transition:background .3s}
    .sa-ctxbar{height:16px;border-radius:8px;background:#0c0f16;overflow:hidden;position:relative}
    .sa-ctxbar>span{display:block;height:100%;width:8%;transition:width .3s,background .3s}
    .sa-ctxlbl{font-size:14px;color:#7c8296;display:flex;justify-content:space-between}
    .sa-log{flex:1;overflow:auto;display:flex;flex-direction:column;gap:6px;padding-right:2px;max-height:280px}
    .sa-msg{background:#181c26;border:1px solid #2a3040;border-radius:8px;padding:7px 10px;font-size:15px;line-height:1.5;animation:sa-in .3s ease}
    .sa-msg.me{color:#9aa0b0}
    .sa-msg.loop{border-left:3px solid #b58b4a;color:#d8b98a}
    .sa-msg.aha{border-left:3px solid ${GREEN};color:#bff0d0;font-weight:600}
    .sa-msg.dead{border-left:3px solid ${RED};color:#f2b8b8;font-weight:600}
    .sa-empty{color:#5a6070;font-size:15px;text-align:center;margin:auto;padding:20px;line-height:1.7}
    .sa-empty .sa-ico{color:${accent}}
    .sa-mid{display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative}
    .sa-packet{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:#12151d;border:1px solid ${accent};border-radius:8px;padding:6px 8px;font-size:13px;color:#c3c8d8;opacity:0;pointer-events:none;white-space:nowrap;max-width:180px;text-align:center;line-height:1.35}
    .sa-sub{border-style:dashed;border-color:#2c3550;opacity:.6}
    .sa-sub.alive{opacity:1;border-style:solid;border-color:${accent}}
    .sa-badge{font-size:13px;padding:2px 8px;border-radius:10px;background:#1c2130;color:#9aa0b0;font-weight:400}
    .sa-ctrls{display:none;gap:10px;flex-wrap:wrap;align-items:center;margin-top:14px}
    .sa-ctrls.show{display:flex}
    .sa-ctrls .demo-btn{font-size:16px;display:inline-flex;align-items:center;gap:7px}
    .sa-note{font-size:15px;color:#8b90a2;flex:1;min-width:180px;line-height:1.5}
    @keyframes sa-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
    @keyframes sa-fly{0%{opacity:0;left:8%}20%{opacity:1}80%{opacity:1}100%{opacity:0;left:82%}}
    @keyframes sa-flyback{0%{opacity:0;left:82%}20%{opacity:1}80%{opacity:1}100%{opacity:0;left:8%}}
    @keyframes sa-think{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.12)}}
    @media(max-width:820px){.sa-stage{grid-template-columns:1fr;gap:10px}.sa-mid{height:40px}}
  `

  const stage = createStage(el, ctx, { beats: buildBeats() })
  document.head.appendChild(style)

  stage.body.innerHTML = `
    <div class="sa-stage">
      <div class="sa-col sa-main ds-unit">
        <h3><span class="dot"></span>主 Agent · context window <span class="sa-badge">繞了很久</span></h3>
        <div class="sa-ctxlbl"><span>污染程度</span><span class="sa-mpct">8%</span></div>
        <div class="sa-ctxbar"><span class="sa-mbar"></span></div>
        <div class="sa-log sa-mlog"></div>
      </div>
      <div class="sa-mid ds-unit"><div class="sa-packet"></div></div>
      <div class="sa-col sa-sub ds-unit">
        <h3><span class="dot"></span>Sub-agent · 全新 context <span class="sa-badge">乾淨腦袋</span></h3>
        <div class="sa-ctxlbl"><span>污染程度</span><span class="sa-spct">—</span></div>
        <div class="sa-ctxbar"><span class="sa-sbar" style="width:0"></span></div>
        <div class="sa-log sa-slog"></div>
      </div>
    </div>
    <div class="sa-ctrls ds-unit">
      <button class="demo-btn primary act-spawn">${ico(P_PERSON, 17)} Spawn Sub-agent</button>
      <button class="demo-btn act-grind">${ico(P_LOOP, 17)} 不 spawn，繼續凹</button>
      <button class="demo-btn act-reset">重來</button>
      <span class="sa-note"></span>
    </div>`

  const $ = s => stage.body.querySelector(s)
  const mbar = $('.sa-mbar'), mpct = $('.sa-mpct'), mlog = $('.sa-mlog')
  const sbar = $('.sa-sbar'), spct = $('.sa-spct'), slog = $('.sa-slog')
  const subCol = $('.sa-sub'), maindot = $('.sa-main .dot'), subdot = $('.sa-sub .dot')
  const packet = $('.sa-packet'), note = $('.sa-note'), ctrls = $('.sa-ctrls')
  const EMPTY = `<div class="sa-empty">還沒 spawn。<br>卡住時走到隔壁<br>找同事看一下 ${ico(P_EYE, 17)}</div>`
  const LOOPS = ['再試一次 patch A…', '還是不行…', '回到 patch A 換個寫法…', '一樣 fail…', '會不會是 patch A 少一行？', '不對，還是壞的…']

  const timers = new Set()
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }
  let state

  function renderMain() {
    mbar.style.width = state.pollution + '%'
    mpct.textContent = Math.round(state.pollution) + '%'
    const t = Math.min(1, state.pollution / 100), from = [91, 140, 255], to = [150, 110, 60]
    const c = from.map((v, i) => Math.round(v + (to[i] - v) * t))
    mbar.style.background = `rgb(${c[0]},${c[1]},${c[2]})`
    maindot.style.background = state.pollution > 85 ? RED : (state.pollution > 55 ? '#b58b4a' : accent)
  }
  function addMain(cls, html) {
    const d = document.createElement('div'); d.className = 'sa-msg ' + cls; d.innerHTML = html
    mlog.appendChild(d); mlog.scrollTop = mlog.scrollHeight
    while (mlog.children.length > 40) mlog.removeChild(mlog.firstChild)
  }
  function addSub(text) {
    const d = document.createElement('div'); d.className = 'sa-msg'; d.textContent = text
    slog.appendChild(d); slog.scrollTop = slog.scrollHeight
  }
  function addLoop() {
    addMain('loop', LOOPS[state.loopIdx % LOOPS.length]); state.loopIdx++
    state.pollution = Math.min(100, state.pollution + 11); renderMain()
  }
  function flyPacket(text, anim, done) {
    packet.textContent = text; packet.style.animation = 'none'; packet.offsetHeight
    packet.style.animation = anim + ' 1.2s ease forwards'; later(done, 1250)
  }

  function grind() {
    if (state.busy || state.pollution >= 100) return
    addLoop(); shake($('.sa-main'))
    if (state.pollution >= 100) {
      addMain('dead', ico(P_BURST, 16) + ' context 爆掉：塞滿失敗嘗試，越繞越出不來。')
      maindot.style.background = RED
      note.innerHTML = `<span style="color:${RED}">繼續凹的下場：同一個腦袋在污染的 context 裡鑽到爆。這時該做的是換乾淨的腦袋。</span>`
    } else note.textContent = '兩個人一起鑽牛角尖，越討論越深 — context 又濁了一點。'
  }

  function spawnOut(done) {
    if (state.busy) return
    state.busy = true
    note.textContent = '① 主 agent 把當前 context 壓成一個「問題摘要」封包…'
    slog.innerHTML = ''
    subCol.classList.add('alive'); subdot.style.background = accent
    sbar.style.width = '6%'; sbar.style.background = accent; spct.textContent = '6%'
    addSub('（乾淨 context，不知道你這三小時的掙扎）')
    flyPacket(ico(P_BOX, 15) + ' 問題摘要：測試偶爾 fail，我一直在改 patch A', 'sa-fly', () => {
      note.textContent = '② Sub-agent 用乾淨腦袋想一次…'
      packet.style.animation = 'sa-think 1s ease infinite'; packet.style.opacity = '1'
      packet.innerHTML = ico(P_THINK, 15) + ' 思考中…'
      later(() => {
        packet.style.animation = 'none'; packet.style.opacity = '0'
        addSub('看了一下 — 問題不在 patch。')
        later(() => { addSub('是測試環境的 env var 沒設，本機剛好有、CI 沒有。'); state.ready = true; state.busy = false; done && done() }, 850)
      }, 1100)
    })
  }
  function spawnBack(done) {
    if (state.busy || !state.ready) return
    state.busy = true; state.ready = false
    flyPacket(ico(P_BULB, 15) + ' 不是 patch，是缺 env var', 'sa-flyback', () => {
      addMain('aha', '啊對！根本不是 patch 的問題，是 env var！')
      addMain('me', '設好 env var → 測試綠燈，繼續推進。')
      state.pollution = Math.max(20, state.pollution - 30); renderMain()
      const r = $('.sa-main').getBoundingClientRect(), br = stage.body.getBoundingClientRect()
      confettiBurst(stage.body, r.left - br.left + 60, r.top - br.top + 40, GREEN, 20)
      note.innerHTML = `正因為 sub-agent <b style="color:${GREEN}">不知道</b>你的掙扎細節，才看得到你看不到的盲點 — 這就是全新 context 的優勢。`
      state.busy = false; done && done()
    })
  }
  function spawnFull() { spawnOut(() => later(() => spawnBack(), 400)) }

  function resetScene() {
    clearT()
    state = { pollution: 8, busy: false, loopIdx: 0, ready: false }
    mlog.innerHTML = ''; slog.innerHTML = EMPTY
    subCol.classList.remove('alive'); subdot.style.background = '#555'
    sbar.style.width = '0'; spct.textContent = '—'
    packet.style.animation = 'none'; packet.style.opacity = '0'
    addMain('me', '需求：修好這個 flaky 的整合測試。')
    addLoop(); addLoop(); renderMain()
    note.textContent = ''; ctrls.classList.remove('show')
  }

  $('.act-spawn').addEventListener('click', () => { pop($('.act-spawn')); spawnFull() })
  $('.act-grind').addEventListener('click', () => { pop($('.act-grind')); grind() })
  $('.act-reset').addEventListener('click', () => { pop($('.act-reset')); resetScene(); ctrls.classList.add('show') })

  function buildBeats() {
    return [
      { narration: '主 agent 在<b>同一個 context window</b> 繞太久，思路被污染 — 顏色越來越濁。', focus: ['.sa-main'], nextLabel: '繼續凹會怎樣？ →',
        enter() { resetScene(); later(() => addLoop(), 500); later(() => addLoop(), 1000) } },

      { narration: '繼續凹的下場：同一顆腦袋越繞越深，context 一路<b>塞滿失敗嘗試直到爆掉</b>。', focus: ['.sa-main'], nextLabel: '有更好的解 →',
        enter() {
          resetScene()
          const bump = () => { if (state.pollution < 100) { addLoop(); shake($('.sa-main')); later(bump, 340) } else { addMain('dead', ico(P_BURST, 16) + ' context 爆掉：越繞越出不來。'); maindot.style.background = RED } }
          later(bump, 400)
        } },

      { narration: '換個做法：<b>Spawn 一個乾淨腦袋</b>的 sub-agent，把問題摘要壓成封包丟過去、用全新 context 想一次。', focus: ['.sa-main', '.sa-mid', '.sa-sub'], nextLabel: 'feedback 帶回來 →',
        enter() { resetScene(); later(() => spawnOut(), 500) } },

      { narration: 'sub-agent 帶著 feedback 飛回主 session — 盲點被<b>外部視角</b>戳破，污染度直接下降。', focus: ['.sa-main'], nextLabel: '換我試 →',
        enter() {
          resetScene(); subCol.classList.add('alive'); subdot.style.background = accent
          sbar.style.width = '6%'; sbar.style.background = accent; spct.textContent = '6%'
          slog.innerHTML = ''; addSub('看了一下 — 問題不在 patch。'); addSub('是測試環境的 env var 沒設，本機剛好有、CI 沒有。')
          state.ready = true; later(() => spawnBack(), 500)
        } },

      { narration: '換你試 — <b>Spawn</b> 開乾淨腦袋救場，或按 <b>繼續凹</b> 看它鑽到爆，<b>重來</b>重置。', sandbox: true,
        enter() { resetScene(); ctrls.classList.add('show') } },
    ]
  }

  return () => { clearT(); style.remove(); stage.destroy() }
}
