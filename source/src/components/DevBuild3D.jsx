import React, { useEffect, useRef, useState } from 'react'
import '../styles/dev-build-3d.css'
/* 25 Sep (Bazil: "ui is more to white modern theme", then "proceed"): the build view on white. false puts the developer's
   dark scene back (the bundle's light gradient in HC() is the one other change; its dark stops are in HANDOVER). */
/* 25 Sep, later (Bazil: "V1 Classic should be dark background, come on man", "this sky should be Technical Accuracy"): the
   page and V1 stay the developer's dark; the light panel theme follows the V2 skin inside the frame (skinSync below). */
const LIGHT_BUILD = false

/* ============================================================================
   DevBuild3D · the developer's "Scroll to build" 3D (delivery "3D ONLY (4)", 26 Sep 2026). Bazil: "here is the new
   parallax for the 3D that needs to be applied", then "optimise the experience very well", "smooth light optimised",
   "mobile version", "should also be able to enter the cleanroom", "most important loading screen, fast loads, light
   weight but detailed 3D", "very light, fast and easy to navigate, clear".

   The delivery is a compiled, self-contained app (public/3d) built around a fixed canvas and a scroll runway inside
   its own document. It is embedded as a same-origin frame pinned for one viewport; the page's scroll is handed to the
   frame's document and the frame's input is handed back. Nothing of the developer's bundle is edited.

   What this component does for the experience:
     loading   our loading screen over the frame: the IAQ mark filling, a percentage and the app's own status line,
               read from the frame; it clears the moment the app is ready. On desktop the frame starts a moment after
               the page settles, so it is usually ready before the visitor reaches it; on phones it starts when near.
     weight    the app picks its pixel ratio once at start (2 on Retina, 1.5 when it starts narrower than 900px), so the
               frame is created at 880px wide for its first second, then grows: 1.5 on Retina for the whole life of the
               section, the same detail at 44% fewer pixels. Off screen by more than a viewport the frame is two pixels
               TALL (never narrower: the app re-reads its width to choose tap-build or scroll-build), so its loop costs
               nothing. The section is contained so nothing it does reflows the page.
     length    the page runs the build in SPEED of the frame's own runway (about ten screens instead of twenty-six).
     glide     the frame's scroll eases toward the page's position every frame.
     phones    the app's own tap-to-build mode; the section is one screen; a vertical swipe on the canvas scrolls the
               page, a sideways one turns the model, a tap builds.
     walkthrough  "Enter the cleanroom" hands the app to first person: the section's height is frozen, nothing is
               forwarded, pointer lock is allowed; "Exit walkthrough" hands the page back.
     clarity   a thin red line along the top of the pinned frame shows how far through the build the page is.
   ========================================================================= */
const COARSE = () => window.matchMedia('(pointer: coarse)').matches
const SPEED = () => (COARSE() ? 0.6 : 0.38)
const EASE = 0.16
const WARM_W = 880, WARM_MS = 1300

/* progress from the app's own status line */
function progressOf (status, hidden) {
  if (hidden) return 100
  const m = /\((\d+)\/(\d+)\)/.exec(status || '')
  if (m) return Math.min(90, 40 + Math.round(50 * (+m[1] / Math.max(1, +m[2]))))
  if (/collision/i.test(status)) return 94
  if (/structure/i.test(status)) return 36
  if (/building/i.test(status)) return 12
  return 6
}

