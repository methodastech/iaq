/* IAQ loading screen, three variations (26 Sep 2026). Bazil: "is the loading screen ok, put the loading screen in the design
   tab so we can check it out, put 3 variations". Each variation loops the loading: 0 to 100 in 2.4 s, the finished world
   held for 1.2 s, a short lift, then again. ?v=fill | hq | line | v4 picks one; ?pd=0.5 poses a frame; ?noloop holds at 100.
     v4    the chosen one (26 Sep): fill, with a lighter land grey and a white knockout under the mark
     fill  the live loader: the dotted globe fills from the bottom, IAQ red at the level, the logo fills red with it
     hq    the same globe grows outward from Shah Alam, IAQ's headquarters; a red front runs ahead of the dark dots
     line  a flat dotted world of square dots over one long IAQ red line; the line is the progress bar and the dots above
           it darken as it passes
   The globe is the same as scenes/home.js (seeded scatter over the 192 x 96 land mask, the same shaders); three.js 0.184
   from jsdelivr, the version the site uses. Internal: pruned from the launch build (tools/prune-launch.mjs). */
import * as T from 'https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.js'

const Q = new URLSearchParams(location.search)
const V = Q.get('v') || 'fill'
const POSE = Q.has('pd') ? Math.max(0, Math.min(1, +Q.get('pd'))) : null
const LOOP = !Q.has('noloop')
const LAND = window.IAQ_LAND.split('|'), GW = 192, GH = 96
const bit = (y, x) => (parseInt(LAND[y].charAt(x >> 2), 16) >> (3 - (x & 3))) & 1
const logo = document.getElementById('logo')
const stage = document.getElementById('stage')

/* the clock of one loop: progress 0..1 over 2.4 s with the loader's own ease, then the hold and the lift */
const RUN = 2400, HOLD = 1200, LIFT = 500, GAP = 300, CYCLE = RUN + HOLD + LIFT + GAP
const ease = t => 1 - Math.pow(1 - t, 2.2)
function clock (now) {
  if (POSE != null) return { pd: POSE, fade: 1 }
  const t = LOOP ? now % CYCLE : Math.min(now, RUN + HOLD)
  const pd = t < RUN ? ease(t / RUN) : 1
  const fade = t < RUN + HOLD ? 1 : t < RUN + HOLD + LIFT ? 1 - (t - RUN - HOLD) / LIFT : 0
  return { pd, fade }
}
function setLogo (pd) { logo.style.setProperty('--fill', (pd * 100).toFixed(1) + '%') }

