/* Tick the checklist items that were verified against the live build on 23 Sep. Ticks live in the
   savedState blob at the foot of public/checklist.html (the page also keeps them per browser).
   Only ids with evidence recorded in HANDOVER go in here. */
import fs from 'node:fs'
const P = 'public/checklist.html'
const VERIFIED = {
  br1: 'ring centre box sits inside the ring frame, seen at 1440',
  br2: 'ring laid out on the fixed 1000 grid, circle tight, visual under it',
  br3: 'six .mk-mv groups measured moving; transform changed on all six over 1.4s; still under reduced motion',
  br6: '0 sentences over 40 characters appear more than once on /about',
  br7: 'hero lede sits 50% down the hero box',
  br8: '.cx-form: 3 numbered sections, 8 fields, 8 labels, icon tiles',
  br10: '7 country flags on the office cards',
  br12: 'closing band: 1 logo, both columns carry content on both rows',
  br13: 'values are photo cards with red icon tiles and dark cards behind the front one',
  br4: 'Services wing: 3 columns, 0 links with a border over 1px, all columns open at the same top AND now end level (slack 27px both, was 198px on the services list)',
  br5: 'About story photograph replaced: cr-litho-8569.webp (the lithography bay) is now cr-ballroom-8578.webp (the finished ballroom)',
  m18q: 'relationship map: 3 edges rendered when a service is picked and all 3 lit, 3 distinct landing points, 0 lines crossing a card (measured on the path, endpoints excluded)',
  m18r: '120 bracketed expansions of short forms on the Codex page',
  m18s: 'primary button: text-transform none, 14px, radius 0, no arrow',
  m18u: 'Codex PDF re-exported 23 Sep: 36 pages, 9.4MB, 0 errors. It was stale, exported 22 Sep 06:16 against a component changed 22 Sep 13:03. Infographic set checked and current',
  m18v: 'relationship map: 0 nodes carrying a blur or drop-shadow filter',
  m18w: 'Codex at 1440, 1024 and 390: 0 sideways overflow, 0 real clipping (the 14 and 26 flagged are 1px screen-reader spans)',
  m18y: 'Watch blocks present for everyone and by business unit; 14 poster elements, 0 iframes until pressed',
  m18z: '"Download the whole Codex" present on the page',
  m18t: 'reworked, not dropped: the rail became the seven-mark row on 22 Sep and the record now says so',
  d6: 'Brand Method half done 23 Sep: the portal carries a 3D tab (/portal/models) holding both demos in one place, with the owed files named and owned. The files themselves stay with Azwan and IAQ (d4, d1)',
}
let s = fs.readFileSync(P, 'utf8')
const m = s.match(/(id="savedState">)([^<]*)(<)/)
const saved = JSON.parse(decodeURIComponent(m[2]))
saved.done = saved.done || {}
let added = 0
for (const id of Object.keys(VERIFIED)) if (!saved.done[id]) { saved.done[id] = true; added++ }
saved.verified0923 = VERIFIED
s = s.replace(m[0], m[1] + encodeURIComponent(JSON.stringify(saved)) + m[3])
fs.writeFileSync(P, s)
console.log('ticked', added, 'new · total ticked', Object.keys(saved.done).length)
