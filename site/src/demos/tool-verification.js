// Demo：先確認 Tool 真的有動 — DemoStage 導演版
// 5 拍：同一任務「讀檔→比對→輸出報告」跑兩遍｜左不驗證一路順｜翻牌全錯｜右每步逼回報蓋綠章｜sandbox 自由跑+救回。
// 核心互動保留：翻牌對比 + 左側每步「要求回報」把靜默失敗救回正軌。
import { createStage, pop, shake, enterFly, confettiBurst } from './_stage.js'

const GREEN = '#4ade80', RED = '#f87171', BLUE = '#8fb0ff'

// 左：不驗證 —— tool 靜默失敗，AI 一路順暢接龍
const LEFT = [
  { t: '讀檔', ai: '好的，已讀取報表檔。', truth: 'tool 回傳空的，一列都沒讀到（靜默失敗）', rescue: '你到底讀到什麼？共幾列？' },
  { t: '比對', ai: '比對完成，資料大致一致。', truth: '拿空資料在比對，結論是憑空編的', rescue: '把你比對的前三列貼出來。' },
  { t: '輸出報告', ai: '報表已完成，品質良好，通過 29／29。', truth: '整份報告都是接龍出來的漂亮話', rescue: '這 29 列的來源是哪個檔？' },
]
// 右：有驗證 —— 每步先逼回報，屬實才前進
const RIGHT = [
  { t: '讀檔', ask: '先別急 — 你讀到什麼？共幾列？', reply: '讀到 sales_2026Q2.csv，共 29 列。', ok: '回報 29 列，屬實' },
  { t: '比對', ask: '比對依據在第幾列？舉例。', reply: '第 14 列金額為負、第 22 列日期格式不符。', ok: '指得出列號，屬實' },
  { t: '輸出報告', ask: '結論每個數字都對得上前面回報嗎？', reply: '總 29、通過 27、需修正 2，與前述一致。', ok: '數字對得上，屬實' },
]

