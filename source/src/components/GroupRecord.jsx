import React, { useEffect, useRef } from 'react'
import { RfYrs, RfCtr, RfIso, RfInd, RfPrj, RfCln } from './RecordFlat.jsx'
import '../styles/group-record.css'

/* ============================================================================
   GroupRecord · the home page's numbers and the world (21 Sep 2026).

   Bazil, on the section this replaces ("The group in numbers", six grey marks on white beside a grey
   dot globe): "have a background colour thats great here", "but meaningful yes", "better title and
   description", then "a much more better world thats premium awesome and interactive with better
   visual for the numbers icon and such go all out".

   THE GROUND is a light grey (Bazil, after the first cut went to a night sky with six glass cards:
   "maybe background light grey", "dont over complicate things", "the ui boxes are too much"). The
   page already has a dark hero above and a black fab below; this band is the quiet between them, and
   the dark planet is the one heavy object on it.

   THE WORLD (scenes/home.js) is a planet now, not a cloud: a body with a blue limb, an atmosphere,
   land that is brightest nearest the eye. It can be asked a question. Pick a country, here or on the
   globe itself, and the world turns to it the short way round and the dock says what is there. Left
   alone it tours the seven offices; the first touch ends the tour and the globe is the visitor's.

   THE NUMBERS each carry a drawing OF the number rather than an icon beside it: thirty-one years is
   a line from 1995 to today, seven countries are seven lights, 250 projects are fifty squares of five.
   A reader who never reads the label still sees what kind of quantity it is.

   The scene's own hooks are kept exactly: #story, .glance, .gstats, .gstat, [data-count], #globeHost,
   #globeCv. The count-up, the stagger and the scroll drift in scenes/home.js still find them.

   ============================================================================ */

/* ---- the six drawings, second cut (Bazil: "look a bit messy dont u think?"). The first set mixed six
   shapes at six weights, with 7px captions inside them that nobody could read. They are one family
   now: the same 96 x 24 slot, the same grey, the same stroke, no text at all, and exactly one red part
   each. The label under the number says what is counted; the drawing only has to say what KIND of
   quantity it is. ---- */
const VizYears = () => (
  <svg className="gviz" viewBox="0 0 96 24" aria-hidden="true">
    {Array.from({ length: 16 }, (_, k) => <line key={k} x1={2 + k * 6.13} x2={2 + k * 6.13} y1="8" y2="16" className="gv-tick" />)}
    <line x1="2" y1="16" x2="94" y2="16" className="gv-red gv-draw" pathLength="1" />
    <circle cx="94" cy="16" r="3" className="gv-dot gv-pop" style={{ '--i': 8 }} />
  </svg>
)
const VizCountries = () => (
  <svg className="gviz" viewBox="0 0 96 24" aria-hidden="true">
    <line x1="6" y1="12" x2="90" y2="12" className="gv-base" />
    {Array.from({ length: 7 }, (_, k) => <circle key={k} cx={6 + k * 14} cy="12" r="3.4" className="gv-dot gv-pop" style={{ '--i': k }} />)}
  </svg>
)
const VizIso = () => (
  <svg className="gviz" viewBox="0 0 96 24" aria-hidden="true">
    {[0, 1, 2].map(k => (
      /* the translate lives on the OUTER group: a CSS animation's transform replaces an SVG transform
         attribute on the same element */
      <g key={k} transform={`translate(${2 + k * 32},2)`}>
        <g className="gv-pop" style={{ '--i': k * 2 }}>
          <rect x=".75" y=".75" width="18.5" height="18.5" className="gv-box" />
          <path d="M5.4 10.4 l3.2 3.2 l6 -6.6" className="gv-red" fill="none" />
        </g>
      </g>
    ))}
  </svg>
)
const VizIndustries = () => (
  <svg className="gviz" viewBox="0 0 96 24" aria-hidden="true">
    {Array.from({ length: 7 }, (_, k) => <rect key={k} x={2 + k * 13.4} y="4" width="9" height="16" className={'gv-bar gv-pop' + (k === 0 ? ' gv-bar-r' : '')} style={{ '--i': k }} />)}
  </svg>
)
const VizProjects = () => (
  <svg className="gviz" viewBox="0 0 96 24" aria-hidden="true">
    {Array.from({ length: 48 }, (_, k) => {
      const c = k % 16, r = Math.floor(k / 16)
      return <rect key={k} x={1 + c * 5.9} y={2 + r * 7} width="4.4" height="5" className={'gv-cell gv-pop' + (k >= 44 ? ' gv-cell-r' : '')} style={{ '--i': k * 0.2 }} />
    })}
  </svg>
)
const VizArea = () => (
  <svg className="gviz" viewBox="0 0 96 24" aria-hidden="true">
    <defs>
      <pattern id="gvHatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" className="gv-hatch" /></pattern>
      <clipPath id="gvWipe"><rect x="2" y="3" width="92" height="18" className="gv-wipe" /></clipPath>
    </defs>
    <rect x="2" y="3" width="92" height="18" fill="url(#gvHatch)" clipPath="url(#gvWipe)" />
    <rect x="2.75" y="3.75" width="90.5" height="16.5" className="gv-box" />
  </svg>
)

