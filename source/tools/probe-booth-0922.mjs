/* 22 Sep: the portal Booth tab and the booth screen. Shoots every section of /portal/booth at 1440, then each chapter of
   /booth/screen at 1920 x 1080, and reports errors, overflow, and the screen's smallest text size.
   Usage: node tools/probe-booth-0922.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 300000,
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--no-sandbox', '--autoplay-policy=no-user-gesture-required'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
const p = await b.newPage(); const errs = []
p.on('pageerror', e => errs.push('PAGE ' + String(e).slice(0, 200))); p.on('console', e => { if (e.type() === 'error') errs.push(e.text().slice(0, 200)) })
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/?admin', { waitUntil: 'domcontentloaded' }); await wait(1500)
await p.goto('http://localhost:5177/portal/booth?admin', { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(5000)
const info = await p.evaluate(() => ({ secs: [...document.querySelectorAll('.bt-sec')].map(s => s.id + ':' + Math.round(s.getBoundingClientRect().height)), overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  tab: [...document.querySelectorAll('.pt-tabs a')].map(a => a.textContent + (a.classList.contains('on') ? '*' : '')).join(' '), svgs: document.querySelectorAll('.bt svg.bt-art').length }))
console.log(JSON.stringify(info))
const head = await p.$('.bt-head'); await head.screenshot({ path: `${OUT}/bt-head.png` })
for (const id of ['brief', 'stand', 'surfaces', 'screen', 'takeaway', 'timeline', 'questions', 'files']) {
  const el = await p.$('#bt-' + id); await p.evaluate(e => e.scrollIntoView(), el); await wait(1200)
  await el.screenshot({ path: `${OUT}/bt-${id}.png` }).catch(e => errs.push('shot ' + id + ' ' + e.message.slice(0, 80)))
}
await p.evaluate(() => { const c = document.querySelector('.bt-tools input'); c.click() }); await wait(600)
const srf = await p.$('.bt-srf-w3'); await p.evaluate(e => e.scrollIntoView(), srf); await wait(800); await srf.screenshot({ path: `${OUT}/bt-w3-zones.png` })
/* the screen */
const s = await b.newPage(); await s.setViewport({ width: 1920, height: 1080 })
s.on('pageerror', e => errs.push('SCREEN ' + String(e).slice(0, 200)))
await s.goto('http://localhost:5177/booth/screen', { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(4000)
for (let i = 1; i <= 6; i++) {
  await s.keyboard.press(String(i)); await wait(i === 2 ? 9000 : 4500)
  const small = await s.evaluate(() => { let min = 999, who = ''; document.querySelectorAll('.bs-ch *').forEach(e => { if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return; const f = parseFloat(getComputedStyle(e).fontSize); if (f < min) { min = f; who = e.className || e.tagName } }); return min + ' ' + who })
  console.log('chapter', i, 'smallest text px', small)
  await s.screenshot({ path: `${OUT}/bs-${i}.png` })
}
console.log('errs', JSON.stringify(errs))
await b.close()
