// Demo：別再手寫 harness — DemoStage 導演版
// 5 拍：精緻齒輪錶亮起｜新模型發布橫幅劃過齒輪生鏽｜折舊曲線斷崖下跌｜站上會長高的平台｜折舊計算器 sandbox。
import { createStage, pop, shake, enterFly, countUp } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const GREEN = '#4ade80', RED = '#f87171', GRAY = '#565d70', GOLD = '#fbbf24'

export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#8ea9e8'

  // ---- 手繪 SVG：齒輪、裂痕、站立小人 ----
  const gearPath = (R, teeth) => {
    const inner = R * 0.74, step = Math.PI / teeth
    let d = ''
    for (let i = 0; i < teeth * 2; i++) {
      const r = i % 2 ? inner : R, a = i * step
      d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r).toFixed(1)
    }
    return d + 'Z'
  }
  const GEAR = (cx, cy, R, teeth, cls) => `
    <g class="sh-g ${cls}" transform="translate(${cx} ${cy})">
      <path d="${gearPath(R, teeth)}" fill="rgba(10,12,18,.55)" stroke="currentColor" stroke-width="2.2"/>
      <circle r="${(R * 0.34).toFixed(1)}" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle r="3" fill="currentColor"/>
    </g>`
  const FIG = (color) => `<svg viewBox="0 0 40 60" width="40" height="60" fill="none"
    stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="20" cy="10" r="6"/><path d="M20 16 V38"/><path d="M20 22 L9 30 M20 22 L31 30"/>
    <path d="M20 38 L11 54 M20 38 L29 54"/></svg>`

  const style = document.createElement('style')
  style.textContent = `
  .sh-scene{position:relative;height:clamp(300px,52vh,440px);border-radius:16px;overflow:hidden;margin-bottom:16px;
    background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(0,0,0,.28));border:1px solid var(--line)}
  .sh-layer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    opacity:0;pointer-events:none;transition:opacity .6s ${EASE}}
  .sh-layer.on{opacity:1;pointer-events:auto}
  .sh-watch{color:${accent};width:min(88%,540px);transition:color .8s ease,filter .8s ease}
  .sh-watch svg{width:100%;height:auto;overflow:visible}
  .sh-g{transform-box:fill-box;transform-origin:center}
  @keyframes shSpin{to{transform:rotate(360deg)}}
  @keyframes shSpinR{to{transform:rotate(-360deg)}}
  .sh-watch.run .g1{animation:shSpin 9s linear infinite}
  .sh-watch.run .g2{animation:shSpinR 6s linear infinite}
  .sh-watch.run .g3{animation:shSpin 4.5s linear infinite}
  .sh-watch.rust{color:${GRAY};filter:grayscale(1) brightness(.72) contrast(.9)}
  .sh-watch.rust .sh-g{animation:none!important}
  .sh-crack{stroke:${RED};stroke-width:1.6;stroke-linecap:round;opacity:0;transition:opacity .5s}
  .sh-watch.rust .sh-crack{opacity:.75}
  .sh-badge{position:absolute;left:50%;bottom:20px;transform:translateX(-50%);font-family:var(--font-mono);
    font-size:14px;letter-spacing:.14em;color:${GOLD};border:1px solid ${GOLD}66;border-radius:999px;padding:6px 16px;
    background:rgba(10,12,18,.6)}
  .sh-banner{position:absolute;top:44%;left:-60%;width:56%;padding:16px 26px;border-radius:12px;
    background:${GOLD};color:#08090a;font-weight:800;font-size:20px;letter-spacing:.02em;white-space:nowrap;
    box-shadow:0 12px 40px -10px ${GOLD}99;z-index:6;display:flex;align-items:center;gap:12px}
  .sh-banner .v{font-family:var(--font-mono);background:rgba(0,0,0,.18);border-radius:8px;padding:3px 9px;font-size:15px}
  .sh-chart{width:min(90%,600px)}
  .sh-chart svg{width:100%;height:auto;overflow:visible}
  .sh-axis{stroke:var(--line);stroke-width:1.4}
  .sh-tick{fill:var(--text-dim);font-family:var(--font-mono);font-size:12px}
  .sh-curve-p{fill:none;stroke:${RED};stroke-width:3;stroke-linecap:round;stroke-linejoin:round;
    stroke-dasharray:680;stroke-dashoffset:680;transition:stroke-dashoffset 1.6s ${EASE}}
  .sh-chart.draw .sh-curve-p{stroke-dashoffset:0}
  .sh-node{fill:${RED};opacity:0;transition:opacity .4s}
  .sh-chart.draw .sh-node{opacity:1}
  .sh-big{position:absolute;top:22px;right:26px;text-align:right;font-family:var(--font-mono)}
  .sh-big .n{font-size:44px;font-weight:800;color:${RED};line-height:1}
  .sh-big .l{font-size:13px;color:var(--text-dim);letter-spacing:.1em;margin-top:4px}
  .sh-cmp{display:flex;gap:32px;width:min(92%,680px);align-items:flex-end;justify-content:center;height:74%}
  .sh-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%}
  .sh-col .cap{font-size:16px;margin-bottom:auto;padding-top:6px;color:var(--text);font-weight:600;text-align:center}
  .sh-col .cap small{display:block;font-size:13px;color:var(--text-dim);font-weight:400;margin-top:3px}
  .sh-fig{transition:transform 1s ${EASE};position:relative;z-index:2}
  .sh-plat{width:100%;border-radius:10px 10px 0 0;transition:height 1s ${EASE}}
  .sh-diy .sh-plat{background:repeating-linear-gradient(45deg,${GRAY}66 0 8px,${GRAY}33 8px 16px);border:1px solid ${GRAY}}
  .sh-plat-o{background:linear-gradient(180deg,${accent},${accent}55);border:1px solid ${accent}}
  .sh-genrow{display:flex;justify-content:center;gap:8px;margin-top:14px}
  .sh-genrow .gen{font-family:var(--font-mono);font-size:13px;color:var(--text-dim);padding:4px 10px;border-radius:6px;
    border:1px solid var(--line);transition:all .4s}
  .sh-genrow .gen.on{color:#08090a;background:${accent};border-color:${accent};font-weight:700}
  .sh-calc{width:min(92%,620px);display:flex;flex-direction:column;gap:20px}
  .sh-calc .row{display:flex;align-items:center;gap:16px}
  .sh-calc label{font-size:16px;min-width:90px}
  .sh-calc input[type=range]{flex:1}
  .sh-calc .val{font-family:var(--font-mono);font-size:17px;color:${accent};min-width:60px;text-align:right}
  .sh-meter{display:flex;gap:12px;align-items:flex-end;height:130px;padding-top:22px}
  .sh-meter .g{flex:1;background:linear-gradient(180deg,${accent},${accent}44);border-radius:6px 6px 0 0;
    transition:height .6s ${EASE},background .6s,opacity .6s;position:relative}
  .sh-meter .g.dead{background:linear-gradient(180deg,${GRAY},${GRAY}44)}
  .sh-meter .g .gl{position:absolute;top:-20px;left:0;right:0;text-align:center;font-family:var(--font-mono);
    font-size:11px;color:var(--text-dim)}
  .sh-result{font-size:17px;text-align:center;line-height:1.6}
  .sh-result b{font-family:var(--font-mono);font-size:22px}
  .sh-ctrls{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
  .sh-btn{font-family:var(--font-tc);font-size:15.5px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:9px 18px;cursor:pointer;transition:all .25s ${EASE}}
  .sh-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .sh-btn.primary{background:var(--accent);color:#08090a;border-color:var(--accent);font-weight:600}
  `
  el.appendChild(style)

  const scene = document.createElement('div')
  scene.className = 'sh-scene ds-unit'
  scene.innerHTML = `
    <div class="sh-layer" data-l="watch">
      <div class="sh-watch">
        <svg viewBox="-180 -120 360 240">
          ${GEAR(-70, -8, 66, 12, 'g1')}
          ${GEAR(52, -30, 46, 10, 'g2')}
          ${GEAR(58, 62, 34, 9, 'g3')}
          <path class="sh-crack" d="M-70 -74 L-58 -20 L-92 6"/>
          <path class="sh-crack" d="M52 -76 L60 -34"/>
          <path class="sh-crack" d="M58 30 L44 62 L82 80"/>
        </svg>
      </div>
      <div class="sh-badge">手工錶級 harness · 你親手打磨</div>
    </div>
    <div class="sh-layer" data-l="banner"></div>
    <div class="sh-layer" data-l="chart">
      <div class="sh-chart">
        <svg viewBox="0 0 620 300">
          <line class="sh-axis" x1="60" y1="20" x2="60" y2="250"/>
          <line class="sh-axis" x1="60" y1="250" x2="600" y2="250"/>
          <path class="sh-curve-p" d="M60 46 L195 70 L330 172 L465 224 L580 244"/>
          <circle class="sh-node" cx="60" cy="46" r="5"/><circle class="sh-node" cx="195" cy="70" r="5"/>
          <circle class="sh-node" cx="330" cy="172" r="5"/><circle class="sh-node" cx="465" cy="224" r="5"/>
          <circle class="sh-node" cx="580" cy="244" r="5"/>
          <text class="sh-tick" x="52" y="50" text-anchor="end">100</text>
          <text class="sh-tick" x="52" y="254" text-anchor="end">0</text>
          <text class="sh-tick" x="60" y="270" text-anchor="middle">今天</text>
          <text class="sh-tick" x="330" y="270" text-anchor="middle">下一代</text>
          <text class="sh-tick" x="580" y="270" text-anchor="middle">再下一代</text>
        </svg>
      </div>
      <div class="sh-big"><div class="n">100</div><div class="l">剩餘價值 %</div></div>
    </div>
    <div class="sh-layer" data-l="platform">
      <div>
        <div class="sh-cmp">
          <div class="sh-col sh-diy"><div class="cap">自製底盤<small>你扛著整台機器</small></div>
            <div class="sh-fig">${FIG(GRAY)}</div><div class="sh-plat" style="height:44px"></div></div>
          <div class="sh-col sh-plt"><div class="cap">站上官方平台<small>平台自己長高，你被抬上去</small></div>
            <div class="sh-fig">${FIG(GREEN)}</div><div class="sh-plat sh-plat-o" style="height:44px"></div></div>
        </div>
        <div class="sh-genrow"><span class="gen on">Gen 0</span><span class="gen">Gen 1</span><span class="gen">Gen 2</span></div>
      </div>
    </div>
    <div class="sh-layer" data-l="calc">
      <div class="sh-calc">
        <div class="row"><label>手寫投入</label>
          <input type="range" class="sh-weeks" min="1" max="12" value="4" step="1">
          <span class="val sh-wval">4 週</span></div>
        <div class="sh-meter">
          <div class="g" data-g="0"><span class="gl">現在</span></div>
          <div class="g" data-g="1"><span class="gl">+1 代</span></div>
          <div class="g" data-g="2"><span class="gl">+2 代</span></div>
          <div class="g" data-g="3"><span class="gl">+3 代</span></div>
        </div>
        <div class="sh-result"></div>
        <div class="sh-ctrls">
          <button class="sh-btn primary sh-adv">模型世代 +1 →</button>
          <button class="sh-btn sh-reset">重來</button>
        </div>
      </div>
    </div>`

  let stage
  const $ = s => scene.querySelector(s)
  const layer = n => scene.querySelector(`[data-l="${n}"]`)
  const watch = $('.sh-watch'), chart = $('.sh-chart')
  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  function showLayer(name) {
    scene.querySelectorAll('.sh-layer').forEach(l => l.classList.toggle('on', l.dataset.l === name))
  }

  // ---- 折舊計算器 ----
  const DECAY = [100, 42, 18, 7]           // 每推一代剩餘 %（斷崖式）
  const bars = [...scene.querySelectorAll('.sh-meter .g')]
  const weeksEl = $('.sh-weeks'), wvalEl = $('.sh-wval'), resultEl = $('.sh-result')
  let curGen = 0

  function renderCalc(animate) {
    const weeks = +weeksEl.value
    wvalEl.textContent = weeks + ' 週'
    bars.forEach((b, i) => {
      b.style.height = (i <= curGen ? 12 + DECAY[i] * 0.85 : 2) + '%'
      b.style.opacity = i <= curGen ? '1' : '.22'
      b.classList.toggle('dead', i > 0 && DECAY[i] < 25)
    })
    const rem = DECAY[curGen]
    const col = rem >= 40 ? accent : rem >= 15 ? GOLD : RED
    resultEl.innerHTML = `推進到第 <b style="color:${accent}">${curGen}</b> 個模型世代，這 ${weeks} 週手寫成果剩下 <b class="sh-rem" style="color:${col}">${animate ? DECAY[Math.max(0, curGen - 1)] : rem}</b> %`
    if (animate) countUp($('.sh-rem'), rem, { from: DECAY[Math.max(0, curGen - 1)], dur: 700, fmt: v => Math.round(v) })
  }
  weeksEl.addEventListener('input', () => renderCalc(false))
  $('.sh-adv').onclick = e => {
    pop(e.currentTarget)
    if (curGen >= DECAY.length - 1) { shake(e.currentTarget); return }
    curGen++; renderCalc(true)
  }
  $('.sh-reset').onclick = e => { pop(e.currentTarget); curGen = 0; renderCalc(false) }

  function beats() {
    return [
      { narration: '你手寫的 harness，<b>精美得像手工錶</b> — 每個齒輪都你親手對位。', focus: ['.sh-scene'], nextLabel: '然後呢？ →',
        enter() {
          clearT(); showLayer('watch')
          watch.classList.remove('rust'); void watch.offsetWidth; watch.classList.add('run')
          enterFly(watch, { y: 20, dur: 700 })
        } },

      { narration: '模型世代一升級 —', focus: ['.sh-scene'], nextLabel: '結果？ →',
        enter() {
          clearT(); showLayer('watch'); watch.classList.remove('rust'); watch.classList.add('run')
          const l = layer('banner')
          l.innerHTML = `<div class="sh-banner">新模型發布<span class="v">v-next</span></div>`
          const banner = l.querySelector('.sh-banner')
          T(() => {
            banner.animate([{ left: '-60%' }, { left: '110%' }], { duration: 1100, easing: 'cubic-bezier(.5,0,.4,1)', fill: 'forwards' })
            T(() => { watch.classList.remove('run'); watch.classList.add('rust'); shake(watch) }, 560)
          }, 400)
        } },

      { narration: 'harness 是<b>折舊資產</b> — 壽命大概就一個模型世代，然後價值斷崖式蒸發。', focus: ['.sh-scene'], nextLabel: '那怎麼辦？ →',
        enter() {
          clearT(); showLayer('chart'); chart.classList.remove('draw')
          void chart.offsetWidth
          T(() => {
            chart.classList.add('draw')
            countUp($('.sh-big .n'), 12, { from: 100, dur: 1600, fmt: v => Math.round(v) })
          }, 200)
        } },

      { narration: '站在官方 harness 上，把力氣花在<b>不折舊的東西</b> — 平台自己長高，你被一路抬上去。', focus: ['.sh-scene'], nextLabel: '換你算算 →',
        enter() {
          clearT(); showLayer('platform')
          const oPlat = $('.sh-plat-o'), oFig = $('.sh-plt .sh-fig')
          const gens = [...scene.querySelectorAll('.sh-genrow .gen')]
          $('.sh-diy .sh-plat').style.height = '44px'
          oPlat.style.height = '44px'; oFig.style.transform = 'translateY(0)'
          gens.forEach((g, i) => g.classList.toggle('on', i === 0))
          let g = 0
          const grow = () => {
            g++; if (g > 2) return
            oPlat.style.height = (44 + g * 66) + 'px'
            oFig.style.transform = `translateY(-${g * 66}px)`
            gens.forEach((x, i) => x.classList.toggle('on', i === g))
            pop(oFig)
          }
          T(grow, 900); T(grow, 1900)
        } },

      { narration: '折舊計算器 — 拉「投入幾週」，按<b>「模型世代 +1」</b>，看你手寫的成果一代代剩下多少。', sandbox: true,
        enter() { clearT(); showLayer('calc'); curGen = 0; renderCalc(false) } },
    ]
  }

  stage = createStage(el, ctx, { beats: beats() })
  stage.body.append(scene)

  return () => { clearT(); stage.destroy(); style.remove() }
}
