// 從 ../concepts/*.md 產生 src/data/concepts.json
// 概念 MD 檔是唯一內容來源（single source of truth）
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONCEPTS_DIR = join(__dirname, '..', '..', 'concepts')
const OUT = join(__dirname, '..', 'src', 'data', 'concepts.json')

function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) throw new Error('no frontmatter')
  const fm = {}
  const lines = m[1].split(/\r?\n/)
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const kv = line.match(/^(\w+):\s*(.*)$/)
    if (kv) {
      const [, key, rawVal] = kv
      if (key === 'source') {
        // YAML list of {title,url,date}
        const sources = []
        i++
        while (i < lines.length && /^\s+-?\s*\w+:/.test(lines[i])) {
          if (/^\s+-\s/.test(lines[i])) sources.push({})
          const item = sources[sources.length - 1]
          const skv = lines[i].match(/^\s+-?\s*(\w+):\s*(.*)$/)
          if (skv) item[skv[1]] = skv[2].replace(/^["']|["']$/g, '')
          i++
        }
        fm.source = sources
        continue
      }
      let v = rawVal.replace(/^["']|["']$/g, '')
      if (/^\d+$/.test(v)) v = Number(v)
      fm[key] = v
    }
    i++
  }
  return { fm, body: src.slice(m[0].length) }
}

function parseSections(body) {
  const sections = {}
  const parts = body.split(/^## /m).slice(1)
  for (const part of parts) {
    const nl = part.indexOf('\n')
    const heading = part.slice(0, nl).trim()
    sections[heading] = part.slice(nl + 1).trim()
  }
  return sections
}

const listItems = (s = '') =>
  s.split(/\r?\n/).filter(l => /^\s*(-|\d+\.)\s/.test(l)).map(l => l.replace(/^\s*(-|\d+\.)\s*/, '').trim())
const quoteItems = (s = '') =>
  s.split(/\r?\n\r?\n/).filter(b => b.trim().startsWith('>')).map(b => b.replace(/^>\s?/gm, '').trim())

const files = readdirSync(CONCEPTS_DIR).filter(f => /^\d+-.*\.md$/.test(f)).sort()
const concepts = files.map(f => {
  const src = readFileSync(join(CONCEPTS_DIR, f), 'utf8')
  const { fm, body } = parseFrontmatter(src)
  const s = parseSections(body)
  return {
    num: f.slice(0, 2),
    file: f,
    id: fm.id,
    title: fm.title,
    subtitle: fm.subtitle,
    chapter: fm.chapter,
    chapterTitle: fm.chapterTitle,
    sources: fm.source || [],
    oneLiner: (s['一句話'] || '').trim(),
    script: (s['三分鐘講稿'] || '').trim(),
    keyPoints: listItems(s['關鍵重點']),
    demoIdea: (s['互動示範構想'] || '').trim(),
    questions: listItems(s['課堂提問']),
    quotes: quoteItems(s['原文金句']),
  }
})

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(concepts, null, 2), 'utf8')
console.log(`✓ ${concepts.length} concepts → src/data/concepts.json`)
