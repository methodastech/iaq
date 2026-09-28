import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
const urls = []; page.on('framenavigated', f => { if (f === page.mainFrame()) urls.push(f.url()) })
page.on('request', r => { if (r.isNavigationRequest()) urls.push('REQ ' + r.url()) })
await page.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 2000))
console.log(urls.join('\n')); console.log(await page.evaluate(() => ({ href: location.href, s: localStorage.getItem('iaq.cms.session.v1') })))
const html = await (await fetch('http://localhost:5177/src/main.jsx')).text(); const i = html.indexOf('admin'); console.log('served main has admin grant:', i > 0, html.slice(Math.max(0, i - 200), i + 120).replace(/\s+/g, ' '))
await browser.close()
