/* ============================================================================
   ao-pass.js · contact shading for our own three.js scenes (26 Sep 2026)

   The same pass as the home build's public/3d/iaq-look.js, as a module: the scene renders into a 4x multisampled
   half-float target with a depth texture; ambient occlusion is read from that depth at half resolution (each sample
   counts once and only inside a radius that grows with distance, so a panel joint stays a joint, never a black
   line); a blur that averages exactly one period of the 4x4 sampling tile; a depth-aware upsample; then the
   renderer's own tone mapping and colour space. The canvas's transparency is kept: the background stays clear.

   const ao = createAOPass(renderer)
   if (ao.active()) ao.begin()      // the next render goes into the pass's target
   renderer.render(scene, camera)
   if (ao.active()) ao.end(camera)  // shaded result onto the canvas; further renders can draw over it
   Phones and touch screens keep the direct render. window.__aoTune = { uK, uIntensity, uBias, uStrength, uDebug }.
   ============================================================================ */
import * as THREE from 'three'
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'

const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }'
const COMMON = [
  'uniform sampler2D tDepth; uniform mat4 uInvProj;',
  'vec3 viewPos(vec2 uv){ float d = texture2D(tDepth, uv).x; vec4 v = uInvProj * vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); return v.xyz / v.w; }'
].join('\n')

