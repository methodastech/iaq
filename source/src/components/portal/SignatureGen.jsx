import React, { useEffect, useMemo, useRef, useState } from 'react'
import '../../styles/signature.css'

/* ============================================================================
   SignatureGen · 25 Sep 2026. Bazil: "create an email signature generator in the website", "portal".
   A member fills in their details, sees the signature at true size, and copies it into Outlook, Gmail or Apple Mail.

   What an inbox accepts decides the build: one table, inline styles, the house faces that Microsoft 365 and Windows
   already carry (web fonts do not load in mail; see build), PNG and JPG
   images at twice their display size (WebP and SVG fail in Outlook) served from an absolute address, and colour blocks
   as table cells with bgcolor (Outlook ignores CSS backgrounds). Only offices with a published street address are
   offered; the rest of the seven are still "supplied by IAQ" on the Contact page, so a member there types their own
   address under Other. The form is remembered in this browser only.

   29 Sep 2026 ("use that design on email signature portal", with the house signature as the reference): the layout is
   the reference's. Name, title and the legal entity on the left, the logo and tagline on the right, a red rule; Mobile,
   Email, Office and Web in two columns with red labels; the address; the red "Engineered environments. Trusted outcomes."
   block beside the cleanroom photograph (assets/email/sig-cleanroom.jpg, cut from assets/contact-cleanroom.webp); the
   Intertek and UKAS marks with the ISO line; and the entity's name and registration number with the confidentiality
   line. The company line was "IAQ Group" until now (entity names off anything sent outside, client DV3 A2.1); the
   reference signs with the member's legal entity and its registration number, so the entity is chosen here, with
   IAQ Group still one of the choices. 640px wide: the reference's proportions, inside what mail clients lay out without scaling.
   ============================================================================ */
const OFFICES = [
  { id: 'hq', label: 'Headquarters, Shah Alam', addr: 'No. 12, Jalan Sungai Jeluh 32/192, Kawasan Perindustrian Kemuning, Seksyen 32, 40460 Shah Alam, Selangor, Malaysia', tel: '+603 5124 8319' },
  { id: 'sg', label: 'Singapore', addr: '1 Tai Seng Avenue #04-03, Tai Seng Exchange, Singapore 536464', tel: '+65 6277 5240' },
  { id: 'de', label: 'Dresden, Germany', addr: '8. OG, Budapester Straße 5, 01069 Dresden, Germany', tel: '+49 351 4387 9529' },
  { id: 'in', label: 'Ahmedabad, India', addr: '906, Satymev Eminence, Science City Road, Sola, Ahmedabad 380060, India', tel: '' },
  { id: 'other', label: 'Other (type the address)', addr: '', tel: '' },
]
/* the legal entity a member signs for, with its registration number (SSM, new and old format). IAQ Solutions is the
   reference signature's; IAQ Technology International is the one the site's footer carries. */
/* 29 Sep ("IAQ Technology International Sdn Bhd"): the default entity, first in the list */
const ENTITIES = [
  { id: 'technology', name: 'IAQ Technology International Sdn. Bhd.', reg: '200001031412 (534019-T)' },
  { id: 'solutions', name: 'IAQ Solutions Sdn. Bhd.', reg: '200501013167 (690214-V)' },
  /* 7 Oct (client: "for Singapore entity, must have this logo certification"): the Singapore company, signing with the
     Singapore marks. Its UEN is not supplied yet, so it is typed under Company name, registration. */
  { id: 'sg', name: 'IAQ Engineering (SG) Pte. Ltd.', reg: '', marks: 'sg' },
  { id: 'group', name: 'IAQ Group', reg: '' },
  { id: 'other', name: '', reg: '' },
]
const SIG_W = 640   /* the signature's width in the inbox */
const SLOGAN = ['Engineered environments.', 'Trusted outcomes.']
/* the four registrations and recognitions the site's footer carries (assets/certs), as PNGs in assets/email: file,
   width at 40px high, alt */