/* ------------------------------------------------------------------ the globe: fill and hq */
function globe (mode) {
  const canvas = document.createElement('canvas'); stage.appendChild(canvas)
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setClearColor(0x000000, 0); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  T.ColorManagement.enabled = false
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(46, 1, 0.1, 60)
  const R = 1.58
  const ll = (lat, lon, r) => { const la = lat * Math.PI / 180, lo = lon * Math.PI / 180; return [r * Math.cos(la) * Math.cos(lo), r * Math.sin(la), -r * Math.cos(la) * Math.sin(lo)] }
  let rs = 0x2f6e2b1; const rnd = () => { rs ^= rs << 13; rs ^= rs >>> 17; rs ^= rs << 5; return (rs >>> 0) / 4294967296 }
  const HQ = ll(3.07, 101.52, 1)
  const P = [], S = [], H = [], D = [], SEA = [], SSZ = [], SD = []
  const NF = window.innerWidth < 700 ? 70000 : 96000
  for (let i = 0; i < NF; i++) {
    const u0 = rnd() * 2 - 1, th = rnd() * 6.2832, lat = Math.asin(u0) * 180 / Math.PI, lon = th * 180 / Math.PI - 180
    const jl = lat + (rnd() - 0.5) * 1.7, jo = lon + (rnd() - 0.5) * 1.7 / Math.max(0.25, Math.cos(lat * Math.PI / 180))
    const gy = Math.floor((90 - jl) / 180 * GH), gx = Math.floor((((jo + 180) % 360 + 360) % 360) / 360 * GW)
    const p = ll(lat, lon, 1), ang = Math.acos(Math.max(-1, Math.min(1, p[0] * HQ[0] + p[1] * HQ[1] + p[2] * HQ[2]))) / Math.PI
    if (gy < 1 || gy >= GH || gx < 1 || gx >= GW - 1 || !bit(gy, gx)) { if (rnd() < 0.085) { const q = ll(lat, lon, R * 0.998); SEA.push(...q); SSZ.push(0.55 + rnd() * 0.75); SD.push(ang) } continue }
    if (rnd() > 0.95) continue
    const q = ll(lat, lon, R * (1 + (rnd() - 0.5) * 0.004)); P.push(...q); S.push(0.55 + Math.pow(rnd(), 2.2) * 1.05); H.push(rnd()); D.push(ang)
  }
  const fillU = { value: 0 }, modeU = { value: mode === 'hq' ? 1 : 0 }
  /* v4 (Bazil: "the land grey is too dark or too strong"): the filled land a light slate, the far side and the sea lighter still */
  const SOFT = mode === 'v4'
  const LNEAR = SOFT ? 'vec3(0.55,0.59,0.66)' : 'vec3(0.21,0.24,0.29)', LFAR = SOFT ? 'vec3(0.74,0.77,0.82)' : 'vec3(0.62,0.67,0.76)', SEAF = SOFT ? 'vec3(0.72,0.76,0.84)' : 'vec3(0.58,0.64,0.78)'
  const common = 'uniform float uDpr; uniform float uS; uniform float uT; uniform float uFill; uniform float uR; uniform float uMode; attribute float aH; attribute float aS; attribute float aD; varying float vD; varying float vH; varying float vF; varying float vE;'
  /* vF: 1 where the dot is loaded. Fill: under a level rising in view space. HQ: within the angle the load has reached */
  const level = 'vec4 mv=modelViewMatrix*vec4(position,1.0); vec4 c=modelViewMatrix*vec4(0.0,0.0,0.0,1.0); vD=-mv.z+c.z+4.55; vH=aH;' +
    'float lv=(mv.y-c.y)/uR; float edge=uFill*2.3-1.15+0.03*sin(mv.x*3.0+uT*2.2);' +
    'float fF=smoothstep(edge+0.07,edge-0.07,lv); float reach=uFill*1.04; float fH=smoothstep(reach,reach-0.035,aD);' +
    'vF=mix(fF,fH,uMode); vE=uMode>0.5 ? smoothstep(reach-0.05,reach-0.01,aD)*step(aD,reach+0.004) : vF*(1.0-vF)*4.0;'
  const mat = new T.ShaderMaterial({
    transparent: true, depthTest: true, depthWrite: false,
    uniforms: { uDpr: { value: renderer.getPixelRatio() }, uS: { value: 1 }, uT: { value: 0 }, uFill: fillU, uR: { value: R }, uMode: modeU },
    vertexShader: common + 'void main(){ ' + level + ' gl_Position=projectionMatrix*mv; gl_PointSize=0.66*uDpr*uS*aS*mix(0.85,1.0,vF)*(15.0/max(0.5,-mv.z)); }',
    fragmentShader: 'precision mediump float; uniform highp float uT; uniform highp float uMode; varying float vD; varying float vH; varying float vF; varying float vE;' +
      'void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5)discard;' +
      ' float al=smoothstep(0.5,0.22,d); float f=clamp((vD-2.6)/3.2,0.0,1.0);' +
      ' vec3 full=mix(' + LNEAR + ',' + LFAR + ',f); vec3 col=mix(vec3(0.74,0.77,0.84),full,vF);' +
      ' col=mix(col,vec3(0.925,0.125,0.153),clamp(vE,0.0,1.0)*0.75);' +
      ' float tw=0.9+0.1*sin(uT*1.6+vH*6.2832);' +
      /* hq: the unloaded world is a faint ghost, so the growth from Shah Alam reads; fill: as live */
      ' float wait=mix(0.34,0.12,uMode);' +
      ' al*=mix(1.0,0.55,f)*tw*(0.6+0.4*vH)*mix(wait,1.0,max(vF,clamp(vE,0.0,1.0))); gl_FragColor=vec4(col,al); }'
  })
  const geo = new T.BufferGeometry()
  geo.setAttribute('position', new T.BufferAttribute(new Float32Array(P), 3))
  geo.setAttribute('aS', new T.BufferAttribute(new Float32Array(S), 1)); geo.setAttribute('aH', new T.BufferAttribute(new Float32Array(H), 1)); geo.setAttribute('aD', new T.BufferAttribute(new Float32Array(D), 1))
  const seaG = new T.BufferGeometry()
  seaG.setAttribute('position', new T.BufferAttribute(new Float32Array(SEA), 3)); seaG.setAttribute('aS', new T.BufferAttribute(new Float32Array(SSZ), 1))
  seaG.setAttribute('aH', new T.BufferAttribute(new Float32Array(SSZ.map(() => rnd())), 1)); seaG.setAttribute('aD', new T.BufferAttribute(new Float32Array(SD), 1))
  const seaM = new T.ShaderMaterial({
    transparent: true, depthTest: true, depthWrite: false, uniforms: mat.uniforms,
    vertexShader: common + 'void main(){ ' + level + ' gl_Position=projectionMatrix*mv; gl_PointSize=0.44*uDpr*uS*aS*(15.0/max(0.5,-mv.z)); }',
    fragmentShader: 'precision mediump float; uniform highp float uMode; varying float vH; varying float vF; varying float vD;' +
      'void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5)discard; float f=clamp((vD-2.6)/3.2,0.0,1.0);' +
      ' vec3 col=mix(vec3(0.84,0.86,0.91),' + SEAF + ',vF);' +
      ' float al=smoothstep(0.5,0.2,d)*(0.3+0.4*vH)*mix(mix(0.3,0.1,uMode),0.6,vF)*mix(1.0,0.6,f); gl_FragColor=vec4(col,al); }'
  })
  const g = new T.Group(); scene.add(g)
  const sea = new T.Points(seaG, seaM); sea.renderOrder = 1; g.add(sea)
  const dots = new T.Points(geo, mat); dots.renderOrder = 1; g.add(dots)
  /* the pose: fill keeps the live loader's north tilt and slow turn; hq turns Malaysia to face the camera */
  const HOME_X = 10 * Math.PI / 180, HOME_Y = -Math.PI / 2 - 100 * Math.PI / 180
  function resize () {
    const w = stage.clientWidth, h = stage.clientHeight
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix()
    camera.position.z = Math.max(4.55, 5.3 - Math.min(1, w / h - 1) * 0.55)
    if (w < h) camera.position.z = Math.max(camera.position.z, R * 0.9 / (Math.tan(23 * Math.PI / 180) * w / h))
    mat.uniforms.uS.value = Math.max(0.85, Math.min(1.5, h / 760)) * (w < h ? 1.35 : 1)
  }
  resize(); addEventListener('resize', resize)
  let t0 = performance.now()
  function frame (ts) {
    requestAnimationFrame(frame)
    const { pd, fade } = clock(performance.now() - t0)
    fillU.value = pd; mat.uniforms.uT.value = ts / 1000; setLogo(pd)
    /* hq: Shah Alam starts clear of the logo, low and to the right, and turns in toward the centre as the world fills */
    if (mode === 'hq') { g.rotation.x = HOME_X + 0.05 + pd * 0.2; g.rotation.y = HOME_Y - 0.62 + pd * 0.5 + ts * 0.00002 }
    else { g.rotation.x = HOME_X + 0.45; g.rotation.y = HOME_Y - 0.9 + pd * 0.9 + ts * 0.00002 }
    stage.style.opacity = fade; logo.style.opacity = fade
    renderer.render(scene, camera)
  }
  requestAnimationFrame(frame)
}

