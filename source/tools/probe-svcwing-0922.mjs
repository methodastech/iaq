/* 22 Sep: the Services wing as three columns. Shoots it at rest and with each unit under the pointer, and reports which
   services light for each unit (against the Codex), the hrefs inside the unit cards, and the column count.
   Usage: node tools/probe-svcwing-0922.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })   /* not the Metal flags: under them the animation clock stalls between screenshots and the wing is shot half open */
const wait = ms => new Promise(r => setTimeout(r, ms))
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/about', { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(3500)
const hubs = await p.$$('.nav-has'); await hubs[1].hover(); await wait(4000)
const vis = await p.evaluate(() => [...document.querySelectorAll('.nm-seg, .nm-st')].map(e => getComputedStyle(e).opacity).join(' '))
console.log('opacity of the 3 cards and 6 rows:', vis)
const rest = await p.evaluate(() => { const m = document.querySelectorAll('.nav-has')[1].querySelector('.nav-mega'), r = m.getBoundingClientRect()
  const cols = [m.querySelector('.nm-lead'), m.querySelector('.nm-segs'), m.querySelector('.nm-strip')].map(e => { const q = e.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.width)] })
  return { wingBottom: Math.round(r.bottom), viewport: innerHeight, wing: [Math.round(r.left), Math.round(r.right)], cols, sameRow: new Set([m.querySelector('.nm-lead'), m.querySelector('.nm-segs'), m.querySelector('.nm-strip')].map(e => Math.round(e.getBoundingClientRect().top))).size === 1,
    cards: m.querySelectorAll('.nm-seg').length, services: m.querySelectorAll('.nm-st').length, subLinks: [...m.querySelectorAll('.nm-seg-sub a')].map(a => a.textContent + ' > ' + a.getAttribute('href')), deadChips: m.querySelectorAll('.nm-seg-sub span').length } })
console.log('rest', JSON.stringify(rest))
await p.screenshot({ path: `${OUT}/svc-rest.png`, clip: { x: 60, y: 60, width: 1380, height: 640 } })
const cards = await p.$$('.nav-has:nth-of-type(2) .nm-seg, .nm-seg')
for (let k = 0; k < 3; k++) {
  await cards[k].hover(); await wait(1500)
  const st = await p.evaluate(() => ({ head: document.querySelector('.nm-strip .nm-gl').textContent, rows: [...document.querySelectorAll('.nm-st')].map(a => a.querySelector('em').textContent.slice(0, 12) + ':' + (a.classList.contains('carried') ? 'carried' : a.classList.contains('asked') ? 'asked' : a.classList.contains('quiet') ? 'quiet' : '-')) }))
  console.log('unit', k, JSON.stringify(st))
  if (k !== 0) await p.screenshot({ path: `${OUT}/svc-unit-${k}.png`, clip: { x: 60, y: 60, width: 1380, height: 640 } })
}
console.log('errs', JSON.stringify(errs)); await b.close()
