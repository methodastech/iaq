/* 14 Sep: careers role marks. Mapping, legibility crops at 2x, hover and focus motion, the
   scroll-in pass, reduced motion, console errors. node tools/probe-roleicons.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const B = 'http://localhost:5177', OUT = process.argv[2] || '.'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const errors = []
async function open(vp, reduce = false) {
  const p = await browser.newPage(); await p.setViewport(vp)
  p.on('pageerror', e => errors.push(`${vp.width} pageerror ${e.message}`))
  p.on('console', m => { if (m.type() === 'error') errors.push(`${vp.width} console ${m.text()}`) })
  if (reduce) await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await p.goto(B + '/careers', { waitUntil: 'networkidle2', timeout: 60000 }); await sleep(1200); return p
}
/* put a row just under the sticky console, instant, and report where the list sits */
async function toRow(p, sel) {
  return p.evaluate(async sel => {
    const wait = ms => new Promise(r => setTimeout(r, ms))
    const go = y => { if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true }); window.scrollTo(0, y) }
    const el = document.querySelector(sel), c = document.querySelector('.console')
    for (let i = 0; i < 3; i++) { /* the console is only stuck once the page has scrolled, so measure, move, measure again */
      const off = (c && getComputedStyle(c).position === 'sticky' ? c.getBoundingClientRect().bottom : 0) + 14
      go(Math.max(0, el.getBoundingClientRect().top + scrollY - (i ? off : 400))); await wait(250)
    }
    return { scrollY: Math.round(scrollY), consoleBottom: Math.round(c.getBoundingClientRect().bottom), rowTop: Math.round(el.getBoundingClientRect().top) }
  }, sel)
}
const rowsInfo = p => p.evaluate(() => [...document.querySelectorAll('#joblist .job')].map(j => {
  const svg = j.querySelector('.dic svg'), r = svg.getBoundingClientRect(), h = j.querySelector('.job-head').getBoundingClientRect(), t = j.querySelector('h3').getBoundingClientRect()
  return { ref: j.dataset.ref, title: j.querySelector('h3').textContent, disc: svg.dataset.disc, size: `${Math.round(r.width)}x${Math.round(r.height)}`, iconMidOff: Math.round((r.top + r.height / 2) - (h.top + h.height / 2)), titleMidOff: Math.round((t.top + t.height / 2) - (h.top + h.height / 2)), structColor: getComputedStyle(svg).color, accent: svg.querySelector('.ri-a') ? getComputedStyle(svg.querySelector('.ri-a')).stroke : null }
}))
const anims = (p, sel) => p.evaluate(sel => [...document.querySelectorAll(sel + ' .ri-p')].map(e => ({ cls: e.getAttribute('class'), cssName: getComputedStyle(e).animationName, running: e.getAnimations().map(a => `${a.animationName}:${a.playState}:${Math.round(a.currentTime)}ms:iter=${a.effect.getTiming().iterations}`).join(',') })), sel)

/* ---------- desktop 1440 ---------- */
let p = await open({ width: 1440, height: 900, deviceScaleFactor: 2 })
const info = await rowsInfo(p)
console.log('ROWS'); info.forEach(r => console.log(' ', r.ref.padEnd(11), r.title.padEnd(28), r.disc.padEnd(13), r.size, 'iconMidOff', r.iconMidOff, 'titleMidOff', r.titleMidOff))
console.log('colours', info[0].structColor, info[0].accent)
console.log('scroll', JSON.stringify(await toRow(p, '#joblist')))
await sleep(200)
console.log('desktop scroll-in pass', JSON.stringify(await p.evaluate(() => ({ riIn: [...document.querySelectorAll('.job.ri-in')].map(j => j.dataset.ref), running: document.getAnimations().filter(a => /^ri/.test(a.animationName || '')).map(a => a.animationName + ':' + a.playState).join(',') }))))
await sleep(3800) /* let the scroll-in pass finish */
const vis = await p.evaluate(() => ({ riIn: document.querySelectorAll('.job.ri-in').length, running: document.getAnimations().filter(a => /^ri/.test(a.animationName || '')).length }))
console.log('after scroll-in pass settles', JSON.stringify(vis))
await p.screenshot({ path: `${OUT}/d1440-list-a.png`, captureBeyondViewport: false })
const clipFor = async (sel) => p.evaluate(sel => { const els = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); const cb = document.querySelector('.console').getBoundingClientRect().bottom; return r.top >= cb && r.bottom <= innerHeight }); const a = els[0].getBoundingClientRect(), b = els[els.length - 1].getBoundingClientRect(); return { x: a.left - 8, y: a.top - 4 + scrollY, width: 520, height: b.bottom - a.top + 8 } }, sel)
await p.screenshot({ path: `${OUT}/d1440-icons-a-2x.png`, clip: await clipFor('#joblist .job-head'), captureBeyondViewport: false })
await toRow(p, '#job-iaq-prj-01'); await sleep(3800)
await p.screenshot({ path: `${OUT}/d1440-list-b.png`, captureBeyondViewport: false })
await p.screenshot({ path: `${OUT}/d1440-icons-b-2x.png`, clip: await clipFor('#joblist .job-head'), captureBeyondViewport: false })

