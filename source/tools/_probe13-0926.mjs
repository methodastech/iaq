import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu'] })
const out = {}
for (const r of ['/', '/fab', '/about', '/portal/codex']) {
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
  const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 120))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)) })
  if (r.startsWith('/portal')) { await p.goto('http://localhost:5177/portal', { waitUntil: 'load' }); await p.evaluate(() => localStorage.setItem('iaq.cms.session.v1', '1')) }
  await p.goto('http://localhost:5177' + r, { waitUntil: 'networkidle2', timeout: 90000 })
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 900) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)) } })
  await new Promise(r => setTimeout(r, 1500)); out[r] = errs; await p.close()
}
console.log(JSON.stringify(out)); await b.close()
