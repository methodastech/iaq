import puppeteer from 'puppeteer-core'
const B = process.argv[2] || 'http://localhost:5178'
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await browser.newPage(); await p.setViewport({ width: 1280, height: 800 })
await p.goto(B + '/about', { waitUntil: 'networkidle2', timeout: 60000 }); await new Promise(r => setTimeout(r, 1200))
await p.keyboard.press('Tab'); const a = await p.evaluate(() => ({ focused: document.activeElement.className + ' ' + document.activeElement.textContent.trim().slice(0, 30), visible: getComputedStyle(document.activeElement).top }))
await p.keyboard.press('Enter'); await new Promise(r => setTimeout(r, 600)); const b = await p.evaluate(() => document.activeElement.tagName + ' ' + document.activeElement.textContent.trim().slice(0, 40))
console.log('first Tab →', JSON.stringify(a), '· Enter →', b)
await p.goto(B + '/projects/999', { waitUntil: 'networkidle2', timeout: 60000 }); await new Promise(r => setTimeout(r, 800))
console.log('/projects/999 on 5178 →', await p.evaluate(() => document.querySelector('h1')?.textContent.trim()))
await browser.close()
