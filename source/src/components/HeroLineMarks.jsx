import React from 'react'

/* ============================================================================
   HeroLineMarks · the seven market marks as line work, for the home hero (23 Sep 2026).

   Why this exists. The 3D row was audited part by part and the numbers say what Bazil was seeing: part counts run
   from 5 to 11 and the red runs from one small element to a whole textured face, so the seven cannot read as a set.
   The deeper problem is scale: each mark is about 90 px on a photograph, and a modelled machine at 90 px has no room
   for the detail that makes it read as the real thing, which is exactly what "toyish" means.

   These are drawn to the house spec instead, the one the 41 interface marks and the record marks already follow:
   24 unit grid, one stroke weight, butt caps, mitred joins, no fill, currentColor, straight lines and full circles
   with an arc only where the thing itself curves. On the hero the ink is white, and ONE element per mark is the
   client red.

   23 Sep, the pass that made it a set. The first cut was on the spec but not on one frame, and `tools/measure-heromarks.mjs`
   said so: baselines ran 17 to 22 on a 24 grid, a fifth of the mark's height, heights ran 12.5 to 19, Bio sat at
   cx 13.1, the battery's red was three dashes, and the photovoltaic and bottle reds were drawn ON TOP of a grey line
   that was already there, so they were not elements at all. Every mark now obeys four numbers:

     baseline y = 20 · centre x = 12 · height 15 to 16 · width 13 to 17

   and carries exactly ONE red element, which is a real part of the machine and nothing else: the die, the live blade,
   the positive terminal, one module producing, the fan, the impeller, the cap. Re-run the measure tool after ANY edit
   here; it prints the box, the baseline and the red count for all seven.
   ============================================================================ */

/* 23 Sep (Bazil, on the bar: "more thinner please the line"). The set was drawn at 1.15 for a 90px mark over a
   photograph; in the bar it is 24 to 32px and the same weight reads heavy and closes the small counters. */
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 0.95, strokeLinecap: 'butt', strokeLinejoin: 'miter' }
const SIG = { fill: 'none', stroke: '#FF3B42', strokeWidth: 1.45, strokeLinecap: 'butt', strokeLinejoin: 'miter' }
const wrap = (p, kids) => (
  <svg {...p} viewBox="0 0 24 24" className={'hmk-ln' + (p.className ? ' ' + p.className : '')} aria-hidden="true" focusable="false">{kids}</svg>
)

/* the seven, as raw shapes. One source: the components below and the markets strip both draw from this, so the
   hero, the strip and any other surface can never drift apart. The LAST shape of each is the red one. */
