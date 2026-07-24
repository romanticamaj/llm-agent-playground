// Demo：從一次性 prompt 到 Builder（Prompt Builder）— DemoStage 導演版
// 5 拍：完美 prompt 用完就丟｜每週從頭再磨的徒勞｜歸納成 Builder 選項進 prompt 出｜一次性 leverage vs Builder 複利｜sandbox 社群文案 Builder。
import { createStage, pop, shake, enterFly, countUp, confettiBurst } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const GREEN = '#4ade80'

const FIELDS = [
  { k: 'platform', label: '平台', opts: ['Instagram', 'LinkedIn', 'Threads', 'X'] },
  { k: 'topic', label: '主題', opts: ['新品上市', '活動宣傳', '徵才貼文', '教學分享'] },
  { k: 'tone', label: '語氣', opts: ['專業', '親切', '幽默', '熱血'] },
  { k: 'length', label: '長度', opts: ['一句話', '簡短', '中等'] },
  { k: 'audience', label: '受眾', opts: ['上班族', '學生', '創業者', '家長'] },
]
const buildPrompt = v => `你是一位擅長「${v.platform}」的社群文案寫手。\n請為「${v.topic}」寫一則貼文：\n・語氣要${v.tone}，長度${v.length}\n・目標受眾是${v.audience}\n・附上 3 個相關 hashtag 與一句 call-to-action。`

const TRASH = `<svg viewBox="0 0 64 68" width="100%" height="100%" fill="none" stroke="currentColor"
  stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 18h40l-4 44a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4z"/><path d="M8 18h48"/>
  <path d="M24 18v-6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6"/><path d="M26 30v24M32 30v24M38 30v24"/></svg>`

