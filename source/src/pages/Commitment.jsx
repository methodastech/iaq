import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import PageHead from '../components/PageHead.jsx'
import Icon from '../components/FlowIcon.jsx'
import { LINE_MARKS } from '../components/HeroLineMarks.jsx'
import { MarkEnv, MarkSocial, MarkGov } from '../components/CommitMarks.jsx'
import { bySlug, longDate } from '../data/news.js'
import '../styles/pages.css'
import '../styles/commitment.css'

/* ============================================================================
   Corporate Commitment · /about/commitment · rebuilt 25 Sep 2026.

   IAQ (client review, 24 Sep): "Can't this page at least follow our content in current website
   whereby we can see our certificate directly and policy is attached direct as pdf." So the page
   follows the live iaqtechnology.com.my/corporate-commitment sequence, block for block, in the
   house design language (white base, flat tint tiles, Switzer headings, no lines, no boxes):

     1  Sustainability and responsibility          a living Earth beside the three pillars, each with its mark
     2  Environment and sustainability             the CSR events
     3  Quality, environment, health and safety    the EHS statement + both policies as PDFs
     4  The three ISO certificates                 one viewer: pick a standard, the certificate and its facts
     5  EHS metrics for the past three years       the six counters the live site publishes
     6  QEHS events                                the three quality and safety stories
     7  Registrations and recognitions             CIDB, Intertek, UKAS, Highwire gold (client order)

   Same day, Bazil: the certificates "present this better and more premium" (the three full pages in
   a row read as a document dump; now one certificate at a time, large, with its facts beside it and
   the other two a press away), "create a more lively world and earth" (the globe has continents from
   the site's own land grid, day-side shading, a light sweep, the offices pulsing and the routes from
   HQ travelling), "create icons and visual animation for each" pillar (CommitMarks.jsx).
   The badge order is the client's: "CIDB, Intertek, Ukas, Highwire with gold Crown, remove circle
   highwire and GOLD OSH column." Policy PDFs are IAQ's own files from the live site (both signed by
   the CEO on 15 November 2024), at public/docs/policies with a first-page preview beside each.
   Counters are the live site's values. Previous cut: src/_backups/commitment-0925/.
   ============================================================================ */

const PILLARS = [
  { k: 'Environmental responsibility', Mark: MarkEnv, iso: 'esgEnv',
    t: 'IAQ is dedicated to minimising its environmental footprint through sustainable design and construction practices. It continuously seeks energy-efficient solutions and prioritises eco-friendly technologies.' },
  { k: 'Social accountability', Mark: MarkSocial, iso: 'esgSocial',
    t: 'The well-being and safety of employees and communities come first. IAQ promotes a diverse and inclusive work environment and upholds ethical labour practices.' },
  { k: 'Corporate governance', Mark: MarkGov, iso: 'esgGov',
    t: 'Governance practices ensure transparency, accountability and ethical decision-making. IAQ adheres to the highest standards in compliance, fostering trust and credibility with clients, partners and stakeholders.' },
]

const CSR = ['pdk-kota-raja-community-visit', 'house-of-love-charity-luncheon', 'chinese-new-year-community-2025']
const QEHS = ['ims-global-standards-commitment', 'celebrating-2-6-million-safe-manhours', 'osh-excellence-awards-2024-gold']

const POLICIES = [
  { k: 'IAQ Quality Policy',
    t: 'The commitment behind ISO 9001:2015: meet customer, statutory and regulatory requirements, enhance customer satisfaction and continually improve the quality management system.',
    file: '/docs/policies/IAQ-Quality-Policy.pdf', img: '/assets/iaq/policies/quality-policy.jpg' },
  { k: 'IAQ EHS Policy',
    t: 'The commitment behind ISO 14001:2015 and ISO 45001:2018: healthy and safe working conditions, hazards eliminated and risks reduced, and sustainable engineering, procurement and construction practice.',
    file: '/docs/policies/IAQ-EHS-Policy.pdf', img: '/assets/iaq/policies/ehs-policy.jpg' },
]

