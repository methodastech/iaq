import { createRequire } from 'module'
const require = createRequire('/Users/zieel/Bazil Claude 3/Websites/iaq website/package.json')
const puppeteer = require('puppeteer-core')
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const u of process.argv.slice(2)) {
  const p = await b.newPage(); const errs = []
  p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  p.on('response', r => { if (r.status() >= 400) errs.push('http ' + r.status() + ' ' + r.url()) })
  await p.setViewport({ width: 1440, height: 900 })
  await p.goto('http://localhost:5177' + u, { waitUntil: 'networkidle0', timeout: 60000 })
  const info = await p.evaluate(() => ({ newsLinks: document.querySelectorAll('a[href^="/news/"]').length, h1: document.querySelector('h1')?.textContent?.slice(0, 60) }))
  console.log(u, JSON.stringify(info), 'errors:', errs.length ? errs : 'none')
  await p.close()
}
await b.close()
