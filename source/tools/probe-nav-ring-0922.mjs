/* 22 Sep: (1) every nav wing, opened by hover: screenshot, and any element inside it that still paints a box (a
   background or an inset border) apart from the lead photograph; (2) the ring: size, and whether each mark's moving
   part really moves (its matrix sampled twice). Usage: node tools/probe-nav-ring-0922.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--autoplay-policy=no-user-gesture-required'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
const p = await b.newPage(); const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/', { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(6500)
const hubs = await p.$$('.nav-has')
for (let k = 0; k < hubs.length; k++) {
  await hubs[k].hover(); await wait(1300)
  const r = await p.evaluate(k => {
    const has = document.querySelectorAll('.nav-has')[k], m = has.querySelector('.nav-mega'); if (!m) return null
    const boxes = []
    m.querySelectorAll('.nm-cols *').forEach(el => { const c = getComputedStyle(el); const bg = c.backgroundColor, sh = c.boxShadow
      if ((bg !== 'rgba(0, 0, 0, 0)' && !el.closest('.nm-thumb')) || (sh !== 'none' && sh.includes('inset'))) boxes.push((el.className && el.className.baseVal === undefined ? el.tagName + '.' + el.className : el.tagName) + ' bg ' + bg) })
    const cs = getComputedStyle(m), rc = m.getBoundingClientRect()
    return { label: has.querySelector('a,button').textContent.trim().slice(0, 14), open: cs.visibility + ' o' + cs.opacity, clip: cs.clipPath.slice(0, 40), rect: [Math.round(rc.left), Math.round(rc.right), Math.round(rc.width)], rows: m.querySelectorAll('.nm-rows>a,.nm-seg,.nm-st').length, boxes: [...new Set(boxes)].slice(0, 8) }
  }, k)
  console.log('wing', k, JSON.stringify(r))
  await p.screenshot({ path: `${OUT}/wing-${k}.png`, clip: { x: 0, y: 0, width: 1440, height: 640 } })
}
await p.mouse.move(700, 850); await wait(600)
await p.evaluate(() => { const s = document.querySelector('.lp-orbit'); window.scrollTo(0, s.getBoundingClientRect().top + scrollY - 110) }); await wait(3000)
const mv = async () => p.evaluate(() => [...document.querySelectorAll('#lpBubbles .lpn')].map(n => { const g = n.querySelector('.mk-mv'); return g ? getComputedStyle(g).transform : 'none' }))
const a = await mv(); await wait(700); const c = await mv()
const ring = await p.evaluate(() => { const o = document.querySelector('.lp-orbit').getBoundingClientRect(), t = document.querySelector('.lp-trk').getBoundingClientRect(), v = document.querySelector('.lp-vis').getBoundingClientRect()
  return { orbit: Math.round(o.width), ring: Math.round(t.width), vis: Math.round(v.width) + 'x' + Math.round(v.height), run: document.querySelector('.lp-field').className, anims: [...document.querySelectorAll('#lpBubbles .lpn .mk-mv')].map(g => getComputedStyle(g).animationName) } })
console.log('ring', JSON.stringify(ring)); console.log('moving parts changed between samples:', JSON.stringify(a.map((x, i) => x !== c[i])))
const f = await p.$('.lp-field'); await f.screenshot({ path: `${OUT}/ring-after.png` })
console.log('errs', JSON.stringify(errs))
await b.close()
