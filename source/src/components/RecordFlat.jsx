import React from 'react'

/* ============================================================================
   RecordFlat · the six marks beside the record numbers (23 Sep 2026).

   Bazil: "refine and compare to better icons." The better icons were already in this build: the interface set on the
   Design tab, 41 marks, audited, with a spec the whole site runs on. These six were off it, drawn on a 48 grid at 1.15
   with solid fills. They are redrawn to the house spec now, so the record block sits in the same family as the
   framework diagram, the service rows and the specification tables:

     · 24 unit grid, ONE stroke weight of 1, butt caps, mitred joins, no fill
     · currentColor, so the block's own ink carries them
     · straight lines and full circles only; an arc appears only where the thing itself is curved
     · ONE red element per mark, the part that carries the fact. It is drawn, never filled: same geometry, stroke 1.8,
       class iaq-sig, which is also what lifts on the section's slow loop (group-record.css grLift)
   ============================================================================ */

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: .85, strokeLinecap: 'butt', strokeLinejoin: 'miter' }
/* one rule for the red: about two units of mass in every one of the six, always its own object with clear space
   around it, never drawn on top of an ink line. That last part matters because the section lifts the red element on a
   slow loop (grLift): anything coincident with a line detaches from it as it moves. */
const SIG = { fill: 'none', stroke: '#EC2027', strokeWidth: 1.4, strokeLinecap: 'butt', strokeLinejoin: 'miter' }
const wrap = (p, kids) => (
  <svg {...p} viewBox="0 0 24 24" className={'iaq-rf' + (p.className ? ' ' + p.className : '')} aria-hidden="true" focusable="false">{kids}</svg>
)

/* years · a calendar, one day marked */
export function RfYrs (p) {
  return wrap(p, <>
    <rect x="3.5" y="5" width="17" height="15" {...S} />
    <path d="M3.5 9.5h17" {...S} />
    <path d="M8 3v3.4M16 3v3.4" {...S} />
    <path d="M6.6 12.8h2.4M10.6 12.8h2.4M6.6 16.4h2.4M10.6 16.4h2.4" {...S} />
    <g className="iaq-sig mk-mv"><path d="M14.6 16.4h2.4" {...SIG} /></g>
  </>)
}

/* countries · the house globe, one office on it */
export function RfCtr (p) {
  return wrap(p, <>
    <circle cx="12" cy="12" r="8" {...S} />
    <path d="M4 12h16" {...S} />
    <path d="M12 4c2.5 2.5 3.5 5.5 3.5 8s-1 5.5-3.5 8c-2.5-2.5-3.5-5.5-3.5-8s1-5.5 3.5-8z" {...S} />
    <g className="iaq-sig mk-mv"><circle cx="8.2" cy="15.6" r="1.2" {...SIG} /></g>
  </>)
}

/* ISO · a certificate and its seal */
export function RfIso (p) {
  return wrap(p, <>
    <path d="M5 3h9l4 4v14H5z" {...S} />
    <path d="M14 3v4h4" {...S} />
    <path d="M8 11h7M8 14h7" {...S} />
    <g className="iaq-sig mk-mv"><circle cx="11.5" cy="17.4" r="1.5" {...SIG} /><path d="M10.5 18.7 10 20.2M12.5 18.7l.5 1.5" {...SIG} /></g>
  </>)
}

/* industries · seven sectors, one of them ours */
export function RfInd (p) {
  return wrap(p, <>
    <circle cx="12" cy="12" r="8" {...S} />
    {[1, 2, 3, 4, 5, 6].map(i => {
      const a = (i / 7) * Math.PI * 2 - Math.PI / 2
      return <path key={i} d={`M12 12L${(12 + Math.cos(a) * 8).toFixed(2)} ${(12 + Math.sin(a) * 8).toFixed(2)}`} {...S} />
    })}
    <g className="iaq-sig mk-mv"><path d="M12 12V4.6" {...SIG} /></g>
  </>)
}

/* projects · a drawing signed off */
export function RfPrj (p) {
  return wrap(p, <>
    <rect x="3.5" y="4" width="17" height="16" {...S} />
    <path d="M3.5 16h17" {...S} />
    <path d="M7 8h6M7 11.5h9" {...S} />
    <g className="iaq-sig mk-mv"><path d="m13.4 18.2 1.3 1.3 2.8-2.8" {...SIG} /></g>
  </>)
}