export default function mount(el, ctx) {
  const accent = ctx?.accent || '#8ea9e8'

  const style = document.createElement('style')
  style.textContent = `
  .pb-scene{position:relative;height:clamp(340px,58vh,500px);border-radius:16px;overflow:hidden;
    background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(0,0,0,.28));border:1px solid var(--line);margin-bottom:14px}
  .pb-layer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:clamp(14px,3vw,44px);
    padding:26px;opacity:0;transform:translateY(14px);pointer-events:none;transition:opacity .5s ${EASE},transform .5s ${EASE}}
  .pb-layer.show{opacity:1;transform:none;pointer-events:auto}
  .pb-card{width:clamp(230px,40%,360px);border-radius:14px;padding:18px;background:rgba(18,22,32,.95);
    border:1px solid ${accent}55;box-shadow:0 0 26px -8px ${accent}66;font-family:var(--font-mono);font-size:14px;
    line-height:1.7;color:var(--text);white-space:pre-wrap;position:relative;min-height:150px}
  .pb-card .tag{position:absolute;top:-11px;left:16px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;
    color:${accent};background:#0b0d12;padding:2px 10px;border:1px solid ${accent}55;border-radius:999px}
  .pb-card.fly{transition:transform 1s ${EASE},opacity .8s;transform:translate(var(--tx,0),var(--ty,0)) scale(.25) rotate(18deg);opacity:0}
  .pb-week{position:absolute;top:18px;left:22px;font-family:var(--font-mono);font-size:15px;color:var(--text-dim)}
  .pb-week b{color:${accent};font-size:19px}
  .pb-trash{width:clamp(70px,11vw,104px);height:clamp(74px,12vw,110px);color:var(--text-dim);align-self:flex-end;margin-bottom:12px}
  .pb-builder{display:flex;gap:clamp(14px,3vw,36px);align-items:center;flex-wrap:wrap;justify-content:center}
  .pb-form{display:flex;flex-direction:column;gap:10px;min-width:210px}
  .pb-row{display:flex;align-items:center;gap:10px}
  .pb-row label{font-size:14px;color:var(--text-dim);width:44px;flex:none}
  .pb-row select{flex:1}
  .pb-arrow{color:${accent};display:flex;align-items:center}
  .pb-out{width:clamp(240px,42%,380px)}
  .pb-preview{border-radius:14px;padding:18px;background:rgba(18,22,32,.95);border:1px solid ${accent}66;
    font-family:var(--font-mono);font-size:14px;line-height:1.7;color:var(--text);white-space:pre-wrap;min-height:160px;position:relative}
  .pb-preview .tag{position:absolute;top:-11px;left:16px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;
    color:${accent};background:#0b0d12;padding:2px 10px;border:1px solid ${accent}55;border-radius:999px}
  .pb-copy{margin-top:12px;display:flex;align-items:center;gap:8px}
  .pb-svg{width:clamp(260px,60%,420px);height:clamp(180px,32vh,240px)}
  .pb-svg path{fill:none;stroke-width:2.6;stroke-linecap:round}
  .pb-legend{display:flex;flex-direction:column;gap:16px}
  .pb-lg{font-size:15px;color:var(--text)}
  .pb-lg .v{font-family:var(--font-mono);font-size:26px;font-weight:700;display:block}
  .pb-lg .k{font-size:13px;color:var(--text-dim);display:flex;align-items:center;gap:7px}
  .pb-lg .k i{width:16px;height:3px;border-radius:2px;display:inline-block}
  .pb-ctrls{display:flex;gap:10px;justify-content:center;margin-top:12px}
  .pb-btn{font-family:var(--font-tc);font-size:15.5px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:9px 18px;cursor:pointer;transition:all .25s ${EASE}}
  .pb-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .pb-btn.primary{background:var(--accent);color:#08090a;border-color:var(--accent);font-weight:600}
  .pb-btn.hide{display:none}
  `
  el.appendChild(style)

  const ARROW = `<svg viewBox="0 0 40 24" width="40" height="24" fill="none" stroke="currentColor" stroke-width="1.8"
    stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h30M26 5l8 7-8 7"/></svg>`

  const scene = document.createElement('div')
  scene.className = 'pb-scene ds-unit'
  scene.innerHTML = `
    <div class="pb-layer" data-l="throw">
      <div class="pb-card"><span class="tag">完美 prompt</span><span class="txt"></span></div>
      <div class="pb-trash">${TRASH}</div></div>
    <div class="pb-layer" data-l="loop">
      <div class="pb-week">第 <b class="wk">1</b> 週</div>
      <div class="pb-card"><span class="tag">又從頭磨</span><span class="txt"></span></div></div>
    <div class="pb-layer" data-l="builder">
      <div class="pb-builder">
        <div class="pb-form">${FIELDS.map(f => `<div class="pb-row"><label>${f.label}</label>
          <select data-k="${f.k}">${f.opts.map(o => `<option>${o}</option>`).join('')}</select></div>`).join('')}</div>
        <div class="pb-arrow">${ARROW}</div>
        <div class="pb-out"><div class="pb-preview"><span class="tag">組出的 prompt</span><span class="txt"></span></div>
          <div class="pb-copy pb-btn hide" data-b="copy">複製 prompt</div></div>
      </div></div>
    <div class="pb-layer" data-l="curve">
      <svg class="pb-svg" viewBox="0 0 300 170" preserveAspectRatio="none">
        <path class="axis" d="M28 8 V150 H296" stroke="rgba(255,255,255,.18)" stroke-width="1.4"/>
        <path class="lin" d="M28 150 L288 118" stroke="#8a8f98"/>
        <path class="exp" d="M28 150 C120 148 210 120 288 16" stroke="${GREEN}"/></svg>
      <div class="pb-legend">
        <div class="pb-lg"><span class="k"><i style="background:#8a8f98"></i>一次性 prompt · leverage</span><span class="v lv" style="color:#8a8f98">0</span></div>
        <div class="pb-lg"><span class="k"><i style="background:${GREEN}"></i>Builder · 複利</span><span class="v ev" style="color:${GREEN}">0</span></div>
      </div></div>`

  const ctrls = document.createElement('div')
  ctrls.className = 'pb-ctrls ds-unit'
  ctrls.innerHTML = `<button class="pb-btn primary hide" data-b="shuffle">隨機組一個</button>`

  let stage
  const layer = n => scene.querySelector(`[data-l="${n}"]`)
  const btn = b => scene.querySelector(`[data-b="${b}"]`) || ctrls.querySelector(`[data-b="${b}"]`)
  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }
  const show = name => scene.querySelectorAll('.pb-layer').forEach(l => l.classList.toggle('show', l.dataset.l === name))

  function typeInto(target, text, speed, done) {
    target.textContent = ''
    let i = 0
    const step = () => {
      if (i > text.length) { done && done(); return }
      target.textContent = text.slice(0, i++)
      T(step, speed)
    }
    step()
  }

  const currentVals = () => {
    const v = {}
    layer('builder').querySelectorAll('select').forEach(s => v[s.dataset.k] = s.value)
    return v
  }

  // B1：完美 prompt → 飛進垃圾桶
  function runThrow() {
    const card = layer('throw').querySelector('.pb-card')
    const txt = card.querySelector('.txt')
    card.classList.remove('fly'); card.style.opacity = '1'
    typeInto(txt, buildPrompt({ platform: 'Instagram', topic: '新品上市', tone: '熱血', length: '簡短', audience: '上班族' }), 14, () => {
      T(() => {
        const cr = card.getBoundingClientRect(), tr = layer('throw').querySelector('.pb-trash').getBoundingClientRect()
        card.style.setProperty('--tx', (tr.left - cr.left) + 'px')
        card.style.setProperty('--ty', (tr.top - cr.top + 30) + 'px')
        card.classList.add('fly'); shake(layer('throw').querySelector('.pb-trash'))
      }, 700)
    })
  }

  // B2：每週從頭再磨 → 丟掉 → 再來
  function runLoop() {
    const card = layer('loop').querySelector('.pb-card'), txt = card.querySelector('.txt'), wk = layer('loop').querySelector('.wk')
    let week = 1
    const cycle = () => {
      wk.textContent = week; pop(wk)
      card.classList.remove('fly'); card.style.opacity = '1'
      typeInto(txt, buildPrompt({ platform: 'Instagram', topic: '活動宣傳', tone: '親切', length: '中等', audience: '學生' }), 9, () => {
        T(() => {
          card.style.setProperty('--tx', '120px'); card.style.setProperty('--ty', '90px'); card.classList.add('fly')
          week++
          if (week <= 4) T(cycle, 700)
        }, 550)
      })
    }
    cycle()
  }

  // B3：自動示範 — 逐格選、prompt 組出
  function runBuilderAuto() {
    const selects = [...layer('builder').querySelectorAll('select')]
    selects.forEach(s => { s.disabled = true; s.selectedIndex = 0 })
    btn('copy').classList.add('hide')
    const txt = layer('builder').querySelector('.pb-preview .txt'); txt.textContent = ''
    selects.forEach((s, i) => T(() => {
      s.selectedIndex = 1 + (i % Math.max(1, s.options.length - 1))
      pop(s.parentElement)
    }, 350 + i * 420))
    T(() => typeInto(txt, buildPrompt(currentVals()), 12), 350 + selects.length * 420 + 200)
  }

  // B4：兩條曲線 + countUp
  function runCurve() {
    const svg = layer('curve')
    ;['lin', 'exp'].forEach(cls => {
      const p = svg.querySelector('.' + cls), len = p.getTotalLength()
      p.style.strokeDasharray = len
      p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1400, easing: EASE, fill: 'backwards' })
    })
    T(() => { countUp(svg.querySelector('.lv'), 8, { dur: 1200 }); countUp(svg.querySelector('.ev'), 240, { dur: 1500 }); pop(svg.querySelector('.ev')) }, 700)
  }

  // B5：互動 Builder
  function bindInteractive() {
    const selects = [...layer('builder').querySelectorAll('select')]
    const txt = layer('builder').querySelector('.pb-preview .txt')
    selects.forEach(s => { s.disabled = false; s.onchange = () => { typeInto(txt, buildPrompt(currentVals()), 5); pop(s.parentElement) } })
    typeInto(txt, buildPrompt(currentVals()), 5)
    const copy = btn('copy'); copy.classList.remove('hide')
    copy.onclick = () => {
      navigator.clipboard?.writeText?.(buildPrompt(currentVals())).catch(() => {})
      const r = scene.getBoundingClientRect(), cr = copy.getBoundingClientRect()
      confettiBurst(scene, cr.left + cr.width / 2 - r.left, cr.top - r.top, accent, 16)
      const old = copy.textContent; copy.textContent = '已複製'; pop(copy); T(() => copy.textContent = old, 1200)
    }
    const sh = btn('shuffle'); sh.classList.remove('hide')
    sh.onclick = () => { selects.forEach(s => s.selectedIndex = Math.floor(Math.random() * s.options.length)); typeInto(txt, buildPrompt(currentVals()), 4); pop(sh) }
  }

  function buildBeats() {
    return [
      { narration: '你花 20 分鐘磨出一個<b>完美 prompt</b> — 用完就丟了。', focus: ['.pb-scene'], nextLabel: '下週呢？ →',
        enter() { clearT(); show('throw'); runThrow() } },

      { narration: '下週同場景，<b>從頭再磨一次</b>。同樣的東西，一週磨一遍。', focus: ['.pb-scene'], nextLabel: '有更好的做法 →',
        enter() { clearT(); show('loop'); runLoop() } },

      { narration: '把它<b>歸納成 Builder</b>：選項進、prompt 出 — 一次做好，之後只選不磨。', focus: ['.pb-scene'], nextLabel: '差在哪？ →',
        enter() { clearT(); show('builder'); btn('shuffle').classList.add('hide'); runBuilderAuto() } },

      { narration: '一次性 prompt 是 <b>leverage</b>，Builder 是<b>複利</b> — 用越多次，領先越大。', focus: ['.pb-scene'], nextLabel: '換我組 →',
        enter() { clearT(); show('curve'); runCurve() } },

      { narration: '換你玩<b>社群文案 Builder</b> — 選幾個選項，完整 prompt 即時組好，直接複製帶走。', sandbox: true,
        enter() { clearT(); show('builder'); bindInteractive() } },
    ]
  }

  stage = createStage(el, ctx, { beats: buildBeats() })
  stage.body.append(scene, ctrls)

  return () => { clearT(); stage.destroy(); style.remove() }
}
