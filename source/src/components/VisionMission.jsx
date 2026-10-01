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
    /* 30 Sep, later (Bazil: "the visual looks fake and not like real and IAQ, please research carefully", "IAQ factory must
       have red line"): the generated pictures are gone. IAQ's own headquarters, photographed from the air (HQ Offices,
       TCDrone-0001): the real building, the red lines across its side wall, the IAQ sign at the gate */
    /* 1 Oct (Bazil: "the vision is so lame, before was better, must look good though and have that line, IAQ logo"): the
       sunrise plant again, made natural, with IAQ's wordmark on the facade and one red line along the roof edge, as IAQ's
       own buildings carry. Generated from IAQ's drone photograph of the plant, so it is labelled Representation */
    img: '/assets/iaq/vm-vision-iaq-plant.webp?v=4k', pos: '50% 50%', rep: true,
    alt: 'A hi-tech plant with the IAQ wordmark on its facade, from the air at sunrise',
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
    /* 30 Sep, later: IAQ's own team on site, in IAQ vests, reviewing the drawing together (Site Photos IMG_9354); the chilled
       water plant pair (IMG_9476) is kept as vm-mission-plant-real */
    img: '/assets/iaq/vm-mission-team-real.webp', pos: '50% 55%',
    alt: 'IAQ engineers on site reviewing a drawing together',
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
              <span className="vm-photo" aria-hidden="true"><img src={c.img} alt="" style={{ objectPosition: c.pos }} loading="lazy" decoding="async" />{c.rep && <span className="vm-rep">Representation</span>}</span>
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
                {/* 25 Sep, night (Bazil: "no need this numbers"): the two fact tiles are gone. 30 Sep (Bazil: "remove these part",
                    "remove this as well"): the note under the statement and the link under it are gone; the card ends on the statement */}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
