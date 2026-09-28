import React from 'react'
import { VALUES } from '../data/values.js'
import { VALUE_ART } from '../data/valuesArt.js'
import ValuesIso from './ValuesIso.jsx'

/* NOT MOUNTED. Built 10 Sep, replaced the same hour by ValuesRing carrying the isometric objects
   (Bazil: "no, the circular one"). Kept on disk with its CSS (values-grid.css, .vb-*) because
   the section has changed shape four times and this is the one flat isometric layout that works
   if the ring is ever retired again.

   "Six values, held on every site." — the cards, in isometric, from above.

   10 Sep (Bazil, on the flat grid of objects: "no, before was better, I said put the isometric
   icons ON the card" and "have an isometric view more from the top of the cards"). Two
   corrections to the last pass, and both are about keeping the CARD. The ring's cards were the
   right object; the flat grid threw them away and left six objects floating over captions.

   So: six cards, each carrying its number, its title and its line as it always did, each with
   its isometric object standing on it, and the whole set laid on one plane and viewed from
   above at a steep isometric angle. The board is a parallel projection (no perspective), which
   is what makes it read as isometric rather than as a photograph of some cards.

   The objects are the same six from valuesArt.js. They are counter-rotated out of the board so
   they stand upright as sprites on the card surface, which is how every isometric card layout
   is built: the plate takes the plane, the object takes the camera.

   Under 900px, and under a reduced-motion preference, the flat set (ValuesIso) renders instead:
   a 3D board needs width, and a preference against motion should not get a lifting card. */

const KEYS = ['v01', 'v02', 'v03', 'v04', 'v05', 'v06']

export default function ValuesBoard() {
  return (
    <div className="vb">
      <div className="vb-stage" aria-hidden="true">
        <ol className="vb-board">
          {VALUES.map((v, i) => (
            <li className="vb-card" key={v.ix} style={{ '--d': i * 70 + 'ms' }}>
              <span className="vb-ix">{v.ix}</span>
              <span className="vb-obj" dangerouslySetInnerHTML={{ __html: VALUE_ART[KEYS[i]] }} />
              <b className="vb-t">{v.title}</b>
              <span className="vb-l">{v.line}</span>
            </li>
          ))}
        </ol>
      </div>
      {/* the same six, flat, for small screens and reduced motion; also the accessible copy */}
      <div className="vb-flat"><ValuesIso /></div>
    </div>
  )
}
