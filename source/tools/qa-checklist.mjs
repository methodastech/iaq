/* Regenerates the four "10 Sep · QA review" sections of public/checklist.html from tools/qa-data.json
   (idempotent: existing qa-* sections are replaced) and ticks the fixed items in the baked seed.
   Usage: node tools/qa-checklist.mjs */
import fs from 'node:fs'
const D = JSON.parse(fs.readFileSync('tools/qa-data.json', 'utf8')); const P = D.problems
const TAG = { Wrong: 'design', Improve: 'design', Add: 'content', Remove: 'remove', Unclear: 'copy', 'Hard to understand': 'copy', Vague: 'copy', 'Hard to navigate': 'design' }
const cut = (s, n) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + ' …' : s)
const item = (p, done) => {
  const st = p.status.split(' ')[0]; const tags = [TAG[p.type] || 'design']
  if (!done && ['Blocked', 'Decision', 'Part'].includes(st)) tags.push('blocked'); if (!done && st === 'Scheduled') tags.push('kiv')
  return { id: 'q' + p.id.slice(1), t: `${p.id} · ${p.area} · ${p.sev}: ${cut(p.problem, 150)}`, note: `Fix: ${cut(p.solution, 230)} · Owner: ${p.owner} · Status: ${p.status} · Detail and three checks on /qa.html`, tags, time: '10 Sep QA' }
}
const g = f => P.filter(f)
const S = [
  ['qa-done', '10 Sep · QA review · Fixed and verified', n => `${n} items closed in the QA pass, each with three checks on /qa.html`, g(p => p.status.startsWith('Done')), true],
  ['qa-part', '10 Sep · QA review · Part done or scheduled', n => `${n} items: code in place, waiting on a config, a copy phase or a small build`, g(p => ['Part', 'Scheduled'].includes(p.status.split(' ')[0])), false],
  ['qa-blocked', '10 Sep · QA review · Blocked on IAQ content', n => `${n} items that need files, text or clearance from IAQ`, g(p => p.status.startsWith('Blocked')), false],
  ['qa-decide', '10 Sep · QA review · Decisions for Bazil', n => `${n} items that change the look or the architecture; not changed until decided`, g(p => p.status.startsWith('Decision')), false],
]
const js = v => Array.isArray(v) ? '[' + v.map(js).join(', ') + ']' : typeof v === 'object' ? '{' + Object.entries(v).map(([k, x]) => k + ':' + js(x)).join(', ') + '}' : JSON.stringify(v)
const block = S.filter(([, , , items]) => items.length).map(([id, title, sub, items, done]) => `  {\n    id:${JSON.stringify(id)}, title:${JSON.stringify(title)}, sub:${JSON.stringify(sub(items.length))},\n    items:[\n${items.map(p => '      ' + js(item(p, done)) + ']'.slice(0, 0)).join(',\n')}\n    ]\n  }`).join(',\n')
let s = fs.readFileSync('public/checklist.html', 'utf8')
/* drop existing qa sections */
s = s.replace(/,\n  \{\n    id:"qa-[\s\S]*?\n  \}(?=\n\];)/, '')
const i = s.lastIndexOf('\n];'); s = s.slice(0, i) + ',\n' + block + s.slice(i)
const m = s.match(/<script type="application\/json" id="savedState">([^<]+)<\/script>/); const seed = JSON.parse(decodeURIComponent(m[1]))
for (const p of P) { const k = 'q' + p.id.slice(1); if (p.status.startsWith('Done')) seed.done[k] = true; else delete seed.done[k] }
seed.savedAt = Date.now()
s = s.replace(m[0], '<script type="application/json" id="savedState">' + encodeURIComponent(JSON.stringify(seed)) + '</script>')
fs.writeFileSync('public/checklist.html', s)
console.log('checklist qa sections:', S.filter(([, , , items]) => items.length).map(([id, , , items]) => id + '=' + items.length).join(' '), '· ticked', Object.values(seed.done).filter(Boolean).length)
