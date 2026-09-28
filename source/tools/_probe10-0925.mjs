import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
await p.goto('http://localhost:5177/portal', { waitUntil: 'load' }); await p.evaluate(() => localStorage.setItem('iaq.cms.session.v1', '1'))
await p.goto('http://localhost:5177/portal/direction', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 6000))
const fr = await p.$('iframe.dir-tab')
const info = { iframe: !!fr }
if (fr) { const f = await fr.contentFrame(); info.inner = await f.evaluate(() => ({ title: document.title, embed: document.documentElement.classList.contains('embed'), bar: getComputedStyle(document.querySelector('.bmws')).display, sections: document.querySelectorAll('section[id]').length, side: getComputedStyle(document.querySelector('.dsb')).display, w: innerWidth })) }
await p.screenshot({ path: process.argv[2] })
await p.goto('http://localhost:5177/portal/direction?source', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 3000))
info.source = { iframe: !!(await p.$('iframe.dir-tab')), lib: await p.$$eval('#icon-library .il-g', e => e.length) }
console.log(JSON.stringify({ info, errs }))
await b.close()
