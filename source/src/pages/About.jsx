import VisionMission from '../components/VisionMission.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import ContactCta from '../components/ContactCta.jsx'
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import FooterNav from '../components/FooterNav.jsx'
import CloseAmbient from '../components/CloseAmbient.jsx'
import initAbout from '../scenes/about.js'
import ValuesGrid from '../components/ValuesGrid.jsx'
import '../styles/about.css'

export default function About() {
  useEffect(() => {
    document.title = 'IAQ Group \u00b7 About \u00b7 Brand Method'
    return initAbout()
  }, [])
  return (
    <>
      <Nav />

<header className="ab-hero" id="top">
  <div className="plx-back" data-speed="0.22">
    {/* 25 Sep (Bazil: "use accurate visuals and video of IAQ", "make a video out of the photos they have"): the generated
        campus is gone. The hero is IAQ's own headquarters in Shah Alam from the air (HQ Offices, TianChad drone shot
        0001), an 8 s slow move cut from the photograph like the home reel; the still behind it is the same frame. */}
    {/* 26 Sep, small hours (Bazil: "where's the video of the factory here"): the plant, not the HQ. IAQ's own drone photograph of
        the Kuching plant at dusk, the 8 s slow move cut from it, the still behind it the same frame. */}
    {/* 25 Sep, 05:20 (Bazil, on the plant clip that another session had put here at 05:16: "where is the video of red
        line factory, should just leave that one here"): the campus-at-dusk clip with the red band at the eaves stays on
        this hero by his instruction. It is the site's concept footage, not a photograph of an IAQ site: the client's
        24 Sep rule on generated footage is on record, and this is the one place it is set aside on purpose. */}
    <div className="ph-slot dark"><img className="hero-img" src="/assets/hero-campus-dusk.webp" alt="" /></div>
    <div className="ab-video" aria-hidden="true"><video id="abVid" muted loop playsInline autoPlay preload="metadata" poster="/assets/hero-campus-dusk.webp"><source src="/assets/hero-campus-dusk.mp4" type="video/mp4" /></video></div>
    <div className="ab-scrim" aria-hidden="true"></div>
    <canvas className="ab-part" id="abPart" aria-hidden="true"></canvas>
  </div>
  <div className="plx-mid" data-speed="0.45" aria-hidden="true"><span>1995</span></div>
  <div className="head wrap">
    <span className="eyebrow">About IAQ</span>
    <h1 id="heroH">Engineering trust, <em>since 1995.</em></h1>
    <p className="lede">IAQ is a Malaysian total facility solutions provider. For 31 years it has designed, built and maintained hi-tech facilities through three business units.</p>
    <div className="head-stats">
      <div className="hchip"><svg className="hic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5S14.5 18.2 12 20.5c-2.5-2.3-3.8-5.2-3.8-8.5S9.5 5.8 12 3.5z"/></svg><b data-count="7">0</b><span>Countries</span></div>
      <div className="hchip"><svg className="hic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="8.5" cy="8" r="3.2"/><circle cx="16.5" cy="9.5" r="2.6"/><path d="M2.8 19.5c1.1-3.2 3.2-4.9 5.7-4.9s4.6 1.7 5.7 4.9M14 15c2.1.3 3.8 1.8 4.8 4.3"/></svg><b data-count="450">0</b><span>People</span></div>
      <div className="hchip"><svg className="hic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l8 4.3-8 4.3-8-4.3z"/><path d="M4 12l8 4.3 8-4.3M4 16.4l8 4.3 8-4.3"/></svg><b><span data-count="250">0</span>+</b><span>Projects delivered</span></div>
      <div className="hchip"><svg className="hic" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16"/><path d="M4 10h16M10 4v16"/></svg><b><span data-count="1050000">0</span> m&#178;</b><span>Of cleanroom built</span></div>
    </div>
  </div>
  {/* 22 Sep (Bazil: "better not be keep repeating"): the spec ticker that ran here said 1995, seven
      countries and 450 people again, directly under the chips that had just said them. It is gone, and
      the chips now carry only figures the headline and the lede do not. */}
</header>

<section className="manifesto man-light" id="story">
  {/* 17 Sep colour pass (client: the page is "just too WHITE"): the generated crew clip and its
      white scrim are gone. The band is IAQ's own photograph at full colour, the statement on a navy
      field to its left.
      22 Sep (Bazil, on the lithography bay that stood here, a yellow wall and an exit door: "wtf is
      this, what client wanted?"). It is the finished ballroom now (SharePoint, Cleanroom
      Photos/IMG_8578): the room IAQ is known for, and the light lines carry the eye into the text. */}
  {/* 25 Sep (Bazil: "where's the previous design where people working on ceiling, white background", "use that"): the
      crew clip is back (about-story-build.mp4, poster about-story-broll.webp) and the band is white again; the
      ballroom photograph and the navy field of 22 Sep are gone. The client's 17 Sep "too white" note is on record. */}
  {/* 26 Sep, small hours (Bazil: "please redesign this section and use an actual proper photo or video"): the crossfading
      strip and its white wash are gone. The statement stands left; on the right, one of IAQ\u2019s own cleanroom photographs
      (Cleanroom Photos, P1010242) in a crisp panel, full colour, square corners, no scrim. */}
  <div className="wrap man-split">
    <div className="man-copy">
    {/* shortened and de-highlighted on the 18 Aug review: the story read too long,
        and the red emphasis confused the audience */}
    {/* 17 Sep (client: "2 Paragraph of bold sentences is still too much. 2nd paragraph can be a
        descriptive sentences below the 1st paragraph"). One statement at full size; the second
        sentence drops to reading size and takes the old footnote's line with it, so the block
        says the same thing in one bold line and one paragraph instead of two bold slabs. */}
    <p className="mline" data-mline>IAQ began in 1995 with indoor air quality.</p>
    {/* 22 Sep: the line above says 1995 and the hero says seven countries, so this no longer says either again */}
    <p className="mdesc" data-mline>
      Three decades on, the same firm designs, procures, builds, commissions and maintains controlled environments to class, as one total facility solutions provider.
    </p>
    </div>
    <figure className="man-photo">
      <img src="/assets/iaq/cr-utilities-p1010242.webp" alt="A cleanroom delivered by IAQ: the white hall under its ceiling grid and light lines" loading="lazy" decoding="async" />
      <figcaption>A cleanroom delivered by IAQ</figcaption>
    </figure>
  </div>
</section>

{/* the years story moved to /about/history and the commitment block to
    /about/commitment (client, 28 Aug): the About dropdown offers three destinations, so
    Overview keeps only who IAQ is — the manifesto, the vision, the values and contact. */}

{/* Vision & mission: white, two quiet line drawings (3 Sep). See components/VisionMission.jsx. */}
<VisionMission />

<ValuesGrid />

{/* 25 Sep (Bazil: "remove this"): the four-photograph proof strip (headquarters, ISO 3, on site, the team) is gone */}

{/* the standalone Safety & ESH band left the page on the Prototype 3 rule (23 Aug):
    the About page carries exactly the sections the client listed. Its certificates
    and awards live in Corporate Commitment below; the full ESG story is /about/esg;
    the safety value is V-01. Markup in the .pre-proto3 backup. */}

{/* Corporate Commitment: policies, certificates and ISO in one prominent place,
    added on client feedback (16:11). Awards & certifications relocated here from
    the safety block (16:12): selected items only, the full list follows from IAQ.
    Drop-down list added on the 18 Aug review (01:08:29): Nabilah insisted the
    section carries a drop-down showing the corporate policies and certifications. */}
{/* Removed on client feedback, 16:12–16:14 · all four blocks live in git history:
    – "Three pillars" and the five-step spine (both already live on /services)
    – the globe footprint ("Rooted in Malaysia…") — reach is told on /global-presence
    – leadership ("The people accountable") — KIV, page remains at /about/leadership
    – the stats + corporate film block ("The numbers behind the confidence") */}

{/* 21 Sep: the inline copy of the closing band is gone; the shared, rebuilt one renders here */}
<ClosingBand note="About page concept · Brand Method" />
    </>
  )
}
