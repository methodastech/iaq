import React from 'react'
import { FAB_ISO } from '../data/fabArt.js'

/* One drawn mark per system. Generated from a single geometry source, which also emits the
   <symbol> defs on the Design tab, so the tab can never show a mark the site does not ship.

   9 Sep, third pass (client: "looks ugly, different thickness, and our icons in IAQ is not
   curved"). Both right, and both were mine.

   THICKNESS: the previous pass used two pen weights to add detail. On a mark this small that
   does not read as hierarchy, it reads as a mistake. One weight now, everywhere.

   CURVES: the house set is src/components/FlowIcon.jsx, and its whole vocabulary is straight
   lines, rects and full circles. My marks had pipe elbows, cable sag and spray arcs, none of
   which exists anywhere else on this site. Every arc is gone; the only curves left are two
   complete circles, which the house set already uses.

   9 Sep, FIFTH pass, and the important one (client: "too hard for people to understand and
   doesn't look good when small"). Right on both counts, and the cause was mine: I had been
   optimising these for technical accuracy and had lost legibility. A drop, a gate valve bowtie,
   a cable ladder in elevation with a cable pulled through it are all correct and none of them
   reads at 19px to someone who does not build fabs.

   These are drawn for READING now. Three to five elements each, no feature under 3 units, one
   idea per mark. Some technical precision is gone on purpose: the point of an icon in a rail is
   that a visitor knows which system they are looking at before they read the label.

   Stroke 1, butt caps, mitred joins, 24 grid, shared with the interface set.

   The interface set in FlowIcon.jsx moved with it in the same pass. Two icon systems on one site
   cannot disagree about caps. */
/* 10 Sep (Bazil, on the fab rail: "and better icons"). Two things were wrong and only one of
   them was the drawing.

   SIZE. The mark renders in a 34px slot on the dark rail, and it was set at 19px with a 1-unit
   stroke on a 24 grid: 0.79 device pixels of line, on a near-black ground, at 34% opacity when
   the stage is not active. It was not that the marks were bad, it was that they were not there.
   22px at 1.15 puts a real line on the rail and keeps the same stroke-to-grid ratio the
   interface set uses at its own smaller sizes, so the two systems still agree.

   AMBIGUITY. 05 AIR-CONDITIONING and 07 CLEANROOM were both "a box at the top with lines coming
   down", which is one mark doing two jobs. 05 is a fan now. */
export const SPEC = { viewBox: '0 0 24 24', stroke: 1.15, grid: 24, cap: 'butt', join: 'miter', size: 22 }

const M = {
  /* 01 CIVIL & STRUCTURAL: A pile cap on three piles. The foundation, at its simplest. */
  st: <><path d="M4 8h16v3.5H4z" /><path d="M7.5 11.5v7.5M12 11.5v9.5M16.5 11.5v7.5" /></>,
  /* 02 ARCHITECTURAL: The clad building. Flat roofed, because a fab is. */
  ar: <><path d="M3.5 6.5h17V20h-17z" /><path d="M9.2 6.5V20M14.8 6.5V20" /><path d="M2 20h20" /></>,
  /* 03 PROCESS UTILITIES: A valve on a pipe run, with its handwheel. */
  pu: <><path d="M2 13h6M16 13h6" /><path d="M8 9.5V16.5L12 13z" /><path d="M16 9.5V16.5L12 13z" /><path d="M12 13V8" /><path d="M9 8h6" /></>,
  /* 04 FIRE PROTECTION: A sprinkler head off the main, and its spray. */
  fp: <><path d="M2 5h20" /><path d="M12 5v5" /><path d="M8 10h8" /><path d="M9 13 6 19M12 13v6.5M15 13l3 6" /></>,
  /* 05 AIR-CONDITIONING: A fan in its housing. Bazil asked for this one directly ("come on man,
     that is not an air conditioning icon" / "something like fan?") and he was right twice over:
     the duct-and-diffuser drawing said nothing to a reader, and it had the same silhouette as
     07 CLEANROOM, so two of the nine marks could not be told apart. A fan can only be a fan.
     The circle is allowed: the house set already uses complete circles, and a fan IS round.

     10 Sep (Bazil: "stop making lighted square effect"). The first fan sat in a square housing.
     Eight marks with no box and one in a box reads as one mark in a box, and this client rejected
     icons in squares on 4 Sep. The housing is gone; the fan is the circle and its blades. */
  ac: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="1.8" /><path d="M12 4v6.2M18.9 16l-5.3-3.1M5.1 16l5.3-3.1" /></>,
  /* 06 HT & LV ELECTRICAL: A cable tray dropping to a distribution board. */
  el: <><path d="M2 5h20M2 10h20" /><path d="M7 5v5M12 5v5M17 5v5" /><path d="M12 10v4" /><path d="M8.5 14h7v7h-7z" /></>,
  /* 07 CLEANROOM SYSTEM: The fan filter unit, and the laminar flow under it. The two dividers
     it used to carry read as a plain box; three pleats read as a FILTER, which is the whole
     difference between this mark and 05. */
  cr: <><path d="M3 3.5h18V9H3z" /><path d="M7.5 3.5V9M12 3.5V9M16.5 3.5V9" /><path d="M6 12v7.5M12 12v9M18 12v7.5" /></>,
  /* 08 TOOLS HOOKUP: The service drop meeting the tool. The connection is the point. */
  tl: <><path d="M12 2.5V7.5" /><path d="M9 7.5h6v3H9z" /><path d="M5 10.5h14V20H5z" /><path d="M2 20h20" /></>,
  /* 09 OVERALL: The finished facility: plant on the roof, a stack, the entrance. */
  ov: <><path d="M3 20V8h18v12z" /><path d="M6 8V5h3.5v3" /><path d="M16.5 8V3h2v5" /><path d="M10 20v-5h4v5" /><path d="M2 20h20" /></>,
}

/* 10 Sep (Bazil: "isometric 3d icon might help if it is good, check back and see which fits").
   The rail can carry either cut of the same nine: the line mark, or the isometric object from
   the design tab. Both share the footprint rule and the one-red-face rule, so switching is a
   prop, not a redesign. */
export default function FabIcon({ k, iso = false }) {
  if (iso) return <span className="fab-iso-w" aria-hidden="true" dangerouslySetInnerHTML={{ __html: FAB_ISO[k] || FAB_ISO.ov }} />
  return (
    <svg viewBox="0 0 24 24" width={SPEC.size} height={SPEC.size} fill="none" stroke="currentColor"
         strokeWidth={SPEC.stroke} strokeLinecap="butt" strokeLinejoin="miter"
         focusable="false" aria-hidden="true">{M[k] || M.ov}</svg>
  )
}
