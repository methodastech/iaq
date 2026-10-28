/* the single-file exhibition portal opened from disk: a picture counts only if it actually drew (naturalWidth > 0) */
import puppeteer from 'puppeteer-core'
const [file] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--hide-scrollbars', '--window-size=1280,1000'] })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)))
await p.goto('file://' + encodeURI(file), { waitUntil: 'load', timeout: 240000 })
await new Promise(r => setTimeout(r, 4000))
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 250)) } scrollTo(0, 0) })
await new Promise(r => setTimeout(r, 6000))
console.log(JSON.stringify(await p.evaluate(() => { const im = [...document.images]; return { imgs: im.length, drawn: im.filter(i => i.naturalWidth > 0).length, emptySrc: im.filter(i => !i.getAttribute('src')).length, stand: [...document.querySelectorAll('.facts div')].map(d => d.textContent.trim()).pop(), lineupButtons: document.querySelectorAll('#lineup .shot.lu').length } })), JSON.stringify(errs))
await b.close()
