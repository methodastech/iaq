import React, { useEffect, useRef } from 'react'
import initFab3D, { STAGES, STAGE_COLOR } from '../scenes/fab3d.js'
import FabIcon from './FabIcon.jsx'
import '../styles/fab-assembly.css'

/* The pinned assembly. The SECTION is the scroll runway; the stage is sticky inside it.

   9 Sep: I briefly cut the Revit line from this rail believing nothing backed it, because I had
   searched for .rvt/.ifc/.dwg and found none. That was wrong, and the line is restored. The
   client's model IS here, as 57 rendered frames exported from it, in `_reference/fab-frames/`
   (d- desktop, m- mobile, built by keyframes.py). ALWAYS OPEN THAT FOLDER before judging the
   model: it is the source of truth for massing, level heights and the system palette.
   Rail on the left, the render on the right standing on its own ground, with the piles
   descending below it. All copy lives in STAGES so the rail and the counter cannot drift. */
export default function FabAssembly() {
  const ref = useRef(null)
  /* 17 Sep: a browser can refuse a WebGL context and then hand one over a moment later, which is
     what happens on a page holding several 3D scenes (and on a dev tab that has hot-reloaded all
     day). The first refusal used to be final and the section printed its no-WebGL message at a
     visitor whose browser does support it. One retry, a second later, and only then the fallback. */
  useEffect(() => {
    const root = ref.current
    let stop = initFab3D(root)
    let again = null
    if (root && root.dataset.nogl === '1') {
      again = setTimeout(() => {
        delete root.dataset.nogl
        stop = initFab3D(root)
      }, 1000)
    }
    return () => { if (again) clearTimeout(again); if (typeof stop === 'function') stop() }
  }, [])
  return (
    <section className="fab" id="fab" ref={ref} style={{ '--gy': 0.64 }}
             aria-label="The facility, layer by layer, from piles to tools">
      <div className="fab-stage">
        {/* 4 Sep (client: "the whole section is the canvas, not just the box"): the view fills the
            stage; the copy and rail float over it on the left */}
        <div className="fab-view">
            {/* the ground: a plane at pile-cap level, drawn by the page so the piles read as
                underground; it rises as the camera pulls back to the whole facility */}
            <div className="fab-ground" aria-hidden="true"><i className="fab-grid" /><i className="fab-glow" /></div>
            <canvas aria-label="Interactive 3D model of the facility. Drag to rotate." />
            {/* 10 Sep (Bazil: "put the UI properly", "no need this" on the scroll cue, "button
                size same with icon"). The legend was a floating 2x2 block, the zoom buttons three
                filled 32px slabs under it, and a third element, the scroll cue with its red bar,
                sat in the middle of the floor. Three pieces of chrome in three places on one
                canvas. It is ONE strip now, on one hairline, on one baseline: the four verbs on
                the left, the three controls on the right, the controls the size of a rail mark.
                The scroll cue is gone; the rail itself shows where you are. */}
            {/* 15 Sep (checklist d3, Nabilah: "callouts that appear and disappear generate too much; a legend is
                indicative and informative"): one fixed colour key for the eight systems replaces the pop-up
                callouts. The active system's row lights with the rail. Click-a-part naming stays. */}
            <ul className="fab-legend" aria-label="Colour key for the building systems">
              {STAGES.filter(s => s.k).map(s => (
                <li key={s.k} data-k={s.k} style={{ '--c': STAGE_COLOR[s.k] }}><i aria-hidden="true" /><span>{s.t}</span></li>
              ))}
            </ul>
            <div className="fab-ctl">
              <ul className="fab-keys" aria-label="How to use the model">
                <li><b>Scroll</b><span>build</span></li>
                <li><b>Drag</b><span>rotate</span></li>
                <li><b>Pinch or &plusmn;</b><span>zoom</span></li>
                <li><b>Click a part</b><span>name it</span></li>
              </ul>
              {/* 10 Sep audit: the scrub is tall (800vh since 22 Sep); a visitor who has seen enough needs a way
                  past it that is not twenty flicks of the wheel */}
              <button type="button" className="fab-skip" onClick={() => { const n = document.querySelector('#fab')?.nextElementSibling; if (!n) return; window.scrollTo({ top: n.getBoundingClientRect().top + window.scrollY - 70, behavior: 'auto' }) }}>Skip the build <span aria-hidden="true">&darr;</span></button>
              <div className="fab-zoom" role="group" aria-label="Model view controls">
                <button type="button" data-z="in" aria-label="Zoom in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="butt" strokeLinejoin="miter" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
                <button type="button" data-z="out" aria-label="Zoom out"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="butt" strokeLinejoin="miter" aria-hidden="true"><path d="M5 12h14"/></svg></button>
                <button type="button" data-z="reset" aria-label="Reset view"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="butt" strokeLinejoin="miter" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.7"/><path d="M4 4v5h5"/></svg></button>
              </div>
            </div>
          </div>
        <div className="fab-in wrap">

          <div className="fab-rail">
            <span className="eyebrow u-sig"><span data-scramble="">Built from the BIM</span></span>
            <h2>The facility, <em>layer by layer.</em></h2>
            <p className="fab-lede">
              Nine systems, in the order they are built on site, modelled to IAQ&rsquo;s own Revit
              coordination model of a working fab. Drag it, zoom it, scroll to build it.
            </p>

            <ol className="fab-stages">
              {STAGES.map((s, i) => (
                <li key={s.n}>
                  <button type="button" className="fab-st" aria-current={i === 0 ? 'step' : 'false'}
                          style={{ '--c': STAGE_COLOR[s.k || s.c] }}>
                    <span className="fab-st-ic" aria-hidden="true"><FabIcon k={s.k || s.c} /></span>
                    <span className="fab-st-n">{s.n}</span>
                    <span className="fab-st-b">
                      <b>{s.t}</b>
                      <span className="fab-st-d">{s.d}</span>
                      {/* 7 Sep (client: "more informative"): the build order of this system, in the
                          model's own part names, and a live count of what has landed */}
                      <span className="fab-st-seq">{s.seq}</span>
                      <span className="fab-st-ct" aria-live="off"></span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="fab-foot">
              <span className="fab-count" aria-live="polite">01 / 09 · Civil &amp; Structural</span>
            </div>
          </div>


        </div>
      </div>
    </section>
  )
}