/* every fact below is read off the certificate itself */
const SCOPE = 'Provision of total solutions and project management for engineering, procurement, construction and commissioning for all industries'
const CERTS = [
  { name: 'ISO 9001:2015', k: 'Quality management system', no: 'Q903788A', since: '1 August 2015', valid: '13 June 2029',
    file: '/docs/certificates/IAQ-ISO-9001-2015-certificate.pdf', img: '/assets/iaq/certs/iso-9001.webp',
    t: 'The quality management system aligns with globally recognised standards. Products and services are delivered consistently through efficient processes and a strong focus on customer satisfaction, with operations improved, errors reduced and performance optimised on every project.' },
  { name: 'ISO 14001:2015', k: 'Environmental management system', no: 'E903788', since: '14 June 2023', valid: '13 June 2029',
    file: '/docs/certificates/IAQ-ISO-14001-2015-certificate.pdf', img: '/assets/iaq/certs/iso-14001.webp',
    t: 'An effective environmental management system is in place. Environmental impact is managed and reduced systematically across all operations, from minimising waste and conserving natural resources to lowering energy consumption and carbon emissions.' },
  { name: 'ISO 45001:2018', k: 'Occupational health and safety management system', no: '0151940', since: '20 June 2023', valid: '19 June 2029',
    file: '/docs/certificates/IAQ-ISO-45001-2018-certificate.pdf', img: '/assets/iaq/certs/iso-45001.webp',
    t: 'A safe and healthy working environment for all employees, contractors and visitors. Workplace hazards are identified and managed, accidents prevented and a culture of safety promoted, with safety practices assessed and improved continuously.' },
]

const METRICS = [
  { n: 0, k: 'Lost time injury', icon: 'shield' },
  { n: 7660073, k: 'Project manhours', u: 'hrs', icon: 'clock' },
  { n: 7725, k: 'EHS induction', icon: 'helmet' },
  { n: 2458, k: 'Daily toolbox talk', icon: 'people' },
  { n: 7660073, k: 'Safety manhours', u: 'hrs', icon: 'check' },
  { n: 12840, k: 'Permits to work', icon: 'file' },
]

const BADGES = [
  { src: '/assets/badge-cidb.webp', alt: 'CIDB registered contractor' },
  { src: '/assets/badge-iso.webp', alt: 'Intertek ISO certification mark' },
  { src: '/assets/badge-ukas.webp', alt: 'UKAS management systems accreditation' },
  { src: '/assets/badge-highwire-gold-2024.webp', alt: 'Highwire Safety Gold 2024' },
]

/* IAQ's offices, HQ first: the red points on the globe and the routes out of Shah Alam */
const OFFICES = [
  [3.07, 101.52], [5.41, 100.33], [1.35, 103.82], [51.05, 13.74],
  [28.61, 77.21], [59.33, 18.07], [33.45, -112.07], [53.35, -6.26],
]

const ll = (lat, lon, r = 1) => {
  const p = (90 - lat) * Math.PI / 180, t = (lon + 180) * Math.PI / 180
  return [-r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t)]
}

/* ---- the Earth (Bazil, 25 Sep: "make the world more alive like pic 1", a photograph of the planet): a textured
   planet in three.js. NASA's Blue Marble day map and cloud map (public domain, public/assets/earth), a cloud shell
   turning a little faster than the ground, a soft blue atmosphere at the rim, IAQ's eight offices as red points with
   a ring breathing out of each, and the routes from Shah Alam with a point travelling them. It turns on its own,
   drag turns it by hand, it pauses off screen, and it is one still under reduced motion. three loads only here. ---- */
