import React from 'react'
import { Link } from 'react-router-dom'
import Icon from './FlowIcon.jsx'
import { LINE_MARKS } from './HeroLineMarks.jsx'
import IsoIcon from './IsoIcon.jsx'

/* ============================================================================
   VISION & MISSION, rebuilt 17 Sep 2026.

   The client, on the feedback deck: "Maybe Vision and Mission can be put side by side in a box and
   make it interesting when hovering to each box it will have an effect (suggestion) rather than
   having animated image but somehow not up to our expectation."

   So the two canvas drawings are gone (the horizon and the flow: they were quiet, and after three
   rebuilds they still were not landing), and the statements stand as two boxes, side by side,
   equal in weight because the company gives them equal weight.

   The hover is the section's one moving part, and it is the same move on both boxes: the
   photograph behind the card comes up out of its grey, the card lifts, its mark turns red and the
   way through slides. Nothing is hidden until hover: every word is readable at rest, which is why
   the effect can be as strong as it is.

   It also answers the other note on this page, that it is "just to WHITE": at rest each box
   carries its photograph at a low, cool level, so the section has ground and colour before anyone
   touches it.
   ============================================================================ */

const CARDS = [
  {
    k: 'Vision', icon: 'compass', iso: 'vision', id: 'vmVision', kick: 'Where IAQ is going', facts: [['7', 'Countries with an IAQ office'], ['31', 'Years building hi-tech facilities']],
    /* 22 Sep: IAQ's own drone photograph of a plant it delivered, at dusk (was a generated campus) */
    img: '/assets/iaq/plant-dusk-03.webp', pos: '50% 58%',
    alt: 'A hi-tech plant delivered by IAQ, photographed from the air at dusk',
    lead: <>To be a <b>regional facility solutions provider with engineering excellence</b>, facilitating technological innovation and advancement in quality of life.</>,
    note: 'Seven countries, and still expanding.',
    to: '/global-presence', cta: 'Where IAQ operates',
  },
  {
    k: 'Mission', icon: 'flag', iso: 'mission', id: 'vmMission', kick: 'What IAQ does every day', facts: [['6', 'Services under one team'], ['3', 'Business units']],
    /* 25 Sep: IAQ's own team photo went in first (DSCN6580), then Bazil: "get a better picture for the mission": the
       lithography bay IAQ built, under its yellow light (Cleanroom Photos/IMG_8566), the strongest picture in the share */
    /* 25 Sep, 04:50 (Bazil: "mission picture should be people working"): IAQ's own workforce on site, helmets on, at
       the World OSH Day briefing (Photos from past event, OSH Day) */
    img: '/assets/iaq/ev-osh-crowd.webp', pos: '50% 42%',
    alt: 'IAQ workers in helmets and vests gathered on site',
    lead: <>Providing <b>innovative and sustainable facility and engineering solutions</b> that benefit our clients and stakeholders, driven by our leadership, employees, and partners globally.</>,
    note: 'One accountable team, from the first drawing to the life of the facility.',
    to: '/about/commitment', cta: 'How it is held',
  },
]

export default function VisionMission() {
  return (
    <section className="vm" id="vision">
      <div className="wrap">
        <span className="eyebrow">Vision &amp; mission</span>
        {/* 25 Sep (Bazil: "just what is IAQ", then "better title please") */}
        <h2 className="vm-h">What IAQ stands for, <em>and where it is going.</em></h2>

        <div className="vm-cards">
          {/* 25 Sep, later (Bazil, with the units board and a glass dashboard as references: "do something better
              like their long cards", "like pic 2 but no round corners"): a tall card, IAQ's photograph filling it, a
              shade rising from the foot, and a frosted panel over the lower half carrying the mark on a white tile, the
              name, the statement and two fact tiles. Square corners throughout. */}
          {CARDS.map(c => (
            <article className="vm-card vm-glass" id={c.id} key={c.k}>
              <span className="vm-photo" aria-hidden="true"><img src={c.img} alt="" style={{ objectPosition: c.pos }} loading="lazy" decoding="async" /></span>
              <span className="vm-shade" aria-hidden="true" />
              <span className="vm-panel">
                <span className="vm-top">
                  {/* 25 Sep, night (Bazil: "make sure better icon for vision and mission"): the house line marks, a compass for
                      where IAQ is going and a flag for what it does every day, in place of the isometric pair */}
                  {/* 25 Sep (Bazil: "use this icons style, this is our official icon style", the hero line set): drawn in
                      HeroLineMarks.jsx, ink on the white tile */}
                  <span className="vm-mark" aria-hidden="true">{(() => { const M = LINE_MARKS[c.iso] || LINE_MARKS.vision; return <M /> })()}</span>
                  <span className="vm-k">{c.k}</span>
                  <span className="vm-kick">{c.kick}</span>
                </span>
                <blockquote>{c.lead}</blockquote>
                <span className="vm-note">{c.note}</span>
                {/* 25 Sep, night (Bazil: "no need this numbers"): the two fact tiles are gone */}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
