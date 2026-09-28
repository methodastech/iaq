import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CodexSlides from '../components/CodexSlides.jsx'
import * as CMS from '../lib/cms.js'

/* /codex/slides · the infographic set on its own, one slide under another, for export to the
   company profile (tools/export-codex-slides-0918.mjs) and for a booth screen. Member session
   only, review builds only. */
export default function CodexSlidesView() {
  const [authed, setAuthed] = useState(CMS.isAuthed())
  useEffect(() => { document.title = 'IAQ Group · Codex slides · Brand Method' }, [])
  useEffect(() => CMS.onAuth(() => setAuthed(CMS.isAuthed())), [])
  if (!authed) return <div style={{ padding: '120px 24px' }}><p>The slides are a member page. <Link to="/codex">Sign in on the Codex.</Link></p></div>
  return <div className="cxsv"><CodexSlides /></div>
}
