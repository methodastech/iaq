import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 1000 })
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
await p.goto('http://localhost:5177/', { waitUntil: 'domcontentloaded', timeout: 90000 })
await new Promise(r => setTimeout(r, 9000))
console.log(JSON.stringify({ url: p.url(), n: await p.$$eval('.lp-field', e => e.length), secs: await p.$$eval('section', e => e.map(x => x.className).slice(0, 14)), errs: errs.slice(0, 5) }))
await b.close()
