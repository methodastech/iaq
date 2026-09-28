import React, { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import Icon from '../components/FlowIcon.jsx'
import FabStory from '../components/codex/FabStory.jsx'
import { IsoFab, isoH, DotMap, mapH } from '../components/booth/Art.jsx'
import { EVENT, MESSAGE } from '../data/booth.js'
import { SERVICES, UNITS } from '../data/codex.js'
import { useBrandFonts } from '../lib/brandFonts.js'
import '../styles/pages.css'
import '../styles/codex-parts.css'
import '../styles/semicon.css'

/* ============================================================================
   /semicon · the booth page (22 Sep 2026, for IAQ approval).

   The page the booth's code opens (counter, flyer, screen, every post). Plan: src/data/booth.js ONLINE.
   One argument, the booth headline; one action, book a meeting, which opens the contact form with the
   reason already written. Then what a visitor scanned for: IAQ's own Revit model of a fab built layer
   by layer (the Codex FabStory, recoloured to the booth palette), the three units, the six services,
   and the team in Dresden.

   Facts only: the event dates and venue from Messe München; the units, services and offices from the
   site's own data. The stand number is not known yet, so it says so. The partner stand is not named
   here until IAQ clears it. Review build only until IAQ signs off (main.jsx).
   ============================================================================ */

const SVC_ROUTE = { design: '/services/all#design', procure: '/services/all#procurement', construct: '/services/all#construction', commission: '/services/all#commissioning', maintain: '/services/all#maintenance', hookup: '/services/tool-installation' }
const UNIT_LINE = { epc: 'Builds the facility, under one contract.', hookup: 'Re-equips a live fab: the process utilities, and every tool connected.', efm: 'Runs and maintains it, and cuts the energy bill.' }
const MEET = { service: 'Not sure yet', message: 'We would like to meet the IAQ team at SEMICON Europa in Munich (10 to 13 November 2026). The project, and the days that suit us: ' }

/* a calendar entry for the four days, made in the browser */
function icsHref() {
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//IAQ Group//SEMICON Europa 2026//EN', 'BEGIN:VEVENT', 'UID:semicon-europa-2026@iaqtechnology.com.my',
    'DTSTART;VALUE=DATE:20261110', 'DTEND;VALUE=DATE:20261114', 'SUMMARY:IAQ at SEMICON Europa 2026', 'LOCATION:Messe München\\, Munich\\, Germany',
    'DESCRIPTION:Meet the IAQ team on the stand. Stand number to be announced: iaqtechnology.com.my/semicon', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics)
}

