import React, { useEffect, useRef } from 'react'
import { mount, load } from '../scenes/build3d.js'
import '../styles/build3d.css'

/* Build3D · the Scroll to build 3D on the home page, in the page itself (28 Sep 2026: "build with the website i dont
   iframe, i want the 3d and website build in the same project"). The app runs in this document; see
   scenes/build3d.js for how, and tools/embed-3d.mjs for how a new delivery is brought in.

   On a desktop the models start loading once the page is idle, so the build is ready by the time the visitor
   scrolls to it; on a touch device only as the section comes near, so a phone that never gets there never pays for
   130 MB. */
const TOUCH = () => matchMedia('(hover: none) and (pointer: coarse)').matches

export default function Build3D () {
  const sec = useRef(null)
  useEffect(() => {
    const el = sec.current
    if (!el) return
    const unmount = mount(el)
    let cancel
    if (!TOUCH()) {
      const id = window.requestIdleCallback ? requestIdleCallback(load, { timeout: 1500 }) : setTimeout(load, 1800)
      cancel = () => (window.cancelIdleCallback ? cancelIdleCallback(id) : clearTimeout(id))
    } else {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { load(); io.disconnect() } }, { rootMargin: '150% 0px' })
      io.observe(el)
      cancel = () => io.disconnect()
    }
    return () => { cancel(); unmount() }
  }, [])
  return <section className="b3d" id="build3d" ref={sec} aria-label="IAQ's facility, built as you scroll" />
}
