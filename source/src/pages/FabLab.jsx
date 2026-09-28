import React, { useEffect, useState } from 'react'
import FabAssembly from '../components/FabAssembly.jsx'

/* /#/fab: the facility model on its own, for iteration and capture.

   9 Sep: the Design tab embeds THIS route rather than carrying a second model of the same
   building (client: "its suppose to be our parallax actual 3d"). A copy would drift from the
   real one the first time either changed, so there is only ever one fab in this build.

   Embedded, it drops the workspace bar (the parent page already has one) and lands part way
   into the runway, because a model showing an empty site is a poor first frame. */
export default function FabLab() {
  const [embed, setEmbed] = useState(false)
  useEffect(() => {
    document.title = 'IAQ Group · Fab model · lab'
    let framed = false
    try { framed = window.self !== window.top } catch (e) { framed = true }
    setEmbed(framed)
    if (!framed) return
    document.documentElement.classList.add('fab-embed')
    /* the runway is 1800vh; 0.42 of it puts the build around the cleanroom, which is the
       frame that reads best cold. Deferred so ScrollTrigger has measured first. */
    const t = setTimeout(() => {
      const sec = document.querySelector('.fab')
      if (sec) window.scrollTo({ top: sec.offsetTop + sec.offsetHeight * 0.42, behavior: 'instant' })
    }, 900)
    return () => { clearTimeout(t); document.documentElement.classList.remove('fab-embed') }
  }, [])
  return (
    <main style={{ background: '#F6F6F6', minHeight: '100vh' }}>
      <FabAssembly />
      <div style={{ height: embed ? '4vh' : '40vh' }} />
    </main>
  )
}