export const LINE_SHAPES = {
  'mkt-semiconductor': ['M7 7h10v10H7z', 'M9.5 4v3M12 4v3M14.5 4v3M9.5 17v3M12 17v3M14.5 17v3M4 9.5h3M4 12h3M4 14.5h3M17 9.5h3M17 12h3M17 14.5h3', 'M9.8 9.8h4.4v4.4H9.8z', 'M7 9 9 7', 'F:M10.9 10.9h2.2v2.2h-2.2z'],
  'mkt-data-centre': ['M6 4h12v16H6z', 'M6 8h12M6 12h12M6 16h12', 'M8 6h4.5M8 10h4.5M8 18h4.5', 'M15 6h1.4M15 10h1.4M15 18h1.4', 'M4.5 20h15', 'M8 14h4.5'],
  'mkt-ev-battery': ['M4 6h16v11H4z', 'M5.5 7.4h13', 'M9.33 7.4v8.2M14.67 7.4v8.2', 'M15 4h2v2h-2z', 'M6 17v3M18 17v3M4 20h16', 'F:M7 4h2v2H7z'],
  'mkt-photovoltaics': ['M3.5 13 6.5 4h11l3 9z', 'M4.85 9h14.3', 'M10 4 8.5 13M14 4 15.5 13', 'M12 13v5', 'M9 18h6v2H9z', 'F:M6.5 4 10 4 9.17 9 4.83 9z'],
  'mkt-district-cooling': ['M6.5 8h11v12h-11z', 'M8.6 11h6.8M8.6 14h6.8M8.6 17h6.8', 'M8.6 8V6h6.8v2', 'M17.5 12.5h2.5M4 12.5h2.5M19.4 11.7v1.6M4.6 11.7v1.6', 'M9.9 6v-1M14.1 6v-1', 'M9.4 5h5.2'],
  'mkt-bio-lifescience': ['M7 7h10v10a5 3 0 0 1-10 0z', 'M6.2 7h11.6', 'M10.4 4h3.2v3h-3.2zM10.4 5.5h3.2', 'M12 7v5.2', 'M7 11.5h10', 'M8.6 13.2v3.4M15.4 13.2v3.4', 'M5.5 20h13', 'M9.8 12.4h4.4'],
  'mkt-food-beverage': ['M10.2 5.4v1.6c0 1.6-1.9 2.2-1.9 4V17h7.4v-6c0-1.8-1.9-2.4-1.9-4V5.4z', 'M8.3 12.4h7.4M8.3 15h7.4', 'M4 17h16M4 20h16M6.5 17v3M17.5 17v3', 'M6.6 18.5h1.2M9.6 18.5h1.2M12.6 18.5h1.2M15.6 18.5h1.2', 'F:M10.1 4h3.8v1.4h-3.8z'],
  /* 25 Sep (Bazil: "use this icons style", "this is our official icon style"): five more on the same four numbers.
     vision      the facility and its annex, a flag raised on the far corner: the flag is the red
     mission     the hall under a gantry, the module being set onto it: the module is the red
     esgEnv      energy use, three bars stepping down: the last bar is the red
     esgSocial   three people, the one in front in a helmet: the helmet is the red
     esgGov      the policy sheet, its lines, the seal: the seal is the red */
  /* 30 Sep (Bazil: "make icon more meaningful to the meaning of vision and mission"): Vision, where IAQ is going: the summit,
     and the red flag planted on it. Mission, what IAQ does every day: the
     engineering (a gear) with the sustainable part in red (a leaf at its heart). */
  vision: ['M2.5 20h19', 'M3.5 20 9.5 10.5l3.2 4.7 2.4-3.3 5.4 8.1', 'M9.5 10.5V3.8', 'F:M9.5 3.8h4.3l-1.3 1.6 1.3 1.6H9.5z'],
  mission: ['M6.2 12a5.8 5.8 0 1 0 11.6 0a5.8 5.8 0 1 0-11.6 0', 'M12 3.5v2.7M12 17.8v2.7M3.5 12h2.7M17.8 12h2.7M6 6l1.9 1.9M16.1 16.1 18 18M6 18l1.9-1.9M16.1 7.9 18 6', 'M9.7 14.3l2.4-2.4', 'F:M9.7 14.3c0-3 1.7-4.9 4.9-4.9 0 3-1.7 4.9-4.9 4.9z'],
  /* 25 Sep, second cut (Bazil: "make icon better"): the leaf on its stem over the ground, the sun the red; three people
     with round shoulders, the helmet the red; the policy sheet with its seal ring, the seal's centre the red */
  esgEnv: ['M12 20V8', 'M12 16c-5 0-7-4-7-8 5 0 7 3 7 8z', 'M12 12c5 0 7-4 7-8-5 0-7 3-7 8z', 'M6 20h12', 'F:M4.5 5.5a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0'],
  esgSocial: ['M5.2 12.5a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0-3.6 0', 'M4 20v-2.5a3 3 0 0 1 6 0V20', 'M15.2 12.5a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0-3.6 0', 'M14 20v-2.5a3 3 0 0 1 6 0V20', 'M9.8 7.6a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0-4.4 0', 'M8.2 20v-3.5a3.8 3.8 0 0 1 7.6 0V20', 'M4 20h16', 'M9.3 7.6a2.7 2.7 0 0 1 5.4 0'],
  esgGov: ['M5.5 4.5h9l4 4V20h-13z', 'M14.5 4.5v4h4', 'M8 11h8M8 13.5h8M8 16h4.5', 'M13.4 17.2a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0-4.4 0', 'F:M14.6 16.2h2v2h-2z'],
  /* 25 Sep (Bazil, on the History records' isometric marks: "no shadow and refine the icons please", "use design
     direction correct"): the six records on the same four numbers.
     recClean     a cleanroom bay in section, the FFU grid above, the raised floor below: one FFU is the red
     recCooling   the chiller hall, its fan, the header to the stack: the fan hub is the red
     recCogen     the turbine hall, the generator, the stack: the exhaust plume is the red
     recAward     the trophy on its base: the plaque is the red
     recMedal     the medal on its ribbon: the centre is the red
     recSafety    the shield: the check inside it is the red */
  recClean: ['M4 20V5h16v15', 'M4 8.5h16', 'M8 5v3.5M12 5v3.5M16 5v3.5', 'M4 16.5h16', 'M7 16.5v3.5M12 16.5v3.5M17 16.5v3.5', 'M4 20h16', 'F:M9.5 5.6h5v2.2h-5z'],
  recCooling: ['M4 20V9h11v11', 'M6 9V5.5h3V9', 'M6.5 14.5a3 3 0 1 0 6 0a3 3 0 1 0-6 0', 'M9.5 11.5v6M6.5 14.5h6', 'M15 13h5v7', 'M17.5 13V4.5', 'M4 20h16', 'F:M8.6 13.6h1.8v1.8H8.6z'],
  recCogen: ['M3.5 20V12h8v8', 'M11.5 20v-5h5v5', 'M13 17.5h2', 'M18 20V6h2.5v14', 'M5.5 15h4M5.5 17.5h4', 'M3.5 20h17', 'F:M18 4h2.5v1.5H18z'],
  recAward: ['M8 4h8v5a4 4 0 0 1-8 0z', 'M8 5.5H5.5v2a2.5 2.5 0 0 0 2.5 2.5M16 5.5h2.5v2a2.5 2.5 0 0 1-2.5 2.5', 'M12 13v3.5', 'M8.5 16.5h7v3.5h-7z', 'M7 20h10', 'F:M10.6 17.6h2.8v1.4h-2.8z'],
  recMedal: ['M8.8 11.4 5.5 4h13l-3.3 7.4', 'M10.2 4l1.8 6.2L13.8 4', 'M7 15a5 5 0 1 0 10 0a5 5 0 1 0-10 0', 'M9.3 15a2.7 2.7 0 1 0 5.4 0a2.7 2.7 0 1 0-5.4 0', 'F:M10.9 13.9h2.2v2.2h-2.2z'],
  recSafety: ['M12 4l7 2.5v5.5c0 4-3 6.8-7 8-4-1.2-7-4-7-8V6.5z', 'M12 6.6l4.6 1.7v3.7c0 2.7-2 4.6-4.6 5.6-2.6-1-4.6-2.9-4.6-5.6V8.3z', 'M9 12.2l2.2 2.2 3.8-4.2'],
}

