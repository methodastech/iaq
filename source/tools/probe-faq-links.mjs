import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
for (const path of ['/about', '/about/global-presence', '/contact', '/services/epc-construction', '/services/tool-installation', '/services/energy-management', '/services/maintenance']) {
  await p.goto('http://localhost:5177' + path, { waitUntil: 'networkidle0', timeout: 60000 })
  console.log(path, JSON.stringify(await p.evaluate(() => ({ h1: document.querySelector('h1')?.textContent.trim().slice(0, 50), nf: /not found|404|no page/i.test(document.body.innerText.slice(0, 600)) }))))
}
await p.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle0', timeout: 60000 })
const gate = await p.$('.cx-gate-card, .pt-login'); if (gate) { for (const x of await p.$$('button')) { const t = await x.evaluate(e => e.textContent); if (/Emergency/i.test(t)) { await x.click(); break } } await new Promise(r => setTimeout(r, 2500)) }
console.log('codex', JSON.stringify(await p.evaluate(() => ({ groups: document.querySelectorAll('.cx-p1 .faq-g').length, items: document.querySelectorAll('.cx-p1 .faq-i').length, brackets: [...document.querySelectorAll('.cx-p1 .faq-q span')].filter(e => /\(/.test(e.textContent)).length, cta: !!document.querySelector('.cx-p1 .faq-ix-cta') }))))
await b.close()