export default function DevBuild3D ({ src = '/3d/index.html' }) {
  const sec = useRef(null), frame = useRef(null)
  const [runway, setRunway] = useState(0)
  const [go, setGo] = useState(false)
  const [warm, setWarm] = useState(true)
  const [ready, setReady] = useState(false)
  const [prog, setProg] = useState(0)
  const [status, setStatus] = useState('Preparing the model')
  const [slow, setSlow] = useState('')   /* a load running long after the first ready */
  const [isFar, setIsFar] = useState(true)
  const [ghost, setGhost] = useState(1)
  const [shown, setShown] = useState(0)     /* 25 Sep, 17:00: the count the loader shows, eased toward the real one, never down */
  const [landed, setLanded] = useState(false)   /* true once the count has reached 100 and held a beat */   /* 25 Sep: the finished facility over the empty stage, 1 at the start, 0 once the build is under way */   /* React owns the class list, so the far flag is state, not a toggled class */

  useEffect(() => {
    const el = sec.current
    if (!el) return
    if (!COARSE()) {
      const idle = window.requestIdleCallback ? window.requestIdleCallback(() => setGo(true), { timeout: 1500 }) : setTimeout(() => setGo(true), 1800)
      return () => { window.cancelIdleCallback ? window.cancelIdleCallback(idle) : clearTimeout(idle) }
    }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); io.disconnect() } }, { rootMargin: '150% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const el = sec.current, f = frame.current
    if (!el || !f || !go) return
    let alive = 0   /* 25 Sep: the poll that keeps the scene lit and the materials alive */
    let loadPoll = 0   /* 25 Sep: was declared in the load branch and read by the cleanup, a ReferenceError on every route change away from home */
    let doc = null, win = null, raf = 0, stopped = false, frameRunway = 0, pageRunway = 0, target = 0, current = 0, isFar = true, poll = 0, best = 0, creep = 0, snapping = false, roomObs = null, tapeRaf = 0, helloT = 0
    /* the walkthrough, by either sign the app gives: its room bar shown, or its body in the room state */
    const inWalk = () => { if (!doc) return false; const rb = doc.getElementById('room-bar'); return !!((rb && !rb.hidden) || (doc.body && doc.body.classList.contains('room'))) }
    /* 25 Sep bug sweep: the camera dive into the walkthrough (2.5 to 4 s); the app disables its Enter button for exactly that
       long. A roll during it advanced the build underneath, so the visitor came back to a different chapter */
    const diving = () => { if (!doc) return false; const b = doc.getElementById('explore-cta'); return !!(b && b.disabled) }
    const tapMode = () => !!(doc && doc.documentElement.classList.contains('click-build'))
    /* the app sizes its canvas on its own window's resize; every size change we make is followed by one */
    const nudge = () => { try { if (win) win.dispatchEvent(new Event('resize')) } catch {} }
    const warmT = setTimeout(() => { setWarm(false); setTimeout(nudge, 60); setTimeout(nudge, 400) }, WARM_MS)

    const step = () => {
      raf = 0
      if (!win || stopped) return
      const d = target - current
      if (Math.abs(d) < 0.5) { current = target; win.scrollTo(0, Math.round(current)); return }
      current += d * EASE
      win.scrollTo(0, Math.round(current))
      raf = requestAnimationFrame(step)
    }
    const aim = () => {
      if (!frameRunway || !pageRunway || inWalk() || tapMode() || snapping) return
      const top = el.getBoundingClientRect().top
      const p = Math.min(1, Math.max(0, -top / pageRunway))
      el.style.setProperty('--db3-p', p.toFixed(4))
      const nt = p * frameRunway
      target = nt
      if (!raf) raf = requestAnimationFrame(step)
    }
    const measure = () => {
      if (!doc || isFar || inWalk()) return
      const se = doc.scrollingElement || doc.documentElement
      frameRunway = tapMode() ? 0 : Math.max(0, se.scrollHeight - se.clientHeight)
      pageRunway = Math.round(frameRunway * SPEED())
      setRunway(pageRunway)
      aim()
    }
    const wire = () => {
      if (stopped) return
      try { doc = f.contentDocument; win = f.contentWindow } catch { return }
      if (!doc || !win) return
      /* 26 Sep (Bazil, on the app's Facilities panel: "icons should follow the colour", "don't put it in a box or square",
         "the resume build and +/- buttons need to be seen together with the title and V1 V2"): our overrides, injected
         into the frame's document, over the developer's stylesheet. Each chapter row carries its own --hue. */
      if (!doc.getElementById('iaq-embed-style')) {
        const st = doc.createElement('style'); st.id = 'iaq-embed-style'
        st.textContent = `
          /* 25 Sep, afternoon: 36px marks at a finer line */
          #hud2 .h-rail .rd-ic{border:0!important;background:transparent!important;box-shadow:none!important;width:36px!important;height:36px!important}
          #hud2 .h-rail li:not(.on):not(.done) .rd-ic,#hud2 .h-rail li.done .rd-ic,#hud2 .h-rail li.on .rd-ic{background:transparent!important;border-color:transparent!important}
          #hud2 .h-rail .rd-ic svg{width:27px!important;height:27px!important;transition:transform .35s cubic-bezier(.22,1,.36,1)}
          #hud2 .h-rail .rd-ic .rd-o{stroke-width:1.35!important}
          #hud2 .h-rail li{grid-template-columns:36px 22px minmax(0,1fr)!important}
          /* interaction: a row brightens and its mark lifts on hover; the active row's mark is a touch larger */
          #hud2 .h-rail li:hover .rd-t{color:#fff!important}
          #hud2 .h-rail li:hover .rd-ic svg{transform:translateY(-2px)}
          /* 29 Sep: no zoom (Bazil: "zoom in zoom out animation haram"); the active mark no longer grows, and a hit flashes instead of popping */
          /* the line work white, the accent part in the row's hue */
          #hud2 .h-rail .rd-ic{color:rgba(255,255,255,.78)!important}
          #hud2 .h-rail li.on .rd-ic{color:#fff!important}
          #hud2 .h-rail .rd-ic .rd-o{stroke:currentColor!important}
          #hud2 .h-rail .rd-ic .rd-a{stroke:var(--hue)!important}
          #hud2 .h-rail .rd-ic .rd-a.f{fill:var(--hue)!important;stroke:none!important}
          #hud2 .h-rail li.on{background:transparent!important;box-shadow:none!important;border-radius:0!important}
          #hud2 .h-rail li.on .rd-n{color:var(--hue)!important}
          #hud2 .h-left{top:calc(var(--hud-edge) + 3.6rem * var(--rail-k))!important;bottom:auto!important;height:auto!important;transform:none!important;--rail-k:1}
          #hud2 .h-left .h-ctrl{margin-top:calc(3.2rem * var(--rail-k))!important}
          /* 26 Sep: the column is never narrower than its own buttons (with Environment the default, its white card showed
             "Enter the cleanroom" and the last speed hanging past its right edge at every width under 1920) */
          @media(min-width:900px){#hud2 .h-left{min-width:min-content!important}}
          /* every rail size is a multiple of --rail-k; when the
             buttons would run past the bottom edge the embed steps it down until the whole column fits (fitRail) */
          @media(min-width:900px){#hud2 .h-rail{margin-top:calc(.8rem * var(--rail-k))!important;gap:calc(2px * var(--rail-k))!important}#hud2 .h-rail li{padding-top:calc(6px * var(--rail-k))!important;padding-bottom:calc(6px * var(--rail-k))!important;grid-template-columns:max(28px, calc(36px * var(--rail-k))) 22px minmax(0,1fr)!important}#hud2 .h-rail .rd-ic{width:max(28px, calc(36px * var(--rail-k)))!important;height:max(28px, calc(36px * var(--rail-k)))!important}#hud2 .h-rail .rd-ic svg{width:max(21px, calc(27px * var(--rail-k)))!important;height:max(21px, calc(27px * var(--rail-k)))!important}#hud2 .h-rail .rd-t{font-size:calc(15px * max(.88, var(--rail-k)))!important}#hud2 .h-rail .rd-n{padding-top:calc(9px * var(--rail-k))!important}#hud2 .h-rail .rd-b{padding-top:calc(5px * var(--rail-k))!important}#hud2 .h-rail li.on .rd-seq{margin-top:calc(6px * var(--rail-k))!important}#hud2 .h-rail .rd-bar{margin-top:calc(8px * var(--rail-k))!important}}
          #hud2 .h-cta{display:inline-flex!important;align-items:center;gap:.55rem}
          #hud2 .h-cta .iaq-walker{width:20px;height:20px;flex:none;fill:#fff;color:#fff;animation:iaqWalk 1.6s ease-in-out infinite}
          @keyframes iaqWalk{0%,100%{transform:translateX(0)}50%{transform:translateX(2px)}}
          #view-tools{bottom:auto!important;top:calc(var(--hud-edge) + 3.4rem)!important;align-items:flex-start!important}
          #view-tools .vt-keys{display:none!important}
          /* ---- the walkthrough: light panels, ink type, the red accent, square corners; level list
               top left with a line under each level, a heading strip top centre, exit top right, the map bottom left
               fully inside the frame, the dock bottom centre. The developer's ids, our skin. */
          body.room{--hud:clamp(14px,2vw,28px)}
          body.room #floor-switch{--g-bg:rgba(255,255,255,.94);--g-line:rgba(12,18,32,.1);--g-hi:transparent;--g-fg:#0C1220;--g-dim:#48536A;--g-radius:0;background:rgba(255,255,255,.94)!important;border:0!important;border-radius:0!important;box-shadow:0 20px 50px -30px rgba(12,18,32,.45)!important;-webkit-backdrop-filter:blur(14px)!important;backdrop-filter:blur(14px)!important;width:14.5rem!important;min-width:0!important;max-width:calc(100vw - 2 * var(--hud))!important;padding:.9rem .5rem .5rem!important;top:var(--hud)!important;left:var(--hud)!important;transition:width .35s cubic-bezier(.22,1,.36,1)}
          body.room #floor-switch.iaq-detail{width:21rem!important}
          body.room #floor-switch .fs-title{color:#EC2027!important;font:600 .62rem/1 "Switzer","Instrument Sans",system-ui,sans-serif!important;letter-spacing:.2em!important;padding:0 .7rem .5rem!important;display:flex;align-items:center;justify-content:space-between;gap:.6rem}
          body.room #floor-switch .iaq-fs-tog{pointer-events:auto;cursor:pointer;border:0;background:#F3F5F9;color:#48536A;font:600 .58rem/1 "Switzer","Instrument Sans",system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;padding:.45em .6em;margin:-.3em 0;transition:background .2s ease,color .2s ease}
          body.room #floor-switch .iaq-fs-tog:hover,body.room #floor-switch .iaq-fs-tog[aria-pressed=true]{background:#0C1220;color:#fff}
          body.room #floor-switch button{height:auto!important;padding:.5rem .7rem!important;border-radius:0!important;grid-template-columns:2.3rem minmax(0,1fr) auto!important;grid-auto-rows:auto;row-gap:.1rem;color:#48536A!important;background:none!important;transition:background .25s ease,color .25s ease!important}
          body.room #floor-switch button:hover{background:#F3F5F9!important;color:#0C1220!important}
          body.room #floor-switch button[aria-current=true]{background:#0C1220!important;color:#fff!important}
          body.room #floor-switch button[aria-current=true]:before{display:none!important}
          body.room #floor-switch .fs-key{font:600 .66rem/1 "Switzer","Instrument Sans",system-ui,sans-serif!important;letter-spacing:.08em!important;color:#8A94A8!important}
          body.room #floor-switch button[aria-current=true] .fs-key{color:#FF6A70!important}
          body.room #floor-switch .fs-name{font:600 .92rem/1.2 "Switzer","Instrument Sans",system-ui,sans-serif!important;letter-spacing:-.01em!important}
          body.room #floor-switch .fs-num{position:static!important;transform:none!important;grid-column:3;grid-row:1;font:600 .62rem/1 "Switzer","Instrument Sans",system-ui,sans-serif!important;color:#8A94A8!important;background:#F3F5F9!important;border:0!important;border-radius:0!important;padding:.3em .45em!important;min-width:1.6em!important}
          body.room #floor-switch button[aria-current=true] .fs-num{background:rgba(255,255,255,.14)!important;color:#fff!important}
          body.room #floor-switch .iaq-lv{display:none;grid-column:2/4;grid-row:2;font:400 .74rem/1.35 "Instrument Sans",system-ui,sans-serif;color:#66708A;letter-spacing:0;white-space:normal;min-width:0}
          body.room #floor-switch.iaq-detail .iaq-lv{display:block}
          body.room #floor-switch button[aria-current=true] .iaq-lv{color:rgba(255,255,255,.72)}
          body.room #exit-room{background:rgba(255,255,255,.94)!important;color:#0C1220!important;border:0!important;border-radius:0!important;box-shadow:0 20px 50px -30px rgba(12,18,32,.45)!important;font:600 .8rem/1 "Switzer","Instrument Sans",system-ui,sans-serif!important;letter-spacing:.02em!important;text-transform:none!important;height:2.6rem!important;padding:0 1.1rem 0 .9rem!important;top:var(--hud)!important;right:var(--hud)!important}
          body.room #exit-room:hover{background:#EC2027!important;color:#fff!important}
          body.room .rb-dock{background:rgba(255,255,255,.94)!important;border:0!important;border-radius:0!important;box-shadow:0 20px 50px -30px rgba(12,18,32,.45)!important;color:#0C1220!important;padding:.35rem!important;bottom:var(--hud)!important}
          body.room .rb-dock .rb-thumb{display:none!important}
          body.room .rb-seg button{color:#48536A!important;border-radius:0!important;font:600 .78rem/1 "Switzer","Instrument Sans",system-ui,sans-serif!important;padding:.55rem .85rem!important;background:none!important}
          body.room .rb-seg button[aria-pressed=true]{background:#0C1220!important;color:#fff!important}
          body.room .rb-sep{background:rgba(12,18,32,.12)!important}
          body.room .rb-icon{color:#0C1220!important;border-radius:0!important;font:600 .78rem/1 "Switzer","Instrument Sans",system-ui,sans-serif!important}
          body.room .rb-icon:hover{background:#F3F5F9!important}
          /* the controls are one slim strip above the dock, not a card in the middle */
          body.room #room-keys{background:rgba(255,255,255,.96)!important;color:#0C1220!important;border:0!important;border-radius:0!important;box-shadow:0 20px 50px -30px rgba(12,18,32,.45)!important;left:0!important;right:0!important;margin:0 auto;width:max-content!important;max-width:calc(100vw - 2 * var(--hud) - 2 * 184px)!important;padding:.55rem 1.05rem!important;bottom:calc(var(--hud) + 3.5rem)!important;transform:translateY(6px)!important}
          body.room #room-keys.open{transform:none!important}
          body.room #room-keys .rk-title{display:none!important}
          body.room #room-keys .rk-keys,body.room #room-keys .rk-touch{display:flex!important;flex-wrap:wrap;justify-content:center;gap:.3rem 1.3rem!important}
          @media(hover:none) and (pointer:coarse){body.room #room-keys .rk-keys{display:none!important}}
          @media(hover:hover),(pointer:fine){body.room #room-keys .rk-touch{display:none!important}}
          body.room #room-keys dl>div{border:0!important;padding:.1rem 0!important;gap:.5rem!important;justify-content:flex-start!important;white-space:nowrap}
          body.room #room-keys dd{font-size:.76rem!important}
          body.room #room-keys dt{gap:.2rem!important}
          body.room #room-keys dd{color:#48536A!important;font:400 .8rem/1.3 "Instrument Sans",system-ui,sans-serif!important}
          body.room #room-keys kbd{background:#F3F5F9!important;color:#0C1220!important;border:1px solid rgba(12,18,32,.14)!important;border-radius:0!important;box-shadow:none!important;font:600 .68rem/1 "Switzer","Instrument Sans",system-ui,sans-serif!important}
          body.room #door-switch{background:rgba(255,255,255,.96)!important;color:#0C1220!important;border:0!important;border-radius:0!important;box-shadow:0 24px 60px -30px rgba(12,18,32,.5)!important}
          body.room #door-switch .ds-title{color:#EC2027!important;letter-spacing:.2em!important}
          body.room #door-switch button{border-radius:0!important}
          body.room #door-hint{background:rgba(255,255,255,.94)!important;color:#0C1220!important;border-radius:0!important;font:600 .78rem/1 "Switzer","Instrument Sans",system-ui,sans-serif!important}
          body.room #door-hint .dh-key{background:#0C1220!important;color:#fff!important;border-radius:0!important}
          /* the map: a plain card, no ring, no shadow ring; sized to sit inside the frame above the dock line */
          body.room #minimap{transform:none!important;left:var(--hud)!important;bottom:var(--hud)!important;width:168px!important;height:168px!important;border-radius:0!important;box-shadow:0 20px 50px -30px rgba(12,18,32,.45)!important;background:#fff!important}
          /* the heading strip: where you are, top centre */
          body.room .iaq-where{position:absolute;left:50%;top:var(--hud);transform:translateX(-50%);display:inline-flex;align-items:center;gap:.7rem;padding:.55rem .9rem;background:rgba(255,255,255,.94);color:#0C1220;box-shadow:0 20px 50px -30px rgba(12,18,32,.45);font:600 .78rem/1 "Switzer","Instrument Sans",system-ui,sans-serif;letter-spacing:.01em;white-space:nowrap;pointer-events:none;z-index:7}
          body.room .iaq-where i{width:7px;height:7px;border-radius:50%;background:#EC2027;box-shadow:0 0 8px #EC2027}
          body.room .iaq-where small{font:500 .7rem/1 "Instrument Sans",system-ui,sans-serif;color:#66708A;letter-spacing:.06em;text-transform:uppercase}
          body.room .iaq-tape{position:relative;width:132px;height:18px;overflow:hidden;margin-left:.4rem;background:#F3F5F9}
          body.room .iaq-tape-in{position:absolute;left:0;top:0;height:100%;width:1080px;will-change:transform}
          body.room .iaq-tape em{position:absolute;top:11px;height:7px;width:1px;background:rgba(12,18,32,.22);font-style:normal}
          body.room .iaq-tape em.m{top:8px;height:10px;background:rgba(12,18,32,.5)}
          body.room .iaq-tape em.l{top:0;height:18px;width:auto;background:none;font:600 .64rem/18px "Switzer","Instrument Sans",system-ui,sans-serif;color:#0C1220;transform:translateX(-50%)}
          body.room .iaq-tape b{position:absolute;left:50%;top:0;width:2px;height:100%;background:#EC2027;transform:translateX(-50%)}
          body.room .iaq-deg{font:600 .7rem/1 "Switzer","Instrument Sans",system-ui,sans-serif;color:#0C1220;font-variant-numeric:tabular-nums;min-width:2.7em;text-align:right}
          body.room #crosshair{border-color:#0C1220!important}
          @media(max-width:899px){body.room #floor-switch{min-width:0!important;width:13.5rem!important;padding:.6rem .3rem .3rem!important}body.room #floor-switch .iaq-lv,body.room #floor-switch .iaq-fs-tog{display:none!important}body.room #floor-switch .fs-name{display:block!important}body.room #floor-switch button{grid-template-columns:2.3rem minmax(0,1fr) auto!important;justify-items:start!important}body.room .iaq-where{top:auto;bottom:calc(var(--hud) + 3.4rem);font-size:.7rem}body.room #minimap{width:120px!important;height:120px!important;bottom:calc(var(--hud) + 3.4rem)!important}body.room .iaq-tape,body.room .iaq-deg{display:none}body.room .iaq-where{left:auto;right:var(--hud);transform:none;padding:.5rem .7rem}body.room #room-keys{max-width:calc(100vw - 2 * var(--hud))!important;bottom:calc(var(--hud) + 3.4rem + 120px + .7rem)!important;padding:.45rem .7rem!important}body.room #room-keys .rk-touch{gap:.2rem .9rem!important}}

          #hud2 .h-rail li{position:relative}
          /* 26 Sep (Bazil, on the lit Cleanroom System row: "no square"): no panel, tint or outline behind any row, lit, landed
             or struck; the row is marked by its white title, its number in the hue and its progress line */
          #hud2 .h-rail li,#hud2 .h-rail li.on,#hud2 .h-rail li.on.iaq-landed,#hud2 .h-rail li.done,#hud2 .h-rail li:hover{background:transparent!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
          #hud2 .h-rail li.iaq-hit{animation:iaqHit .8s cubic-bezier(.22,1,.36,1) both}
          #hud2 .h-rail li.iaq-hit .rd-ic{animation:iaqPop .8s cubic-bezier(.22,1,.36,1) both}
          #hud2 .h-rail li.iaq-hit .rd-t{animation:iaqText .8s cubic-bezier(.22,1,.36,1) both}
          @keyframes iaqHit{0%{transform:translateX(0)}14%{transform:translateX(8px)}100%{transform:translateX(0)}}
          @keyframes iaqPop{0%{opacity:1}22%{opacity:.35}100%{opacity:1}}
          @keyframes iaqText{0%{color:inherit}20%{color:#fff}100%{color:inherit}}
          #hud2 .h-rail li.done .rd-t,#hud2 .h-rail li.iaq-landed .rd-t{color:#fff!important}
          #hud2 .h-rail li.done .rd-n,#hud2 .h-rail li.iaq-landed .rd-n{color:var(--hue)!important}
          /* a dot in the hue after a finished title */
          #hud2 .h-rail .iaq-done{display:none;width:7px;height:7px;margin-left:.55em;vertical-align:1px;border-radius:50%;background:var(--hue);box-shadow:0 0 8px var(--hue)}
          #hud2 .h-rail li.done .iaq-done,#hud2 .h-rail li.iaq-landed .iaq-done{display:inline-block}
          @media (prefers-reduced-motion: reduce){#hud2 .h-rail li.iaq-hit,#hud2 .h-rail li.iaq-hit .rd-ic,#hud2 .h-rail li.iaq-hit .rd-t{animation:none}}
          /* 25 Sep:
             the stage is the site's navy; every panel and button is glass, light over the stage, white glass in the walkthrough */
          html,body{background:#0A101F!important}
          /* 26 Sep (Bazil, on the speed buttons: "don't put it in boxes"): the speeds are words on the stage, no border, no fill;
             the chosen one is white, the others quiet */
          #hud2 .h-speed button{padding:.24rem .56rem!important;border:0!important;background:transparent!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;color:rgba(255,255,255,.5)!important}
          #hud2 .h-speed button:hover{color:rgba(255,255,255,.88)!important}
          #hud2 .h-speed button[aria-pressed=true]{background:transparent!important;color:#fff!important}
          #view-tools button,#skin-switch button,#zoom-in,#zoom-out,#zoom-reset{background:rgba(255,255,255,.07)!important;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.12)!important}
          #skin-switch{background:rgba(255,255,255,.05)!important;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
          #skin-switch button[aria-pressed=true],#skin-switch button.on{background:#EC2027!important;border-color:#EC2027!important;color:#fff!important}
          #hud2 .h-rail li.on{background:transparent!important}
          .rb-glass,#room-keys,#exit-room,#view-1p,#view-3p,#keys-toggle,.iaq-where,body.room #floor-switch{background:rgba(255,255,255,.76)!important;backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);border:1px solid rgba(255,255,255,.5)!important;box-shadow:0 10px 30px -18px rgba(12,18,32,.35)!important}
          #view-1p[aria-pressed=true],#view-3p[aria-pressed=true],#view-1p.on,#view-3p.on{background:rgba(12,18,32,.9)!important;color:#fff!important}
          body.room #floor-switch button[aria-current=true]{background:rgba(12,18,32,.9)!important}
          .iaq-elev{width:14px;height:14px;margin-right:6px;vertical-align:-2px;color:#EC2027}
          #minimap{transition:transform .3s cubic-bezier(.2,.7,.2,1);transform-origin:bottom left;border:1px solid rgba(255,255,255,.6)!important;box-shadow:0 10px 30px -18px rgba(12,18,32,.4)!important}
          body.room #minimap{transition:width .3s cubic-bezier(.2,.7,.2,1),height .3s cubic-bezier(.2,.7,.2,1)!important}
          body.room #minimap.iaq-big{width:320px!important;height:320px!important}
          /* the walkthrough's panels were near-solid white (.94 to .96, body.room rules above); frosted glass instead */
          body.room #floor-switch,body.room #exit-room,body.room .rb-dock,body.room #room-keys,body.room #door-switch,body.room #door-hint,body.room .iaq-where{background:rgba(255,255,255,.72)!important;backdrop-filter:blur(16px) saturate(150%)!important;-webkit-backdrop-filter:blur(16px) saturate(150%)!important;border:1px solid rgba(255,255,255,.55)!important}
          body.room #floor-switch{--g-bg:rgba(255,255,255,.72)}
          /* the walkthrough's active states are a red tint on the glass, not solid ink */
          body.room #floor-switch button[aria-current=true],#view-1p[aria-pressed=true],#view-3p[aria-pressed=true],#view-1p.on,#view-3p.on{background:rgba(236,32,39,.12)!important;color:#0C1220!important}
          body.room #floor-switch button[aria-current=true] .fs-key,body.room #floor-switch button[aria-current=true] .fs-num{color:#C8141D!important;background:transparent!important}
          .iaq-map-tog{position:fixed;z-index:30;display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid rgba(255,255,255,.5);background:rgba(255,255,255,.76);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);color:#0C1220;font:600 .6rem/1 "Switzer","Instrument Sans",system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;pointer-events:auto}
          .iaq-map-tog i{width:8px;height:8px;border:1.5px solid #EC2027;display:block}
          .iaq-map-tog[aria-pressed=true] i{background:#EC2027}
          /* ---- 25 Sep, evening. The frame now speaks the
               site's type: Switzer for names, numbers and buttons, Instrument Sans for reading lines, sentence case
               everywhere (the uppercase letter-spaced system face is gone), one text scale, quieter chrome, flat dots.
               The fonts are the site's own files, same origin. ---- */
          @font-face{font-family:"Switzer";src:url(/assets/fonts/Switzer-500-normal.woff2) format("woff2");font-weight:500;font-display:swap}
          @font-face{font-family:"Switzer";src:url(/assets/fonts/Switzer-600-normal.woff2) format("woff2");font-weight:600 700;font-display:swap}
          @font-face{font-family:"Instrument Sans";src:url(/assets/fonts/InstrumentSans-400-normal-latin.woff2) format("woff2");font-weight:400;font-display:swap}
          @font-face{font-family:"Instrument Sans";src:url(/assets/fonts/InstrumentSans-500-normal-latin.woff2) format("woff2");font-weight:500;font-display:swap}
          @font-face{font-family:"Instrument Sans";src:url(/assets/fonts/InstrumentSans-600-normal-latin.woff2) format("woff2");font-weight:600;font-display:swap}
          #hud2,#skin-switch,#view-tools,#part-chip,#scroll-hint{--h-mono:"Instrument Sans",system-ui,sans-serif;font-family:"Instrument Sans",system-ui,sans-serif}
          #hud2 .h-head{font-family:"Switzer","Instrument Sans",system-ui,sans-serif!important;font-weight:600!important;letter-spacing:-.035em!important}
          #hud2 .h-rail .rd-t{font-family:"Switzer","Instrument Sans",system-ui,sans-serif!important;font-weight:600!important;letter-spacing:-.012em!important}
          #hud2 .h-rail .rd-n{font-family:"Switzer","Instrument Sans",system-ui,sans-serif!important;font-weight:600!important;font-size:11.5px!important;letter-spacing:0!important;font-variant-numeric:tabular-nums}
          #hud2 .h-rail .rd-seq{font-family:"Instrument Sans",system-ui,sans-serif!important;text-transform:none!important;font-weight:500!important;font-size:12.5px!important;letter-spacing:0!important;line-height:1.5!important;color:rgba(255,255,255,.62)!important;max-width:34ch}
          #hud2 .h-rail .rd-ct{font-family:"Switzer","Instrument Sans",system-ui,sans-serif!important;font-weight:600!important;font-size:12px!important;letter-spacing:0!important;color:rgba(255,255,255,.88)!important;font-variant-numeric:tabular-nums}
          #hud2 .h-rail .rd-bar{height:2px!important;background:rgba(255,255,255,.08)!important}
          #hud2 .h-rail .iaq-done{width:6px!important;height:6px!important;box-shadow:none!important}
          #hud2 .h-play>button{font-family:"Switzer","Instrument Sans",system-ui,sans-serif!important;font-weight:600!important;font-size:14px!important;letter-spacing:-.005em!important;padding:.9rem 1.2rem!important;transition:background .2s ease,transform .2s ease,box-shadow .2s ease!important}
          #hud2 .h-play>button:hover{transform:translateY(-1px);box-shadow:0 14px 30px -18px rgba(0,0,0,.7)}
          #hud2 .h-speed{font-family:"Instrument Sans",system-ui,sans-serif!important;text-transform:none!important;letter-spacing:0!important;font-size:12px!important}
          #hud2 .h-speed-l{color:rgba(255,255,255,.55)!important;margin-right:.75rem!important}
          #hud2 .h-speed button{font-family:"Switzer","Instrument Sans",system-ui,sans-serif!important;font-weight:600!important;font-size:12px!important;letter-spacing:0!important;padding:.4rem .7rem!important;min-width:3.1rem}
          #skin-switch{padding:3px!important;gap:3px!important;border:1px solid rgba(255,255,255,.1)!important}
          #skin-switch button{font-family:"Switzer","Instrument Sans",system-ui,sans-serif!important;text-transform:none!important;letter-spacing:0!important;font-size:12.5px!important;font-weight:600!important;padding:.5rem .85rem!important;border:0!important;background:transparent!important;color:rgba(255,255,255,.62)!important}
          #skin-switch button:hover{color:#fff!important}
          #skin-switch button[aria-pressed=true],#skin-switch button.on{background:#EC2027!important;color:#fff!important}
          #zoom-in,#zoom-out,#zoom-reset{width:2.4rem!important;height:2.4rem!important;font-family:"Switzer","Instrument Sans",system-ui,sans-serif!important;font-weight:500!important;font-size:1.05rem!important;color:rgba(255,255,255,.9)!important;transition:background .2s ease,border-color .2s ease!important}
          #zoom-in:hover,#zoom-out:hover,#zoom-reset:hover{background:rgba(255,255,255,.16)!important;border-color:rgba(255,255,255,.3)!important}
          #view-tools .vt-zoom{gap:6px!important}
          #part-chip{font-family:"Switzer","Instrument Sans",system-ui,sans-serif!important;font-weight:600!important;font-size:12px!important;letter-spacing:0!important;text-transform:none!important}
          #scroll-hint{text-transform:none!important;letter-spacing:0!important}
          /* the lit row keeps its place (the app indented it 4px as it lit, so the column twitched on every chapter) */
          #hud2 .h-rail li,#hud2 .h-rail li.on{padding-left:10px!important}
          #hud2 .h-rail .rd-seq{word-spacing:.08em}
          /* the marks keep a floor when a short screen steps the rail down (21px drawings, never 16); on phones the lit row
             stops short of the zoom column instead of running under it */
          @media(max-width:899px){#hud2 .h-rail{max-width:calc(100% - 52px)!important}}
          /* ---- x-ray (25 Sep, evening): an eye at the end of each finished row; pressed, it fills in the row's hue ---- */
          #hud2 .h-rail li{position:relative}
          #hud2 .h-rail li .iaq-eye{display:none;position:absolute;right:6px;top:calc(4px * var(--rail-k,1) + 2px);width:30px;height:30px;place-items:center;padding:0;border:0;background:transparent;color:rgba(255,255,255,.42);cursor:pointer;pointer-events:auto;transition:color .2s ease,background .2s ease}
          #hud2 .h-rail li.done .iaq-eye,#hud2 .h-rail li.iaq-landed .iaq-eye,#hud2 .h-rail.iaq-final li .iaq-eye{display:grid}
          /* nine eyes at rest were clutter; an eye shows on the row under the
             pointer, on a pressed eye, and always on touch screens (no hover there) */
          @media (hover:hover){#hud2 .h-rail li .iaq-eye{opacity:0;transition:opacity .2s ease,color .2s ease}#hud2 .h-rail li.on .iaq-eye,#hud2 .h-rail li:hover .iaq-eye,#hud2 .h-rail li .iaq-eye:focus-visible,#hud2 .h-rail li .iaq-eye[aria-pressed=true]{opacity:1}}
          #hud2 .h-rail li .iaq-eye svg{width:18px;height:18px;overflow:visible}
          #hud2 .h-rail li .iaq-eye .e-o{fill:none;stroke:currentColor;stroke-width:1.4;stroke-linejoin:round}
          #hud2 .h-rail li .iaq-eye .e-p{fill:none;stroke:currentColor;stroke-width:1.4}
          #hud2 .h-rail li .iaq-eye:hover{color:#fff;background:rgba(255,255,255,.06)}
          #hud2 .h-rail li .iaq-eye:focus-visible{outline:2px solid #fff;outline-offset:1px}
          #hud2 .h-rail li .iaq-eye[aria-pressed=true]{color:var(--hue,#fff)}
          #hud2 .h-rail li .iaq-eye[aria-pressed=true] .e-p{fill:currentColor;stroke:none}
          #hud2 .h-rail li:last-child .iaq-eye[aria-pressed=true]{color:#fff}
          #hud2 .h-rail.iaq-xr-on li:not(.iaq-xr) .rd-t{color:rgba(255,255,255,.5)!important}
          #hud2 .h-rail li.iaq-xr .rd-t{color:#fff!important}
          #hud2 .h-rail li .rd-b{padding-right:34px}
          #iaq-xr-chip{position:fixed;left:50%;bottom:clamp(16px,3vh,30px);transform:translateX(-50%);z-index:40;display:flex;align-items:center;gap:12px;padding:8px 8px 8px 14px;background:rgba(10,16,31,.72);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.12);color:#fff;font:500 13px/1.3 "Instrument Sans",system-ui,sans-serif;pointer-events:auto;max-width:min(640px,calc(100vw - 32px))}
          #iaq-xr-chip[hidden]{display:none}
          #iaq-xr-chip .xr-k{flex:none;white-space:nowrap;font:600 12px/1 "Switzer","Instrument Sans",system-ui,sans-serif;color:#5CBCF5}
          #iaq-xr-chip .xr-n{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
          #iaq-xr-chip button{flex:none;border:0;cursor:pointer;padding:6px 10px;background:#fff;color:#0C1220;font:600 12px/1 "Switzer","Instrument Sans",system-ui,sans-serif}
          #iaq-xr-chip button:hover{background:#EC2027;color:#fff}
          /* 25 Sep: the two actions and the speed row are slimmer, the marks smaller */
          #hud2 .h-play>button{padding:.6rem 1rem!important;font-size:13.5px!important;line-height:1.2!important;height:auto!important;min-height:0!important}
          #hud2 .h-play>button svg:not(.iaq-walker){width:11px!important;height:11px!important}
          #hud2 .h-cta .iaq-walker{width:16px!important;height:16px!important;margin-right:.5rem!important}
          #hud2 .h-speed button{padding:.26rem .6rem!important;height:auto!important;min-height:0!important}
        `
        doc.head.appendChild(st)
      /* the light panel theme follows the skin: Environment (the daylight site, the default since 26 Sep) light, Classic dark */
      const skinSync = () => { const v3 = doc.getElementById('skin-v3'); doc.documentElement.classList.toggle('iaq-light', LIGHT_BUILD || !!(v3 && v3.getAttribute('aria-pressed') === 'true')) }
      const sw = doc.getElementById('skin-switch'); if (sw) new MutationObserver(skinSync).observe(sw, { subtree: true, attributes: true, attributeFilter: ['aria-pressed'] })
      skinSync(); setTimeout(skinSync, 1500)
      /* the light build view: one switch at the top of this file (LIGHT_BUILD) */
      if (!doc.getElementById('iaq-light-style')) { const ls = doc.createElement('style'); ls.id = 'iaq-light-style'; ls.textContent = `
          /* 25 Sep: the light build view.
             Scoped to html.iaq-light and the assembly state, so the walkthrough keeps its own white HUD. */
          html.iaq-light{--bg:#EEF2F7;--fg:#0C1220;--muted:#66708A}
          html.iaq-light,html.iaq-light body{background:#EEF2F7!important}
          html.iaq-light #hud2{color:#0C1220!important}
          html.iaq-light #hud2 .h-grid.lyr{background-image:linear-gradient(to right,rgba(12,18,32,.035) 1px,transparent 1px),linear-gradient(to bottom,rgba(12,18,32,.035) 1px,transparent 1px)!important}
          /* no haze fading into the site; the column sits on one frosted card */
          html.iaq-light #hud2 .h-vig,html.iaq-light #hud2 .h-grid.lyr{display:none!important}
          @media(min-width:900px){html.iaq-light #hud2 .h-left{background:rgba(255,255,255,.86)!important;-webkit-backdrop-filter:blur(18px) saturate(1.2);backdrop-filter:blur(18px) saturate(1.2);box-shadow:0 30px 70px -44px rgba(12,18,32,.5);padding:22px 24px 20px!important;margin:-22px 0 0 -24px!important}}
          html.iaq-light #hud2 .h-rail li .iaq-eye{color:#8A94A8!important}
          html.iaq-light #hud2 .h-rail li .iaq-eye:hover{color:#0C1220!important;background:rgba(12,18,32,.06)!important}
          html.iaq-light #hud2 .h-rail li .iaq-eye[aria-pressed=true]{color:var(--hue,#0C1220)!important}
          html.iaq-light #hud2 .h-rail li:last-child .iaq-eye[aria-pressed=true]{color:#0C1220!important}
          html.iaq-light #hud2 .h-rail.iaq-xr-on li:not(.iaq-xr) .rd-t{color:#8A94A8!important}
          html.iaq-light #hud2 .h-head{color:#0C1220!important;text-shadow:none!important}
          html.iaq-light #hud2 .h-rail .rd-t{color:#66708A!important;text-shadow:none!important}
          html.iaq-light #hud2 .h-rail li:hover .rd-t,html.iaq-light #hud2 .h-rail li.on .rd-t,html.iaq-light #hud2 .h-rail li.done .rd-t,html.iaq-light #hud2 .h-rail li.iaq-landed .rd-t{color:#0C1220!important}
          html.iaq-light #hud2 .h-rail .rd-n{color:#8A94A8!important}
          html.iaq-light #hud2 .h-rail li.on .rd-n,html.iaq-light #hud2 .h-rail li.done .rd-n,html.iaq-light #hud2 .h-rail li.iaq-landed .rd-n{color:var(--hue)!important}
          html.iaq-light #hud2 .h-rail .rd-ic,html.iaq-light #hud2 .h-rail li.on .rd-ic{color:#0C1220!important}
          html.iaq-light #hud2 .h-rail li:not(.on):not(.done):not(.iaq-landed) .rd-ic{color:#66708A!important}
          html.iaq-light #hud2 .h-rail .rd-seq{color:#48536A!important}
          html.iaq-light #hud2 .h-rail .rd-ct{color:#0C1220!important}
          html.iaq-light #hud2 .h-rail .rd-bar{background:rgba(12,18,32,.1)!important}
          html.iaq-light #hud2 .h-rail li.on{background:transparent!important}
          html.iaq-light #hud2 .h-start{background:#0C1220!important;color:#fff!important;box-shadow:none!important}
          html.iaq-light #hud2 .h-start .h-start-t,html.iaq-light #hud2 .h-start .h-start-ic{color:#fff!important}
          html.iaq-light #hud2 .h-start:hover{background:#1C2640!important}
          html.iaq-light #hud2 .h-speed-l{color:#66708A!important}
          html.iaq-light #hud2 .h-speed button{background:transparent!important;color:#8A94A8!important;border:0!important;box-shadow:none!important}
          html.iaq-light #hud2 .h-speed button:hover{color:#0C1220!important}
          html.iaq-light #hud2 .h-speed button[aria-pressed=true]{background:transparent!important;color:#C8141D!important}
          html.iaq-light #skin-switch{background:#fff!important;border-color:rgba(12,18,32,.1)!important;box-shadow:0 14px 30px -24px rgba(12,18,32,.4)}
          html.iaq-light #skin-switch button[aria-pressed=false],html.iaq-light #skin-switch button[aria-pressed=false] *{color:#48536A!important}
          html.iaq-light #skin-switch button[aria-pressed=true],html.iaq-light #skin-switch button[aria-pressed=true] *{color:#fff!important}
          html.iaq-light #view-tools button,html.iaq-light .vt-zoom button{background:#fff!important;color:#0C1220!important;border-color:rgba(12,18,32,.12)!important;box-shadow:0 14px 30px -24px rgba(12,18,32,.4)}
          html.iaq-light #view-tools button:hover,html.iaq-light .vt-zoom button:hover{background:#0C1220!important;color:#fff!important}
          html.iaq-light .iaq-map-tog{border-color:rgba(12,18,32,.12)!important}
`; doc.head.appendChild(ls) }
      /* 26 Sep (Bazil, on the Facilities card: "can you please refine the interface"): one colour cue per row (the mark's
         accent) instead of four (mark, number, dot, bar); two digit numbers in quiet ink; no dot after a finished title;
         finished titles in ink, the ones still to come quiet; the active row's progress runs the full width of the column
         on a track in its own hue, never grey; the buttons fill the column on one grid and sit closer to the rail; the
         speeds line up under them; the scene's callouts speak the site's type in a navy slim box with a red square.
         Appended after the two sheets above, so it wins their ties; delete this block to go back. */
      if (!doc.getElementById('iaq-refine-style')) { const rs = doc.createElement('style'); rs.id = 'iaq-refine-style'; rs.textContent = `
          #hud2 .h-head{font-size:clamp(24px,1.75vw,30px)!important;line-height:1.04!important;letter-spacing:-.032em!important;max-width:none!important}
          #hud2 .h-rail .rd-n[data-n]{font-size:0!important;color:transparent!important}
          #hud2 .h-rail .rd-n[data-n]::before{content:attr(data-n);font:500 11.5px/1 "Switzer","Instrument Sans",system-ui,sans-serif;letter-spacing:.02em;font-variant-numeric:tabular-nums;color:rgba(255,255,255,.4)}
          #hud2 .h-rail li.on .rd-n[data-n]::before{color:#fff}
          #hud2 .h-rail .iaq-done,#hud2 .h-rail li.done .iaq-done,#hud2 .h-rail li.iaq-landed .iaq-done{display:none!important}
          #hud2 .h-rail li:not(.on):not(.done):not(.iaq-landed) .rd-t{color:rgba(255,255,255,.5)!important}
          #hud2 .h-rail li:not(.on):not(.done):not(.iaq-landed):hover .rd-t{color:rgba(255,255,255,.85)!important}
          #hud2 .h-rail .rd-seq{max-width:none!important}
          #hud2 .h-rail .rd-bar{max-width:none!important;width:calc(100% + 34px)!important;height:2px!important;background:color-mix(in srgb,var(--hue) 26%,transparent)!important}
          @media(min-width:900px){#hud2 .h-left .h-ctrl{margin-top:calc(1.7rem * var(--rail-k))!important;display:grid!important;grid-template-columns:minmax(min-content,1fr)!important;width:100%!important}#hud2 .h-play{display:grid!important;grid-template-columns:max-content minmax(max-content,1fr);gap:8px!important;margin-top:0!important}#hud2 .h-play>button{justify-content:center!important;min-height:44px!important;padding:.62rem 1.1rem!important;font-size:14px!important}}
          #hud2 .h-speed{margin-top:14px!important;gap:0!important;justify-content:space-between!important}
          #hud2 .h-speed-l{margin-right:0!important}
          #hud2 .h-speed button,#hud2 .h-ctrl .h-speed button{flex:0 0 auto!important;min-width:0!important;font-size:12.5px!important;padding:.3rem .15rem!important}
          html.iaq-light #hud2 .h-rail .rd-n[data-n]::before{color:#9AA3B5}
          html.iaq-light #hud2 .h-rail li.on .rd-n[data-n]::before{color:#0C1220}
          html.iaq-light #hud2 .h-rail li:not(.on):not(.done):not(.iaq-landed) .rd-t{color:#8A94A8!important}
          html.iaq-light #hud2 .h-rail li:not(.on):not(.done):not(.iaq-landed):hover .rd-t{color:#0C1220!important}
          html.iaq-light #hud2 .h-rail .rd-bar{background:color-mix(in srgb,var(--hue) 20%,transparent)!important}
          @media(min-width:900px){html.iaq-light #hud2 .h-left{background:rgba(255,255,255,.9)!important;padding:26px 28px 22px!important;margin:-26px 0 0 -28px!important;box-shadow:0 30px 60px -46px rgba(12,18,32,.45)!important}}
          #callouts .callout{gap:7px!important;padding:6px 10px 6px 8px!important;background:#17213A!important;border:0!important;border-radius:0!important;box-shadow:0 10px 24px -16px rgba(12,18,32,.6)!important;font:600 12px/1 "Switzer","Instrument Sans",system-ui,sans-serif!important;letter-spacing:0!important;text-transform:none!important;color:#fff!important}
          #callouts .callout b{font:inherit!important;letter-spacing:0!important;text-transform:none!important;color:#fff!important}
          #callouts .callout i{width:6px!important;height:6px!important;background:#EC2027!important}
          /* 26 Sep, the walkthrough in the house rules ("proceed with all"): sentence case, no letter spacing, no filled
             box for the current level or view (ink and red instead), the heading strip in square dots with a red square for
             the heading instead of vertical ticks, the live dot square and flat */
          /* the red button is flat: the app's shine sweep across it is off */
          #hud2 .h-cta:after{display:none!important;animation:none!important}
          body.room #floor-switch .fs-title,body.room .iaq-fs-tog,body.room .iaq-where small,body.room .rb-seg button,body.room .rb-icon,.iaq-map-tog,body.room #door-switch .ds-title,body.room #room-keys .rk-title{text-transform:none!important;letter-spacing:0!important}
          body.room #floor-switch .fs-title{font:600 13px/1 "Switzer","Instrument Sans",system-ui,sans-serif!important}
          body.room .iaq-fs-tog{font:600 12px/1 "Switzer","Instrument Sans",system-ui,sans-serif!important;background:transparent!important;color:#66708A!important;padding:.35em 0!important}
          body.room .iaq-fs-tog:hover,body.room .iaq-fs-tog[aria-pressed=true]{background:transparent!important;color:#C8141D!important}
          body.room #floor-switch button[aria-current=true],body.room #floor-switch button[aria-current=true]:hover{background:transparent!important;color:#0C1220!important}
          body.room #floor-switch button[aria-current=true] .fs-name{color:#0C1220!important}
          body.room #floor-switch button[aria-current=true] .fs-key,body.room #floor-switch button[aria-current=true] .fs-num{color:#C8141D!important;background:transparent!important}
          body.room #floor-switch button:not([aria-current=true]) .fs-name{color:#66708A!important}
          body.room #floor-switch button:hover{background:transparent!important}
          body.room #floor-switch button:hover .fs-name{color:#0C1220!important}
          body.room .rb-seg button{font:600 13px/1 "Switzer","Instrument Sans",system-ui,sans-serif!important;color:#66708A!important}
          body.room .rb-seg button[aria-pressed=true],#view-1p[aria-pressed=true],#view-3p[aria-pressed=true],#view-1p.on,#view-3p.on{background:transparent!important;color:#C8141D!important}
          body.room .rb-icon{font:600 13px/1 "Switzer","Instrument Sans",system-ui,sans-serif!important}
          .iaq-map-tog{font:600 12px/1 "Switzer","Instrument Sans",system-ui,sans-serif!important}
          body.room .iaq-where small{font:500 12.5px/1 "Instrument Sans",system-ui,sans-serif!important;color:#66708A!important}
          body.room .iaq-where i{border-radius:0!important;box-shadow:none!important;width:6px!important;height:6px!important}
          body.room .iaq-tape{background:transparent!important}
          body.room .iaq-tape em{top:10px!important;width:2px!important;height:2px!important;background:rgba(12,18,32,.3)!important}
          body.room .iaq-tape em.m{top:9.5px!important;width:3px!important;height:3px!important;background:rgba(12,18,32,.55)!important}
          body.room .iaq-tape em.l{top:0!important;width:auto!important;height:18px!important;background:none!important}
          body.room .iaq-tape b{top:auto!important;bottom:0!important;width:6px!important;height:6px!important}
`; doc.head.appendChild(rs) }
      }
      /* the strike: a short synthesized sound (no file) and the row struck, the moment the app marks a chapter done */
      let ac = null
      const strike = () => {
        try {
          if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)()
          if (ac.state !== 'running') { ac.resume().then(() => { if (ac.state === 'running') strike() }).catch(() => {}); return }
          window.__iaqStrikes = (window.__iaqStrikes || 0) + 1
          const t = ac.currentTime, out = ac.createGain(); out.gain.value = 0.9; out.connect(ac.destination)
          /* the thud: a low sine dropping in pitch, the "strike" itself */
          const th = ac.createOscillator(), tg = ac.createGain()
          th.type = 'sine'; th.frequency.setValueAtTime(150, t); th.frequency.exponentialRampToValueAtTime(70, t + .14)
          tg.gain.setValueAtTime(0.0001, t); tg.gain.exponentialRampToValueAtTime(0.32, t + .008); tg.gain.exponentialRampToValueAtTime(0.0001, t + .22)
          th.connect(tg); tg.connect(out); th.start(t); th.stop(t + .24)
          /* the tone: a bell at G5 with two overtones and a soft tail */
          for (const [f, g, d] of [[784, 0.10, .55], [1568, 0.028, .3], [2352, 0.012, .18]]) {
            const o = ac.createOscillator(), og = ac.createGain()
            o.type = 'sine'; o.frequency.setValueAtTime(f, t)
            og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(g, t + .006); og.gain.exponentialRampToValueAtTime(0.0001, t + d)
            o.connect(og); og.connect(out); o.start(t); o.stop(t + d + .02)
          }
          /* a breath of noise through a band pass, 30 ms: the mallet's contact */
          const n = ac.createBufferSource(), buf = ac.createBuffer(1, Math.floor(ac.sampleRate * .03), ac.sampleRate), ch = buf.getChannelData(0)
          for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / ch.length, 3)
          const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 1.2
          const ng = ac.createGain(); ng.gain.setValueAtTime(0.06, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + .03)
          n.buffer = buf; n.connect(bp); bp.connect(ng); ng.connect(out); n.start(t)
        } catch {}
      }
      /* audio needs one gesture on the page or in the frame; the first click, key or touch unlocks it */
      /* a wheel is not a gesture the browser accepts for audio; a click, a key or a touch anywhere on the page or in the
         frame is, and every one of them unlocks (not once: the first may come before the context exists) */
      const unlock = () => { try { if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state !== 'running') ac.resume().catch(() => {}) } catch {} }
      for (const ev of ['pointerdown', 'mousedown', 'click', 'keydown', 'touchstart', 'touchend']) { window.addEventListener(ev, unlock, { passive: true, capture: true }); doc.addEventListener(ev, unlock, { passive: true, capture: true }) }
      unlock()
      /* (Bazil: "Enter the cleanroom should have a person character"): a walking figure, in the house line style, ahead of
         the words on the app's button */
      /* (Bazil: "give details, a simple view; his detail view would have it further explain"): one line under each level */
      const LEVEL_LINE = { 'Plenum': 'Above the ceiling: fan filter units, supply air and the ducts that feed them.', 'Cleanroom': 'The process floor: the production tools in a classified environment.', 'Clean Sub-Fab': 'Beneath the cleanroom: gases, ultrapure water, exhaust and power, run to each tool.', 'Dirty Fab': 'Ground plant: chillers, pumps, switchgear and waste, kept out of the clean zones.' }
      const plantLevels = () => {
        for (const b of doc.querySelectorAll('#floor-list button')) {
          if (b.querySelector('.iaq-lv')) continue
          const nm = (b.querySelector('.fs-name') || {}).textContent || ''
          const line = LEVEL_LINE[nm.trim()]; if (!line) continue
          const sm = doc.createElement('small'); sm.className = 'iaq-lv'; sm.textContent = line; b.appendChild(sm)
        }
        /* (Bazil: "elevator icon for level"): the switch's title carries an elevator mark */
        const ft = doc.querySelector('#floor-switch .fs-title')
        if (ft && !ft.querySelector('.iaq-elev')) ft.insertAdjacentHTML('afterbegin', '<svg class="iaq-elev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18"/><path d="M12 3v18"/><path d="M7.5 13.5 9 15l1.5-1.5"/><path d="M13.5 10.5 15 9l1.5 1.5"/></svg>')
        /* (Bazil: "minimize and maximise map feature"): a toggle above the walkthrough map, larger or smaller */
        const mm = doc.getElementById('minimap')
        if (mm && !doc.querySelector('.iaq-map-tog')) {
          const tg = doc.createElement('button'); tg.type = 'button'; tg.className = 'iaq-map-tog'; tg.setAttribute('aria-pressed', 'false'); tg.innerHTML = '<i></i><span>Map</span>'
          const place = () => { const r = mm.getBoundingClientRect(); tg.style.left = Math.round(r.left) + 'px'; tg.style.bottom = Math.round(win.innerHeight - r.top + 8) + 'px' }
          tg.addEventListener('click', () => { const on = !mm.classList.contains('iaq-big'); mm.classList.toggle('iaq-big', on); tg.setAttribute('aria-pressed', String(on)); tg.lastChild.textContent = on ? 'Map, smaller' : 'Map'; setTimeout(place, 320); place() })
          doc.body.appendChild(tg); place(); win.addEventListener('resize', place)
        }
        const rb = doc.getElementById('room-bar')
        if (rb && !rb.querySelector('.iaq-where')) { const w = doc.createElement('div'); w.className = 'iaq-where'; w.innerHTML = '<i></i><small>Walkthrough</small><span class="iaq-where-l"></span><span class="iaq-tape" aria-hidden="true"><span class="iaq-tape-in">' + tapeHTML() + '</span><b></b></span><span class="iaq-deg">000°</span>'; rb.appendChild(w) }
        const cur = doc.querySelector('#floor-list button[aria-current="true"] .fs-name'), lab = doc.querySelector('.iaq-where-l')
        if (cur && lab) lab.textContent = cur.textContent.trim()
        plantToggle()
      }
      /* the compass tape: 1 px per degree, N E S W lettered, minor ticks every 15°; the app's mini-map hands the yaw over
         each frame (window.__iaqWalk, a bundle patch) and the tape slides so the heading sits under the red mark */
      const tapeHTML = () => { let h = ''; for (let d = -180; d < 900; d += 15) { const a = ((d % 360) + 360) % 360, L = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' }[a]; h += '<em class="' + (L ? 'l' : (a % 45 === 0 ? 'm' : '')) + '" style="left:' + (d + 180) + 'px">' + (L || '') + '</em>' } return h }
      const tick = () => {
        tapeRaf = 0; if (stopped || !inWalk()) return
        const wk = win.__iaqWalk, inn = doc.querySelector('.iaq-tape-in'), dg = doc.querySelector('.iaq-deg')
        if (wk && inn) { const hd = ((-wk.yaw * 180 / Math.PI) % 360 + 360) % 360; inn.style.transform = 'translateX(' + (60 - (hd + 180)).toFixed(1) + 'px)'; if (dg) dg.textContent = String(Math.round(hd) % 360).padStart(3, '0') + '°' }
        tapeRaf = win.requestAnimationFrame(tick)
      }
      /* (Bazil: "give details and a simple view; the detail view would further explain"): the level panel opens in the simple
         view, names only; Details in its title row shows the one-line explanations, and the choice is kept for next time */
      const LV_KEY = 'iaq.walk.levels'
      const plantToggle = () => {
        const fs = doc.getElementById('floor-switch'), tl = fs && fs.querySelector('.fs-title'); if (!fs || !tl || tl.querySelector('.iaq-fs-tog')) return
        let detail = false; try { detail = win.localStorage.getItem(LV_KEY) === 'detail' } catch {}
        const b = doc.createElement('button'); b.type = 'button'; b.className = 'iaq-fs-tog'
        const paint = () => { fs.classList.toggle('iaq-detail', detail); b.textContent = detail ? 'Simple' : 'Details'; b.setAttribute('aria-pressed', String(detail)) }
        b.addEventListener('click', e => { e.stopPropagation(); detail = !detail; try { win.localStorage.setItem(LV_KEY, detail ? 'detail' : 'simple') } catch {}; paint() })
        tl.appendChild(b); paint()
      }
      /* on entering the walkthrough the controls strip shows itself once for nine seconds, then folds unless the pointer is on it */
      const keysHello = () => {
        const rk = doc.getElementById('room-keys'), kt = doc.getElementById('keys-toggle'); if (!rk || rk.dataset.iaqHello) return
        rk.dataset.iaqHello = '1'; clearTimeout(helloT)
        helloT = setTimeout(() => { if (!inWalk() || rk.classList.contains('open')) return; rk.classList.add('open'); kt && kt.setAttribute('aria-expanded', 'true'); helloT = setTimeout(() => { if (!rk.matches(':hover')) { rk.classList.remove('open'); kt && kt.setAttribute('aria-expanded', 'false') } }, 9000) }, 1200)
      }
      const onRoom = () => { try { walkLook() } catch {} if (!inWalk()) return; if (!tapeRaf) tapeRaf = win.requestAnimationFrame(tick); keysHello(); plantLevels() }
      roomObs = new MutationObserver(onRoom); roomObs.observe(doc.body, { attributes: true, attributeFilter: ['class'] })
      /* 25 Sep (Bazil: "a texture or filter to make the 3D more alive and real, the effect of colour on it, not flat like
         cardboard"): the app lights its MeshStandardMaterials with three suns and a hemisphere but gives the scene no
         environment, so surfaces have no reflection and read flat. A studio environment (a canvas gradient with one
         highlight, equirect, PMREM'd by the renderer) goes on scene.environment, and every standard material gets a
         satin finish (roughness .58, a little metalness); the app streams parts in, so the poll patches newcomers */
      /* 25 Sep (Bazil: "please remove this building, the 3rd one, but keep the original file"): the site model carries three
         buildings, the main fab, the tall east annex and a lower utility building to the south on its own piles, with a short
         link between the south building and the fab. The south building and its link are cut here, at runtime, so the model
         files in public/3d/models stay exactly as delivered. App coordinates: the south building is z > 20 west of the annex
         (x < 37.5), the link is x -15 to -2, z 2.5 to 20. A mesh wholly inside is emptied (draw range 0); a mesh that also
         carries fab geometry keeps only its triangles outside; an instanced part is dropped per instance. Arrays are made in
         the frame's own realm (the app's WebGL layer rejects a typed array from this window). Each mesh is done once. */
      const CUT = (x, z) => (z > 20 && x < 37.5) || (z > 2.5 && z <= 20 && x > -15 && x < -2)
      const R = [[-1e9, 37.5, 20, 1e9], [-15, -2, 2.5, 20]]
      let IdxAttr = null
      const trimSite = sc => {
        if (win.__iaqTrimLoaded) return   /* the app's own public/3d/iaq-trim.js does it; this copy is the fallback */
        if (!IdxAttr) sc.traverse(o => { if (IdxAttr || !o.isMesh) return; const ix = o.geometry && o.geometry.index; if (ix && ix.array && !ix.isInterleavedBufferAttribute) { try { if (new ix.constructor(new win.Uint32Array([70000]), 1).array instanceof win.Uint32Array) IdxAttr = ix.constructor } catch {} } })
        if (!IdxAttr) return
        sc.traverse(o => {
          if (!o.isMesh || o.userData.iaqTrim) return
          const g = o.geometry; if (!g || !g.attributes || !g.attributes.position) return
          o.userData.iaqTrim = 1
          for (let a = o; a; a = a.parent) if (/third-person|move-marker/.test(a.name || '')) return
          o.updateWorldMatrix(true, false)
          const e = o.matrixWorld.elements
          if (o.isInstancedMesh) {
            const m = o.instanceMatrix.array; let hit = 0
            for (let i = 0; i < o.count; i++) { const tx = m[i * 16 + 12], ty = m[i * 16 + 13], tz = m[i * 16 + 14]; if (CUT(e[0] * tx + e[4] * ty + e[8] * tz + e[12], e[2] * tx + e[6] * ty + e[10] * tz + e[14])) { for (let k = 0; k < 16; k++) m[i * 16 + k] = 0; hit++ } }
            if (hit) o.instanceMatrix.needsUpdate = true
            return
          }
          if (g.userData.iaqTrim) return
          if (!g.boundingBox) g.computeBoundingBox()
          const bb = g.boundingBox; let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9
          for (let i = 0; i < 8; i++) { const lx = i & 1 ? bb.max.x : bb.min.x, ly = i & 2 ? bb.max.y : bb.min.y, lz = i & 4 ? bb.max.z : bb.min.z, x = e[0] * lx + e[4] * ly + e[8] * lz + e[12], z = e[2] * lx + e[6] * ly + e[10] * lz + e[14]; x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z) }
          if (!R.some(([a, b, c, d]) => x1 > a && x0 < b && z1 > c && z0 < d)) return
          g.userData.iaqTrim = 1
          if (R.some(([a, b, c, d]) => x0 >= a && x1 <= b && z0 >= c && z1 <= d)) { g.setDrawRange(0, 0); return }
          const pos = g.attributes.position, ix = g.index, n = ix ? ix.count : pos.count
          const groups = g.groups && g.groups.length ? g.groups : [{ start: 0, count: n, materialIndex: 0 }]
          const keep = new win.Uint32Array(n); let k = 0; const ng = []
          for (const gr of groups) {
            const st = k, end = Math.min(n, gr.start + gr.count)
            for (let t = gr.start; t + 2 < end; t += 3) {
              let cx = 0, cz = 0; const v = [0, 0, 0]
              for (let j = 0; j < 3; j++) { const i = ix ? ix.getX(t + j) : t + j; v[j] = i; const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i); cx += e[0] * x + e[4] * y + e[8] * z + e[12]; cz += e[2] * x + e[6] * y + e[10] * z + e[14] }
              if (CUT(cx / 3, cz / 3)) continue
              keep[k++] = v[0]; keep[k++] = v[1]; keep[k++] = v[2]
            }
            ng.push({ start: st, count: k - st, materialIndex: gr.materialIndex })
          }
          if (k === n) return
          g.setIndex(new IdxAttr(keep.slice(0, k), 1))
          if (g.groups && g.groups.length) { g.clearGroups(); for (const gr of ng) g.addGroup(gr.start, gr.count, gr.materialIndex) }
          g.setDrawRange(0, Infinity)
        })
      }
      const enliven = () => {
        const sc = win.__iaqScene; if (!sc) return
        try { trimSite(sc) } catch (e) {}
        if (!sc.environment) {
          let Tex = null
          sc.traverse(o => { if (Tex || !o.isMesh) return; for (const m of (Array.isArray(o.material) ? o.material : [o.material])) if (m && m.map && m.map.constructor) { Tex = m.map.constructor; break } })
          if (Tex) { try {
            const c = doc.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d')
            const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#f6f8fb'); gr.addColorStop(.47, '#cfd7e2'); gr.addColorStop(.53, '#8f99a8'); gr.addColorStop(1, '#2f3642'); g.fillStyle = gr; g.fillRect(0, 0, 512, 256)
            const rg = g.createRadialGradient(150, 62, 6, 150, 62, 130); rg.addColorStop(0, 'rgba(255,255,255,.95)'); rg.addColorStop(.35, 'rgba(255,255,255,.45)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, 512, 256)
            const t = new Tex(c); t.mapping = 303; try { t.colorSpace = 'srgb' } catch {} t.needsUpdate = true; sc.environment = t
          } catch (e) {} }
        }
        sc.traverse(o => { if (!o.isMesh) return; for (const m of (Array.isArray(o.material) ? o.material : [o.material])) { if (!m || !m.userData || m.userData.iaqLive) continue; if (m.isMeshStandardMaterial) { m.roughness = Math.min(m.roughness, .58); m.metalness = Math.max(m.metalness, .06); m.envMapIntensity = .9; m.needsUpdate = true } m.userData.iaqLive = 1 } })
        /* (Bazil: "minimum black"): the stage clears to the site's navy, not the app's near-black */
        if (sc.background && sc.background.isColor && sc.background.getHex() < 0x202020) sc.background.setHex(0x0A101F)
      }
      /* 26 Sep (Bazil, on the bare paving south of the fab at handover: "can't be too empty here, put something"): the ground
         where the south utility building stood (cut on 25 Sep, above) is furnished the way a fab's back of house is: along the
         fab a pipe rack; behind it the utility row (bulk gas tanks and their vaporisers, a cooling tower bank, the transformer
         compound with its switch room, two gensets); then a staff car park in the app's own car models, with bay markings,
         tree islands and lamps; south of the annex a wastewater plant; a tree line along the south edge. Everything is built
         here at runtime in the frame's own three.js (constructors taken from objects already in the scene), instanced by
         material, and hung on the app's handover-site group, so it arrives with the handover and shows only in Environment.
         The site sun casts shadows for these pieces only; the ground receives them. Model files stay as delivered. */
      /* the car kit's paint is toy bright (yellow, green, cyan); every car on the site, the app's own in the front bays and
         on the road and ours in the yard, is repainted in what a Malaysian staff car park holds: white, silver, grey, black,
         navy, deep red, bronze. The body keeps its shape and loses its texture; glass, lights and wheels are untouched. */
      const CAR_PAINT = [0xF2F3F4, 0xB9BEC4, 0x1F2328, 0xF2F3F4, 0x6E757C, 0xB9BEC4, 0x27385A, 0xF2F3F4, 0x1F2328, 0x7A1F24, 0xB9BEC4, 0x8C7B66, 0xF2F3F4, 0x6E757C]
      let carN = 0
      const repaintCars = () => {
        const bs = win.__iaqBoss; if (!bs) return
        bs.traverse(o => {
          if (!o.isMesh || o.isInstancedMesh || o.userData.iaqPaint) return
          const m = o.material; if (!m || Array.isArray(m) || !/^Body/.test(m.name || '') || !m.map) return
          let car = o; while (car && !/^car-/.test(car.name || '')) car = car.parent
          if (!car) return
          if (!car.userData.iaqPaintHex) car.userData.iaqPaintHex = CAR_PAINT[(carN++ * 5) % CAR_PAINT.length]
          const c = m.clone(); c.map = null; c.color.setHex(car.userData.iaqPaintHex); c.roughness = .42; c.metalness = .35; c.needsUpdate = true
          o.material = c; o.userData.iaqPaint = 1
          car.traverse(p => { if (p.isMesh) p.castShadow = true })
        })
      }
      /* 26 Sep ("proceed with all"): in the walkthrough the app colours every discipline in its code colour (the machines
         lavender, the sprinklers red); a visitor walking the floor should see a cleanroom, so for the walk only the machines
         take white and grey enclosures by their own tone, sprinkler heads are steel, the ceiling grid is lifted so its
         runners stop reading as dark streaks. Everything is put back the moment the visitor leaves, unless the app has
         already recoloured it itself. */
      const WALK = { hsl: { h: 0, s: 0, l: 0 }, on: false, list: [], own: [], done: new WeakSet(), t0: 0 }
      /* the floor a visitor enters streams its detail in after the walk starts, so every tick picks up newcomers */
      const walkApply = sc => {
        let n = 0
        /* first: single fire items get their own copy of a shared material (the app's shader patches carried over), so
           the sprinkler runs can turn steel while the bell stays red */
        sc.traverse(o => {
          if (!o.isMesh || o.userData.iaqWalkOwn) return
          let g = o; while (g && !/^(layer-)?detail-sprinklers/.test(g.name || '')) g = g.parent
          if (!g || Array.isArray(o.material) || !o.material || WALK.done.has(o.material)) return
          const gg = o.geometry; if (!gg) return; if (!gg.boundingBox) gg.computeBoundingBox()
          const bb = gg.boundingBox; if (Math.max((bb.max.x - bb.min.x) * o.scale.x, (bb.max.z - bb.min.z) * o.scale.z) >= 1.5) return
          const m = o.material, c = m.clone(); c.onBeforeCompile = m.onBeforeCompile; if (m.customProgramCacheKey) c.customProgramCacheKey = m.customProgramCacheKey; c.userData = Object.assign({}, m.userData)
          WALK.done.add(c); o.userData.iaqWalkOwn = m; o.material = c; WALK.own.push(o)
        })
        sc.traverse(o => {
          if (!o.isMesh) return
          let g = o; while (g && !/^(layer-)?detail-(tools|sprinklers|ceiling)/.test(g.name || '')) g = g.parent
          if (!g) return
          const kind = /tools/.test(g.name) ? 'tools' : /sprinklers/.test(g.name) ? 'sprinklers' : 'ceiling'
          for (const m of [].concat(o.material || [])) {
            if (!m || !m.color || WALK.done.has(m)) continue
            WALK.done.add(m)
            const prev = m.color.getHex(), prevE = m.emissive ? m.emissive.getHex() : null
            let hex = prev
            if (kind === 'tools') { const fb = (m.userData && m.userData.focusBase && m.userData.focusBase.getHSL) ? m.userData.focusBase : m.color; fb.getHSL(WALK.hsl); hex = WALK.hsl.l > .7 ? 0xF4F5F7 : WALK.hsl.l > .45 ? 0xE4E7EB : WALK.hsl.s > .45 ? 0xDCE0E5 : 0xC5CBD2 }
            else if (kind === 'sprinklers') hex = 0xC7CCD2
            /* the app re-derives a material's colour from userData.__origColor on its fades, so that moves too */
            const oc = m.userData && m.userData.__origColor
            const prevO = oc && typeof oc === 'object' && oc.getHex ? oc.getHex() : oc
            if (oc && typeof oc === 'object' && oc.setHex) oc.setHex(hex); else if (typeof oc === 'number') m.userData.__origColor = hex
            m.color.setHex(hex)
            if (kind === 'ceiling' && m.emissive) m.emissive.setHex(0x2E3034)
            WALK.list.push({ m, prev, prevE, prevO, hex }); n++
          }
        })
        return n
      }
      const walkLook = () => {
        const sc = win.__iaqScene; if (!sc) return
        const walking = inWalk()
        if (walking) {
          if (!WALK.on) { WALK.on = true; WALK.t0 = Date.now() }
          let n = walkApply(sc)
          /* the app may recolour after the dive; keep the walk look, and remember its newer colour for the way out */
          for (const r of WALK.list) if (r.m.color.getHex() !== r.hex) { r.prev = r.m.color.getHex(); r.m.color.setHex(r.hex); n++ }
          /* the app draws the walk on demand; ask for a frame after a change and through the first seconds of a walk */
          if (n || Date.now() - WALK.t0 < 12000) nudge()
        } else if (WALK.on) {
          WALK.on = false
          for (const r of WALK.list) {
            if (r.m.color.getHex() === r.hex) r.m.color.setHex(r.prev)
            if (r.prevE != null && r.m.emissive) r.m.emissive.setHex(r.prevE)
            const oc = r.m.userData && r.m.userData.__origColor
            if (r.prevO != null) { if (oc && typeof oc === 'object' && oc.setHex) oc.setHex(r.prevO); else if (typeof oc === 'number') r.m.userData.__origColor = r.prevO }
          }
          for (const o of WALK.own) { if (o.userData.iaqWalkOwn) { o.material = o.userData.iaqWalkOwn; delete o.userData.iaqWalkOwn } }
          WALK.list = []; WALK.own = []; WALK.done = new WeakSet(); nudge()
        }
      }
      /* 26 Sep, the construction ground ("proceed with all"): the app paints the site's earth into two canvases (the plot
         and the dug pad), dark and in stripes that read as a ploughed field at every distance. The same canvases are
         repainted in place as compacted site ground: a light warm grey, broad soft patches, fine aggregate and a few
         stones, seamless at the edges so the repeat never shows. Nothing else about the scene changes. */
      const paintGround = (cv, base, tone, seed0) => {
        const g = cv.getContext && cv.getContext('2d'); if (!g) return false
        const W = cv.width, H = cv.height
        let seed = seed0; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647
        g.globalCompositeOperation = 'source-over'; g.fillStyle = base; g.fillRect(0, 0, W, H)
        const blob = (x, y, rad, rgb, a) => { for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) { const gx = x + dx, gy = y + dy; if (gx + rad < 0 || gx - rad > W || gy + rad < 0 || gy - rad > H) continue; const gr = g.createRadialGradient(gx, gy, 0, gx, gy, rad); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(gx - rad, gy - rad, rad * 2, rad * 2) } }
        for (let i = 0; i < 46; i++) blob(r() * W, r() * H, W * (.06 + r() * .16), r() < .5 ? '255,255,255' : '52,46,38', .045 + r() * .05)
        const img = g.getImageData(0, 0, W, H), d = img.data
        for (let i = 0; i < d.length; i += 4) { const n = (r() - .5) * tone; d[i] += n; d[i + 1] += n; d[i + 2] += n }
        g.putImageData(img, 0, 0)
        for (let i = 0; i < W * H / 240; i++) { const x = r() * W, y = r() * H, z = .6 + r() * 1.3; g.fillStyle = r() < .5 ? 'rgba(255,255,255,.2)' : 'rgba(34,30,26,.2)'; g.fillRect(x, y, z, z) }
        return true
      }
      /* the real crane, excavator and roller models (now loading, see HANDOVER) are painted in their stock yellow in the
         texture itself; each texture is redrawn once in steel: its own light and shade kept, the colour taken out, lifted
         toward the site's light greys. Only the construction machines (site-props) are touched. */
      const steelTex = new WeakSet()
      const steelTextures = () => {
        const bs = win.__iaqBoss; const sp = bs && bs.getObjectByName('site-props'); if (!sp) return
        let n = 0
        sp.traverse(o => {
          if (!o.isMesh) return
          for (const m of [].concat(o.material || [])) {
            const t = m && m.map; if (!t || !t.image || steelTex.has(t)) continue
            const im = t.image, W = im.width || im.videoWidth, H = im.height || im.videoHeight; if (!W || !H) continue
            steelTex.add(t)
            try {
              const cv = doc.createElement('canvas'), k = Math.min(1, 1024 / Math.max(W, H)); cv.width = Math.round(W * k); cv.height = Math.round(H * k)
              const g = cv.getContext('2d'); g.drawImage(im, 0, 0, cv.width, cv.height)
              const px = g.getImageData(0, 0, cv.width, cv.height), d = px.data
              for (let i = 0; i < d.length; i += 4) { const l = .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2], v = 58 + l * .74; d[i] = v - 3; d[i + 1] = v; d[i + 2] = v + 5 }
              g.putImageData(px, 0, 0); t.image = cv; t.needsUpdate = true; n++
            } catch (e) {}
          }
        })
        if (n) nudge()
      }
      /* 26 Sep: during construction the plot sat in bare earth to the horizon; a loose line of the app's own trees now
         stands where the cleared land ends (about 150 to 240 m out), hung on site-props so it leaves at handover, when
         the app's own world, trees and grass come in. */
      let ringDone = false
      const ringTrees = () => {
        if (ringDone) return
        const bs = win.__iaqBoss; if (!bs) return
        const sp = bs.getObjectByName('site-props'), hs = bs.getObjectByName('handover-site'); if (!sp || !hs) return
        const src = []; hs.children.forEach(o => { if (o.isInstancedMesh && o.count >= 8) src.push(o) })
        if (src.length < 2) return
        let Mat4 = null, Vec3 = null, Quat = null; sp.traverse(o => { if (!Mat4 && o.matrix) { Mat4 = o.matrix.constructor; Vec3 = o.position.constructor; Quat = o.quaternion.constructor } })
        if (!Mat4) return
        const pairs = []; for (let i = 0; i + 1 < src.length; i += 2) pairs.push([src[i], src[i + 1]])
        let seed = 91; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647
        const spots = []
        for (let i = 0; i < 150; i++) { const a = r() * Math.PI * 2, d = 150 + r() * 90; spots.push([Math.cos(a) * d * 1.15, Math.sin(a) * d]) }
        const ring = new sp.constructor(); ring.name = 'iaq-ring'
        const M = new Mat4(), P = new Vec3(), Q = new Quat(), S = new Vec3(), UPv = new Vec3(0, 1, 0), s0 = new Mat4(), p0 = new Vec3(), q0 = new Quat(), sc0 = new Vec3()
        pairs.forEach(([bark, leaves], pi) => {
          const mine = spots.filter((t, i) => i % pairs.length === pi); if (!mine.length) return
          bark.getMatrixAt(0, s0); s0.decompose(p0, q0, sc0)
          for (const srcM of [bark, leaves]) {
            const im = new srcM.constructor(srcM.geometry, srcM.material, mine.length)
            mine.forEach(([x, z], k) => { P.set(x, p0.y, z); Q.setFromAxisAngle(UPv, k * 2.1); S.copy(sc0).multiplyScalar(.85 + r() * .5); M.compose(P, Q, S); im.setMatrixAt(k, M) })
            im.instanceMatrix.needsUpdate = true; im.castShadow = false; im.frustumCulled = false; ring.add(im)
          }
        })
        sp.add(ring); ringDone = true; nudge()
      }
      const groundDone = new WeakSet()
      const repaintGround = () => {
        const bs = win.__iaqBoss; const site = bs && bs.getObjectByName('boss-site'); if (!site) return
        site.children.forEach(c => {
          if (!c.isMesh || !c.geometry) return
          const t = c.geometry.type, m = [].concat(c.material)[0], cv = m && m.map && m.map.image
          if (!cv || !cv.getContext || groundDone.has(cv)) return
          if (t === 'ShapeGeometry') { if (paintGround(cv, '#9E988D', 24, 11)) { groundDone.add(cv); m.map.needsUpdate = true; nudge() } }
          else if (t === 'BoxGeometry') { if (paintGround(cv, '#8F897F', 28, 29)) { groundDone.add(cv); m.map.needsUpdate = true; nudge() } }
        })
      }
      /* the rail's numbers as two digits, from each row's place in the list */
      const railNumbers = () => { doc.querySelectorAll('#hud2 .h-rail li').forEach((li, i) => {
        const n = li.querySelector('.rd-n'); if (n && !n.dataset.n) n.dataset.n = String(i + 1).padStart(2, '0')
        /* the stage list: a separator dot never starts a line (it keeps to the word before it), and a hyphenated word
           ("sub-fab") never breaks at its hyphen */
        const q = li.querySelector('.rd-seq')
        if (q && q.textContent && (q.textContent.includes(' · ') || (q.children.length === 0 && /\S-\S/.test(q.textContent)))) { q.innerHTML = q.textContent.split(' · ').map(p => p.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]).replace(/(\S+-\S+)/g, '<span style="white-space:nowrap">$1</span>')).join(', ') }
      }) }
      /* 26 Sep: the construction machines (crane, excavator, roller) and the yellow barrier rails are drawn in the app's
         amber; IAQ has no yellow (Bazil, 25 Sep), so they are repainted in steel. Only the site scene is touched: the
         building's discipline colours stay as the model has them. */
      const hsl = { h: 0, s: 0, l: 0 }
      const steelMachines = () => {
        const bs = win.__iaqBoss; if (!bs) return
        bs.traverse(o => { if (!o.isMesh) return; for (const m of [].concat(o.material || [])) { if (!m || !m.color || m.userData.iaqSteel) continue; m.userData.iaqSteel = 1; m.color.getHSL(hsl); if (hsl.h > .07 && hsl.h < .18 && hsl.s > .5 && hsl.l > .25 && hsl.l < .8) { m.color.setHex(hsl.l > .5 ? 0xD3D8DE : 0x9AA2AB); if (m.map) m.map = null; m.needsUpdate = true } } })
      }
      const yardT0 = Date.now(); let yardDone = false
      const furnishYard = () => {
        if (yardDone) return
        const bs = win.__iaqBoss; const hs = bs && bs.getObjectByName('handover-site'); if (!hs) return
        if (hs.getObjectByName('iaq-yard')) { yardDone = true; return }
        const K = {}
        const scan = s => s && s.traverse(o => {
          if (o.isInstancedMesh) K.Inst = K.Inst || o.constructor; else if (o.isMesh) K.Mesh = K.Mesh || o.constructor
          if (o.isGroup) K.Group = K.Group || o.constructor
          if (o.matrix) K.Mat4 = K.Mat4 || o.matrix.constructor
          if (o.position) K.Vec3 = K.Vec3 || o.position.constructor
          if (o.quaternion) K.Quat = K.Quat || o.quaternion.constructor
          const g = o.geometry; if (g) { if (g.type === 'BoxGeometry') K.Box = K.Box || g.constructor; if (g.type === 'CylinderGeometry') K.Cyl = K.Cyl || g.constructor; if (g.type === 'SphereGeometry') K.Sph = K.Sph || g.constructor }
          for (const m of [].concat(o.material || [])) if (m && m.type === 'MeshStandardMaterial') { K.Std = K.Std || m.constructor; K.Color = K.Color || m.color.constructor }
        })
        scan(bs); scan(win.__iaqScene)
        if (!K.Inst || !K.Box || !K.Cyl || !K.Std || !K.Group || !K.Mat4 || !K.Vec3 || !K.Quat) return
        /* the app's car kit, once it has arrived in the front bays (up to 25 s; then the app's own box cars) */
        const kit = new Map()
        hs.traverse(o => { if (/^car-/.test(o.name || '') && !kit.has(o.name) && o.parent) kit.set(o.name, o) })
        if (kit.size < 3 && Date.now() - yardT0 < 25000) return
        const Y = 4.2, UP = new K.Vec3(0, 1, 0), ZX = new K.Vec3(0, 0, 1), XX = new K.Vec3(1, 0, 0)
        const yard = new K.Group(); yard.name = 'iaq-yard'
        const M = new K.Mat4(), P = new K.Vec3(), Q = new K.Quat(), S = new K.Vec3()
        const box = new K.Box(1, 1, 1), cyl = new K.Cyl(1, 1, 1, 28), cyl8 = new K.Cyl(1, 1, 1, 10), dome = K.Sph ? new K.Sph(1, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2) : null
        const mats = {}
        const mat = (hex, o = {}) => { const k = hex + JSON.stringify(o); return mats[k] || (mats[k] = new K.Std({ color: hex, roughness: .7, metalness: .06, ...o })) }
        const buckets = new Map()   /* geometry + material -> instances */
        const put = (geo, m, x, y, z, sx, sy, sz, rot = 0, axis = UP, cast = true) => { const k = geo.uuid + m.uuid; if (!buckets.has(k)) buckets.set(k, { geo, m, cast, list: [] }); buckets.get(k).list.push([x, y, z, sx, sy, sz, rot, axis]) }
        /* a box by its footprint centre, size and the height its base sits at */
        const B = (hex, x, z, w, h, d, base = Y, o, rot = 0) => put(box, mat(hex, o), x, base + h / 2, z, w, h, d, rot)
        const C = (hex, x, z, r, h, base = Y, o, g = cyl) => put(g, mat(hex, o), x, base + h / 2, z, r, h, r)
        const Cx = (hex, x0, x1, y, z, r, o) => put(cyl8, mat(hex, o), (x0 + x1) / 2, y, z, r, x1 - x0, r, Math.PI / 2, ZX)
        const Cz = (hex, z0, z1, y, x, r, o) => put(cyl8, mat(hex, o), x, y, (z0 + z1) / 2, r, z1 - z0, r, Math.PI / 2, XX)
        const WHITE = 0xF1F3F5, STEEL = 0x8E969F, PALE = 0xDDE1E6, DARK = 0x2B3038, PAD = 0xD2CFC7, GRAVEL = 0xC6C2B8, GRASS = 0x64884A
        /* contact shade: the site sun stands high, so cast shadows are short; a soft dark footprint under each piece and car
           seats it on the ground the way ambient occlusion would */
        const SHADE = new K.Std({ color: 0x151A22, roughness: 1, metalness: 0, transparent: true, opacity: .26, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 })
        const Sh = (x, z, w, d, rot = 0) => put(box, SHADE, x, Y + .02, z, w, .01, d, rot, UP, false)
        const Shc = (x, z, r) => put(cyl, SHADE, x, Y + .02, z, r, .01, r, 0, UP, false)
        const METAL = { roughness: .38, metalness: .45 }
        /* pipe rack along the fab's south wall: portal frames every 7.5 m, four services on top */
        for (let x = -80; x <= 34; x += 7.6) { B(STEEL, x, 3.9, .35, 6, .35); B(STEEL, x, 6.6, .35, 6, .35); B(STEEL, x, 5.25, .35, .35, 3.1, Y + 5.8) }
        Cx(0x9AA2AB, -80.4, 34.4, Y + 6.45, 4.2, .32, METAL); Cx(0x9AA2AB, -80.4, 34.4, Y + 6.45, 5.0, .26, METAL)
        Cx(0xC3CBD2, -80.4, 34.4, Y + 6.45, 5.75, .26, METAL); Cx(WHITE, -80.4, 34.4, Y + 6.5, 6.45, .3)
        /* bulk gas yard at the east end, beside the annex (the tall pieces furthest from the usual view): three cryogenic
           tanks and two vaporiser banks on their own pad */
        B(PAD, 21, 18, 26, .12, 18)
        for (const x of [12, 18.5, 25]) { Shc(x - .6, 21.6, 2.9); C(0xC9CED4, x, 22, 2.05, 1.6, Y + .12); C(WHITE, x, 22, 1.95, 13.2, Y + 1.72, { roughness: .45, metalness: .1 }); if (dome) put(dome, mat(WHITE, { roughness: .45, metalness: .1 }), x, Y + 14.92, 22, 1.95, 1.1, 1.95) }
        for (const x0 of [10.8, 20.8]) { B(STEEL, x0 + 2.9, 12.6, 6.4, .5, 1.8, Y + .12); for (let i = 0; i < 4; i++) B(0xCDD3D9, x0 + .8 + i * 1.45, 12.6, .9, 7.6, .9, Y + .62, METAL); Cx(STEEL, x0 + .2, x0 + 5.8, Y + 8.5, 12.6, .16, METAL) }
        /* cooling tower bank: four cells on a basin, air inlets below, fan stacks on top */
        Sh(-37.8, 16.4, 35.5, 12); B(0xBFC4CA, -37, 17, 33, 1.2, 10)
        B(0x5B636C, -37, 17, 31.4, 1.8, 7.6, Y + 1.2)
        for (let i = 0; i < 4; i++) { const x = -49 + i * 8; B(PALE, x, 17, 7.8, 4.4, 7.8, Y + 3); C(0xE3E6EA, x, 17, 3.0, 2.2, Y + 7.4); C(DARK, x, 17, 2.72, .06, Y + 9.6) }
        /* transformer compound: gravel pad, switch room, three transformers with radiators and conservators */
        B(GRAVEL, -5, 18, 20, .1, 16)
        Sh(-5.6, 12.2, 17.6, 6.6); B(0xEEF0F2, -5, 12.6, 16, 4.2, 5, Y + .1); B(0xC9CED4, -5, 12.6, 16.4, .28, 5.4, Y + 4.3)
        for (const x of [-9, -4, 1]) B(0x3A4048, x, 15.13, 1.5, 2.4, .06, Y + .1)
        for (const x of [-11, -5, 1]) { Sh(x - .3, 20.8, 5, 3.6); B(0xBDB9B0, x, 21, 3.6, .3, 2.8, Y + .1); B(0x8B95A0, x, 21, 3, 2.6, 2.2, Y + .4, METAL); B(0x78828D, x - 1.75, 21, .5, 2, 1.8, Y + .6); B(0x78828D, x + 1.75, 21, .5, 2, 1.8, Y + .6); Cx(0x8B95A0, x - 1, x + 1, Y + 3.45, 20.2, .38, METAL); for (const d of [-.8, 0, .8]) C(0xA9B1BA, x + d, 21.6, .11, .9, Y + 3) }
        /* two gensets with exhaust silencers and a day tank, at the west end (low pieces nearest the usual view) */
        for (const z of [14.2, 20.6]) { Sh(-70.5, z - .3, 13.4, 3.8); B(0xECEEF0, -70, z, 12.2, 3, 2.6, Y + .15); B(0x4B525A, -76.05, z, .08, 2.2, 2.1, Y + .5); B(0x4B525A, -63.95, z, .08, 2.2, 2.1, Y + .5); C(0x5D646C, -73.5, z, .5, 1.4, Y + 3.15); C(0x5D646C, -73.5, z, .22, 2.6, Y + 4.55) }
        B(PAD, -70, 17.4, 26, .12, 14); B(0xBFC4CA, -60.5, 17.4, 2.2, 1.3, 6, Y + .12)
        /* staff car park: two double rows of bays, 2.7 m wide, with tree islands; the markings are paint on the paving */
        const LINE = mat(0xF7F8F8, { roughness: .9, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })
        const bays = [], trees = []
        let seed = 26; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
        for (const [zc, face] of [[35.6, 0], [40.8, 1], [52.4, 0], [57.6, 1]]) {
          for (let i = 0; i < 41; i++) {
            const x = -80 + i * 2.7
            if (i % 13 === 6) { if (face === 0) { B(GRASS, x, zc + 2.6, 2.5, .22, 10.2); trees.push([x, zc + 2.6]) } continue }
            put(box, LINE, x - 1.35, Y + .015, zc, .1, .03, 5.1)
            if (rnd() < .64) { bays.push([x, zc, face ? -Math.PI / 2 : Math.PI / 2]); Sh(x - .15, zc - .1, 2.2, 4.9) }
          }
        }
        /* lamps on the aisles */
        for (const z of [29.6, 46.6]) for (let x = -76; x <= 32; x += 18) { C(0x6B737C, x, z, .12, 9); B(0x6B737C, x + .6, z, 1.3, .12, .12, Y + 8.9); B(0xE9ECEF, x + 1.2, z, .6, .16, .32, Y + 8.8) }
        /* wastewater plant south of the annex: three clarifiers and a pump house */
        B(PAD, 60, 55, 34, .12, 20)
        for (const x of [49, 60, 71]) { Shc(x - .4, 50.7, 5); C(0xCDD2D8, x, 51, 4.2, 2.6, Y + .12); C(0x6F8797, x, 51, 3.95, .05, Y + 2.7, { roughness: .25, metalness: .2 }) }
        Sh(59.5, 59.8, 13.4, 7); B(0xEEF0F2, 60, 60.2, 12, 3.6, 5.6, Y + .12); B(0xC9CED4, 60, 60.2, 12.4, .26, 6, Y + 3.72)
        /* grass along the south edge, a tree every 9 m */
        B(GRASS, -25, 64.2, 112, .2, 3.6)
        for (let x = -78; x <= 30; x += 9) trees.push([x, 64.2])
        /* build the buckets */
        for (const { geo, m, cast, list } of buckets.values()) {
          const im = new K.Inst(geo, m, list.length)
          list.forEach(([x, y, z, sx, sy, sz, rot, axis], i) => { P.set(x, y, z); Q.setFromAxisAngle(axis, rot); S.set(sx, sy, sz); M.compose(P, Q, S); im.setMatrixAt(i, M) })
          im.instanceMatrix.needsUpdate = true; im.castShadow = cast; im.receiveShadow = true; im.frustumCulled = false; yard.add(im)
        }
        /* cars: each kit car's meshes become one instanced mesh per part, placed in the bays; the body in plain paint */
        const pm = new Map(), paintMat = m => { if (!pm.has(m)) { const c = m.clone(); c.map = null; c.color.setHex(0xffffff); c.roughness = .42; c.metalness = .35; c.needsUpdate = true; pm.set(m, c) } return pm.get(m) }
        const pc = new K.Color(), paint = i => pc.setHex(CAR_PAINT[i % CAR_PAINT.length])
        /* phones draw the app's own box cars (a few dozen triangles each) instead of the kit's detailed models */
        const lite = win.matchMedia && win.matchMedia('(max-width: 899px), (hover: none) and (pointer: coarse)').matches
        const variants = lite ? [] : [...kit.values()]
        if (variants.length) {
          const per = variants.map(() => [])
          bays.forEach((b, i) => per[i % variants.length].push(b))
          const inv = new K.Mat4(), rel = new K.Mat4(), T = new K.Mat4()
          variants.forEach((car, vi) => {
            if (!per[vi].length) return
            car.parent.updateWorldMatrix(true, true); inv.copy(car.parent.matrixWorld).invert()
            car.traverse(me => {
              if (!me.isMesh || me.isInstancedMesh) return
              rel.multiplyMatrices(inv, me.matrixWorld)
              const body = /^Body/.test((me.material && me.material.name) || '')
              const im = new K.Inst(me.geometry, body ? paintMat(me.material) : me.material, per[vi].length)
              per[vi].forEach(([x, z, r], k) => { P.set(x, Y - .1, z); Q.setFromAxisAngle(UP, r + (k % 2 ? Math.PI : 0)); S.set(1, 1, 1); T.compose(P, Q, S); M.multiplyMatrices(T, rel); im.setMatrixAt(k, M); if (body) im.setColorAt(k, paint(vi * 7 + k)) })
              if (body && im.instanceColor) im.instanceColor.needsUpdate = true
              /* the cars' own shadows would draw every car a second time; their contact shade grounds them instead */
              im.instanceMatrix.needsUpdate = true; im.castShadow = false; im.receiveShadow = true; im.frustumCulled = false; yard.add(im)
            })
          })
        } else {
          /* the app's own box cars, in its own palette */
          bays.forEach(([x, z, r], i) => { const c = CAR_PAINT[i % CAR_PAINT.length]; put(box, mat(c, METAL), x, Y + .6, z, 1.85, 1, 4.4, 0, UP, false); put(box, mat(0x2A3038, { roughness: .2, metalness: .3 }), x, Y + 1.3, z - .2, 1.7, .6, 2.3, 0, UP, false) })
          for (const { geo, m, cast, list } of buckets.values()) { if (yard.children.some(c => c.material === m && c.geometry === geo)) continue; const im = new K.Inst(geo, m, list.length); list.forEach(([x, y, z, sx, sy, sz, rot, axis], i) => { P.set(x, y, z); Q.setFromAxisAngle(axis, rot); S.set(sx, sy, sz); M.compose(P, Q, S); im.setMatrixAt(i, M) }); im.instanceMatrix.needsUpdate = true; im.castShadow = cast; im.receiveShadow = true; im.frustumCulled = false; yard.add(im) }
        }
        /* trees: the app's own two species (the handover site's 48-instance pairs), new instances */
        const sp = []; hs.children.forEach(o => { if (o.isInstancedMesh && o.count >= 8) sp.push(o) })
        if (sp.length >= 2) {
          const pairs = []; for (let i = 0; i + 1 < sp.length; i += 2) pairs.push([sp[i], sp[i + 1]])
          const s0 = new K.Mat4(), sc0 = new K.Vec3(), p0 = new K.Vec3(), q0 = new K.Quat()
          pairs.forEach(([bark, leaves], pi) => {
            const mine = trees.filter((t, i) => i % pairs.length === pi); if (!mine.length) return
            bark.getMatrixAt(0, s0); s0.decompose(p0, q0, sc0)
            for (const src of [bark, leaves]) {
              const im = new K.Inst(src.geometry, src.material, mine.length)
              mine.forEach(([x, z], k) => { P.set(x, p0.y, z); Q.setFromAxisAngle(UP, k * 2.39); S.copy(sc0).multiplyScalar(.9 + (k % 3) * .08); M.compose(P, Q, S); im.setMatrixAt(k, M) })
              im.instanceMatrix.needsUpdate = true; im.castShadow = true; im.frustumCulled = false; yard.add(im)
            }
          })
        }
        hs.add(yard)
        /* shadows: the site sun casts them for these pieces (nothing else in the site scene casts), the ground takes them */
        bs.traverse(o => { if (o.isDirectionalLight && o.intensity > 1.5 && !o.userData.iaqShadow) { o.userData.iaqShadow = 1; o.castShadow = true; const c = o.shadow.camera; c.left = -135; c.right = 135; c.top = 135; c.bottom = -135; c.near = 20; c.far = 420; c.updateProjectionMatrix(); o.shadow.mapSize.set(2048, 2048); o.shadow.bias = -.0005; o.shadow.normalBias = .03 } })
        bs.traverse(o => { if (o.isMesh && !o.isInstancedMesh) o.receiveShadow = true })
        /* the site's paving is unlit, so it cannot show a shadow; the app's own shadow catcher (a transparent plane that draws
           only shade, main scene, for the building) is lent here, one more over the site paving */
        const mc = win.__iaqScene && win.__iaqScene.getObjectByName('iaq-shadow-catcher')
        if (mc && K.Mesh) { const sh = new K.Mesh(mc.geometry, mc.material); sh.name = 'iaq-yard-shade'; sh.position.set(-2.8, Y + .03, 5.2); sh.scale.set(172, 1, 132); sh.receiveShadow = true; sh.castShadow = false; hs.add(sh) }
        yardDone = true; win.__iaqYard = { pieces: yard.children.length, cars: bays.length, kit: kit.size, trees: trees.length }
      }
      alive = setInterval(() => { enliven(); try { railNumbers(); furnishYard(); repaintCars(); steelMachines(); walkLook(); repaintGround(); steelTextures(); ringTrees() } catch (e) { win.__iaqYardErr = String(e && e.stack || e).slice(0, 300) } }, 1500); enliven(); try { railNumbers() } catch {}
      /* (Bazil: "the person can only walk; only with Shift, or Caps Lock, can they run"): the app reads window.__iaqCaps
         beside its Shift check (patched bundle); Caps Lock's state is read off every key */
      const caps = e => { try { win.__iaqCaps = !!(e.getModifierState && e.getModifierState('CapsLock')) } catch {} }
      /* the walkthrough button: tell the host at once, so the finished-facility ghost is gone before the app's transition */
      doc.addEventListener('click', e => { const bt = e.target && e.target.closest && e.target.closest('button, a'); if (bt && /cleanroom|walkthrough/i.test(bt.textContent || '') && !/exit/i.test(bt.textContent || '')) window.dispatchEvent(new CustomEvent('db3:enter')) }, true)
      doc.addEventListener('keydown', caps, true); doc.addEventListener('keyup', caps, true)
      const rb0 = doc.getElementById('room-bar'); if (rb0) roomObs.observe(rb0, { attributes: true, attributeFilter: ['hidden'] })
      /* (Bazil: "the size screen must be responsive, don't cut anything"): the rail column is measured against the frame's
         bottom edge and --rail-k stepped down until the title, every row and the buttons all fit; re-run on resize and when
         the active row grows */
      let fitT = 0
      const fitRail = () => {
        const L = doc.querySelector('#hud2 .h-left'); if (!L || win.innerWidth < 900 || inWalk()) return
        const edge = Math.min(34, Math.max(16, win.innerWidth * .022)), lim = win.innerHeight - edge + 1
        let k = 1; L.style.setProperty('--rail-k', '1')
        for (let i = 0; i < 11 && L.getBoundingClientRect().bottom > lim; i++) { k = +(k - .05).toFixed(2); L.style.setProperty('--rail-k', String(k)) }
      }
      const fitSoon = () => { clearTimeout(fitT); fitT = setTimeout(fitRail, 120) }
      ;[600, 1500, 3500, 8000].forEach(t => setTimeout(fitRail, t))
      const lvObs = new MutationObserver(plantLevels)
      const fl = doc.getElementById('floor-list'); if (fl) lvObs.observe(fl, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-current'] })
      plantLevels(); setTimeout(plantLevels, 2000); setTimeout(plantLevels, 6000)
      const plantWalker = () => {
        const cta = doc.querySelector('#hud2 .h-cta'); if (!cta || cta.querySelector('.iaq-walker')) return
        const w = doc.createElementNS('http://www.w3.org/2000/svg', 'svg'); w.setAttribute('viewBox', '0 0 24 24'); w.setAttribute('class', 'iaq-walker'); w.setAttribute('aria-hidden', 'true')
        w.innerHTML = '<circle cx="13.5" cy="4" r="2"/><path d="M13 7.5 9.5 10l-1.5 4.5M13 7.5l2.5 3.5 3 1M13 7.5l-1 5.5 3 3.5 1.5 5M12 13l-3 4-2.5 3.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'
        cta.insertBefore(w, cta.firstChild)
      }
      plantWalker(); setTimeout(plantWalker, 1500); setTimeout(plantWalker, 4000)
      const plantDone = li => { const t = li.querySelector('.rd-t'); if (t && !t.querySelector('.iaq-done')) { const d = doc.createElement('i'); d.className = 'iaq-done'; d.setAttribute('aria-hidden', 'true'); t.appendChild(d) } }
      const watchRail = () => {
        const rail = doc.querySelector('#hud2 .h-rail')
        if (!rail) { setTimeout(watchRail, 500); return }
        const was = new WeakMap()
        const mo = new MutationObserver(ms => {
          for (const m of ms) {
            const li = m.target; if (!(li instanceof doc.defaultView.HTMLElement) || li.tagName !== 'LI') continue
            const done = li.classList.contains('done'), before = was.get(li) || false
            was.set(li, done)
            if (done && !before && !li.classList.contains('iaq-landed')) {
              plantDone(li)
              li.classList.remove('iaq-hit'); void li.offsetWidth; li.classList.add('iaq-hit'); strike(); setTimeout(() => li.classList.remove('iaq-hit'), 900)
            }
          }
        })
        for (const li of rail.querySelectorAll('li')) was.set(li, li.classList.contains('done'))
        mo.observe(rail, { attributes: true, attributeFilter: ['class'], subtree: true })
        new MutationObserver(fitSoon).observe(rail, { attributes: true, attributeFilter: ['class'] , subtree: true })
      }
      watchRail()
      /* the loading screen reads the app's own status until its overlay clears */
      const read = () => {
        const ov = doc.getElementById('overlay'), st = doc.getElementById('status')
        const hidden = !!(ov && ov.classList.contains('hidden'))
        const p = progressOf(st ? st.textContent : '', hidden)
        /* while the app has not reported yet, the count creeps to 9 so the wait reads as progress */
        if (p <= 6 && best < 9 && (++creep % 3 === 0)) best += 1
        best = Math.max(best, p); setProg(best)
        if (st && st.textContent) setStatus(hidden ? 'Ready' : st.textContent.replace(/…$/, ''))
        if (hidden) { setReady(true); clearInterval(poll); poll = 0; measure(); watchLoads() }
      }
      poll = setInterval(read, 200); read()
      /* (Bazil: "make sure there's a loading screen if it takes too long"): after the first ready, the app streams floors
         as the build reaches them and says so in its count line and status; if that lasts longer than 1.5 s a light veil
         with the mark and the app's words comes up over the model, and clears the moment the load does */
      let loadSince = 0
      const watchLoads = () => {
        if (loadPoll) return
        loadPoll = setInterval(() => {
          if (stopped) { clearInterval(loadPoll); return }
          const st = doc.getElementById('status'), ct = doc.querySelector('#hud2 .h-rail li.on .rd-ct')
          const txt = ((ct && ct.textContent) || '') + ' ' + ((st && st.textContent) || '')
          const loading = /loading/i.test(txt) && !inWalk()
          const now = performance.now()
          if (loading) { if (!loadSince) loadSince = now; if (now - loadSince > 1500) { setSlow((txt.match(/Loading[^.]*/i) || ['Loading'])[0].trim()) } }
          else { loadSince = 0; setSlow('') }
        }, 250)
      }
      /* input handed back to the page, except inside the walkthrough */
      let tx = 0, ty = 0, axis = null
      /* inside the walkthrough nothing leaves the frame: the app still gets every event, but the browser's own scroll
         chaining (the frame's document cannot scroll there, so the page would) is stopped */
      /* ---- chapters (Bazil: "one roll of the mouse, the whole section animates nicely, doesn't rush, and then lands",
           "let it land and pause first before continuing"). The app exposes its chapters (patched bundle): for each, the
           progress of its first and last beat and of the next chapter's first. A roll goes to the LAND point of the
           next chapter (midway between its last beat and the following chapter's first beat, so the chapter reads as
           complete and the next has not started), in an unhurried ease over ~2.6 s per chapter; rolls during the move
           and for a moment after it are held. At the end (or the start) a roll leaves the section as ordinary scrolling. */
      const chapters = () => (win.__iaqChapters || [])
      /* the land point sits 15% of the way from a chapter's last beat to the next chapter's first: the last part has
         settled, the finished chapter is still the active row ("12 / 12 placed"), and nothing of the next has begun */
      /* 25 Sep (Bazil: "tools hookup must make sound", "then another scroll, only the overall"): the offset past the last beat
         is capped at .2% of the runway; tools hookup's gap to the overall is eight times the others', and 15% of it ran into
         the overall's first beat, so the rail had already moved on to Overall when the roll landed (the hookup's strike and
         the overall's fired together, and the overall's own roll to the end was silent) */
      const lands = () => { const c = chapters(); return c.map((x, k) => (k === c.length - 1) ? 1 : x.pl + Math.min((x.pn - x.pl) * 0.15, 0.002)) }
      const pageTop = () => el.getBoundingClientRect().top + window.scrollY
      let cooldownUntil = 0
      let snapDir = 0, hurry = false, queued = 0, holdUntil = 0   /* 25 Sep: a roll's direction, the hurry a held wheel asks for, and the step queued behind it */
      /* idx: the chapter whose land point we go to (the target is re-read every frame: the app recomputes its chapter
         fractions when its beat count changes); dir: +1 onward, -1 back */
      const snapTo = (idx, dir) => {
        if (!frameRunway || !pageRunway) return
        snapping = true
        /* the move runs in FRACTIONS of the runway, read afresh every frame: the app resizes its own runway as beats
           load and unload (measured: 22,635 to 20,749 px at a backward jump), and a move computed in pixels of the
           old runway stopped a third short */
        const se = doc.scrollingElement || doc.documentElement
        const liveR = () => Math.max(1, se.scrollHeight - se.clientHeight)
        const landAt = () => { const L = lands(); const v = idx < 0 ? 0 : L[Math.min(idx, L.length - 1)]; return (typeof v === 'number' && isFinite(v)) ? v : 0 }
        const fromP = se.scrollTop / liveR(), L0 = landAt(), dist = Math.abs(L0 - fromP)
        const avg = 1 / Math.max(1, lands().length)
        /* the move follows the app's own speed buttons (Bazil: "follow the speed properly", then "default would be 1"):
           1x, the default, is the unhurried 2.6 s per average chapter; 0.5x 5.2 s, 1.5x 1.7 s, 2x 1.3 s */
        const sp = (() => { const b = doc.querySelector('.h-speed button[aria-pressed="true"]'); const v = b && parseFloat(b.dataset.s); return (v && isFinite(v)) ? v : 1 })()
        const dur0 = Math.min(9000, Math.max(800, 3200 * (1 / sp) * (dist / avg)))   /* 25 Sep (Bazil: "falls down too fast, but not too slow"): 3.2 s per average chapter at 1x, was 2.6 */
        snapDir = dir; hurry = false
        /* pinned: nothing moves but the build. The page runs Lenis (smooth scroll); a native jump leaves its own target
           behind and it drifts the page back over the next second, so the jump goes through Lenis when it is there. */
        const y = Math.round(pageTop() + L0 * pageRunway)
        if (window.__lenis && window.__lenis.scrollTo) window.__lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y)
        let last = performance.now(), p = 0
        const easeInOut = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
        /* 25 Sep, afternoon (Bazil: "continuous scrolling, make it faster"): progress is integrated frame by frame, so
           when the reader keeps the wheel going the rest of the roll finishes inside 600ms with no jump, and the next
           chapter starts the moment this one lands instead of waiting for the wheel to go quiet */
        const tick = now => {
          const dur = hurry ? Math.min(dur0, 600) : dur0
          p = Math.min(1, p + (now - last) / dur); last = now
          const k = easeInOut(p), R = liveR(), L = landAt()
          const cp = fromP + (L - fromP) * k
          current = cp * R; target = current; frameRunway = R
          win.scrollTo(0, Math.round(current))
          el.style.setProperty('--db3-p', cp.toFixed(4))
          if (p < 1) requestAnimationFrame(tick); else {
            snapping = false; hurry = false; cooldownUntil = performance.now() + (queued ? 0 : 550); holdUntil = performance.now() + 300
            const yEnd = Math.round(pageTop() + L * pageRunway)
            if (window.__lenis && window.__lenis.scrollTo) window.__lenis.scrollTo(yEnd, { immediate: true, force: true }); else window.scrollTo(0, yEnd)
            if (dir > 0) { const li = doc.querySelector('#hud2 .h-rail li.on'); if (li && !li.classList.contains('iaq-landed')) { li.classList.add('iaq-landed'); plantDone(li); li.classList.remove('iaq-hit'); void li.offsetWidth; li.classList.add('iaq-hit'); strike(); setTimeout(() => li.classList.remove('iaq-hit'), 900) } }
            if (queued) { const q = queued; queued = 0; if (!snapStep(q)) cooldownUntil = performance.now() + 550 }
          }
        }
        requestAnimationFrame(tick)
      }
      /* dir 1 = onward, -1 = back; returns false when there is nothing to snap to (the section's edge) */
      const snapStep = dir => {
        const c = chapters(); if (!c.length || !frameRunway || tapMode() || inWalk()) return false
        const se = doc.scrollingElement || doc.documentElement
        const cur = se.scrollTop / Math.max(1, se.scrollHeight - se.clientHeight), L = lands()
        if (dir > 0) { const k = L.findIndex(x => x > cur + 0.004); if (k < 0) return false; snapTo(k, 1); return true }
        let k = -1; for (let i = L.length - 2; i >= 0; i--) if (L[i] < cur - 0.004) { k = i; break }
        if (k < 0) { if (cur > 0.004) { snapTo(-1, -1); return true } return false }
        snapTo(k, -1); return true
      }
      doc.addEventListener('wheel', e => {
        e.preventDefault()
        if (inWalk() || diving()) return
        const now = performance.now(), dy = e.deltaY
        if (Math.abs(dy) < 3) return
        const dir = dy > 0 ? 1 : -1
        /* 25 Sep, afternoon (Bazil: "why can't scroll back up, and continuous scrolling, make it faster"): a wheel held in
           the roll's direction hurries it and queues the next chapter, so a continuous scroll runs chapter into chapter,
           forward or back; a push the other way queues a turn. After a roll, the first 300ms hold against a trackpad's
           inertia tail; after that a real push (25 or more) starts the next roll, and only the small tail extends the hold. */
        if (snapping) { if (Math.abs(dy) >= 12) { if (dir === snapDir) hurry = true; queued = dir } return }
        if (now < cooldownUntil) { if (Math.abs(dy) < 25 || now < holdUntil) { cooldownUntil = Math.max(cooldownUntil, now + 250); return } }
        if (snapStep(dir)) return
        window.scrollBy(0, dy)
      }, { passive: false, capture: true })
      /* scroll keys pressed with the page (not the frame) focused, while the section is pinned: the same chapter step */
      window.addEventListener('keydown', e => {
        if (doc.activeElement === f || document.activeElement === f) return
        if (inWalk() || diving() || tapMode()) return
        const r = el.getBoundingClientRect(); if (r.top > 1 || r.bottom < window.innerHeight - 1) return
        const k = e.key, dir = (k === 'ArrowDown' || k === 'PageDown' || k === ' ') ? 1 : (k === 'ArrowUp' || k === 'PageUp') ? -1 : 0
        if (!dir) return
        e.preventDefault()
        if (snapping || performance.now() < cooldownUntil) return
        if (snapStep(dir)) return
        window.scrollBy(0, dir * (k.startsWith('Arrow') ? 60 : window.innerHeight * 0.85))
      })

      /* ---- colour (Bazil: "colour all the architectural art in the colour it's associated with, and each section the
           same way"): every mesh a chapter's stages place takes that chapter's hue. Materials are cloned per hue so a
           material shared between chapters splits cleanly; the app's own materials are left as they are. */
      const HUES = [[/civil|structur/i, '#8e9aa6'], [/architect/i, '#c98a4b'], [/air.?condition|hvac|ventil/i, '#e8691f'], [/fire/i, '#d93025'], [/electric|ht ?&|lv/i, '#2fa84f'], [/process|utilit/i, '#1e9ad8'], [/cleanroom/i, '#3fb8ab'], [/tool|hook/i, '#9186c9'], [/overall/i, null]]
      const hueOf = name => { const h = HUES.find(([re]) => re.test(name || '')); return h ? h[1] : null }
      /* in place, never cloned: a clone loses the app's shader patches and its loading stalls (measured: 32 meshes bound
         instead of 577). No material is shared between chapters (measured), and the app keeps each material's original
         colour in userData.__origColor for its fades, so that is set too or the tint would be undone on the next fade. */
      const colour = () => {
        const asm = win.__iaqAsm; if (!asm || !asm.groups || !asm.stages) return 0
        let n = 0
        asm.groups.forEach((objs, idx) => {
          const st = asm.stages[idx]; const hue = hueOf(st && st.chapter); if (!hue) return
          for (const o of objs) o.traverse(m => {
            if (!m.isMesh || !m.material) return
            const mats = Array.isArray(m.material) ? m.material : [m.material]
            for (const mat of mats) {
              if (!mat || !mat.color || !mat.color.set || mat.userData.iaqHue === hue) continue
              mat.color.set(hue)
              const oc = mat.userData.__origColor
              if (oc && typeof oc === 'object' && oc.set) oc.set(hue); else if (typeof oc === 'number' || typeof oc === 'string') mat.userData.__origColor = mat.color.getHex()
              mat.userData.iaqHue = hue; n++
            }
          })
        })
        return n
      }
      const NOCOLOUR = new URLSearchParams(window.location.search).has('nocolour')
      /* ---- 25 Sep, evening (Bazil: "need to be able to view this in x-ray vision for each, eye icons beside each segment",
           "ideally should be this close"). At the finished view the app switches the system layers off (layer-detail-ducts,
           -sprinklers, -tools ...) and shows the exterior. An eye on each finished system turns x-ray on: that system's
           layers come back on in its hue and everything else turns to glass; several can be on at once; the eye on Overall
           shows all eight through the envelope. Any change of chapter clears it, so the app's own fades never fight it.
           Our state lives in userData.iaqX (materials) and iaqXV (objects); the app's own fields are never touched. ---- */
      const XR = new Set(); let xrRoot = null, xrShown = new Set(), xrForced = [], xrMats = new Set(), xrRaf = 0, xrTick = 0, xrRow = null
      const GHOST = .09
      const sceneRoot = () => { if (xrRoot) return xrRoot; const asm = win.__iaqAsm; if (!asm || !asm.groups) return null; for (const objs of asm.groups.values()) { for (const o of objs) { let r = o; while (r.parent) r = r.parent; xrRoot = r; return r } } return null }
      const chainOn = x => { let q = x; while (q) { if (!q.visible) return false; q = q.parent } return true }
      /* the ghost is a glass COPY of each material, swapped onto the mesh: the app's glazing pass re-sets the opacity of any
         transparent shell material every frame (to .96), so the copy carries asmOpacity 1, which that pass skips; the
         app's own materials are never written. xrMats holds [mesh, original] pairs; the copies are shared per original. */
      const ghostOf = new Map()
      const ghostMesh = x => {
        if (x.userData.iaqXM) return
        const orig = x.material; x.userData.iaqXM = orig; xrMats.add(x)
        /* 27 Sep (Bazil: "why dis not functioning", a blank stage with X-ray on): only shaded materials get a glass copy. The
           app's shadow catcher carries a ShadowMaterial whose clone came back as a bare Material with no shader, and one such
           mesh in view throws inside the program builder on every frame, so nothing draws. Those materials stay as they are. */
        const glassable = m => !!m && m.isMaterial && !m.isShadowMaterial && m.type !== 'ShadowMaterial' && m.type !== 'Material' && (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial || m.isMeshBasicMaterial || m.isMeshLambertMaterial || m.isMeshPhongMaterial)
        const one = m => { if (!glassable(m)) return m; let g = ghostOf.get(m); if (!g) { g = m.clone(); if (!g || !g.isMaterial || g.type === 'Material') { ghostOf.set(m, m); return m } g.transparent = true; g.opacity = GHOST; g.depthWrite = false; g.userData = { asmOpacity: 1, iaqGhost: 1 }; ghostOf.set(m, g) } return g }
        x.material = Array.isArray(orig) ? orig.map(one) : one(orig)
      }
      const unghost = () => { xrMats.forEach(x => { if (x.userData.iaqXM) { x.material = x.userData.iaqXM; delete x.userData.iaqXM } }); xrMats.clear(); ghostOf.forEach((g, m) => { if (g !== m && g.dispose) g.dispose() }); ghostOf.clear() }
      const xrClear = () => {
        cancelAnimationFrame(xrRaf); xrRaf = 0
        unghost()
        xrForced.forEach(([o, v]) => { o.visible = v; delete o.userData.iaqXV }); xrForced = []; xrShown = new Set()
        XR.clear(); paintEyes()
      }
      const xrApply = () => {
        const asm = win.__iaqAsm, root = sceneRoot(); if (!asm || !root) return
        /* restore first, then build the new state, so toggling one eye never leaves a stale ghost */
        unghost()
        xrForced.forEach(([o, v]) => { o.visible = v; delete o.userData.iaqXV }); xrForced = []
        const all = XR.has('*'); xrShown = new Set()
        /* the eye on Overall shows every system INSIDE the building: the fabric (civil and architectural) turns to glass with the
           exterior, or it would hide the rest */
        const FABRIC = /civil|structur|architect/i
        asm.groups.forEach((objs, idx) => { const st = asm.stages[idx]; if (!st || !(all ? !FABRIC.test(st.chapter) : XR.has(st.chapter))) return; for (const o of objs) o.traverse(m => { if (m.isMesh) xrShown.add(m) }) })
        /* the chosen parts and every hidden object above them come on (the layer roots the app switched off) */
        xrShown.forEach(m => { let q = m; while (q && q !== root) { if (!q.visible && !q.userData.iaqXV) { q.userData.iaqXV = 1; xrForced.push([q, false]); q.visible = true } q = q.parent } })
        /* everything else still in view turns to glass */
        root.traverse(x => { if (!x.isMesh || xrShown.has(x) || !chainOn(x) || x.name === 'iaq-shadow-catcher') return; ghostMesh(x) })
        if (!xrRaf) { const loop = () => { if (stopped || !XR.size) { xrRaf = 0; return } xrForced.forEach(([o]) => { if (!o.visible) o.visible = true }); xrRaf = requestAnimationFrame(loop) }; xrRaf = requestAnimationFrame(loop) }
        paintEyes()
      }
      const EYE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="e-o" d="M2.5 12c2.4-4.2 5.6-6.3 9.5-6.3s7.1 2.1 9.5 6.3c-2.4 4.2-5.6 6.3-9.5 6.3S4.9 16.2 2.5 12z"/><circle class="e-p" cx="12" cy="12" r="3.1"/></svg>'
      const paintEyes = () => {
        doc.querySelectorAll('#hud2 .h-rail li').forEach(li => { const b = li.querySelector('.iaq-eye'); if (!b) return; const key = b.dataset.k; const on = XR.has(key); b.setAttribute('aria-pressed', on ? 'true' : 'false'); li.classList.toggle('iaq-xr', on) })
        const rail = doc.querySelector('#hud2 .h-rail'); if (rail) rail.classList.toggle('iaq-xr-on', XR.size > 0)
        let chip = doc.getElementById('iaq-xr-chip')
        if (!chip) { chip = doc.createElement('div'); chip.id = 'iaq-xr-chip'; chip.setAttribute('role', 'status'); chip.setAttribute('aria-live', 'polite'); doc.body.appendChild(chip); chip.addEventListener('click', e => { if (e.target.closest('button')) xrClear() }) }
        const names = XR.has('*') ? ['Every system inside the building'] : [...XR]
        chip.hidden = !XR.size
        chip.innerHTML = XR.size ? `<span class="xr-k">X-ray</span><span class="xr-n">${names.join(', ')}</span><button type="button">Clear</button>` : ''
      }
      const plantEyes = () => {
        const rows = [...doc.querySelectorAll('#hud2 .h-rail li')]; if (!rows.length) return
        rows.forEach((li, i) => {
          if (li.querySelector('.iaq-eye')) return
          const name = (li.querySelector('.rd-t') ? li.querySelector('.rd-t').childNodes[0].textContent : '').trim(); if (!name) return
          const last = i === rows.length - 1, key = last ? '*' : name
          const b = doc.createElement('button'); b.type = 'button'; b.className = 'iaq-eye'; b.dataset.k = key; b.innerHTML = EYE
          b.setAttribute('aria-label', last ? 'X-ray: see every system inside the building' : `X-ray: see ${name} through the building`); b.title = last ? 'X-ray every system inside' : `X-ray ${name}`
          const stop = e => { e.stopPropagation() }
          b.addEventListener('pointerdown', stop); b.addEventListener('mousedown', stop)
          b.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); if (key === '*') { const was = XR.has('*'); XR.clear(); if (!was) XR.add('*') } else { XR.delete('*'); XR.has(key) ? XR.delete(key) : XR.add(key) } XR.size ? xrApply() : xrClear() })
          li.appendChild(b)
        })
        paintEyes()
      }
      /* a reader's own zoom is never overridden (the auto zoom on the finished view left on 29 Sep, see below). Any change
         of chapter clears the x-ray. */
      let autoZ = 0
      const watchFinal = () => {
        if (stopped) { clearInterval(finalT); return }
        const rows = [...doc.querySelectorAll('#hud2 .h-rail li')], on = doc.querySelector('#hud2 .h-rail li.on'), asm = win.__iaqAsm
        const final = !!(on && rows.length && on === rows[rows.length - 1])
        const rail = doc.querySelector('#hud2 .h-rail'); if (rail) rail.classList.toggle('iaq-final', final)
        if (on !== xrRow) { if (xrRow && XR.size) xrClear(); xrRow = on }
        /* 25 Sep, 16:55 (Bazil: "what's with all the holes"): mid-build the developer's app cuts the facade open to show the
           floors; up close (its own ceiling is 4x) that cut reads as holes. The reader's zoom stops at 2.4. */
        if (asm && asm.zoomLevel > 2.4) asm.zoomLevel = 2.4
        /* 29 Sep (Bazil: "zoom in zoom out animation haram", "cannot"): the finished view no longer eases in to 2x on the
           last chapter and back out when the build leaves it. The camera holds; only the reader's own +/- zooms. */
        plantEyes()
      }
      /* 25 Sep, 17:30 (Bazil: "why is this pillar extruding out, make it cleaner"): the piles are merged into the site meshes and
         come in two lengths (their toes at 4.25 m and 1.25 m below datum, measured from the vertices), so the field hung
         ragged under the building. One clipping plane at -1.2 m levels every pile at the shorter depth: a clean foundation
         line, no pile shortened past its own toe. Added to the materials of any mesh reaching below it, re-checked every
         1.5 s in case the app hands a material a new clipping list; the app's own planes are kept. */
      const PILE_Y = -1.2
      let pilePlane = null
      const levelPiles = () => {
        const asm = win.__iaqAsm, root = sceneRoot(); if (!asm || !root || !asm.planes || !asm.planes[0]) return
        if (!pilePlane) { const P = asm.planes[0].constructor, V = asm.planes[0].normal.constructor; pilePlane = new P(new V(0, 1, 0), -PILE_Y) }
        root.traverse(x => {
          if (!x.isMesh || !x.geometry) return
          if (x.userData.iaqPileLow === undefined) { if (!x.geometry.boundingBox) x.geometry.computeBoundingBox(); const bb = x.geometry.boundingBox.clone().applyMatrix4(x.matrixWorld); x.userData.iaqPileLow = bb.min.y < PILE_Y }
          if (!x.userData.iaqPileLow) return
          ;(Array.isArray(x.material) ? x.material : [x.material]).forEach(m => { if (!m) return; const cp = m.clippingPlanes || []; if (cp.indexOf(pilePlane) < 0) { m.clippingPlanes = cp.concat([pilePlane]); m.needsUpdate = true } })
        })
      }
      const pileT = setInterval(() => { if (stopped) { clearInterval(pileT); return } levelPiles() }, 1500)
      ;[600, 2000].forEach(t => setTimeout(levelPiles, t))
      const finalT = setInterval(watchFinal, 350)
      doc.addEventListener('click', e => { const b = e.target.closest && e.target.closest('#hud2 .h-start'); if (b && win.__iaqAsm) { win.__iaqAsm.zoomLevel = 1; autoZ = 0; if (XR.size) xrClear() } }, true)
      win.addEventListener('unload', () => clearInterval(finalT))
      win.__iaqOnBind = () => { if (!NOCOLOUR) setTimeout(colour, 0); setTimeout(fitRail, 50) }; if (!NOCOLOUR) [800, 2500, 5000, 9000].forEach(t => setTimeout(colour, t))
      doc.addEventListener('touchstart', e => { const t = e.touches[0]; if (!t) return; tx = t.clientX; ty = t.clientY; axis = null }, { passive: true })
      doc.addEventListener('touchmove', e => {
        if (inWalk() || diving()) { e.preventDefault(); return }
        if (!e.touches[0] || e.touches.length > 1) return
        const t = e.touches[0], dx = t.clientX - tx, dy = t.clientY - ty
        if (!axis) { if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return; axis = Math.abs(dy) >= Math.abs(dx) ? 'y' : 'x' }
        if (axis !== 'y') return
        window.scrollBy(0, -dy); tx = t.clientX; ty = t.clientY; e.preventDefault()
      }, { passive: false, capture: true })
      /* the page's own scroll keys are held while the walkthrough is open, in case focus sits on the page */
      window.addEventListener('keydown', e => { if ((inWalk() || diving()) && (e.key === ' ' || e.key === 'PageDown' || e.key === 'PageUp' || e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End')) e.preventDefault() })
      doc.addEventListener('keydown', e => {
        const k = e.key, h = window.innerHeight
        if (inWalk() || diving()) { if (k === ' ' || k === 'PageDown' || k === 'PageUp' || k === 'ArrowDown' || k === 'ArrowUp') e.preventDefault(); return }
        const dir = (k === 'ArrowDown' || k === 'PageDown' || k === ' ') ? 1 : (k === 'ArrowUp' || k === 'PageUp') ? -1 : 0
        if (!dir) return
        e.preventDefault()
        if (snapping || performance.now() < cooldownUntil) return
        if (snapStep(dir)) return
        window.scrollBy(0, dir * (k.startsWith('Arrow') ? 60 : h * 0.85))
      })
      /* the app moves its own scroll on a rail click and during Replay build; the page follows (pinned: invisible), so
         the next roll, the scrollbar and the progress line start from where the build really is */
      const se0 = doc.scrollingElement || doc.documentElement
      doc.addEventListener('scroll', () => {
        if (snapping || inWalk() || tapMode() || !frameRunway || !pageRunway) return
        const st = se0.scrollTop; if (Math.abs(st - current) < 3) return
        current = st; target = st
        const R = Math.max(1, se0.scrollHeight - se0.clientHeight), cp = st / R
        el.style.setProperty('--db3-p', cp.toFixed(4))
        const y = Math.round(pageTop() + cp * pageRunway)
        if (Math.abs(window.scrollY - y) > 2) { if (window.__lenis && window.__lenis.scrollTo) window.__lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y) }
      }, { passive: true })
      const ro = new ResizeObserver(() => { measure(); fitSoon() }); ro.observe(doc.documentElement)
      /* the walkthrough's exit brings the runway back: measure again then */
      const mo = new MutationObserver(() => { if (!inWalk()) measure() })
      const rb = doc.getElementById('room-bar'); if (rb) mo.observe(rb, { attributes: true, attributeFilter: ['hidden'] })
      setTimeout(measure, 1600); setTimeout(measure, 3200)
    }
    const far = new IntersectionObserver(([e]) => {
      isFar = !e.isIntersecting
      setIsFar(isFar)
      if (!isFar) { setTimeout(nudge, 60); setTimeout(measure, 160); setTimeout(nudge, 500) }
    }, { rootMargin: '100% 0px 100% 0px', threshold: 0 })
    far.observe(el)
    f.addEventListener('load', wire)
    if (f.contentDocument && f.contentDocument.readyState === 'complete' && f.contentDocument.getElementById('app')) wire()
    window.addEventListener('scroll', aim, { passive: true })
    window.addEventListener('resize', measure)
    return () => { stopped = true; clearTimeout(warmT); clearInterval(poll); clearInterval(loadPoll); clearInterval(alive); clearTimeout(helloT); try { if (win) win.__iaqOnBind = null; roomObs && roomObs.disconnect(); if (tapeRaf && win) win.cancelAnimationFrame(tapeRaf) } catch {} far.disconnect(); window.removeEventListener('scroll', aim); window.removeEventListener('resize', measure); f.removeEventListener('load', wire); cancelAnimationFrame(raf) }
  }, [go])

  /* 25 Sep, 17:00 (Bazil: "make a better loading screen, not weird, and the loading bar to get to 100", "can the experience
     in the beginning loading be better"): the bar never jumps and never vanishes short of the end. The shown count eases
     toward the app's real progress; once the app is ready it runs on to 100, holds a beat, and only then does the loader
     lift, onto the finished facility that has been sharpening behind it the whole time. */
  useEffect(() => {
    let raf = 0, alive = true, holdT = 0
    const tick = () => {
      if (!alive) return
      setShown(v => {
        const target = (ready && !warm) ? 100 : Math.min(97, prog)
        if (v >= target) return v
        const nv = Math.min(target, v + Math.max(ready && !warm ? 1.6 : 0.25, (target - v) * (ready && !warm ? 0.14 : 0.06)))
        if (nv >= 100 && !holdT) holdT = setTimeout(() => setLanded(true), 380)
        return nv
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { alive = false; cancelAnimationFrame(raf); clearTimeout(holdT) }
  }, [ready, warm, prog])

  /* 25 Sep, afternoon (Bazil: "command ctrl zoom in etc should shortcut zoom in and out"): while the build fills the
     screen, Cmd or Ctrl with + (or =), - and 0 zoom the model through the app's own buttons instead of zooming the page.
     Listened to on the page and inside the frame, since the key goes to whichever document has focus. */
  /* 25 Sep, afternoon (Bazil: "during the intro it cannot be blank, something must be seen first somehow and it animates to
     this UI"): the app opens on an empty stage (0 of 12 placed) with its list and buttons already drawn. Now the finished
     facility, cut from the app's own end state, stands over the stage first; it dissolves as the visitor starts the build,
     until the app reports its first part placed (the host rolls to the first beat on arrival), or beyond 35% of the runway (phones build on tap, and
     "Start build" builds without scrolling). Nothing of the app is touched: the image sits over the canvas region only,
     never over the list, and takes no pointer. */
  useEffect(() => {
    if (!ready) return
    let raf = 0, placed = 0, inRoom = false, enteringUntil = 0   /* the app's own count for the chapter on screen, read every 400ms; never latched */
    /* the app takes about 2.5 s to turn its body to .room; the ghost leaves the moment the walkthrough is asked for */
    const onEnter = () => { enteringUntil = performance.now() + 6000; tick() }
    window.addEventListener('db3:enter', onEnter)
    const tick = () => {
      raf = 0
      const el = sec.current; if (!el) return
      const r = el.getBoundingClientRect(); const run = Math.max(1, r.height - innerHeight)
      const frac = Math.min(1, Math.max(0, -r.top / run))
      /* the ghost stands only on the empty stage at the very top of the runway (under 5%, where chapter 1 is the only
         chapter): the moment a part is placed, or the arrival roll carries the page past that, it dissolves; scroll back
         to an empty stage and it returns */
      const g = (placed === 0 && frac < 0.05 && !inRoom && performance.now() > enteringUntil) ? 1 : 0   /* 25 Sep (Bazil: "when clicking the walkthrough make sure it looks proper first"): the finished-facility ghost stood over the walkthrough */
      setGhost(v => (v !== g ? g : v))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick) }
    const poll = setInterval(() => {
      try { const d = frame.current && frame.current.contentDocument; inRoom = !!(d && d.body && d.body.classList.contains('room')); const t = d && d.body ? d.body.innerText : ''; const m = /(\d+)\s*\/\s*\d+\s*placed/i.exec(t); placed = m ? +m[1] : 0; tick() } catch (e) {}
    }, 400)
    window.addEventListener('scroll', onScroll, { passive: true }); tick()
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('db3:enter', onEnter); clearInterval(poll); if (raf) cancelAnimationFrame(raf) }
  }, [ready])

  useEffect(() => {
    if (!ready) return
    const onKey = e => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return
      const k = e.key
      const id = (k === '=' || k === '+') ? 'zoom-in' : (k === '-' || k === '_') ? 'zoom-out' : k === '0' ? 'zoom-reset' : null
      if (!id) return
      const s = sec.current; if (!s) return
      const r = s.getBoundingClientRect(); if (r.top > innerHeight * .4 || r.bottom < innerHeight * .6) return
      const d = frame.current && frame.current.contentDocument; const btn = d && d.getElementById(id); if (!btn) return
      e.preventDefault(); e.stopPropagation(); btn.click()
    }
    window.addEventListener('keydown', onKey, true)
    let w = null; try { w = frame.current && frame.current.contentWindow; w && w.addEventListener('keydown', onKey, true) } catch (err) { w = null }
    return () => { window.removeEventListener('keydown', onKey, true); try { w && w.removeEventListener('keydown', onKey, true) } catch (err) {} }
  }, [ready])

  const cls = 'db3'   /* not .sec: its padding put a 70px band of ground above and below the pinned frame (Bazil: "why is there another section at top", "this bottom section as well") */ + (ready && !warm ? ' is-ready' : '') + (warm ? ' is-warm' : '') + (isFar ? ' is-far' : '')
  const clsLight = LIGHT_BUILD ? ' is-light' : ''
  return (
    <section className={cls + clsLight} id="build3d" ref={sec} style={{ '--db3-runway': runway + 'px' }} aria-label="IAQ's facility, built as you scroll">
      <div className="db3-pin">
        {go && <iframe ref={frame} className="db3-frame" src={src} title="IAQ's facility in 3D: it assembles as the page scrolls. Drag to turn, hover a part to name it, zoom with the buttons" allow="fullscreen; pointer-lock" />}
        <span className="db3-line" aria-hidden="true" />
        <div className={'db3-intro' + (ready && !warm ? ' is-in' : '') + (ghost === 0 ? ' is-gone' : '')} style={{ '--ghost': ghost }} aria-hidden="true">
          {/* 26 Sep, 13:45 (Bazil, on the finished-facility still over the empty site: "remove this weird image"): no ghost picture; the stage shows the site itself, the caption keeps the instruction */}
          <span className="db3-ghost-cap">{COARSE() ? 'Tap the stage to build the facility from the piles up.' : 'Scroll to build the facility from the piles up.'}</span>
        </div>
        <div className={'db3-slow' + (slow ? ' is-on' : '')} role="status" aria-live="polite" aria-hidden={!slow}>
          <span className="db3-logo db3-logo-s" aria-hidden="true" />
          <span className="db3-st">{slow}</span>
        </div>
        <div className={'db3-load' + (landed ? ' is-done' : '')} role="status" aria-live="polite" style={{ '--k': (shown / 100).toFixed(3) }}>
          <div className="db3-load-in">
            <span className="db3-load-logo" aria-hidden="true" />
            <b className="db3-load-t">{shown >= 100 ? 'The facility is ready' : 'Building the facility'}</b>
            <span className="db3-bar" aria-hidden="true"><i /></span>
            <span className="db3-load-row"><span className="db3-st">{shown >= 100 ? 'Scroll to build it from the piles up' : status}</span><b className="db3-pct">{Math.floor(shown)}%</b></span>
          </div>
        </div>
      </div>
    </section>
  )
}
