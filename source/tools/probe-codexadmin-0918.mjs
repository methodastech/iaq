import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage(); await page.setViewport({ width: 1440, height: 900 })
const logs = []; page.on('console', m => logs.push(m.type() + ': ' + m.text().slice(0, 140))); page.on('pageerror', e => logs.push('PAGEERROR ' + String(e).slice(0, 200)))
await page.goto('http://localhost:5177/', { waitUntil: 'networkidle2' }); await page.evaluate(() => localStorage.removeItem('iaq.cms.session.v1'))
await page.goto('http://localhost:5177/codex?admin', { waitUntil: 'networkidle2' }); await new Promise(x => setTimeout(x, 2500))
console.log(JSON.stringify(await page.evaluate(() => ({ url: location.pathname + location.search, session: localStorage.getItem('iaq.cms.session.v1'), parts: document.querySelectorAll('.cx-part').length, gate: !!document.querySelector('.cx-gate') }))))
console.log(logs.filter(l => !/vite|DevTools/.test(l)).slice(0, 6).join('\n'))
await browser.close()
