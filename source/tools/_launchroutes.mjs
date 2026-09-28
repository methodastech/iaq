import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'] })
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 900 })
for (const r of ['/investors', '/exhibition', '/about/leadership', '/portal', '/codex', '/semicon', '/booth/screen', '/portal/models', '/policies', '/about/commitment']) {
  await p.goto('http://localhost:3000' + r, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await new Promise(x => setTimeout(x, 900))
  const o = await p.evaluate(() => ({ h1: (document.querySelector('h1')?.textContent || '').trim().slice(0, 48), nf: /not here|not found/i.test(document.body.innerText), len: (document.querySelector('main') || document.body).innerText.length }))
  console.log(r.padEnd(20), o.nf ? 'NOT-FOUND' : 'page', '· h1:', o.h1, '· chars:', o.len)
}
await b.close()
