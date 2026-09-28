import fs from 'node:fs'
const s = fs.readFileSync('public/checklist.html', 'utf8')
const i = s.indexOf('const DATA = [')
const j = s.indexOf('\n  ]\n', i)
// find matching close of the array by bracket counting
let d = 0, k = s.indexOf('[', i), end = -1
for (let x = k; x < s.length; x++) { if (s[x] === '[') d++; else if (s[x] === ']') { d--; if (d === 0) { end = x; break } } }
const src = s.slice(k, end + 1)
const DATA = eval(src)
let tot = 0, done = 0
const open = []
for (const sec of DATA) for (const it of sec.items) {
  tot++
  if (it.done) done++; else open.push({ sec: sec.title, id: it.id, t: it.t, tags: (it.tags || []).join(','), owner: it.owner || '', note: it.note || '' })
}
console.log('TOTAL', tot, 'done', done, 'open', open.length)
console.log('--- OPEN ITEMS ---')
for (const o of open) console.log(`[${o.id}] ${o.tags} :: ${o.t.slice(0, 150)}`)
