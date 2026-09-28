import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as CMS from '../lib/cms.js'

/* ============================================================================
   MemberLogin: the member sign-in beside the search icon (2 Sep, Bazil: "a member login
   beside the search bar icon so members can log in").

   One icon button in the nav's action cluster; it opens a small panel with the passcode
   field. Sign-in goes through the same CMS session the portal uses (lib/cms.js), so a
   member who signs in here lands in the member area already authenticated, and a signed-in
   member sees the member-area tabs instead of the field. Escape and a click outside close
   it. Prototype scope: one shared passcode; at production this is the members' own
   accounts, the same swap the portal itself is marked for.

   18 Sep (Bazil): the member area now opens on the Codex, the special tab that sets out how
   the IAQ business is structured, how a buyer reads it, and how the site presents it. The
   portal (newsroom, roles, projects, downloads) is the second tab. An "Emergency access"
   button under the passcode field grants the session for testing without the passcode;
   it is compiled out of the launch build with the rest of the member area.
   ============================================================================ */

export default function MemberLogin({ onNavigate }) {
  /* the launch build has no member area: Nav never mounts this, and the button below folds out */
  if (import.meta.env.MODE === 'launch') return null
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const [authed, setAuthed] = useState(CMS.isAuthed())
  const [pass, setPass] = useState('')
  const [err, setErr] = useState(false)
  const box = useRef(null)
  const field = useRef(null)

  useEffect(() => CMS.onAuth(() => setAuthed(CMS.isAuthed())), [])
  useEffect(() => {
    if (!open) return
    setErr(false)
    const t = setTimeout(() => { if (field.current) field.current.focus() }, 30)
    const onKey = e => { if (e.key === 'Escape') setOpen(false) }
    const onDown = e => { if (box.current && !box.current.contains(e.target)) setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown) }
  }, [open])

  const go = (to = '/portal/codex') => { setOpen(false); if (onNavigate) onNavigate(); nav(to) }
  const submit = e => {
    e.preventDefault()
    if (CMS.login(pass.trim())) { setAuthed(true); setPass(''); go('/portal/codex') }
    else setErr(true)
  }
  const emergency = () => { if (CMS.grant()) { setAuthed(true); setPass(''); go('/portal/codex') } }
  const out = () => { CMS.logout(); setAuthed(false); setOpen(false) }

  return (
    <div className={'nav-member' + (open ? ' open' : '')} ref={box}>
      <button className={'nav-login' + (authed ? ' in' : '')} type="button" aria-label={authed ? 'Member area' : 'Member login'}
              title={authed ? 'Member area' : 'Member login'} aria-expanded={open} aria-controls="nlPop"
              onClick={() => setOpen(o => !o)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="butt" strokeLinejoin="miter" aria-hidden="true">
          <circle cx="12" cy="8.25" r="3.75" /><path d="M4.75 20c.6-3.6 3.5-5.75 7.25-5.75s6.65 2.15 7.25 5.75" />
        </svg>
        {authed && <i className="nl-dot" aria-hidden="true" />}
      </button>
      <div className="nl-pop" id="nlPop" role="dialog" aria-label="Member login" hidden={!open}>
        {authed ? (
          <>
            <span className="nl-k">Member area &middot; signed in</span>
            <b>You are signed in.</b>
            <p>The Codex sets out the IAQ structure. The portal holds the newsroom, the open roles, the project registry and the downloads.</p>
            <button className="cta nl-cta" type="button" onClick={() => go('/portal/codex')}>Open the Codex</button>
            <button className="nl-tab" type="button" onClick={() => go('/portal/newsroom')}>Open the portal</button>
            <button className="nl-out" type="button" onClick={out}>Sign out</button>
          </>
        ) : (
          <form onSubmit={submit}>
            <span className="nl-k">Member login</span>
            <b>Sign in to the member area.</b>
            <label className="nl-lb" htmlFor="nlPass">Passcode</label>
            <input id="nlPass" ref={field} type="password" value={pass} autoComplete="current-password"
                   onChange={e => { setPass(e.target.value); setErr(false) }} placeholder="Passcode" />
            {err && <span className="nl-err">That passcode is not right. Try again.</span>}
            <button className="cta nl-cta" type="submit">Sign in</button>
            <button className="nl-emerg" type="button" onClick={emergency}>
              <span>Emergency access</span>
              <small>Opens the member area for testing, no passcode</small>
            </button>
            <span className="nl-hint">No access yet? <a href="/contact" onClick={() => setOpen(false)}>Request it</a></span>
          </form>
        )}
      </div>
    </div>
  )
}
