/* 22 Oct 2026: copy comparison per page for the Polishing review. Usage: node tools/polish-diff.mjs [slug] [--full]
   Prints word counts, headings gone and new, and the sentences that only one side has. */
import fs from 'node:fs'
const R = 'public/polish', [want = '', full = ''] = process.argv.slice(2)
const read = f => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null)
const ixf = read(`${R}/new/index.json`)
const ix = ixf ? ixf.pages.map(p => p.slug) : fs.readdirSync(`${R}/new`).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''))
const sents = t => [...new Set((t || '').replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z0-9])/).map(s => s.trim()).filter(s => s.length > 24))]
for (const slug of ix) {
  if (want && !(want.startsWith('=') ? slug === want.slice(1) : slug.includes(want))) continue   /* =slug for an exact match */
  const o = read(`${R}/old/${slug}.json`), n = read(`${R}/new/${slug}.json`)
  if (!o || !n) { console.log(`\n## ${slug}: ${!o ? 'no old' : 'no new'}`); continue }
  const ow = o.text.split(/\s+/).length, nw = n.text.split(/\s+/).length
  const so = sents(o.text), sn = sents(n.text)
  const gone = so.filter(s => !sn.includes(s)), fresh = sn.filter(s => !so.includes(s))
  console.log(`\n## ${slug}  (${o.url})  old ${ow} words / ${o.height}px  ->  new ${nw} words / ${n.height}px`)
  console.log('   headings gone:', o.h.filter(h => !n.h.includes(h)).length, ' new:', n.h.filter(h => !o.h.includes(h)).length, ' | sentences gone:', gone.length, ' new:', fresh.length)
  console.log('   H old:', o.h.filter(h => /^h[12]/.test(h)).join(' | ').slice(0, 600))
  console.log('   H new:', n.h.filter(h => /^h[12]/.test(h)).join(' | ').slice(0, 600))
  if (full) { console.log('   GONE:'); for (const s of gone.slice(0, 40)) console.log('    - ' + s.slice(0, 220)); console.log('   NEW:'); for (const s of fresh.slice(0, 40)) console.log('    + ' + s.slice(0, 220)) }
}
