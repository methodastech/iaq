import React, { useEffect, useRef, useState } from 'react'
import { TONAL_MARK } from './TonalMarks.jsx'
import { HERO_LINE } from './HeroLineMarks.jsx'
import { MARKETS } from '../data/markets.js'

/* ============================================================================
   HeroMarkets · the home hero's market row (21 Sep 2026).

   Third cut. The first was an uppercase label over four plain links ("too unprofessional"). The
   second, 18 Sep, was a glass panel that auto-walked all seven markets with a featured card, two
   stat chips and a seven-segment progress rail. Bazil on that one: "this really looks bad, no need
   this complex", then "but meaningful yes".

   So: no panel, no card, no timer, no progress bars. One sentence and one row. The seven markets
   stand as seven links, icon over name, straight on the hero. The meaning is in the ONE line under
   the row: point at a market and the line says what that market demands of a facility, in the
   Markets hub's own words (data/markets.js). At rest it says what all seven have in common.
   Nothing moves unless the visitor moves it, and every item goes to its market page.

   22 Sep (Bazil: "messy, fix it"). Seven links in a free-wrapping row broke five and two, and the
   line under them said the lead again. The seven sit on a four-column grid now, with the eighth cell
   the way to all of them, so every name starts on a column; the line under the grid is empty at rest
   and only speaks for the market under the pointer.
   ============================================================================ */

/* 22 Sep, later (Bazil: "remove the seven across etc and just leave the icons and their names, no need all markets"):
   the lead line, the All markets cell and the hover line are gone. Seven links, icon and name, on the grid. */
/* 22 Sep, later still (Bazil: "list all seven markets but put isometric detailed icons instead across, make it look
   good", "quality better icons or isometric 3d animated"): each market carries its Hard Anodise mark
   (MarketMarks.jsx, scripts_marks_markets.mjs), seven across, the mark over its name; the one red part of each moves.
   23 Sep (Bazil, with the IAQ logo mark and two isometric line-icon sheets: "i like the detailing ... can you do
   something like this design direction", "must be red though"): the marks are the FLAT set now (FlatMarks.jsx) - each
   market drawn as the facility IAQ builds for it. 23 Sep, last cut (Bazil: "red colour only", "but detailed", "the blocky boring
   shapes too much i dont like"): the EQUIPMENT set (FlatMarks.jsx) - a process tool, an open rack, a battery pack, a
   tracker, a chiller skid, a bioreactor, a filling line - in red line work with the detail carrying it, one line of name each, the tiles rising in one after another and each
   mark floating a little at rest; a swipe strip on phones. */
/* 23 Sep, the cut that matters (Bazil, on the drawn sets: "this looks worse and flat and all over the place, try
   making real 3D OpenGL but super refined"): the seven marks are REAL 3D now. One WebGL canvas lies over the row and
   puts a lit, shadowed object on each tile (scenes/market-marks.js); the drawn marks stay in the markup underneath as
   the fallback for no WebGL and for a reduced-motion preference, and are hidden the moment the scene is running. */
/* 23 Sep, the decision. The 3D row was audited part by part: part counts ran 5 to 11 across the seven and the red ran
   from one small element to a whole textured face, so the set could not read as a set. Under that sits the harder
   limit, which is scale: a mark is about 90 px on a photograph, and a modelled machine at 90 px has no room for the
   detail that makes it read as the real thing.

   So the hero carries the DRAWN set (HeroLineMarks.jsx), on the same house spec as the 41 interface marks and the
   record block: 24 grid, one weight, butt caps, mitred joins, no fill, one red element each. Consistent by
   construction, sharp at 90 px, and the same marks the markets strip draws, so the page speaks once.

   The WebGL scene is kept and still works: ?marks=3d mounts it. It is worth having where an object gets 300 px or
   more, which is a market page, not this row. */
const MODE_3D = typeof location !== 'undefined' && /(?:\?|&)marks=3d\b/.test(location.search)
const LINE_MODE = !MODE_3D

export default function HeroMarkets() {
  const host = useRef(null)
  const stages = useRef([])
  const [gl, setGl] = useState(false)

  useEffect(() => {
    const el = host.current
    if (!el) return
    if (LINE_MODE) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let api = null, dead = false
    const links = [...el.querySelectorAll('.hmk-iso li .hmk-it')]
    const on = links.map((a, i) => {
      const enter = () => api && api.hover(i, true)
      const leave = () => api && api.hover(i, false)
      a.addEventListener('pointerenter', enter)
      a.addEventListener('pointerleave', leave)
      return () => { a.removeEventListener('pointerenter', enter); a.removeEventListener('pointerleave', leave) }
    })
    import('../scenes/market-marks.js')
      .then(({ mountMarketMarks }) => mountMarketMarks(el.querySelector('.hmk-gl'), {
        ids: MARKETS.map(m => m.id),
        stages: () => stages.current,
      }))
      .then(a => { if (dead) { a.destroy(); return } api = a; setGl(true) })
      .catch(() => {})
    return () => { dead = true; on.forEach(f => f()); if (api) api.destroy() }
  }, [])

  return (
    <div className={'hero-mkts hmk' + (gl ? ' hmk-on3d' : '') + (LINE_MODE ? ' hmk-line' : '')} data-reveal="" ref={host}>
      <div className="hmk-gl" aria-hidden="true" />
      <ul className="hmk-row hmk-iso" aria-label="Markets">
        {MARKETS.map((m, k) => (
          <li key={m.id} data-m={m.id} style={{ '--k': k }}>
            {/* 25 Sep (Bazil: "this shouldnt be clickable"): the tiles are a statement of the seven markets, not a menu.
                Plain spans, no route, no hover state (home.css); the markets are reached from the nav and the Markets hub. */}
            <span className="hmk-it">
              <span className="hmk-stage" ref={el => { stages.current[k] = el }}>
                {(() => { const M = (LINE_MODE ? HERO_LINE : TONAL_MARK)[m.id]; return M ? <M className="hmk-mk" /> : null })()}
              </span>
              <span className="hmk-nm">{m.name}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
