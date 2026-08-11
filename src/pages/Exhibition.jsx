import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import PageHead from '../components/PageHead.jsx'
import Related from '../components/Related.jsx'
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
    p: 'The stand team signs in. Nobody navigates the public site on a booth screen in front of a visitor.',
  },
  {
    icon: 'grid', k: 'Sequencing',
    h: 'Playlists by day and by audience',
    p: 'A different run for day one than for day three, and a different run for an engineer than for a partner or a journalist.',
  },
  {
    icon: 'cycle', k: 'Unattended',
    h: 'Loop mode',
    p: 'Runs itself between conversations, so the screen is never idle and never showing a desktop.',
  },
  {
    icon: 'compass', k: 'Attended',
    h: 'Live present mode',
    p: 'The presenter drives it, jumping straight to the stop the conversation has arrived at.',
  },
  {
    icon: 'server', k: 'Resilience',
    h: 'Offline fallback',
    p: 'The whole system runs from the stand machine with no network, because hall wifi cannot be relied on.',
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
    tag: 'The 30 second stand loop cut from the corporate film · supplied by IAQ, film not yet delivered',
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
    p: 'One clear next step per audience, captured on the stand rather than remembered afterwards.',
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
    p: 'One sheet per discipline and per business model, sized to hand over without a follow up call to explain it.',
    tag: 'Approved capability copy per discipline and business model · supplied by IAQ, produced by Brand Method',
  },
  {
    icon: 'folder', h: 'Project sheets',
    p: 'A sheet per reference project, only for the projects cleared for publication.',
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
        lede="A controlled walkthrough of IAQ capability for exhibitions and partner briefings. Built for the Germany stand, reusable at every show after it, and designed to keep working when the hall network does not."
      />

      <section className="pg-sec" aria-labelledby="ex-entry-h">
        <div className="pg-in">
          <div className="ghead">
            <div>
              <span className="pg-k">01 / Entry</span>
              <h2 id="ex-entry-h">How the portal runs on the floor</h2>
              <p>The mechanism is fixed. Six behaviours, each one answering something that goes wrong on a stand: an idle screen, the wrong pitch for the visitor in front of you, or a dead connection.</p>
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
              <p>The route is set. What plays at each stop is not, because it depends on the project list and the corporate film, and neither has been delivered. Each stop states exactly what it is waiting for.</p>
            </div>
            <span className="pg-tag b">Content outstanding</span>
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
            <Link to="/services">capabilities</Link> and the{' '}
            <Link to="/projects">project registry</Link>, so the stand and the site never tell two different stories.
          </p>
        </div>
      </section>

      <section className="pg-sec" aria-labelledby="ex-dl-h">
        <div className="pg-in">
          <div className="ghead">
            <div>
              <span className="pg-k">03 / Downloads</span>
              <h2 id="ex-dl-h">What the visitor leaves with</h2>
              <p>Every asset held in one place and versioned, so the stand team hands over the current file rather than whatever happens to be on the laptop.</p>
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
            <li>Versioned: one current file per asset, older releases retired rather than left in the folder.</li>
            <li>Offline first: every download sits on the stand machine before the doors open.</li>
            <li>Tracked: what was handed over and to whom, so the follow up is specific.</li>
          </ul>
        </div>
      </section>

      <section className="pg-cta">
        <div className="pg-in">
          <div>
            <span className="eyebrow">Exhibition access</span>
            <h2>Request access to the portal</h2>
            <p>Access is issued to the stand team and to partners briefed ahead of a show. Tell us which event, and who needs a login.</p>
          </div>
          <div className="pg-cta-act">
            <Link className="cta" to="/contact">Request access</Link>
            <div className="gfacts">
              <div><span>Modes</span><b>Loop and live present</b></div>
              <div><span>Network</span><b>Offline fallback on the stand machine</b></div>
              <div><span>Playlists</span><b>Per day and per audience</b></div>
              <div><span>Reuse</span><b>Every show after Germany</b></div>
            </div>
          </div>
        </div>
      </section>

      <Related from="exhibition" />
      <Footer note="Digital Exhibition concept · Brand Method" />
    </>
  )
}
