import React, { useEffect, useRef, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { bySlug } from '../data/campaigns.js'
import { INDLBL, INDUSTRIES } from '../data/projects.js'
import { cmsProjects, live } from '../lib/cms.js'
const PROJECTS = live(cmsProjects)
import { submit } from '../lib/enquiry.js'
import '../styles/campaign.css'

/* ============================================================================
   /lp/:campaign · standalone sales page.

   Deliberately NOT wrapped in Nav or Footer. A campaign page has one argument
   and one action; giving it the site navigation gives a paid visitor eleven
   other things to do instead of the one thing the click was bought for.

   The only ways off the page are the form, and one honest link to the full
   site for anyone who wants to check the company out before converting.
   ============================================================================ */

/* 29 Sep ("why dropdown look unconsistant. make it sharp edges"): the lead form's menus. A native <select> opens a
   list the browser draws itself (rounded, light, the system font) and most browsers will not let the page restyle it,
   so the menus are drawn here: sharp, on the form's navy, in the site's type. It behaves as a select does: click or
   Enter or Space opens, arrows and Home/End move, Enter picks, Escape or a click elsewhere closes, typing jumps to a
   match. The value travels in a hidden input, so the form reads it like any other field. */
function LpSelect ({ id, name, options }) {
  const [val, setVal] = useState('')
  const [open, setOpenS] = useState(false)
  const [act, setActS] = useState(0)
  const root = useRef(null), list = useRef(null), typed = useRef({ s: '', t: 0 })
  /* keys can arrive faster than React re-renders, so the handler reads open and the active row from refs, kept in step */
  const st = useRef({ open: false, act: 0 })
  const setOpen = v => { st.current.open = typeof v === 'function' ? v(st.current.open) : v; setOpenS(st.current.open) }
  const setAct = v => { st.current.act = typeof v === 'function' ? v(st.current.act) : v; setActS(st.current.act) }
  useEffect(() => {
    if (!open) return
    const away = e => { if (!root.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])
  useEffect(() => { if (open) list.current?.children[act]?.scrollIntoView({ block: 'nearest' }) }, [open, act])
  const at = () => Math.max(0, options.indexOf(val))
  const choose = i => { setVal(options[i]); setOpen(false) }
  const onKey = e => {
    const n = options.length, open = st.current.open, act = st.current.act
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) { setOpen(true); setAct(at()); return }
      setAct(a => (a + (e.key === 'ArrowDown' ? 1 : n - 1)) % n)
    } else if (open && (e.key === 'Home' || e.key === 'End')) { e.preventDefault(); setAct(e.key === 'Home' ? 0 : n - 1) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (open) choose(act); else { setOpen(true); setAct(at()) } }
    else if (e.key === 'Escape' && open) { e.preventDefault(); setOpen(false) }
    else if (e.key === 'Tab') setOpen(false)
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const t = typed.current, now = Date.now()
      t.s = (now - t.t > 700 ? '' : t.s) + e.key.toLowerCase(); t.t = now
      const i = options.findIndex(o => o.toLowerCase().startsWith(t.s))
      if (i >= 0) { if (open) setAct(i); else setVal(options[i]) }
    }
  }
  return (
    <div className={'lp-sel' + (open ? ' is-open' : '')} ref={root}>
      <input type="hidden" name={name} value={val} />
      <button type="button" id={id} className={'lp-sel-b' + (val ? '' : ' is-empty')} aria-haspopup="listbox" aria-expanded={open}
              aria-controls={id + '-list'} aria-activedescendant={open ? `${id}-o${act}` : undefined}
              onClick={() => { setOpen(o => !o); setAct(at()) }} onKeyDown={onKey}>
        <span>{val || 'Choose one'}</span><i aria-hidden="true" />
      </button>
      {open && (
        <ul className="lp-sel-l" id={id + '-list'} role="listbox" ref={list} aria-labelledby={id + '-lbl'}>
          {options.map((o, i) => (
            <li key={o} id={`${id}-o${i}`} role="option" aria-selected={o === val} className={(i === act ? 'is-act' : '') + (o === val ? ' is-on' : '')}
                onPointerEnter={() => setAct(i)} onPointerDown={e => e.preventDefault()} onClick={() => choose(i)}>{o}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

const NEEDS = ['A new facility, design and build', 'An upgrade or expansion of a facility', 'Process utilities or tool hook-up', 'Maintenance or energy management', 'Not sure yet']
const TIMINGS = ['Within 3 months', '3 to 12 months', 'More than a year', 'Just exploring']

export default function Campaign() {
  const { campaign } = useParams()
  const c = bySlug(campaign)

  const [state, setState] = useState({ status: 'idle' })

  useEffect(() => {
    if (c) document.title = `IAQ Group · ${c.eyebrow}`
  }, [c])

  /* the full-bleed form band spans 100vw, wider than the scrollbar-adjusted viewport,
     so sideways overflow is clipped only while a campaign page is mounted */
  useEffect(() => {
    document.documentElement.classList.add('lp-page')
    return () => document.documentElement.classList.remove('lp-page')
  }, [])

  /* An unknown campaign slug must not render an empty sales page. Send it to the markets hub,
     which is the nearest thing to what the visitor was promised. */
  if (!c) return <Navigate to="/markets" replace />

  const proof = PROJECTS.map((p, i) => ({ p, i })).filter(({ p }) => c.proof(p)).slice(0, 3)
  const project = c.form === 'project'
  const ask = project ? 'Send your project brief' : 'Request the capability pack'

  /* 29 Sep: every campaign form posts to Netlify Forms as "lead" (lib/enquiry.js); `kind` tells the two forms apart */
  async function onSubmit(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const val = k => String(f.get(k) || '').trim()
    const name = val('name'), email = val('email'), phone = val('phone')
    /* 29 Sep ("phone dont make optional"): the project form needs a phone too, at least 7 digits */
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || (project && phone.replace(/\D/g, '').length < 7)) {
      setState({ status: 'invalid' }); return
    }
    /* the honeypot: people never see this field, form-filling bots fill it; they get the thank-you and nothing is sent */
    if (val('bot-field')) { setState({ status: 'sent', name }); return }
    setState({ status: 'sending' })
    const r = await submit({
      intent: 'project',
      netlifyForm: 'lead',
      source: 'campaign:' + c.slug,
      kind: project ? 'project' : 'pack',
      name, email,
      company: val('company'),
      ...(project
        ? { phone, market: val('market'), need: val('need'), timing: val('timing'), message: val('message') }
        : { message: `Capability pack requested from the ${c.eyebrow} campaign page.` }),
    })
    if (r.reason === 'mailto') { setState({ status: 'mailto', owner: r.owner }); window.location.href = r.mailto; return }
    setState({ status: r.delivered ? 'sent' : r.reason === 'local' ? 'local' : 'undelivered', owner: r.owner, name, email })
  }

  return (
    <main className="lp">
      <div className="lp-mark">
        <img src="/assets/iaq-logo.webp" alt="IAQ Group" />
        <span>Your Total Facility Solutions Provider</span>
      </div>

      <section className="lp-hero">
        <div className="lp-hero-tx">
          {/* 29 Sep ("remove eyebrow tag"): the small red label over the headline is gone; the eyebrow text still names
              the page in the browser tab */}
          <h1>{c.title}</h1>
          <p className="lp-lede">{c.lede}</p>
          <ul className="lp-pts">
            {c.points.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
          <a className="lp-jump cta" href="#lp-form">{ask}</a>
        </div>
        <div className="lp-hero-fig">
          <img src={c.image} alt="" loading="eager" />
        </div>
      </section>

      <section className="lp-stats" aria-label="The record">
        {c.stat.map((s, i) => (
          <div className="lp-stat" key={i}><b>{s.v}</b><span>{s.k}</span></div>
        ))}
      </section>

      {proof.length > 0 && (
        <section className="lp-proof" aria-labelledby="lp-proof-h">
          <h2 id="lp-proof-h">Delivered, not proposed.</h2>
          <div className="lp-proof-g">
            {proof.map(({ p, i }) => (
              <article className="lp-pc" key={i}>
                <img src={p.img} alt="" loading="lazy" />
                <div>
                  <span className="lp-pc-k">{p.loc} · {p.iso}</span>
                  <h3>{p.name}</h3>
                  <span className="lp-pc-c">{INDLBL[p.ind]}</span>
                </div>
              </article>
            ))}
          </div>
          <p className="lp-note">
            Published by scope and location only. Client names are withheld where the contract
            requires it.
          </p>
        </section>
      )}

      <section className="lp-form-wrap" id="lp-form">
        <div className="lp-form-in">
          <h2>{project ? 'Tell us about the project' : 'Request the capability pack'}</h2>
          <p>
            {project
              ? 'A few lines are enough to start. An engineer reads every brief and replies within a working day.'
              : 'The capability statement and certification pack, sent to your inbox. One email, no follow-up sequence.'}
          </p>

          {state.status === 'sent' ? (
            <div className="lp-done" role="status">
              <b>{project ? 'Thank you. Your brief is with our team.' : 'Request received.'}</b>
              <p>{project
                ? <>An engineer replies within a working day{state.email ? <> at <strong>{state.email}</strong></> : null}. For anything urgent, call +603 5124 8319.</>
                : <>{state.owner?.note}. The pack follows shortly.</>}</p>
            </div>
          ) : state.status === 'local' ? (
            <div className="lp-done warn" role="status">
              <b>Preview only: nothing was sent.</b>
              <p>
                This page is running on this computer. Leads are collected by Netlify Forms on the published site, so
                the same form sends from there.
              </p>
            </div>
          ) : state.status === 'mailto' ? (
            <div className="lp-done" role="status">
              <b>Your email app has opened.</b>
              <p>The request is written out for you. Send it and the pack follows from business@iaqtechnology.com.my.</p>
            </div>
          ) : state.status === 'undelivered' ? (
            <div className="lp-done warn" role="status">
              <b>The form could not be sent.</b>
              <p>
                Nothing reached us, and your details stay with you. Please email{' '}
                <a href="mailto:business@iaqtechnology.com.my">business@iaqtechnology.com.my</a> or call
                +603 5124 8319, and {project ? 'an engineer picks it up from there' : 'the pack is sent by hand'}.
              </p>
            </div>
          ) : (
            <form name="lead" onSubmit={onSubmit} onInput={() => state.status === 'invalid' && setState({ status: 'idle' })} noValidate>
              {/* the honeypot, out of sight and out of the tab order (see onSubmit) */}
              <p className="lp-hp" aria-hidden="true"><label>Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>
              <label htmlFor="lp-name">Name</label>
              <input id="lp-name" name="name" type="text" autoComplete="name" required />
              <label htmlFor="lp-company">Company</label>
              <input id="lp-company" name="company" type="text" autoComplete="organization" />
              <label htmlFor="lp-email">Work email</label>
              <input id="lp-email" name="email" type="email" autoComplete="email" required />
              {project && <>
                <label htmlFor="lp-phone">Phone</label>
                <input id="lp-phone" name="phone" type="tel" autoComplete="tel" required />
                <label htmlFor="lp-market" id="lp-market-lbl">Market</label>
                <LpSelect id="lp-market" name="market" options={[...INDUSTRIES.map(([, l]) => l), 'Other']} />
                <label htmlFor="lp-need" id="lp-need-lbl">What you need</label>
                <LpSelect id="lp-need" name="need" options={NEEDS} />
                <label htmlFor="lp-timing" id="lp-timing-lbl">Timing</label>
                <LpSelect id="lp-timing" name="timing" options={TIMINGS} />
                <label htmlFor="lp-message">The project <em>optional</em></label>
                <textarea id="lp-message" name="message" rows={4} placeholder="Location, size, cleanroom class, anything you know so far" />
              </>}
              {state.status === 'invalid' && (
                <p className="lp-err" role="alert">{project ? 'A name, a valid work email and a phone number are needed so an engineer can reply.' : 'A name and a valid work email are needed to send the pack.'}</p>
              )}
              <button className="cta" type="submit" disabled={state.status === 'sending'}>
                {state.status === 'sending' ? 'Sending' : project ? 'Send the brief' : 'Send me the pack'}
              </button>
              {project && <p className="lp-fine">Your details are used only to reply to this enquiry.</p>}
            </form>
          )}
        </div>
      </section>

      <footer className="lp-foot">
        <span>IAQ Group · Total facility solutions since 1995</span>
        <span>
          <Link to={c.market}>{c.back ? 'Our ' + c.back : `The full ${c.eyebrow.toLowerCase()} page`}</Link>
          <i aria-hidden="true">·</i>
          <Link to="/">iaqtechnology.com</Link>
        </span>
      </footer>
    </main>
  )
}