export default function mount(el, ctx) {
  const style = document.createElement('style')
  style.textContent = `
  .tv-cols{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:16px}
  @media(max-width:820px){.tv-cols{grid-template-columns:1fr}}
  .tv-card{border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(255,255,255,.02);
    display:flex;flex-direction:column;overflow:hidden;position:relative}
  .tv-card.bad{border-color:rgba(248,113,113,.45)}
  .tv-card.good{border-color:rgba(74,222,128,.45)}
  .tv-ch{padding:13px 17px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:baseline;gap:10px}
  .tv-ch .t{font-size:18px;font-weight:600;color:#eef1f7}
  .tv-ch .s{font-family:var(--font-mono);font-size:12px;letter-spacing:.14em}
  .tv-steps{padding:12px 17px;display:flex;flex-direction:column;gap:10px;flex:1}
  .tv-step{border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px 13px;opacity:.35;transition:opacity .35s,border-color .35s,background .35s}
  .tv-step.on{opacity:1}
  .tv-step .hd{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:600;color:#e8ebf2}
  .tv-step .hd .num{width:20px;height:20px;border-radius:50%;border:1px solid #5a6072;font-size:12px;
    display:inline-flex;align-items:center;justify-content:center;flex:none;color:#9aa0b0;font-family:var(--font-mono)}
  .tv-step .ln{font-size:14.5px;line-height:1.5;margin-top:6px;padding-left:28px}
  .tv-step .ai{color:#c3c8d4}
  .tv-step .ask{color:${BLUE};display:none}
  .tv-step .reply{color:#c3c8d4;display:none}
  .tv-step .ok{color:${GREEN};display:none;font-size:13.5px}
  .tv-step .ok::before{content:'✓ ';font-weight:700}
  .tv-step .truth{color:${RED};display:none;font-size:13.5px}
  .tv-step .truth::before{content:'真相：'}
  .tv-step.showask .ai{display:none}.tv-step.showask .ask,.tv-step.showask .reply{display:block}
  .tv-step.verified .ok{display:block}
  .tv-step.verified{border-color:rgba(74,222,128,.4);background:rgba(74,222,128,.06)}
  .tv-step.revealed .truth{display:block}
  .tv-step.revealed .ai{color:#8a8f9e;text-decoration:line-through}
  .tv-step.revealed{border-color:rgba(248,113,113,.42);background:rgba(248,113,113,.07)}
  .tv-step.rescued{border-color:rgba(143,176,255,.5);background:rgba(143,176,255,.08)}
  .tv-step.rescued .ai{color:${BLUE};text-decoration:none}
  .tv-rescue{margin-top:9px;margin-left:28px;font-size:13px;padding:5px 12px;display:none}
  .tv-sandbox .tv-step.on:not(.verified):not(.rescued) .tv-rescue{display:inline-flex}
  .tv-verdict{margin:2px 17px 14px;border-radius:10px;padding:11px 14px;font-size:14.5px;font-weight:600;
    display:none;line-height:1.55}
  .tv-verdict.show{display:block}
  .tv-verdict.bad{color:${RED};background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.32)}
  .tv-verdict.good{color:${GREEN};background:rgba(74,222,128,.12);border:1px solid rgba(74,222,128,.32)}
  .tv-stamp{position:absolute;top:54px;right:16px;font-family:var(--font-mono);font-size:13px;font-weight:700;
    letter-spacing:.16em;padding:5px 12px;border-radius:7px;transform:rotate(-8deg) scale(.6);opacity:0;
    transition:opacity .3s,transform .3s;color:${GREEN};border:2px solid ${GREEN}}
  .tv-stamp.show{opacity:1;transform:rotate(-8deg) scale(1)}
  .tv-ctrls{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
  .tv-hint{font-size:14px;color:#7d8496}
  `
  el.appendChild(style)

  const cols = document.createElement('div')
  cols.className = 'tv-cols'
  cols.innerHTML = `
    <div class="tv-card bad ds-unit" data-card="L">
      <div class="tv-ch"><span class="t">不驗證</span><span class="s" style="color:${RED}">SILENT FAIL</span></div>
      <div class="tv-steps">${LEFT.map((s, i) => `
        <div class="tv-step" data-side="L" data-i="${i}">
          <div class="hd"><span class="num">${i + 1}</span>${s.t}</div>
          <div class="ln ai">AI：${s.ai}</div>
          <div class="ln truth">${s.truth}</div>
          <button class="demo-btn tv-rescue" data-rescue="${i}">要求回報</button>
        </div>`).join('')}</div>
      <div class="tv-verdict bad" data-verdict="L">翻牌全錯 — tool 沒 trigger 成功，後面的接龍全是聊爽的。</div>
    </div>
    <div class="tv-card good ds-unit" data-card="R">
      <div class="tv-ch"><span class="t">有驗證</span><span class="s" style="color:${GREEN}">VERIFIED</span></div>
      <span class="tv-stamp" data-stamp>抵達 · 通過</span>
      <div class="tv-steps">${RIGHT.map((s, i) => `
        <div class="tv-step showask" data-side="R" data-i="${i}">
          <div class="hd"><span class="num">${i + 1}</span>${s.t}</div>
          <div class="ln ask">要求：${s.ask}</div>
          <div class="ln reply">回報：${s.reply}</div>
          <div class="ln ok">${s.ok}</div>
        </div>`).join('')}</div>
      <div class="tv-verdict good" data-verdict="R">每步都對得上證據，開到台北蓋綠章。</div>
    </div>`

  const ctrls = document.createElement('div')
  ctrls.className = 'tv-ctrls ds-unit'
  ctrls.innerHTML = `
    <button class="demo-btn primary" data-b="run">兩邊一起跑</button>
    <button class="demo-btn" data-b="reveal">左邊翻牌</button>
    <button class="demo-btn" data-b="reset">重來</button>
    <span class="tv-hint">左邊每一步都能按「要求回報」把它救回正軌。</span>`

  let stage
  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }
  const stepEl = (side, i) => cols.querySelector(`.tv-step[data-side="${side}"][data-i="${i}"]`)
  const verdict = s => cols.querySelector(`[data-verdict="${s}"]`)
  const stamp = cols.querySelector('[data-stamp]')

  function resetScene() {
    clearT()
    cols.querySelectorAll('.tv-step').forEach(s => s.classList.remove('on', 'revealed', 'verified', 'rescued'))
    cols.querySelectorAll('.tv-verdict').forEach(v => v.classList.remove('show'))
    stamp.classList.remove('show')
    cols.classList.remove('tv-sandbox')
    ctrls.querySelectorAll('.demo-btn').forEach(b => b.disabled = false)
  }

  function runLeft(step = 460) {
    LEFT.forEach((_, i) => T(() => { const s = stepEl('L', i); s.classList.add('on'); pop(s) }, i * step))
  }
  function revealLeft(delay = 0) {
    LEFT.forEach((_, i) => T(() => {
      const s = stepEl('L', i)
      if (!s.classList.contains('rescued')) { s.classList.add('revealed'); shake(s) }
    }, delay + i * 180))
    T(() => verdict('L').classList.add('show'), delay + LEFT.length * 180 + 120)
  }
  function runRight(step = 460) {
    RIGHT.forEach((_, i) => {
      T(() => { const s = stepEl('R', i); s.classList.add('on'); pop(s) }, i * step)
      T(() => stepEl('R', i).classList.add('verified'), i * step + 300)
    })
    T(() => {
      verdict('R').classList.add('show'); stamp.classList.add('show')
      const r = stamp.getBoundingClientRect(), br = stage.body.getBoundingClientRect()
      confettiBurst(stage.body, r.left - br.left, r.top - br.top, GREEN, 22)
    }, RIGHT.length * step + 200)
  }

  cols.addEventListener('click', e => {
    const b = e.target.closest('.tv-rescue')
    if (!b) return
    const i = +b.dataset.rescue
    const s = stepEl('L', i)
    s.classList.remove('revealed'); s.classList.add('rescued'); pop(s)
    s.querySelector('.ai').textContent = '你：' + LEFT[i].rescue + ' → tool 這才發現沒讀到檔，回頭重讀。'
    if ([0, 1, 2].every(k => stepEl('L', k).classList.contains('rescued'))) verdict('L').classList.remove('show')
  })

  function startSandbox() {
    resetScene()
    cols.classList.add('tv-sandbox')
    runLeft(340)
    runRight(340)
  }
  ctrls.addEventListener('click', e => {
    const b = e.target.closest('[data-b]')?.dataset.b
    if (b === 'run') { resetScene(); cols.classList.add('tv-sandbox'); runLeft(340); runRight(340) }
    if (b === 'reveal') revealLeft(0)
    if (b === 'reset') startSandbox()
  })

  const beats = [
    { narration: '同一個任務「讀檔 → 比對 → 輸出報告」跑兩遍。差別只有一件事：<b>你有沒有在每一步逼它回報「tool 真的有動嗎」</b>。',
      focus: ['[data-card="L"]', '[data-card="R"]'], nextLabel: '先看不驗證 →', enter() { resetScene() } },

    { narration: '不驗證這邊：讀檔其實<b>靜默失敗</b>了，但 AI 是文字接龍 — 它照樣很有自信地一路接下去。',
      focus: ['[data-card="L"]'], nextLabel: '翻牌看真相 →',
      enter() { resetScene(); runLeft() } },

    { narration: '<b>翻牌 — 全錯。</b>tool 沒 trigger 成功，後面比對、報告全是憑空編的漂亮話。',
      focus: ['[data-card="L"]'], nextLabel: '換有驗證的做法 →',
      enter() { resetScene(); LEFT.forEach((_, i) => stepEl('L', i).classList.add('on')); revealLeft(300) } },

    { narration: '正確做法：讀完檔先逼它回報 — <b>「讀到 29 列」</b>，屬實才往下。每個檢查點都回報「到哪了」，才不會看到新竹就以為到台北跑走。',
      focus: ['[data-card="R"]'], nextLabel: '換你玩 →',
      enter() { resetScene(); runRight() } },

    { narration: '換你跑 — 兩邊一起跑、左邊翻牌看它聊爽，再按<b>「要求回報」</b>把每一步救回正軌。',
      sandbox: true, enter() { startSandbox() } },
  ]

  stage = createStage(el, ctx, { beats })
  stage.body.append(cols, ctrls)

  return () => { clearT(); stage.destroy(); style.remove() }
}
