/* put the SHIPPING hero line marks on the Design tab, drawn from the one source (LINE_SHAPES), so the page
   can never show a set the site no longer uses */
import fs from 'node:fs'
const src = fs.readFileSync('src/components/HeroLineMarks.jsx', 'utf8')
const body = src.slice(src.indexOf('export const LINE_SHAPES = {'))
const block = body.slice(0, body.indexOf('\n}\n') + 3)
const NAMES = {
  'mkt-semiconductor': ['sem', 'Semiconductor', 'the package, its lead frame and pin-one chamfer; the die is the red'],
  'mkt-data-centre': ['dat', 'Data Centre', 'the open rack, four bays with blades and status ticks; one unit is live'],
  'mkt-ev-battery': ['ev', 'EV Battery', 'the module: lid seam, three cells, two posts; the positive post is the red'],
  'mkt-photovoltaics': ['pv', 'Photovoltaics', 'the tracker on its mast and plinth; one module is producing'],
  'mkt-district-cooling': ['dch', 'District Cooling & Heating', 'the tower: louvred casing, supply and return headers; the fan is the red'],
  'mkt-bio-lifescience': ['bio', 'Bio LifeScience', 'the vessel: dished bottom, drive, level line, baffles; the impeller is the red'],
  'mkt-food-beverage': ['fnb', 'Food & Beverage', 'the bottle on the roller bed; the cap is the red'],
}
const shapes = {}
for (const m of block.matchAll(/'(mkt-[a-z-]+)': \[(.*?)\],\n/gs)) {
  shapes[m[1]] = [...m[2].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(x => x[1])
}
const svg = (id) => {
  const ss = shapes[id]
  const draw = (d, last) => d.startsWith('F:')
    ? `<path d="${d.slice(2)}" fill="${last ? '#FF3B42' : 'currentColor'}"/>`
    : `<path d="${d}" fill="none" stroke="${last ? '#FF3B42' : 'currentColor'}" stroke-width="${last ? 1.7 : 1.15}" stroke-linecap="butt" stroke-linejoin="miter"/>`
  return `<svg viewBox="0 0 24 24" width="84" height="84" aria-hidden="true" focusable="false" style="color:#D8DDE4">${ss.map((d, i) => draw(d, i === ss.length - 1)).join('')}</svg>`
}
const figs = Object.keys(NAMES).map(id => {
  const [k, name, note] = NAMES[id]
  return `      <figure style="margin:0;text-align:center"><div style="height:96px;display:grid;place-items:center">${svg(id)}</div><div><span class="k">${k}</span><b style="display:block;color:#fff;font-size:13px;margin-top:4px">${name}</b><small style="display:block;color:#9AA4B2;font-size:11.5px;line-height:1.35;margin-top:3px">${note}</small></div></figure>`
}).join('\n')
const html = `    <div class="lineset-hero" style="margin-top:22px;background:#12151A;border-radius:14px;padding:22px 18px;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:14px">
${figs}
    </div>
    <p class="note"><b>The four numbers that make it a set.</b> Every mark sits on <b>baseline y&nbsp;=&nbsp;20</b>, is centred on <b>x&nbsp;=&nbsp;12</b>, stands <b>15 to 16 units</b> tall and <b>13 to 17</b> wide, and carries <b>exactly one red element</b> that is a real part of the machine. Before this pass the same seven were on the house spec but not on one frame: baselines ran 17 to 22 on a 24 grid, heights ran 12.5 to 19, Bio sat at cx&nbsp;13.1, the battery's red was three dashes, and the photovoltaic and bottle reds were drawn on top of a grey line that was already there, so they were not elements at all. <code>tools/measure-heromarks.mjs</code> prints the box, the baseline and the red count for all seven; run it after any edit. The row also breathes on <b>one phase</b> now: the float used to carry a &minus;.7s per-tile delay, which on a 5.2s cycle put the seven up to 4.2&nbsp;px apart at any instant and read as the row being unstructured.</p>
`
const p = 'public/design.html'
let s = fs.readFileSync(p, 'utf8')
const anchor = '    <h3 style="margin-top:30px;font-size:17px">The delivery cycle, as a ring</h3>'
if (s.includes('class="lineset-hero"')) { console.log('already present'); process.exit(0) }
if (!s.includes(anchor)) { console.error('anchor not found'); process.exit(1) }
s = s.replace(anchor, html + anchor)
fs.writeFileSync(p, s)
console.log('inserted', Object.keys(shapes).length, 'marks')
