import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [r, re] of [['/investors', /Sample: how a report[^<]{0,40}|Segment review[^<]{0,40}|Enter the passcode[^<]{0,40}/], ['/portal/downloads', /Scope of services[^<]{0,90}/], ['/portal/signature', /ISO 9001[^<]{0,60}/], ['/portal/codex', /PDF of every section[^<]{0,60}|member portal[^<]{0,60}/]]) {
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
  await p.evaluateOnNewDocument(() => { try { sessionStorage.setItem('iaq-ir-gate', '1'); localStorage.setItem('iaq.cms.session.v1', '1') } catch (e) {} })
  await p.goto('http://localhost:5177' + r, { waitUntil: 'networkidle2', timeout: 45000 }); await new Promise(x => setTimeout(x, 1500))
  const t = await p.evaluate(() => document.body.innerText)
  console.log(r.padEnd(20), 'chars', t.length, '|', (t.match(re) || ['(phrase not visible)'])[0].replace(/\s+/g, ' '))
  await p.close()
}
await b.close()
