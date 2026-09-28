import fs from 'fs'
import puppeteer from 'puppeteer-core'
const dir = process.argv[2], out = process.argv[3]
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg')).sort()
const row = s => files.map(f => `<div class="c"><div style="width:${s}px">${fs.readFileSync(dir + '/' + f, 'utf8')}</div><i>${f.replace('.svg','')}</i></div>`).join('')
const html = `<!doctype html><meta charset=utf-8><style>
body{margin:0;background:#fff;font:500 11px/1.4 -apple-system,sans-serif;color:#8a94a6;padding:20px}
h4{font:600 12px/1 -apple-system;color:#0B1220;margin:22px 0 10px;letter-spacing:.02em}
.r{display:flex;gap:14px;align-items:flex-end;flex-wrap:nowrap}
.c{text-align:center}.c svg{width:100%;height:auto;display:block}
i{display:block;font-style:normal;margin-top:4px;font-size:9px}
.dk{background:#0B1220;padding:14px}.dk i{color:#7b8496}
</style>
<h4>132 px, review size</h4><div class=r>${row(132)}</div>
<h4>88 px</h4><div class=r>${row(88)}</div>
<h4>56 px, the size on the hero row</h4><div class=r>${row(56)}</div>
<h4>40 px, phone</h4><div class=r>${row(40)}</div>`
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 1180, height: 900, deviceScaleFactor: 2 })
await p.setContent(html, { waitUntil: 'load' })
await p.screenshot({ path: out, fullPage: true })
await b.close()
console.log('sheet', out)
