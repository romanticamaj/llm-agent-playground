// Long-running Agent — session 接力賽 · DemoStage 導演版
// 6 拍：目標 10 features｜One-shot 燒完 context 倒地｜One-shot 被 Kill＝大災難｜
//       接力模式把計畫落地 Disk 一棒棒交接｜接力被 Kill＝完全沒差（核心戲劇對比放大）｜sandbox 自由玩。
import { createStage, pop, shake, enterFly, confettiBurst } from './_stage.js'

const EASE = 'cubic-bezier(.16,1,.3,1)'
const GREEN = '#4ade80', RED = '#f87171'
const TOTAL = 10

export default function mount(el, ctx) {
  const accent = (ctx && ctx.accent) || '#5b8cff'
  const ico = (d, s = 20) => `<svg class="lr-ico" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
  const P_RUNNER = '<circle cx="14" cy="5" r="2"/><path d="M14 7.5l-1.5 4.5M14 9l3 1.5M12.5 9.5l-2.5 2M12.5 12l1.5 5M12.5 12l-2.5 3 1 3"/>'
  const P_STAND = '<circle cx="12" cy="5" r="2"/><path d="M12 7.5v6.5M12 14l-2.5 5M12 14l2.5 5M12 9l-3 2M12 9l3 2"/>'
  const P_GEAR = '<circle cx="12" cy="12" r="3.2"/><path d="M12 3.5v2.5M12 18v2.5M20.5 12H18M6 12H3.5M17.7 6.3l-1.8 1.8M8.1 15.9l-1.8 1.8M17.7 17.7l-1.8-1.8M8.1 8.1L6.3 6.3"/>'
  const P_BATT = '<rect x="3" y="8" width="16" height="8" rx="2"/><path d="M21 11v2"/><path d="M6 11v2"/>'
  const P_SKULL = '<path d="M6 17.2A8 8 0 1 1 18 17.2V19a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><path d="M12 15v2M10 20v-2M14 20v-2"/>'
  const P_FLAG = '<path d="M6 3v18"/><path d="M6 4h11l-2 3 2 3H6"/>'
  const P_TROPHY = '<path d="M7 4h10v3a5 5 0 0 1-10 0z"/><path d="M7 6H4.5a2.5 2.5 0 0 0 3 2.6M17 6h2.5a2.5 2.5 0 0 1-3 2.6"/><path d="M12 12v4M10 20h4M10 16h4l.6 4H9.4z"/>'
  const P_FIRE = '<path d="M12 3c3 3 4 5.5 4 8a4 4 0 0 1-8 0c0-1.5.6-2.7 1.5-3.7C9.7 8.8 12 7 12 3z"/><path d="M12 21a4 4 0 0 1-2.2-7.3"/>'
  const P_PUZZLE = '<path d="M10 4a1.6 1.6 0 0 1 3.2 0c0 .5.4.9.9.9H16v2.9c0 .5.4.9.9.9a1.6 1.6 0 0 1 0 3.2c-.5 0-.9.4-.9.9V19h-2.9c-.5 0-.9-.4-.9-.9a1.6 1.6 0 0 0-3.2 0c0 .5-.4.9-.9.9H5v-3.1c0-.5-.4-.9-.9-.9a1.6 1.6 0 0 1 0-3.2c.5 0 .9-.4.9-.9V5h3.1c.5 0 .9-.4.9-.9z"/>'
  const P_FILE = '<path d="M6 3h7l5 5v13H6z"/><path d="M13 3v5h5"/>'
  const P_WRENCH = '<path d="M15.5 4a4 4 0 0 0-5 5L4 15.5 8.5 20l6.5-6.5a4 4 0 0 0 5-5l-2.8 2.8-2.2-.5-.5-2.2z"/>'

  const style = document.createElement('style')
  style.textContent = `
  .lr-scene{display:grid;grid-template-columns:1fr 232px;gap:16px;margin-bottom:12px}
  .lr-main{display:flex;flex-direction:column;gap:12px;min-width:0}
  .lr-box{background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:12px;padding:12px 14px}
  .lr-head{display:flex;justify-content:space-between;align-items:center;font-size:15px;color:var(--text-dim);margin-bottom:8px}
  .lr-who{color:var(--text);font-weight:600;display:inline-flex;align-items:center;gap:8px}
  .lr-ram{height:16px;border-radius:8px;background:rgba(0,0,0,.4);overflow:hidden}
  .lr-ram>span{display:block;height:100%;width:100%;background:${GREEN};transition:width .45s ease,background .3s}
  .lr-track{position:relative;display:grid;grid-template-columns:repeat(${TOTAL},1fr);gap:6px;
    background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:12px;padding:16px 12px}
  .lr-cell{position:relative;height:50px;border-radius:8px;background:rgba(255,255,255,.04);border:1px solid var(--line);
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:12px;color:var(--text-dim)}
  .lr-cell.active{border-color:${accent};box-shadow:0 0 0 1px ${accent} inset}
  .lr-cell.done{background:${GREEN}18;border-color:${GREEN};color:#bff0d0}
  .lr-cell.done .stamp{color:${GREEN};font-weight:700}
  .lr-cell.broken{background:${RED}1c;border-color:${RED};color:#f2b8b8}
  .lr-cell .fnum{font-family:var(--font-mono);font-size:12px}
  .lr-cell .stamp{font-size:11px}
  .lr-marker{position:absolute;top:-15px;color:${accent};transition:left .45s ${EASE};transform:translateX(-50%);display:flex}
  .lr-debris{display:flex;gap:9px;flex-wrap:wrap;min-height:28px;font-size:14px;align-items:center;color:var(--text-dim)}
  .lr-dialog{background:${RED}14;border:1px solid ${RED}55;border-radius:10px;padding:10px 12px;font-size:15px;
    color:#f0c0d0;display:none;line-height:1.5}
  .lr-dialog.show{display:block}
  .lr-side{background:rgba(255,255,255,.02);border:1px solid var(--line);border-radius:12px;padding:14px;
    display:flex;flex-direction:column;gap:10px}
  .lr-side h4{margin:0;font-size:14px;color:var(--text-dim);letter-spacing:.02em}
  .lr-side .mono{font-family:var(--font-mono);font-size:12px;color:var(--text-dim)}
  .lr-file{font-size:13px;font-family:var(--font-mono);background:rgba(255,255,255,.04);border:1px solid var(--line);
    border-radius:8px;padding:8px 10px;color:var(--text-dim);transition:.25s}
  .lr-file .fv{color:var(--text);display:block;margin-top:3px;font-size:12px}
  .lr-file.flash{border-color:${accent};color:var(--text);box-shadow:0 0 14px -4px ${accent}}
  .lr-file.empty{opacity:.42}
  .lr-ctrls{display:flex;gap:10px;flex-wrap:wrap;margin-top:2px}
  .lr-btn{font-family:var(--font-tc);font-size:14px;color:var(--text);background:rgba(255,255,255,.04);
    border:1px solid var(--line);border-radius:999px;padding:9px 17px;cursor:pointer;transition:all .25s ${EASE};
    display:inline-flex;align-items:center;gap:7px}
  .lr-btn:hover{border-color:var(--text);transform:translateY(-1px)}
  .lr-btn.primary{background:var(--accent);color:#08090a;border-color:var(--accent);font-weight:600}
  .lr-btn.hide{display:none}
  @keyframes lrFall{to{transform:translateY(12px) rotate(78deg);opacity:.28}}
  @media(max-width:760px){.lr-scene{grid-template-columns:1fr}}
  `
  el.appendChild(style)

  let cells = ''
  for (let i = 0; i < TOTAL; i++) cells += `<div class="lr-cell" data-i="${i}"><span class="fnum">#${i + 1}</span><span class="stamp"></span></div>`

  const scene = document.createElement('div')
  scene.className = 'lr-scene'
  scene.innerHTML = `
    <div class="lr-main">
      <div class="lr-box ds-unit lr-runnerbox">
        <div class="lr-head"><span class="lr-who"><span class="ic">${ico(P_STAND)}</span> 待命中</span><span class="ram-lbl">context (RAM) 100%</span></div>
        <div class="lr-ram"><span class="lr-rambar"></span></div>
      </div>
      <div class="lr-track ds-unit"><div class="lr-marker" style="left:5%">${ico(P_RUNNER)}</div>${cells}</div>
      <div class="lr-debris ds-unit"></div>
      <div class="lr-dialog ds-unit"></div>
    </div>
    <div class="lr-side ds-unit">
      <h4>Context = RAM</h4>
      <div class="mono">session 結束就清空 — disposable</div>
      <h4 style="margin-top:4px">Filesystem = Disk</h4>
      <div class="lr-file empty" data-f="list">feature-list.json<span class="fv">— 尚未建立</span></div>
      <div class="lr-file empty" data-f="log">claude-progress.txt<span class="fv">— 尚未建立</span></div>
      <div class="lr-file empty" data-f="git">git log<span class="fv">— 尚未 commit</span></div>
    </div>`

  const ctrls = document.createElement('div')
  ctrls.className = 'lr-ctrls ds-unit'
  ctrls.innerHTML = `
    <button class="lr-btn primary hide" data-b="relay">${ico(P_FLAG, 16)} 接力模式</button>
    <button class="lr-btn hide" data-b="oneshot">${ico(P_FIRE, 16)} One-shot 硬跑</button>
    <button class="lr-btn hide" data-b="kill">${ico(P_SKULL, 16)} Kill session</button>
    <button class="lr-btn hide" data-b="reset">重來</button>`

  let stage
  const $ = s => scene.querySelector(s)
  const rambar = $('.lr-rambar'), ramLbl = $('.ram-lbl'), who = $('.lr-who')
  const marker = $('.lr-marker'), debris = $('.lr-debris'), dialog = $('.lr-dialog')
  const cellEls = [...scene.querySelectorAll('.lr-cell')]
  const btn = b => ctrls.querySelector(`[data-b="${b}"]`)

  const timers = new Set()
  const T = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearT = () => { timers.forEach(clearTimeout); timers.clear() }

  // st.gen 是「當前 session 世代」— 主控權轉移用參照：kill 時 gen++ 讓舊排程全失效
  let st = { mode: null, done: 0, ram: 100, runner: 0, gen: 0, running: false }

  function setRam(v) {
    st.ram = Math.max(0, Math.min(100, v))
    rambar.style.width = st.ram + '%'
    rambar.style.background = st.ram < 25 ? RED : (st.ram < 55 ? '#e0b050' : GREEN)
    ramLbl.textContent = 'context (RAM) ' + Math.round(st.ram) + '%'
  }
  function setWho(html) { who.innerHTML = html }
  function setFile(f, txt, empty, flash) {
    const e = $(`.lr-file[data-f="${f}"]`)
    e.querySelector('.fv').textContent = txt
    e.classList.toggle('empty', !!empty)
    if (flash) { e.classList.add('flash'); T(() => e.classList.remove('flash'), 600) }
  }
  function markerTo(i) { marker.style.left = ((i + 0.5) / TOTAL * 100) + '%' }
  function activate(i) { cellEls.forEach(c => c.classList.remove('active')); if (cellEls[i]) { cellEls[i].classList.add('active'); pop(cellEls[i]) } markerTo(i) }
  function completeCell(i) { const c = cellEls[i]; c.classList.remove('active'); c.classList.add('done'); c.querySelector('.stamp').textContent = '可merge'; pop(c) }
  function scatter(list, label) {
    debris.innerHTML = `<span>${label}</span>`
    list.forEach((p, k) => { const s = document.createElement('span'); s.innerHTML = ico(p, 19); s.style.animation = `lrFall .6s ${k * .08}s ease forwards`; debris.appendChild(s) })
  }

  // ---- One-shot：一個 session 一口氣做，context 邊做邊燒 ----
  function oneShot() {
    resetScene(); st.mode = 'oneshot'; st.running = true
    setWho(`<span class="ic">${ico(P_RUNNER)}</span> Session 1（一口氣做完全部）`)
    stepOneShot(0, st.gen)
  }
  function stepOneShot(i, gen) {
    if (gen !== st.gen || !st.running) return
    if (i >= TOTAL) { win(); return }
    activate(i); setRam(st.ram - 26)
    T(() => {
      if (gen !== st.gen) return
      if (st.ram <= 0) { collapse(i, gen); return }
      completeCell(i); st.done = i + 1
      T(() => stepOneShot(i + 1, gen), 340)
    }, 600)
  }
  function collapse(i, gen) {
    setWho(`<span class="ic" style="color:${RED}">${ico(P_BATT)}</span> Session 1 倒地（context 燒完）`)
    cellEls[i].classList.add('broken'); shake(scene.querySelector('.lr-runnerbox'))
    scatter([P_PUZZLE, P_FILE, P_WRENCH], '半成品爛攤子：')
    if (gen === st.gen) st.running = false
  }

  // ---- Relay：Initializer 落地 disk，之後每棒讀日誌→做一個→E2E→commit→寫日誌→交棒 ----
  function relay() {
    resetScene(); st.mode = 'relay'; st.running = true
    const gen = st.gen
    setWho(`<span class="ic">${ico(P_GEAR)}</span> Initializer 建環境`)
    T(() => { if (gen === st.gen) setFile('list', '10 features · JSON', false, true) }, 350)
    T(() => { if (gen === st.gen) setFile('log', '（空白，待第一棒）', false, true) }, 750)
    T(() => { if (gen === st.gen) setFile('git', 'initial commit', false, true) }, 1150)
    T(() => { if (gen === st.gen) runnerEnters(gen) }, 1650)
  }
  function runnerEnters(gen) {
    if (gen !== st.gen || !st.running) return
    if (st.done >= TOTAL) { win(); return }
    st.runner++
    const n = st.runner, fi = st.done
    setRam(100); activate(fi)
    setWho(`<span class="ic">${ico(P_RUNNER)}</span> Runner ${n}（乾淨的一棒）`)
    const seq = [
      () => setFile('log', `讀取：已完成 ${fi}/${TOTAL}`, false, true),
      () => setRam(72),
      () => setRam(48),
      () => setRam(38),
      () => setFile('git', `commit: feat #${fi + 1}`, false, true),
      () => { completeCell(fi); st.done = fi + 1; setFile('log', `更新：已完成 ${st.done}/${TOTAL}`, false, true) },
    ]
    runSeq(seq, 0, gen, () => T(() => runnerEnters(gen), 480))
  }
  function runSeq(seq, i, gen, done) {
    if (gen !== st.gen || !st.running) return
    if (i >= seq.length) { done(); return }
    seq[i](); T(() => runSeq(seq, i + 1, gen, done), 620)
  }

  // ---- Kill：核心戲劇對比 ----
  function kill() {
    if (!st.running || !st.mode) return
    st.gen++; clearT()          // 世代 +1：所有排程中的 callback 立即失效
    if (st.mode === 'oneshot') {
      setWho(`<span class="ic" style="color:${RED}">${ico(P_SKULL)}</span> Session 被砍 — 全部消失`)
      setRam(0); scatter([P_PUZZLE, P_FILE], '沒落地的東西全丟了：')
      dialog.className = 'lr-dialog show'
      dialog.innerHTML = 'One-shot 下 Kill = 大災難：context 只活在 RAM，砍掉就歸零，前面的進度全部蒸發。'
      shake(scene.querySelector('.lr-runnerbox')); st.running = false
    } else {
      cellEls.forEach(c => c.classList.remove('active'))
      setWho(`<span class="ic" style="color:${RED}">${ico(P_SKULL)}</span> 這一棒被砍…`)
      dialog.className = 'lr-dialog show'
      dialog.style.borderColor = GREEN + '66'; dialog.style.background = GREEN + '14'; dialog.style.color = '#c9ffd8'
      dialog.innerHTML = `接力模式砍掉完全沒差 — 進度在 disk（已完成 <b>${st.done}/${TOTAL}</b>），下一棒讀日誌照樣接手。`
      const gen = st.gen
      T(() => { if (gen === st.gen && st.running) { dialog.classList.remove('show'); runnerEnters(gen) } }, 1400)
    }
  }

  function win() {
    st.running = false
    cellEls.forEach(c => c.classList.remove('active'))
    setWho(`<span class="ic" style="color:${GREEN}">${ico(P_TROPHY)}</span> 10/10 完成`)
    const r = scene.querySelector('.lr-track').getBoundingClientRect(), br = stage.body.getBoundingClientRect()
    confettiBurst(stage.body, r.left - br.left + r.width / 2, r.top - br.top + 20, GREEN, 30)
  }

  function showBtns(list) { ctrls.querySelectorAll('.lr-btn').forEach(b => b.classList.toggle('hide', !list.includes(b.dataset.b))) }
  btn('relay').onclick = () => { pop(btn('relay')); if (!st.running) relay() }
  btn('oneshot').onclick = () => { pop(btn('oneshot')); if (!st.running) oneShot() }
  btn('kill').onclick = () => { pop(btn('kill')); kill() }
  btn('reset').onclick = () => { pop(btn('reset')); startSandboxRun() }

  // 每拍開場先歸零場景
  function resetScene() {
    clearT()
    st = { mode: null, done: 0, ram: 100, runner: 0, gen: st.gen + 1, running: false }
    setRam(100); setWho(`<span class="ic">${ico(P_STAND)}</span> 待命中`)
    marker.style.transition = 'none'; marker.style.left = '5%'; void marker.offsetWidth; marker.style.transition = ''
    debris.innerHTML = ''; dialog.className = 'lr-dialog'; dialog.style.cssText = ''
    cellEls.forEach(c => { c.className = 'lr-cell'; c.querySelector('.stamp').textContent = '' })
    setFile('list', '— 尚未建立', true); setFile('log', '— 尚未建立', true); setFile('git', '— 尚未 commit', true)
    showBtns([])
  }

  function startSandboxRun() { resetScene(); showBtns(['relay', 'oneshot', 'kill', 'reset']) }

  function buildBeats() {
    return [
      { narration: '目標：完成 <b>10 個 feature</b>。記住這條對照 — Context Window = <b>RAM</b>，Filesystem = <b>Disk</b>。', focus: ['.lr-track', '.lr-side'], nextLabel: '先看 One-shot →',
        enter() { resetScene() } },

      { narration: '<b>One-shot 硬跑：</b>一個 session 想一口氣做完，context（RAM）邊做邊燒 — 到 #4 就<b style="color:' + RED + '">燒完倒地</b>，只留半成品爛攤子。', focus: ['.lr-runnerbox', '.lr-track', '.lr-debris'], nextLabel: '這時候砍掉會怎樣？ →',
        enter() { oneShot() } },

      { narration: '此刻按 <b>Kill session</b> — context 只活在 RAM，砍掉<b style="color:' + RED + '">全部歸零</b>。什麼都沒落地，這是大災難。', focus: ['.lr-runnerbox', '.lr-dialog', '.lr-side'], nextLabel: '換接力模式 →',
        enter() {
          resetScene(); st.mode = 'oneshot'; st.running = true
          setWho(`<span class="ic">${ico(P_RUNNER)}</span> Session 1（一口氣做完全部）`)
          const gen = st.gen
          stepOneShot(0, gen)
          T(() => { if (gen === st.gen) kill() }, 2100)   // 跑到一半自動示範 kill 災難
        } },

      { narration: '<b>接力模式：</b>Initializer 先把計畫落地到 <b>Disk</b>（checklist 用 JSON，因為 agent 會偷改 markdown）。之後每棒讀日誌→做一個→E2E→commit→寫日誌→交棒。', focus: ['.lr-track', '.lr-side'], nextLabel: '接力被砍會怎樣？ →',
        enter() { relay() } },

      { narration: '接力途中按 <b>Kill session</b> — <b style="color:' + GREEN + '">完全沒差</b>。進度在 disk，下一棒讀交班日誌照樣接手。每個 session 都是 disposable 的。', focus: ['.lr-track', '.lr-dialog', '.lr-side'], nextLabel: '換我玩 →',
        enter() {
          resetScene(); st.mode = 'relay'; st.running = true
          const gen = st.gen
          setFile('list', '10 features · JSON', false, true); setFile('git', 'initial commit', false, true)
          st.done = 3; [0, 1, 2].forEach(completeCell); setFile('log', '讀取：已完成 3/10', false, true)
          T(() => { if (gen === st.gen) runnerEnters(gen) }, 500)
          T(() => { if (gen === st.gen) kill() }, 2400)    // 自動示範接力 kill 無痛接手
        } },

      { narration: '換你玩 — <b>接力模式</b> vs <b>One-shot 硬跑</b>，中途隨時 <b>Kill session</b>，比較兩種模式差多少。', sandbox: true,
        enter() { startSandboxRun() } },
    ]
  }

  stage = createStage(el, ctx, { beats: buildBeats() })
  stage.body.append(scene, ctrls)

  return () => { clearT(); stage.destroy(); style.remove() }
}