const CERTS = [
  ['sig-cidb.png', 66, 'CIDB registered contractor'],
  ['sig-intertek.png', 32, 'Intertek ISO 9001, 14001 and 45001 certification'],
  ['sig-ukas.png', 29, 'UKAS management systems accreditation'],
  ['sig-highwire.png', 32, 'Highwire Safety Gold 2024'],
]
/* 7 Oct: the Singapore entity's marks (its old signature's strip: ISO 9001, 14001 and 45001 through GIC under SAC, BCA,
   bizSAFE Star) as one image, assets/email/sig-certs-sg.png, about 68px high; its width is read from the file. Until IAQ
   sends that file the marks are written out as text, so nothing shows broken. */
const SG_MARKS = 'sig-certs-sg.png'
const SG_TEXT = 'ISO 9001 · ISO 14001 · ISO 45001 · BCA · bizSAFE Star'
/* 8 Oct ("for the singapore find the bizsafe certificate"): until that strip comes, the Singapore marks are the bizSAFE
   Star logo itself, from the Workplace Safety and Health Council's own bizSAFE logo guide (the full-colour Star
   signature, page 4, rendered from its vector art: assets/email/sig-bizsafe-star.png, 219 x 144) */
const SG_BIZSAFE = ['sig-bizsafe-star.png', 52, 'bizSAFE Star']
const NOTE = 'The information in this e-mail is confidential and may be legally privileged. It is solely for the use of the intended recipient(s).'
/* v2 with the 29 Sep layout: the entity and the new lines start at their defaults, the member's own details carry over */
/* v3 (29 Sep, the entity default changed): a signature saved before starts again from the new default entity and lines,
   keeping the member's own details */
/* v4 (8 Oct, the company under the name by default): the same, so every saved signature takes the new default */
const KEY = 'iaq.signature.v4', OLDS = ['iaq.signature.v3', 'iaq.signature.v2', 'iaq.signature.v1']
const MINE = ['name', 'title', 'dept', 'email', 'mobile', 'office', 'addr', 'tel', 'host', 'photo', 'photoUrl']
const DEF = {
  name: '', title: '', dept: '', email: '', mobile: '', office: 'hq', addr: OFFICES[0].addr, tel: OFFICES[0].tel,
  entity: 'technology', company: ENTITIES[0].name, reg: ENTITIES[0].reg, site: 'iaqtechnology.com.my',
  tagline: true, banner: true, certs: 'my', note: true, photo: false, photoUrl: '', under: true,
  /* 8 Oct (client: "instead of company, to put our linkedin page here, beside the address") */
  linkedin: true, liUrl: 'https://www.linkedin.com/company/iaq-group-of-companies/', liText: 'IAQ Group',
  host: typeof location !== 'undefined' ? location.origin : '',
}
/* 7 Oct (client: "fix the phone template like this: +xxxx-xxx xxxx"): a Malaysian number is written country code and
   prefix, a hyphen, then the number in two groups: +6012-693 0642, +6011-1234 5678, and for a fixed line +603-5124 8319.
   A number typed from 0 is taken as Malaysian. Other countries' numbers stay as typed. */
