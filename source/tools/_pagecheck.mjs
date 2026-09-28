import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
for (const u of ['/checklist.html', '/design.html#mo-loader', '/design.html#el-line']) {
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); const errs = []
  p.on('pageerror', e => errs.push(String(e.message).slice(0, 140))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)) })
  await p.goto('http://localhost:57375' + u, { waitUntil: 'networkidle2', timeout: 60000 }); await new Promise(r => setTimeout(r, 1500))
  const info = await p.evaluate(() => ({ b26: [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /Design tab line rules|Site line pass under the same rules|three live variations/.test(e.textContent)).length, mo: !!document.getElementById('mo-loader'), frames: document.querySelectorAll('#mo-loader iframe').length }))
  console.log(u, JSON.stringify(info), 'errors', JSON.stringify(errs.slice(0, 3))); await p.close()
}
await b.close()
