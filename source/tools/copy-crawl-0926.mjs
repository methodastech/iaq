/* 26 Sep 2026: crawl every public route on the dev server and collect its visible copy (headings, ledes, paragraphs,
   list items, buttons), one JSON per route, for the copy audit (Bazil: "no negative statements, no weird writing,
   professional"). Usage: node tools/copy-crawl-0926.mjs <base> <out.json> */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const [base = 'http://localhost:52943', out = '/tmp/copy.json'] = process.argv.slice(2)
const src = fs.readFileSync(new URL('../src/data/sitemap.js', import.meta.url), 'utf8')
const routes = [...new Set([...src.matchAll(/(?:path|to|route):\s*'(\/[^']*)'/g)].map(m => m[1]))].filter(r => !/portal|codex|booth|semicon|shortlist|campaign|exhibition|investors|leadership|flow|lab|:/.test(r))
if (!routes.includes('/')) routes.unshift('/')
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--window-size=1400,900'] })
const p = await b.newPage(); await p.setViewport({ width: 1400, height: 900 })
const res = {}
for (const r of routes) {
  try {
    await p.goto(base + r + (r.includes('?') ? '&' : '?') + 'nointro=1', { waitUntil: 'networkidle2', timeout: 60000 }); await new Promise(x => setTimeout(x, 1200))
    res[r] = await p.evaluate(() => { const bad = e => e.closest('nav, footer, .topbar, .bmws, iframe, [aria-hidden="true"], .db3, script, style'); const seen = new Set(); const out = []; for (const e of document.querySelectorAll('h1, h2, h3, h4, p, li, blockquote, dt, dd, button, a.cta, figcaption, small, .lede, .eyebrow')) { if (bad(e)) continue; if ([...e.querySelectorAll('h1,h2,h3,h4,p,li')].length) continue; const t = e.innerText.replace(/\s+/g, ' ').trim(); if (t.length < 3 || seen.has(t)) continue; seen.add(t); out.push([e.tagName.toLowerCase(), t]) } return out })
  } catch (e) { res[r] = [['error', e.message.slice(0, 80)]] }
}
fs.writeFileSync(out, JSON.stringify(res, null, 1))
console.log('routes', routes.length, 'lines', Object.values(res).reduce((n, a) => n + a.length, 0))
await b.close()
