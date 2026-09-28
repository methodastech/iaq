/* my six record marks beside the site's own interface marks, same size, same ink, so the two sets can be judged
   against each other rather than in isolation */
import fs from 'fs'
import puppeteer from 'puppeteer-core'
const design = fs.readFileSync('public/design.html', 'utf8')
const sprite = design.slice(design.indexOf('<svg width="0" height="0"'), design.indexOf('</defs></svg>') + 13)
const mine = fs.readFileSync('src/components/RecordFlat.jsx', 'utf8')
const bodies = [...mine.matchAll(/export function (Rf\w+) \(p\) \{\n  return wrap\(p, <>\n([\s\S]*?)\n  <\/>\)/g)]
  .map(m => [m[1], m[2]
    .replace(/\{\.\.\.S\}/g, 'fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter"')
    .replace(/\{\.\.\.SIG\}/g, 'fill="none" stroke="#EC2027" stroke-width="1.8" stroke-linecap="butt" stroke-linejoin="miter"')
    .replace(/className=/g, 'class=')
    .replace(/\{\[1, 2, 3, 4, 5, 6\][\s\S]*?\}\)\}/, [1,2,3,4,5,6].map(i => { const a=(i/7)*Math.PI*2-Math.PI/2; return `<path d="M12 12L${(12+Math.cos(a)*8).toFixed(2)} ${(12+Math.sin(a)*8).toFixed(2)}" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter"/>` }).join(''))
  ])
const HOUSE = ['f-globe', 'f-file', 'f-grid', 'f-chip', 'f-check', 'f-drawing']
const cell = (inner, label, size) => `<figure style="width:${size + 40}px"><svg viewBox="0 0 24 24" style="width:${size}px;height:${size}px;color:#111A2B">${inner}</svg><figcaption>${label}</figcaption></figure>`
const html = `<!doctype html><meta charset=utf-8><style>
body{margin:0;background:#EFF2F7;font:600 11px/1.3 -apple-system,sans-serif;color:#6B7688;padding:22px}
h4{font:700 12px/1 -apple-system;color:#0B1220;margin:20px 0 10px;letter-spacing:.06em;text-transform:uppercase}
.r{display:flex;gap:14px;align-items:flex-end;flex-wrap:wrap}
figure{margin:0;text-align:center}figcaption{margin-top:6px}
</style>${sprite}
<h4>The record set, redrawn to the house spec &middot; 96 px</h4>
<div class=r>${bodies.map(([n, b]) => cell(b, n.replace('Rf', '').toLowerCase(), 96)).join('')}</div>
<h4>The interface set, the site's own 41 marks &middot; 96 px</h4>
<div class=r>${HOUSE.map(h => cell(`<use href="#${h}"/>`, h.slice(2), 96)).join('')}</div>
<h4>Both at the size they ship &middot; 37 px</h4>
<div class=r>${bodies.map(([n, b]) => cell(b, '', 37)).join('')}${HOUSE.map(h => cell(`<use href="#${h}"/>`, '', 37)).join('')}</div>`
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 1120, height: 700, deviceScaleFactor: 2 })
await p.setContent(html, { waitUntil: 'load' })
await p.screenshot({ path: process.argv[2], fullPage: true })
await b.close()
console.log('compare', process.argv[2], 'mine:', bodies.length)
