import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { submit, OWNERS } from '../lib/enquiry.js'
import * as SL from '../lib/shortlist.js'
import { cmsProjects, live } from '../lib/cms.js'
const PROJECTS = live(cmsProjects)
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import initContact from '../scenes/contact.js'
import '../styles/contact.css'

export default function Contact() {
  const [intent, setIntent] = useState('project')
  const [state, setState] = useState({ status: 'idle' })
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

      <header className="head wrap">
        <span className="eyebrow">Contact</span>
        <h1>Tell us what <em>you are building.</em></h1>
        <figure className="head-viz"><img src="/assets/contact-cleanroom.webp" alt="Engineers in a cleanroom IAQ delivered: rows of process tools beneath a fan-filter ceiling" loading="lazy" /></figure>
        <p className="lede">From feasibility to handover, one accountable team. Send the brief and the right engineer replies within one working day.</p>
      </header>

      {/* intent router: the framework declares one enquiry surface routed by intent.
          Project keeps you here, the other two hand off to the page that actually serves them. */}
      <section className="intent wrap" id="contact-intent" role="group" aria-label="What is your enquiry about">
        <span className="intent-k">I am here to</span>
        <div className="intent-row">
          <button type="button" className={'intent-b' + (intent === 'project' ? ' on' : '')} onClick={() => setIntent('project')}>
            <b>Start a project</b><span>Feasibility, tender, RFQ or a full EPCC brief</span>
          </button>
          <button type="button" className={'intent-b' + (intent === 'career' ? ' on' : '')} onClick={() => setIntent('career')}>
            <b>Join the team</b><span>Open roles across five departments</span>
          </button>
          <button type="button" className={'intent-b' + (intent === 'media' ? ' on' : '')} onClick={() => setIntent('media')}>
            <b>Media or partnership</b><span>Press, investor and partner enquiries</span>
          </button>
        </div>
        {intent === 'career' && (
          <p className="intent-out">Roles are listed and filterable on the careers page. <Link to="/careers">See the 16 open roles &rarr;</Link></p>
        )}
        {intent === 'media' && (
          <p className="intent-out">Newsroom items and media contacts sit on the news page. <Link to="/news">Go to News &amp; Insights &rarr;</Link></p>
        )}
      </section>

      <section className="cgrid wrap" id="contact-form">
        <form className="form" id="cform" noValidate onSubmit={onSubmit}>
          {state.status === 'sent' && (
            <div className="sent show" role="status">
              Thank you. {state.owner?.note}, and an IAQ engineer will reply within one working day.
            </div>
          )}
          {state.status === 'undelivered' && (
            <div className="sent show warn" role="status">
              <b>Nothing was sent, and we will not pretend otherwise.</b> This is a concept build with
              no enquiry endpoint configured, so the form has nowhere to deliver to. Email{' '}
              <a href="mailto:info@iaqtechnology.com.my">info@iaqtechnology.com.my</a> and it will
              reach the same team{state.owner ? ' (' + state.owner.team + ')' : ''}.
            </div>
          )}
          <div className="frow">
            <div className="field"><label htmlFor="f-name">Full name</label><input id="f-name" name="name" type="text" autoComplete="name" required /></div>
            <div className="field"><label htmlFor="f-company">Company</label><input id="f-company" name="company" type="text" autoComplete="organization" /></div>
          </div>
          <div className="frow">
            <div className="field"><label htmlFor="f-email">Work email</label><input id="f-email" name="email" type="email" autoComplete="email" required /></div>
            <div className="field"><label htmlFor="f-phone">Phone</label><input id="f-phone" name="phone" type="tel" autoComplete="tel" /></div>
          </div>
          <div className="frow">
            <div className="field"><label htmlFor="f-service">Service needed</label>
              <select id="f-service" name="service">
                <option>Engineering Design &amp; Consultation</option>
                <option>Procurement</option>
                <option>Construction &middot; EPCC / EPCM</option>
                <option>Testing &amp; Commissioning</option>
                <option>Maintenance</option>
                <option>Not sure yet</option>
              </select>
            </div>
            <div className="field"><label htmlFor="f-industry">Industry</label>
              <select id="f-industry" name="industry">
                <option>Semiconductor</option><option>Data Centre</option><option>EV Battery</option>
                <option>Photovoltaic</option><option>Pharma &amp; Hospitals</option><option>Food &amp; Beverages</option>
                <option>District Cooling</option><option>Other</option>
              </select>
            </div>
          </div>
          <div className="field"><label htmlFor="f-msg">The project</label><textarea id="f-msg" name="message" placeholder="Location, floor area, cleanroom class if known, target dates."></textarea></div>
          <button className="submit" type="submit">Send enquiry</button>
          <div className="form-note">Replies come from an engineer, not a mailbox. Confidential by default.</div>
        </form>

        <div className="ic-stack">
          <div className="icard"><div className="k">Email</div><div className="v"><a href="mailto:info@iaqtechnology.com.my">info@iaqtechnology.com.my</a></div></div>
          <div className="icard"><div className="k">Phone</div><div className="v"><a href="tel:+60351248319">+603 5124 8319</a></div></div>
          <div className="icard hq"><div className="k">HQ &middot; Shah Alam</div><div className="v">No.12, Jalan Sungai Jeluh 32/192, Kawasan Perindustrian Kemuning, Seksyen 32, 40460 Shah Alam, Selangor</div>
            <div className="hours"><span>Mon to Fri &middot; 9:00 to 18:00</span><span>GMT +8</span></div>
            {/* the group runs from more than one country: send people to the full list */}
            <Link className="icard-more" to="/global-presence">All offices and where we have built &rarr;</Link>
          </div>
          <div className="map" id="hqmap" role="img" aria-label="Stylized 3D map of the IAQ Group headquarters district at Kawasan Perindustrian Kemuning, Shah Alam, with a glowing red location marker on the IAQ plot. Drag to orbit.">
            <svg className="fallpin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 11-8 11s-8-5-8-11a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="2.6" /></svg>
            <span className="cap">HQ &middot; Kawasan Perindustrian Kemuning</span>
          </div>
        </div>
      </section>

      <Footer note="Contact page concept · Brand Method" />
    </>
  )
}
