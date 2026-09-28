import fs from 'node:fs'
const s = fs.readFileSync('public/checklist.html', 'utf8')
const k = s.indexOf('[', s.indexOf('const DATA = ['))
let d = 0, end = -1
for (let x = k; x < s.length; x++) { if (s[x] === '[') d++; else if (s[x] === ']') { d--; if (d === 0) { end = x; break } } }
const DATA = eval(s.slice(k, end + 1))
const tags = {}
const flagged = []
for (const sec of DATA) for (const it of sec.items) {
  for (const t of (it.tags || [])) tags[t] = (tags[t] || 0) + 1
  if ((it.tags || []).some(t => ['blocked', 'confirm', 'kiv', 'open', 'part'].includes(t))) flagged.push({ sec: sec.title, ...it })
}
console.log('KEYS ON AN ITEM:', Object.keys(DATA[0].items[0]).join(', '))
console.log('TAG CENSUS:', Object.entries(tags).sort((a, b) => b[1] - a[1]).map(([k2, v]) => `${k2}=${v}`).join('  '))
console.log('\nFLAGGED ITEMS (' + flagged.length + ')')
for (const f of flagged) console.log(`  [${f.id}] (${(f.tags || []).join(',')}) ${f.t.slice(0, 120)}\n        → ${(f.note || '').slice(0, 160)}`)
