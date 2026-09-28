import puppeteer from 'puppeteer-core'
const B = process.argv[2] || 'http://localhost:5177'
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
const p = await browser.newPage(); await p.setViewport({ width: 1280, height: 800 })
await p.goto(B + '/', { waitUntil: 'networkidle2', timeout: 60000 }); await new Promise(r => setTimeout(r, 2000))
const before = await p.evaluate(() => Math.round(scrollY))
await p.evaluate(() => document.querySelector('.fab-skip').click()); await new Promise(r => setTimeout(r, 2500))
const after = await p.evaluate(() => ({ y: Math.round(scrollY), indTop: Math.round(document.querySelector('#industries').getBoundingClientRect().top) }))
console.log('fab skip: before', before, '→ after', JSON.stringify(after), Math.abs(after.indTop - 70) < 60 ? 'LANDED' : 'not landed')
await browser.close()
