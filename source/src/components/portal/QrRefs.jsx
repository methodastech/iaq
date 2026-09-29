import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import '../../styles/qr-refs.css'

/* ============================================================================
   QrRefs · 29 Sep 2026. "add marketing and sub QR code", then "the sub nav for QR code is just that we put QR code for
   reference". The Marketing group's QR code page: the codes the team uses, kept in one place to look up and download.
   Each code is one entry in CODES below; add a line and the page shows it. Site pages are written as a path and point
   at the address the portal runs on (the review site on Netlify), or at the live site when the portal runs on this
   computer, since a code that opens localhost works for nobody who scans it.
   ============================================================================ */
const LIVE = 'https://iaq.netlify.app'
const CODES = [
  { id: 'website', label: 'Website', note: 'The home page', path: '/' },
  { id: 'lead', label: 'Start a project', note: 'The lead form page, for ads, print and the booth', path: '/lp/project' },
  { id: 'contact', label: 'Contact', note: 'Offices, phone and the enquiry form', path: '/contact' },
  { id: 'linkedin', label: 'LinkedIn', note: 'IAQ Group of Companies', url: 'https://www.linkedin.com/company/iaq-group-of-companies/' },
]
const INK = '#0C1220'
const local = typeof location !== 'undefined' && /^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname)
const BASE = typeof location === 'undefined' || local ? LIVE : location.origin
const urlOf = c => c.url || BASE.replace(/\/$/, '') + c.path
const opts = { errorCorrectionLevel: 'M', margin: 2, color: { dark: INK, light: '#FFFFFF' } }

function save (href, name) {
  const a = document.createElement('a'); a.href = href; a.download = name; a.click()
}

function Code ({ c }) {
  const url = urlOf(c)
  const [png, setPng] = useState('')
  useEffect(() => { QRCode.toDataURL(url, { ...opts, width: 1024 }).then(setPng).catch(() => setPng('')) }, [url])
  const svg = async () => {
    const s = await QRCode.toString(url, { ...opts, type: 'svg' })
    const href = URL.createObjectURL(new Blob([s], { type: 'image/svg+xml' }))
    save(href, `iaq-qr-${c.id}.svg`); setTimeout(() => URL.revokeObjectURL(href), 2000)
  }
  return (
    <article className="qr-card">
      <div className="qr-img">{png ? <img src={png} alt={'QR code for ' + c.label} width="220" height="220" /> : <span className="qr-wait" />}</div>
      <div className="qr-tx">
        <h3>{c.label}</h3>
        <p>{c.note}</p>
        <a className="qr-url" href={url} target="_blank" rel="noopener noreferrer">{url.replace(/^https?:\/\//, '')}</a>
      </div>
      <div className="qr-acts">
        <button type="button" onClick={() => png && save(png, `iaq-qr-${c.id}.png`)} disabled={!png}>PNG</button>
        <button type="button" onClick={svg}>SVG</button>
      </div>
    </article>
  )
}

export default function QrRefs () {
  return (
    <div className="qr">
      <p className="qr-base">Site pages point at <b>{BASE.replace(/^https?:\/\//, '')}</b>.</p>
      <div className="qr-grid">{CODES.map(c => <Code key={c.id} c={c} />)}</div>
    </div>
  )
}
