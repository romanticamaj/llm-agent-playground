import './style.css'
import concepts from './data/concepts.json'
import { initBg, setBgAccent, pulseBg } from './bg3d.js'
import { demoRegistry } from './demos/index.js'
import { loadTeaser } from './teasers/index.js'

const CHAPTERS = {
  1: { en: 'WHY CONCEPTS', accent: '#9db1e8', route: '入門 · 授課主線', belt: 'core' },
  2: { en: 'THE NATURE OF LLMS', accent: '#8ea9e8', route: '入門 · 授課主線', belt: 'core' },
  3: { en: 'FROM CHAT TO AGENT', accent: '#72c2ae', route: '入門 · 授課主線', belt: 'core' },
  4: { en: 'MEMORY', accent: '#d9a866', route: '進階 · 工程師路線', belt: 'adv' },
  5: { en: 'AGENT ENGINEERING', accent: '#a794d4', route: '進階 · 工程師路線', belt: 'adv' },
  6: { en: 'MULTI-AGENT & LONG-RUNNING', accent: '#cf8b96', route: '進階 · 工程師路線', belt: 'adv' },
  7: { en: 'WORKING WITH AI', accent: '#b8c48a', route: '進階 · 工程師路線', belt: 'adv' },
  8: { en: 'SAFETY & EVALS', accent: '#d08770', route: '進階 · 工程師路線', belt: 'adv' },
  9: { en: 'THE HORIZON', accent: '#dbc27e', route: '視野 · 工作型態與品味', belt: 'vision' },
}
const BELTS = [
  { key: 'all', label: '全部' },
  { key: 'core', label: '入門' },
  { key: 'adv', label: '進階' },
  { key: 'vision', label: '視野' },
]

const app = document.getElementById('app')
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const mdInline = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<code>$1</code>')
const paras = s => s.split(/\n\n+/).map(p => `<p>${mdInline(p.trim()).replace(/\n/g, '<br>')}</p>`).join('')

/* ============ build DOM ============ */
let html = `
<header class="topbar">
  <a class="wordmark" href="#top">GARY'S <em>AI</em> LAB</a>
  <div class="topbar-right">
    <button class="btn-ghost" id="btn-index">目錄 <kbd>K</kbd></button>
    <div class="track-switch" id="track-switch">${BELTS.map(b => `<button data-track="${b.key}" class="${b.key === 'all' ? 'on' : ''}">${b.label}</button>`).join('')}</div>
    <a class="btn-ghost gh-link" href="https://github.com/romanticamaj/llm-agent-playground" target="_blank" rel="noopener" aria-label="GitHub repo" title="GitHub — llm-agent-playground">
      <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
    </a>
    <button class="btn-ghost" id="btn-pres">上課模式 <kbd>P</kbd></button>
  </div>
</header>
<nav class="rail" id="rail"></nav>
<div class="hud-bl" id="hud-bl">// INDEX</div>
<div class="hud-br" id="hud-br"></div>
<div class="pres-hud" id="pres-hud">← → 換頁 · ENTER 互動 · N 筆記 · ESC 離開</div>
<div class="toast" id="toast"></div>
<div class="cursor-ring" id="cursor-ring"></div>
<div class="cursor-dot" id="cursor-dot"></div>

<section class="section hero" id="top" data-chapter="1" data-belt="all">
  <div class="kicker reveal">////// Interactive AI Concepts</div>
  <h1 class="reveal d1">AI 概念<br>實驗室</h1>
  <p class="sub reveal d2">用 ${concepts.length} 個概念，從 LLM 的本質一路走到 Agent 工程。<br>每一個概念，都可以親手玩。</p>
  <p class="credit reveal d3">SOURCE // <a href="https://www.garyhsieh.com/blog" target="_blank" rel="noopener">garyhsieh.com</a> · PRESS <b>P</b> FOR STAGE MODE</p>
  <div class="marquee reveal d3"><div class="track" id="marquee-track"></div></div>
  <div class="scroll-hint">SCROLL</div>
</section>
`

