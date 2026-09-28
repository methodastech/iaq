// 18 Sep: is the downloaded PDF the WHOLE Codex page? Every heading and every sentence of 25+ characters on the
// live page (panels opened) is looked for in the PDF's text. Interactive-only parts are listed separately.
import puppeteer from 'puppeteer-core'
import { execFileSync } from 'child_process'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5177/portal/codex?admin', { waitUntil: 'networkidle0' })
const items = await p.evaluate(() => {
  document.querySelectorAll('details').forEach(d => { d.open = true })
  const skip = '.cx-jump, .cx-dl, .rx-heads, .rx-cols, .rx-read, .wt-grid, .sm3-sr, [aria-hidden="true"], svg, .cxs-f, .cx-print'
  const out = []
  const tw = document.createTreeWalker(document.querySelector('.cx-page'), NodeFilter.SHOW_ELEMENT)
  while (tw.nextNode()) {
    const e = tw.currentNode
    if (e.closest(skip)) continue
    const own = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.nodeValue).join('').replace(/\s+/g, ' ').trim()
    const isHead = /^H[1-4]$|^SUMMARY$|^TH$/.test(e.tagName)
    const t = isHead ? e.innerText.replace(/\s+/g, ' ').trim() : own
    if (t.length >= (isHead ? 3 : 25)) out.push({ head: isHead, t, sec: (e.closest('section, .cx-head') || {}).id || (e.closest('section, .cx-head') || { className: '?' }).className.split(' ').slice(-1)[0] })
  }
  return out
})
const pdf = execFileSync('python3', ['-c', "import fitz;print(''.join(p.get_text() for p in fitz.open('public/codex/IAQ-Codex.pdf')))"], { maxBuffer: 1 << 26 }).toString()
const norm = s => s.toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[^a-z0-9%&'"]+/g, ' ').trim()
const P = norm(pdf)
const miss = items.filter(x => { const n = norm(x.t); const probe = n.length > 60 ? n.slice(0, 60) : n; return !P.includes(probe) })
const secs = {}
items.forEach(x => { secs[x.sec] = secs[x.sec] || [0, 0]; secs[x.sec][0]++ })
miss.forEach(x => { secs[x.sec][1]++ })
console.log('checked', items.length, 'headings and sentences; missing from the PDF:', miss.length)
Object.entries(secs).forEach(([k, [n, m]]) => console.log('  ' + k.padEnd(28) + n + ' checked, ' + m + ' missing'))
miss.slice(0, 25).forEach(x => console.log('  MISSING [' + x.sec + '] ' + (x.head ? 'heading: ' : '') + x.t.slice(0, 90)))
await b.close()