function fmtPhone (s) {
  const t = String(s || '').trim()
  let d = t.replace(/\D/g, '')
  if (!d) return t
  if (!t.startsWith('+') && d.startsWith('0')) d = '6' + d
  if (!d.startsWith('60')) return t
  const r = d.slice(2)
  const pre = /^[18]/.test(r) ? r.slice(0, 2) : r.slice(0, 1), n = r.slice(pre.length)
  const cut = n.length === 8 ? 4 : n.length === 7 || n.length === 6 ? 3 : 0
  return cut ? `+60${pre}-${n.slice(0, cut)} ${n.slice(cut)}` : t
}
/* certs was on or off before 7 Oct; it is now the set of marks: 'my', 'sg' or '' for none */
const marksOf = v => v === true ? 'my' : v === false ? '' : v || ''
const tidy = f => ({ ...f, mobile: fmtPhone(f.mobile), tel: fmtPhone(f.tel), certs: marksOf(f.certs) })
function load () {
  try {
    const now = localStorage.getItem(KEY)
    if (now) return tidy({ ...DEF, ...JSON.parse(now) })
    const old = JSON.parse(OLDS.map(k => localStorage.getItem(k)).find(Boolean) || '{}')
    return tidy({ ...DEF, ...Object.fromEntries(MINE.filter(k => old[k] !== undefined).map(k => [k, old[k]])) })
  } catch { return DEF }
}
const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const telHref = s => 'tel:' + String(s || '').replace(/[^\d+]/g, '')
const bare = s => String(s || '').replace(/^https?:\/\//, '').replace(/\/$/, '')
/* an address in two lines of about equal length: a typed line break wins; otherwise the comma nearest the middle */
const addrLines = s => {
  const t = String(s || '').trim()
  if (/\n/.test(t)) return t.split(/\s*\n\s*/).filter(Boolean)
  const cuts = [...t.matchAll(/,\s*/g)].map(m => m.index + 1)
  if (!cuts.length) return [t]
  const at = cuts.reduce((b, c) => Math.abs(c - t.length / 2) < Math.abs(b - t.length / 2) ? c : b)
  return [t.slice(0, at), t.slice(at).trim()].filter(Boolean)
}

/* the signature itself, as an email client needs it */
function build (f) {
  f = tidy(f)
  const ink = '#0C1220', soft = '#48536A', faint = '#6B7588', red = '#EC2027'
  /* 29 Sep ("email signature need to use this font", Brand OS v4.1): the house faces, all three in Microsoft 365 and
     Windows with no install, so Outlook shows them: Aptos Display for the name and the slogan, Aptos for the text,
     Bahnschrift for the labels and the registration line. Each stack falls back to Segoe UI, then Arial, where they
     are not on the reader's machine. */
  const font = "font-family:Aptos,'Segoe UI',Arial,Helvetica,sans-serif;"
  const display = "font-family:'Aptos Display',Aptos,'Segoe UI',Arial,Helvetica,sans-serif;"
  const spec = "font-family:Bahnschrift,'Segoe UI',Arial,Helvetica,sans-serif;"
  const img = n => esc(f.host.replace(/\/$/, '')) + '/assets/email/' + n
  const W = SIG_W
  /* every cell carries its own line height, or the client's leading (and the portal's) opens the lines up */
  const td = (style, html, attrs = '') => `<td ${attrs}style="${font}mso-line-height-rule:exactly;${style}">${html}</td>`
  const table = (inner, attrs = '', style = '') => `<table cellpadding="0" cellspacing="0" border="0" role="presentation" ${attrs}style="border-collapse:collapse;${style}">${inner}</table>`
  const rows = []

  /* 1 · who, and the logo; the red rule under both */
  const who = [
    `<div style="${display}font-size:21px;line-height:26px;font-weight:bold;color:${ink};">${esc(f.name || 'Your name')}</div>`,
    `<div style="font-size:14px;line-height:20px;color:${soft};padding-top:2px;">${esc(f.title || 'Job title')}${f.dept ? ' &middot; ' + esc(f.dept) : ''}</div>`,
    /* 7 Oct (client: "we can remove our entity from here, or we can maintain this"): off by default, since the company now
       leads the address; a tick puts it back */
    /* 8 Oct (client, after: "or we can maintain this", "and to include registration number here"): kept under the name
       by default, with its registration number beside it; the address then goes without it */
    f.under && f.company ? `<div style="font-size:13px;line-height:18px;font-weight:bold;color:${ink};padding-top:6px;">${esc(f.company)}${f.reg ? ` <span style="font-weight:normal;color:${soft};">&middot; ${esc(f.reg)}</span>` : ''}</div>` : '',
  ].join('')
  const logo = `<img src="${img('iaq-signature-logo.png')}" width="120" height="50" alt="IAQ" style="display:block;border:0;outline:none;width:120px;height:50px;margin-left:auto;">`
    + (f.tagline ? `<div style="font-size:9.5px;line-height:13px;color:${ink};padding-top:3px;text-align:right;white-space:nowrap;">Your Total Facility Solutions Provider</div>` : '')
  /* 29 Sep ("add profile picture. so can check or uncheck"): the member's photo, square (no round corners), beside the name.
     It loads from the Photo link; an uploaded file shows in the preview only (photoPreview), since inboxes block images
     carried inside the message */
  const photoSrc = f.photo ? (String(f.photoUrl || '').trim() || f.photoPreview || '') : ''
  const photo = photoSrc ? td('vertical-align:top;padding-right:16px;', `<img src="${esc(photoSrc)}" width="76" height="76" alt="${esc(f.name || 'Photo')}" style="display:block;border:0;outline:none;width:76px;height:76px;object-fit:cover;">`, 'valign="top" width="92" ') : ''
  rows.push(td(`padding:0 0 14px 0;border-bottom:2px solid ${red};`,
    table(`<tr>${photo}${td('vertical-align:top;line-height:18px;', who, 'valign="top" ')}${td('vertical-align:top;text-align:right;line-height:13px;', logo, 'valign="top" align="right" width="190" ')}</tr>`, `width="${W}" `, `width:${W}px;`)))

  /* 2 · reach, 29 Sep ("use this icon on the email signature"): each line leads with the site's own line icon in red
     (components/FlowIcon.jsx, drawn as 16px PNGs in assets/email/sig-ic-*.png, since Outlook and Gmail do not show SVG):
     mobile and email on the left, the office phone and the website on the right, two equal halves. The icon's alt text is
     the old label, so a reader with images held back still sees Mobile, Email, Office and Web. */
  const IC = 24, VAL = W / 2 - IC
  const icon = (n, alt) => '<img src="' + img('sig-ic-' + n + '.png') + '" width="16" height="16" alt="' + alt + '" style="display:block;border:0;width:16px;height:16px;">'
  const pair = (k, v) => k ? td('vertical-align:middle;padding:0;height:26px;', icon(...k), 'width="' + IC + '" valign="middle" ') + td('font-size:13px;line-height:26px;color:' + ink + ';padding-right:12px;vertical-align:middle;', v, 'width="' + VAL + '" valign="middle" ')
    : td('', '', 'width="' + IC + '" ') + td('', '', 'width="' + VAL + '" ')
  const link = (href, text) => '<a href="' + href + '" style="color:' + ink + ';text-decoration:none;">' + esc(text) + '</a>'
  const left = [f.mobile && [['mobile', 'Mobile'], link(telHref(f.mobile), f.mobile)], f.email && [['mail', 'Email'], link('mailto:' + esc(f.email), f.email)]].filter(Boolean)
  const right = [f.tel && [['phone', 'Office'], link(telHref(f.tel), f.tel)], f.site && [['globe', 'Web'], link('https://' + esc(bare(f.site)), bare(f.site))]].filter(Boolean)
  const n = Math.max(left.length, right.length)
  if (n) {
    let grid = ''
    for (let i = 0; i < n; i++) grid += '<tr>' + pair(...(left[i] || [])) + pair(...(right[i] || [])) + '</tr>'
    rows.push(td('padding:12px 0 0 0;', table(grid, 'width="' + W + '" ', 'width:' + W + 'px;')))
  }
  /* the address, 29 Sep ("the same font size but make it equally two lines", "make same spacing"): 13px on the same 26px
     rhythm as the contact rows, no extra gap before it, in two lines
     of about equal length, broken at the comma nearest the middle (addrLines). A line break typed in the Address box wins. */
  /* 7 Oct (client: "next to this address, should be company"): the entity, in bold with its registration number, leads
     the address, and leaves the foot */
  const firm = f.company && !f.under ? '<b>' + esc(f.company) + '</b>' + (f.reg ? ' <span style="color:' + soft + ';">&middot; ' + esc(f.reg) + '</span>' : '') : ''
  /* 8 Oct (client: "instead of company, to put our linkedin page here, beside the address"): the address takes the left
     half and IAQ's LinkedIn page the right, under the office phone and the website, on the same columns. In its half the
     address wraps by itself (a line break typed in the box still wins); on its own it keeps the two balanced lines. */
  const li = f.linkedin && String(f.liUrl || '').trim()
  const addrHtml = [firm, ...(li && !/\n/.test(String(f.addr || '')) ? [esc(String(f.addr || '').trim())] : addrLines(f.addr).map(esc))].filter(Boolean).join('<br>')
  const pinCell = td('vertical-align:top;padding-top:5px;', icon('pin', 'Address'), 'width="' + IC + '" valign="top" ')
  const addrCell = (w, pad) => td('font-size:13px;line-height:19px;padding-top:4px;color:' + ink + ';vertical-align:top;' + pad, addrHtml, (w ? 'width="' + w + '" ' : '') + 'valign="top" ')
  const liCells = li ? td('vertical-align:top;padding-top:5px;', icon('linkedin', 'LinkedIn'), 'width="' + IC + '" valign="top" ')
    + td('font-size:13px;line-height:19px;padding-top:4px;color:' + ink + ';vertical-align:top;', link(esc(li), f.liText || 'LinkedIn'), 'width="' + VAL + '" valign="top" ') : ''
  if (f.addr || firm || li) rows.push(td('padding:0;', table('<tr>' + (li ? pinCell + addrCell(VAL, 'padding-right:12px;') + liCells : pinCell + addrCell(0, '')) + '</tr>', 'width="' + W + '" ', 'width:' + W + 'px;')))

  /* 3 · the banner (29 Sep: "i want this design banner", "remove the line", and the boss: "i mentioned engineers in the
     visuals", "no red graident should exist"). One image: a solid red panel with a hard edge (no gradient) beside a
     cleanroom where two gowned engineers check a valve and a tablet by the
     stainless process piping, the slogan in white Aptos Display Bold (29 Sep: "use this font"), centred (assets/email/
     sig-banner.jpg, 1280 x 168 for a 640 x 84 slot,
     composed over a generated photograph so the text is exact). The slogan is its alt text. */
  if (f.banner) {
    rows.push(td('padding:18px 0 0 0;font-size:0;line-height:0;', '<img src="' + img('sig-banner.jpg') + '" width="' + W + '" height="84" alt="' + esc(SLOGAN.join(' ')) + '" style="display:block;border:0;outline:none;width:' + W + 'px;height:84px;background:' + red + ';color:#ffffff;' + display + 'font-size:15px;font-weight:bold;">'))
  }

  /* 7 Oct (client: "and remove here"): the entity and registration have moved up to the address, so the foot is the
     marks alone, from the left, and the confidentiality line.
     4 · the foot, 29 Sep ("maybe the logo can move there"): under the banner, the entity and its registration on the
     left and the footer's four marks on the right, in one row (one height, the footer's order; the Intertek mark carries
     the ISO standards itself). The confidentiality line, when on, runs under the row. */
  const mark = ([file, w, alt], i) => td('vertical-align:middle;padding-left:' + (i ? 12 : 0) + 'px;', '<img src="' + img(file) + '" width="' + w + '" height="34" alt="' + alt + '" style="display:block;border:0;width:' + w + 'px;height:34px;">', 'valign="middle" ')
  const set = f.certs === 'my' ? CERTS.map(([file, w, alt]) => [file, Math.round(w * 34 / 40), alt])
    : f.certs === 'sg' && f.sgW ? [[SG_MARKS, f.sgW, SG_TEXT.replace(/ · /g, ', ')]] : []
  /* 8 Oct: the Singapore marks without the strip: the bizSAFE Star logo alone (the ISO and BCA names beside it came off:
     "no need this") */
  const sgRow = () => table('<tr>' + mark(SG_BIZSAFE, 0) + '</tr>')
  const marks = set.length ? table('<tr>' + set.map(mark).join('') + '</tr>')
    : f.certs === 'sg' ? sgRow() : ''
  if (marks) rows.push(td('padding:14px 0 0 0;', marks))
  if (f.note) rows.push(td('padding:10px 0 0 0;font-size:11.5px;line-height:17px;color:' + faint + ';', esc(NOTE)))

  return table(rows.map(r => `<tr>${r}</tr>`).join(''), `width="${W}" `, `${font}color:${ink};width:${W}px;`)
}
function plain (f) {
  f = tidy(f)
  const firm = f.company && f.company + (f.reg ? ' · ' + f.reg : '')
  return [f.name, [f.title, f.dept].filter(Boolean).join(' · '), f.under && firm, '',
    f.mobile && 'Mobile  ' + f.mobile, f.email && 'Email   ' + f.email, f.tel && 'Office  ' + f.tel, f.site && 'Web     ' + bare(f.site),
    !f.under && firm, f.addr, f.linkedin && f.liUrl && 'LinkedIn  ' + bare(f.liUrl), '', f.banner && SLOGAN.join(' '),
    f.certs === 'sg' && !f.sgW && 'bizSAFE Star', f.note && NOTE].filter(v => v !== false && v !== undefined && v !== null).join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

export default function SignatureGen () {
  const [f, setF] = useState(load)
  const [done, setDone] = useState('')
  const prev = useRef(null)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(f)) } catch {} }, [f])
  const [photoPreview, setPhotoPreview] = useState('')
  /* the Singapore marks image, once IAQ supplies it: its width at 34px high, or 0 while it is missing */
  const [sgW, setSgW] = useState(0)
  useEffect(() => { const i = new Image(); i.onload = () => i.naturalHeight && setSgW(Math.round(i.naturalWidth * 34 / i.naturalHeight)); i.src = '/assets/email/' + SG_MARKS }, [])
  const html = useMemo(() => build({ ...f, photoPreview, sgW }), [f, photoPreview, sgW])
  /* the preview shows the whole signature: narrower than the signature, the panel scales it down to fit (the preview
     only; what is copied keeps its true size). The panel and the signature share the page's zoom, so the widths compare
     directly. */
  useEffect(() => {
    const el = prev.current; if (!el) return
    const box = el.parentElement
    const fit = () => {
      const cs = getComputedStyle(box)
      const w = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      el.style.zoom = w > 0 && w < SIG_W ? String(w / SIG_W) : ''
    }
    const ro = new ResizeObserver(fit); ro.observe(box); fit()
    return () => ro.disconnect()
  }, [])
  const set = k => e => { const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value; setF(o => ({ ...o, [k]: v })) }
  const pickOffice = e => { const o = OFFICES.find(x => x.id === e.target.value) || OFFICES[0]; setF(p => ({ ...p, office: o.id, addr: o.id === 'other' ? '' : o.addr, tel: o.tel })) }
  /* an uploaded photo shows in the preview only; it is not saved, and recipients need the Photo link */
  const pickPhoto = e => { const file = e.target.files && e.target.files[0]; if (!file) return; const r = new FileReader(); r.onload = () => setPhotoPreview(String(r.result)); r.readAsDataURL(file) }
  /* the entity brings its marks: the Singapore company the Singapore set, the others the Malaysian one (unless they are off) */
  const pickEntity = e => { const x = ENTITIES.find(y => y.id === e.target.value) || ENTITIES[0]; setF(p => ({ ...p, entity: x.id, company: x.name, reg: x.reg, certs: p.certs ? x.marks || 'my' : '' })) }
  const fmt = k => () => setF(o => ({ ...o, [k]: fmtPhone(o[k]) }))
  const flash = t => { setDone(t); clearTimeout(flash.t); flash.t = setTimeout(() => setDone(''), 2600) }
  const missing = ['name', 'title', 'email'].filter(k => !String(f[k] || '').trim())

  const copyRich = async () => {
    try {
      if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([plain(f)], { type: 'text/plain' }) })])
        return flash('Signature copied. Paste it into your mail app’s signature box.')
      }
    } catch {}
    /* older browsers: select the preview itself and copy the selection */
    try { const r = document.createRange(); r.selectNodeContents(prev.current); const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand('copy'); s.removeAllRanges(); flash('Signature copied.') } catch { flash('Copy failed. Select the preview and copy it by hand.') }
  }
  const copyHtml = async () => { try { await navigator.clipboard.writeText(html); flash('HTML copied.') } catch { flash('Copy failed.') } }
  const download = () => {
    const doc = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(f.name || 'IAQ')} signature</title></head><body>${html}</body></html>`
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([doc], { type: 'text/html' })); a.download = `iaq-signature-${(f.name || 'member').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.htm`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  }

  return (
    <div className="sg">
      <form className="sg-form" onSubmit={e => e.preventDefault()} aria-label="Your details">
        <fieldset>
          <legend>You</legend>
          <label><span>Full name</span><input value={f.name} onChange={set('name')} autoComplete="name" placeholder="Nur Aisyah binti Rahman" /></label>
          <label><span>Job title</span><input value={f.title} onChange={set('title')} autoComplete="organization-title" placeholder="Senior Project Engineer" /></label>
          <label><span>Department <em>optional</em></span><input value={f.dept} onChange={set('dept')} placeholder="EPC" /></label>
          <label><span>Company</span>
            <select value={f.entity} onChange={pickEntity}>{ENTITIES.map(x => <option key={x.id} value={x.id}>{x.id === 'other' ? 'Other (type it below)' : x.name}</option>)}</select>
          </label>
        </fieldset>
        <fieldset>
          <legend>Reach you</legend>
          <label><span>Email</span><input type="email" value={f.email} onChange={set('email')} autoComplete="email" placeholder="name@iaqtechnology.com.my" /></label>
          <label><span>Mobile <em>optional</em></span><input type="tel" value={f.mobile} onChange={set('mobile')} onBlur={fmt('mobile')} autoComplete="tel" placeholder="+6012-345 6789" /></label>
          <label><span>Office</span>
            <select value={f.office} onChange={pickOffice}>{OFFICES.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}</select>
          </label>
          <label><span>Office phone <em>optional</em></span><input type="tel" value={f.tel} onChange={set('tel')} onBlur={fmt('tel')} /></label>
          <label className="sg-wide"><span>Address</span><textarea rows={3} value={f.addr} onChange={set('addr')} /></label>
        </fieldset>
        <fieldset>
          <legend>Profile picture</legend>
          <label className="sg-check"><input type="checkbox" checked={!!f.photo} onChange={set('photo')} /><span>Show my photo beside my name</span></label>
          {f.photo && <>
            <label className="sg-wide"><span>Photo link</span><input type="url" value={f.photoUrl} onChange={set('photoUrl')} placeholder="https://… a square photo, at least 152 × 152" />
              <small className="sg-hint">The web address of your photo (the company site, SharePoint shared as public, or LinkedIn). Inboxes load it from there.</small></label>
            <label className="sg-wide"><span>Or upload to preview <em>this computer only</em></span><input type="file" accept="image/*" onChange={pickPhoto} /></label>
          </>}
        </fieldset>
        <fieldset>
          <legend>Lines</legend>
          <label className="sg-check"><input type="checkbox" checked={f.tagline} onChange={set('tagline')} /><span>Tagline under the logo, Your Total Facility Solutions Provider</span></label>
          <label className="sg-check"><input type="checkbox" checked={f.banner} onChange={set('banner')} /><span>Banner, Engineered environments. Trusted outcomes. (the cleanroom image)</span></label>
          <label className="sg-check"><input type="checkbox" checked={!!f.linkedin} onChange={set('linkedin')} /><span>LinkedIn page beside the address ({f.liText || 'LinkedIn'})</span></label>
          <label className="sg-check"><input type="checkbox" checked={!!f.under} onChange={set('under')} /><span>Company and registration no. under my name (untick to put them with the address instead)</span></label>
          <label className="sg-wide"><span>Certification marks</span>
            <select value={f.certs} onChange={set('certs')}>
              <option value="my">Malaysia: CIDB, Intertek, UKAS and Highwire</option>
              <option value="sg">Singapore: bizSAFE Star</option>
              <option value="">None</option>
            </select>
          </label>
          <label className="sg-check"><input type="checkbox" checked={f.note} onChange={set('note')} /><span>Confidentiality note</span></label>
        </fieldset>
        <details className="sg-more">
          <summary>Company name, registration, website and image address</summary>
          <label><span>Company name</span><input value={f.company} onChange={set('company')} /></label>
          <label><span>Registration no. <em>optional</em></span><input value={f.reg} onChange={set('reg')} placeholder={f.entity === 'sg' ? 'UEN' : '200001031412 (534019-T)'} /></label>
          <label><span>Website</span><input value={f.site} onChange={set('site')} /></label>
          <label><span>LinkedIn page</span><input type="url" value={f.liUrl} onChange={set('liUrl')} /></label>
          <label><span>LinkedIn label</span><input value={f.liText} onChange={set('liText')} placeholder="IAQ Group" /></label>
          <label className="sg-wide"><span>Image address</span><input value={f.host} onChange={set('host')} />
            <small>The logo, the photograph and the marks load from this address in every inbox. Point it at the live site once it is published.</small></label>
        </details>
      </form>

      <div className="sg-out">
        <div className="sg-stage" aria-label="Preview">
          <div className="sg-mail"><span className="sg-mail-l">Kind regards,</span></div>
          <div ref={prev} className="sg-prev" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        {missing.length > 0 && <p className="sg-need">Still to fill in: {missing.map(k => ({ name: 'full name', title: 'job title', email: 'email' }[k])).join(', ')}.</p>}
        {f.photo && !String(f.photoUrl || "").trim() && <p className="sg-need">{photoPreview ? "The photo shows here from this computer only. Add a Photo link so it shows in other people's inboxes." : "Profile picture is on: add a Photo link (or upload one to preview)."}</p>}
        {/localhost|127\.0\.0\.1|192\.168\./.test(f.host) && <p className="sg-need">The images load from {f.host}, which only this computer can reach: in anyone else’s inbox they will not show. Set the image address to the live site (Company name, registration, website and image address, below the form) before copying.</p>}
        <div className="sg-acts">
          <button type="button" className="sg-go" onClick={copyRich}>Copy signature</button>
          <button type="button" onClick={copyHtml}>Copy HTML</button>
          <button type="button" onClick={download}>Download .htm</button>
        </div>
        <p className="sg-done" aria-live="polite">{done}</p>
        <ol className="sg-how">
          <li><b>Outlook</b><span>Settings, Mail, Compose and reply, Email signature. New signature, paste, save.</span></li>
          <li><b>Gmail</b><span>Settings, See all settings, General, Signature. Create new, paste, save at the bottom of the page.</span></li>
          <li><b>Apple Mail</b><span>Settings, Signatures. Add one, untick "Always match my default message font", paste.</span></li>
        </ol>
      </div>
    </div>
  )
}

/* 29 Sep: shared with the Designs catalogue (portal/SigCatalogue.jsx), which renders other layouts from the same saved
   details, faces and images; the generator above is unchanged */
export { fmtPhone as sigPhone, build as buildHouse, load as loadSig, esc as sigEsc, telHref as sigTel, bare as sigBare, SIG_W }
