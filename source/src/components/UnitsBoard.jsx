import React from 'react'
import { Link } from 'react-router-dom'
import Icon from './FlowIcon.jsx'
import { UNITS } from '../data/business.js'
import { LIFE } from '../data/codex.js'

/* ============================================================================
   UnitsBoard · the three business units as one board (24 Sep 2026, Bazil: "both these need to combine"; 25 Sep: "can this
   look a lot better", "too messy", "don't want this side"). Three columns and nothing else: no label column, each
   cell carries its own small caption. The short read on top (picture, name, line, when to call, how it is bought,
   the page); Read more opens the detailed rows in the same columns (how it works, drawn; what it is; what you buy;
   the six services; the work and its systems; term; markets; typical requests). Phones show one unit at a time.
   ============================================================================ */
/* 25 Sep (Bazil: "are these the best pictures to represent"): IAQ's own photographs (SharePoint, 17 Sep). EPC: a facility
   under construction from the air. PCU & TTI: the process utilities corridor of a cleanroom IAQ built. EFM: the plant at
   night, run and maintained. */
/* 21 Oct (IAQ feedback, Services overview · Building image: "Use approved generic imagery or an image with permission"):
   the three photographs above showed client sites (a fab under construction from the air, a client cleanroom, a client
   plant at night). Each unit now carries a generic picture generated in ChatGPT, with no client, site, sign or name in it:
   EPC, engineers reviewing drawings at a factory under construction; PCU & TTI, engineers in cleanroom suits checking a
   process utility valve panel in a sub-fab; EFM, a routine round in a chiller plant room. */
/* 22 Oct (IAQ: "they want to change" the three unit pictures): new generic stills generated in ChatGPT, dry matte floors,
   no client, site, sign or name. Then (Bazil: "i dont like process doing the work ... avoid making process work"): no one
   shown doing hands-on work, so how IAQ operates is never open to question. EPC, two engineers with a tablet in a finished,
   empty factory hall; PCU & TTI, a completed utility hookup along a row of tools, no people; EFM, engineers watching the
   plant's energy and chilled water trends in a control room, the chiller plant behind the glass. */
const PHOTO = { epc: '/assets/units/unit-card-epc-v3.webp', hookup: '/assets/units/unit-card-pcu-v3.webp', efm: '/assets/units/unit-card-efm-v2.webp' }
/* 26 Oct (IAQ review, NR, page 005: "Remove this section just replace with short description of each business units. And keep
   the open EPC, PCU & TTi and EFM button but rephrase to “Learn More About EPC”…"): each card is the picture, the unit's name and
   a short description (its `what` line in data/business.js, the one the Codex and the slides read), then "Learn more about
   EPC". The one-liner, "Call when", "Bought as" and the Read more fold that repeated the unit pages are off the board. */
/* 27 Oct (UI/UX sweep): one card per unit, its link inside it, so on a phone each card stacks whole; the phone tabs that
   picked a unit are gone (they no longer hid anything and the links sat in a separate row under all three cards) */
export default function UnitsBoard() {
  return (
    <div className="sm-ub sm-ub3" aria-label="The three business units">
      {UNITS.map((u, i) => (
        <article className="sm-ub-cell sm-ub-head sm-ub-card" key={u.id} style={{ '--i': i }}>
          <div className="sm-uc-pic"><img src={PHOTO[u.id]} alt="" loading="lazy" decoding="async" /><span className="sm-ub-no">Unit {u.no}<i>{LIFE[i].k}</i></span></div>
          <h3><span className="sm-uc-mark" aria-hidden="true"><Icon name={u.icon} /></span><span className="sm-ub-nm">{u.short || u.name}<small>{u.id === 'hookup' ? u.name : u.full}</small></span></h3>
          <p className="sm-uc-desc">{u.what}</p>
          <Link className="sm-uc-go" to={u.route}>Learn more about {u.short || u.name} <i aria-hidden="true">&rarr;</i></Link>
        </article>
      ))}
    </div>
  )
}
