/* 29 Sep: open the downloaded Design tab from disk with every network request blocked, and screenshot three places */
import puppeteer from 'puppeteer-core'
const FILE = process.argv[2], OUT = process.argv[3]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const blocked = []; await p.setRequestInterception(true)
p.on('request', r => { const u = r.url(); if (u.startsWith('file:') || u.startsWith('data:') || u.startsWith('about:')) r.continue(); else { blocked.push(u); r.abort() } })
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 120)))
await p.goto('file://' + FILE, { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 2500))
const info = await p.evaluate(async () => { await document.fonts.ready; return { images: document.images.length, broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length, switzer: document.fonts.check('600 16px Switzer'), sections: document.querySelectorAll('section[id]').length } })
for (const [id, name] of [['top', 'top'], ['el-measure', 'logo'], ['ap-signature', 'signature']]) {
  await p.evaluate(i => { document.documentElement.style.scrollBehavior = 'auto'; const e = i === 'top' ? document.body : document.getElementById(i); e.scrollIntoView({ block: 'start' }) }, id)
  await new Promise(r => setTimeout(r, 900)); await p.screenshot({ path: `${OUT}/offline-${name}.jpg`, type: 'jpeg', quality: 70 })
}
console.log(JSON.stringify({ ...info, blockedRequests: blocked.length, blockedSample: blocked.slice(0, 3), pageErrors: errs }))
await b.close()