function EarthGlobe () {
  const host = useRef(null)
  useEffect(() => {
    const box = host.current
    if (!box) return
    let alive = true, dispose = () => {}
    ;(async () => {
      let THREE
      try { THREE = await import('three') } catch { return }
      if (!alive) return
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      let renderer
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }) } catch { return }
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
      renderer.setClearColor(0x000000, 0)
      if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace
      box.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 20)
      cam.position.set(0, 0, 4.6)
      scene.add(new THREE.AmbientLight(0xffffff, 1.15))
      scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x8a94a8, 0.6))
      const sun = new THREE.DirectionalLight(0xffffff, 2.4)
      sun.position.set(-3.2, 2.4, 3.6)
      scene.add(sun)

      const loader = new THREE.TextureLoader()
      const load = src => new Promise(res => loader.load(src, t => res(t), undefined, () => res(null)))
      const [day, clouds] = await Promise.all([load('/assets/earth/day-2048.jpg'), load('/assets/earth/clouds-1024.jpg')])
      if (!alive) { renderer.dispose(); return }
      const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy())
      if (day) { day.colorSpace = THREE.SRGBColorSpace; day.anisotropy = aniso }
      if (clouds) { clouds.anisotropy = aniso }

      const world = new THREE.Group()
      world.rotation.z = 0.28
      world.rotation.y = 2.6
      scene.add(world)
      /* 25 Sep (Bazil: "no need that weird blue shield", "somehow can we turn this into IAQ world"): the planet in the house
         palette. The day map is read for where the sea is (its blue against the land's warm tones) and for the land's
         relief; the sea prints in ink, the land in paper with a little of its own shading; a soft terminator and a darkened
         limb give it a body. No cloud shell, no atmosphere. The offices and the routes stay red. Colours are sRGB floats
         (vec3), not THREE.Color, so ColorManagement does not darken them. */
      const V = (r, g, b) => new THREE.Vector3(r / 255, g / 255, b / 255)
      /* 25 Sep, later (Bazil: "the world looks ugly make it look super premium"): the same reading of the map, finished
         properly. Coasts are anti-aliased with fwidth instead of a hard cut; the sea has depth (the map's own blue
         lifts the shelves) and a gloss highlight; the land keeps its relief and is embossed by the map's own gradient
         under the light; a fine graticule sits on the sea at a whisper; the limb darkens and a thin cool rim closes it. */
      const globe = new THREE.Mesh(
        new THREE.SphereGeometry(1, 128, 96),
        day ? new THREE.ShaderMaterial({
          uniforms: { map: { value: day }, deep: { value: V(16, 24, 42) }, shelf: { value: V(34, 46, 72) }, land0: { value: V(196, 204, 216) }, land1: { value: V(240, 243, 247) }, rimc: { value: V(120, 140, 170) }, sun: { value: new THREE.Vector3(-0.5, 0.55, 0.67).normalize() }, texel: { value: 1 / 2048 } },
          vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
          fragmentShader: 'uniform sampler2D map; uniform vec3 deep, shelf, land0, land1, rimc, sun; uniform float texel; varying vec2 vUv; varying vec3 vN; varying vec3 vV;' +
            ' float lumAt(vec2 uv){ vec3 c = pow(texture2D(map, uv).rgb, vec3(1.0 / 2.2)); return dot(c, vec3(0.3, 0.59, 0.11)); }' +
            ' void main(){ vec3 t = pow(texture2D(map, vUv).rgb, vec3(1.0 / 2.2)); float lum = dot(t, vec3(0.3, 0.59, 0.11));' +
            ' float blue = t.b - max(t.r, t.g); float w = fwidth(blue) * 1.2 + 0.006; float isSea = smoothstep(0.075 - w, 0.075 + w, blue);' +
            ' vec3 n = normalize(vN); vec3 v = normalize(vV);' +
            /* the land: paper by relief, embossed by the map's gradient under the light (a texel step north-west) */
            ' float emb = lumAt(vUv + vec2(-texel * 1.5, texel * 1.5)) - lum;' +
            ' vec3 land = mix(land0, land1, smoothstep(0.22, 0.82, lum)) * (1.0 + emb * 1.6);' +
            /* the sea: deep ink, the shelves a step lighter, a fine graticule every 15 degrees */
            ' float depth = smoothstep(0.12, 0.42, t.b); vec3 sea = mix(deep, shelf, depth);' +
            ' vec2 g = abs(fract(vUv * vec2(24.0, 12.0) + 0.5) - 0.5); float gl = 1.0 - smoothstep(0.0, 0.035, min(g.x, g.y)); sea += gl * 0.022;' +
            ' vec3 col = mix(land, sea, isSea);' +
            /* light: a soft terminator, a gloss on the sea, the limb darkened and closed with a cool rim */
            ' float li = 0.7 + 0.3 * max(0.0, dot(n, sun)); float spec = pow(max(0.0, dot(reflect(-sun, n), v)), 48.0) * 0.28 * isSea;' +
            ' float rim = pow(1.0 - max(0.0, dot(n, v)), 2.4); col = col * li * (1.0 - 0.34 * rim) + spec + rimc * pow(rim, 6.0) * 0.35;' +
            ' gl_FragColor = vec4(col, 1.0); }',
        }) : new THREE.MeshPhongMaterial({ color: 0x101a2e }))
      world.add(globe)
      let cloudShell = null   /* the cloud shell is gone with the atmosphere; the name stays for the turn loop below */

      /* the offices: a red point and a breathing ring; the routes out of HQ with a travelling point */
      const red = new THREE.MeshBasicMaterial({ color: 0xEC2027 })
      const ringGeo = new THREE.RingGeometry(0.02, 0.027, 40)
      const rings = OFFICES.map(([la, lo], i) => {
        const [x, y, z] = ll(la, lo, 1.008)
        const pin = new THREE.Mesh(new THREE.SphereGeometry(i === 0 ? 0.024 : 0.017, 16, 12), red)
        pin.position.set(x, y, z); world.add(pin)
        const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xEC2027, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }))
        ring.position.set(x * 1.004, y * 1.004, z * 1.004)
        ring.lookAt(new THREE.Vector3(x * 3, y * 3, z * 3)); world.add(ring)
        return ring
      })
      const hq = new THREE.Vector3(...ll(OFFICES[0][0], OFFICES[0][1], 1.008))
      const arcs = OFFICES.slice(1).map(([la, lo]) => {
        const b = new THREE.Vector3(...ll(la, lo, 1.008))
        const om = hq.angleTo(b), so = Math.sin(om) || 1, pts = []
        for (let k = 0; k <= 72; k++) {
          const t = k / 72
          const p = hq.clone().multiplyScalar(Math.sin((1 - t) * om) / so).add(b.clone().multiplyScalar(Math.sin(t * om) / so))
          p.multiplyScalar(1 + 0.16 * Math.sin(Math.PI * t) * Math.min(1, om / 1.2))
          pts.push(p)
        }
        world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xEC2027, transparent: true, opacity: 0.55 })))
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.011, 10, 8), red)
        world.add(dot)
        return { pts, dot }
      })

      let raf = 0, live = false, dragging = false, lastX = 0, lastY = 0, vel = 0, W = 1, H = 1, swing = 0
      const t0 = performance.now()
      const size = () => {
        const r = box.getBoundingClientRect()
        W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height))
        renderer.setSize(W, H, false)
        cam.aspect = W / H; cam.updateProjectionMatrix()
      }
      const frame = now => {
        const tm = (now - t0) / 1000
        /* 25 Sep, 05:45 (Bazil: "improve the world view"): the globe no longer rolls away to the Atlantic. At rest it
           breathes around the pose that faces Malaysia (rotation.y 2.6, set above): a slow swing of 0.32 rad either
           side, and after a drag it eases back to that swing instead of drifting on. */
        if (!dragging) { swing += 0.0028; const want = 2.6 + Math.sin(swing) * 0.32; world.rotation.y += (want - world.rotation.y) * 0.015 + vel; vel *= 0.94 }
        if (cloudShell) cloudShell.rotation.y += 0.00045
        rings.forEach((r, i) => { const ph = ((tm / 2.4) + i * 0.19) % 1; const sc = 1 + ph * 3.4; r.scale.set(sc, sc, sc); r.material.opacity = (1 - ph) * 0.75 })
        arcs.forEach((a, i) => { const ph = ((tm * 0.13) + i * 0.14) % 1; a.dot.position.copy(a.pts[Math.round(ph * 72)]) })
        renderer.render(scene, cam)
      }
      const loop = now => { if (!live) return; frame(now); raf = requestAnimationFrame(loop) }
      size(); frame(performance.now()); box.classList.add('is-on')
      const io = new IntersectionObserver(([e]) => {
        live = e.isIntersecting && !reduce
        cancelAnimationFrame(raf)
        if (live) raf = requestAnimationFrame(loop)
      }, { threshold: 0.05 })
      io.observe(box)
      const ro = new ResizeObserver(() => { size(); if (!live) frame(performance.now()) })
      ro.observe(box)
      const cv = renderer.domElement
      const down = e => { dragging = true; lastX = e.clientX; lastY = e.clientY; vel = 0; cv.setPointerCapture && cv.setPointerCapture(e.pointerId) }
      const move = e => {
        if (!dragging) return
        const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY
        world.rotation.y += dx * 0.006; vel = dx * 0.0011
        world.rotation.x = Math.max(-0.5, Math.min(0.5, world.rotation.x + dy * 0.003))
        if (!live) frame(performance.now())
      }
      const up = () => { dragging = false }
      cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move)
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('pointerleave', up)
      dispose = () => {
        live = false; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect()
        cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move)
        cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up); cv.removeEventListener('pointerleave', up)
        renderer.dispose(); if (cv.parentNode) cv.parentNode.removeChild(cv)
      }
    })()
    return () => { alive = false; dispose() }
  }, [])
  return <div ref={host} className="cc-globe-host" role="img" aria-label="The Earth, with IAQ's offices marked and its headquarters in Shah Alam" />
}

