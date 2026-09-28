import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1000))
await p.emulateMediaType('print')
console.log(JSON.stringify(await p.evaluate(() => { const f = document.querySelector('.faq-embed'); if (!f) return 'no faq'; const out = []; for (let e = f; e && e !== document.body; e = e.parentElement) { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || s.height === '0px' || s.overflow === 'hidden' && e.clientHeight < 10) out.push(e.tagName + '.' + e.className.toString().slice(0, 40) + ' display=' + s.display + ' h=' + e.clientHeight) } const lede = [...document.querySelectorAll('.cx-p')].find(x => /As answered/.test(x.textContent)); return { hidden: out, faqH: f.getBoundingClientRect().height, ledeDisplay: lede ? getComputedStyle(lede).display : 'none-found', ledeH: lede ? lede.getBoundingClientRect().height : 0, q1: !!document.querySelector('.faq-q') } })))
await b.close()
