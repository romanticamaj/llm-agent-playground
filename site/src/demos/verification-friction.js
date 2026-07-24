// Demo：驗證摩擦 — DemoStage 導演版
// 5 拍：公式登場｜高摩擦的一天輪子慢轉只 3 圈｜降摩擦飛轉 15 圈｜搬到 agent loop × 生活 loop 交點｜摩擦滑桿＋遠端驗證 sandbox。
import { createStage, pop, countUp } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const GREEN = '#4ade80', GOLD = '#fbbf24'

export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#38e1c6'

  const STEPS = ['改一行', '等 build', '切環境', '手動點']
  const WALK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="2"/><path d="M13 7 11 13l4 3M11 13l-3 5M13 10l4 1"/><path d="M11 13 8 11"/></svg>'
  const BROOM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3 9 11M6 20l-2-2 4-6 4 4-6 4Z M11 15l6-6"/></svg>'

  const LAPS = (fr, remote) => Math.max(1, Math.round(30 / fr * (remote ? 1.6 : 1)))
  const SPIN_DUR = fr => (fr * 0.34).toFixed(2) + 's'

  const style = document.createElement('style')
  style.textContent = `
  .vf-scene{position:relative;height:clamp(320px,54vh,470px);border-radius:16px;overflow:hidden;margin-bottom:14px;
    background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(0,0,0,.28));border:1px solid var(--line)}
  .vf-layer{position:absolute;inset:0;opacity:0;pointer-events:none;transition:opacity .55s ${EASE};
    display:flex;align-items:center;justify-content:center;padding:20px}
  .vf-layer.on{opacity:1;pointer-events:auto}
  .vf-formula{text-align:center}
  .vf-formula .big{font-size:clamp(26px,4.4vw,44px);font-weight:800;letter-spacing:-.01em;line-height:1.3}
  .vf-formula .big b{color:${accent}}
  .vf-formula .frac{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 6px}
  .vf-formula .frac .top{padding:0 10px}
  .vf-formula .frac .bar{height:3px;align-self:stretch;background:var(--text);border-radius:2px;margin:4px 0}
  .vf-formula .frac .bot{padding:0 10px;color:${GOLD}}
  .vf-formula .sub{font-size:16px;color:var(--text-dim);margin-top:22px}
  /* 輪子 */
  .vf-wheelwrap{display:flex;flex-direction:column;align-items:center;gap:18px}
  .vf-wheel{position:relative;width:min(64vw,260px);aspect-ratio:1}
  .vf-wheel svg{width:100%;height:100%;overflow:visible;color:${accent}}
  @keyframes vfSpin{to{transform:rotate(360deg)}}
  .vf-spokes{transform-box:view-box;transform-origin:center;animation:vfSpin var(--dur,3s) linear infinite}
  .vf-step{position:absolute;font-size:13px;font-family:var(--font-mono);color:var(--text-dim);
    transform:translate(-50%,-50%);white-space:nowrap;background:rgba(10,12,18,.7);padding:2px 8px;border-radius:6px;
    border:1px solid var(--line)}
  .vf-readout{text-align:center}
  .vf-readout .n{font-family:var(--font-mono);font-size:46px;font-weight:800;color:${accent};line-height:1}
  .vf-readout .l{font-size:15px;color:var(--text-dim);letter-spacing:.06em;margin-top:4px}
  /* 兩條 loop */
  .vf-loops{position:relative;width:min(90%,560px);height:100%;display:flex;align-items:center;justify-content:center}
  .vf-ring{position:absolute;border-radius:50%;border:2px dashed;top:50%;transform:translateY(-50%)}
  .vf-ring.agent{width:200px;height:200px;left:16%;border-color:${accent};color:${accent}}
  .vf-ring.life{width:230px;height:230px;right:12%;border-color:${GOLD};color:${GOLD}}
  .vf-ringlbl{position:absolute;top:-12px;left:50%;transform:translateX(-50%);font-size:14px;white-space:nowrap;
    background:rgba(10,12,18,.85);padding:2px 10px;border-radius:999px}
  .vf-mini{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:96px;height:96px;color:${accent}}
  .vf-mini svg{width:100%;height:100%}
  .vf-mini .vf-spokes{animation-duration:.8s}
  @keyframes vfOrbit{to{transform:rotate(360deg)}}
  .vf-orbit{position:absolute;top:50%;left:50%;width:230px;height:230px;transform:translate(-50%,-50%);
    animation:vfOrbit 6s linear infinite}
  .vf-orbit .ico{position:absolute;top:-11px;left:50%;transform:translateX(-50%);color:${GOLD}}
  .vf-orbit .ico svg{width:26px;height:26px}
  .vf-orbit.b2{animation-duration:8s;animation-delay:-4s}
  .vf-cross{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:44px;height:44px;border-radius:50%;
    background:radial-gradient(circle,${GREEN}cc,transparent 70%);animation:vfGlow 1.8s ease-in-out infinite}
  @keyframes vfGlow{50%{transform:translate(-50%,-50%) scale(1.35);opacity:.6}}
  .vf-crosslbl{position:absolute;top:calc(50% + 34px);left:50%;transform:translateX(-50%);text-align:center;
    font-size:14px;color:${GREEN};white-space:nowrap;background:rgba(10,12,18,.8);padding:4px 12px;border-radius:8px}
  /* sandbox 控制 */
  .vf-ctrls{display:flex;flex-direction:column;gap:14px;width:min(90%,460px)}
  .vf-row{display:flex;align-items:center;gap:14px}
  .vf-row label{font-size:15.5px;min-width:78px}
  .vf-row input[type=range]{flex:1}
  .vf-row .v{font-family:var(--font-mono);font-size:15px;color:${accent};min-width:64px;text-align:right}
  .vf-toggle{display:flex;align-items:center;justify-content:center;gap:10px;font-size:15.5px}
  .vf-sw{width:52px;height:28px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.05);
    position:relative;cursor:pointer;transition:all .25s}
  .vf-sw::after{content:'';position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;
    background:var(--text-dim);transition:all .25s ${EASE}}
  .vf-sw.on{background:${GREEN};border-color:${GREEN}}.vf-sw.on::after{left:27px;background:#08090a}
  .vf-out{display:flex;gap:26px;justify-content:center;text-align:center}
  .vf-out .n{font-family:var(--font-mono);font-size:32px;font-weight:800;line-height:1}
  .vf-out .laps .n{color:${accent}}.vf-out .ship .n{color:${GREEN}}
  .vf-out .l{font-size:13px;color:var(--text-dim);margin-top:3px}
  .vf-reset{align-self:center;font-family:var(--font-tc);font-size:14.5px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:8px 18px;cursor:pointer}
  .vf-reset:hover{border-color:var(--text)}
  `
  el.appendChild(style)

  const WHEEL_SVG = `<svg viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-width="2" opacity=".35"/>
    <g class="vf-spokes">
      <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-width="3"
        stroke-dasharray="26 40" stroke-linecap="round"/>
      <path d="M60 60 L60 8M60 60 L112 60M60 60 L60 112M60 60 L8 60" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="60" cy="8" r="5" fill="currentColor"/>
    </g>
    <circle cx="60" cy="60" r="9" fill="rgba(10,12,18,.9)" stroke="currentColor" stroke-width="2.4"/>
  </svg>`

  const scene = document.createElement('div')
  scene.className = 'vf-scene ds-unit'
  scene.innerHTML = `
    <div class="vf-layer" data-l="formula">
      <div class="vf-formula">
        <div class="big"><b>迭代速度</b> ≈
          <span class="frac"><span class="top">1</span><span class="bar"></span><span class="bot">驗證摩擦</span></span>
        </div>
        <div class="sub">驗證越省事，你一天能轉的圈數越多</div>
      </div>
    </div>
    <div class="vf-layer" data-l="wheel">
      <div class="vf-wheelwrap">
        <div class="vf-wheel">${WHEEL_SVG}
          ${STEPS.map((s, i) => { const a = -90 + i * 90, rad = a * Math.PI / 180
            const x = 50 + Math.cos(rad) * 62, y = 50 + Math.sin(rad) * 62
            return `<span class="vf-step" style="left:${x}%;top:${y}%">${s}</span>` }).join('')}
        </div>
        <div class="vf-readout"><span class="n">0</span><span class="l">今日迭代圈數</span></div>
      </div>
    </div>
    <div class="vf-layer" data-l="loops">
      <div class="vf-loops">
        <div class="vf-ring agent"><span class="vf-ringlbl">agent loop</span>
          <div class="vf-mini">${WHEEL_SVG}</div></div>
        <div class="vf-ring life"><span class="vf-ringlbl">你的生活 loop</span>
          <div class="vf-orbit"><span class="ico">${WALK}</span></div>
          <div class="vf-orbit b2"><span class="ico">${BROOM}</span></div></div>
        <div class="vf-cross"></div>
        <div class="vf-crosslbl">你在這：人去散步 / 掃地，agent 照轉</div>
      </div>
    </div>
    <div class="vf-layer" data-l="sandbox">
      <div class="vf-ctrls">
        <div class="vf-wheel" style="width:150px;align-self:center">${WHEEL_SVG}</div>
        <div class="vf-row"><label>驗證摩擦</label>
          <input type="range" class="vf-fr" min="1" max="10" value="8" step="1">
          <span class="v vf-frv">高</span></div>
        <div class="vf-toggle"><span>遠端驗證</span><div class="vf-sw" role="switch"></div>
          <span class="vf-swlbl" style="color:var(--text-dim)">關</span></div>
        <div class="vf-out">
          <div class="laps"><div class="n vf-laps">0</div><div class="l">今日迭代圈數</div></div>
          <div class="ship"><div class="n vf-ship">0</div><div class="l">通過驗證的改動</div></div>
        </div>
        <button class="vf-reset">重來</button>
      </div>
    </div>`

  let stage
  const $ = s => scene.querySelector(s)
  const $$ = s => [...scene.querySelectorAll(s)]
  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }
  const showLayer = n => scene.querySelectorAll('.vf-layer').forEach(l => l.classList.toggle('on', l.dataset.l === n))

  function setSpin(fr) { $$('.vf-spokes').forEach(s => { if (!s.closest('.vf-mini')) s.style.setProperty('--dur', SPIN_DUR(fr)) }) }

  // sandbox
  const frEl = $('.vf-fr'), frvEl = $('.vf-frv'), sw = $('.vf-sw'), swlbl = $('.vf-swlbl')
  const lapsEl = $('.vf-laps'), shipEl = $('.vf-ship')
  let remote = false, sandbox = false

  function renderSandbox(animate) {
    const fr = +frEl.value
    frvEl.textContent = fr <= 3 ? '低' : fr <= 6 ? '中' : '高'
    setSpin(fr)
    const laps = LAPS(fr, remote), ship = Math.round(laps * 0.8)
    if (animate) {
      countUp(lapsEl, laps, { from: +lapsEl.textContent || 0, dur: 600, fmt: v => Math.round(v) })
      countUp(shipEl, ship, { from: +shipEl.textContent || 0, dur: 600, fmt: v => Math.round(v) })
    } else { lapsEl.textContent = laps; shipEl.textContent = ship }
  }
  frEl.addEventListener('input', () => { if (sandbox) renderSandbox(true) })
  sw.onclick = () => { if (!sandbox) return; remote = !remote; sw.classList.toggle('on', remote)
    swlbl.textContent = remote ? '開' : '關'; swlbl.style.color = remote ? GREEN : 'var(--text-dim)'; pop(sw); renderSandbox(true) }
  $('.vf-reset').onclick = e => { pop(e.currentTarget); frEl.value = 8; remote = false; sw.classList.remove('on')
    swlbl.textContent = '關'; swlbl.style.color = 'var(--text-dim)'; renderSandbox(true) }

  function beats() {
    return [
      { narration: '一條公式先記住：<b>迭代速度 ≈ 1 / 驗證摩擦</b>。', focus: ['.vf-scene'], nextLabel: '高摩擦長怎樣？ →',
        enter() { clearT(); showLayer('formula'); const f = $('.vf-formula'); f.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: EASE }) } },

      { narration: '高摩擦的一天：<b>改一行 → 等 build → 切環境 → 手動點</b>。輪子轉得極慢，一天只轉 3 圈。', focus: ['.vf-scene'], nextLabel: '把摩擦降下來 →',
        enter() { clearT(); showLayer('wheel'); setSpin(10); $('[data-l=wheel] .n').textContent = '0'; T(() => countUp($('[data-l=wheel] .n'), 3, { dur: 1600, fmt: v => Math.round(v) }), 400) } },

      { narration: '把驗證摩擦降下來 — <b>輪子飛轉</b>。同樣一天，轉了 15 圈。', focus: ['.vf-scene'], nextLabel: '還能更進一步 →',
        enter() { clearT(); showLayer('wheel'); setSpin(2); $('[data-l=wheel] .n').textContent = '3'; T(() => countUp($('[data-l=wheel] .n'), 15, { from: 3, dur: 1400, fmt: v => Math.round(v) }), 400) } },

      { narration: '終極型態：把自己搬到<b>兩條 loop 的交點</b>上 — agent 自轉，你去散步掃地，人不在桌前輪子照轉。', focus: ['.vf-scene'], nextLabel: '換你調 →',
        enter() { clearT(); showLayer('loops'); const c = $('.vf-cross'); c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 800 }) } },

      { narration: '調<b>驗證摩擦</b>滑桿、開關<b>遠端驗證</b>，看一天能轉幾圈、產出多少。', sandbox: true,
        enter() { clearT(); showLayer('sandbox'); frEl.value = 8; remote = false; sw.classList.remove('on'); swlbl.textContent = '關'; swlbl.style.color = 'var(--text-dim)'; sandbox = true; renderSandbox(false) } },
    ]
  }

  stage = createStage(el, ctx, { beats: beats() })
  stage.body.append(scene)

  return () => { clearT(); stage.destroy(); style.remove() }
}
