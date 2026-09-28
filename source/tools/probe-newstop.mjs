import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) }); p.on('pageerror', e => errs.push(String(e)))
await p.goto('http://localhost:5177/news', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 2500))
await p.screenshot({ path: `${OUT}/news-top.png`, captureBeyondViewport: false })
const y = await p.evaluate(() => document.querySelector('.nf-feat').getBoundingClientRect().top + scrollY - 60)
await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 1500))
await p.screenshot({ path: `${OUT}/news-feat.png`, captureBeyondViewport: false })
const info = await p.evaluate(() => ({ wire: !!document.querySelector('.nb-wire'), tags: document.querySelectorAll('.nf-tag .nm').length, tile: (r => [Math.round(r.width), Math.round(r.height)])(document.querySelector('.nf-mc').getBoundingClientRect()), cardIcons: document.querySelectorAll('.nf-card .nf-cat .nm').length }))
console.log(JSON.stringify({ info, errs }))
await b.close()
