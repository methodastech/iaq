import ContactCta from '../components/ContactCta.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import { PROJECTS } from '../data/projects.js'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import RegistryBanner from '../components/RegistryBanner.jsx'
import FooterNav from '../components/FooterNav.jsx'
import CloseAmbient from '../components/CloseAmbient.jsx'
import initProjectsPage from '../scenes/projects.js'
import '../styles/pages.css'
import '../styles/console.css'   /* the shared filter console; must load before the page sheet */
import '../styles/projects.css'

export default function Projects() {
  const navigate = useNavigate()
  useEffect(() => {
    document.title = 'IAQ Group · Projects · Brand Method'
    return initProjectsPage({ navigate })
  }, [])
  return (
    <>
      <Nav />

      <RegistryBanner shown={18} />

      <div className="console" id="console"><div className="wrap">
        <div className="row">
          <label className="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg><input id="q" type="search" placeholder="Search project, sector, location" aria-label="Search projects" /></label>
          <button className="fbtn" id="fbtn" type="button" aria-expanded="false" aria-controls="fpanel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18l-7 8.5V19l-4 2v-7.5z" /></svg>Filter<span className="fcount" id="fcount" hidden>0</span><svg className="fcar" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg></button>
          <button className="clearbtn" id="clear" type="button">Reset</button>
          <span className="readout" id="readout" role="status" aria-live="polite"></span>
        </div>
        {/* `inert` (with visibility:hidden in the stylesheet) takes the 18 chips and 4 sort
            buttons out of the tab order while the panel is closed. max-height:0 + overflow:
            hidden only CLIPPED them, so tabbing out of the search box dropped into 22
            controls that were off screen and that the button had just declared closed. The
            fbtn handler clears the attribute alongside aria-expanded. */}
        <div className="fpanel" id="fpanel" inert={true}>
          <div className="row">
            <span className="flabel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V9l6 4V9l6 4V5l6-2v18z" /></svg>Industry</span>
            <div className="chips" id="fIndustry"></div>
          </div>
          <div className="row">
            <span className="flabel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 11-8 11s-8-5-8-11a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="2.6" /></svg>Location</span>
            <div className="chips" id="fRegion"></div>
          </div>
          <div className="row">
            <span className="flabel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" /></svg>Tag</span>
            <div className="chips" id="fType"></div>
          </div>
          <div className="row">
            <div className="sortseg" id="sortSeg" role="group" aria-label="Sort projects">
              <span className="ss-lab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 5h10M11 9h7M11 13h4M3 17h18" /><path d="M5.5 5v9M3 11.5L5.5 14 8 11.5" /></svg>Sort</span>
              <button type="button" className="ss on" data-v="default">Featured</button>
              <button type="button" className="ss" data-v="az">A&ndash;Z</button>
              <button type="button" className="ss" data-v="industry">Industry</button>
            </div>
          </div>
        </div>
      </div></div>

      <main className="wrap">
        <h2 className="u-sr" id="reg-h">Project registry</h2>
        <div className="reg" id="reg" aria-labelledby="reg-h"></div>
        {/* the copy used to promise a feature that does not exist ("on the production site
            this state suggests the nearest matches"). The recovery chips below are built by
            the scene from the facets that are actually active, so each one clears itself by
            name and the two largest remaining facets offer a way onward. */}
        <div className="empty" id="empty">
          <h3>Try another combination</h3>
          <p>Clear one of these to get back to the record.</p>
          <div className="emp-acts" id="empActs"></div>
        </div>
        {/* ── What is on screen, and where to go next ──────────────────────────
            The grid used to run straight into the dark contact band, so a visitor
            who had just filtered the record was told nothing about the shape of it
            and offered no route onward. Both splits are computed from PROJECTS. */}
      </main>

      {/* 21 Sep: the inline copy of the closing band is gone; the shared, rebuilt one renders here */}
      <ClosingBand note="Registry concept · Brand Method" />
    </>
  )
}
