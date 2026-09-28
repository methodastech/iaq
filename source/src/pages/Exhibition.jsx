import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import PageHead from '../components/PageHead.jsx'
import Icon from '../components/FlowIcon.jsx'
import '../styles/pages.css'
import '../styles/gated.css'

/* ============================================================================
   06 · Digital Exhibition · /exhibition · status: new

   Partial content. The mechanism is fully specified in the sources (team login,
   per day and per audience playlists, loop mode, live present mode, offline
   fallback on the stand machine, and a 30 second loop cut from the corporate
   film), so all of that is stated as fact.

   The playlist content itself does not exist. It depends on the project list and
   on the film, neither of which is delivered, so every guided stop and every
   download is a labelled placeholder slot rather than invented content. No stand
   date, event name, project or asset is fabricated here, and the commercial
   terms behind the portal stay off the page.
   ============================================================================ */

const MODES = [
  {
    icon: 'shield', k: 'Access',
    h: 'Team login',
    p: 'The stand team signs in. The booth screen runs the portal built for the floor rather than the public site.',
  },
  {
    icon: 'grid', k: 'Sequencing',
    h: 'Playlists by day and by audience',
    p: 'A different run for day one than for day three, and a different run for an engineer than for a partner or a journalist.',
  },
  {
    icon: 'cycle', k: 'Unattended',
    h: 'Loop mode',
    p: 'Runs itself between conversations, so the screen keeps showing the work with or without a presenter.',
  },
  {
    icon: 'compass', k: 'Attended',
    h: 'Live present mode',
    p: 'The presenter drives it, jumping straight to the stop the conversation has arrived at.',
  },
  {
    icon: 'server', k: 'Resilience',
    h: 'Offline fallback',
    p: 'The whole system runs from the stand machine with no network, so the stand never depends on hall wifi.',
  },
  {
    icon: 'cube', k: 'Reuse',
    h: 'Built once, used at every show',
    p: 'Assembled for the Germany stand and reusable at every exhibition after it, with the playlist swapped rather than the system rebuilt.',
  },
]

const STOPS = [
  {
    n: '01', k: 'Attract',
    h: 'The opening loop',
    p: 'The piece that stops someone in the aisle before a word is said. Runs silent, reads at four metres.',
    tag: 'The 30 second stand loop cut from the corporate film · supplied by IAQ, built as soon as the film arrives',
  },
  {
    n: '02', k: 'Frame',
    h: 'What IAQ actually does',
    p: 'The delivery cycle told in one pass, so a visitor understands the span from design to maintenance before any project is shown.',
    tag: 'Which disciplines lead per audience, and the order they run in · agreed with IAQ before the show',
  },
  {
    n: '03', k: 'Qualify',
    h: 'The market that applies to you',
    p: 'The visitor self identifies, and the stand run narrows to the sector they build in.',
    tag: 'Which of the seven markets lead on the stand, and in what priority · confirmed by IAQ',
  },
  {
    n: '04', k: 'Prove',
    h: 'The work behind the claim',
    p: 'Projects shown at the scale that settles the question, with the numbers that matter to that sector.',
    tag: 'The project selection, images and written publish permissions, from the outstanding project list · supplied by IAQ',
  },
  {
    n: '05', k: 'Convert',
    h: 'The ask, and the follow up',
    p: 'One clear next step per audience, captured on the stand and carried straight into follow up.',
    tag: 'The ask per audience, the capture method and who follows up · agreed with IAQ',
  },
]

const DOWNLOADS = [
  {
    icon: 'file', h: 'Company profile',
    p: 'The print ready profile, handed over as a file at the stand and mailed afterwards from the same link.',
    tag: 'Company profile PDF, current release · supplied by IAQ',
  },
  {
    icon: 'compass', h: 'Capability one pagers',
    p: 'One sheet per discipline and per business model, sized to explain itself the moment it is handed over.',
    tag: 'Approved capability copy per discipline and business model · supplied by IAQ, produced by Brand Method',
  },
  {
    icon: 'folder', h: 'Project sheets',
    p: 'A sheet per reference project, cleared for publication and ready to hand over.',
    tag: 'Project sheets with images and written publish permissions · supplied by IAQ',
  },
  {
    icon: 'press', h: 'Film and stand assets',
    p: 'The master film, the stand loop and the still library, in the formats the booth hardware needs.',
    tag: 'Corporate film master, the 30 second loop and the still library · supplied by IAQ',
  },
]

