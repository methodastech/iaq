/* 23 Oct 2026: the district cooling tour, frame by frame, headless on Metal, for the Polishing record.
   Usage: node tools/shot-dcs-1023.mjs <base> <outdir> <tag> [seconds=24] [every=1.5]   (writes <tag>-NN.webp + <tag>-log.json) */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const [base = 'http://localhost:5177', out = '/tmp/dcs', tag = 'shot', secs = '24', every = '1.5'] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new',
  args: ['--use-angle=metal', '--enable-gpu', '--hide-scrollbars', '--window-size=1440,900'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 160)))
await p.goto(base + '/services/energy-management', { waitUntil: 'networkidle2', timeout: 90000 }); await new Promise(w => setTimeout(w, 4000))
const sec = await p.$('.dcs3'); if (!sec) { console.log('no .dcs3'); await b.close(); process.exit(1) }
await p.evaluate(() => { const s = document.querySelector('.dcs3'); s.scrollIntoView({ block: 'start' }); window.scrollBy(0, -70) }); await new Promise(w => setTimeout(w, 2500))
/* puppeteer's clip is in DOCUMENT coordinates: the stage's box plus the scroll offset, the first 900 px of the wrap */
const clip = async () => await p.evaluate(() => { const w = document.querySelector('.dcs3-wrap') || document.querySelector('.dcs3'); const r = w.getBoundingClientRect(); return { x: 0, y: Math.max(0, r.top + window.scrollY - 16), width: 1440, height: Math.min(900, r.height + 32) } })
await p.screenshot({ path: `${out}/${tag}-00-rest.webp`, type: 'webp', quality: 85, clip: await clip() })
const log = []
await p.click('.dcs3-play'); const t0 = Date.now()
const n = Math.ceil(parseFloat(secs) / parseFloat(every))
for (let i = 1; i <= n; i++) {
  const due = t0 + i * parseFloat(every) * 1000; const wait = due - Date.now(); if (wait > 0) await new Promise(w => setTimeout(w, wait))
  const state = await p.evaluate(() => {
    const on = document.querySelector('.dcs3-steps .on, .dcs3-steps [aria-current], .dcs3-steps li.on, .dcs3-steps button.on')
    const labels = [...document.querySelectorAll('.dcs3-labels .on')].map(e => e.textContent.trim().slice(0, 60))
    return { step: on ? on.textContent.trim().slice(0, 60) : '', labels }
  })
  const t = ((Date.now() - t0) / 1000).toFixed(1)
  log.push({ t, ...state })
  await p.screenshot({ path: `${out}/${tag}-${String(i).padStart(2, '0')}-t${t}.webp`, type: 'webp', quality: 80, clip: await clip() })
}
fs.writeFileSync(`${out}/${tag}-log.json`, JSON.stringify({ log, errs }, null, 1))
console.log(log.map(l => `${l.t}s  ${l.step}  |  ${l.labels.join(' / ')}`).join('\n')); if (errs.length) console.log('ERRS', errs)
await b.close()
