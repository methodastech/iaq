import React, { useEffect, useState } from 'react'
import { LAUNCH, owed } from '../lib/launch.js'
import { Link, useLocation } from 'react-router-dom'
import { submit, OWNERS } from '../lib/enquiry.js'
import * as SL from '../lib/shortlist.js'
import { jargon } from '../lib/jargon.jsx'
import { cmsProjects, live } from '../lib/cms.js'
const PROJECTS = live(cmsProjects)
import Nav from '../components/Nav.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import Icon from '../components/FlowIcon.jsx'
import Flag from '../components/Flag.jsx'
import initContact from '../scenes/contact.js'
import '../styles/contact.css'

/* Offices, one card per country (client, 4 Sep: "office every country, phone no, image of the
   office"). 10 Sep (client review): representation visuals on every office until the October
   shoot, drawn from the site's own photography and labelled as such; interior design visuals
   follow once the interiors are done. Addresses are the Discovery questionnaire answers (A1.5 / C5, Nabilah). Phones and
   photographs beyond HQ, and the Penang, Sweden and USA street addresses, are still on IAQ's open
   action, so those fields are labelled slots rather than invented numbers.
   15 Sep (Bazil: "showcasing the interior or location of offices"): where IAQ itself published a
   photograph of the office, it replaces the representation and the label goes. Sources, also in
   public/assets/culture/SOURCES.md:
     · Shah Alam: HQ entrance at Chinese New Year, IAQ newsroom, 21 Feb 2024 ("a jubilant celebration at our headquarters")
       https://iaqtechnology.com.my/iaq-welcomes-the-year-of-the-dragon-with-festive-cheer-and-excitement/
     · Penang: branch grand opening, IAQ newsroom, 23 Jul 2025
       https://iaqtechnology.com.my/iaq-opens-official-branch-office-in-penang-strengthening-commitment-to-the-northern-region/
     · Singapore: IAQ Engineering (SG) Pte. Ltd. office opening, IAQ Group LinkedIn, 4 Aug 2026
       https://www.linkedin.com/posts/iaq-group-of-companies_iaqgroup-iaqengineering-iaqupdate-activity-7490303633897742336-cEKT
     · India: office reception, IAQ Group LinkedIn, 14 Sep 2026 (plaque: IAQ Solutions India Pvt. Ltd., 12 Sep 2026)
       https://www.linkedin.com/posts/iaq-group-of-companies_iaqgroup-iaqengineering-iaqindia-activity-7505227747535777792-AkeL
     · Phones: Singapore "+65-6277 5240" and Dresden "+49 351 4387 9529", IAQ's contact page (modified 10 Jun 2026)
       https://iaqtechnology.com.my/contact-us/
   Dresden, Sweden, USA and Ireland have no IAQ-published photograph. They show the lead's representation
   interiors (public/assets/culture/offices/SOURCES.md), captioned as representations until IAQ sends photographs. */
/* 30 Sep (client, office list: "Penang Address: 9, Lorong Valdor Jaya 2 ...", "Singapore Second Office Change to IAQ Utility
   Solutions (SG) Pte Ltd", "Sweden Skellefteå Company Address: Trädgårdsgatan 13-15 ...", "Ireland Dublin Company Address:
   Block A, Georges Quay Plaza ..."): the Penang, Sweden and Ireland street addresses are in, Sweden and Ireland name their
   cities, and the second Singapore office carries its company's name in place of "Second office" (ent2). The client's
   "Pulang Pinang" is written Pulau Pinang. */