/* ---- the certificates (25 Sep, Bazil: "show 3 at once in a better way"): three columns, each certificate as issued
   with its name, what it covers, its number and dates, and the way to the PDF. The one-at-a-time viewer with the
   seven-second turn is gone; nothing is a press away any more. ---- */
function CertViewer () {
  return (
    <div className="cc-cv cc-cv3" data-cc>
      {CERTS.map((x, i) => (
        <article className="cc-c3" key={x.name}>
          <h3 className="cc-cv-h">{x.name}</h3>
          <span className="cc-cert-k">{x.k}</span>
          <a className="cc-c3-doc" href={x.file} target="_blank" rel="noopener" title="Open the certificate (PDF)">
            <img src={x.img} alt={`${x.name} certificate, first page`} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
          </a>
          <p>{x.t}</p>
          <dl className="cc-cv-facts">
            <div><dt>Certificate</dt><dd>{x.no}</dd></div>
            <div><dt>Certified since</dt><dd>{x.since}</dd></div>
            <div><dt>Valid until</dt><dd>{x.valid}</dd></div>
          </dl>
          {/* 25 Sep (Bazil: "no need to have download button"): one way in, the certificate itself */}
          <div className="cc-cv-a">
            <a className="cta" href={x.file} target="_blank" rel="noopener">View the certificate</a>
          </div>
        </article>
      ))}
      <p className="cc-c3-note">All three are issued by Intertek under UKAS accreditation. Scope: {SCOPE.charAt(0).toLowerCase() + SCOPE.slice(1)}.</p>
    </div>
  )
}

