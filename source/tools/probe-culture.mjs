/* Culture page probe (14 Sep). Headless only: the in-app Browser pane belongs to the user.
   usage: node tools/probe-culture.mjs <route> <width> <outdir> [maxShots]
   Shoots the page viewport by viewport (captureBeyondViewport:false), waiting for reveals,
   and prints console errors, horizontal overflow, clamped text and copy rule breaks. */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const [ROUTE = '/careers/culture', W = '1440', OUT = '/tmp/cu', MAX = '40'] = process.argv.slice(2)
const width = parseInt(W, 10), phone = width < 700
fs.mkdirSync(OUT, { recursive: true })
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width, height: phone ? 844 : 900, isMobile: phone, hasTouch: phone, deviceScaleFactor: 1 })
const errs = []
p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text().slice(0, 240)) })
p.on('pageerror', e => errs.push('pageerror: ' + e.message.slice(0, 240)))
p.on('requestfailed', r => errs.push('reqfail: ' + r.url().slice(0, 160)))
await p.goto('http://localhost:5177' + ROUTE, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise(r => setTimeout(r, 1800))
const H = await p.evaluate(() => document.documentElement.scrollHeight)
const vh = await p.evaluate(() => window.innerHeight)
let i = 0
for (let y = 0; y < H && i < parseInt(MAX, 10); y += Math.round(vh * 0.9), i++) {
  await p.evaluate(yy => { if (window.__lenis) window.__lenis.scrollTo(yy, { immediate: true, force: true }); else window.scrollTo(0, yy) }, y)
  await new Promise(r => setTimeout(r, 1100))
  await p.screenshot({ path: `${OUT}/${String(i).padStart(2, '0')}.png`, captureBeyondViewport: false })
}
const report = await p.evaluate(() => {
  const root = document.querySelector('.cu-page') || document.body
  const dw = document.documentElement.clientWidth
  const over = [...document.querySelectorAll('body *')].filter(el => { const r = el.getBoundingClientRect(); return r.width && (r.right > dw + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed' && !el.closest('.cu-strip, .cu-rail, [aria-hidden="true"], .nav-drawer, .us-ov') })
    .slice(0, 12).map(el => el.className + ' ' + Math.round(el.getBoundingClientRect().right))
  const clamped = [...root.querySelectorAll('h1,h2,h3,p,b,span,a,li')].filter(el => el.children.length === 0 && el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== 'visible').slice(0, 12).map(el => el.className + ': ' + el.textContent.slice(0, 40))
  const text = root.innerText
  const dash = (text.match(/.{0,30}(—|–| - ).{0,30}/g) || []).slice(0, 12)
  const bang = (text.match(/.{0,30}!.{0,10}/g) || []).slice(0, 12)
  const hidden = [...root.querySelectorAll('.cu-rv')].filter(el => !el.classList.contains('cu-in')).length
  return { scrollW: document.documentElement.scrollWidth, clientW: dw, over, clamped, dash, bang, hiddenReveals: hidden, sections: [...root.querySelectorAll('section, header')].map(s => s.className.split(' ')[0] + ':' + Math.round(s.getBoundingClientRect().height)) }
})
console.log(JSON.stringify({ route: ROUTE, width, shots: i, ...report, errs: [...new Set(errs)].slice(0, 20) }, null, 1))
await b.close()
