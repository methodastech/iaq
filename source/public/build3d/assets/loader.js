/*
 * The loading screen's globe (IAQ design system, Motion, Loading screen: "The globe fills, refined", approved
 * 26 Sep and live on the website). The dotted world on white: a level rises through the globe with the load,
 * light slate dots under it, pale dots waiting above, IAQ red at the level, and the IAQ mark fills red with it
 * over a white knockout the shape of its letters. Raw WebGL, no library, because this runs in the page itself
 * before the 3D bundle has arrived; the scatter, the shaders and the pose are the design system's own.
 * The progress is the real one (--lp on #overlay, main.ts).
 *
 * This file is the source; scripts/build-loader.mjs writes it into index.html with the land mask.
 */
(function () {
  var LAND = 'ffffffffffffffffffffffffffffffffffffffffffffffff|000000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000001|8000000000000000003f8000000000000000000000000001|800000000000ffc1fffff000000000000000000000000001|8000000000001f1ffffff800009000000000000000000001|0000000040007c1ffffffc00000000000000070000000001|80000000090198003ffffc00000000008007fff0007c0001|80000003e00000003ffff800000000040ffffffff87f8001|800e000037067f8007ffd0000000000c1ffffffffffffc01|80ffffff3fcb19f017ffc000007fc007ffffffffffffffff|e0fffffff7dff0780ffc000001fffdffffffffffffffffff|98fffffffffff0780fc00f0003ffffffffffffffffffffff|80ffffffffff003807c006000fffffffffffffffffffffff|80fffffffffe01c0038000001fdffffffffffffffffffff8|80ff93fffffc01e0000000001fdfffffffffffffffffc701|000e00fffffe01fe000000060f9fffffffffffffffe01e01|0010007fffffc1ff000000060f1fffffffffffffff803c00|8000001ffffffbffc000001f0fffffffffffffffffc03801|8000000fffffffffc000001ffffffffffffffffffff01001|8000000fffffffff60000003fffffffffffffffffff00001|00000003ffffbffc70000003ffffffffffffffffffd00001|80000003ffffdffc10000001ffffffffffffffffffd00001|80000003fffff7fe00000001feff3fffffffffffff900001|80000003ffffffe00000001fc37e03cffffffffffc100001|80000003ffffffc00000001f80bfffcffffffffff8200001|80000003ffffff800000001f0013ffcffffffffff0200001|80000001ffffff000000001e7901ffffffffffffb8600001|80000000ffffff0000000007fc001fffffffffff13c00001|800000003ffffc000000000ffc003fffffffffff86000001|800000003ffff8000000001fff3c3fffffffffff80000001|800000000fff98000000003fffffffffffffffff80000001|800000001ff80c000000007fffffdfcfffffffff00000001|8000000003f80400000000ffffffcfe1fffffffe00000001|8000000001f00000000001ffffffeffe0ffffffe80000001|8000000000f04e00000001fffffff7fe07fffff000000001|8000000000f8c020000001fffffff7fe03fc7f2000000001|80000000007fc048000001fffffff3fc03f83f0080000001|80000000001fc000000001fffffffbf001e03f8180000001|800000000001f000000001ffffffffc001e00fc080000001|8000000000003000000001fffffffe0000c00bc040000001|80000000000030f3000000fffffffee000c0098040000001|8000000000001fff8000007fffffffe00060080060000001|80000000000001ffc000003fffffffc00020040060000001|80000000000001fff80000181fffffc00000160e00000001|80000000000001fffc00000007ffff8000000e1e00000001|80000000000003fffe00000007ffff0000000e3e00000001|80000000000007ffff00000007fffe000000073d82000001|80000000000007ffffe0000007fffc00000007bd8be00001|80000000000007fffff0000003fff8000000010100f80001|80000000000007fffffc000003fff80000000050007d0001|80000000000003fffffc000001fff8000000000020360001|80000000000001fffff8000001fffc000000000000010001|80000000000001fffff0000001fffc000000000007100000|80000000000000ffffe0000003fffc60000000001f100001|800000000000007fffe0000003fff8e0000000003f980001|800000000000003fffe0000003fff1c0000000007ffc0002|000000000000001fffe0000001ffe1c000000000fffe0000|000000000000001fffc0000001ffe1c000000007fffe0000|800000000000001fff00000001ffe1800000000fffff0001|800000000000003ffc00000000ffc0000000000fffff8001|800000000000003ffc00000000ffc0000000000fffff8001|800000000000003ffc000000007f800000000007ffff8001|000000000000003ff8000000007f000000000007ffff8001|800000000000003ff0000000003e000000000007c1ff0001|800000000000003fe00000000000000000000002007f0000|800000000000007fc00000000000000000000000003e0004|800000000000007f0000000000000000000000000000000c|800000000000007e00000000000000000000000000000014|800000000000007c00000000000000000000000000040031|800000000000007800000000000000000000000000000061|80000000000000f800000000000000000000000000000001|80000000000000f800000000000000000000000000000001|80000000000000f000000000000000000000000000000000|800000000000007000000000000000000000000000000001|800000000000003800000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000001|800000000000000100000000000000000000000000000000|8000000000000007000000000000001c00001f9c7fc00001|800000000000000f000000000000e3fffe7ffffffffff001|800000000000007f0000001fffffffffffffffffffffff81|80000000003c007f000001ffffffffffffffffffffffff81|8000312ffc7fffff00001ffffffffffffffffffffffffe01|800dfffffffffffff000fffffffffffffffffffffffffe41|f03fffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff'.split('|'), GW = 192, GH = 96
  var bit = function (y, x) { return (parseInt(LAND[y].charAt(x >> 2), 16) >> (3 - (x & 3))) & 1 }
  var ov = document.getElementById('overlay'), enter = document.getElementById('enter')
  var cv = ov && ov.querySelector('.ov-world'), mark = ov && ov.querySelector('.ov-logo')
  if (!cv) return
  var gl = cv.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true })
  var shown = 0
  var done = function () { return ov.classList.contains('hidden') || (enter && !enter.disabled) }
  var progress = function () {
    var want = parseFloat(ov.style.getPropertyValue('--lp')) || 0
    shown += (want - shown) * (want >= 1 ? 0.34 : 0.08)
    if (want - shown < 0.0015) shown = want
    if (mark) mark.style.setProperty('--fill', (shown * 100).toFixed(1) + '%')
  }
  if (!gl) {   // no WebGL: the mark alone carries the load
    var only = function () { if (done()) return; __b3d.raf(only); progress() }
    __b3d.raf(only)
    return
  }

  var R = 1.58
  var ll = function (lat, lon, r) { var la = lat * Math.PI / 180, lo = lon * Math.PI / 180; return [r * Math.cos(la) * Math.cos(lo), r * Math.sin(la), -r * Math.cos(la) * Math.sin(lo)] }
  var rs = 0x2f6e2b1, rnd = function () { rs ^= rs << 13; rs ^= rs >>> 17; rs ^= rs << 5; return (rs >>> 0) / 4294967296 }
  var P = [], S = [], H = [], SEA = [], SSZ = [], SH = []
  var NF = window.innerWidth < 700 ? 70000 : 96000
  for (var i = 0; i < NF; i++) {
    var u0 = rnd() * 2 - 1, th = rnd() * 6.2832, lat = Math.asin(u0) * 180 / Math.PI, lon = th * 180 / Math.PI - 180
    var jl = lat + (rnd() - 0.5) * 1.7, jo = lon + (rnd() - 0.5) * 1.7 / Math.max(0.25, Math.cos(lat * Math.PI / 180))
    var gy = Math.floor((90 - jl) / 180 * GH), gx = Math.floor((((jo + 180) % 360 + 360) % 360) / 360 * GW)
    if (gy < 1 || gy >= GH || gx < 1 || gx >= GW - 1 || !bit(gy, gx)) {
      if (rnd() < 0.085) { var q = ll(lat, lon, R * 0.998); SEA.push(q[0], q[1], q[2]); SSZ.push(0.55 + rnd() * 0.75); SH.push(0) }
      continue
    }
    if (rnd() > 0.95) continue
    var p = ll(lat, lon, R * (1 + (rnd() - 0.5) * 0.004)); P.push(p[0], p[1], p[2]); S.push(0.55 + Math.pow(rnd(), 2.2) * 1.05); H.push(rnd())
  }
  for (var k = 0; k < SH.length; k++) SH[k] = rnd()

  var VERT = function (size, grow) {
    return 'attribute vec3 position; attribute float aH; attribute float aS;' +
      'uniform mat4 uMV; uniform mat4 uP; uniform float uDpr; uniform float uS; uniform highp float uT; uniform float uFill; uniform float uR;' +
      'varying float vD; varying float vH; varying float vF; varying float vE;' +
      'void main(){ vec4 mv=uMV*vec4(position,1.0); vec4 c=uMV*vec4(0.0,0.0,0.0,1.0); vD=-mv.z+c.z+4.55; vH=aH;' +
      ' float lv=(mv.y-c.y)/uR; float edge=uFill*2.3-1.15+0.03*sin(mv.x*3.0+uT*2.2);' +
      ' vF=smoothstep(edge+0.07,edge-0.07,lv); vE=vF*(1.0-vF)*4.0;' +
      ' gl_Position=uP*mv; gl_PointSize=' + size + '*uDpr*uS*aS*' + grow + '*(15.0/max(0.5,-mv.z)); }'
  }
  var HEAD = 'precision mediump float; uniform highp float uT; varying float vD; varying float vH; varying float vF; varying float vE;'
  /* the refined colours: the filled land a light slate, the far side and the sea lighter still */
  var LAND_FRAG = HEAD + 'void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5)discard;' +
    ' float al=smoothstep(0.5,0.22,d); float f=clamp((vD-2.6)/3.2,0.0,1.0);' +
    ' vec3 full=mix(vec3(0.55,0.59,0.66),vec3(0.74,0.77,0.82),f); vec3 col=mix(vec3(0.74,0.77,0.84),full,vF);' +
    ' col=mix(col,vec3(0.925,0.125,0.153),clamp(vE,0.0,1.0)*0.75);' +
    ' float tw=0.9+0.1*sin(uT*1.6+vH*6.2832);' +
    ' al*=mix(1.0,0.55,f)*tw*(0.6+0.4*vH)*mix(0.34,1.0,max(vF,clamp(vE,0.0,1.0))); gl_FragColor=vec4(col,al); }'
  var SEA_FRAG = HEAD + 'void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5)discard; float f=clamp((vD-2.6)/3.2,0.0,1.0);' +
    ' vec3 col=mix(vec3(0.84,0.86,0.91),vec3(0.72,0.76,0.84),vF);' +
    ' float al=smoothstep(0.5,0.2,d)*(0.3+0.4*vH)*mix(0.3,0.6,vF)*mix(1.0,0.6,f); gl_FragColor=vec4(col,al); }'

  var program = function (vs, fs) {
    var sh = function (type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s }
    var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr)
    return gl.getProgramParameter(pr, gl.LINK_STATUS) ? pr : null
  }
  var buffer = function (data) { var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW); return b }
  var cloud = function (pr, pos, size, h) { return { pr: pr, n: pos.length / 3, pos: buffer(pos), size: buffer(size), h: buffer(h) } }
  var seaP = program(VERT('0.44', '1.0'), SEA_FRAG), landP = program(VERT('0.66', 'mix(0.85,1.0,vF)'), LAND_FRAG)
  if (!seaP || !landP) return
  var clouds = [cloud(seaP, SEA, SSZ, SH), cloud(landP, P, S, H)]

  var W = 0, H2 = 0, dpr = 1, camZ = 5, uS = 1, proj = new Float32Array(16)
  function build () {
    W = ov.clientWidth; H2 = ov.clientHeight; dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    cv.width = Math.max(1, Math.round(W * dpr)); cv.height = Math.max(1, Math.round(H2 * dpr))
    gl.viewport(0, 0, cv.width, cv.height)
    var a = W / Math.max(1, H2)
    camZ = Math.max(4.55, 5.3 - Math.min(1, a - 1) * 0.55)
    if (W < H2) camZ = Math.max(camZ, R * 0.9 / (Math.tan(23 * Math.PI / 180) * a))
    uS = Math.max(0.85, Math.min(1.5, H2 / 760)) * (W < H2 ? 1.35 : 1)
    var f = 1 / Math.tan(23 * Math.PI / 180), n = 0.1, fa = 60
    proj.set([f / a, 0, 0, 0, 0, f, 0, 0, 0, 0, (fa + n) / (n - fa), -1, 0, 0, 2 * fa * n / (n - fa), 0])
  }
  /* the pose: the live loader's north tilt and slow turn */
  var HOME_X = 10 * Math.PI / 180, HOME_Y = -Math.PI / 2 - 100 * Math.PI / 180
  var mv = new Float32Array(16)
  function pose (rx, ry) {
    var cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry)
    /* T(0,0,-camZ) * Rx * Ry, column major */
    mv.set([cy, sx * sy, -cx * sy, 0, 0, cx, sx, 0, sy, -sx * cy, cx * cy, 0, 0, 0, -camZ, 1])
  }
  gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.disable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 0)

  function frame (ts) {
    if (done()) { ov.style.setProperty('--lp', '1'); if (!frame.end) frame.end = ts; if (ts - frame.end > 450) { var lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext(); return } }
    __b3d.raf(frame)
    /* the stylesheet may land after this script's first frame, and the screen's size with it */
    if (ov.clientWidth !== W || ov.clientHeight !== H2) build()
    progress()
    pose(HOME_X + 0.45, HOME_Y - 0.9 + shown * 0.9 + ts * 0.00002)
    gl.clear(gl.COLOR_BUFFER_BIT)
    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i], pr = c.pr
      gl.useProgram(pr)
      gl.uniformMatrix4fv(gl.getUniformLocation(pr, 'uMV'), false, mv)
      gl.uniformMatrix4fv(gl.getUniformLocation(pr, 'uP'), false, proj)
      gl.uniform1f(gl.getUniformLocation(pr, 'uDpr'), dpr)
      gl.uniform1f(gl.getUniformLocation(pr, 'uS'), uS)
      gl.uniform1f(gl.getUniformLocation(pr, 'uT'), ts / 1000)
      gl.uniform1f(gl.getUniformLocation(pr, 'uFill'), shown)
      gl.uniform1f(gl.getUniformLocation(pr, 'uR'), R)
      var bind = function (name, buf, n) { var l = gl.getAttribLocation(pr, name); if (l < 0) return; gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, 0, 0) }
      bind('position', c.pos, 3); bind('aS', c.size, 1); bind('aH', c.h, 1)
      gl.drawArrays(gl.POINTS, 0, c.n)
    }
  }
  build(); __b3d.raf(frame)
})()