/* ---- count-up for the metric numbers, once, when the grid is seen ---- */
function useCountUp (ref) {
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const els = Array.from(root.querySelectorAll('[data-n]'))
    const fmt = n => Math.round(n).toLocaleString('en-US')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { els.forEach(el => { el.textContent = fmt(+el.dataset.n) }); return }
    let done = false
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done) return
      done = true; io.disconnect()
      const t0 = performance.now(), D = 1700
      const tick = now => {
        const p = Math.min(1, (now - t0) / D), k = 1 - Math.pow(1 - p, 3)
        els.forEach(el => { el.textContent = fmt(+el.dataset.n * k) })
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.3 })
    io.observe(root)
    return () => io.disconnect()
  }, [ref])
}

/* ---- reveal: [data-cc] blocks rise once as they enter, staggered within their parent; the pillar
   tiles also carry .live while on screen so their marks only move when seen ---- */
function useReveal (ref) {
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const els = Array.from(root.querySelectorAll('[data-cc]'))
    els.forEach(el => {
      const sib = Array.from(el.parentElement.children).filter(x => x.hasAttribute('data-cc'))
      el.style.setProperty('--d', `${Math.min(sib.indexOf(el), 5) * 0.09}s`)
    })
    root.classList.add('cc-armed')
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    els.forEach(el => io.observe(el))
    const tiles = Array.from(root.querySelectorAll('.cc-tile'))
    const io2 = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('live', e.isIntersecting)), { threshold: 0.35 })
    tiles.forEach(t => io2.observe(t))
    return () => { io.disconnect(); io2.disconnect() }
  }, [ref])
}

function NewsCard ({ slug }) {
  const n = bySlug(slug)
  if (!n) return null
  return (
    <Link className="cc-card" to={`/news/${n.slug}`} data-cc>
      <span className="cc-card-ph"><img src={n.img} alt={n.imgAlt || ''} loading="lazy" decoding="async" /></span>
      <span className="cc-card-m">
        <span className="cc-card-k">{n.tag} <i aria-hidden="true">&middot;</i> {longDate(n.date)}</span>
        <span className="cc-card-t">{n.title}</span>
      </span>
    </Link>
  )
}