let lastChapter = 0
for (const c of concepts) {
  if (c.chapter !== lastChapter) {
    lastChapter = c.chapter
    const ch = CHAPTERS[c.chapter]
    html += `
<section class="section chapter-divider" id="ch${c.chapter}" data-chapter="${c.chapter}" data-belt="${ch.belt}" data-chapter-start>
  <div class="ch-route reveal">${esc(ch.route)}</div>
  <div class="ch-num reveal">0${c.chapter}</div>
  <div class="ch-title reveal d1">${esc(c.chapterTitle)}</div>
  <div class="ch-en reveal d2">${esc(ch.en)}</div>
</section>`
  }
  const srcBtn = (!c.classroom && c.sources.length)
    ? `<a class="btn-secondary" href="${c.sources[0].url}" target="_blank" rel="noopener">原文 ↗</a>`
    : ''
  html += `
<section class="section concept" id="${c.id}" data-chapter="${c.chapter}" data-belt="${CHAPTERS[c.chapter].belt}" data-id="${c.id}">
  <div class="concept-inner">
    <div class="concept-text">
      <div class="meta reveal"><span class="num">${c.num}</span><span class="subtitle">${esc(c.subtitle)}</span></div>
      <h2 class="reveal d1">${esc(c.title)}</h2>
      <div class="one-liner reveal d2">${mdInline(c.oneLiner)}</div>
      <div class="actions reveal d3">
        <button class="btn-primary" data-demo="${c.id}">進入互動</button>
        <button class="btn-secondary" data-notes="${c.id}">課堂筆記</button>
        ${srcBtn}
      </div>
    </div>
    <div class="teaser-card reveal d2" data-teaser="${c.id}" data-demo="${c.id}" title="點擊進入互動">
      <div class="teaser-stage"></div>
      <div class="teaser-hint">LIVE · 點擊互動</div>
    </div>
  </div>
</section>`
}

html += `
<section class="section outro" data-chapter="9" data-belt="all">
  <h2 class="reveal">概念是入口，<br>原文是完整的旅程。</h2>
  <p class="reveal d1">這 ${concepts.length} 個概念都來自 Gary 的第一手實作心得與授課現場。每一篇原文都有更多細節、來源與工程脈絡。</p>
  <div class="actions reveal d2"><a class="btn-primary" style="text-decoration:none" href="https://www.garyhsieh.com/blog" target="_blank" rel="noopener">去讀原文 ↗</a></div>
</section>

<div class="notes-panel" id="notes" aria-hidden="true">
  <div class="notes-box" role="dialog" aria-label="課堂筆記">
    <div class="notes-head"><div class="t" id="notes-title"></div><button class="close-x" id="notes-close">✕</button></div>
    <div class="notes-body" id="notes-body"></div>
  </div>
</div>

<div class="palette" id="palette" aria-hidden="true">
  <div class="palette-box" role="dialog" aria-label="概念目錄">
    <div class="palette-head"><span>// INDEX · 概念目錄</span><span>ESC 關閉</span></div>
    <div class="palette-scroll" id="palette-scroll"></div>
  </div>
</div>

<div class="demo-overlay" id="demo-overlay">
  <div class="demo-head">
    <div class="dt"><span class="num" id="demo-num"></span><span class="name" id="demo-name"></span></div>
    <div style="display:flex;align-items:center;gap:16px">
      <span class="hint">ESC 關閉</span>
      <button class="close-x" id="demo-close">✕</button>
    </div>
  </div>
  <div class="demo-stage" id="demo-stage"></div>
</div>
`
app.innerHTML = html

const byId = Object.fromEntries(concepts.map(c => [c.id, c]))
const sections = [...document.querySelectorAll('.section')]

/* ============ progress rail ============ */
const rail = document.getElementById('rail')
sections.forEach((sec, i) => {
  const d = document.createElement('button')
  d.className = 'dot' + (sec.hasAttribute('data-chapter-start') || sec.classList.contains('hero') ? ' chapter-start' : '')
  d.title = sec.querySelector('h2, .ch-title, h1')?.textContent?.slice(0, 24) || ''
  d.addEventListener('click', () => sec.scrollIntoView({ behavior: 'smooth' }))
  rail.appendChild(d)
  sec._dot = d
  sec._index = i
})

/* ============ three.js background ============ */
initBg(document.getElementById('bg3d'))

/* ============ marquee ============ */
const marqueeTrack = document.getElementById('marquee-track')
if (marqueeTrack) {
  const words = concepts.map(c => c.subtitle.toUpperCase())
  const seq = words.map(w => `<span>${esc(w)}</span><span class="volt">//</span>`).join('')
  marqueeTrack.innerHTML = seq + seq // 兩份做無縫循環
}

