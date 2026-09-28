import React from 'react'
import SiteMock from '../components/codex/SiteMock.jsx'
import '../styles/pages.css'

/* review-only harness for the Codex's section 3 (the website portrayal), so it can be built and checked on its own.
   Not linked anywhere; the Codex itself renders <SiteMock/> inside the portal. */
export default function CodexSitePreview() {
  return <div style={{ background: 'var(--bg)', padding: '40px var(--gut)' }}><div className="pg-in"><SiteMock /></div></div>
}