/* cleanroom · the floor, by the square metre */
export function RfCln (p) {
  return wrap(p, <>
    <rect x="3.5" y="6" width="17" height="12" {...S} />
    <path d="M9.2 6v12M14.8 6v12M3.5 12h17" {...S} />
    <g className="iaq-sig mk-mv"><rect x="16" y="13.2" width="3.3" height="3.6" {...SIG} /></g>
  </>)
}

/* 19 Oct (client: "update icon to a more relevance icon reflecting the metrics"): three marks for the new figures, to the
   same spec as the six above */

/* 20 Oct ("make premium icon and subtle"): the three new marks redrawn to the house spec's restraint, one person in front
   and one behind, the hard hat in profile, the leaf on its stem; each red part small and held clear of the ink */

/* employees · two people, one in front, the red a badge on the front one */
export function RfPpl (p) {
  return wrap(p, <>
    <circle cx="16.6" cy="7.6" r="2.3" {...S} />
    <path d="M14.4 13.2c.7-.5 1.4-.7 2.2-.7 2.6 0 4.4 2.2 4.4 5.5" {...S} />
    <circle cx="9.4" cy="9" r="2.8" {...S} />
    <path d="M3.6 20c0-3.6 2.4-6.2 5.8-6.2s5.8 2.6 5.8 6.2" {...S} />
    <g className="iaq-sig mk-mv"><path d="M9.4 16.6v1.6" {...SIG} /></g>
  </>)
}

/* engineering workforce · a hard hat, the red its crown ridge */
export function RfEng (p) {
  return wrap(p, <>
    <path d="M5.5 16c0-4.4 2.9-7.6 6.5-7.6s6.5 3.2 6.5 7.6" {...S} />
    <path d="M3.5 16h17M4.5 18.2h15" {...S} />
    <path d="M9.4 9.2 10 12.6M14.6 9.2 14 12.6" {...S} />
    <g className="iaq-sig mk-mv"><path d="M12 10.2v2.6" {...SIG} /></g>
  </>)
}

/* carbon reduced · a leaf on its stem, the red a small fall beside it */
export function RfCo2 (p) {
  return wrap(p, <>
    <path d="M5.5 18.5C5.5 11 9.5 5.5 17 5.5c0 7.5-4 13-11.5 13z" {...S} />
    <path d="M5.5 18.5 13 11M3.5 20.5l2-2" {...S} />
    <g className="iaq-sig mk-mv"><path d="M19.6 13.4v4.2M18.1 16.3l1.5 1.5 1.5-1.5" {...SIG} /></g>
  </>)
}

/* learning · a mortarboard, its tassel the red part (19 Oct, Careers: "simple visuals that clearly communicate engineering,
   teamwork, learning or operational capability") */
export function RfLrn (p) {
  return wrap(p, <>
    <path d="M12 5l9 4.5-9 4.5-9-4.5z" {...S} />
    <path d="M7 11.6v4.2c0 1.6 2.2 2.8 5 2.8s5-1.2 5-2.8v-4.2" {...S} />
    <g className="iaq-sig mk-mv"><path d="M19.2 11.2v4.6" {...SIG} /><circle cx="19.2" cy="17.2" r="1" {...SIG} /></g>
  </>)
}

/* 20 Oct (client: the Vision and Mission icons "ugly, please make it more premium and subtle"): two marks to the house spec */

/* vision · a compass, its needle the red part: where IAQ is going */
export function RfVis (p) {
  return wrap(p, <>
    <circle cx="12" cy="12" r="8.5" {...S} />
    <path d="M12 3.5v1.6M12 18.9v1.6M3.5 12h1.6M18.9 12h1.6" {...S} />
    <path d="M10.6 13.4 8.6 15.4" {...S} />
    <g className="iaq-sig mk-mv"><path d="M13.2 10.8l2.4-2.4" {...SIG} /></g>
    <circle cx="12" cy="12" r="1.3" {...S} />
  </>)
}

/* mission · a target, its centre the red part: what IAQ does every day */
export function RfMis (p) {
  return wrap(p, <>
    <circle cx="12" cy="12" r="8.5" {...S} />
    <circle cx="12" cy="12" r="5" {...S} />
    <g className="iaq-sig mk-mv"><circle cx="12" cy="12" r="1.5" {...SIG} /></g>
  </>)
}

export const RECORD_FLAT = { yrs: RfYrs, ctr: RfCtr, iso: RfIso, ind: RfInd, prj: RfPrj, cln: RfCln, ppl: RfPpl, eng: RfEng, co2: RfCo2, lrn: RfLrn }