/* ============ corner HUD ============ */
const hudBl = document.getElementById('hud-bl')
const hudBr = document.getElementById('hud-br')
function updateHud(sec) {
  const c = sec.dataset.id ? byId[sec.dataset.id] : null
  if (c) {
    hudBl.innerHTML = `// ${c.num} <span class="sep">·</span> ${esc(c.subtitle.toUpperCase())}`
  } else if (sec.hasAttribute('data-chapter-start')) {
    const ch = Number(sec.dataset.chapter)
    hudBl.innerHTML = `// CH.0${ch} <span class="sep">·</span> ${esc(CHAPTERS[ch].en)}`
  } else {
    hudBl.innerHTML = `// GARY'S AI LAB`
  }
  const c2 = sec.dataset.id ? byId[sec.dataset.id] : null
  if (c2) hudBr.innerHTML = `<b>${c2.num}</b> / ${String(concepts.length).padStart(2, '0')}`
  else if (sec.hasAttribute('data-chapter-start')) hudBr.innerHTML = `<b>CH.${sec.dataset.chapter}</b> / 06`
  else hudBr.innerHTML = `${concepts.length} CONCEPTS`
}

/* ============ live teasers ============ */
const teaserCleanups = new Map()
const teaserIO = new IntersectionObserver(entries => {
  for (const e of entries) {
    const card = e.target
    const id = card.dataset.teaser
    if (e.isIntersecting && !teaserCleanups.has(id)) {
      teaserCleanups.set(id, null) // 占位防重入
      loadTeaser(id).then(mountFn => {
        const stage = card.querySelector('.teaser-stage')
        stage.innerHTML = ''
        const cleanup = mountFn(stage, { accent: CHAPTERS[Number(card.closest('.section').dataset.chapter)].accent, concept: byId[id] })
        teaserCleanups.set(id, cleanup)
      })
    } else if (!e.isIntersecting && teaserCleanups.has(id)) {
      const fn = teaserCleanups.get(id)
      if (typeof fn === 'function') { try { fn() } catch {} }
      teaserCleanups.delete(id)
    }
  }
}, { rootMargin: '160px 0px' })
document.querySelectorAll('.teaser-card').forEach(t => teaserIO.observe(t))

/* ============ hero kinetic type ============ */
const heroH1 = document.querySelector('.hero h1')
if (heroH1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const frag = document.createDocumentFragment()
  for (const line of heroH1.innerHTML.split('<br>')) {
    const lineEl = document.createElement('span')
    lineEl.className = 'h1-line'
    for (const chch of [...line]) {
      const sp = document.createElement('span')
      sp.className = 'h1-ch'
      sp.textContent = chch
      lineEl.appendChild(sp)
    }
    frag.appendChild(lineEl)
  }
  heroH1.innerHTML = ''
  heroH1.appendChild(frag)
  heroH1.querySelectorAll('.h1-ch').forEach((sp, i) => {
    sp.style.animationDelay = (0.15 + i * 0.055) + 's'
  })
}

/* ============ scroll spy ============ */
let currentIndex = 0
const io = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add('visible')
      currentIndex = e.target._index
      rail.querySelectorAll('.dot').forEach(d => d.classList.remove('active'))
      e.target._dot.classList.add('active')
      const ch = Number(e.target.dataset.chapter || 1)
      const accent = CHAPTERS[ch].accent
      document.documentElement.style.setProperty('--accent', accent)
      setBgAccent(accent)
      updateHud(e.target)
      syncTrackHighlight(e.target)
    }
  }
}, { threshold: 0.45 })
sections.forEach(s => io.observe(s))

/* ============ custom cursor ============ */
const curDot = document.getElementById('cursor-dot')
const curRing = document.getElementById('cursor-ring')
if (matchMedia('(pointer: fine)').matches) {
  let mx = -100, my = -100, rx = -100, ry = -100
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY }, { passive: true })
  addEventListener('pointerover', e => {
    curRing.classList.toggle('hot', !!e.target.closest('a, button, [cursor=pointer], .dot'))
  }, { passive: true })
  ;(function loop() {
    rx += (mx - rx) * 0.18
    ry += (my - ry) * 0.18
    curDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`
    curRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`
    requestAnimationFrame(loop)
  })()
} else {
  curDot.remove(); curRing.remove()
}