/* a shape may be prefixed F: to say "fill this rather than stroke it". Four marks use it, and always for the red:
   at 24 units a hollow square inside a hollow square reads as a hole punched in the thing, not as a solid part. */
const draw = (d, k, attrs) => d.startsWith('F:')
  ? <path key={k} d={d.slice(2)} fill={attrs.stroke} stroke="none" />
  : <path key={k} d={d} {...attrs} />
const Mark = id => function M (p) {
  const shapes = LINE_SHAPES[id]
  return wrap(p, <>
    {shapes.slice(0, -1).map((d, k) => draw(d, k, S))}
    <g className="mk-mv">{draw(shapes[shapes.length - 1], 'sig', SIG)}</g>
  </>)
}
export const LnSem = Mark('mkt-semiconductor')
export const LnDat = Mark('mkt-data-centre')
export const LnEv = Mark('mkt-ev-battery')
export const LnPv = Mark('mkt-photovoltaics')
export const LnDch = Mark('mkt-district-cooling')
export const LnBio = Mark('mkt-bio-lifescience')
export const LnFnb = Mark('mkt-food-beverage')
/* 25 Sep: the About cards and the Corporate Commitment pillars draw from the same set */
export const LnVision = Mark('vision')
export const LnMission = Mark('mission')
export const LnEsgEnv = Mark('esgEnv')
export const LnEsgSocial = Mark('esgSocial')
export const LnEsgGov = Mark('esgGov')
export const LnRecClean = Mark('recClean'), LnRecCooling = Mark('recCooling'), LnRecCogen = Mark('recCogen'), LnRecAward = Mark('recAward'), LnRecMedal = Mark('recMedal'), LnRecSafety = Mark('recSafety')
export const LINE_MARKS = { vision: LnVision, mission: LnMission, esgEnv: LnEsgEnv, esgSocial: LnEsgSocial, esgGov: LnEsgGov, recClean: LnRecClean, recCooling: LnRecCooling, recCogen: LnRecCogen, recAward: LnRecAward, recMedal: LnRecMedal, recSafety: LnRecSafety }

export const HERO_LINE = {
  'mkt-semiconductor': LnSem,
  'mkt-data-centre': LnDat,
  'mkt-ev-battery': LnEv,
  'mkt-photovoltaics': LnPv,
  'mkt-district-cooling': LnDch,
  'mkt-bio-lifescience': LnBio,
  'mkt-food-beverage': LnFnb,
}
