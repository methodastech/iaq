import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle0', timeout: 60000 })
/* emergency access if gated */
const gate = await p.$('.cx-gate-card, .pt-login'); if (gate) { const btn = await p.$$('button'); for (const x of btn) { const t = await x.evaluate(e => e.textContent); if (/Emergency/i.test(t)) { await x.click(); break } } await new Promise(r => setTimeout(r, 2500)) }
const r1 = await p.evaluate(() => ({ armed: !!document.querySelector('.cx-page.cx-armed'), cxr: document.querySelectorAll('.cxr').length, inNow: document.querySelectorAll('.cxr.in').length, art: !!document.querySelector('.cx-head-art img'), artW: document.querySelector('.cx-head-art img')?.naturalWidth, keys: document.querySelectorAll('.cx-keys li .cx-key-eg').length, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }))
for (const sel of ['.cx-head', '.cx-key-band']) { const el = await p.$(sel); if (el) { await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 1400)); await el.screenshot({ path: `${OUT}/codex-${sel.replace(/\W/g, '')}.png` }) } }
const H = await p.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y < H; y += 800) { await p.evaluate(yy => window.scrollTo(0, yy), y); await new Promise(r => setTimeout(r, 120)) }
await new Promise(r => setTimeout(r, 1200))
const r2 = await p.evaluate(() => ({ cxr: document.querySelectorAll('.cxr').length, inAfterScroll: document.querySelectorAll('.cxr.in').length, groups: [...document.querySelectorAll('.pt-g')].map(b => b.textContent.trim()) }))
/* portal: click Documents group, expect navigation to downloads */
const docs = (await p.$$('.pt-g')).at(-1); await docs.click(); await new Promise(r => setTimeout(r, 800))
const r3 = await p.evaluate(() => ({ path: location.pathname, panel: [...document.querySelectorAll('.pt-panel .pt-p')].map(a => a.textContent.trim() + (a.classList.contains('on') ? ' [on]' : '')) }))
console.log(JSON.stringify({ r1, r2, r3 }), 'errors', errs.length ? errs : 0); await b.close()