/* hover: the first mechanical row, then the gantt */
await toRow(p, '#job-iaq-eng-01'); await sleep(3600)
console.log('before hover', JSON.stringify(await anims(p, '#job-iaq-eng-01')))
await p.hover('#job-iaq-eng-01 .job-head'); await sleep(700)
console.log('HOVER mechanical', JSON.stringify(await anims(p, '#job-iaq-eng-01')))
const tr = await p.evaluate(() => { const g = document.querySelector('#job-iaq-eng-01 .ri-spin'); return getComputedStyle(g).transform })
console.log('  fan transform at 700ms', tr)
const c1 = await p.evaluate(() => { const r = document.querySelector('#job-iaq-eng-01 .dic').getBoundingClientRect(); return { x: r.left - 4, y: r.top - 4 + scrollY, width: r.width + 8, height: r.height + 8 } })
await p.screenshot({ path: `${OUT}/hover-fan-700ms-2x.png`, clip: c1, captureBeyondViewport: false })
for (const id of ['eng-03', 'eng-05', 'eng-07', 'eng-08']) {
  await p.hover(`#job-iaq-${id} .job-head`); await sleep(900)
  console.log('HOVER', id, JSON.stringify(await anims(p, `#job-iaq-${id}`)))
}
await p.mouse.move(5, 5); await sleep(300)
console.log('after hover out eng-08', JSON.stringify(await anims(p, '#job-iaq-eng-08')))

/* keyboard focus */
await p.evaluate(() => document.querySelector('#job-iaq-eng-01 .job-head').focus()); await p.keyboard.press('Tab'); await sleep(800)
console.log('FOCUS', JSON.stringify(await p.evaluate(() => { const a = document.activeElement; return { id: a.closest('.job')?.id, focusVisible: a.matches(':focus-visible') } })), JSON.stringify(await anims(p, '#job-iaq-eng-02')))

/* every remaining mark on hover, and a mid-motion crop of each */
await toRow(p, '#job-iaq-prj-01'); await sleep(3600)
for (const id of ['prj-01', 'prj-03', 'prj-04', 'prj-05', 'fin-01', 'fin-02', 'com-01']) {
  await toRow(p, `#job-iaq-${id}`); await p.hover(`#job-iaq-${id} .job-head`); await sleep(650)
  const a = await anims(p, `#job-iaq-${id}`)
  console.log('HOVER', id, JSON.stringify(a.map(x => x.running)))
  const c = await p.evaluate(id => { const r = document.querySelector(`#job-iaq-${id} .dic`).getBoundingClientRect(); return { x: r.left - 4, y: r.top - 4 + scrollY, width: r.width + 8, height: r.height + 8 } }, id)
  await p.screenshot({ path: `${OUT}/hover-${id}-650ms-2x.png`, clip: c, captureBeyondViewport: false })
}
await p.close()

/* ---------- phone 390 ---------- */
p = await open({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
const pinfo = await rowsInfo(p)
console.log('PHONE sizes', [...new Set(pinfo.map(r => r.size))].join(','), 'iconMidOff', [...new Set(pinfo.map(r => r.iconMidOff))].join(','))
console.log('PHONE overflow', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth))
await toRow(p, '#joblist'); await sleep(250)
console.log('PHONE scroll-in', JSON.stringify(await p.evaluate(() => ({ riIn: [...document.querySelectorAll('.job.ri-in')].map(j => j.dataset.ref + '@' + getComputedStyle(j).getPropertyValue('--ri-d')), running: document.getAnimations().filter(a => /^ri/.test(a.animationName || '')).length }))))
await sleep(3800)
await p.screenshot({ path: `${OUT}/p390-list-a.png`, captureBeyondViewport: false })
await p.screenshot({ path: `${OUT}/p390-icons-a-2x.png`, clip: await p.evaluate(() => { const els = [...document.querySelectorAll('#joblist .job-head')].filter(e => { const r = e.getBoundingClientRect(); const cb = document.querySelector('.console').getBoundingClientRect().bottom; return r.top >= cb && r.bottom <= innerHeight }); const a = els[0].getBoundingClientRect(), b = els[els.length - 1].getBoundingClientRect(); return { x: 0, y: a.top - 4 + scrollY, width: 390, height: b.bottom - a.top + 8 } }), captureBeyondViewport: false })
await toRow(p, '#job-iaq-prj-02'); await sleep(3800)
await p.screenshot({ path: `${OUT}/p390-list-b.png`, captureBeyondViewport: false })
await p.close()

/* ---------- reduced motion ---------- */
p = await open({ width: 1440, height: 900 }, true)
/* resting drawings of all sixteen at 2x, from the reduced motion page where nothing plays */
for (const r of info) {
  const id = '#job-' + r.ref.toLowerCase(); await toRow(p, id)
  const c = await p.evaluate(id => { const b = document.querySelector(id + ' .dic').getBoundingClientRect(); return { x: b.left - 3, y: b.top - 3 + scrollY, width: b.width + 6, height: b.height + 6 } }, id)
  await p.screenshot({ path: `${OUT}/rest-${r.ref}.png`, clip: c, captureBeyondViewport: false })
}
await toRow(p, '#joblist'); await p.hover('#job-iaq-eng-01 .job-head'); await sleep(800)
console.log('REDUCED', JSON.stringify(await p.evaluate(() => ({ riIn: document.querySelectorAll('.job.ri-in').length, riAnims: document.getAnimations().filter(a => /^ri/.test(a.animationName || '')).length, fanName: getComputedStyle(document.querySelector('#job-iaq-eng-01 .ri-spin')).animationName }))))
await p.close()

console.log('ERRORS', errors.length ? errors.join('\n') : 'none')
await browser.close()