const REP_CAP = LAUNCH ? 'Representation image' : 'Representation image. Photograph of this office supplied by IAQ.'
const OFFICES = [
  /* 17 Sep: IAQ's own photograph of the headquarters (SharePoint, HQ Offices, TianChad 4595) */
  { id: 'my-hq', img: '/assets/iaq/hq-front-4595.webp', cap: 'Headquarters, Shah Alam', cc: 'MY', country: 'Malaysia', city: 'Shah Alam', hq: true, entity: 'IAQ Technology International Sdn. Bhd.',
    addr: 'No. 12, Jalan Sungai Jeluh 32/192, Kawasan Perindustrian Kemuning, Seksyen 32, 40460 Shah Alam, Selangor, Malaysia',
    tel: '+603 5124 8319', hours: 'Mon to Fri · 9:00 to 18:00 · GMT +8' },
  { id: 'my-penang', img: '/assets/newsroom/penang-branch-grand-opening-2025.webp', cap: 'Penang branch opening, July 2025', cc: 'MY', country: 'Malaysia', city: 'Penang', entity: 'IAQ Technology International Sdn. Bhd. · northern branch, opened July 2025',
    addr: '9, Lorong Valdor Jaya 2, Kawasan Perindustrian Valdor, 14200 Jawi, Pulau Pinang, Malaysia', hours: 'Mon to Fri · 9:00 to 18:00 · GMT +8' },
  { id: 'sg', img: '/assets/culture/sg-office-boardroom-2026.webp', cap: 'IAQ Engineering (SG) office, August 2026', cc: 'SG', country: 'Singapore', city: 'Singapore', entity: 'IAQ Engineering (SG) Pte. Ltd.',
    addr: '1 Tai Seng Avenue #04-03, Tai Seng Exchange, Singapore 536464',
    /* 25 Sep: the second Singapore office keeps its address; the entity name came off (client, DV3 A2.1: subsidiary names are not disclosed) */
    addr2: '4338 Alexandra Technopark, Tower B, #06-12, Singapore 119968', ent2: 'IAQ Utility Solutions (SG) Pte. Ltd.',
    tel: '+65 6277 5240', hours: 'Mon to Fri · 9:00 to 18:00 · GMT +8' },
  { id: 'de', img: '/assets/culture/offices/de.webp', rep: true, cap: REP_CAP, cc: 'DE', country: 'Germany', city: 'Dresden', entity: 'IAQ Engineering (DE) GmbH',
    addr: '8. OG, Budapester Straße 5, 01069 Dresden, Germany', tel: '+49 351 4387 9529', hours: 'Mon to Fri · 9:00 to 17:00 · CET' },
  { id: 'in', img: '/assets/culture/india-office-reception-2026.webp', cap: 'Reception, India office, September 2026', cc: 'IN', country: 'India', city: 'Ahmedabad', entity: 'IAQ Solutions India Private Limited',
    addr: '906, Satymev Eminence, Science City Road, Sola, Ahmedabad 380060, India', hours: 'Mon to Fri · 9:30 to 18:00 · IST' },
  { id: 'se', img: '/assets/culture/offices/se.webp', rep: true, cap: REP_CAP, cc: 'SE', country: 'Sweden', city: 'Skellefteå', entity: 'IAQ Group · Nordic office',
    addr: 'Trädgårdsgatan 13-15, 931 31 Skellefteå, Sweden', hours: 'Mon to Fri · 9:00 to 17:00 · CET' },
  /* 30 Sep ("remove usa on this page"): the US office card is off the Contact page; other pages keep their mentions */
  /* announced on the 10 Sep 2026 review (Nabilah: seven offices including Ireland); details to follow */
  { id: 'ie', img: '/assets/culture/offices/ie.webp', rep: true, cap: REP_CAP, cc: 'IE', country: 'Ireland', city: 'Dublin', entity: 'IAQ Group · Ireland office',
    addr: 'Block A, Georges Quay Plaza, George’s Quay, Dublin 2, Ireland', hours: 'Mon to Fri · 9:00 to 17:00 · GMT' },
]

/* 22 Sep (Bazil: "put the country flags", "or you know, the sub country"): the list is by country
   now, with each country's offices inside it. Malaysia holds the headquarters and Penang; Singapore
   holds its two companies. The order is the order of OFFICES. */
const COUNTRIES = OFFICES.reduce((acc, o) => {
  const g = acc.find(x => x.cc === o.cc)
  if (g) g.offices.push(o); else acc.push({ cc: o.cc, country: o.country, offices: [o] })
  return acc
}, [])
const EMAIL = 'business@iaqtechnology.com.my'
const HQ_ADDR = 'No. 12, Jalan Sungai Jeluh 32/192, Kawasan Perindustrian Kemuning, Seksyen 32, 40460 Shah Alam, Selangor, Malaysia'
const DIRECTIONS = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('IAQ Technology International Sdn. Bhd., Shah Alam')
const INTENTS = [
  { k: 'project', icon: 'crane', t: 'Start a project', d: 'Feasibility, tender, request for quotation (RFQ) or a full EPCC brief' },
  { k: 'career', icon: 'people', t: 'Join the team', d: 'Open roles across four departments' },
  { k: 'media', icon: 'press', t: 'Media or partnership', d: 'Press, investor and partner enquiries' },
]

