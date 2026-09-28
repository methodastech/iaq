/* 22 Sep: the print PDFs. Each print piece from /booth/art/:id?bleed=1&print=1&marks=0, one page at 1:1 in mm with
   its bleed (10 mm on the stand and roll-ups, 3 mm on the flyer), vector, fonts embedded by Chrome. RGB: the
   CMYK FOGRA39 conversion is the last step, after IAQ signs off.
   Usage: node tools/export-booth-print-0922.mjs <outdir> [ids...] */
import puppeteer from 'puppeteer-core'
const [OUT = 'public/booth/print', ...only] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.goto('http://localhost:5177/booth/art/w1', { waitUntil: 'networkidle0' })
const all = await p.evaluate(async () => { const P = (await import('/src/components/booth/Art.jsx')).PIECES; return Object.entries(P).filter(([, v]) => v.print).map(([k, v]) => [k, v.w, v.h]) })
for (const [id, w, h] of all.filter(([id]) => !only.length || only.includes(id))) {
  const bl = Math.max(w, h) < 400 ? 3 : 10, W = w + 2 * bl, H = h + 2 * bl
  const k = 900 / Math.max(W, H)
  await p.setViewport({ width: Math.max(400, Math.round(W * k)), height: Math.max(400, Math.round(H * k)) })
  await p.goto(`http://localhost:5177/booth/art/${id}?bleed=1&print=1&marks=0`, { waitUntil: 'networkidle0' })
  await p.evaluate(() => document.fonts.ready); await new Promise(r => setTimeout(r, 400))
  await p.addStyleTag({ content: `@page{size:${W}mm ${H}mm;margin:0} html,body{width:${W}mm;height:${H}mm} .ba{width:${W}mm!important;height:${H}mm!important}` })
  const file = `${OUT}/IAQ-SEMICON-2026-${id}.pdf`
  await p.pdf({ path: file, width: W + 'mm', height: H + 'mm', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, pageRanges: '1', preferCSSPageSize: true })
  console.log(id, `${w}x${h} mm + ${bl} mm bleed ->`, file)
}
console.log('errors', errs.length, errs.slice(0, 3))
await b.close()
