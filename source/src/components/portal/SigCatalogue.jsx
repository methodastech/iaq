import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { buildHouse, loadSig, sigEsc as esc, sigTel as telHref, sigBare as bare, SIG_W } from './SignatureGen.jsx'
import '../../styles/signature.css'

/* ============================================================================
   SigCatalogue · 29 Sep 2026 ("make sub design under email signature, for catalogue email design, but this portal
   changeable email signature stay"). Email signature is a group now: the Generator (unchanged) and this page, a
   catalogue of the house signature designs. Every design renders from the details saved in the Generator (this
   browser), so a member sees their own signature in each; Copy HTML takes the design as an inbox needs it. The
   build rules are the Generator's: one table, inline styles, the house faces with Segoe UI and Arial behind them,
   hosted PNG and JPG, colour blocks as bgcolor cells for Outlook, no left-edge stripes.
   ============================================================================ */
const INK = '#0C1220', SOFT = '#48536A', FAINT = '#6B7588', RED = '#EC2027', NAVY = '#17213A'
const FONT = "font-family:Aptos,'Segoe UI',Arial,Helvetica,sans-serif;"
const DISPLAY = "font-family:'Aptos Display',Aptos,'Segoe UI',Arial,Helvetica,sans-serif;"
const SPEC = "font-family:Bahnschrift,'Segoe UI',Arial,Helvetica,sans-serif;"
const td = (style, html, attrs = '') => `<td ${attrs}style="${FONT}mso-line-height-rule:exactly;${style}">${html}</td>`
const table = (inner, w, style = '') => `<table cellpadding="0" cellspacing="0" border="0" role="presentation"${w ? ` width="${w}"` : ''} style="border-collapse:collapse;${FONT}color:${INK};${w ? `width:${w}px;` : ''}${style}">${inner}</table>`
const img = f => n => esc(String(f.host || '').replace(/\/$/, '')) + '/assets/email/' + n
const a = (href, text) => `<a href="${href}" style="color:${INK};text-decoration:none;">${esc(text)}</a>`
const legal = f => f.company ? `${esc(f.company)}${f.reg ? ' &middot; ' + esc(f.reg) : ''}.` : ''

/* Compact: the logo beside the details, one contact line, the red rule under. For replies and forwards. */
function compact (f) {
  const W = 520, bits = [f.mobile && `<span style="white-space:nowrap;"><b style="${SPEC}color:${RED};">M</b>&nbsp;${a(telHref(f.mobile), f.mobile)}</span>`,
    f.email && `<span style="white-space:nowrap;"><b style="${SPEC}color:${RED};">E</b>&nbsp;${a('mailto:' + esc(f.email), f.email)}</span>`,
    f.site && `<span style="white-space:nowrap;"><b style="${SPEC}color:${RED};">W</b>&nbsp;${a('https://' + esc(bare(f.site)), bare(f.site))}</span>`].filter(Boolean)
  const right = `<div style="${DISPLAY}font-size:17px;line-height:22px;font-weight:bold;color:${INK};">${esc(f.name || 'Your name')}</div>`
    + `<div style="font-size:13px;line-height:18px;color:${SOFT};">${esc(f.title || 'Job title')}${f.company ? ' &middot; ' + esc(f.company) : ''}</div>`
    + (bits.length ? `<div style="font-size:12.5px;line-height:18px;color:${INK};padding-top:6px;">${bits.join('&nbsp;&nbsp;&nbsp;')}</div>` : '')
  return table(`<tr>${td('vertical-align:middle;padding:0 18px 12px 0;', `<img src="${img(f)('iaq-signature-logo.png')}" width="96" height="40" alt="IAQ" style="display:block;border:0;width:96px;height:40px;">`, 'valign="middle" width="114" ')}${td('vertical-align:middle;padding:0 0 12px 0;', right, 'valign="middle" ')}</tr>`
    + `<tr>${td(`border-top:2px solid ${RED};font-size:0;line-height:0;`, '&nbsp;', 'colspan="2" ')}</tr>`, W)
}