/* ============ magnetic buttons（主 CTA 磁吸） ============ */
if (matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.3}px)`
    })
    btn.addEventListener('pointerleave', () => {
      btn.style.transition = 'transform 0.5s cubic-bezier(.2,.8,.2,1)'
      btn.style.transform = ''
      setTimeout(() => { btn.style.transition = '' }, 500)
    })
  })
}

/* ============ notes panel ============ */
const notes = document.getElementById('notes')
const notesTitle = document.getElementById('notes-title')
const notesBody = document.getElementById('notes-body')
function openNotes(id) {
  const c = byId[id]
  if (!c) return
  notesTitle.textContent = `${c.num} · ${c.title}`
  notesBody.innerHTML = `
    <h4>一句話</h4><blockquote>${mdInline(c.oneLiner)}</blockquote>
    <h4>三分鐘講稿</h4>${paras(c.script)}
    <h4>關鍵重點</h4><ul>${c.keyPoints.map(k => `<li>${mdInline(k)}</li>`).join('')}</ul>
    <h4>課堂提問</h4><ul>${c.questions.map(q => `<li>${mdInline(q)}</li>`).join('')}</ul>
    <h4>原文金句</h4>${c.quotes.map(q => `<blockquote>${mdInline(q)}</blockquote>`).join('')}
    ${c.classroom
      ? `<h4>出處</h4><p>2026-07 課堂實錄</p>` + (c.sources.length ? `<h4>延伸閱讀</h4>` + c.sources.map(s => `<a class="src-link" href="${s.url}" target="_blank" rel="noopener">↗ ${esc(s.title || s.url)}</a>`).join('') : '')
      : `<h4>原文出處</h4>` + c.sources.map(s => `<a class="src-link" href="${s.url}" target="_blank" rel="noopener">↗ ${esc(s.title || s.url)}</a>`).join('')}
  `
  notes.classList.add('open')
  notesBody.scrollTop = 0
}
document.getElementById('notes-close').addEventListener('click', () => notes.classList.remove('open'))
notes.addEventListener('click', e => { if (e.target === notes) notes.classList.remove('open') })

/* ============ demo overlay ============ */
const overlay = document.getElementById('demo-overlay')
const stage = document.getElementById('demo-stage')
let activeCleanup = null
let overlayOpen = false

async function openDemo(id) {
  const c = byId[id]
  if (!c) return
  notes.classList.remove('open')
  document.getElementById('demo-num').textContent = c.num
  document.getElementById('demo-name').textContent = `${c.title} — ${c.subtitle}`
  overlay.classList.add('open')
  overlayOpen = true
  stage.innerHTML = `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--text-dim);letter-spacing:.3em;font-size:13px">LOADING…</div>`
  pulseBg()
  try {
    const loader = demoRegistry[id]
    const mod = loader ? await loader() : null
    stage.innerHTML = ''
    const mountEl = document.createElement('div')
    mountEl.style.cssText = 'position:absolute;inset:0;'
    stage.appendChild(mountEl)
    const ctx = {
      accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
      concept: c,
    }
    activeCleanup = mod?.default ? mod.default(mountEl, ctx) : null
  } catch (err) {
    console.error('[demo]', id, err)
    stage.innerHTML = `<div style="position:absolute;inset:0;display:flex;flex-direction:column;gap:16px;align-items:center;justify-content:center;color:var(--text-dim)">
      <svg viewBox="0 0 48 48" style="width:44px;height:44px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M24 6 4 40h40L24 6z"/><path d="M24 20v10"/><circle cx="24" cy="35" r="0.5"/></svg>
      <div style="font-size:16px;letter-spacing:.1em">這個互動還在打磨中</div></div>`
  }
}
function closeDemo() {
  if (typeof activeCleanup === 'function') { try { activeCleanup() } catch {} }
  activeCleanup = null
  overlay.classList.remove('open')
  overlayOpen = false
  setTimeout(() => { if (!overlayOpen) stage.innerHTML = '' }, 380)
}
document.getElementById('demo-close').addEventListener('click', closeDemo)

app.addEventListener('click', e => {
  const demoBtn = e.target.closest('[data-demo]')
  if (demoBtn) { demoBtn.blur(); return openDemo(demoBtn.dataset.demo) }
  const notesBtn = e.target.closest('[data-notes]')
  if (notesBtn) { notesBtn.blur(); return openNotes(notesBtn.dataset.notes) }
})

/* ============ presentation mode ============ */
const toast = document.getElementById('toast')
let toastTimer = null
function showToast(msg) {
  toast.textContent = msg
  toast.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200)
}

let presentation = false
function setPresentation(on) {
  presentation = on
  document.body.classList.toggle('presentation', on)
  if (on) showToast('上課模式 — ← → 換頁 · ENTER 互動 · ESC 離開')
}
document.getElementById('btn-pres').addEventListener('click', () => setPresentation(!presentation))

