import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)))
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1500))
const s = await p.$('.sysm'); await s.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 2500))
console.log(JSON.stringify(await p.evaluate(() => { const s = document.querySelector('.sysm'); const kids = [...s.querySelectorAll('[class]')].slice(0, 400); const faded = kids.filter(e => +getComputedStyle(e).opacity < .5).length; const cls = s.className; const chart = s.querySelector('svg, canvas, .sysm-grid, .sysm-chart'); return { cls, faded, total: kids.length, chart: chart ? chart.tagName + '.' + (chart.className.baseVal ?? chart.className) : null, h: Math.round(s.getBoundingClientRect().height), text: s.innerText.replace(/\s+/g, ' ').slice(0, 300) } })), 'errors', errs.length)
await s.screenshot({ path: OUT + '/sysm-inview.png' })
await b.close()
