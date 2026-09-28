import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.setViewport({ width: 1440, height: 900 }); await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
console.log(JSON.stringify(await p.evaluate(() => ({ faqLede: document.querySelector('.sm-faq .pg-lede')?.textContent, ixN: !!document.querySelector('.faq-ix-n'), cta: document.querySelector('.faq-ix-cta')?.textContent, chartLede: document.querySelector('.sysm .pg-lede')?.textContent, cycLede: document.querySelector('.cyc-lede')?.textContent.trim() }))), 'errors', errs.length ? errs : 0)
await b.close()