function gotoSection(delta) {
  const next = Math.min(sections.length - 1, Math.max(0, currentIndex + delta))
  sections[next].scrollIntoView({ behavior: 'smooth' })
}

/* ============ 路線切換器（平滑捲動導航到各帶起點） ============ */
const trackSwitch = document.getElementById('track-switch')
const BELT_ANCHOR = { all: '#top', core: '#ch1', adv: '#ch4', vision: '#ch9' }
trackSwitch.addEventListener('click', e => {
  const b = e.target.closest('button[data-track]')
  if (!b) return
  document.querySelector(BELT_ANCHOR[b.dataset.track])?.scrollIntoView({ behavior: 'smooth' })
})
// 目前所在帶自動高亮（跟著捲動）
function syncTrackHighlight(sec) {
  const belt = sec.dataset.belt === 'all'
    ? (sec.classList.contains('hero') ? 'all' : 'vision')
    : sec.dataset.belt
  trackSwitch.querySelectorAll('button').forEach(b =>
    b.classList.toggle('on', b.dataset.track === (sec.classList.contains('hero') ? 'all' : belt)))
}

/* ============ 快速導航面板（command palette 式主題索引） ============ */
const palette = document.getElementById('palette')
const paletteScroll = document.getElementById('palette-scroll')
;(function buildPalette() {
  const groups = new Map()
  for (const c of concepts) {
    if (!groups.has(c.chapter)) groups.set(c.chapter, [])
    groups.get(c.chapter).push(c)
  }
  let ph = ''
  for (const [chapter, list] of [...groups.entries()].sort((a, b) => a[0] - b[0])) {
    const ch = CHAPTERS[chapter]
    ph += `
<div class="pal-chapter" style="--accent:${ch.accent}">
  <div class="pal-ch-head">
    <span class="pal-ch-num">CH.0${chapter}</span>
    <span class="pal-ch-title">${esc(list[0].chapterTitle)}</span>
    <span class="pal-ch-en">${esc(ch.en)}</span>
  </div>
  <div class="pal-grid">
    ${list.map(c => `<button class="pal-item" data-goto="${c.id}"><span class="pal-num">${c.num}</span><span class="pal-item-title">${esc(c.title)}</span></button>`).join('')}
  </div>
</div>`
  }
  paletteScroll.innerHTML = ph
})()

let paletteOpen = false
function openPalette() {
  if (overlayOpen) return
  const curId = sections[currentIndex]?.dataset.id
  palette.querySelectorAll('.pal-item').forEach(b => b.classList.toggle('current', !!curId && b.dataset.goto === curId))
  palette.classList.add('open')
  palette.setAttribute('aria-hidden', 'false')
  paletteOpen = true
  paletteScroll.querySelector('.pal-item.current')?.scrollIntoView({ block: 'center' })
}
function closePalette() {
  palette.classList.remove('open')
  palette.setAttribute('aria-hidden', 'true')
  paletteOpen = false
}
palette.addEventListener('click', e => {
  if (e.target === palette) return closePalette()
  const item = e.target.closest('[data-goto]')
  if (item) {
    closePalette()
    document.getElementById(item.dataset.goto)?.scrollIntoView({ behavior: 'smooth' })
  }
})
document.getElementById('btn-index').addEventListener('click', openPalette)
hudBl.addEventListener('click', openPalette)

document.addEventListener('keydown', e => {
  if (e.target.matches('input, textarea, [contenteditable]')) return
  if (e.key === 'Escape') {
    if (paletteOpen) return closePalette()
    if (overlayOpen) return closeDemo()
    if (notes.classList.contains('open')) return notes.classList.remove('open')
    if (presentation) return setPresentation(false)
    return
  }
  if (paletteOpen) {
    if (e.key === 'k' || e.key === 'K') closePalette()
    return
  }
  if (overlayOpen) return
  switch (e.key) {
    case 'k': case 'K':
      openPalette(); break
    case 'p': case 'P':
      setPresentation(!presentation); break
    case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ':
      if (presentation) { e.preventDefault(); gotoSection(1) }
      break
    case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
      if (presentation) { e.preventDefault(); gotoSection(-1) }
      break
    case 'Enter': {
      e.preventDefault()
      const sec = sections[currentIndex]
      if (sec?.dataset.id) openDemo(sec.dataset.id)
      break
    }
    case 'n': case 'N': {
      const sec = sections[currentIndex]
      if (sec?.dataset.id) {
        notes.classList.contains('open') ? notes.classList.remove('open') : openNotes(sec.dataset.id)
      }
      break
    }
  }
})
