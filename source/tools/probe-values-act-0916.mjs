/* 16 Sep: does the values carousel actually work? Clicks a number, steps with an arrow, drags the
   stage, checks the auto-advance runs and that hover holds it, and checks the reduced-motion
   fallback renders the index. Usage: node tools/probe-values-act-0916.mjs */
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage()
const errs = []; p.on('console', e => { if (e.type() === 'error') errs.push(e.text()) }); p.on('pageerror', e => errs.push(String(e)))
await p.setViewport({ width: 1440, height: 950, deviceScaleFactor: 1 })
await p.goto('http://localhost:5177/about', { waitUntil: 'networkidle0', timeout: 60000 })
const front = () => p.evaluate(() => document.querySelector('.vc-card.is-front b').textContent)
const dot = () => p.evaluate(() => (document.querySelector('.vc-dots button.on') || {}).textContent)
await p.evaluate(() => document.querySelector('#values').scrollIntoView({ block: 'center' }))
await new Promise(r => setTimeout(r, 400))
const out = { start: [await front(), await dot()] }

/* click the number 4 */
await p.evaluate(() => [...document.querySelectorAll('.vc-dots button')].find(b => b.textContent === '4').click())
await new Promise(r => setTimeout(r, 900)); out.afterDot4 = [await front(), await dot()]

/* step with the right arrow */
await p.evaluate(() => document.querySelectorAll('.vc-arw')[1].click())
await new Promise(r => setTimeout(r, 900)); out.afterArrow = [await front(), await dot()]

/* click a card standing behind */
await p.evaluate(() => { const c = [...document.querySelectorAll('.vc-card')].find(c => !c.classList.contains('is-front') && parseFloat(getComputedStyle(c).opacity) > .5); c.querySelector('.vc-hit').click() })
await new Promise(r => setTimeout(r, 900)); out.afterCardClick = [await front(), await dot()]

/* drag the stage to the left */
const box = await (await p.$('.vc-stage')).boundingBox()
await p.mouse.move(box.x + box.width / 2, box.y + 40)
await p.mouse.down(); await p.mouse.move(box.x + box.width / 2 - 90, box.y + 40, { steps: 8 }); await p.mouse.up()
await new Promise(r => setTimeout(r, 900)); out.afterDrag = [await front(), await dot()]

/* held while the pointer is on it */
await p.mouse.move(box.x + box.width / 2, box.y + 40)
await new Promise(r => setTimeout(r, 7000)); out.heldOnHover = [await front(), await dot()]

/* released: it advances on its own */
await p.mouse.move(box.x + box.width / 2, box.y + box.height + 220)
await new Promise(r => setTimeout(r, 7200)); out.afterRelease = [await front(), await dot()]

/* keyboard: focus a card behind, press ArrowLeft */
await p.evaluate(() => { const c = [...document.querySelectorAll('.vc-hit')].find(b => b.tabIndex === 0); c.focus() })
await p.keyboard.press('ArrowLeft')
await new Promise(r => setTimeout(r, 900)); out.afterKey = [await front(), await dot()]

/* reduced motion falls back to the index */
const q = await b.newPage()
await q.setViewport({ width: 1440, height: 950 })
await q.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
await q.goto('http://localhost:5177/about', { waitUntil: 'networkidle0', timeout: 60000 })
out.reducedMotion = await q.evaluate(() => ({ carousel: !!document.querySelector('.vc-stage'), index: document.querySelectorAll('.vx-i').length }))
out.errors = errs
console.log(JSON.stringify(out, null, 1))
await b.close()
