import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useSearchParams } from 'react-router-dom'
import { PIECES as PIECES_A } from '../components/booth/Art.jsx'
import { PIECES_B } from '../components/booth/ArtB.jsx'
import { PIECES_C, PIECES_C2, PIECES_C3 } from '../components/booth/ArtC.jsx'
import { PIECES_F } from '../components/booth/ArtF.jsx'
import { PIECES_PRINT } from '../components/booth/Print.jsx'
import { PIECES_D } from '../components/booth/ArtD.jsx'
import { PIECES_E } from '../components/booth/ArtE.jsx'

/* 29 Sep: both directions, A (Art.jsx) and B (ArtB.jsx). 30 Sep: C (ArtC.jsx), D (ArtD.jsx) and E (ArtE.jsx) */
const PIECES = { ...PIECES_A, ...PIECES_B, ...PIECES_C, ...PIECES_C2, ...PIECES_C3, ...PIECES_D, ...PIECES_E, ...PIECES_F, ...PIECES_PRINT }
import { useBrandFonts } from '../lib/brandFonts.js'

/* One booth artwork alone on the page (22 Sep 2026), for review and for the exports: the print PDFs
   (tools/export-booth-print-0922.mjs) and the 3D booth's textures (tools/bake-booth-0922.mjs).
   /booth/art/:id  ?bleed=1 adds the 10 mm bleed  ?print=1 drops the reader's notes. Review builds only. */
export default function BoothArt() {
  useBrandFonts()
  const { id } = useParams()
  const [q] = useSearchParams()
  const p = PIECES[id]
  useEffect(() => {
    document.title = 'IAQ booth · ' + (p ? p.k : 'artwork')
    document.documentElement.classList.add('ba-on')
    return () => document.documentElement.classList.remove('ba-on')
  }, [p])
  if (!p) return <div style={{ padding: 40, font: '16px system-ui' }}>No artwork “{id}”. Try: {Object.keys(PIECES).join(', ')}</div>
  const A = p.C
  /* rendered on <body>, outside the site shell, which offsets its children by the review bar's height */
  return createPortal(
    <div className="ba" data-w={p.w} data-h={p.h} data-unit={p.unit}>
      <A bleed={q.get('bleed') === '1'} print={q.get('print') === '1'} zones={q.get('zones') === '1' ? [] : null} />
      <style>{`html.ba-on,html.ba-on body{margin:0;background:#fff;zoom:1!important;overflow:hidden}
        html.ba-on .bmws,html.ba-on .skip-link{display:none!important}
        .ba{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2147483600;background:#fff}
        .ba > svg{display:block;width:100%;height:100%}
        html.ba-on .bt-bleedline{display:${q.get('marks') === '0' ? 'none' : 'inline'}}`}</style>
    </div>,
    document.body
  )
}
