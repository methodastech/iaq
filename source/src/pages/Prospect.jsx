import React, { useEffect, useState } from 'react'
import { submit, mailtoFor } from '../lib/enquiry.js'
import '../styles/prospect.css'

/* ============================================================================
   Prospect · 7 Oct 2026 (Bazil: "qr code for the form, put temporary", "the form is a one page form to fill in",
   "all prospect info"). The page the Scan slide's second code opens on a visitor's phone at the booth: one page, the
   prospect's details, one button. No nav, no footer, nothing to wander off to.

   Where it goes: through lib/enquiry.js like every form on the site. With no endpoint wired yet the page keeps a copy
   on the device (localStorage, iaq.prospects.v1) and opens the visitor's mail app with the details written out to
   the business inbox, so nothing is lost before the endpoint exists. TEMPORARY by Bazil's word: replace the sending
   when IAQ's endpoint or CRM is decided.
   ============================================================================ */
const MARKETS = ['Semiconductor', 'Data Centre', 'EV Battery', 'Photovoltaics', 'District Cooling & Heating', 'Bio LifeScience', 'Food & Beverage', 'Other']
const INTERESTS = ['EPC: a new facility or expansion', 'Process critical utilities and tool installation', 'Energy facility management', 'Tools hookup', 'Maintenance', 'Not sure yet']
const STAGES = ['Planning', 'Designing', 'Building', 'Operating', 'No project yet']
const KEY = 'iaq.prospects.v1'

export default function Prospect () {
  const [state, setState] = useState('idle')
  useEffect(() => { document.title = 'IAQ Group · Leave your details' }, [])
  async function onSubmit (e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const v = k => String(f.get(k) || '').trim()
    const p = { name: v('name'), company: v('company'), role: v('role'), email: v('email'), phone: v('phone'), country: v('country'), industry: v('industry'), interest: v('interest'), stage: v('stage'), notes: v('notes'), when: new Date().toISOString(), source: 'SEMICON Europa 2026' }
    if (!p.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email)) { setState('invalid'); document.getElementById(!p.name ? 'p-name' : 'p-email')?.focus(); return }
    setState('sending')
    try { const all = JSON.parse(localStorage.getItem(KEY) || '[]'); all.push(p); localStorage.setItem(KEY, JSON.stringify(all)) } catch {}
    const payload = { intent: 'project', name: p.name, company: p.company, email: p.email, phone: p.phone, service: p.interest, industry: p.industry, message: ['Met at SEMICON Europa 2026', p.role && 'Role: ' + p.role, p.country && 'Country: ' + p.country, p.stage && 'Project stage: ' + p.stage, p.notes && 'Notes: ' + p.notes].filter(Boolean).join('\n') }
    const r = await submit(payload)
    if (!r.delivered) { window.location.href = r.mailto || mailtoFor(payload) }
    setState('sent')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  if (state === 'sent') return (
    <main className="pp">
      <div className="pp-in pp-done">
        <img className="pp-logo" src="/assets/iaq-logo.webp" alt="IAQ" />
        <h1>Thank you. <em>We will be in touch</em></h1>
        <p>Your details are with IAQ. If your mail app opened, send the message it prepared and the enquiry reaches the business team directly.</p>
        <a className="pp-btn" href="https://iaqtechnology.com.my">Go to the website</a>
      </div>
    </main>
  )
  return (
    <main className="pp">
      <form className="pp-in" onSubmit={onSubmit} noValidate>
        <img className="pp-logo" src="/assets/iaq-logo.webp" alt="IAQ" />
        <h1>Leave your details, <br /><em>we will follow up</em></h1>
        <p className="pp-lede">SEMICON Europa 2026, Munich. One page, a minute.</p>
        {state === 'invalid' && <p className="pp-err" role="alert">A name and a working email are needed.</p>}
        <div className="pp-f"><label htmlFor="p-name">Full name</label><input id="p-name" name="name" type="text" autoComplete="name" required /></div>
        <div className="pp-f"><label htmlFor="p-company">Company</label><input id="p-company" name="company" type="text" autoComplete="organization" /></div>
        <div className="pp-f"><label htmlFor="p-role">Role</label><input id="p-role" name="role" type="text" autoComplete="organization-title" /></div>
        <div className="pp-f"><label htmlFor="p-email">Work email</label><input id="p-email" name="email" type="email" autoComplete="email" inputMode="email" required /></div>
        <div className="pp-f"><label htmlFor="p-phone">Phone</label><input id="p-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" /></div>
        <div className="pp-f"><label htmlFor="p-country">Country</label><input id="p-country" name="country" type="text" autoComplete="country-name" /></div>
        <div className="pp-f"><label htmlFor="p-industry">Market</label><select id="p-industry" name="industry" defaultValue="Semiconductor">{MARKETS.map(m => <option key={m}>{m}</option>)}</select></div>
        <div className="pp-f"><label htmlFor="p-interest">What you are looking at</label><select id="p-interest" name="interest" defaultValue="Not sure yet">{INTERESTS.map(m => <option key={m}>{m}</option>)}</select></div>
        <fieldset className="pp-f pp-chips"><legend>Where the project is</legend>
          {STAGES.map((s, k) => <label key={s}><input type="radio" name="stage" value={s} defaultChecked={k === STAGES.length - 1} /><span>{s}</span></label>)}
        </fieldset>
        <div className="pp-f"><label htmlFor="p-notes">Anything to add</label><textarea id="p-notes" name="notes" rows="3" /></div>
        <button className="pp-btn" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending' : 'Send my details'}</button>
        <p className="pp-fine">Used by IAQ to follow up on this enquiry only.</p>
      </form>
    </main>
  )
}