export default function Exhibition() {
  useEffect(() => { document.title = 'IAQ Group · Digital Exhibition · Brand Method' }, [])

  return (
    <>
      <Nav />

      <PageHead
        eyebrow="Digital Exhibition"
        title={<>The stand, <em>run like a system.</em></>}
        lede="A controlled walkthrough of IAQ capability for exhibitions and partner briefings. Built for the Germany stand, reusable at every show, and able to run without the hall network."
      />

      <section className="pg-sec" aria-labelledby="ex-entry-h">
        <div className="pg-in">
          <div className="ghead">
            <div>
              <span className="pg-k">01 / Entry</span>
              <h2 id="ex-entry-h">How the portal runs on the floor</h2>
              <p>Six behaviours, each doing one job on the stand.</p>
            </div>
            <span className="pg-tag">Access by login</span>
          </div>

          <div className="gtiles">
            {MODES.map(m => (
              <div className="gtile" key={m.h}>
                <span className="gk"><Icon name={m.icon} />{m.k}</span>
                <h3>{m.h}</h3>
                <p>{m.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pg-sec calm" aria-labelledby="ex-stops-h">
        <div className="pg-in">
          <div className="ghead">
            <div>
              <span className="pg-k">02 / Guided stops</span>
              <h2 id="ex-stops-h">Five stops, in the order a conversation takes</h2>
              <p>The route is set. Each stop runs on IAQ&rsquo;s project list and corporate film, and names exactly what it needs.</p>
            </div>
            <span className="pg-tag b">Content to be supplied</span>
          </div>

          <div className="gstops">
            {STOPS.map(s => (
              <article className="gstop" key={s.n}>
                <div className="gstop-n"><b>{s.n}</b><span>{s.k}</span></div>
                <div className="gstop-b">
                  <h3>{s.h}</h3>
                  <p>{s.p}</p>
                  <span className="pg-slot-tag">{s.tag}</span>
                </div>
              </article>
            ))}
          </div>

          <p className="pg-note">
            Stops two, three and four run on the same material as{' '}
            <Link to="/services">the Services pages</Link> and the{' '}
            <Link to="/projects">project registry</Link>, so the stand and the site tell a single, consistent story.
          </p>
        </div>
      </section>

      <section className="pg-sec" aria-labelledby="ex-dl-h">
        <div className="pg-in">
          <div className="ghead">
            <div>
              <span className="pg-k">03 / Downloads</span>
              <h2 id="ex-dl-h">What the visitor leaves with</h2>
              <p>Every asset held in one place and versioned, so the stand team hands over the current file, every time, to every visitor.</p>
            </div>
            <span className="pg-tag b">Assets outstanding</span>
          </div>

          <div className="gslots">
            {DOWNLOADS.map(d => (
              <div className="pg-slot gslot" key={d.h}>
                <div className="pg-slot-in">
                  <span className="gslot-badge"><Icon name={d.icon} /></span>
                  <b>{d.h}</b>
                  <p>{d.p}</p>
                  <span className="pg-slot-tag">{d.tag}</span>
                </div>
              </div>
            ))}
          </div>

          <ul className="pg-list" style={{ marginTop: '24px' }}>
            <li>Versioned: one current file per asset, with older releases retired as soon as they are superseded.</li>
            <li>Offline first: every download sits on the stand machine before the doors open.</li>
            <li>Tracked: what was handed over and to whom, so the follow up is specific.</li>
          </ul>
        </div>
      </section>
      <ClosingBand note="Digital Exhibition concept · Brand Method" />
    </>
  )
}
