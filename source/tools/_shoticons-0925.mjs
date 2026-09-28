/* 25 Sep 2026: captures the icon library groups on /portal/direction. Usage: node tools/_shoticons-0925.mjs <outdir> */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const [out = '/tmp/icons'] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true })
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
const errs = []; p.on('pageerror', e => errs.push(e.message))
await p.goto('http://localhost:5177/portal', { waitUntil: 'load' }); await p.evaluate(() => localStorage.setItem('iaq.cms.session.v1', '1'))
await p.goto('http://localhost:5177/portal/direction', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 4000))
await p.addStyleTag({ content: '.bmws{visibility:hidden}' })
const groups = await p.$$('#icon-library .il-g')
for (const [i, g] of groups.entries()) {
  const name = await g.evaluate(e => e.dataset.group || e.querySelector('h3').textContent)
  await g.evaluate(e => e.scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 700))
  await g.screenshot({ path: `${out}/g${i}-${name.replace(/[^a-z0-9]+/gi, '-').slice(0, 30)}.png` })
}
console.log(JSON.stringify({ n: groups.length, errs }))
await b.close()