export default function Contact() {
  const [intent, setIntent] = useState('project')
  /* 21 Sep: the closing band asks what is being built and hands the answer over. Router state first,
     then the sessionStorage copy (read once, then cleared, so it never sticks to a later visit). */
  const loc = useLocation()
  const [preService] = useState(() => {
    let v = (loc.state && loc.state.service) || ''
    try { if (!v) v = sessionStorage.getItem('iaq.service') || ''; sessionStorage.removeItem('iaq.service') } catch { /* private mode */ }
    return v
  })
  /* 22 Sep: the booth page (/semicon) hands over the reason for the meeting the same way */
  const [preMessage] = useState(() => {
    let v = (loc.state && loc.state.message) || ''
    try { if (!v) v = sessionStorage.getItem('iaq.message') || ''; sessionStorage.removeItem('iaq.message') } catch { /* private mode */ }
    return v
  })
  const [state, setState] = useState({ status: 'idle' })
  const [copied, setCopied] = useState('')
  const copy = (what, text) => async () => {
    try { await navigator.clipboard.writeText(text); setCopied(what); setTimeout(() => setCopied(''), 2200) } catch { /* no clipboard: the text is on the page to select */ }
  }
  /* the enquiry carries the shortlist: an arriving RFQ should already say which projects the
     visitor looked at, rather than making an engineer ask */
  const [saved, setSaved] = useState(() => SL.get())
  useEffect(() => SL.subscribe(setSaved), [])

  async function onSubmit(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get('name') || '').trim()
    const email = String(f.get('email') || '').trim()
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setState({ status: 'invalid' })
      document.getElementById(!name ? 'f-name' : 'f-email')?.focus()
      return
    }
    setState({ status: 'sending' })
    const r = await submit({
      intent,
      name, email,
      company: String(f.get('company') || '').trim(),
      phone: String(f.get('phone') || '').trim(),
      service: String(f.get('service') || ''),
      industry: String(f.get('industry') || ''),
      message: String(f.get('message') || '').trim(),
      shortlist: saved.map(i => PROJECTS[i]?.name).filter(Boolean),
    })
    if (r.reason === 'mailto') { setState({ status: 'mailto', owner: r.owner }); window.location.href = r.mailto; return }
    setState({ status: r.delivered ? 'sent' : 'undelivered', owner: r.owner })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  useEffect(() => {
    document.title = 'IAQ Group · Start a Project · Brand Method'
    return initContact()
  }, [])
  return (
    <>
      <Nav />

      {/* 3 Sep (client: "create the top page like an awesome banner"): the page opened with a
          heading, then a floating photograph, then the lede, which read as three stacked things
          rather than an arrival. It is now one banner in the same family as the projects and
          careers headbands, with the promise the page is actually built to keep stated on it. */}
      <header className="cban">
        <div className="cban-viz" aria-hidden="true">
          <img src="/assets/contact-cleanroom.webp" alt="" loading="eager" decoding="async" />
        </div>
        <div className="cban-scrim" aria-hidden="true" />
        <div className="cban-in wrap">
          <span className="eyebrow">Contact</span>
          <h1>Tell us what <em>you are building.</em></h1>
          <p className="cban-lede">From feasibility to handover, one accountable team. Send the brief and the right engineer replies within one working day.</p>
          <dl className="cban-facts">
            <div><dt>1 working day</dt><dd>Reply, from an engineer</dd></div>
            <div><dt>31 years</dt><dd>Delivering controlled environments</dd></div>
            <div><dt>7 countries</dt><dd>Offices that can take the brief</dd></div>
          </dl>
        </div>
      </header>

      {/* 22 Sep (Bazil, on the three bordered intent cards, the boxed form and the stack of info
          cards: "please refine this its so messy, not structured, no icon"). It is one form in three
          numbered steps now, and one open column beside it. The only card left is the form itself.
          Every choice and every way to reach IAQ carries its icon. The intent still routes: a project
          stays here, the other two hand off to the page that serves them. */}
      <section className="cx wrap" id="contact-form">
        <form className="cx-form" id="cform" noValidate onSubmit={onSubmit}>
          {state.status === 'sent' && (
            <div className="sent show" role="status">
              Thank you. {state.owner?.note}, and an IAQ engineer will reply within one working day.
            </div>
          )}
          {state.status === 'mailto' && (
            <div className="sent show" role="status">
              Your email app has opened with the enquiry written out. Send it and it reaches{' '}
              <a href={'mailto:' + EMAIL}>{EMAIL}</a>; an IAQ engineer replies within one working day.
            </div>
          )}
          {state.status === 'undelivered' && (
            <div className="sent show warn" role="status">
              <b>Nothing was sent, and we will not pretend otherwise.</b> This is a concept build with
              its enquiry endpoint ready to connect, so email carries the brief today. Email{' '}
              <a href={'mailto:' + EMAIL}>{EMAIL}</a> and it will
              reach the same team{state.owner ? ' (' + state.owner.team + ')' : ''}.
            </div>
          )}

          <fieldset className="cx-step" id="contact-intent">
            <legend><i>1</i>What brings you here?</legend>
            <div className="cx-intents" role="radiogroup" aria-label="What is your enquiry about">
              {INTENTS.map(x => (
                <button type="button" key={x.k} role="radio" aria-checked={intent === x.k}
                        className={'cx-intent' + (intent === x.k ? ' on' : '')} onClick={() => setIntent(x.k)}>
                  <span className="cx-ic"><Icon name={x.icon} /></span>
                  <span className="cx-it"><b>{x.t}</b><span>{jargon(x.d)}</span></span>
                </button>
              ))}
            </div>
            {intent === 'career' && (
              <p className="cx-out">Roles are listed and filterable on the careers page. <Link to="/careers">See the 16 open roles &rarr;</Link></p>
            )}
            {intent === 'media' && (
              <p className="cx-out">Newsroom items and media contacts sit on the news page. <Link to="/news">Go to News &amp; Insights &rarr;</Link></p>
            )}
          </fieldset>

          <fieldset className="cx-step">
            <legend><i>2</i>About you</legend>
            <div className="frow">
              <div className="field"><label htmlFor="f-name">Full name</label><input id="f-name" name="name" type="text" autoComplete="name" required /></div>
              <div className="field"><label htmlFor="f-company">Company</label><input id="f-company" name="company" type="text" autoComplete="organization" /></div>
            </div>
            <div className="frow">
              <div className="field"><label htmlFor="f-email">Work email</label><input id="f-email" name="email" type="email" autoComplete="email" required /></div>
              <div className="field"><label htmlFor="f-phone">Phone</label><input id="f-phone" name="phone" type="tel" autoComplete="tel" /></div>
            </div>
          </fieldset>

          <fieldset className="cx-step">
            <legend><i>3</i>The project</legend>
            <div className="frow">
              <div className="field"><label htmlFor="f-service">Service needed</label>
                {/* 21 Sep: the closing band asks what is being built and hands the answer here, so the
                    form opens with that decision already made. */}
                {/* 30 Sep ("dont make it choose blank first"): both menus open on a blank "Choose one" instead of their first
                    option, so nothing is picked for the visitor; a blank is left out of the brief (enquiry.js) */}
                <select id="f-service" name="service" defaultValue={preService || ''}>
                  <option value="" disabled>Choose one</option>
                  <option>Engineering Design &amp; Consultation</option>
                  <option>Procurement</option>
                  <option>Construction &middot; EPCC / EPCM</option>
                  <option>Testing &amp; Commissioning</option>
                  <option>Maintenance</option>
                  <option>Tools Hookup</option>
                  <option>Energy Facility Management</option>
                  <option>Not sure yet</option>
                </select>
              </div>
              <div className="field"><label htmlFor="f-industry">Industry</label>
                <select id="f-industry" name="industry" defaultValue="">
                  <option value="" disabled>Choose one</option>
                  <option>Semiconductor</option><option>Data Centre</option><option>EV Battery</option>
                  <option>Photovoltaics</option><option>District Cooling &amp; Heating</option><option>Bio LifeScience</option>
                  <option>Food &amp; Beverage</option><option>Other</option>
                </select>
              </div>
            </div>
            <div className="field"><label htmlFor="f-msg">Tell us about it</label><textarea id="f-msg" name="message" defaultValue={preMessage || undefined} placeholder="Location, floor area, cleanroom class if known, target dates."></textarea></div>
            {/* 10 Sep audit: the form collects personal data and said nothing about it (PDPA) */}
            <label className="consent"><input type="checkbox" name="consent" required /> <span>I agree that IAQ may use these details to reply to this enquiry. They are not shared or used for marketing. See the <Link to="/policies">{LAUNCH ? 'privacy policy' : 'privacy policy, a draft awaiting IAQ\'s approval'}</Link>.</span></label>
            <div className="cx-send">
              <button className="submit" type="submit"><span>Send enquiry</span><i aria-hidden="true">&rarr;</i></button>
              <p className="form-note">Replies come from an engineer. Confidential by default.</p>
            </div>
          </fieldset>
        </form>

        <aside className="cx-side" aria-label="Reach IAQ directly">
          <h2>Or reach us <em>directly.</em></h2>
          <ul className="cx-lines">
            <li>
              <span className="cx-ic"><Icon name="mail" /></span>
              <div><span className="cx-k">Email</span><a className="cx-v" href={'mailto:' + EMAIL}>{EMAIL}</a>
                <button type="button" className={'cx-copy' + (copied === 'email' ? ' done' : '')} onClick={copy('email', EMAIL)} aria-live="polite">{copied === 'email' ? 'Copied' : 'Copy'}</button></div>
            </li>
            <li>
              <span className="cx-ic"><Icon name="phone" /></span>
              <div><span className="cx-k">Phone</span><a className="cx-v" href="tel:+60351248319">+603 5124 8319</a><span className="cx-sub">Mon to Fri, 9:00 to 18:00, GMT +8</span></div>
            </li>
            <li>
              <span className="cx-ic"><Icon name="pin" /></span>
              <div><span className="cx-k">Headquarters, Shah Alam</span><span className="cx-v cx-adr">No. 12, Jalan Sungai Jeluh 32/192, Kawasan Perindustrian Kemuning, Seksyen 32, 40460 Shah Alam, Selangor</span>
                <span className="cx-links"><a href="#find-us">See it on the map &rarr;</a><a href="#offices">All seven offices &rarr;</a></span></div>
            </li>
          </ul>
          <h3>What happens next</h3>
          <ol className="cx-next">
            <li><i>1</i>Your brief goes to the team for that service.</li>
            <li><i>2</i>An engineer replies within one working day.</li>
            <li><i>3</i>One accountable team from there to handover.</li>
          </ol>
        </aside>
      </section>

      {/* 22 Sep (Bazil: "this map suck put their actual map", "take all the details and make it
          awesome zoom in", "should take a whole left to right section"). The real district, from
          OpenStreetMap, as a white clay model across the full width. See scenes/contact.js. */}
      <section className="hqm" id="find-us" aria-labelledby="hqm-h">
        <div className="hqm-stage" id="hqmap" role="img" aria-label="3D model of the district round the IAQ Group headquarters in Kawasan Perindustrian Kemuning, Shah Alam, built from OpenStreetMap data. The headquarters is the red building on Jalan Sungai Jeluh 32/192, beside Lebuhraya Shah Alam. Drag to turn, use the buttons to zoom."></div>
        <span className="hqm-veil" aria-hidden="true" />
        <div className="wrap hqm-in">
          <div className="hqm-copy">
            <h2 id="hqm-h">The head office, <em>Shah Alam.</em></h2>
            <p className="hqm-addr">{HQ_ADDR}</p>
            <ul className="hqm-facts">
              <li><Icon name="route" />Beside Lebuhraya Shah Alam (E5), off Jalan Bukit Rimau</li>
              <li><Icon name="clock" />Mon to Fri, 9:00 to 18:00, GMT +8</li>
              <li><Icon name="phone" /><a href="tel:+60351248319">+603 5124 8319</a></li>
            </ul>
            <div className="hqm-go">
              <a className="hqm-cta" href={DIRECTIONS} target="_blank" rel="noopener noreferrer"><span>Get directions</span><i aria-hidden="true">&rarr;</i></a>
              <button type="button" className={'hqm-copyb' + (copied === 'addr' ? ' done' : '')} onClick={copy('addr', HQ_ADDR)} aria-live="polite"><Icon name={copied === 'addr' ? 'done' : 'copy'} />{copied === 'addr' ? 'Address copied' : 'Copy address'}</button>
            </div>
          </div>
        </div>
        <div className="hqm-ctl" role="group" aria-label="Map view">
          <button type="button" data-hqm="in" aria-label="Zoom in"><Icon name="plus" /></button>
          <button type="button" data-hqm="out" aria-label="Zoom out"><Icon name="minus" /></button>
          <button type="button" data-hqm="reset" aria-label="Back to the headquarters"><Icon name="recentre" /></button>
        </div>
        <span className="hqm-n" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 17 19l-5-3.4L7 19z" /></svg><b>N</b></span>
        <p className="hqm-credit">Drag to turn. Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors.</p>
      </section>

      <section className="offices" id="offices" aria-labelledby="offices-h">
        <div className="wrap">
          <div className="off-head">
            {/* 15 Sep: the old heading claimed an office in every country IAQ builds in. It is false:
                IAQ has built in China, Poland, France and Morocco with no office there. */}
            <h2 id="offices-h">Seven countries, <em>one point of contact.</em></h2>
            <p className="off-lede">Our offices serve projects across Asia and Europe. Send the brief to the nearest team. Every office can take it, and the reply still comes from an engineer.</p>
          </div>
          <div className="of-grid">
            {COUNTRIES.map(g => (
              <article className={'of' + (g.offices.length > 1 ? ' of-wide' : '')} key={g.cc}>
                <header className="of-head">
                  <Flag cc={g.cc} />
                  <h3>{g.country}</h3>
                  {g.offices.length > 1 && <span className="of-count">{g.offices.length} offices</span>}
                </header>
                <div className="of-list">
                  {g.offices.map(o => (
                    <div className="of-o" key={o.id}>
                      <div className="off-ph" aria-hidden={o.img ? undefined : 'true'}>
                        {o.img ? <img src={o.img} alt={o.rep ? '' : o.cap} loading="lazy" decoding="async" /> : <span className="off-ph-tag">Office photo &middot; supplied by IAQ</span>}
                        {o.hq && <span className="of-hq">Headquarters</span>}
                        {o.cap && <span className="off-cap" aria-hidden={o.rep ? undefined : 'true'}>{o.cap}</span>}
                      </div>
                      <div className="of-b">
                        {o.city !== g.country && o.city !== 'USA' && <h4>{o.city}</h4>}
                        <p className="off-ent">{o.entity}</p>
                        {owed(o.addr) && <p className="off-addr">{o.addr}</p>}
                        {o.addr2 && (<><p className="off-ent of-ent2">{o.ent2 || 'Second office'}</p><p className="off-addr">{o.addr2}</p></>)}
                        <ul className="of-meta">
                          <li><Icon name="phone" />{o.tel ? <a href={'tel:' + o.tel.replace(/[^+\d]/g, '')}>{o.tel}</a> : (LAUNCH ? <span>Via headquarters, <a href="tel:+60351248319">+603 5124 8319</a></span> : <span className="off-slot">Direct line supplied by IAQ &middot; until then via HQ <a href="tel:+60351248319">+603 5124 8319</a></span>)}</li>
                          <li><Icon name="clock" /><span>{o.hours.replace(/ · /g, ', ')}</span></li>
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
            {/* the ninth cell closes the grid: one address for all of them */}
            <article className="of of-route">
              <span className="cx-ic"><Icon name="mail" /></span>
              <h3>Choosing an office</h3>
              <p>Write to headquarters. The brief is routed to the nearest team and an engineer replies within one working day.</p>
              <a className="of-mail" href={'mailto:' + EMAIL}>{EMAIL}</a>
              <a className="of-go" href="#contact-form"><span>Send the brief</span><i aria-hidden="true">&rarr;</i></a>
            </article>
          </div>
        </div>
      </section>

      <ClosingBand note="Contact page concept · Brand Method" />
    </>
  )
}