export default function Commitment () {
  const page = useRef(null)
  const metrics = useRef(null)
  useReveal(page)
  useCountUp(metrics)
  useEffect(() => {
    document.title = 'IAQ Group · Corporate Commitment · Brand Method'
  }, [])

  return (
    <>
      <Nav />

      <PageHead crumbs={[{ label: 'About', to: '/about' }]}
        title={<>Corporate <em>Commitment</em></>}
        lede="Certified to ISO 9001, ISO 14001 and ISO 45001 and registered CIDB G7. The certificates, the policies and the safety record are published here in full."
        figure={{ src: '/assets/iaq/site-aerial-build.webp', alt: 'Aerial view of an IAQ facility under construction', hero: true }}
      />

      <div className="cc" ref={page}>

        {/* 1 · sustainability and responsibility */}
        <section className="cc-sec" id="commitment">
          <div className="cc-in">
            <h2 className="cc-h2" data-cc>Sustainability and responsibility, <em>our commitment.</em></h2>
            <div className="cc-pillars">
              <div className="cc-globe" data-cc><EarthGlobe /></div>
              <div className="cc-tiles">
                {/* 25 Sep (Bazil: "bro just create icon for each", "its too tall"): the drawn sheets (CommitMarks.jsx, kept)
                    gave way to one isometric mark per pillar, the set the About cards use */}
                {PILLARS.map(({ k, t, iso }) => (
                  <div className="cc-tile" key={k} data-cc>
                    <span className="cc-tile-mk" aria-hidden="true">{(() => { const M = LINE_MARKS[iso]; return <M /> })()}</span>
                    <h3>{k}</h3>
                    <p>{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2 · environment and sustainability responsibility */}
        <section className="cc-sec tint" id="environment">
          <div className="cc-in">
            <h2 className="cc-h2" data-cc>Environment and sustainability <em>responsibility.</em></h2>
            <p className="cc-lede" data-cc>IAQ is dedicated to minimising its environmental impact through sustainable design, procurement and construction practices. It continuously seeks energy-efficient solutions and prioritises eco-friendly technologies.</p>
            <div className="cc-news">
              {CSR.map(s => <NewsCard slug={s} key={s} />)}
            </div>
          </div>
        </section>

        {/* 3 · quality, environment, health and safety, with both policies attached as PDFs */}
        <section className="cc-sec" id="qehs">
          <div className="cc-in">
            <h2 className="cc-h2" data-cc>Quality, environment, health <em>and safety.</em></h2>
            <div className="cc-split">
              <div className="cc-copy" data-cc>
                <p>The IAQ Group is committed to environment, safety and health as a core business function, promoting safe and healthy working conditions without risk of harm to its employees or others affected by its undertakings, and without harm to assets or the environment.</p>
                <p>IAQ has established the highest levels of EHS standards and applies proactive EHS management through responsible planning and implementation. Every incident is preventable, and no task is so important that it is worth endangering the health and well-being of employees and partners.</p>
              </div>
              <div className="cc-policies">
                {POLICIES.map(p => (
                  <div className="cc-pol" key={p.k} data-cc>
                    <a className="cc-pol-ph" href={p.file} target="_blank" rel="noopener">
                      <img src={p.img} alt={`${p.k}, signed 15 November 2024, first page`} loading="lazy" decoding="async" />
                    </a>
                    <div className="cc-pol-m">
                      <h3>{p.k}</h3>
                      <p>{p.t}</p>
                      <span className="cc-pol-s">Signed by the Chief Executive Officer, 15 November 2024</span>
                      <div className="cc-pol-a">
                        <a href={p.file} target="_blank" rel="noopener">Open the policy (PDF)</a>
                        <a href={p.file} download>Download</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4 · the three certificates, one viewer */}
        <section className="cc-sec tint" id="certificates">
          <div className="cc-in">
            <h2 className="cc-h2" data-cc>Certified to <em>three ISO standards.</em></h2>
            <p className="cc-lede" data-cc>Each certificate is issued by Intertek under UKAS accreditation and is shown here as issued.</p>
            <CertViewer />
          </div>
        </section>

        {/* 25 Sep (Bazil: "remove this part", "remove this section", "put this one in the footer instead"): the EHS metrics
            and the QEHS events are off the page; the registrations and recognitions sit in the site footer. Backup in
            src/_backups/commitment-0925b */}
      </div>

      <ClosingBand />
    </>
  )
}
