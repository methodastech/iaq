/* 22 Sep: the portal Booth as one page. Sections present, the bar follows the scroll, /portal/booth/<view> lands on
   its section, the live screen and booth page load inside, and a click inside the screen drives it.
   Usage: node tools/probe-booth-onepage-0922.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 300000,
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--no-sandbox', '--autoplay-policy=no-user-gesture-required'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
const p = await b.newPage(); const errs = []
p.on('pageerror', e => errs.push('PAGE ' + String(e).slice(0, 200))); p.on('console', e => { if (e.type() === 'error') errs.push(e.text().slice(0, 200)) })
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/portal/booth?admin', { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(4000)
console.log(JSON.stringify(await p.evaluate(() => ({ parts: [...document.querySelectorAll('.bt-part')].map(e => e.dataset.part + ':' + Math.round(e.offsetHeight)), h: document.documentElement.scrollHeight, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }))))
for (const id of ['stand', 'digital', 'website', 'files']) {
  await p.evaluate(id => document.querySelector(`.bt-tabs a[href="#bt-${id}"]`).click(), id); await wait(2200)
  console.log('bar', id, await p.evaluate(() => document.querySelector('.bt-tabs a.on')?.textContent + ' @' + Math.round(window.scrollY)))
}
/* deep link */
await p.goto('http://localhost:5177/portal/booth/digital', { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(6000)
console.log('deep', await p.evaluate(() => { const r = document.getElementById('bt-digital').getBoundingClientRect(); return document.querySelector('.bt-tabs a.on')?.textContent + ' top ' + Math.round(r.top) }))
const fr = await p.$('.bt-live iframe'); await p.evaluate(e => e.scrollIntoView({ block: 'center' }), fr); await wait(5000)
const frameOf = path => p.frames().find(x => x.url().includes(path))
let f = frameOf('/booth/screen')
console.log('screen in page', await f.evaluate(() => !!document.querySelector('.bs-stage') + ' ' + document.querySelector('.bs').className))
await p.screenshot({ path: `${OUT}/op-screen-loop.png` })
f = frameOf('/booth/screen'); const fr2 = await p.$('.bt-live iframe'); const box = await fr2.boundingBox()
/* a click on "Three units" in the screen's header: its nav buttons sit at the top of the frame */
const pos = await f.evaluate(() => { const r = document.querySelectorAll('.bs-top nav button')[1].getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, innerWidth, innerHeight] })
/* the frame's inner pixels map onto its box on the page (the parent's root zoom included) */
await p.mouse.click(box.x + pos[0] * box.width / pos[2], box.y + pos[1] * box.height / pos[3]); await wait(2500)
f = frameOf('/booth/screen'); console.log('after tap', await f.evaluate(() => document.querySelector('.bs').className + ' | ' + document.querySelector('.bs-top nav button.on')?.textContent))
await p.screenshot({ path: `${OUT}/op-screen-tap.png` })
const wf = await p.$('.bt-web-frame iframe'); await p.evaluate(e => e.scrollIntoView({ block: 'center' }), wf); await wait(5000)
console.log('booth page in page', await frameOf('/semicon').evaluate(() => document.querySelector('.sm-hero h1')?.textContent))
await p.screenshot({ path: `${OUT}/op-website.png` })
console.log('errs', JSON.stringify(errs))
await b.close()
