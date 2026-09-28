import puppeteer from 'puppeteer-core'
import fs from 'fs'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/?admin', { waitUntil: 'networkidle0' })
await p.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle0' })
const t = await p.evaluate(() => {
  document.querySelectorAll('details').forEach(d => d.open = true)
  const secs = [...document.querySelectorAll('.pt main > *, .pt .cx > *, .pt section.pg-sec, .pt header')]
  const seen = new Set(); const out = []
  for (const s of secs) { if ([...seen].some(x => x.contains(s))) continue; seen.add(s); const tx = s.innerText.trim(); if (tx) out.push('########## ' + (s.id || s.className) + ' (' + tx.split(/\s+/).length + ' words)\n' + tx) }
  return out.join('\n\n')
})
fs.writeFileSync(process.argv[2], t); console.log(t.length, 'chars')
await b.close()
