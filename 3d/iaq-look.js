/* IAQ look (25 Sep 2026): a render pass that brings the build view closer to IAQ's own perspective renders.
   The build view rendered straight to the screen with one flat tone curve and no
   contact shading, so parts read as cut-outs. This pass runs on the build view only (the walkthrough keeps the app's
   own edge-and-haze pass):
     1. the scene renders into a 4x multisampled half-float target (smooth edges, room for highlights);
     2. ambient occlusion at half resolution, read from the depth buffer: corners, joints, the undersides of slabs and
        the ground under the building darken the way they do in a render. Each sample counts at most once and only
        inside the radius, so a small groove in a facade panel stays a groove instead of turning into a black line;
        the radius scales with distance, so a far view and a close one get the same look;
     3. a blur at half resolution that averages exactly one period of the 4x4 sampling pattern (no mottling), and
        only across similar depth (no halos);
     4. a composite: a depth-aware upsample of the occlusion, then a filmic curve (ACES fitted) with a touch of contrast.
        The sky and the background are passed through untouched, so the painted sky and V1's dark ground stay as set.
   Wired by two small patches in assets/main-*.js (window.__iaqTHREE and __iaqRenderer; DL() calls begin/end).
   Off with ?nolook, or window.__iaqLookOff = true. Phones and touch screens keep the direct render.
   window.__iaqLookTune = { uK, uIntensity, uBias, uStrength, uExposure, uDebug } overrides the uniforms live. */
