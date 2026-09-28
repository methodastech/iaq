import fs from 'fs'
import puppeteer from 'puppeteer-core'
const dir = process.argv[2], out = process.argv[3], want = process.argv.slice(4)
const cell = f => `<div class="c"><div style="width:260px">${fs.readFileSync(dir + '/tm-' + f + '.svg', 'utf8')}</div><i>${f}</i></div>`
const html = `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#fff;padding:16px;font:600 12px -apple-system,sans-serif;color:#8a94a6}
.r{display:flex;gap:10px}.c svg{width:100%;height:auto;display:block}i{display:block;text-align:center;margin-top:4px}</style>
<div class=r>${want.map(cell).join('')}</div>`
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1120, height: 340, deviceScaleFactor: 2 })
await p.setContent(html, { waitUntil: 'load' }); await p.screenshot({ path: out, fullPage: true }); await b.close(); console.log(out)
