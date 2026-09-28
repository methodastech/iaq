import fs from 'node:fs'
const s = fs.readFileSync('public/checklist.html', 'utf8')
const m = s.match(/id="savedState">([^<]*)</)
const saved = JSON.parse(decodeURIComponent(m[1]))
const done = saved.done || {}
const k = s.indexOf('[', s.indexOf('const DATA = ['))
let d = 0, end = -1
for (let x = k; x < s.length; x++) { if (s[x] === '[') d++; else if (s[x] === ']') { d--; if (d === 0) { end = x; break } } }
const DATA = eval(s.slice(k, end + 1))
let tot = 0, nd = 0
const open = []
for (const sec of DATA) for (const it of sec.items) {
  tot++
  if (done[it.id]) nd++; else open.push({ sec: sec.title, ...it })
}
console.log('TOTAL', tot, '· ticked', nd, '· OPEN', open.length)
const bucket = { blocked: [], kiv: [], confirm: [], bm: [] }
for (const o of open) {
  const t = o.tags || []
  if (t.includes('blocked')) bucket.blocked.push(o)
  else if (t.includes('kiv')) bucket.kiv.push(o)
  else if (t.includes('confirm')) bucket.confirm.push(o)
  else bucket.bm.push(o)
}
for (const [k2, v] of Object.entries(bucket)) {
  console.log('\n### ' + k2.toUpperCase() + ' (' + v.length + ')')
  for (const o of v) console.log(`  [${o.id}] ${o.t.slice(0, 130)}`)
}