/* ------------------------------------------------------------------ the flat world over the IAQ line */
function flat () {
  const cv = document.createElement('canvas'); stage.appendChild(cv)
  const ctx = cv.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2)
  let W = 0, H = 0, cells = [], mapX = 0, mapW = 0, mapY = 0, mapH = 0, step = 6, sz = 3.4, lineY = 0
  function build () {
    W = stage.clientWidth; H = stage.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    /* the map is 2:1 (equirectangular), trimmed to 75N to 58S so the page is not mostly ocean and ice */
    const top = 75, bot = -58, span = top - bot
    mapW = Math.min(W * 0.84, (H * 0.62) * 360 / span); mapH = mapW * span / 360
    mapX = (W - mapW) / 2; mapY = H * 0.5 - mapH * 0.42
    step = Math.max(4.2, mapW / 150); sz = step * 0.62
    cells = []
    for (let y = mapY; y < mapY + mapH; y += step) {
      const lat = top - (y - mapY) / mapH * span, gy = Math.floor((90 - lat) / 180 * GH)
      for (let x = mapX; x < mapX + mapW; x += step) {
        const lon = (x - mapX) / mapW * 360 - 180, gx = Math.floor((lon + 180) / 360 * GW)
        if (gy >= 1 && gy < GH && gx >= 1 && gx < GW - 1 && bit(gy, gx)) cells.push(x, y)   /* the mask's edge rows and columns are padding */
      }
    }
    lineY = mapY + mapH + step * 3.2
  }
  build(); addEventListener('resize', build)
  let t0 = performance.now()
  function frame () {
    requestAnimationFrame(frame)
    const { pd, fade } = clock(performance.now() - t0)
    setLogo(pd); logo.style.opacity = fade
    ctx.clearRect(0, 0, W, H); ctx.globalAlpha = fade
    const xp = mapX + mapW * pd
    for (let i = 0; i < cells.length; i += 2) {
      const x = cells[i], y = cells[i + 1]
      const near = xp - x
      /* passed: IAQ ink; the front column: IAQ red; still to come: pale */
      ctx.fillStyle = near > step * 1.5 ? '#2B3240' : near > -step * 0.5 ? '#EC2326' : '#DCE1E8'
      ctx.fillRect(x, y, sz, sz)
    }
    /* the IAQ line: one long red line that is the progress bar, drawn whole in pale under it */
    ctx.fillStyle = '#E6E9EE'; ctx.fillRect(mapX, lineY, mapW, 2)
    ctx.fillStyle = '#EC2326'; ctx.fillRect(mapX, lineY, mapW * pd, 2)
    ctx.globalAlpha = 1
  }
  requestAnimationFrame(frame)
}

document.documentElement.dataset.v = V
if (V === 'line') flat(); else globe(V)
