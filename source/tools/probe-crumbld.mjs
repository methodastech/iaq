/* 15 Sep: does the production bundle publish a sane BreadcrumbList name on a sub-page?
   Spawns `vite preview` on a spare port, reads the JSON-LD on /about/history, exits. */
import puppeteer from 'puppeteer-core'
import { spawn } from 'node:child_process'
const PORT = process.argv[2] || '5181'
const srv = spawn('npx', ['vite', 'preview', '--port', PORT, '--strictPort'], { stdio: 'ignore' })
const wait = ms => new Promise(r => setTimeout(r, ms))
let up = false
for (let i = 0; i < 40 && !up; i++) { try { const r = await fetch(`http://localhost:${PORT}/`); up = r.ok } catch { await wait(250) } }
if (!up) { srv.kill(); console.log('preview never came up'); process.exit(1) }
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.goto(`http://localhost:${PORT}/about/history`, { waitUntil: 'networkidle0', timeout: 30000 })
const out = await p.evaluate(() => ({ h1: document.querySelector('h1')?.textContent, ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent).find(t => t.includes('BreadcrumbList')) }))
console.log(JSON.stringify({ errs, h1: out.h1, names: out.ld ? JSON.parse(out.ld).itemListElement.map(i => JSON.stringify(i.name).slice(0, 120)) : null }, null, 1))
await b.close(); srv.kill()