/* Text only: no images at all, so nothing is blocked or lost. For mobile and for inboxes that hold back images. */
function plainText (f) {
  const W = 480, contacts = [f.mobile && `Mobile ${a(telHref(f.mobile), f.mobile)}`, f.email && `Email ${a('mailto:' + esc(f.email), f.email)}`].filter(Boolean)
  const rows = [
    td(`${DISPLAY}font-size:16px;line-height:21px;font-weight:bold;color:${INK};`, esc(f.name || 'Your name')),
    td(`font-size:13px;line-height:18px;color:${SOFT};`, `${esc(f.title || 'Job title')}${f.dept ? ' &middot; ' + esc(f.dept) : ''}`),
    td(`${SPEC}font-size:13px;line-height:18px;font-weight:bold;color:${INK};padding-top:6px;`, esc(f.company || 'IAQ Group')),
    contacts.length && td(`font-size:12.5px;line-height:18px;color:${SOFT};padding-top:4px;`, contacts.join('&nbsp;&nbsp;&middot;&nbsp;&nbsp;')),
    f.site && td(`font-size:12.5px;line-height:18px;padding-top:2px;`, `<a href="https://${esc(bare(f.site))}" style="color:${RED};text-decoration:none;font-weight:bold;">${esc(bare(f.site))}</a>`),
  ].filter(Boolean)
  return table(rows.map(r => `<tr>${r}</tr>`).join(''), W)
}

/* Event: the house header and contacts, then a navy band for the show IAQ is exhibiting at. For the weeks around
   SEMICON Europa 2026 (dates and venue from data/booth.js; the stand number is still to confirm, so it is not shown). */
function event (f) {
  const W = SIG_W, half = W / 2
  const head = `<div style="${DISPLAY}font-size:19px;line-height:24px;font-weight:bold;color:${INK};">${esc(f.name || 'Your name')}</div>`
    + `<div style="font-size:13px;line-height:18px;color:${SOFT};">${esc(f.title || 'Job title')}</div>`
    + (f.company ? `<div style="font-size:12.5px;line-height:17px;font-weight:bold;color:${INK};padding-top:4px;">${esc(f.company)}</div>` : '')
  const logo = `<img src="${img(f)('iaq-signature-logo.png')}" width="110" height="46" alt="IAQ" style="display:block;border:0;width:110px;height:46px;margin-left:auto;">`
  const line = [f.mobile && `<b style="${SPEC}color:${RED};">Mobile</b>&nbsp;${a(telHref(f.mobile), f.mobile)}`, f.email && `<b style="${SPEC}color:${RED};">Email</b>&nbsp;${a('mailto:' + esc(f.email), f.email)}`].filter(Boolean).join('&nbsp;&nbsp;&nbsp;&nbsp;')
  const band = table(`<tr>`
    + td(`background-color:${NAVY};padding:16px 22px;vertical-align:middle;`, `<div style="${SPEC}font-size:11px;line-height:14px;letter-spacing:1.5px;color:#9FB0CC;">MEET US AT</div><div style="${DISPLAY}font-size:20px;line-height:25px;font-weight:bold;color:#ffffff;padding-top:3px;">SEMICON Europa 2026</div>`, `bgcolor="${NAVY}" valign="middle" width="${half}" `)
    + td(`background-color:${NAVY};padding:16px 22px;vertical-align:middle;font-size:13px;line-height:19px;color:#ffffff;`, `10 to 13 November 2026<br>Messe M&uuml;nchen, Munich`, `bgcolor="${NAVY}" valign="middle" `)
    + `</tr>`, W)
  return table(`<tr>${td('vertical-align:top;padding:0 0 12px 0;', head, 'valign="top" ')}${td('vertical-align:top;padding:0 0 12px 0;text-align:right;', logo, 'valign="top" align="right" width="160" ')}</tr>`
    + `<tr>${td(`border-top:2px solid ${RED};padding:10px 0 0 0;font-size:12.5px;line-height:20px;color:${INK};`, line, 'colspan="2" ')}</tr>`
    + `<tr>${td('padding:14px 0 0 0;', band, 'colspan="2" ')}</tr>`
    + (f.company ? `<tr>${td(`padding:12px 0 0 0;${SPEC}font-size:11px;line-height:16px;color:${FAINT};`, legal(f), 'colspan="2" ')}</tr>` : ''), W)
}

