import puppeteer from 'puppeteer-core'
const BASE = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 900 })
const bad = []; p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()) })
for (const r of ['/checklist.html', '/qa.html']) { await p.goto(BASE + r, { waitUntil: 'networkidle0', timeout: 60000 }); await new Promise(x => setTimeout(x, 500)) }
const q = await p.evaluate(() => { const rows = [...document.querySelectorAll('tr')].filter(tr => /\bP01\b/.test(tr.innerText)); return rows.map(tr => tr.innerText.replace(/\s+/g, ' ').slice(0, 260)) })
console.log(JSON.stringify({ bad, p01rows: q }, null, 1)); await b.close()
