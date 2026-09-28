import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1000))
await p.emulateMediaType('print')
console.log(JSON.stringify(await p.evaluate(() => { const s = document.querySelector('.faq-embed .faq-gt small'); const cs = getComputedStyle(s); const r = s.getBoundingClientRect(); const rules = []; for (const sh of document.styleSheets) { try { for (const ru of sh.cssRules) { if (ru.media && /print/.test(ru.media.mediaText)) for (const rr of ru.cssRules) { if (rr.selectorText && s.matches(rr.selectorText)) rules.push(rr.selectorText + ' -> ' + rr.style.cssText.slice(0, 80)) } } } catch (e) {} } return { display: cs.display, fontSize: cs.fontSize, color: cs.color, w: r.width, h: r.height, rules } })))
await b.close()
