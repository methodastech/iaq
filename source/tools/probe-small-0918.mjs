import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1024, height: 800 })
await p.goto('http://localhost:5177/?admin', { waitUntil: 'networkidle0' })
await p.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle0' })
console.log(await p.evaluate(() => [...document.querySelectorAll('.sm3 small')].filter(e => e.textContent.trim() === 'Commission').map(e => { let path = []; for (let x = e; x && !x.matches('.sm3'); x = x.parentElement) path.push(x.tagName + '.' + x.className); const s = getComputedStyle(e); return path.join(' < ') + ' | ' + s.overflow + ' ' + s.textOverflow + ' w' + e.clientWidth + ' sw' + e.scrollWidth }).join('\n')))
await b.close()
