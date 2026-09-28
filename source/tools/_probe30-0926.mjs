import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] })
setTimeout(() => { console.log('TIMEOUT'); process.exit(1) }, 60000)
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const logs = []; p.on('pageerror', e => logs.push('PE ' + e.message.slice(0, 300))); p.on('console', m => { if (/error|warn/.test(m.type())) logs.push(m.type() + ' ' + m.text().slice(0, 300)) })
await p.goto('http://localhost:5177/services/epc-construction?launchview', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 5000))
const r = await p.evaluate(() => ({ H: document.documentElement.scrollHeight, secs: document.querySelectorAll('section').length, h1: (document.querySelector('h1') || {}).textContent, root: (document.getElementById('root') || {}).innerHTML?.length }))
console.log(JSON.stringify(r), '\n' + logs.filter(l => !/preload/.test(l)).slice(0, 8).join('\n'))
await b.close(); process.exit(0)