(function () {
  var S = null
  function init (r) {
    var T = window.__iaqTHREE && window.__iaqTHREE(); if (!T) return null
    var dt = new T.ho(1, 1, T.ci)
    var rt = new T.Ri(1, 1, { samples: 4, type: T.nr, depthTexture: dt, depthBuffer: true, stencilBuffer: false, minFilter: T.cn, magFilter: T.cn, generateMipmaps: false })
    var half = { type: T.nr, depthBuffer: false, stencilBuffer: false, minFilter: T.Sn, magFilter: T.Sn, generateMipmaps: false }
    var ao = new T.Ri(1, 1, half), ao2 = new T.Ri(1, 1, half)
    var VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }'
    var common = [
      'uniform sampler2D tDepth; uniform mat4 uInvProj;',
      'vec3 viewPos(vec2 uv){ float d = texture2D(tDepth, uv).x; vec4 v = uInvProj * vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); return v.xyz / v.w; }'
    ].join('\n')
    var aoMat = new T.us({
      uniforms: { tDepth: { value: null }, uInvProj: { value: new T.Nt() }, uProjY: { value: 1 }, uRes: { value: new T.yt() }, uK: { value: 0.03 }, uIntensity: { value: 1.25 }, uBias: { value: 0.12 } },
      vertexShader: VS,
      fragmentShader: [
        'precision highp float;', common,
        'uniform float uProjY; uniform vec2 uRes; uniform float uK; uniform float uIntensity; uniform float uBias; varying vec2 vUv;',
        'void main(){',
        '  float d = texture2D(tDepth, vUv).x;',
        '  if (d >= 0.99999) { gl_FragColor = vec4(1.0, 1e5, 0.0, 1.0); return; }',
        '  vec3 C = viewPos(vUv); vec2 px = 1.0 / uRes;',
        /* the normal from the flatter side in each direction, so an edge does not bend it */
        '  vec3 pr = viewPos(vUv + vec2(px.x, 0.0)) - C, pl = C - viewPos(vUv - vec2(px.x, 0.0));',
        '  vec3 pu = viewPos(vUv + vec2(0.0, px.y)) - C, pd = C - viewPos(vUv - vec2(0.0, px.y));',
        '  vec3 dx = abs(pr.z) < abs(pl.z) ? pr : pl, dy = abs(pu.z) < abs(pd.z) ? pu : pd;',
        '  vec3 N = normalize(cross(dx, dy));',
        '  float z = -C.z, R = uK * z, R2 = R * R;',
        '  float ssR = clamp(R * uProjY * 0.5 * uRes.y / z, 2.0, 64.0);',   /* the radius in half-res pixels */
        /* one of 16 rotations per pixel in a 4x4 tile; the blur averages the whole tile */
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
        '  float ao = clamp(1.0 - uIntensity * occ / float(NS), 0.0, 1.0);',
        '  gl_FragColor = vec4(ao, z, 0.0, 1.0);',
        '}'
      ].join('\n'),
      depthTest: false, depthWrite: false
    })
    var blurMat = new T.us({
      uniforms: { tAO: { value: null }, uRes: { value: new T.yt() } },
      vertexShader: VS,
      fragmentShader: [
        'precision highp float;',
        'uniform sampler2D tAO; uniform vec2 uRes; varying vec2 vUv;',
        'void main(){',
        '  vec2 c0 = texture2D(tAO, vUv).rg; float zc = c0.g;',
        '  if (zc > 9e4) { gl_FragColor = vec4(1.0, zc, 0.0, 1.0); return; }',
        '  float k = 1.0 / (0.03 * zc + 0.05), sa = 0.0, sw = 0.0;',
        /* 5x5 with half weight on the outer ring: exactly one 4-texel period in each direction, centred */
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
    var compMat = new T.us({
      uniforms: { tDiffuse: { value: null }, tAO: { value: null }, tDepth: { value: null }, uInvProj: { value: new T.Nt() }, uAORes: { value: new T.yt() }, uStrength: { value: 0.9 }, uExposure: { value: 0.8 }, uDebug: { value: 0 } },
      vertexShader: VS,
      fragmentShader: [
        'precision highp float;', common,
        'uniform sampler2D tDiffuse; uniform sampler2D tAO; uniform vec2 uAORes; uniform float uStrength; uniform float uExposure; uniform float uDebug; varying vec2 vUv;',
        /* ACES fitted (Stephen Hill) */
        'vec3 RRTODT(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; }',
        'vec3 aces(vec3 c){',
        '  const mat3 I = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));',
        '  const mat3 O = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602));',
        '  c *= uExposure / 0.6; c = I * c; c = RRTODT(c); c = O * c; return clamp(c, 0.0, 1.0);',
        '}',
        'void main(){',
        '  vec4 col = texture2D(tDiffuse, vUv);',
        '  float d = texture2D(tDepth, vUv).x;',
        '  if (d >= 0.99999) { gl_FragColor = vec4(col.rgb, 1.0);',
        '    #include <colorspace_fragment>',
        '    return; }',
        /* depth-aware upsample: the four nearest half-res texels, weighted by position and by depth likeness */
        '  float zc = -viewPos(vUv).z;',
        '  vec2 hp = vUv * uAORes - 0.5, i0 = floor(hp), fr = hp - i0;',
        '  float sa = 0.0, sw = 0.0, kz = 1.0 / (0.01 * zc + 0.02);',
        '  for (int y = 0; y <= 1; y++) for (int x = 0; x <= 1; x++) {',
        '    vec2 o = vec2(float(x), float(y));',
        '    vec2 t = texture2D(tAO, (i0 + o + 0.5) / uAORes).rg;',
        '    vec2 bw = mix(1.0 - fr, fr, o);',
        '    float w = (bw.x * bw.y + 0.001) * exp(-abs(t.g - zc) * kz);',
        '    sa += t.r * w; sw += w;',
        '  }',
        '  float ao = sw > 1e-4 ? sa / sw : 1.0;',
        '  if (uDebug > 0.5) { gl_FragColor = vec4(vec3(ao), 1.0); return; }',
        '  vec3 c = col.rgb * mix(1.0, ao, uStrength);',
        '  c = aces(c);',
        '  float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); c = clamp(mix(vec3(l), c, 1.06), 0.0, 1.0);',
        '  gl_FragColor = vec4(c, 1.0);',
        '  #include <colorspace_fragment>',
        '}'
      ].join('\n'),
      depthTest: false, depthWrite: false, toneMapped: false
    })
    return { T: T, rt: rt, ao: ao, ao2: ao2, aoQ: new T.m3(aoMat), blurQ: new T.m3(blurMat), compQ: new T.m3(compMat), aoMat: aoMat, blurMat: blurMat, compMat: compMat, size: new T.yt() }
  }
  /* a live query: the frame can be hidden or narrow on its first frames, so the answer is read every frame */
  var coarse = null
  window.__iaqLook = {
    active: function (r) {
      if (window.__iaqLookOff || /[?&]nolook\b/.test(location.search)) return false
      if (!r || !r.capabilities || !r.capabilities.isWebGL2) return false
      if (!coarse) coarse = matchMedia('(max-width: 899px), (hover: none) and (pointer: coarse)')
      if (coarse.matches) return false
      if (!S) { try { S = init(r) } catch (e) { console.warn('iaq-look off', e); window.__iaqLookOff = true; return false } }
      return !!S
    },
    begin: function (r) {
      r.getDrawingBufferSize(S.size)
      var w = Math.max(1, Math.floor(S.size.x)), h = Math.max(1, Math.floor(S.size.y))
      if (S.rt.width !== w || S.rt.height !== h) {
        S.rt.setSize(w, h)
        var hw = Math.max(1, (w + 1) >> 1), hh = Math.max(1, (h + 1) >> 1)
        S.ao.setSize(hw, hh); S.ao2.setSize(hw, hh)
      }
      r.setRenderTarget(S.rt)
    },
    end: function (r, cam) {
      window.__iaqCam = cam
      var a = S.aoMat.uniforms, bl = S.blurMat.uniforms, c = S.compMat.uniforms
      var D = window.__iaqLookTune; if (D) { for (var k in D) { if (a[k]) a[k].value = D[k]; if (c[k]) c[k].value = D[k] } }
      a.tDepth.value = S.rt.depthTexture; a.uInvProj.value.copy(cam.projectionMatrixInverse); a.uProjY.value = cam.projectionMatrix.elements[5]; a.uRes.value.set(S.ao.width, S.ao.height)
      r.setRenderTarget(S.ao); S.aoQ.render(r)
      bl.tAO.value = S.ao.texture; bl.uRes.value.set(S.ao.width, S.ao.height)
      r.setRenderTarget(S.ao2); S.blurQ.render(r)
      c.tDiffuse.value = S.rt.texture; c.tAO.value = S.ao2.texture; c.tDepth.value = S.rt.depthTexture; c.uInvProj.value.copy(cam.projectionMatrixInverse); c.uAORes.value.set(S.ao2.width, S.ao2.height)
      r.setRenderTarget(null); S.compQ.render(r)
    }
  }
})()
