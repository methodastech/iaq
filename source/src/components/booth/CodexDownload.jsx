/* ============================================================================
   Exhibition codex downloads (30 Sep 2026). Bazil, on /portal/booth: "have a codex download for this", then, scrolled
   down the Stand part: "where's the download button for this whole page".
   The codex is one HTML file that opens offline with every piece, measurement and open question inside; the print files
   are every print PDF in one ZIP. Offered in three places:
     CodexDownload  the booth page's head, beside "See the booth screen" and "The stand in 3D" (pages/PortalBooth.jsx)
     CodexMini      the left end of the floating direction bar, so it is on screen at any scroll (PortalBooth DirMini)
     CodexSide      the last item of the portal sidebar's Exhibition group (pages/Portal.jsx)
   Both files, and their sizes and date in data/boothCodex.js, are written by tools/booth-codex-0930.py: rerun it after
   any artwork export. Review builds only: the launch build has no portal chunk and prunes public/booth.
   Styles: styles/booth-codex.css.
   ============================================================================ */
import React from 'react'
import { CODEX } from '../../data/boothCodex.js'
import { EVERYTHING } from '../../data/boothEverything.js'   /* 30 Sep: the whole exhibition in one ZIP, tools/booth-everything-0930.py */
import '../../styles/booth-codex.css'

/* the house download icon (tools/design-apps-0925.py DL_ICON) */
const DlIcon = () => <svg className="cdx-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" /></svg>
const size = b => (b >= 1e6 ? `${(b / 1e6).toFixed(b >= 1e7 ? 0 : 1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`)

export default function CodexDownload() {
  const { html, zip } = CODEX
  return (
    <div className="cdx">
      <div className="cdx-row">
        {/* 30 Sep (Bazil: "then just give me the whole zip file"): everything first, the codex, every PDF and every PNG */}
        <a className="cdx-a cdx-all" href={EVERYTHING.href} download={EVERYTHING.name}><DlIcon />Download everything, ZIP</a>
        <a className="cdx-a" href={html.href} download={html.name}><DlIcon />Download the codex, HTML</a>
        <a className="cdx-a" href={zip.href} download={zip.name}><DlIcon />Print files, ZIP</a>
      </div>
      <p className="cdx-note">Everything {size(EVERYTHING.bytes)}: the codex, every print PDF and every piece as PNG, by direction. Codex {size(html.bytes)}, one file that opens offline with every piece inside. Print files {size(zip.bytes)}, {zip.files} PDFs at 1:1 with bleed.</p>
    </div>
  )
}

export function CodexMini({ tabIndex }) {
  const E = EVERYTHING
  return <a className="cdx-mini" href={E.href} download={E.name} tabIndex={tabIndex} title={`Download everything, ZIP, ${size(E.bytes)}`}><DlIcon /><span>Download everything</span></a>
}

/* 30 Sep (Bazil: "you're supposed to have a download button for this total page"): the same ZIP at the head of every part */
export function PartDownload() {
  const E = EVERYTHING
  return <a className="cdx-part" href={E.href} download={E.name}><DlIcon /><span>Download everything, ZIP</span><em>{size(E.bytes)}</em></a>
}

export function CodexSide() {
  const E = EVERYTHING
  return (
    <a className="pt-p cdx-side" href={E.href} download={E.name}>
      <i className="pt-ic" aria-hidden="true"><DlIcon /></i>
      <span><b>Download the whole exhibition</b><em>ZIP, {size(E.bytes)}: codex, PDFs and PNGs</em></span>
    </a>
  )
}