export function createAOPass(renderer, opts = {}) {
  const coarse = matchMedia('(max-width: 899px), (hover: none) and (pointer: coarse)')
  const size = new THREE.Vector2()
  let S = null
  function init() {
    const rt = new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType, depthTexture: new THREE.DepthTexture(1, 1, THREE.FloatType), depthBuffer: true, stencilBuffer: false })
    const half = { type: THREE.HalfFloatType, depthBuffer: false, stencilBuffer: false, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, generateMipmaps: false }
    const ao = new THREE.WebGLRenderTarget(1, 1, half), ao2 = new THREE.WebGLRenderTarget(1, 1, half)
    const aoMat = new THREE.ShaderMaterial({
      uniforms: { tDepth: { value: null }, uInvProj: { value: new THREE.Matrix4() }, uProjY: { value: 1 }, uRes: { value: new THREE.Vector2() }, uK: { value: opts.k ?? 0.03 }, uIntensity: { value: opts.intensity ?? 1.25 }, uBias: { value: 0.12 } },
      vertexShader: VS,
      fragmentShader: [
        'precision highp float;', COMMON,
        'uniform float uProjY; uniform vec2 uRes; uniform float uK; uniform float uIntensity; uniform float uBias; varying vec2 vUv;',
        'void main(){',
        '  float d = texture2D(tDepth, vUv).x;',
        '  if (d >= 0.99999) { gl_FragColor = vec4(1.0, 1e5, 0.0, 1.0); return; }',
        '  vec3 C = viewPos(vUv); vec2 px = 1.0 / uRes;',
        '  vec3 pr = viewPos(vUv + vec2(px.x, 0.0)) - C, pl = C - viewPos(vUv - vec2(px.x, 0.0));',
        '  vec3 pu = viewPos(vUv + vec2(0.0, px.y)) - C, pd = C - viewPos(vUv - vec2(0.0, px.y));',
        '  vec3 dx = abs(pr.z) < abs(pl.z) ? pr : pl, dy = abs(pu.z) < abs(pd.z) ? pu : pd;',
        '  vec3 N = normalize(cross(dx, dy));',
        '  float z = -C.z, R = uK * z, R2 = R * R;',
        '  float ssR = clamp(R * uProjY * 0.5 * uRes.y / z, 2.0, 64.0);',
        '  vec2 f = mod(floor(gl_FragCoord.xy), 4.0); float b = f.x + 4.0 * f.y;',
        '  float rot = b * 0.39269908, jit = fract(b * 0.61803399);',
        '  float occ = 0.0; const int NS = 12;',
        '  for (int i = 0; i < NS; i++) {',
        '    float t = (float(i) + jit) / float(NS); float a = float(i) * 2.39996323 + rot;',
        '    vec2 uv2 = vUv + vec2(cos(a), sin(a)) * (t * ssR) * px;',
        '    if (uv2.x < 0.0 || uv2.y < 0.0 || uv2.x > 1.0 || uv2.y > 1.0) continue;',
        '    if (texture2D(tDepth, uv2).x >= 0.99999) continue;',
        '    vec3 v = viewPos(uv2) - C; float vv = dot(v, v);',
        '    float c = dot(v, N) * inversesqrt(vv + 1e-6);',
        '    occ += max(0.0, c - uBias) * max(0.0, 1.0 - vv / R2);',
        '  }',
        '  gl_FragColor = vec4(clamp(1.0 - uIntensity * occ / float(NS), 0.0, 1.0), z, 0.0, 1.0);',
        '}'
      ].join('\n'),
      depthTest: false, depthWrite: false
    })
    const blurMat = new THREE.ShaderMaterial({
      uniforms: { tAO: { value: null }, uRes: { value: new THREE.Vector2() } },
      vertexShader: VS,
      fragmentShader: [
        'precision highp float;',
        'uniform sampler2D tAO; uniform vec2 uRes; varying vec2 vUv;',
        'void main(){',
        '  float zc = texture2D(tAO, vUv).g;',
        '  if (zc > 9e4) { gl_FragColor = vec4(1.0, zc, 0.0, 1.0); return; }',
        '  float k = 1.0 / (0.03 * zc + 0.05), sa = 0.0, sw = 0.0;',
        '  for (int y = -2; y <= 2; y++) for (int x = -2; x <= 2; x++) {',
        '    float fx = float(x), fy = float(y);',
        '    vec2 t = texture2D(tAO, vUv + vec2(fx, fy) / uRes).rg;',
        '    float w = (abs(fx) > 1.5 ? 0.5 : 1.0) * (abs(fy) > 1.5 ? 0.5 : 1.0) * exp(-abs(t.g - zc) * k);',
        '    sa += t.r * w; sw += w;',
        '  }',
        '  gl_FragColor = vec4(sa / sw, zc, 0.0, 1.0);',
        '}'
      ].join('\n'),
      depthTest: false, depthWrite: false
    })
    const compMat = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, tAO: { value: null }, tDepth: { value: null }, uInvProj: { value: new THREE.Matrix4() }, uAORes: { value: new THREE.Vector2() }, uStrength: { value: opts.strength ?? 0.85 }, uDebug: { value: 0 } },
      vertexShader: VS,
      fragmentShader: [
        'precision highp float;', COMMON,
        'uniform sampler2D tDiffuse; uniform sampler2D tAO; uniform vec2 uAORes; uniform float uStrength; uniform float uDebug; varying vec2 vUv;',
        'void main(){',
        '  vec4 col = texture2D(tDiffuse, vUv);',
        '  float d = texture2D(tDepth, vUv).x, ao = 1.0;',
        '  if (d < 0.99999) {',
        '    float zc = -viewPos(vUv).z;',
        '    vec2 hp = vUv * uAORes - 0.5, i0 = floor(hp), fr = hp - i0;',
        '    float sa = 0.0, sw = 0.0, kz = 1.0 / (0.01 * zc + 0.02);',
        '    for (int y = 0; y <= 1; y++) for (int x = 0; x <= 1; x++) {',
        '      vec2 o = vec2(float(x), float(y));',
        '      vec2 t = texture2D(tAO, (i0 + o + 0.5) / uAORes).rg;',
        '      vec2 bw = mix(1.0 - fr, fr, o);',
        '      float w = (bw.x * bw.y + 0.001) * exp(-abs(t.g - zc) * kz);',
        '      sa += t.r * w; sw += w;',
        '    }',
        '    ao = sw > 1e-4 ? sa / sw : 1.0;',
        '  }',
        '  if (uDebug > 0.5) { gl_FragColor = vec4(vec3(ao), 1.0); return; }',
        /* the target holds premultiplied colour over a clear background; shade it, then the renderer's curve and space */
        '  gl_FragColor = vec4(col.rgb * mix(1.0, ao, uStrength), col.a);',
        '  #include <tonemapping_fragment>',
        '  #include <colorspace_fragment>',
        '}'
      ].join('\n'),
      depthTest: false, depthWrite: false, blending: THREE.NoBlending
    })
    return { rt, ao, ao2, aoQ: new FullScreenQuad(aoMat), blurQ: new FullScreenQuad(blurMat), compQ: new FullScreenQuad(compMat), aoMat, blurMat, compMat }
  }
  return {
    active() {
      if (window.__aoOff || /[?&]nolook\b/.test(location.search) || coarse.matches) return false
      if (!renderer.capabilities.isWebGL2) return false
      if (!S) { try { S = init() } catch (e) { console.warn('ao-pass off', e); window.__aoOff = true; return false } }
      return true
    },
    begin() {
      renderer.getDrawingBufferSize(size)
      const w = Math.max(1, Math.floor(size.x)), h = Math.max(1, Math.floor(size.y))
      if (S.rt.width !== w || S.rt.height !== h) {
        S.rt.setSize(w, h)
        const hw = Math.max(1, (w + 1) >> 1), hh = Math.max(1, (h + 1) >> 1)
        S.ao.setSize(hw, hh); S.ao2.setSize(hw, hh)
      }
      renderer.setRenderTarget(S.rt)
    },
    end(camera) {
      const a = S.aoMat.uniforms, bl = S.blurMat.uniforms, c = S.compMat.uniforms
      const D = window.__aoTune; if (D) { for (const k in D) { if (a[k]) a[k].value = D[k]; if (c[k]) c[k].value = D[k] } }
      a.tDepth.value = S.rt.depthTexture; a.uInvProj.value.copy(camera.projectionMatrixInverse); a.uProjY.value = camera.projectionMatrix.elements[5]; a.uRes.value.set(S.ao.width, S.ao.height)
      const ac = renderer.autoClear; renderer.autoClear = false
      renderer.setRenderTarget(S.ao); S.aoQ.render(renderer)
      bl.tAO.value = S.ao.texture; bl.uRes.value.set(S.ao.width, S.ao.height)
      renderer.setRenderTarget(S.ao2); S.blurQ.render(renderer)
      c.tDiffuse.value = S.rt.texture; c.tAO.value = S.ao2.texture; c.tDepth.value = S.rt.depthTexture; c.uInvProj.value.copy(camera.projectionMatrixInverse); c.uAORes.value.set(S.ao2.width, S.ao2.height)
      renderer.setRenderTarget(null); S.compQ.render(renderer)
      renderer.autoClear = ac
    },
    dispose() { if (!S) return; for (const k of ['rt', 'ao', 'ao2']) S[k].dispose(); for (const k of ['aoQ', 'blurQ', 'compQ']) S[k].dispose(); for (const k of ['aoMat', 'blurMat', 'compMat']) S[k].dispose(); S = null }
  }
}