/* 22 Sep (Bazil, on the line drawings: "do better icons, quality better icons or isometric 3d animated"): each number
   carries its Hard Anodise mark again (Marks.jsx; the years mark is the new desk calendar in MarketMarks.jsx), on the
   same line as the number, its one red part lifting in turn (group-record.css). The line drawings stay in this file,
   unused, for a revert. */
const STATS = [
  { n: 31, label: 'Years building hi-tech facilities', V: RfYrs },
  { n: 7, label: 'Countries with an IAQ office', V: RfCtr },
  { n: 3, label: 'ISO certifications, held and audited', V: RfIso },
  { n: 7, label: 'Industries served', V: RfInd },
  { n: 250, suffix: '+', label: 'Projects completed', V: RfPrj },
  /* 22 Sep (Bazil: "put 1.05 mil"): the long figure ran past its column */
  { n: 1.05, dec: 2, suffix: '\u00a0mil', label: 'm² of cleanroom built', V: RfCln },
]

export default function GroupRecord() {
  const stats = useRef(null)

  /* the drawings come in once, when the numbers are on screen */
  useEffect(() => {
    const el = stats.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { el.classList.add('is-in'); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('is-in'); io.disconnect() } }, { threshold: 0.25 })
    io.observe(el)
    const bail = setTimeout(() => el.classList.add('is-in'), 3200)
    return () => { io.disconnect(); clearTimeout(bail) }
  }, [])


  return (
    <section className="glance gr" id="story">
      <div className="glance-in wrap">
        <div className="glance-head">
          {/* 23 Sep (Bazil: "this style should be the official say in one line or something about IAQ, don't be
              dorky like 6 numbers"): the heading counted the cards instead of saying anything. It is IAQ's own
              descriptor now, the one the footer and the company profile both carry, with the founding year on it. */}
          {/* 24 Sep (Bazil: "no , and ."): no comma, no full stop */}
          <h2>Total facility solutions <em>engineered since 1995</em></h2>
        </div>

        <div className="glance-body">
          {/* 23 Sep (Bazil: "more direct, don't tell them to pick a country", "put a strong statement that gains
              trust instead"): the lede is the claim IAQ can stand behind, not an instruction to play with the globe.
              Every fact in it is one the site already carries: 1995, seven countries, the three ISO certificates and
              the single accountable team from design to handover. */}
          {/* 23 Sep (Bazil: "not too long"): four lines cut to two. 1995 moved into the heading and the three
              ISO certificates are already a card in this block, so neither is said twice. */}
          <p className="lede">
            Cleanrooms, dry rooms and the systems that hold them in spec, for the facilities that must hold their class
            every day of production. One accountable team from design to handover, in seven countries.
          </p>
          {/* Bazil, 21 Sep: "number and icons same line". The drawing and the number share one row, the
              label sits under both, and there is no card round them. */}
          <div className="gstats mk-stage" ref={stats}>
            {STATS.map(({ n, dec, suffix, label, V }) => (
              <div className="gstat" data-reveal="" key={label}>
                <div className="grow">
                  <V className="gr-mk" />
                  <div className="num"><span data-count={n} data-dec={dec || undefined}>0</span>{suffix}</div>
                </div>
                <div className="lab">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="globe-col">
          <div className="globe-host" id="globeHost"><canvas id="globeCv"></canvas></div>

          {/* 22 Sep (Bazil, on the office line under the globe: "remove"): the dock is gone. The chip
              on the globe turns red when its office is in focus, and that is the whole readout. */}
        </div>
      </div>
    </section>
  )
}
