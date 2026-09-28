import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const out = []
for (const r of ['/checklist.html', '/client-files.html']) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 140)))
  await p.goto('http://localhost:50519' + r, { waitUntil: 'networkidle2', timeout: 60000 }); await new Promise(x => setTimeout(x, 1200))
  out.push({ r, errs, info: await p.evaluate(() => ({ items: document.querySelectorAll('.item').length, undatedOrUntyped: [...document.querySelectorAll('.item')].filter(i => !i.querySelector('.stamp') || !i.querySelector('.tag')).length, files: document.querySelectorAll('[data-k], .card, .f').length })) })
  await p.close()
}
console.log(JSON.stringify(out))
await b.close()
