import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
await p.goto('http://localhost:5177/', { waitUntil: 'domcontentloaded' })
const t0 = Date.now(), log = []
for (let i = 0; i < 70; i++) { const s = await p.evaluate(() => { const l = document.getElementById('loader'); return l ? l.className + '|' + document.getElementById('ldPct').textContent + '|' + getComputedStyle(l).display + '|' + document.querySelectorAll('.ld-tag.on').length : 'gone' }).catch(() => 'err'); log.push([Date.now() - t0, s]); if (/none/.test(s)) break; await new Promise(r => setTimeout(r, 150)) }
console.log(JSON.stringify({ log: log.filter((x, i, a) => i === 0 || x[1].split('|')[0] !== a[i - 1][1].split('|')[0] || i === a.length - 1), errs }))
await b.close()
