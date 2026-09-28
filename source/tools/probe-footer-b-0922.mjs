/* 22 Sep: footer option B. Loads /?footer=b (and a second page to prove it persists), shots at 1440 and 390, then ?footer=a
   to prove the current footer returns. Usage: node tools/probe-footer-b-0922.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 200000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 150)))
const state = () => p.evaluate(() => ({ b: !!document.querySelector('.fb'), bandBrand: !!document.querySelector('.cb-top'), marks: document.querySelectorAll('.fb-mark, .cb .f-mark').length, fbase: document.querySelectorAll('.f-base').length && getComputedStyle(document.querySelector('.f-base')).display, overflow: document.documentElement.scrollWidth - innerWidth }))
const shoot = async name => { const y = await p.evaluate(() => document.querySelector('.cb').getBoundingClientRect().top + scrollY); await p.evaluate(y => window.scrollTo(0, y), y); await wait(900); const H = await p.evaluate(() => document.documentElement.scrollHeight); await p.evaluate(H => window.scrollTo(0, H), H); await wait(1400); await p.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 80 }) }
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/?footer=b', { waitUntil: 'domcontentloaded' }); await wait(3000)
console.log('home b', JSON.stringify(await state())); await shoot('fb-1440')
await p.goto('http://localhost:5177/about', { waitUntil: 'domcontentloaded' }); await wait(3000)
console.log('about (persists)', JSON.stringify(await state()))
await p.setViewport({ width: 390, height: 844 }); await p.goto('http://localhost:5177/', { waitUntil: 'domcontentloaded' }); await wait(3000)
console.log('phone b', JSON.stringify(await state())); await shoot('fb-390')
await p.setViewport({ width: 1440, height: 900 }); await p.goto('http://localhost:5177/?footer=a', { waitUntil: 'domcontentloaded' }); await wait(3000)
console.log('home a', JSON.stringify(await state()))
console.log('errs', JSON.stringify(errs))
await b.close()
