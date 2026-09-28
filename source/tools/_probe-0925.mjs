import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 950 })
const errs=[]; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type()==='error') errs.push(m.text().slice(0,200)) })
await p.goto('http://localhost:5177/services', { waitUntil: 'domcontentloaded', timeout: 60000 })
await new Promise(r => setTimeout(r, 6000))
console.log(JSON.stringify({ url: p.url(), works: await p.$$eval('.sm-works', e => e.length), sysm: await p.$$eval('.sysm', e => e.length), fr: await p.$$eval('.fr', e=>e.map(x=>x.className)), title: await p.title(), errs }))
await b.close()