export default function Semicon() {
  useBrandFonts()
  useEffect(() => { document.title = 'IAQ Group · SEMICON Europa 2026 · Munich' }, [])
  const ics = useMemo(icsHref, [])
  const meet = () => { try { sessionStorage.setItem('iaq.service', MEET.service); sessionStorage.setItem('iaq.message', MEET.message) } catch { /* private mode */ } }
  const [h1, h2] = MESSAGE.options[0].h.split(', ')
  const fw = 620

  return (
    <>
      <Nav />

      <header className="sm-hero">
        <div className="pg-in sm-hero-in">
          <div className="sm-hero-copy">
            <p className="sm-kick">SEMICON Europa 2026 · Munich</p>
            <h1>{h1},<br /><em>{h2}</em></h1>
            <p className="sm-lede">IAQ designs, builds and commissions cleanrooms and the whole hi-tech facility around them, then hooks up the tools inside. Meet the IAQ team on the stand in Munich.</p>
            <dl className="sm-facts">
              <div><dt><Icon name="calendar" /></dt><dd><b>10 to 13 November 2026</b><span>Tuesday to Friday</span></dd></div>
              <div><dt><Icon name="pin" /></dt><dd><b>Messe München</b><span>Munich, Germany. {EVENT.with}</span></dd></div>
              <div><dt><Icon name="grid" /></dt><dd><b>Stand to be announced</b><span>This page carries it the day it is confirmed</span></dd></div>
            </dl>
            <div className="sm-acts">
              <Link className="cta" to="/contact" state={MEET} onClick={meet}>Book a meeting</Link>
              <a className="sm-ghost" href={ics} download="IAQ-SEMICON-Europa-2026.ics"><Icon name="calendar" />Add the dates to your calendar</a>
            </div>
          </div>
          <figure className="sm-hero-art" aria-label="IAQ’s exploded drawing of a fab: roof and plant, the cleanroom, the fab floor and the sub-fab">
            <svg viewBox={`0 0 ${fw} ${Math.round(isoH(fw))}`} aria-hidden="true"><IsoFab x={0} y={0} w={fw} /></svg>
          </figure>
        </div>
      </header>

      <section className="sm-sec sm-story">
        <div className="pg-in">
          <div className="sm-h">
            <h2>A fab, built <em>layer by layer.</em></h2>
            <p>IAQ’s own model of a fab, from the piles to the running plant. Play it, or drag through it: each moment says what is being built and which IAQ unit builds it.</p>
          </div>
          <div className="cx3 sm-fs"><FabStory /></div>
        </div>
      </section>

      <section className="sm-sec">
        <div className="pg-in">
          <div className="sm-h">
            <h2>Three units, <em>one accountable team.</em></h2>
            <p>Bought together or one at a time, under one contract.</p>
          </div>
          <div className="sm-units">
            {UNITS.map(u => (
              <Link className="sm-unit" to={u.route} key={u.id}>
                <span className="sm-ic"><Icon name={u.icon} /></span>
                <b>{u.short || u.name}</b>
                <small>{u.short ? u.name : u.full}</small>
                <p>{UNIT_LINE[u.id] || u.line}</p>
                <span className="sm-more">See the unit<Icon name="arrow" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sm-sec sm-svc">
        <div className="pg-in">
          <div className="sm-h">
            <h2>Six services, <em>from the first drawing.</em></h2>
            <p>The full cycle, so one team answers for the facility working as intended.</p>
          </div>
          <ol className="sm-svcs">
            {SERVICES.map(s => (
              <li key={s.id}>
                <Link to={SVC_ROUTE[s.id]}>
                  <span className="sm-n">{s.n}</span>
                  <span className="sm-ic"><Icon name={s.icon} /></span>
                  <b>{s.name}</b>
                  <p>{s.line}</p>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sm-sec sm-eu">
        <div className="pg-in sm-eu-in">
          <div>
            <h2>In Europe, <em>a team in Dresden.</em></h2>
            <p className="sm-p">Offices in seven countries. In Germany, IAQ Engineering (DE) GmbH works from Dresden, a short trip from Munich and from Europe’s growing chip cluster.</p>
            <div className="sm-office">
              <b>IAQ Engineering (DE) GmbH</b>
              <span>8. OG, Budapester Straße 5, 01069 Dresden, Germany</span>
              <a href="tel:+4935143879529">+49 351 4387 9529</a>
            </div>
            <div className="sm-office">
              <b>Headquarters</b>
              <span>Shah Alam, Malaysia</span>
              <a href="mailto:business@iaqtechnology.com.my">business@iaqtechnology.com.my</a>
            </div>
            <Link className="cta" to="/contact" state={MEET} onClick={meet}>Book a meeting in Munich</Link>
          </div>
          <figure className="sm-map" aria-label="Map of IAQ’s seven offices: Malaysia, Singapore, Germany, India, Sweden, the United States and Ireland">
            <svg className="sm-map-world" viewBox={`0 0 980 ${Math.round(mapH(900)) + 10}`} aria-hidden="true"><DotMap x={0} y={0} w={900} label={1.7} /></svg>
            <svg className="sm-map-eu" viewBox="322 10 236 100" aria-hidden="true"><DotMap x={0} y={0} w={900} label={0.9} /></svg>
          </figure>
        </div>
      </section>

      <ClosingBand note="SEMICON Europa booth page · for IAQ approval · Brand Method" />
    </>
  )
}
