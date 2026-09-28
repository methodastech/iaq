import puppeteer from 'puppeteer-core'
const B = process.argv[2] || 'http://localhost:5179'
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const route of ['/', '/about', '/services', '/home2', '/fab', '/projects/999']) {
  const p = await browser.newPage(); await p.setViewport({ width: 1280, height: 800 })
  await p.goto(B + route, { waitUntil: 'networkidle2', timeout: 60000 }); await new Promise(r => setTimeout(r, 1500))
  const r = await p.evaluate(() => ({ title: document.title, bar: !!document.querySelector('.topbar, #bmws-bar, .bmws-bar'), ribbon: !!document.querySelector('.bm-footrib'), proto: /Prototype · Brand Method|Brand Method/.test(document.body.innerText), h1: document.querySelector('h1')?.textContent.trim().slice(0, 60), notFound: /Page not found|That page is not here/.test(document.body.innerText), skip: !!document.querySelector('.skip-link'), icon: document.querySelector('link[rel="icon"]')?.getAttribute('href') }))
  console.log(route.padEnd(16), JSON.stringify(r)); await p.close()
}
await browser.close()