const DESIGNS = [
  { id: 'house', name: 'House', use: 'Everyday mail, the default', note: 'The full signature: header, contacts, the cleanroom banner, the four marks, the registration and the confidentiality line.', build: buildHouse, gen: true },
  { id: 'compact', name: 'Compact', use: 'Replies and forwards', note: 'The logo beside the name, one line of contacts, the red rule. Short enough for a thread.', build: compact },
  { id: 'text', name: 'Text only', use: 'Mobile, and inboxes that block images', note: 'No images at all, so nothing is held back or shows as a broken picture.', build: plainText },
  { id: 'event', name: 'Event', use: 'The weeks around SEMICON Europa 2026', note: 'The header and contacts, then a navy band with the show, the dates and the venue. Switch back to House after the show.', build: event },
]

function Design ({ d, f, onDone }) {
  const html = useMemo(() => d.build(f), [d, f])
  const copy = async () => {
    try {
      if (window.ClipboardItem && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()], { type: 'text/plain' }) })])
        return onDone(`${d.name} copied. Paste it into your mail app's signature box.`)
      }
      await navigator.clipboard.writeText(html); onDone(`${d.name} HTML copied.`)
    } catch { onDone('Copy failed. Select the preview and copy it by hand.') }
  }
  return (
    <article className="sgc-card">
      <header className="sgc-head">
        <div><h3>{d.name}</h3><span className="sgc-use">{d.use}</span></div>
        <div className="sgc-acts">
          {d.gen && <Link className="sgc-btn" to="/portal/signature">Edit in Generator</Link>}
          <button type="button" className="sgc-btn sgc-go" onClick={copy}>Copy signature</button>
        </div>
      </header>
      <p className="sgc-note">{d.note}</p>
      <div className="sgc-stage"><div className="sgc-prev" dangerouslySetInnerHTML={{ __html: html }} /></div>
    </article>
  )
}

/* 29 Sep ("use this info"): the catalogue's sample person, from the signature supplied; the member's own details are
   one switch away. The rest (office address, company, registration, image address) comes from the Generator's defaults */
const SAMPLE = {
  name: 'Nabilah Mohd Radzi', title: 'Business Development Manager', dept: '',
  mobile: '+6012-693 0642', tel: '+603-5124 8319', email: 'nabilah.mohdradzi@iaqtechnology.com.my', site: 'www.iaqtechnology.com.my',
  entity: 'technology', company: 'IAQ Technology International Sdn. Bhd.', reg: '200001031412 (534019-T)',
}

export default function SigCatalogue () {
  const [mine] = useState(loadSig)
  const hasMine = !!String(mine.name || '').trim()
  const [who, setWho] = useState('sample')
  /* the sample keeps the member's own company, registration and image address, so the images load where they are */
  const f = useMemo(() => (who === 'mine' && hasMine ? mine : { ...mine, ...SAMPLE }), [who, mine, hasMine])
  const [done, setDone] = useState('')
  const flash = t => { setDone(t); clearTimeout(flash.t); flash.t = setTimeout(() => setDone(''), 2600) }
  return (
    <div className="sgc">
      <div className="sgc-who" role="group" aria-label="Whose details">
        <button type="button" aria-pressed={who === 'sample'} onClick={() => setWho('sample')}>Sample: Nabilah Mohd Radzi</button>
        <button type="button" aria-pressed={who === 'mine'} onClick={() => setWho('mine')} disabled={!hasMine}>My details</button>
      </div>
      <p className="sgc-intro">
        {who === 'mine' && hasMine
          ? <>Every design shows the details saved in the <Link to="/portal/signature">Generator</Link>. Change them there.</>
          : <>Shown with a sample signature. {hasMine ? 'Switch to My details to see your own, or change them' : 'Fill in your details'} in the <Link to="/portal/signature">Generator</Link>.</>}
      </p>
      <p className="sgc-done" aria-live="polite">{done}</p>
      <div className="sgc-list">{DESIGNS.map(d => <Design key={d.id} d={d} f={f} onDone={flash} />)}</div>
    </div>
  )
}
