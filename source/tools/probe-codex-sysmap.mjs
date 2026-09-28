import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, tag] of [[1440, 'd'], [390, 'm']]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.setViewport({ width: w, height: 1000, isMobile: w < 500, hasTouch: w < 500 })
  await p.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle0', timeout: 60000 })
  const gate = await p.$('.cx-gate-card, .pt-login'); if (gate) { for (const x of await p.$$('button')) { const t = await x.evaluate(e => e.textContent); if (/Emergency/i.test(t)) { await x.click(); break } } await new Promise(r => setTimeout(r, 2500)) }
  await p.evaluate(() => { document.querySelectorAll('.cxr').forEach(e => e.classList.add('in')); document.querySelector('.sysm-embed')?.scrollIntoView({ block: 'start' }) }); await new Promise(r => setTimeout(r, 2000))
  const r = await p.evaluate(() => { const q = s => document.querySelector(s); const e = q('.sysm-embed'); return { embed: !!e, inP2: !!q('.cx-p2 .sysm-embed'), inView: e?.classList.contains('in'), h2Inside: !!e?.querySelector('h2'), stages: e?.querySelectorAll('.sysm-st').length, rows: e?.querySelectorAll('.sysm-u').length, kinds: e?.querySelectorAll('.sysm-wk').length, lit: e?.querySelectorAll('.sysm-u.lit').length, h3: q('.cx-p2 .cx-h3:nth-of-type(2)')?.textContent, explorerStill: !!q('.cx-p2 .rel, .cx-p2 [class*="rel-"]'), overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, width: Math.round(e?.getBoundingClientRect().width || 0), vw: innerWidth } })
  console.log(w, JSON.stringify(r), 'errors', errs.length ? errs : 0)
  const el = await p.$('.sysm-embed'); if (el) await el.screenshot({ path: `${OUT}/${tag}-codex-sysmap.png` })
  await p.close()
}
await b.close()
