import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/about/commitment', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1500))
await p.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true)); await new Promise(r => setTimeout(r, 600))
console.log(await p.evaluate(() => { const b = document.querySelector('.cmt-cert b'); const c = getComputedStyle(b); const rules = []; for (const s of document.styleSheets) { try { for (const r of s.cssRules) if (r.selectorText && b.matches(r.selectorText) && /color|opacity|font-size|visibility|display/.test(r.style.cssText)) rules.push(r.selectorText + '{' + r.style.cssText.slice(0, 90) + '}') } catch (e) {} } return JSON.stringify({ color: c.color, opacity: c.opacity, fs: c.fontSize, vis: c.visibility, text: b.textContent, rules }) }))
await b.close()
