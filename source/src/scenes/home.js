/* Home page scenes: every inline script from _source/index.html, ported verbatim per src/CONVERSION.md.
   Shell-owned scripts (nav hide/float, burger drawer, Lenis, universal search, BM ribbon, bmBack/embedded)
   are omitted here; the Shell/Nav/Footer components own them.
   Contract adaptations only: THREE loads from the bundled module (no CDN ladder), GSAP/ScrollTrigger are
   imported (window.* feature checks removed), and every window/document listener, observer, timer, rAF loop
   and WebGL renderer is registered through tiny helpers so the returned cleanup can tear the page down. */
import * as THREE_MOD from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export default function initHome(){
var dead=false;
var _cleanups=[],_obs=[],_ivs=[],_tos=[],_renderers=[];
function _raf(f){ if(dead) return 0; return requestAnimationFrame(function(ts){ if(dead) return; f(ts); }); }
function onWin(t,f,o){ window.addEventListener(t,f,o); _cleanups.push(function(){ window.removeEventListener(t,f,o); }); }
function onDoc(t,f,o){ document.addEventListener(t,f,o); _cleanups.push(function(){ document.removeEventListener(t,f,o); }); }
function _io(cb,opt){ var o=new IntersectionObserver(cb,opt); _obs.push(o); return o; }
function _ro(cb){ var o=new ResizeObserver(cb); _obs.push(o); return o; }
function _setIv(f,ms){ var id=setInterval(f,ms); _ivs.push(id); return id; }
function _setTo(f,ms){ var id=setTimeout(f,ms); _tos.push(id); return id; }
function _reg(r){ _renderers.push(r); return r; }
/* the homepage's own design tokens are scoped to this class (see styles/home.css) */
document.body.classList.add('page-home');

/* This is a scroll-narrative page with a pinned 960vh showpiece. If the browser restores a deep
   scroll position on reload, ScrollTrigger measures that section before the scroll settles and its
   start/end land wrong (negative), so the cleanroom never assembles or reverses. Always start at the
   top so every measurement has a clean baseline. */
if('scrollRestoration' in history){ try{ history.scrollRestoration='manual'; }catch(e){} }
(function(){
  var el=document.getElementById('loader'); if(!el) return;
  document.documentElement.classList.add('is-loading');
  var reduceL=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  /* 26 Sep (Bazil: "loading screen faster"): the same sequence, compressed: the count climbs in about a second, the
     finale runs one second, the lift .7s; the cap forcing the count home comes at 2.8s, the hard cap 1.5s after it */
  var t0=performance.now(), MIN=1150, CAP=2800, done=false, raf=null;
  var pct=document.getElementById('ldPct'), lf=document.getElementById('ldLogoFill');
  el.setAttribute('role','progressbar'); el.setAttribute('aria-label','Loading'); el.setAttribute('aria-valuemin','0'); el.setAttribute('aria-valuemax','100');
  var loaded=document.readyState==='complete'; onWin('load',function(){loaded=true;});/* SPA: window load never re-fires on client-side navigation */
  function realProgress(){
    if(loaded) return 1;
    var imgs=document.images, tot=imgs.length||1, ok=0;
    for(var i=0;i<imgs.length;i++) if(imgs[i].complete) ok++;
    var rs=document.readyState==='complete'?1:document.readyState==='interactive'?0.55:0.25;
    return Math.min(0.96, 0.35*rs + 0.65*(ok/tot));
  }
  function dismiss(){
    if(done) return; done=true;
    /* 4 Sep: the intro plays ONCE per page load. Home.jsx reads this before rendering the
       overlay, so returning to the home page from another route does not drop a full-screen
       opaque panel over a visitor who has already seen it. */
    try{ window.__iaqLoaderPlayed=true; }catch(e){}
    if(raf) cancelAnimationFrame(raf);
    el.classList.add('ld-done');
    document.documentElement.classList.remove('is-loading');
    /* the is-loading overflow lock can poison ScrollTrigger's initial measurements:
       re-measure everything now that the page is scrollable and layout is final */
    _setTo(function(){ try{ ScrollTrigger.refresh(); }catch(e){} },60);
    /* signal the hero reveal to play now that the loader is lifting. Single source of truth: the
       main script owns the tween AND a hard fallback settle, so a frozen ticker can never strand it. */
    try{ window.dispatchEvent(new Event('iaq:loaderdone')); }catch(e){}
    _setTo(function(){ el.style.display='none';/* React owns this node; removing it breaks unmount */
      /* release the preloader's WebGL context immediately (don't leave it for GC) so the page carries one fewer live context */
      try{ var lc=document.getElementById('loaderCv'); if(lc){ var lg=lc.getContext('webgl2')||lc.getContext('webgl'); var ext=lg&&lg.getExtension('WEBGL_lose_context'); if(ext)ext.loseContext(); } }catch(e){}
    },900);
  }
  window.__iaqLoaderDismiss=dismiss;
  var HOLDQ=/[?&]ldhold/.test(location.search), force=false;
  /* 25 Sep, night: CAP no longer cuts the loader mid-way; it forces the count home, the 100% finale plays, and a hard
     cap two and a half seconds later still guarantees the page */
  if(!HOLDQ){ _setTo(function(){ force=true; }, CAP); _setTo(dismiss, CAP+1500); }
  el.addEventListener('click', dismiss);
  if(reduceL){ _setTo(dismiss, 650); return; }
  function fallback(){ _setTo(dismiss, Math.max(0, MIN-(performance.now()-t0))); }
  var LAND='ffffffffffffffffffffffffffffffffffffffffffffffff|000000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000001|8000000000000000003f8000000000000000000000000001|800000000000ffc1fffff000000000000000000000000001|8000000000001f1ffffff800009000000000000000000001|0000000040007c1ffffffc00000000000000070000000001|80000000090198003ffffc00000000008007fff0007c0001|80000003e00000003ffff800000000040ffffffff87f8001|800e000037067f8007ffd0000000000c1ffffffffffffc01|80ffffff3fcb19f017ffc000007fc007ffffffffffffffff|e0fffffff7dff0780ffc000001fffdffffffffffffffffff|98fffffffffff0780fc00f0003ffffffffffffffffffffff|80ffffffffff003807c006000fffffffffffffffffffffff|80fffffffffe01c0038000001fdffffffffffffffffffff8|80ff93fffffc01e0000000001fdfffffffffffffffffc701|000e00fffffe01fe000000060f9fffffffffffffffe01e01|0010007fffffc1ff000000060f1fffffffffffffff803c00|8000001ffffffbffc000001f0fffffffffffffffffc03801|8000000fffffffffc000001ffffffffffffffffffff01001|8000000fffffffff60000003fffffffffffffffffff00001|00000003ffffbffc70000003ffffffffffffffffffd00001|80000003ffffdffc10000001ffffffffffffffffffd00001|80000003fffff7fe00000001feff3fffffffffffff900001|80000003ffffffe00000001fc37e03cffffffffffc100001|80000003ffffffc00000001f80bfffcffffffffff8200001|80000003ffffff800000001f0013ffcffffffffff0200001|80000001ffffff000000001e7901ffffffffffffb8600001|80000000ffffff0000000007fc001fffffffffff13c00001|800000003ffffc000000000ffc003fffffffffff86000001|800000003ffff8000000001fff3c3fffffffffff80000001|800000000fff98000000003fffffffffffffffff80000001|800000001ff80c000000007fffffdfcfffffffff00000001|8000000003f80400000000ffffffcfe1fffffffe00000001|8000000001f00000000001ffffffeffe0ffffffe80000001|8000000000f04e00000001fffffff7fe07fffff000000001|8000000000f8c020000001fffffff7fe03fc7f2000000001|80000000007fc048000001fffffff3fc03f83f0080000001|80000000001fc000000001fffffffbf001e03f8180000001|800000000001f000000001ffffffffc001e00fc080000001|8000000000003000000001fffffffe0000c00bc040000001|80000000000030f3000000fffffffee000c0098040000001|8000000000001fff8000007fffffffe00060080060000001|80000000000001ffc000003fffffffc00020040060000001|80000000000001fff80000181fffffc00000160e00000001|80000000000001fffc00000007ffff8000000e1e00000001|80000000000003fffe00000007ffff0000000e3e00000001|80000000000007ffff00000007fffe000000073d82000001|80000000000007ffffe0000007fffc00000007bd8be00001|80000000000007fffff0000003fff8000000010100f80001|80000000000007fffffc000003fff80000000050007d0001|80000000000003fffffc000001fff8000000000020360001|80000000000001fffff8000001fffc000000000000010001|80000000000001fffff0000001fffc000000000007100000|80000000000000ffffe0000003fffc60000000001f100001|800000000000007fffe0000003fff8e0000000003f980001|800000000000003fffe0000003fff1c0000000007ffc0002|000000000000001fffe0000001ffe1c000000000fffe0000|000000000000001fffc0000001ffe1c000000007fffe0000|800000000000001fff00000001ffe1800000000fffff0001|800000000000003ffc00000000ffc0000000000fffff8001|800000000000003ffc00000000ffc0000000000fffff8001|800000000000003ffc000000007f800000000007ffff8001|000000000000003ff8000000007f000000000007ffff8001|800000000000003ff0000000003e000000000007c1ff0001|800000000000003fe00000000000000000000002007f0000|800000000000007fc00000000000000000000000003e0004|800000000000007f0000000000000000000000000000000c|800000000000007e00000000000000000000000000000014|800000000000007c00000000000000000000000000040031|800000000000007800000000000000000000000000000061|80000000000000f800000000000000000000000000000001|80000000000000f800000000000000000000000000000001|80000000000000f000000000000000000000000000000000|800000000000007000000000000000000000000000000001|800000000000003800000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000001|800000000000000100000000000000000000000000000000|8000000000000007000000000000001c00001f9c7fc00001|800000000000000f000000000000e3fffe7ffffffffff001|800000000000007f0000001fffffffffffffffffffffff81|80000000003c007f000001ffffffffffffffffffffffff81|8000312ffc7fffff00001ffffffffffffffffffffffffe01|800dfffffffffffff000fffffffffffffffffffffffffe41|f03fffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff'.split('|');
  /* 25 Sep (Bazil: "revert back the old loading screen, what I meant is white instead of dark"): the globe is back, on white */
  function init(T){
    var canvas=document.getElementById('loaderCv');
    var scene=new T.Scene();
    var camera=new T.PerspectiveCamera(46,1,0.1,60); camera.position.z=4.15;
    var renderer=_reg(new T.WebGLRenderer({canvas:canvas,antialias:true,alpha:true}));
    renderer.setClearColor(0x000000,0); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.25));
    if(T.ColorManagement) T.ColorManagement.enabled=false;
    var GW=192,GH=96,R=1.58;
    function bit(y,x){ return (parseInt(LAND[y].charAt(x>>2),16)>>(3-(x&3)))&1; }
    function ll(lat,lon,r){var la=lat*Math.PI/180,lo=lon*Math.PI/180;
      return [r*Math.cos(la)*Math.cos(lo), r*Math.sin(la), -r*Math.cos(la)*Math.sin(lo)];}
    /* 25 Sep, night (Bazil: "looks very barbaric"): the land was sampled on the 192x96 mask cells with random culling
       and jitter, so the continents read as clumps and holes. Now a Fibonacci lattice over the sphere, kept where the mask
       says land: evenly spaced dots, the same pitch everywhere, crisp coasts. */
    /* 25 Sep, evening (Bazil, with a reference: "texture of loading screen should be more like this"): finer, denser land
       (a 90,000 point lattice on desktop, 44,000 on a phone), a sparse field of ocean dots, and a shaded body behind */
    /* 26 Sep (Bazil, with his reference: "texture of the loading world should be more like this", "this is irregular, right
       now the new one is regular"): the lattice laid the dots in visible rows. Now a seeded random scatter over the sphere:
       land where the mask says land, read a little off each dot's own place so the coasts fray; dots of varied size and
       tone, so the continents read as grain, not as a grid; and a finer, fainter scatter over the sea. Seeded, so the
       world is the same on every visit. */
    var rs=0x2f6e2b1; function rnd(){ rs^=rs<<13; rs^=rs>>>17; rs^=rs<<5; return (rs>>>0)/4294967296; }
    var tgt=[], SEA=[], SZ=[], SSZ=[], NF=(window.innerWidth<760?104000:124000);   /* phones: the globe sits farther back, so it needs nearly the desktop count to read */
    for(var fi=0;fi<NF;fi++){ var u0=rnd()*2-1, th=rnd()*6.2832, lat=Math.asin(u0)*180/Math.PI, lon=th*180/Math.PI-180;
      var jl=lat+(rnd()-0.5)*1.7, jo=lon+(rnd()-0.5)*1.7/Math.max(0.25,Math.cos(lat*Math.PI/180));
      var gy=Math.floor((90-jl)/180*GH), gx=Math.floor((((jo+180)%360+360)%360)/360*GW);
      if(gy<1||gy>=GH||gx<1||gx>=GW-1||!bit(gy,gx)){ if(rnd()<0.085){ var ps=ll(lat,lon,R*0.998); SEA.push(ps[0],ps[1],ps[2]); SSZ.push(0.55+rnd()*0.75); } continue; }
      if(rnd()>0.95) continue;
      var p3=ll(lat,lon,R*(1+(rnd()-0.5)*0.004)); tgt.push(p3[0],p3[1],p3[2]); SZ.push(0.55+Math.pow(rnd(),2.2)*1.05); }
    var N=tgt.length/3;
    var start=new Float32Array(N*3), posn=new Float32Array(N*3), hs=new Float32Array(N);
    /* 25 Sep (Bazil: "make the loading screen better"): the dots used to fly in from a random cloud, so for the first
       two seconds the screen read as dust. Now each dot rises to the surface from just inside the globe, in order of
       its angular distance from Shah Alam, so the world grows out of IAQ's headquarters; a body sphere (below) hides
       the far hemisphere, so at every frame the globe is a globe. aH keeps its own random for the twinkle. */
    var HQ=ll(3.07,101.52,1), hs2=new Float32Array(N);
    for(var k=0;k<N;k++){var o=k*3;
      var dx=tgt[o]/R,dy=tgt[o+1]/R,dz=tgt[o+2]/R, ang=Math.acos(Math.max(-1,Math.min(1,dx*HQ[0]+dy*HQ[1]+dz*HQ[2])))/Math.PI;
      start[o]=tgt[o]; start[o+1]=tgt[o+1]; start[o+2]=tgt[o+2];   /* 26 Sep: no rise; the fill carries the loading */
      posn[o]=start[o]; posn[o+1]=start[o+1]; posn[o+2]=start[o+2]; hs[k]=Math.min(1,ang*0.92+Math.random()*0.08); hs2[k]=Math.random();}
    var geo=new T.BufferGeometry();
    var attr=new T.BufferAttribute(posn,3); geo.setAttribute('position',attr);
    geo.setAttribute('aH',new T.BufferAttribute(hs2,1)); geo.setAttribute('aS',new T.BufferAttribute(new Float32Array(SZ),1));
    /* 26 Sep (Bazil: "the 100% looks bad", "or better, the world looks like it's being filled"): the loading is the globe
       filling. A level rises through it from the bottom with the count (uFill, in view space, so it stays level while the
       globe turns); dots under it take their full grey, dots above it wait pale; the dots at the level catch IAQ red, the
       same red the logo above fills with. */
    var fillU={value:0};
    var mat=new T.ShaderMaterial({transparent:true,depthTest:true,depthWrite:false,blending:T.NormalBlending,
      uniforms:{uDpr:{value:Math.min(window.devicePixelRatio||1,1.25)},uS:{value:1},uT:{value:0},uFill:fillU,uR:{value:R}},
      vertexShader:'uniform float uDpr; uniform float uS; uniform float uT; uniform float uFill; uniform float uR; attribute float aH; attribute float aS; varying float vD; varying float vH; varying float vF;'+
        'void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); vec4 c=modelViewMatrix*vec4(0.0,0.0,0.0,1.0); vD=-mv.z+c.z+4.55; vH=aH;'+   /* depth from the globe's own centre, set as if the camera stood at the desktop 4.55: a phone's farther camera no longer pales every dot */
        ' float lv=(mv.y-c.y)/uR; float edge=uFill*2.3-1.15+0.03*sin(mv.x*3.0+uT*2.2); vF=smoothstep(edge+0.07,edge-0.07,lv);'+
        ' gl_Position=projectionMatrix*mv; gl_PointSize=0.66*uDpr*uS*aS*mix(0.85,1.0,vF)*(15.0/max(0.5,-mv.z)); }',
      fragmentShader:'precision mediump float; uniform highp float uT; varying float vD; varying float vH; varying float vF;'+   /* highp: the vertex stage reads uT too, and the two must agree */
        'void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5)discard;'+
        ' float al=smoothstep(0.5,0.22,d); float f=clamp((vD-2.6)/3.2,0.0,1.0);'+
        ' vec3 full=mix(vec3(0.55,0.59,0.66),vec3(0.74,0.77,0.82),f); vec3 col=mix(vec3(0.74,0.77,0.84),full,vF);'+   /* 26 Sep, v4 (Bazil: "the land grey is too dark or too strong"): a light slate, was 0.21 0.24 0.29 */
        ' float lvl=vF*(1.0-vF)*4.0; col=mix(col,vec3(0.925,0.125,0.153),lvl*0.55);'+
        ' float tw=0.9+0.1*sin(uT*1.6+vH*6.2832);'+
        ' al*=mix(1.0,0.55,f)*tw*(0.6+0.4*vH)*mix(0.34,1.0,vF); gl_FragColor=vec4(col,al); }'});
    var g=new T.Group(); scene.add(g);
    /* the body: near white at the centre, a light grey-blue at the rim, so the globe has a form on the white page and
       occludes the dots on its far side (they are inside it until they rise) */
    var body=new T.Mesh(new T.SphereGeometry(R*0.985,56,36),new T.ShaderMaterial({
      vertexShader:'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }',
      fragmentShader:'precision mediump float; varying vec3 vN; varying vec3 vV; void main(){ float fr=pow(1.0-max(0.0,dot(normalize(vN),normalize(vV))),2.4); gl_FragColor=vec4(mix(vec3(0.976,0.982,0.99),vec3(0.855,0.88,0.915),fr),1.0); }'}));
    /* 25 Sep (Bazil: "isn't it supposed to be all dots"): the body is not drawn; the world is dots front and back,
       the far side lighter and smaller so the sphere still reads */
    /* the reference's soft sphere: the body is drawn again, very light, darker toward the limb, so the far-side dots
       are hidden and the globe reads as a solid; it fades in with the load */
    /* 26 Sep (Bazil: "the loading screen looks like there is a sphere inside", "supposed to be all dots"): the body is not
       drawn again; the world is dots front and back, the far side lighter and smaller (the depth fade in the shaders) */
    body.material.transparent=true; body.material.depthWrite=true; body.renderOrder=0;
    var bodyU={value:0}; body.material.uniforms={uA:bodyU};
    body.material.fragmentShader='precision mediump float; uniform float uA; varying vec3 vN; varying vec3 vV; void main(){ float c=max(0.0,dot(normalize(vN),normalize(vV))); float fr=pow(1.0-c,1.8); vec3 col=mix(vec3(0.985,0.988,0.994),vec3(0.80,0.835,0.88),fr); gl_FragColor=vec4(col,uA*(0.55+0.45*fr)); }';
    body.material.needsUpdate=true;
    var seaG=new T.BufferGeometry(); seaG.setAttribute('position',new T.BufferAttribute(new Float32Array(SEA),3));
    var seaH=new Float32Array(SEA.length/3); for(var si=0;si<seaH.length;si++) seaH[si]=rnd();
    seaG.setAttribute('aH',new T.BufferAttribute(seaH,1)); seaG.setAttribute('aS',new T.BufferAttribute(new Float32Array(SSZ),1));
    var seaM=new T.ShaderMaterial({transparent:true,depthTest:true,depthWrite:false,blending:T.NormalBlending,
      uniforms:{uDpr:mat.uniforms.uDpr,uS:mat.uniforms.uS,uT:mat.uniforms.uT,uFill:fillU,uR:mat.uniforms.uR},
      vertexShader:'uniform float uDpr; uniform float uS; uniform float uT; uniform float uFill; uniform float uR; attribute float aH; attribute float aS; varying float vH; varying float vF; varying float vD;'+
        'void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); vec4 c=modelViewMatrix*vec4(0.0,0.0,0.0,1.0); vH=aH; vD=-mv.z+c.z+4.55;'+
        ' float lv=(mv.y-c.y)/uR; float edge=uFill*2.3-1.15+0.03*sin(mv.x*3.0+uT*2.2); vF=smoothstep(edge+0.07,edge-0.07,lv);'+
        ' gl_Position=projectionMatrix*mv; gl_PointSize=0.44*uDpr*uS*aS*(15.0/max(0.5,-mv.z)); }',
      fragmentShader:'precision mediump float; varying float vH; varying float vF; varying float vD;'+
        'void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5)discard; float f=clamp((vD-2.6)/3.2,0.0,1.0);'+
        ' vec3 col=mix(vec3(0.84,0.86,0.91),vec3(0.72,0.76,0.84),vF);'+   /* v4: the filled sea lighter with the land */
        ' float al=smoothstep(0.5,0.2,d)*(0.3+0.4*vH)*mix(0.3,0.6,vF)*mix(1.0,0.6,f); gl_FragColor=vec4(col,al); }'});
    var seaObj=new T.Points(seaG,seaM); seaObj.renderOrder=1; g.add(seaObj);
    var dotsObj=new T.Points(geo,mat); dotsObj.renderOrder=1; g.add(dotsObj);
    /* offices pop in at the end */
    var OFF=[[3.1,101.7],[1.35,103.82],[50.11,8.68],[12.97,77.59],[59.33,18.07],[33.45,-112.07],[53.35,-6.26]]; /* Ireland, 10 Sep 2026 */
    var mp=new Float32Array(OFF.length*3);
    OFF.forEach(function(of,i2){var p4=ll(of[0],of[1],R*1.02); mp[i2*3]=p4[0];mp[i2*3+1]=p4[1];mp[i2*3+2]=p4[2];});
    var mgeo=new T.BufferGeometry(); mgeo.setAttribute('position',new T.BufferAttribute(mp,3));
    /* the office points are round: a drawn disc as the sprite */
    var dotCv=document.createElement('canvas'); dotCv.width=dotCv.height=32; var dctx=dotCv.getContext('2d'); dctx.beginPath(); dctx.arc(16,16,13,0,6.2832); dctx.fillStyle='#fff'; dctx.fill();
    var dotTex=new T.CanvasTexture(dotCv);
    var mmat=new T.PointsMaterial({color:0xEC2027,size:8,sizeAttenuation:false,transparent:true,opacity:0,depthTest:true,depthWrite:false,map:dotTex,alphaTest:.4});
    var offObj=new T.Points(mgeo,mmat); offObj.renderOrder=4; g.add(offObj);
    /* 25 Sep, night (Bazil: "make the loading screen 100% ... showcase well"): at 100% the globe resolves into the
       network. An invisible sphere writes depth AFTER the dots (so both hemispheres of dots still show), and the routes
       and office points are drawn behind it, so an arc going over the horizon disappears where the earth would hide it. */
    var occ=new T.Mesh(new T.SphereGeometry(R*0.995,48,32),new T.MeshBasicMaterial({colorWrite:false,depthWrite:true,transparent:true}));
    occ.renderOrder=2; g.add(occ);
    /* 25 Sep, late night (Bazil: "the 2 movement and weird line bother me"): no route lines, and the finale no longer
       turns or tilts the globe. The north tilt is part of the one pose from the first frame; the only motion is the load spin. */
    var finAt=0, FIN=120, TILT_F=0.45, HOLD=/[?&]ldhold/.test(location.search);
    var NAMES_L=['Malaysia · HQ','Singapore','Germany','India','Sweden','USA','Ireland'];
    /* 25 Sep (Bazil: "put flags instead of square dots and boxes"): each tag is the country's flag and its name */
    var FLAGS_L=['🇲🇾','🇸🇬','🇩🇪','🇮🇳','🇸🇪','🇺🇸','🇮🇪'];
    var tagEls=[],tagVs=[],prV=new T.Vector3();
    /* 25 Sep, late night (Bazil: "don't overcomplicate the loading screen, it's just dots world"): no office tags, no pins,
       no finale; the dotted world forms, the mark fills, and it lifts */
    var HOME_X=10*Math.PI/180, HOME_Y=-Math.PI/2-100*Math.PI/180;
    g.rotation.x=HOME_X+0.45;   /* the one pose: tilted north so Europe and Asia both face */
    function resize(){ var w=window.innerWidth, h=window.innerHeight;
      renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
      camera.position.z=Math.max(4.55, 5.3-Math.min(1, w/h-1)*0.55);
      /* 25 Sep, night: on a portrait phone the globe fits the width (the finale's offices span Ireland to Malaysia) */
      if(w<h) camera.position.z=Math.max(camera.position.z, R*0.9/(Math.tan(23*Math.PI/180)*w/h));
      mat.uniforms.uS.value=Math.max(0.85,Math.min(1.5,h/760))*(w<h?1.35:1); }   /* 26 Sep: portrait dots a touch larger; the paleness on phones was the depth fade, fixed in the shaders */
    resize(); onWin('resize',resize);
    var pd=0, pdLast=0;
    function frame(ts){ if(done) return; raf=_raf(frame);
      var t=performance.now()-t0;
      /* frame-rate independent easing: same feel on 60/120/144Hz, no micro-stutter */
      var dt=Math.min(0.05,Math.max(0.001,(t-pdLast)/1000)); pdLast=t;
      var floor2=Math.min(0.92, t/2200);   /* 25 Sep, evening (Bazil: "where's the loading of the world"): the rise is seen */
      /* 25 Sep, evening (Bazil: "where's the loading of the world"): on a warm cache the page is in at once and the globe
         jumped to 100 in half a second, so nothing was seen assembling; the count may not run ahead of a 1.6 s build */
      var target=force?1:Math.min(Math.max(realProgress(), floor2), Math.max(floor2, t/1600));
      pd+=(target-pd)*(1-Math.exp(-dt/(force?0.08:0.13))); if(pd>0.9995) pd=1;
      if(window.__ldPd!=null) pd=window.__ldPd;                 /* harness: ?ldhold then window.__ldPd=0.4 poses a fill */
      mat.uniforms.uT.value=ts/1000;
      /* 26 Sep: the globe stands pale from the first frame and fills with the count */
      bodyU.value=Math.min(1,0.6+pd*0.5); fillU.value=pd;
      /* the finale: starts when the count reaches 100 and the page is in (or CAP forced it) */
      if(pd>=1&&(loaded||force)&&!finAt){ finAt=t; }
      var fin=finAt?(t-finAt)/1000:-1;
      if(window.__ldFin!=null) fin=window.__ldFin;              /* harness: ?ldhold then window.__ldFin=1.2 poses the finale */
      /* the offices light one after another once the count reaches 100 */
      var landed=[]; for(var a2=0;a2<OFF.length;a2++) landed[a2]=fin>=a2*0.08;
      mmat.opacity=0;
      g.updateMatrixWorld();
      /* keep-out box around the centred IAQ logo + % so office tags never pile on top of it */
      var lr=lf&&lf.getBoundingClientRect(), pr=pct&&pct.getBoundingClientRect();
      /* :root carries a CSS zoom (1.12 on desktop), so a translate in CSS px lands zoomed: divide it out. Collisions are
         read from the live boxes, logo and labels alike, so they are all in one coordinate space. */
      var ZM=parseFloat(getComputedStyle(document.documentElement).zoom)||1, placed=[], LB=el.getBoundingClientRect();
      for(var i3=0;i3<tagEls.length;i3++){ var te=tagEls[i3];
        if(fin<0||!landed[i3]){ te.classList.remove('on'); continue; }
        prV.copy(tagVs[i3]).applyMatrix4(g.matrixWorld);
        var face=prV.z>0.25; prV.project(camera);
        var sx=(prV.x*0.5+0.5)*window.innerWidth/ZM, sy=(-prV.y*0.5+0.5)*window.innerHeight/ZM;
        te.style.transform='translate('+Math.round(sx)+'px,'+Math.round(sy)+'px)';
        if(!face||prV.z>=1){ te.classList.remove('on'); continue; }
        /* label to the right of the pin; if it meets the logo or an earlier label, try the left, then step down */
        var ok=false, lbE=te.lastChild;
        for(var tr=0;tr<4&&!ok;tr++){ te.classList.toggle('l',tr%2===1); te.style.setProperty('--dy',(tr>1?18:0)+'px');
          var rb=lbE.getBoundingClientRect(); ok=rb.left>=LB.left+6&&rb.right<=LB.right-6&&!(lr&&rb.left<lr.right+12&&rb.right>lr.left-12&&rb.top<(pr?pr.bottom:lr.bottom)+12&&rb.bottom>lr.top-12);
          for(var pq=0;pq<placed.length&&ok;pq++){ var qb=placed[pq]; if(rb.left<qb.right+6&&rb.right>qb.left-6&&rb.top<qb.bottom+2&&rb.bottom>qb.top-2) ok=false; } }
        te.classList.toggle('on',ok); if(ok) placed.push(lbE.getBoundingClientRect());
      }
      g.rotation.y=HOME_Y-0.9+pd*0.9+ts*0.00002;
      g.rotation.x=HOME_X+TILT_F;
      var shown=Math.round(pd*100);
      if(pct) pct.textContent=shown+'%';
      el.setAttribute('aria-valuenow',shown);   /* 26 Sep: the number is off the screen; the count stays for screen readers */
      if(lf) lf.style.setProperty('--fill',(pd*100).toFixed(1)+'%');
      renderer.render(scene,camera);
      if(finAt&&!HOLD&&t-finAt>=FIN){
        var e2=performance.now()-t0;
        _setTo(dismiss, Math.max(0, MIN-e2));
      }
    }
    raf=_raf(frame);
  }
  try{init(THREE_MOD);}catch(err){fallback();}
})();

document.documentElement.classList.add('js');
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- laminar particle hero (7 Sep rebuild, client: "red and white, go all out premium") ----
   The air in a cleanroom moves in laminar sheets, so the field reads as depth-layered streamlines,
   not confetti. Three layers with their own speed, size and pointer parallax; every mote is a
   pre-rendered soft glow sprite drawn additively with a crisp core, so it glows instead of sitting
   flat on the video. A few crimson tracers carry long luminous tails, and one flares now and then.
   The cursor is still an obstruction: streamlines bend around it with a light swirl. */
(function(){
  var cv=document.getElementById('heroCanvas'); if(!cv) return;
  /* 24 Sep (Bazil: "no dot"): the field is retired; the canvas is hidden in home.css and nothing is drawn */
  if(getComputedStyle(cv).display==='none') return;
  var ctx; try{ ctx=cv.getContext('2d'); }catch(e){ return; }
  if(!ctx) return;
  var mob=window.innerWidth>0&&window.innerWidth<760, dpr=Math.min(window.devicePixelRatio||1,1.5);
  /* 9 Sep (Bazil: "too many dots, in a way that's too messy"). The field was 218 particles on
     desktop and 67 on a phone, seeded evenly across the whole canvas, so a third of them sat on
     top of the headline; and 22-34% of them were red, which put ~50 crimson specks over a
     photograph and read as confetti. Counts are now under half, and red is an accent of about
     six particles, which is what makes the flare feel deliberate. */
  /* 25 Sep, 17:10 (Bazil: "please add a bit more electrons and make it look better"): 84 on desktop (was 52), 37 on a phone
     (was 27); the far layer is cooler and finer so the field has depth, and near motes link when they pass close (below) */
  /* 26 Sep (Bazil: "where are the electron cleanroom effect on the banner video, red and white"): crisp squares carry no
     glow, so the field is denser and each speck brighter to read at the same weight: 120 on desktop, 56 on a phone */
  var LAYERS=mob?[[30,.22,.9,1.4,.5],[18,.42,1.2,2,.72],[8,.8,1.7,2.8,.95]]
                :[[66,.2,.9,1.5,.5],[38,.38,1.25,2.1,.74],[16,.72,1.7,3,.95]];   /* measured: the first cut lit ~1,200 px of the canvas, too faint to read; motes a touch larger and brighter */ /* [count, speed, rMin, rMax, alpha] far -> near. 25 Sep: half the 9 Sep counts, Bazil: "subtle particle electrons" */
  /* the copy sits in the LEFT column, so the field stays faint there and only comes up to full
     weight out over the open right side of the frame. On a phone the copy is full width, so the
     answer there is simply fewer and fainter, not a ramp. */
  var LEAD=mob?.42:.16;
  var W=0,H=0,parts=[],running=true,looping=false,t0=performance.now();
  var mx=-9999,my=-9999,R=130, px=0,py=0,tx=0,ty=0;  /* pointer, and the eased parallax it drives */
  /* 26 Sep: the glow sprites are gone; each electron is a crisp square (step) */
  cv.parentElement.addEventListener('pointermove',function(e){
    var r=cv.getBoundingClientRect(); mx=e.clientX-r.left; my=e.clientY-r.top;
    tx=(mx/Math.max(1,W)-.5); ty=(my/Math.max(1,H)-.5);
  });
  cv.parentElement.addEventListener('pointerleave',function(){ mx=-9999; my=-9999; tx=0; ty=0; });
  function fit(){
    var w=cv.clientWidth,h=cv.clientHeight; if(!w||!h) return false;
    W=w;H=h;cv.width=w*dpr;cv.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0); return true;
  }
  function seed(){
    parts=[];
    LAYERS.forEach(function(L,li){
      for(var i=0;i<L[0];i++){
        /* 26 Sep (Bazil: "where are the electron cleanroom effect on the banner video, red and white"): white and IAQ red,
           about four to one (the brand's 80 white / 20 red) */
        var red=Math.random()<(li===2?.3:.16);
        parts.push({l:li,x:Math.random()*W,y:Math.random()*H,v:L[1]*(.7+Math.random()*.6),ph:Math.random()*6.28,
          r:L[2]+Math.random()*(L[3]-L[2]),a:L[4]*(.6+Math.random()*.4),red:red,tw:Math.random()*6.28,
          tail:0,flare:0});   /* no tails: a fading streak is a gradient, and IAQ draws no short dashes */
      }
    });
  }
  var nextFlare=0;
  var pos=[];
  function step(now){
    var t=(now-t0)*0.001;
    ctx.clearRect(0,0,W,H); pos.length=0;
    px+=(tx-px)*.05; py+=(ty-py)*.05;
    /* one crimson tracer flares roughly every 2.4s: a breath, not a firework */
    if(t>nextFlare){ nextFlare=t+2.0+Math.random()*1.2; var cands=parts.filter(function(p){return p.red&&p.l===2;}); if(cands.length){ cands[(Math.random()*cands.length)|0].flare=1; } }
    ctx.globalCompositeOperation='source-over';   /* crisp colour, no additive glow */
    for(var i=0;i<parts.length;i++){
      var p=parts[i], L=LAYERS[p.l];
      var order=Math.min(1,Math.max(0,p.x/W));
      var wob=(1-order)*(6+p.l*5);
      p.x+=p.v; p.ph+=.012+p.l*.004; p.tw+=.021;
      if(p.flare>0) p.flare=Math.max(0,p.flare-.016);
      var lx=px*(8+p.l*10), ly=py*(6+p.l*7);     /* parallax: near layers move most */
      var x=p.x+lx, y=p.y+Math.sin(p.ph+p.x*.008)*wob+ly;
      /* the cursor is an obstruction: streamlines bend around it, with a light swirl */
      var dx=x-mx,dy=y-my,d2=dx*dx+dy*dy;
      if(d2<R*R){ var d=Math.sqrt(d2)||1,push=(1-d/R)*(18+p.l*8); x+=dx/d*push-dy/d*push*.35; y+=dy/d*push+dx/d*push*.35; }
      if(p.x>W+12){ p.x=-12; p.y=Math.random()*H; }
      var twk=.75+.25*Math.sin(p.tw), al=p.a*(LEAD+order*(1-LEAD))*twk+p.flare*.5;
      var rad=p.r*(1+p.flare*1.2);
      /* tail first, under the core */
      if(p.tail){ var tl=p.tail*(.6+order*.6)*(1+p.flare*1.2);
        var gr=ctx.createLinearGradient(x-tl,y,x,y); var c=p.red?'255,77,85':'237,242,252';
        gr.addColorStop(0,'rgba('+c+',0)'); gr.addColorStop(1,'rgba('+c+','+(al*.55).toFixed(3)+')');
        ctx.strokeStyle=gr; ctx.lineWidth=Math.max(1,rad*.9); ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(x-tl,y); ctx.lineTo(x,y); ctx.stroke(); }
      /* 26 Sep (IAQ graphic rules: texture is square, not round; no radial glow): each electron is a crisp square speck */
      var sz=Math.max(2,rad*2.1); ctx.globalAlpha=Math.min(1,al*1.45);
      ctx.fillStyle=p.red?'rgb(236,35,38)':'rgb(255,255,255)'; ctx.fillRect(Math.round(x-sz/2),Math.round(y-sz/2),sz,sz);
    }
    /* 26 Sep: no links between motes (thin diagonal lines are not IAQ's line) */
    ctx.globalAlpha=1;
    if(running && !reduce){ looping=true; _raf(step); } else { looping=false; }
  }
  function boot(){
    if(!fit()){ _setTo(boot,180); return; }
    seed();
    if(reduce){ running=false; step(performance.now()); return; }
    if(window.IntersectionObserver){
      _io(function(es){es.forEach(function(en){running=en.isIntersecting; if(running&&!looping)_raf(step);});}).observe(cv);
    }
    _raf(step);
  }
  if(window.ResizeObserver){ _ro(function(){ if(fit()){ seed(); if(reduce||!looping) step(performance.now()); } }).observe(cv); }
  boot();
  window.__heroFx={count:function(){return parts.length;},layers:LAYERS};
})();

/* ---- hero video: fade in once the embed has loaded ---- */
/* Reveal a background YouTube loop ONLY once it actually reports PLAYING, so the player's
   loading spinner / centre play button / "unavailable" card is never visible. Until then the
   poster/gradient behind it shows. A short fallback covers browsers that swallow the API event. */
window.__revealOnPlay=function(iframe,wrap){
  if(!iframe||!wrap) return; var done=false,errored=false,timer,armed=false;
  function show(){ if(done||errored)return; done=true; wrap.classList.add('live'); if(timer)clearInterval(timer); }
  function hs(){ try{ iframe.contentWindow.postMessage(JSON.stringify({event:'listening',id:1,channel:'widget'}),'*'); }catch(e){} }
  onWin('message',function(e){
    if(e.source!==iframe.contentWindow||typeof e.data!=='string') return;
    /* if the player reports an error (e.g. 153 config error on file://, an ad-blocker, or a region/embed
       block) keep the poster fallback and NEVER fade the player in, so its error card is never shown */
    if(e.data.indexOf('onError')>-1){ errored=true; if(timer)clearInterval(timer); return; }
    if(e.data.indexOf('onStateChange')<0) return;
    try{ var d=JSON.parse(e.data);
      /* state 1 = playing: wait for YouTube's mobile control overlay (play/pause/next) to auto-dismiss before revealing */
      if(d.event==='onStateChange'&&d.info===1&&!armed){ armed=true; _setTo(show,2600); }
    }catch(_){}
  });
  timer=_setIv(hs,400); hs();
  _setTo(show,5200); /* fallback if the play event is swallowed; no-op if the player reported an error */
};
/* hero: a continuous reel of four clips. Two players cross-fade with a 1.1s overlap.
   Three things make the handover invisible:
     - the incoming player is raised above the outgoing one, so the fade works in BOTH directions
     - the outgoing clip stops looping the moment the fade starts, so it can never jump back to 0
       mid-dissolve
     - the incoming clip is preloaded, rewound and already playing before it is revealed */
(function(){
  var wrap=document.querySelector('.hero-video'); if(!wrap) return;
  var vids=[document.getElementById('hv0'),document.getElementById('hv1')];
  if(!vids[0]||!vids[1]||reduce) return;
  /* 25 Sep (IAQ's 24 Sep review: "This AI video is still wrong ... Better not to use other video that does not involve
     construction and installation as ai cannot accurately deliver the process"; Bazil: "for the video please fix"): the
     reel is IAQ's OWN photographs now, each an 8 s slow move rendered by ffmpeg (tools: scratchpad make.sh recipe in
     HANDOVER): the IFKM site from the air mid-build, a cleanroom fit-out (P1010229), a panel install with the ladders
     still in (WhatsApp 2024-12-04), and the Kuching plant at dusk. No generated footage. Sources in
     public/assets/iaq/SOURCES.md. The four generated clips stay on disk for the superseded Web 2 pages only. */
  /* 25 Sep, later (Bazil: "can the pictures be changed to videos instead", "keep the city video and also the stadium
     video"): the photograph moves are off the reel. It runs footage now: the stadium build at dusk and the KL skyline
     (the two he named), then the facility exteriors and plant that show no process (the client's 24 Sep line was
     against generated CONSTRUCTION AND INSTALLATION footage, since AI gets the process wrong). No people at work in
     any clip. The photograph clips stay on disk. Poster is the stadium's first frame (assets/hero-plant-poster.webp). */
  /* 25 Sep, 04:50: the reel was put back on generated and stock clips by another session at 03:41 (hero-plant, hero-kl,
     the campus, the market clips). IAQ's 24 Sep rule stands ("Better not to use other video that does not involve
     construction and installation as ai cannot accurately deliver the process"): IAQ's own photographs only, each an
     8 s slow move: the IFKM site from the air, a cleanroom fit-out, a panel install, the plant at dusk (two angles), the
     Shah Alam headquarters from the air. Sources in public/assets/iaq/SOURCES.md. */
  /* 26 Sep (Bazil: "turn the static images into videos instead", "remove the office picture", "there should be the video
     of the stadium and the KL here"): the reel is the two clips he named, the stadium build at dusk and the KL skyline.
     The photograph moves (site aerial, cleanroom fit-out, panels, the plant at dusk, the headquarters from the air) are
     off the reel and stay on disk. The client's 24 Sep line (no generated construction-and-installation footage) is on
     record; this is Bazil's call. */
  /* ======================================================================================================
     LOCKED BY BAZIL, 26 Sep 2026. The hero reel is the stadium (hero-plant.mp4) and the KL skyline (hero-kl.mp4).
     It was flipped three times on 25 Sep by different sessions (photo moves, generated clips, photo moves again) and
     he wrote: "why do we keep changing back to this stupid thing". Do NOT change SRC without his word in the same
     session. If the client's no-generated-footage line comes up again, raise it with him; do not act on it here.
     ====================================================================================================== */
  /* 25 Sep, 06:00 (Bazil, seeing only the KL clip: "where are the other videos here I asked you to make, make sure HD"):
     the two clips he kept in the other session stay, and the IAQ-photograph clips run between them, all 1920x1080:
     the IFKM site from the air (re-encoded crf 22), a cleanroom fit-out, the plant at dusk (two angles), the HQ from
     the air. The 1080px panel-install clip is left out as the one soft source. */
  /* 25 Sep, 07:20 (Bazil: "what other videos can you make in the library the client gave"): the one real moving-camera
     video in IAQ's share is the Hasegawa walkthrough (an architectural render of their own project, 90 s, MPEG-4 part 2):
     a 10 s approach to the fab is cut from it as hero-hasegawa-walk.mp4 (H.264, 1080p) and runs second in the reel. */
  /* 26 Sep, 12:xx, Bazil in THIS session, seeing two clips: "where are the other videos I requested?": the six-clip reel he
     asked for on 25 Sep in this session (stadium, KL, then the campus at dusk and the data centre, district cooling and
     photovoltaic clips; nobody at work in any of them; the Hasegawa walkthrough never). The lock above stands for any
     session that has not got his word. */
  /* 25 Sep, 16:50 (Bazil: "why are our videos very low quality"): the shipped copies were 720p under 1 Mbps and the three market
     clips portrait 720x1280 cropped into the landscape banner (a 2.7x stretch). Now 1080p from the masters in
     _backups/videos-orig-0910 (KL, stadium) and legacy-static (campus), and landscape 1080p hero cuts of the market clips
     (hero-mkt-*.mp4, cleaned and upscaled from the sharper originals); the portrait mkt-*.mp4 stay for the market cards. */
  /* 25 Sep, evening, Bazil in THIS session ("I haven't seen the 2 video set, the people and the cleanrooms 2 ... also the
     banner, it's not shown, please use Higgsfield"): the reel adds, after the stadium and KL, the cleanroom corridor, the
     hook-up team and the cleanroom bay. The two rooms are Higgsfield (Seedance 2.5) walks made from IAQ's own photographs
     IMG_8588 and IMG_8589; the team is a generated representation. The lock above now reads: these nine, on his word. */
  var SRC=['/assets/videos/hero-plant.mp4','/assets/videos/hero-mkt-district-cooling.mp4','/assets/videos/hero-kl.mp4','/assets/videos/hero-site-lift-hf.mp4','/assets/videos/hookup-team-rep.mp4','/assets/videos/cr-bay-hf.mp4','/assets/hero-campus-dusk.mp4','/assets/videos/hero-mkt-data-centre.mp4','/assets/videos/cr-corridor-hf.mp4'];   /* 26 Sep, 13:35 (Bazil, on the montage: "remove the last slide the static image"): the three-photograph montage hero-site-team.mp4 is off the reel; the file stays on disk and in the client set. Nine scenes. */   /* 26 Sep, 12:55 (Bazil, on the crane scene: "remove this", "video"): the crane clip is off the reel; the file stays on disk and in the client set. */   /* 26 Sep, 12:20 (Bazil: "second last and last please shuffle at best place"): the crane and the lift move to 4 and 5, after Kuala Lumpur and before the tool hook-up, so the run reads site, working at height, hook-up, cleanroom bay: construction to installation to the result. His slots 1 to 3 stay as he set them; the montage stays last. */   /* 26 Sep, 12:05 (Bazil: "turn the best 2 picture u choosen into videos for the banner for iaq to add more", "u can use higgsfield"): scenes ten and eleven, the crane and the scissor lift, each IAQ's own site photograph (IMG_9181, IMG_9445) as the start frame of a Seedance 2.5 image-to-video, 8 s, 1080p; the motion is generated, the site and the people are IAQ's. */   /* 26 Sep, midday (Bazil, on IAQ's 71 site photographs, Website 2027/Site Photos: "create a video of these one for the banner"): a ninth scene, On site, rendered from three of those photographs (the crane, the scissor lift, the finished cleanroom), one slow push each, joined by dissolves; the eight locked clips and their order are untouched, the new one is last. Recipe in the SOURCES log. */   /* 26 Sep (Bazil, on the scene bar: "switch slide 2 and 3 place", "then 2 and 8 place"): the same eight clips, reordered on his word: stadium, district cooling, KL, tool hook-up, cleanroom bay, campus at dusk, data centre, cleanroom corridor */   /* 26 Sep (Bazil: "you can take out the solar video", "store it at the client files"): eight clips; the photovoltaic clip is kept in the Client files video set */   /* Six clips on Bazil's word in the 3D session, 25 Sep ("where are the other videos I requested?"): stadium, KL, then the campus at dusk and the data centre, district cooling and photovoltaic clips. Never the Hasegawa walkthrough, never the photograph moves or the HQ aerial. Change only on his word in the same session. */   /* 25 Sep, 07:10 (Bazil, on the HQ building: "this visual remove") */
  var HOLD=6.6, FADE=1100;                 /* default hold; each clip hands over before ITS OWN loop point, see holdFor() */
  /* 25 Sep, evening (Bazil: "should have like a small scene bar of clean room or etc"): a filmstrip of the reel, bottom
     right above the markets. Each scene is its own thumbnail and name (thumbs cut from the clips themselves); the one
     playing is lit and fills as it plays; a click jumps to that scene. Names say what each clip shows. */
  /* 25 Sep, night (Bazil: "should not be thumbnails, instead bars and name, put it in the left corner"): one thin bar per
     scene, the playing one filling red, with its name above; bottom left over the markets. Names keyed by file, so the reel
     can lose or gain a clip without the names shifting. */
  var NAMES={'hero-plant':'Stadium build','hero-kl':'Kuala Lumpur','cr-corridor-hf':'Cleanroom corridor','hookup-team-rep':'Tool hook-up','cr-bay-hf':'Cleanroom bay','hero-campus-dusk':'Production campus','hero-mkt-data-centre':'Data centre','hero-mkt-district-cooling':'District cooling','hero-mkt-photovoltaic':'Solar','hero-site-team':'On site','hero-site-crane-hf':'Site crane','hero-site-lift-hf':'Working at height'};
  var SCENES=SRC.map(function(u){ var k=u.split('/').pop().replace(/\.mp4$/,''); return NAMES[k]||''; });
  var cells=[], hero=wrap.closest('.hero'), bar=null, nowEl=null;
  if(hero){
    bar=document.createElement('div'); bar.className='hero-scenes'; bar.setAttribute('role','group'); bar.setAttribute('aria-label','Scenes in the banner');
    nowEl=document.createElement('p'); nowEl.className='hs-now'; bar.appendChild(nowEl);
    var strip=document.createElement('div'); strip.className='hs-strip'; bar.appendChild(strip);
    SRC.forEach(function(src,i){
      var n=src.split('/').pop().replace(/\.mp4$/,''), b=document.createElement('button');
      b.type='button'; b.className='hs-c'; b.setAttribute('aria-label',SCENES[i]||('Scene '+(i+1))); b.title=SCENES[i]||'';
      b.innerHTML='<i><b></b></i>';
      b.addEventListener('click',function(){ jump(i); });
      b.addEventListener('mousedown',function(e){ e.preventDefault(); });   /* 26 Sep (Bazil: "remove this static look", the white box on the clicked cell): a pointer click never leaves focus on the cell; keyboard focus still lands and shows as a brighter track (home.css) */
      strip.appendChild(b); cells.push(b);
    });
    hero.appendChild(bar);
    /* bottom left, just over the market rail and in line with the copy; if that would touch the button, it sits beside it */
    var place=function(){ var mk=hero.querySelector('.hero-mkts'), cta=hero.querySelector('.hero-ctas'), inner=hero.querySelector('.hero-inner'); if(!mk) return;
      var zf=parseFloat(getComputedStyle(document.documentElement).zoom)||1, hb=hero.getBoundingClientRect(), mb=mk.getBoundingClientRect(), bh=bar.getBoundingClientRect().height||34;
      var al=hero.querySelector('.hero-inner h1')||cta||inner||mk, left=(al.getBoundingClientRect().left-hb.left)/zf, bottom=(hb.bottom-mb.top)/zf+16;
      var cb=cta&&cta.getBoundingClientRect(), topPx=mb.top-16*zf-bh;
      if(cb&&topPx<cb.bottom+10*zf){ left=(cb.right-hb.left)/zf+32; bottom=(hb.bottom-cb.bottom)/zf+Math.max(0,(cb.height/zf-bh/zf)/2); }
      bar.style.left=Math.round(left)+'px'; bar.style.right='auto'; bar.style.bottom=Math.round(Math.max(16,bottom))+'px'; };
    place(); _setTo(place,600); _setTo(place,2000); window.addEventListener('resize',place); _cleanups.push(function(){ window.removeEventListener('resize',place); if(bar&&bar.parentNode) bar.parentNode.removeChild(bar); });
  }
  function mark(){
    cells.forEach(function(c,i){ c.classList.toggle('on',i===idx); c.setAttribute('aria-current',i===idx?'true':'false'); });
    if(nowEl) nowEl.textContent=SCENES[idx]||'';
    var c=cells[idx]; if(!c) return; var f=c.querySelector('i b'); if(!f) return;
    f.style.transition='none'; f.style.transform='scaleX(0)'; void f.offsetWidth;
    f.style.transition='transform '+(holdFor(vids[cur])+FADE/1000).toFixed(2)+'s linear'; f.style.transform='scaleX(1)';
  }
  /* a click while a clip is still changing is kept and played the moment the change lands, never dropped */
  var pend=-1;
  function jump(i){ if(dead) return; if(swapping){ pend=i; cells.forEach(function(c,k){ c.classList.toggle('on',k===i); }); return; } if(i===idx) return; clearTimeout(timer); idx=(i-1+SRC.length)%SRC.length; handover(); }
  /* 26 Sep, 12:30 (Bazil, on the tool hook-up scene: "some videos can be shorter like this one"): per-scene holds in
     seconds, keyed by file name. A scene not listed holds to its own loop point as before. */
  var HOLDS={'hookup-team-rep':4.0,'hero-site-lift-hf':5.5};   /* the lift's hand-over completes by 6 s, so 5.5 plus the dissolve shows it whole */
  function holdFor(v){ var d=v&&v.duration; var k=((v&&v.getAttribute('src'))||'').split('/').pop().replace(/\.mp4$/,'');
    if(HOLDS[k]) return HOLDS[k];
    return (isFinite(d)&&d>2)?Math.max(3.4,d-FADE/1000-0.25):HOLD; }
  var cur=0,idx=0,dead=false,swapping=false,timer=null,guard=null;
  function tryPlay(v){ var p=v.play(); if(p&&p.catch)p.catch(function(){
    _setTo(function(){var q=v.play(); if(q&&q.catch)q.catch(function(){});},400); }); }
  vids.forEach(function(v,slot){
    v.muted=true; v.setAttribute('muted',''); v.playsInline=true; v.loop=true; v.preload='auto';
    v.style.zIndex=slot;
    v.addEventListener('error',function(){ if(v===vids[cur]){ dead=true; wrap.classList.remove('live');
      vids.forEach(function(x){x.classList.remove('on');}); } });
    v.addEventListener('stalled',function(){ if(v===vids[cur]&&!dead)tryPlay(v); });
    v.addEventListener('waiting',function(){ if(v===vids[cur]&&!dead)tryPlay(v); });
    v.addEventListener('pause',function(){ if(v===vids[cur]&&!dead&&!swapping)tryPlay(v); });
  });
  function reveal(nxt,out){
    /* the incoming clip goes on top, so a fade-in always reads as a dissolve */
    nxt.style.zIndex=2; out.style.zIndex=1;
    out.loop=false;                         /* never let the outgoing clip restart mid-fade */
    try{ nxt.currentTime=0; }catch(e){}
    tryPlay(nxt);
    nxt.classList.add('on');
    /* 26 Sep: the scene's name and bar change halfway through the dissolve, when the new clip is the one you see (the fill
       starts in mark, once the dissolve lands) */
    var ni=idx; _setTo(function(){ if(dead) return; cells.forEach(function(c,i){ c.classList.toggle('on',i===ni); }); if(nowEl) nowEl.textContent=SCENES[ni]||''; },FADE*0.5);
    _setTo(function(){
      out.classList.remove('on'); out.pause(); out.loop=true;
      cur=(vids[0]===nxt)?0:1; swapping=false; queueNext(); mark();
      if(pend>=0){ var pj=pend; pend=-1; jump(pj); }
    },FADE);
  }
  function handover(){
    if(dead||swapping) return;
    swapping=true;
    var out=vids[cur], nxt=vids[1-cur];
    idx=(idx+1)%SRC.length;
    clearTimeout(guard);
    var fired=false;
    var go=function(){
      if(fired)return; fired=true;
      nxt.removeEventListener('canplay',go); clearTimeout(guard);
      if(dead){swapping=false;return;}
      reveal(nxt,out);
    };
    var ready=nxt.getAttribute('src')&&nxt.getAttribute('src').indexOf(SRC[idx])>=0&&nxt.readyState>=3;
    if(ready){ go(); }
    else {
      nxt.addEventListener('canplay',go);
      nxt.src=SRC[idx]; nxt.load();
      /* if the file is slow, keep the current clip running and try again shortly */
      guard=_setTo(function(){
        if(fired)return;
        nxt.removeEventListener('canplay',go);
        swapping=false; vids[cur].loop=true; tryPlay(vids[cur]);
        clearTimeout(timer); timer=_setTo(handover,2000);
        if(pend>=0){ var pj2=pend; pend=-1; _setTo(function(){ jump(pj2); },50); }
      },4000);
    }
  }
  function queueNext(){
    clearTimeout(timer);
    var nxt=vids[1-cur], want=SRC[(idx+1)%SRC.length];
    if(!nxt.getAttribute('src')||nxt.getAttribute('src').indexOf(want)<0){ nxt.src=want; nxt.load(); }
    timer=_setTo(handover,holdFor(vids[cur])*1000);
  }
  vids[0].addEventListener('canplay',function once(){
    vids[0].removeEventListener('canplay',once);
    if(dead)return;
    vids[0].style.zIndex=2; vids[1].style.zIndex=1;
    wrap.classList.add('live'); vids[0].classList.add('on'); tryPlay(vids[0]); queueNext(); _setTo(mark,50);
  });
  onDoc('visibilitychange',function(){ if(!document.hidden&&!dead)tryPlay(vids[cur]); });
  vids[0].src=SRC[0]; vids[0].load();
})();


/* ---- 3D dot world: real continents, alive, faced on SEA ---- */
(function(){
  var host=document.getElementById('globeHost'); if(!host) return;
  var canvas=document.getElementById('globeCv'); if(!canvas) return;
  /* 22 Sep: a re-run of this scene on the same page (a hot reload, a re-mount on the same markup) left the last run's
     chips frozen over the live ones. Start from a clean host. */
  host.querySelectorAll('.globe-tag,.globe-flat').forEach(function(el){ el.parentNode.removeChild(el); });
  /* 26 Sep: every run starts on a fresh canvas (a torn-down run force-drops its context, and a canvas whose context was
     dropped cannot give a new one), and any other canvas a torn-down run left behind is removed */
  (function(){ var f0=document.createElement('canvas'); f0.id=canvas.id; f0.className=canvas.className; if(canvas.getAttribute('style')) f0.setAttribute('style',canvas.getAttribute('style')); canvas.parentNode.replaceChild(f0,canvas); canvas=f0; })();
  host.querySelectorAll('canvas').forEach(function(c){ if(c!==canvas && c.parentNode) c.parentNode.removeChild(c); });
  var wired=false, rebuilds=0;   /* see the context-loss block at the foot of this scene */
  var LAND='ffffffffffffffffffffffffffffffffffffffffffffffff|000000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000001|8000000000000000003f8000000000000000000000000001|800000000000ffc1fffff000000000000000000000000001|8000000000001f1ffffff800009000000000000000000001|0000000040007c1ffffffc00000000000000070000000001|80000000090198003ffffc00000000008007fff0007c0001|80000003e00000003ffff800000000040ffffffff87f8001|800e000037067f8007ffd0000000000c1ffffffffffffc01|80ffffff3fcb19f017ffc000007fc007ffffffffffffffff|e0fffffff7dff0780ffc000001fffdffffffffffffffffff|98fffffffffff0780fc00f0003ffffffffffffffffffffff|80ffffffffff003807c006000fffffffffffffffffffffff|80fffffffffe01c0038000001fdffffffffffffffffffff8|80ff93fffffc01e0000000001fdfffffffffffffffffc701|000e00fffffe01fe000000060f9fffffffffffffffe01e01|0010007fffffc1ff000000060f1fffffffffffffff803c00|8000001ffffffbffc000001f0fffffffffffffffffc03801|8000000fffffffffc000001ffffffffffffffffffff01001|8000000fffffffff60000003fffffffffffffffffff00001|00000003ffffbffc70000003ffffffffffffffffffd00001|80000003ffffdffc10000001ffffffffffffffffffd00001|80000003fffff7fe00000001feff3fffffffffffff900001|80000003ffffffe00000001fc37e03cffffffffffc100001|80000003ffffffc00000001f80bfffcffffffffff8200001|80000003ffffff800000001f0013ffcffffffffff0200001|80000001ffffff000000001e7901ffffffffffffb8600001|80000000ffffff0000000007fc001fffffffffff13c00001|800000003ffffc000000000ffc003fffffffffff86000001|800000003ffff8000000001fff3c3fffffffffff80000001|800000000fff98000000003fffffffffffffffff80000001|800000001ff80c000000007fffffdfcfffffffff00000001|8000000003f80400000000ffffffcfe1fffffffe00000001|8000000001f00000000001ffffffeffe0ffffffe80000001|8000000000f04e00000001fffffff7fe07fffff000000001|8000000000f8c020000001fffffff7fe03fc7f2000000001|80000000007fc048000001fffffff3fc03f83f0080000001|80000000001fc000000001fffffffbf001e03f8180000001|800000000001f000000001ffffffffc001e00fc080000001|8000000000003000000001fffffffe0000c00bc040000001|80000000000030f3000000fffffffee000c0098040000001|8000000000001fff8000007fffffffe00060080060000001|80000000000001ffc000003fffffffc00020040060000001|80000000000001fff80000181fffffc00000160e00000001|80000000000001fffc00000007ffff8000000e1e00000001|80000000000003fffe00000007ffff0000000e3e00000001|80000000000007ffff00000007fffe000000073d82000001|80000000000007ffffe0000007fffc00000007bd8be00001|80000000000007fffff0000003fff8000000010100f80001|80000000000007fffffc000003fff80000000050007d0001|80000000000003fffffc000001fff8000000000020360001|80000000000001fffff8000001fffc000000000000010001|80000000000001fffff0000001fffc000000000007100000|80000000000000ffffe0000003fffc60000000001f100001|800000000000007fffe0000003fff8e0000000003f980001|800000000000003fffe0000003fff1c0000000007ffc0002|000000000000001fffe0000001ffe1c000000000fffe0000|000000000000001fffc0000001ffe1c000000007fffe0000|800000000000001fff00000001ffe1800000000fffff0001|800000000000003ffc00000000ffc0000000000fffff8001|800000000000003ffc00000000ffc0000000000fffff8001|800000000000003ffc000000007f800000000007ffff8001|000000000000003ff8000000007f000000000007ffff8001|800000000000003ff0000000003e000000000007c1ff0001|800000000000003fe00000000000000000000002007f0000|800000000000007fc00000000000000000000000003e0004|800000000000007f0000000000000000000000000000000c|800000000000007e00000000000000000000000000000014|800000000000007c00000000000000000000000000040031|800000000000007800000000000000000000000000000061|80000000000000f800000000000000000000000000000001|80000000000000f800000000000000000000000000000001|80000000000000f000000000000000000000000000000000|800000000000007000000000000000000000000000000001|800000000000003800000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000001|800000000000000100000000000000000000000000000000|8000000000000007000000000000001c00001f9c7fc00001|800000000000000f000000000000e3fffe7ffffffffff001|800000000000007f0000001fffffffffffffffffffffff81|80000000003c007f000001ffffffffffffffffffffffff81|8000312ffc7fffff00001ffffffffffffffffffffffffe01|800dfffffffffffff000fffffffffffffffffffffffffe41|f03fffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff'.split('|');
  var GW=192,GH=96,R=1.62;
  /* 21 Sep: Germany and India moved onto the cities the Contact registry names (Dresden, Ahmedabad);
     they sat on Frankfurt and Bangalore, which IAQ has never listed. */
  var OFFICES=[[3.1,101.7],[1.35,103.82],[51.05,13.74],[23.03,72.58],[59.33,18.07],[33.45,-112.07],[53.35,-6.26]]; /* Ireland added 10 Sep 2026 */
  /* the tour runs the short way round the world: east to west, then one swing home */
  var TOUR=[0,1,3,2,4,6,5];
  var NAMES=['Malaysia','Singapore','Germany','India','Sweden','USA','Ireland'];
  var FLAGS=['🇲🇾','🇸🇬','🇩🇪','🇮🇳','🇸🇪','🇺🇸','🇮🇪'];
  var HOME_X=10*Math.PI/180, HOME_Y=-Math.PI/2-100*Math.PI/180;
  function bit(y,x){ return (parseInt(LAND[y].charAt(x>>2),16)>>(3-(x&3)))&1; }
  function ll(lat,lon,r){var la=lat*Math.PI/180,lo=lon*Math.PI/180;
    return [r*Math.cos(la)*Math.cos(lo), r*Math.sin(la), -r*Math.cos(la)*Math.sin(lo)];}
  var THREE,scene,camera,renderer,group,raf=null,vis=false,io=null;
  var landMat,oceanMat,markerMat,haloMat,travelers=[],travPts,travGeo;
  var rx=HOME_X,ry=HOME_Y,rotXt=HOME_X,rotYt=HOME_Y,dragging=false,lx=0,ly=0;
  /* once the visitor has turned the globe it is THEIRS. Before that it drifts home; after,
     it keeps whatever orientation they left it at and carries their flick as momentum. */
  var turned=false,velY=0,velX=0;
  /* 21 Sep (Bazil: "a much more better world thats premium awesome and interactive ... go all out").
     sel is the office in focus, holdUntil keeps the idle spin off it while it is being read, and the
     tour walks the seven offices until the visitor touches the globe, after which it is theirs. */
  var sel=-1,holdUntil=0,touring=true,tourAt=0,tourK=0,selRing=null;
  var idleY=0,lastT=0,tags=[],tagPos=[],tagV=null,tagN=null,camDir=null;
  function dotMat(size,near,far,alNear,alFar,shimmer){
    return new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:THREE.NormalBlending,
      uniforms:{uSize:{value:size},uDpr:{value:Math.min(window.devicePixelRatio||1,1.75)},uT:{value:0}},
      vertexShader:'uniform float uSize; uniform float uDpr; attribute float aH; varying float vD; varying float vH; varying float vL; varying float vF; varying vec3 vP;'+
        'void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); vD=-mv.z; vH=aH; vP=position;'+
        ' vec3 nv=normalize(normalMatrix*normalize(position)); vF=nv.z;'+
        ' vL=clamp(dot(nv,normalize(vec3(-0.5,0.6,0.62))),0.0,1.0);'+
        ' gl_Position=projectionMatrix*mv; gl_PointSize=uSize*uDpr*(15.0/max(0.5,-mv.z)); }',
      fragmentShader:'precision mediump float; uniform float uT; varying float vD; varying float vH; varying float vL; varying float vF; varying vec3 vP;'+
        'void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5)discard;'+
        ' float al=smoothstep(0.5,0.26,d); float f=clamp((vD-2.7)/3.3,0.0,1.0);'+
        ' vec3 col=mix(vec3('+near+'),vec3('+far+'),f);'+
        ' col=mix(col*0.8,col,0.3+0.7*vL);'+
        /* 24 Sep (Bazil: "can the pixels animate subtly"): 'sweep' is the land's motion, a slow band of light crossing the
           continents by longitude once every ~12 s, over a faint per-dot twinkle, so the world breathes without a flicker */
        ' float tw='+(shimmer==='wave'?'(0.55+0.45*(0.5+0.5*sin(uT*0.9+vP.y*7.0+vP.x*4.0+vH*1.2)))*(0.72+0.28*sin(uT*1.6-vP.z*9.0+vH*6.2832))':shimmer==='sweep'?'(0.86+0.14*sin(uT*1.1+vH*6.2832))*(0.84+0.16*(0.5+0.5*sin(uT*0.5-atan(vP.z,vP.x)*2.0+vP.y*1.5)))':shimmer?'0.9+0.1*sin(uT*1.4+vH*6.2832)':'1.0')+';'+
        ' al*=mix('+alNear+','+alFar+',f)*tw*(0.55+0.45*vL)*smoothstep(-0.08,0.14,vF); gl_FragColor=vec4(col,al); }'});
  }
  function mkCloud(arr,hs,mat){
    var g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(arr),3));
    g.setAttribute('aH',new THREE.BufferAttribute(new Float32Array(hs),1));
    return new THREE.Points(g,mat);
  }
  function init(T){
    THREE=T; if(THREE.ColorManagement) THREE.ColorManagement.enabled=false;
    scene=new THREE.Scene(); group=new THREE.Group(); scene.add(group);
    /* 17 Sep (Bazil: "reduce size of world by 15%", then "reduce just a bit the spacing"): the
       camera stays where it was and the 15% is taken off the BOX instead (.globe-host in home.css).
       Standing the camera back shrank the world inside a box that kept its old height, so the
       section went on reserving that room and the white around the globe grew. Shrinking the box
       takes the world and its dead margin down together. */
    /* 21 Sep: 4.05 to 4.5. The planet now has an atmosphere, and at 4.05 it filled 94% of its box, so
       the glow ran into the canvas edge and showed the box as a square. At 4.5 it fills 83% and the
       light falls to nothing inside the frame; the box itself grew (640px) so the world did not shrink. */
    camera=new THREE.PerspectiveCamera(50,1,0.1,100); camera.position.z=4.25;   /* 21 Sep third cut: no atmosphere to leave room for */
    renderer=_reg(new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true}));
    renderer.setClearColor(0x000000,0); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));/* match peers; a dot cloud gains nothing from 2x on a DPR-3 phone */
    var landPts=[],landH=[],oceanPts=[],oceanH=[],y,x;
    for(y=1;y<GH;y++)for(x=1;x<GW-1;x++){
      var lat=90-((y+0.5)/GH)*180, lon=((x+0.5)/GW)*360-180;
      var w=Math.cos(lat*Math.PI/180); /* equal-area thinning, kills polar clumps */
      if(bit(y,x)){
        for(var rep=0;rep<7;rep++){
          if(Math.random()>(w+0.04)*0.9) continue;
          var p=ll(lat+(Math.random()-0.5)*1.7, lon+(Math.random()-0.5)*1.7, R);
          landPts.push(p[0],p[1],p[2]); landH.push(Math.random());
        }
      } else if(Math.random()<(w+0.03)*0.92){
        /* 23 Sep (Bazil: "make the sea into dots as well, find a way that makes it look good").
           The ocean was gated to one cell in five ((x*5+y*11)%5), which on a 192x96 grid left the
           water reading as empty white and the planet as a pair of floating continents. Every water
           cell now carries a point, on the same equal-area weight the land uses so the poles do not
           clump. What keeps the land readable is not density alone: the sea sits a shade further in
           (R*0.992), is drawn FINER and paler, and its jitter is tighter, so the coastline stays an
           edge between two grains rather than one grain at two opacities. */
        var q=ll(lat+(Math.random()-0.5)*1.25, lon+(Math.random()-0.5)*1.25, R*0.992);
        oceanPts.push(q[0],q[1],q[2]); oceanH.push(Math.random());
      }
    }
    /* 2 Sep (client: "visibility"): the ocean cloud sat at 0.06 alpha and the land at 0.38, so
       the sphere read as a faint smudge on white. Both are lifted, and the near/far alpha spread
       is WIDENED rather than flattened: the front of the globe is now clearly denser than the
       back, which is what sells it as a sphere instead of a disc. */
    /* 21 Sep, third cut (Bazil, on the dark planet: "one before was better but needs refinement",
       "maybe particles are more refined"). The body, the fresnel limb and the atmosphere are gone and
       the world is a cloud of particles on the light ground again. What changed from the old one is
       the grain: nearly twice the land particles at two thirds the size, with less jitter, so the
       coastlines draw as edges instead of as a scatter; ink-blue nearest the eye falling to a pale
       grey at the limb, so the sphere reads by depth alone; and an ocean of very fine dust that is
       only there to close the silhouette. */
    /* 22 Sep (Bazil: "reduce grey darkness"): the near dots were almost navy (0.09,0.13,0.26 at 0.94); a mid
       slate now, so the world reads light on the grey ground and the red offices stay the strongest thing on it */
    /* 24 Sep (Bazil: "even more premium without being messy"): land and sea were one weight and one tone, so the
       planet read as a single grain. Land is heavier and a shade darker, sea finer and lighter, so the continents
       read as shapes on water and nothing else changes. */
    landMat=dotMat(0.58,'0.10,0.13,0.22','0.50,0.56,0.68','0.95','0.06','sweep');   /* 25 Sep (Bazil: "dots might need to be darker"): land in ink, the far side a mid grey-blue */
    /* 24 Sep (Bazil: "make the dots look more like water, can't see anything much"): bluer, 0.4 size, stronger, and
       shimmer 'wave' runs slow swells across the sea by latitude and longitude, so it moves as one surface */
    oceanMat=dotMat(0.5,'0.28,0.42,0.76','0.58,0.68,0.86','0.88','0.12','wave');   /* 25 Sep: a step deeper with the land, still the paler of the two */   /* 24 Sep (Bazil: "the ocean dots are hard to see"): larger, deeper blue, more opaque; still paler than the land */   /* 23 Sep: finer (0.34 to 0.26) and paler than the land, but on every water cell */
    group.add(mkCloud(landPts,landH,landMat));
    group.add(mkCloud(oceanPts,oceanH,oceanMat));
    /* markers + halo */
    var mp=[],mh=[];
    OFFICES.forEach(function(of){var p=ll(of[0],of[1],R*1.02); mp.push(p[0],p[1],p[2]); mh.push(Math.random());});
    markerMat=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:THREE.NormalBlending,
      uniforms:{uDpr:{value:Math.min(window.devicePixelRatio||1,1.75)},uTv:{value:0}},
      vertexShader:'uniform float uDpr; uniform float uTv; attribute float aH; varying float vD; varying float vF;'+
        'void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); vD=-mv.z;'+
        ' vF=normalize(normalMatrix*normalize(position)).z;'+
        ' float pulse=1.0+0.15*sin(uTv*1.9+aH*6.2832);'+
        ' gl_Position=projectionMatrix*mv; gl_PointSize=3.8*pulse*uDpr*(15.0/max(0.5,-mv.z)); }',
      fragmentShader:'precision mediump float; varying float vD; varying float vF;'+
        'void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5)discard;'+
        ' float al=smoothstep(0.5,0.16,d); float f=clamp((vD-2.7)/3.3,0.0,1.0);'+
        ' al*=mix(1.0,0.05,f)*smoothstep(0.02,0.2,vF); gl_FragColor=vec4(0.925,0.125,0.153,al); }'});
    haloMat=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:THREE.NormalBlending,
      uniforms:{uDpr:{value:Math.min(window.devicePixelRatio||1,1.75)},uTv:{value:0}},
      vertexShader:'uniform float uDpr; uniform float uTv; attribute float aH; varying float vD; varying float vP; varying float vF;'+
        'void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); vD=-mv.z;'+
        ' vF=normalize(normalMatrix*normalize(position)).z;'+
        ' vP=fract(uTv*0.5+aH);'+
        ' gl_Position=projectionMatrix*mv; gl_PointSize=(4.0+vP*6.0)*uDpr*(15.0/max(0.5,-mv.z)); }',
      fragmentShader:'precision mediump float; varying float vD; varying float vP; varying float vF;'+
        'void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5)discard;'+
        ' float ring=smoothstep(0.5,0.42,d)-smoothstep(0.36,0.20,d); if(ring<=0.0)discard;'+
        ' float f=clamp((vD-2.7)/3.3,0.0,1.0);'+
        ' float al=ring*(1.0-vP)*0.28*mix(1.0,0.05,f)*smoothstep(0.02,0.2,vF); gl_FragColor=vec4(0.925,0.125,0.153,al); }'});
    group.add(mkCloud(mp,mh,markerMat));
    /* 22 Sep (Bazil: "no need the blinking circle"): the pulsing halo rings and the breathing focus ring are gone */
    /* country chips: flag + name, tracked to markers each frame */
    tagV=new THREE.Vector3(); tagN=new THREE.Vector3(); camDir=new THREE.Vector3();
    OFFICES.forEach(function(of,oi){
      var el=document.createElement('div');
      el.className='globe-tag'+(oi===0?' hq':'');
      el.innerHTML='<span class="fl">'+FLAGS[oi]+'</span>'+NAMES[oi]+(oi===0?' &middot; HQ':'');
      /* 21 Sep: a tag is a control now. Picking one turns the world to that office. */
      el.setAttribute('role','button'); el.setAttribute('tabindex','0'); el.setAttribute('aria-label','Show the '+NAMES[oi]+' office');
      (function(k){ el.addEventListener('click',function(ev){ ev.stopPropagation(); focus(k); });
        el.addEventListener('keydown',function(ev){ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); focus(k); } }); })(oi);
      host.appendChild(el);
      var tp=ll(of[0],of[1],R*1.02);
      tags.push(el); tagPos.push(new THREE.Vector3(tp[0],tp[1],tp[2]));
    });
    /* arcs + travelling packets */
    var hq=ll(OFFICES[0][0],OFFICES[0][1],R*1.01);
    var hqv=new THREE.Vector3(hq[0],hq[1],hq[2]);
    for(var a=1;a<OFFICES.length;a++){
      var e=ll(OFFICES[a][0],OFFICES[a][1],R*1.01), ev=new THREE.Vector3(e[0],e[1],e[2]);
      var pts=[];
      for(var t=0;t<=48;t++){var f2=t/48;
        var v=new THREE.Vector3().copy(hqv).lerp(ev,f2).normalize()
          .multiplyScalar(R*(1.01+0.2*Math.sin(Math.PI*f2)*(hqv.angleTo(ev)/Math.PI+0.35)));
        pts.push(v);}
      var lg=new THREE.BufferGeometry().setFromPoints(pts);
      group.add(new THREE.Line(lg,new THREE.LineBasicMaterial({color:0xEC2027,transparent:true,opacity:0.4,depthTest:false})));
      /* 2 Sep (client: "lines and transferring"): one packet per route read as a stray dot.
         Three staggered packets make the direction of travel legible, and the phase is derived
         from the route index so the set never syncs into a single pulse. */
      for(var tv=0;tv<3;tv++) travelers.push({pts:pts,ph:(a*0.37+tv/3)%1,sp:0.13+((a+tv)%3)*0.02});
    }
    travPts=new Float32Array(travelers.length*3);
    travGeo=new THREE.BufferGeometry(); travGeo.setAttribute('position',new THREE.BufferAttribute(travPts,3));
    var travMat=new THREE.PointsMaterial({color:0xEC2027,size:3.4,sizeAttenuation:false,transparent:true,opacity:.95,depthTest:false});
    group.add(new THREE.Points(travGeo,travMat));

    resize();
    /* the pointer-down lives on the canvas, so it is bound to whichever canvas is current.
       Everything else is bound to the window or the host and is wired ONCE: a rebuild after a
       lost context must not leave two drag handlers turning the world twice as fast. */
    canvas.addEventListener('pointerdown',function(e){dragging=true;turned=true;touring=false;holdUntil=0;velY=0;velX=0;lx=e.clientX;ly=e.clientY;try{canvas.setPointerCapture(e.pointerId);}catch(_){}});
    canvas.addEventListener('webglcontextlost',onLost);
    if(!wired){
      wired=true;
      onWin('resize',resize);
      if(window.ResizeObserver){try{_ro(resize).observe(host);}catch(e){}}
      onWin('pointermove',function(e){if(!dragging)return;var dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;
        var sy=dx*0.005,sx=dy*0.004;
        rotYt+=sy;rotXt+=sx;if(rotXt>1.2)rotXt=1.2;if(rotXt<-1.2)rotXt=-1.2;
        /* smoothed, so one jittery sample cannot fling it */
        velY=velY*0.6+sy*0.4; velX=velX*0.6+sx*0.4;},{passive:true});
      onWin('pointerup',function(){dragging=false;});
      onWin('pointercancel',function(){dragging=false;});
      onWin('lostpointercapture',function(){dragging=false;});
    }
    group.rotation.x=rx; group.rotation.y=ry;
    step(0); renderer.render(scene,camera); tags2d();
    if(reduce) return;
    if(window.IntersectionObserver){ try{ if(!io) io=_io(function(es){ vis=es[0].isIntersecting;
      if(vis){ if(!raf) raf=_raf(frame); } else if(raf){ cancelAnimationFrame(raf); raf=null; } }); io.observe(host);
    }catch(e){ vis=true; raf=_raf(frame);} } else { vis=true; raf=_raf(frame); }
    if(vis && !raf) raf=_raf(frame);   /* a rebuild lands with the section already on screen */
  }
  function step(t){
    var tv=t/1000;
    if(landMat){landMat.uniforms.uT.value=tv; oceanMat.uniforms.uT.value=tv;}
    if(markerMat){markerMat.uniforms.uTv.value=tv; haloMat.uniforms.uTv.value=tv;}
    if(travGeo){ for(var i=0;i<travelers.length;i++){ var tr=travelers[i];
      var p=tr.pts[Math.floor(((tv*tr.sp+tr.ph)%1)*(tr.pts.length-1))];
      travPts[i*3]=p.x; travPts[i*3+1]=p.y; travPts[i*3+2]=p.z; }
      travGeo.attributes.position.needsUpdate=true; }
  }
  function tags2d(){
    if(!tags.length||!camera)return;
    var d=frameDims(), w=d.w, h=d.h;   /* canvas space: the tags' containing block is the section when the canvas is */
    group.updateMatrixWorld();
    camDir.copy(camera.position).sub(group.position).normalize();
    /* 22 Sep (Bazil: "show the name at the edge even if its in another area, the important part is
       people can see all the offices"). An office on the far side used to lose its chip. It keeps it
       now, parked on the limb in the direction the office lies, dimmed, so all seven countries can be
       read at every moment and any of them can be clicked to bring it round. The limb in pixels comes
       from the same perspective the camera uses: a sphere of radius R at distance d shows a
       silhouette of tan(asin(R/d)) / tan(fov/2) of the half height. */
    var c0=tagV.set(0,0,0).applyMatrix4(group.matrixWorld).project(camera);
    var cx=(c0.x*0.5+0.5)*w, cy=(-c0.y*0.5+0.5)*h;
    var limb=Math.tan(Math.asin(Math.min(.99,R/camera.position.z)))/Math.tan(camera.fov*Math.PI/360)*(h/2);
    var boxes=[];
    for(var i=0;i<tags.length;i++){
      var wp=tagV.copy(tagPos[i]).applyMatrix4(group.matrixWorld);
      var facing=tagN.copy(wp).sub(group.position).normalize().dot(camDir);
      wp.project(camera);
      var sx=(wp.x*0.5+0.5)*w, sy=(-wp.y*0.5+0.5)*h, vis=facing>0.12;
      if(!tags[i].__w){ tags[i].__w=tags[i].offsetWidth||96; tags[i].__h=tags[i].offsetHeight||24; }
      if(!vis){ var dx=sx-cx, dy=sy-cy, dl=Math.sqrt(dx*dx+dy*dy)||1; if(dl<4){ dx=0; dy=-1; dl=1; }
        sx=cx+dx/dl*(limb+6); sy=cy+dy/dl*(limb+6); }
      tags[i].style.opacity='1';
      tags[i].classList.toggle('far',!vis);
      /* a chip is held inside the globe's own box, so the page edge never cuts a name in half */
      var half=tags[i].__w/2; sx=Math.max(half-6,Math.min(w-half+6,sx));
      sy=Math.max(tags[i].__h*1.5,Math.min(h+tags[i].__h*0.4,sy));
      boxes.push({el:tags[i],sx:sx,sy:sy,vis:vis,w:tags[i].__w,h:tags[i].__h});
    }
    /* no-overlap pass over ALL chips now: ones that project onto each other stack downward with a
       gap, resolved top-to-bottom so chains settle into a tidy column */
    var vs=boxes.slice().sort(function(a,b){return a.sy-b.sy;});
    for(var a2=1;a2<vs.length;a2++){
      for(var b2=0;b2<a2;b2++){
        var A=vs[a2],B=vs[b2];
        if(Math.abs(A.sx-B.sx)<(A.w+B.w)/2+8 && A.sy-B.sy<B.h+6 && A.sy-B.sy>-(A.h+6)){
          A.sy=B.sy+B.h+6;
        }
      }
    }
    boxes.forEach(function(b){ b.el.style.transform='translate('+b.sx.toFixed(1)+'px,'+b.sy.toFixed(1)+'px) translate(-50%,-140%)'; });
    /* the focus ring belongs to the near side only: through a particle world it showed on the far
       side as a ring floating over open sea */
    if(selRing && sel>=0){ var sw=tagV.copy(tagPos[sel]).applyMatrix4(group.matrixWorld);
      selRing.visible=tagN.copy(sw).sub(group.position).normalize().dot(camDir)>0.1; }
  }
  /* 17 Sep: renderer is null for the moment between a lost context and the rebuilt scene, and the
     observer can restart this loop inside that window. Check it, or the frame throws. */
  function frame(ts){ raf=_raf(frame); if(!vis||!renderer)return;
    var t=ts||0;
    var dt=lastT?Math.min(0.05,(t-lastT)/1000):0; lastT=t;
    if(!dragging){
      if(turned){
        /* the visitor's orientation is kept. Their flick decays, then the same slow idle spin
           continues from where they stopped rather than snapping back to a house angle: a globe
           that undoes your drag reads as broken, not as designed. */
        rotYt+=velY; rotXt+=velX;
        velY*=0.94; velX*=0.90;
        if(velY<0.00004&&velY>-0.00004)velY=0;
        if(velX<0.00004&&velX>-0.00004)velX=0;
        if(rotXt>1.2)rotXt=1.2; if(rotXt<-1.2)rotXt=-1.2;
        /* 22 Sep (Bazil: "why not moving"): the tour held the world dead still for 5.6 s on each office; it drifts now */
        if(!velY&&!velX) rotYt+=dt*(t>holdUntil?0.04:0.014);
      } else { /* alive, until it is touched: slow idle spin + breathe */
        idleY+=dt*0.04;
        rotXt+=((HOME_X+Math.sin(t*0.00028)*0.028)-rotXt)*0.03;
        rotYt+=((HOME_Y+idleY+Math.sin(t*0.00021)*0.05)-rotYt)*0.03;
      }
    }
    /* the tour: one office every 5.6s while the visitor has not touched anything. It starts a beat
       after the section arrives, so the first thing seen is the world at home, not mid-turn. */
    if(touring && !reduce){ if(!tourAt) tourAt=t+2600; if(t>=tourAt){ focus(TOUR[tourK%TOUR.length],true); tourK++; tourAt=t+5600; } }
    rx+=(rotXt-rx)*0.06; ry+=(rotYt-ry)*0.06;
    group.rotation.x=rx; group.rotation.y=ry;
    group.position.y=Math.sin(t*0.00045)*0.014;
    if(selRing && sel>=0){ var br=1+Math.sin(t*0.0042)*0.16; selRing.scale.set(.34*br,.34*br,1);
      selRing.material.opacity+=((0.95)-selRing.material.opacity)*0.12; }
    step(t);
    renderer.render(scene,camera); tags2d(); }
  /* Turn the world so office k faces the eye. For a point at longitude lo, the group's y rotation that
     brings it to the front is -PI/2 - lo (see ll(): x=cos(lo), z=-sin(lo)); the x rotation tilts its
     latitude toward the eye. The idle spin accumulates turns, so the target is moved to the nearest
     equivalent angle and the globe always goes the short way. `quiet` is the tour speaking: a pick by
     the visitor ends the tour, the tour's own steps do not. */
  function focus(k,quiet){
    var of=OFFICES[k]; if(!of||!group) return;
    sel=k; turned=true; velX=0; velY=0; if(!quiet) touring=false;
    var ty=-Math.PI/2-of[1]*Math.PI/180; ty+=Math.round((rotYt-ty)/(Math.PI*2))*Math.PI*2;
    rotYt=ty; rotXt=Math.max(-0.5,Math.min(1.0,of[0]*Math.PI/180*0.8));
    holdUntil=performance.now()+(quiet?5600:9000);
    if(selRing){ var sp=ll(of[0],of[1],R*1.03); selRing.position.set(sp[0],sp[1],sp[2]); selRing.material.opacity=0; }
    for(var i=0;i<tags.length;i++) tags[i].classList.toggle('sel',i===k);
    try{ window.dispatchEvent(new CustomEvent('iaq:globe',{detail:{i:k,quiet:!!quiet}})); }catch(e){}
  }
  window.__globeFocus=function(k){ focus(k,false); };

  /* 24 Sep (Bazil: "make sure the lines aren't cut, so the whole section is the canvas"): the canvas fills the record
     section (group-record.css); the sphere is kept at its column's size and centre with a view offset and a camera
     distance scaled by the canvas height, so the arcs have the whole band to fly through */
  var wide=false;
  /* 25 Sep: the frame is measured in CSS px (clientWidth), the unit the chips are positioned in. The page runs at
     zoom 1.12, so a bounding rect is 12% larger than the CSS box; measuring the rect put every chip 12% too far
     right and down, and the USA chip past the edge (Bazil's screenshot). Rect offsets are divided by that zoom. */
  function frameDims(){ var cr=canvas.getBoundingClientRect(); var w=canvas.clientWidth||host.clientWidth||300, h=canvas.clientHeight||host.clientHeight||300; return { w:w, h:h, cr:cr, z:(cr.width&&w)?cr.width/w:1 }; }
  function resize(){ if(!renderer)return; var d=frameDims(), w=d.w, h=d.h, z=d.z||1;
    renderer.setSize(w,h,false); camera.aspect=w/h;
    var hr=host.getBoundingClientRect(); wide=Math.abs(hr.width-d.cr.width)>4||Math.abs(hr.height-d.cr.height)>4;
    if(wide){ var cx=(hr.left-d.cr.left+hr.width/2)/z, cy=(hr.top-d.cr.top+hr.height/2)/z; camera.setViewOffset(w,h,w/2-cx,h/2-cy,w,h); camera.position.z=4.25*(h/Math.max(1,hr.height/z)); }
    else { camera.clearViewOffset(); camera.position.z=4.25; }
    camera.updateProjectionMatrix(); renderer.render(scene,camera); tags2d(); }
  /* the same world drawn flat, for any canvas that has no live GL: one still frame, SEA facing */
  function staticGlobe(cv){ try{ var ctx=cv.getContext('2d'); if(!ctx) return;
    /* 26 Sep: drawn at the screen's pixel ratio, so it is sharp on a Retina display */
    function dr(){ var dp=Math.min(window.devicePixelRatio||1,2), w=host.clientWidth||300,h=host.clientHeight||300,cx=w/2,cy=h/2,rr=Math.min(w,h)*0.42;
      cv.width=Math.round(w*dp); cv.height=Math.round(h*dp); ctx.setTransform(dp,0,0,dp,0,0);
      ctx.clearRect(0,0,w,h);
      for(var y=1;y<GH;y++)for(var x=1;x<GW-1;x++){ if(!bit(y,x))continue;
        var la=(90-((y+0.5)/GH)*180)*Math.PI/180, lo=(((x+0.5)/GW)*360-180)*Math.PI/180-1.75;
        if(Math.random()>Math.cos(la))continue;
        var X=Math.cos(la)*Math.cos(lo), Y=Math.sin(la), Z=-Math.cos(la)*Math.sin(lo);
        if(Z<0)continue;
        ctx.beginPath();ctx.arc(cx+X*rr,cy-Y*rr,1.1,0,6.28);ctx.fillStyle='rgba(18,26,48,'+(0.25+Z*0.6)+')';ctx.fill();}}
    dr(); onWin('resize',dr);}catch(e){} }
  function fallback(){ staticGlobe(canvas); }

  /* a QA hook, in the manner of __p3dQA elsewhere in this file: it reports the globe's live state,
     so a probe can tell a stopped loop from a stopped context */
  window.__globeQA=function(){ return {vis:vis,raf:!!raf,renderer:!!renderer,tags:tags.length,rebuilds:rebuilds,flat:!!host.querySelector('.globe-flat'),sel:sel,touring:touring,ry:+ry.toFixed(3),rx:+rx.toFixed(3)}; };

  /* 17 Sep. A browser can take the GL context away at any time: the GPU process restarts, a tab
     sits too long in the background, or a page holding several contexts crosses the browser's cap
     and the oldest one is dropped. Chrome then paints a broken-image square where the canvas was,
     which is what Bazil saw first. The flat drawing that replaced it was worse in its own way
     ("why soo lame"), so losing the context no longer costs the world: the scene is REBUILT on a
     fresh canvas, which gets a fresh context, and the real globe comes back by itself within a
     frame or two. The flat world is kept for the case that has no way back: no WebGL at all, or a
     GPU that keeps dropping us. */
  function onLost(e){
    /* 26 Sep (Bazil's capture: a globe of stacked dots and doubled halos): the page cleanup force-drops every context, and
       this handler then rebuilt a fresh globe AFTER the teardown, so each hot reload left one more globe drawing over the
       section. A torn-down scene never rebuilds. */
    if(dead) return;
    e.preventDefault();
    if(raf){ cancelAnimationFrame(raf); raf=null; }
    try{ if(renderer) renderer.dispose(); }catch(_){}
    renderer=null;
    tags.forEach(function(el){ if(el && el.parentNode) el.parentNode.removeChild(el); });
    tags.length=0; tagPos.length=0; travelers.length=0; selRing=null;
    if(rebuilds>=3){ giveUp(); return; }      /* the GPU keeps dropping us: stop asking */
    rebuilds++;
    _setTo(function(){
      if(dead) return;
      var fresh=document.createElement('canvas');
      fresh.id=canvas.id; fresh.className=canvas.className;
      if(canvas.parentNode) canvas.parentNode.replaceChild(fresh,canvas);
      else host.appendChild(fresh);
      canvas=fresh;
      try{ init(THREE_MOD); }catch(err){ giveUp(); }
    }, 220);
  }
  function giveUp(){
    var flat=document.createElement('canvas');
    flat.className='globe-flat'; flat.style.cssText='position:absolute;inset:0;width:100%;height:100%';
    /* 26 Sep: the flat world was placed against the section, not its box, and drew stretched and off-centre */
    if(getComputedStyle(host).position==='static') host.style.position='relative';
    canvas.style.display='none'; host.appendChild(flat);
    staticGlobe(flat);
  }

  try{init(THREE_MOD);}catch(err){fallback();}
})();

/* ---- 3D showpiece: retired 4 Sep. The procedural WebGL cleanroom is replaced by IAQ's own
   Revit renders, scrubbed by scroll in scenes/fab.js (mounted by components/FabAssembly.jsx). ---- */

/* ---- GSAP: progress bar, hero mask reveal, reveals, counters, pinned stage ---- */
(function(){
  if(reduce){
    document.querySelectorAll('[data-count]').forEach(function(el){var d=+(el.dataset.dec||0); el.textContent=(+el.dataset.count).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});});
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* scroll progress bar */

  /* hero masked line reveal is CSS-driven (see @keyframes hlRise). Add .motion when the loader lifts
     so the intro plays in view. Content is visible by default, so if the signal never arrives the
     headline just shows without the intro, and a frozen ticker can never strand it (rule 10). */
  (function(){
    var root=document.documentElement, played=false;
    function playHero(){ if(played) return; played=true; root.classList.add('motion'); }
    var _ld=document.getElementById('loader');
    if(!_ld || _ld.classList.contains('ld-done')) playHero();
    else { onWin('iaq:loaderdone',playHero,{once:true}); _setTo(playHero,2000); }
  })();

  /* reveals: visible by default, immediateRender:false */
  gsap.utils.toArray('[data-reveal]').forEach(function(el){
    if(el.classList.contains('gstat')) return;   /* the stat grid is staggered as one block, below */
    gsap.from(el,{opacity:0,y:24,duration:.9,ease:'power3.out',immediateRender:false,scrollTrigger:{trigger:el,start:'top 90%'}});
  });

  /* THE STAT BLOCK, one row at a time.
     Six [data-reveal] elements sitting inside one grid all cross 'top 90%' within a few pixels of
     each other, so they fire together and the stagger the markup implies never happens. Drive the
     whole block from ONE trigger on the grid instead, and the six rows arrive in reading order.

     The from-state is set in JS and never in CSS: a CSS opacity:0 default leaves the block invisible
     anywhere the clearing class never arrives — a PDF export, an email client, a tender document
     with no stylesheet. Painted first, animated only as an enhancement. */
  if(!reduce){
    var _grid=document.querySelector('.gstats');
    if(_grid){
      var _rows=gsap.utils.toArray('.gstats .gstat');
      var tl=gsap.timeline({scrollTrigger:{trigger:_grid,start:'top 85%',once:true,
        /* THE MARKS ANIMATE THEMSELVES. Each of the six is a different object — a cornerstone, a
           globe, three certificates, a divided plan, a plant, a floor plate — so each one moves in
           its own language, authored in the stylesheet beside the geometry it moves. GSAP's job
           here is only to say WHEN: one class, and the six choreographies run off --mk-d. Scaling
           the whole <svg> from JS as well would put a second, contradictory motion on top. */
        onEnter:function(){ _grid.classList.add('mk-in'); }}});
      tl.from(_rows,{y:14,opacity:0,duration:.62,ease:'power3.out',stagger:.085,immediateRender:false},0);
      /* the counters already run on their own ScrollTrigger, so nothing here touches the numbers */
    }
  }

  /* counters */
  gsap.utils.toArray('[data-count]').forEach(function(el){
    var end=+el.dataset.count;
    el.textContent='0';
    ScrollTrigger.create({trigger:el,start:'top 92%',once:true,onEnter:function(){
      var d=+(el.dataset.dec||0); gsap.to({v:0},{v:end,duration:1.6,ease:'power2.out',onUpdate:function(){var v=this.targets()[0].v; el.textContent=(d?v:Math.round(v)).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});}});
    }});
  });

  /* gentle hero canvas parallax, desktop only */
  var mm=gsap.matchMedia();
  _cleanups.push(function(){ try{ mm.revert(); }catch(e){} });
  mm.add('(min-width: 761px)',function(){
    gsap.to('#heroCanvas',{yPercent:14,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.6,invalidateOnRefresh:true}});
    gsap.fromTo('.globe-host',{y:20},{y:-20,ease:'none',scrollTrigger:{trigger:'.glance',start:'top bottom',end:'bottom top',scrub:.5,invalidateOnRefresh:true}});
    /* no vertical parallax on the film poster: it translated the 100%-tall image and exposed the
       dark card background as a black band top/bottom before the loop kicked in. The poster now sits
       static and fully covers the card (a clean thumbnail); click still opens the film. */
    gsap.fromTo('.gstats',{y:26},{y:-14,ease:'none',scrollTrigger:{trigger:'.glance',start:'top bottom',end:'bottom top',scrub:.9,invalidateOnRefresh:true}});
  });

  /* the pinned showpiece scrub lived here; it now belongs to scenes/fab.js */

  var _irt;
  document.querySelectorAll('img').forEach(function(im){
    if(!im.complete){ im.addEventListener('load',function(){ clearTimeout(_irt); _irt=_setTo(function(){try{ScrollTrigger.refresh();}catch(e){}},150); },{once:true}); }
  });
  onWin('load',function(){ScrollTrigger.refresh();});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){ if(dead) return; try{ScrollTrigger.refresh();}catch(e){} });
})();


/* ---- featured projects: four live 3D miniatures, hover to turn ---- */
(function(){
  var hosts=document.querySelectorAll('.fp3d'); if(!hosts.length) return;
  /* these miniatures are hover-to-turn, which buys nothing on touch, and four live WebGL contexts
     would push the phone past iOS Safari's live-context cap and blank a canvas. On touch/narrow (and
     reduced-motion) render one frame to a static poster and free the context (see build). */
  var mobile=(window.matchMedia&&matchMedia('(hover:none)').matches)||window.innerWidth<900;
  function build(T,host){
    var canvas=host.querySelector('canvas');
    var scene=new T.Scene();
    var camera=new T.PerspectiveCamera(30,16/9,0.1,60); camera.position.set(3.4,2.3,3.6); camera.lookAt(0,0.22,0);
    var renderer=_reg(new T.WebGLRenderer({canvas:canvas,antialias:true,alpha:true,preserveDrawingBuffer:(mobile||reduce)}));
    renderer.setClearColor(0x000000,0); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
    renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=1.12;
    scene.add(new T.HemisphereLight(0xF2F7FF,0x2E374A,1.5));
    var sun=new T.DirectionalLight(0xF4F7FF,2.0); sun.position.set(4,6,3); scene.add(sun);
    var rim=new T.DirectionalLight(0x8FB5FF,0.7); rim.position.set(-4,3,-4); scene.add(rim);
    var g=new T.Group(); scene.add(g); g.position.y=-0.28;
    function mat(c,o){o=o||{};return new T.MeshStandardMaterial({color:c,roughness:o.rough!==undefined?o.rough:.62,metalness:o.metal||0});}
    function bx(w,h,d,c,o){var m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c,o));
      m.add(new T.LineSegments(new T.EdgesGeometry(m.geometry),new T.LineBasicMaterial({color:0x0B1120,transparent:true,opacity:.4})));return m;}
    function cl(r,h,c,o){return new T.Mesh(new T.CylinderGeometry(r,r,h,18),mat(c,o));}
    var pad=bx(2.9,0.08,2.0,0x2B3547); pad.position.y=-0.05; g.add(pad);
    var disc=new T.Mesh(new T.CircleGeometry(2.6,40),new T.MeshBasicMaterial({color:0x0C1526,transparent:true,opacity:.55}));
    disc.rotation.x=-Math.PI/2; disc.position.y=-0.1; g.add(disc);
    var kind=host.dataset.kind;
    if(kind==='fab'){
      var b1=bx(1.9,0.62,1.25,0xE8EDF4); b1.position.y=0.32; g.add(b1);
      var band=bx(1.92,0.07,1.27,0xC22730); band.position.y=0.52; g.add(band);
      var pent=bx(0.9,0.3,0.7,0xD5DCE6); pent.position.set(-0.3,0.78,0); g.add(pent);
      for(var i2=0;i2<2;i2++){var ru=bx(0.26,0.16,0.26,0xB9C2CE); ru.position.set(0.55+i2*0.4,0.71,-0.3); g.add(ru);}
      var stk=cl(0.05,0.7,0xC7CFDA); stk.position.set(0.85,0.75,0.4); g.add(stk);
      var dr=bx(0.22,0.3,0.03,0xC22730); dr.position.set(-0.5,0.16,0.64); g.add(dr);
    } else if(kind==='backend'){
      var m1=bx(1.5,0.55,1.05,0xE8EDF4); m1.position.set(-0.45,0.28,0); g.add(m1);
      var m2=bx(0.95,0.82,0.8,0xDDE3EB); m2.position.set(0.75,0.42,-0.1); g.add(m2);
      var trim=bx(0.97,0.06,0.82,0xC22730); trim.position.set(0.75,0.86,-0.1); g.add(trim);
      var brg=bx(0.42,0.18,0.3,0xC7CFDA); brg.position.set(0.15,0.5,0); g.add(brg);
      for(var i3=0;i3<3;i3++){var ah=bx(0.24,0.14,0.3,0xB9C2CE); ah.position.set(-0.85+i3*0.4,0.63,0.15); g.add(ah);}
    } else if(kind==='dryroom'){
      var hall=bx(2.2,0.5,1.15,0xE8EDF4); hall.position.y=0.26; g.add(hall);
      for(var i4=0;i4<7;i4++){var rib=bx(0.05,0.05,1.2,0xC7CFDA); rib.position.set(-0.95+i4*0.32,0.54,0); g.add(rib);}
      var end=bx(0.03,0.32,0.5,0xC22730); end.position.set(1.11,0.22,0.15); g.add(end);
      var silo=cl(0.16,0.62,0xD5DCE6); silo.position.set(-1.28,0.32,0.35); g.add(silo);
      var lock=bx(0.4,0.3,0.35,0xD5DCE6); lock.position.set(1.28,0.16,-0.25); g.add(lock);
    } else {
      var plinth=bx(2.2,0.12,1.3,0x39424F); plinth.position.y=0.07; g.add(plinth);
      for(var i5=0;i5<3;i5++){
        var chb=bx(0.6,0.42,0.55,0xCBD4DF); chb.position.set(-0.7+i5*0.7,0.36,-0.15); g.add(chb);
        var fan=cl(0.16,0.03,0x39424F); fan.position.set(-0.7+i5*0.7,0.585,-0.15); g.add(fan);
        var pnl=bx(0.1,0.26,0.4,0xC22730); pnl.position.set(-0.42+i5*0.7,0.3,-0.15); g.add(pnl);
      }
      var hdr=cl(0.05,2.0,0xC22730); hdr.rotation.z=Math.PI/2; hdr.position.set(0,0.2,0.45); g.add(hdr);
      for(var i6=0;i6<2;i6++){var pmp=cl(0.09,0.2,0xA63A48); pmp.rotation.z=Math.PI/2; pmp.position.set(-0.35+i6*0.7,0.16,0.45); g.add(pmp);}
    }
    var ry=-0.5,ryt=-0.5,raf2=null,visb=false,hovering=false;
    function resize(){var w=host.clientWidth||300,h2=host.clientHeight||170;renderer.setSize(w,h2,false);camera.aspect=w/h2;camera.updateProjectionMatrix();renderer.render(scene,camera);}
    resize();
    /* touch/narrow (no hover) and reduced-motion: bake ONE frame to a static <img> poster, then free
       the GL context so four live miniatures can't push the phone past the live-context cap (7->3). */
    if(mobile||reduce){
      g.rotation.y=-0.5; renderer.render(scene,camera);
      var shot=false;
      try{ var u=canvas.toDataURL('image/png'); var im=new Image(); im.setAttribute('aria-hidden','true');
        im.style.cssText='width:100%;height:100%;display:block'; im.src=u; canvas.style.display='none'; host.appendChild(im); shot=true; }catch(e){}
      /* only free the context once the poster is in place; if the snapshot failed, keep the live frame
         rather than blanking the canvas */
      if(shot){ try{ var gl=renderer.getContext(); var lo=gl&&gl.getExtension('WEBGL_lose_context'); if(lo)lo.loseContext(); }catch(e){}
                try{ renderer.dispose(); renderer.forceContextLoss(); }catch(e){} }
      return;
    }
    if(window.ResizeObserver){try{_ro(resize).observe(host);}catch(e){}}
    host.addEventListener('pointermove',function(e){var r=host.getBoundingClientRect();hovering=true;
      ryt=-0.5+((e.clientX-r.left)/r.width-0.5)*1.6;},{passive:true});
    host.addEventListener('pointerleave',function(){hovering=false;});
    var fN=0;
    function frame(ts){ raf2=_raf(frame); if(!visb)return;
      fN++; if(!hovering&&(fN&1)) return;/* ambient turn renders at 30fps; hover gets the full 60 */
      if(!hovering) ryt+=0.0044;/* doubled step keeps the visual turn speed at half rate */
      ry+=(ryt-ry)*0.07; g.rotation.y=ry;
      renderer.render(scene,camera); }
    if(window.IntersectionObserver){ try{ _io(function(es){ visb=es[0].isIntersecting;
      if(visb){ if(!raf2) raf2=_raf(frame); } else if(raf2){ cancelAnimationFrame(raf2); raf2=null; } }).observe(host);
    }catch(e){ visb=true; raf2=_raf(frame);} } else { visb=true; raf2=_raf(frame); }
  }
  try{
    /* lazy: each miniature builds its WebGL context only when it nears the viewport, so all four
       are not spun up at page load (keeps the page's live GL-context count lower on entry) */
    if(window.IntersectionObserver){
      var io=_io(function(es){ es.forEach(function(en){ if(en.isIntersecting){ io.unobserve(en.target); try{build(THREE_MOD,en.target);}catch(_){} } }); },{rootMargin:'250px'});
      hosts.forEach(function(h){ io.observe(h); });
    } else { hosts.forEach(function(h){build(THREE_MOD,h);}); }
  }catch(err){}
})();


/* ---- closing section: interactive 3D IAQ campus, follows the cursor ---- */
(function(){
  var host=document.querySelector('.close-stage')||document.querySelector('.close3d'); if(!host) return;
  var canvas=document.getElementById('closeCv'); if(!canvas) return;
  var T,renderer,scene,camera,g,beacons=[],raf=null,visb=false,truck,dust,stars,clouds,starMat,trees=[],folk=[];
  var px=0,py=0,pxt=0,pyt=0;
  /* self-contained reduced-motion flag so this engine works on every page it is propagated to */
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function mat(c,o){o=o||{};return new T.MeshStandardMaterial({color:c,roughness:o.rough!==undefined?o.rough:.65,metalness:o.metal||0});}
  function bx(w,h,d,c,o){var m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c,o));
    m.castShadow=true;m.receiveShadow=true;
    m.add(new T.LineSegments(new T.EdgesGeometry(m.geometry),new T.LineBasicMaterial({color:0x0B1120,transparent:true,opacity:.38})));return m;}
  function cl(r,h,c,o){var m=new T.Mesh(new T.CylinderGeometry(r,r,h,18),mat(c,o));m.castShadow=true;return m;}
  function init(mod){
    T=mod;
    scene=new T.Scene();
    /* the ground plane's far edge was cutting a hard horizon line across the canvas.
       Fog it out into the section colour so the site dissolves into the night. */
    scene.fog=new T.Fog(0x141F36,26,49);
    /* the sky is rendered, not CSS: both the fog and the backdrop then pass through the
       same ACES tone mapping, so the ground's far edge has nothing to step against.
       The CSS scrim still masks the canvas top and bottom into the section navy. */
    scene.background=new T.Color(0x141F36);/* matches the horizon band of .close-viz so the ground edge vanishes */
    camera=new T.PerspectiveCamera(30,2,3,66);/* tight near/far: the depth buffer stops shimmering on the facades */
    renderer=_reg(new T.WebGLRenderer({canvas:canvas,antialias:true,alpha:true}));
    renderer.setClearColor(0x000000,0); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
    renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFShadowMap;/* grounded contact shadows read as a real site */
    renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1;
    scene.add(new T.HemisphereLight(0xEAF2FF,0x2A3346,1.05));
    var sun=new T.DirectionalLight(0xF4F7FF,2.2); sun.position.set(7,11,5);
    sun.castShadow=true; sun.shadow.mapSize.set(512,512);
    sun.shadow.camera.left=-9; sun.shadow.camera.right=9; sun.shadow.camera.top=7; sun.shadow.camera.bottom=-5;
    sun.shadow.camera.near=2; sun.shadow.camera.far=32; sun.shadow.bias=-0.0002; sun.shadow.normalBias=0.03;
    scene.add(sun);
    var rim=new T.DirectionalLight(0x7FA8FF,0.8); rim.position.set(-6,5,-7); scene.add(rim);
    /* subtle dusk fog: the far ground melts into the sky instead of a hard edge */
    scene.fog=new T.Fog(0x14203C,24,64);
    /* ---- SKY: dusk gradient dome + starfield + soft moon + horizon haze + drifting clouds ---- */
    (function(){
      var scn=document.createElement('canvas'); scn.width=8; scn.height=256; var sc=scn.getContext('2d');
      var sg=sc.createLinearGradient(0,0,0,256);
      /* cool twilight: a SMOOTH monotonic ramp from deep navy zenith to a soft blue horizon glow,
         evenly spaced so there is no hard band edge / horizontal seam line in the sky */
      sg.addColorStop(0.00,'#05080F'); sg.addColorStop(0.28,'#0A1526'); sg.addColorStop(0.48,'#152740');
      sg.addColorStop(0.64,'#1F3B61'); sg.addColorStop(0.80,'#2A5080'); sg.addColorStop(0.92,'#326096');
      sg.addColorStop(1.00,'#35669E');
      sc.fillStyle=sg; sc.fillRect(0,0,8,256);
      var stex=new T.CanvasTexture(scn); if(T.SRGBColorSpace) stex.colorSpace=T.SRGBColorSpace;
      var sky=new T.Mesh(new T.SphereGeometry(72,24,16),new T.MeshBasicMaterial({map:stex,side:T.BackSide,depthWrite:false,fog:false}));
      sky.position.y=-8; sky.renderOrder=-10; scene.add(sky);
    })();
    function radialTex(stops){ var cv=document.createElement('canvas'); cv.width=cv.height=128; var g2=cv.getContext('2d');
      var rg=g2.createRadialGradient(64,64,2,64,64,64); stops.forEach(function(s){rg.addColorStop(s[0],s[1]);});
      g2.fillStyle=rg; g2.fillRect(0,0,128,128); return new T.CanvasTexture(cv); }
    /* sparse dusk stars, low over the horizon so a few sit in the visible sky strip */
    var stn=130, stp=new Float32Array(stn*3);
    for(var si=0;si<stn;si++){ var th=Math.random()*Math.PI*2, rr=40+Math.random()*16;
      stp[si*3]=Math.cos(th)*rr; stp[si*3+1]=2.6+Math.random()*9; stp[si*3+2]=Math.sin(th)*rr-2; }
    var stgeo=new T.BufferGeometry(); stgeo.setAttribute('position',new T.BufferAttribute(stp,3));
    starMat=new T.PointsMaterial({color:0xDCE8FF,size:0.2,transparent:true,opacity:0.8,depthWrite:false,fog:false});
    stars=new T.Points(stgeo,starMat); scene.add(stars);
    /* soft moon low on the horizon (a moonrise behind the site), off to one side so buildings don't hide it */
    var moon=new T.Sprite(new T.SpriteMaterial({map:radialTex([[0,'rgba(240,244,255,0.95)'],[0.32,'rgba(210,224,255,0.4)'],[0.6,'rgba(200,216,250,0.12)'],[1,'rgba(200,216,250,0)']]),transparent:true,depthWrite:false,fog:false}));
    moon.scale.set(6,6,1); moon.position.set(15.5,3.6,-18); scene.add(moon);
    /* (horizon haze removed: its additive glow band drew a hard horizontal line where it met the dark sky) */
    /* drifting cloud banks along the horizon */
    var cloudTex=radialTex([[0,'rgba(158,176,212,0.42)'],[0.5,'rgba(158,176,212,0.11)'],[1,'rgba(158,176,212,0)']]);
    clouds=[];
    for(var ci=0;ci<6;ci++){ var csp=new T.Sprite(new T.SpriteMaterial({map:cloudTex,transparent:true,depthWrite:false,fog:false,opacity:0.5}));
      var cw=7+Math.random()*7; csp.scale.set(cw,cw*0.3,1);
      csp.position.set(-18+Math.random()*36,2.8+Math.random()*3.2,-11-Math.random()*9);
      csp.userData.sp=0.5+Math.random()*0.7; scene.add(csp); clouds.push(csp); }
    g=new T.Group(); scene.add(g);
    /* ---- ground: layered site, not a black void ----
       dark asphalt base, a lit concrete apron the campus stands on, kerbs, and a front service road */
    var gnd=new T.Mesh(new T.PlaneGeometry(96,64),new T.MeshStandardMaterial({color:0x090D14,roughness:1,metalness:0}));
    gnd.rotation.x=-Math.PI/2; gnd.position.y=-0.03; gnd.receiveShadow=true; g.add(gnd);
    /* concrete apron slab: the campus footprint sits on a grounded pad */
    var apron=new T.Mesh(new T.PlaneGeometry(12.6,5.6),new T.MeshStandardMaterial({color:0x1B2432,roughness:.9,metalness:0}));
    apron.rotation.x=-Math.PI/2; apron.position.set(0.2,-0.012,0.05); apron.receiveShadow=true; g.add(apron);
    /* apron kerb: a thin raised edge around the pad */
    var kerbMat=new T.MeshStandardMaterial({color:0x2A3546,roughness:.85});
    [[0.2,-0.008,3.60,12.6,0.16],[0.2,-0.008,-2.75,12.6,0.16]].forEach(function(k){
      var kb=new T.Mesh(new T.BoxGeometry(k[3],0.06,k[4]),kerbMat); kb.position.set(k[0],0.02,k[2]); kb.receiveShadow=true; g.add(kb); });
    [[-6.1,-0.008,0.40,0.16,6.4],[6.5,-0.008,0.40,0.16,6.4]].forEach(function(k){
      var kb=new T.Mesh(new T.BoxGeometry(k[3],0.06,k[4]),kerbMat); kb.position.set(k[0],0.02,k[2]); kb.receiveShadow=true; g.add(kb); });
    /* front service road (the truck + bollards run here) with a dashed centre line */
    var road=new T.Mesh(new T.PlaneGeometry(15,1.80),new T.MeshStandardMaterial({color:0x0C1017,roughness:1}));
    road.rotation.x=-Math.PI/2; road.position.set(0.2,-0.006,2.62); road.receiveShadow=true; g.add(road);
    for(var dl=0;dl<11;dl++){ var dash=new T.Mesh(new T.PlaneGeometry(0.5,0.05),new T.MeshBasicMaterial({color:0x5C6A7E}));
      dash.rotation.x=-Math.PI/2; dash.position.set(-6.3+dl*1.3,0.002,2.62); g.add(dash); }
    /* solid edge lines top and bottom of the carriageway */
    [1.80,3.44].forEach(function(ez){ var eg=new T.Mesh(new T.PlaneGeometry(15,0.035),new T.MeshBasicMaterial({color:0x46536A}));
      eg.rotation.x=-Math.PI/2; eg.position.set(0.2,0.002,ez); g.add(eg); });
    /* landscaped strip behind the campus for depth */
    var lawn=new T.Mesh(new T.PlaneGeometry(12.6,0.9),new T.MeshStandardMaterial({color:0x122019,roughness:1}));
    lawn.rotation.x=-Math.PI/2; lawn.position.set(0.2,-0.008,-2.4); lawn.receiveShadow=true; g.add(lawn);
    /* ---- floor detail: expansion joints, parking bays, landscaping ---- */
    /* concrete expansion joints (subtle darker seams gridding the apron) */
    var jointMat=new T.MeshBasicMaterial({color:0x121A26,transparent:true,opacity:0.55});
    for(var jz=0;jz<4;jz++){ var jl=new T.Mesh(new T.PlaneGeometry(12.4,0.03),jointMat); jl.rotation.x=-Math.PI/2; jl.position.set(0.2,0.0006,-2.0+jz*1.35); g.add(jl); }
    for(var jx=0;jx<7;jx++){ var jc=new T.Mesh(new T.PlaneGeometry(0.03,5.4),jointMat); jc.rotation.x=-Math.PI/2; jc.position.set(-5.6+jx*1.72,0.0006,0.05); g.add(jc); }
    /* painted parking bays, front-left corner of the apron */
    var lineMat=new T.MeshBasicMaterial({color:0x8B97AB});
    for(var pk=0;pk<6;pk++){ var pl=new T.Mesh(new T.PlaneGeometry(0.045,1.0),lineMat); pl.rotation.x=-Math.PI/2; pl.position.set(-5.4+pk*0.62,0.0012,1.15); g.add(pl); }
    var pbCap=new T.Mesh(new T.PlaneGeometry(3.15,0.045),lineMat); pbCap.rotation.x=-Math.PI/2; pbCap.position.set(-4.47,0.0012,0.66); g.add(pbCap);
    /* landscaping trees along the rear lawn (two-tier conifers, they cast shadows) */
    function tree(x,z,s){ var tg=new T.Group(); tg.userData.ph=Math.random()*6.283; trees.push(tg);
      var trunk=new T.Mesh(new T.CylinderGeometry(0.05*s,0.07*s,0.5*s,6),new T.MeshStandardMaterial({color:0x4A3A2E,roughness:1})); trunk.position.y=0.25*s; trunk.castShadow=true; tg.add(trunk);
      var f1=new T.Mesh(new T.ConeGeometry(0.42*s,0.95*s,7),new T.MeshStandardMaterial({color:0x24513A,roughness:1})); f1.position.y=0.78*s; f1.castShadow=true; tg.add(f1);
      var f2=new T.Mesh(new T.ConeGeometry(0.31*s,0.66*s,7),new T.MeshStandardMaterial({color:0x2E6247,roughness:1})); f2.position.y=1.12*s; f2.castShadow=true; tg.add(f2);
      tg.position.set(x,0,z); g.add(tg); }
    [[-5.3,-2.45,1.05],[-3.5,-2.55,0.85],[1.0,-2.5,0.8],[3.6,-2.55,0.92],[5.4,-2.45,1.08]].forEach(function(tp){ tree(tp[0],tp[1],tp[2]); });
    /* campus: fab, tower, dry hall, chiller yard, stacks */
    var fab=bx(3.0,1.0,1.8,0xE8EDF4); fab.position.set(-3.6,0.5,-0.4); g.add(fab);
    var band=bx(3.04,0.1,1.84,0xC22730); band.position.set(-3.6,0.82,-0.4); g.add(band);
    var pent=bx(1.3,0.35,1.0,0xD5DCE6); pent.position.set(-3.9,1.18,-0.4); g.add(pent);
    for(var i=0;i<3;i++){var ru=bx(0.34,0.22,0.34,0xB9C2CE); ru.position.set(-4.3+i*0.6,1.11,-0.4); g.add(ru);}
    var hq=bx(1.7,1.9,1.3,0xDDE3EB); hq.position.set(-0.5,0.95,-0.9); g.add(hq);
    var hqTrim=bx(1.74,0.08,1.34,0xC22730); hqTrim.position.set(-0.5,1.94,-0.9); g.add(hqTrim);
    /* IAQ sign on the tower crown */
    var signBack=bx(1.5,0.58,0.07,0xFFFFFF,{rough:.25}); signBack.position.set(-0.5,1.56,-0.22); g.add(signBack);
    new T.TextureLoader().load('/assets/iaq-logo.webp',function(tex){
      if(T.SRGBColorSpace) tex.colorSpace=T.SRGBColorSpace;
      tex.anisotropy=8;
      var sm=new T.MeshBasicMaterial({map:tex,transparent:true});
      var sp=new T.Mesh(new T.PlaneGeometry(1.16,0.48),sm); sp.position.set(-0.5,1.56,-0.178); g.add(sp);
    });
    /* ---- photoreal curtain wall ----------------------------------------------
       Each facade is ONE textured plane, not a pile of boxes. The texture is drawn
       procedurally: sky-reflecting glass with per-pane tint jitter, drawn blinds,
       lit interiors with ceiling strips and desk silhouettes, spandrel bands and a
       brushed-aluminium mullion grid. A PMREM environment map off a dusk-sky canvas
       gives the glass genuine specular reflection and fresnel at grazing angles. */
    var ENVTEX=null;
    try{
      var sc=document.createElement('canvas'); sc.width=256; sc.height=128;
      var sx=sc.getContext('2d');
      var sg=sx.createLinearGradient(0,0,0,128);
      sg.addColorStop(0.00,'#4A6699'); sg.addColorStop(0.34,'#31486F');
      sg.addColorStop(0.49,'#1B2740'); sg.addColorStop(0.51,'#0C1420');
      sg.addColorStop(1.00,'#070C18');
      sx.fillStyle=sg; sx.fillRect(0,0,256,128);
      /* a low sun glow so the glass catches a highlight */
      var hg=sx.createRadialGradient(196,52,2,196,52,54);
      hg.addColorStop(0,'rgba(255,224,190,.85)'); hg.addColorStop(1,'rgba(255,224,190,0)');
      sx.fillStyle=hg; sx.fillRect(140,0,116,110);
      var eqt=new T.CanvasTexture(sc); eqt.mapping=T.EquirectangularReflectionMapping;
      if(T.SRGBColorSpace) eqt.colorSpace=T.SRGBColorSpace;
      var pmrem=new T.PMREMGenerator(renderer);
      ENVTEX=pmrem.fromEquirectangular(eqt).texture;
      pmrem.dispose();
    }catch(e){ ENVTEX=null; }

    function rng(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0;
      var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t;
      return ((t^t>>>14)>>>0)/4294967296; }; }

    function facadeTex(cols,rows,seed){
      var CW=52,CH=58,PAD=4,SP=9;                 /* cell, frame pad, spandrel band */
      var c=document.createElement('canvas'); c.width=cols*CW; c.height=rows*CH;
      var x=c.getContext('2d');
      var l=document.createElement('canvas'); l.width=c.width; l.height=c.height;
      var lx=l.getContext('2d'); lx.fillStyle='#000'; lx.fillRect(0,0,l.width,l.height);
      /* brushed aluminium curtain-wall frame behind everything */
      var fr=x.createLinearGradient(0,0,0,c.height);
      fr.addColorStop(0,'#D9E1EC'); fr.addColorStop(0.5,'#C6CFDB'); fr.addColorStop(1,'#AEB8C6');
      x.fillStyle=fr; x.fillRect(0,0,c.width,c.height);
      /* a lit room reads as glow, not geometry: warm wash brightest at the ceiling,
         pooling toward the middle of the room and falling off at the reveals */
      function litPane(ctx2,px,py,pw,ph,wi,gain){
        var wg=ctx2.createLinearGradient(px,py,px,py+ph);
        wg.addColorStop(0,   'rgba(255,228,186,'+(0.76*wi*gain).toFixed(3)+')');
        wg.addColorStop(0.45,'rgba(238,193,140,'+(0.50*wi*gain).toFixed(3)+')');
        wg.addColorStop(1,   'rgba(178,131,84,'+(0.24*wi*gain).toFixed(3)+')');
        ctx2.fillStyle=wg; ctx2.fillRect(px,py,pw,ph);
        var rg=ctx2.createRadialGradient(px+pw*0.5,py+ph*0.34,1,px+pw*0.5,py+ph*0.34,pw*0.82);
        rg.addColorStop(0,'rgba(255,243,220,'+(0.44*wi*gain).toFixed(3)+')');
        rg.addColorStop(1,'rgba(255,243,220,0)');
        ctx2.fillStyle=rg; ctx2.fillRect(px,py,pw,ph);
      }
      var R=rng(seed);
      for(var r=0;r<rows;r++){
        for(var q=0;q<cols;q++){
          var px=q*CW+PAD, py=r*CH+PAD, pw=CW-PAD*2, ph=CH-PAD*2-SP;
          var v=R(), jit=(R()-0.5)*9;
          function cl(a,t2){ return Math.max(0,Math.round(a+jit)); }
          /* near-black glass: a whisper of dusk sky above the reflected horizon */
          var gd=x.createLinearGradient(px,py,px,py+ph);
          gd.addColorStop(0,   'rgb('+cl(38)+','+cl(52)+','+cl(80)+')');
          gd.addColorStop(0.44,'rgb('+cl(25)+','+cl(35)+','+cl(56)+')');
          gd.addColorStop(0.53,'rgb('+cl(11)+','+cl(16)+','+cl(26)+')');
          gd.addColorStop(1,   'rgb('+cl(8)+','+cl(12)+','+cl(19)+')');
          x.fillStyle=gd; x.fillRect(px,py,pw,ph);
          /* a lit room: ceiling strip and a soft warm wash. Kept sparse on purpose. */
          if(v<0.17){
            /* light spilling out of the room: a soft warm pool, no hardware, no bars */
            var wi=0.40+R()*0.60;
            litPane(x,px,py,pw,ph,wi,1.00);
            litPane(lx,px,py,pw,ph,wi,1.06);
          }
          /* half-drawn blinds, very low contrast so the facade stays quiet */
          else if(v<0.28){
            var drop=ph*(0.34+R()*0.42);
            x.fillStyle='rgba(150,163,182,.34)'; x.fillRect(px,py,pw,drop);
            x.fillStyle='rgba(90,103,124,.26)';
            for(var bl=2;bl<drop;bl+=4) x.fillRect(px,py+bl,pw,1.2);
          }
          /* clean sheet catching one soft diagonal of sky */
          else if(v<0.56){
            x.save(); x.beginPath(); x.rect(px,py,pw,ph); x.clip();
            var st=x.createLinearGradient(px,py+ph,px+pw,py);
            st.addColorStop(0,'rgba(255,255,255,0)'); st.addColorStop(0.48,'rgba(150,180,230,.12)');
            st.addColorStop(0.56,'rgba(150,180,230,.12)'); st.addColorStop(1,'rgba(255,255,255,0)');
            x.fillStyle=st; x.fillRect(px,py,pw,ph); x.restore();
          }
          /* glazing bead and head reveal */
          x.fillStyle='rgba(255,255,255,.14)'; x.fillRect(px,py,pw,1);
          x.fillStyle='rgba(0,0,0,.30)'; x.fillRect(px,py-2,pw,2);
          x.fillStyle='rgba(0,0,0,.14)'; x.fillRect(px-2,py,2,ph);
          /* spandrel: kept close to the building's own white so the wall reads as one plane */
          x.fillStyle='#C2CBD8'; x.fillRect(px-PAD,py+ph+1,pw+PAD*2,SP+PAD-1);
          x.fillStyle='rgba(255,255,255,.20)'; x.fillRect(px-PAD,py+ph+1,pw+PAD*2,1);
        }
      }
      /* mullion highlights over the grid, restrained */
      x.fillStyle='rgba(255,255,255,.18)';
      for(var mv=0;mv<=cols;mv++) x.fillRect(mv*CW-1,0,1.4,c.height);
      for(var mh=0;mh<=rows;mh++) x.fillRect(0,mh*CH-1,c.width,1.2);
      function mk(cv){ var t3=new T.CanvasTexture(cv); t3.anisotropy=8;
        if(T.SRGBColorSpace) t3.colorSpace=T.SRGBColorSpace; return t3; }
      return {map:mk(c),lit:mk(l)};
    }

    function facade(fx,fy,fz,w,h,cols,rows,face,seed){
      var tx=facadeTex(cols,rows,seed);
      var mt=new T.MeshStandardMaterial({map:tx.map,emissive:0xFFFFFF,emissiveMap:tx.lit,
        emissiveIntensity:0.85,roughness:0.09,metalness:0.20,
        polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
      if(ENVTEX){ mt.envMap=ENVTEX; mt.envMapIntensity=1.85; }
      var pl=new T.Mesh(new T.PlaneGeometry(w,h),mt); var d=0.035;
      if(face==='z+'){ pl.position.set(fx,fy,fz+d); }
      else if(face==='z-'){ pl.position.set(fx,fy,fz-d); pl.rotation.y=Math.PI; }
      else if(face==='x+'){ pl.position.set(fx+d,fy,fz); pl.rotation.y=Math.PI/2; }
      else { pl.position.set(fx-d,fy,fz); pl.rotation.y=-Math.PI/2; }
      g.add(pl);
    }
    /* HQ tower */
    facade(-0.5,0.74,-0.25,1.50,0.96,5,3,'z+',8641);
    facade(0.35,0.98,-0.9,1.12,1.46,4,4,'x+',3311);
    facade(-1.35,0.98,-0.9,1.12,1.46,4,4,'x-',5519);
    /* fab: long ribbon glazing */
    facade(-3.6,0.54,0.50,2.70,0.42,9,1,'z+',7717);
    facade(-2.1,0.54,-0.4,1.55,0.42,5,1,'x+',9923);
    /* dry hall clerestory */
    facade(2.9,0.48,0.60,3.05,0.34,10,1,'z+',2287);
    facade(1.2,0.48,-0.2,1.35,0.34,4,1,'x-',4703);
    var hall=bx(3.4,0.8,1.6,0xE8EDF4); hall.position.set(2.9,0.4,-0.2); g.add(hall);
    for(var r2=0;r2<8;r2++){var rib=bx(0.06,0.06,1.66,0xC7CFDA); rib.position.set(1.45+r2*0.42,0.83,-0.2); g.add(rib);}
    var dock=bx(0.5,0.4,0.9,0xD5DCE6); dock.position.set(4.85,0.2,-0.2); g.add(dock);
    /* chiller yard */
    var plinth=bx(2.2,0.12,1.1,0x39424F); plinth.position.set(0.9,0.06,1.15); g.add(plinth);
    for(var c2=0;c2<3;c2++){
      var ch=bx(0.58,0.42,0.5,0xCBD4DF); ch.position.set(0.25+c2*0.66,0.35,1.15); g.add(ch);
      /* the fan sits INSIDE the unit: only a recessed dark intake with louvres shows on top */
      var gr=bx(0.34,0.015,0.34,0x141B27,{rough:.9}); gr.position.set(0.25+c2*0.66,0.563,1.15); gr.castShadow=false; g.add(gr);
      for(var gb=0;gb<4;gb++){ var lv=bx(0.30,0.008,0.04,0x2A3546); lv.position.set(0.25+c2*0.66,0.572,1.024+gb*0.084); lv.castShadow=false; g.add(lv); }
      var pn=bx(0.09,0.24,0.36,0xC22730); pn.position.set(0.52+c2*0.66,0.28,1.15); g.add(pn);
    }
    var run=cl(0.045,1.9,0xC22730); run.rotation.z=Math.PI/2; run.position.set(0.9,0.2,1.72); g.add(run);
    /* stacks with aviation beacons */
    [[-2.1,1.6,-1.1],[3.9,1.3,-1.0]].forEach(function(sp){
      var stк=cl(0.09,sp[1],0xC7CFDA); stк.position.set(sp[0],sp[1]/2,sp[2]); g.add(stк);
      var bcn=new T.Mesh(new T.SphereGeometry(0.05,10,10),new T.MeshBasicMaterial({color:0xEC2027,transparent:true}));
      bcn.position.set(sp[0],sp[1]+0.06,sp[2]); g.add(bcn); beacons.push(bcn);
    });
    /* drifting dust in the sky */
    var dn=140, dp=new Float32Array(dn*3);
    for(var di=0;di<dn;di++){ dp[di*3]=(Math.random()-0.5)*26; dp[di*3+1]=1.5+Math.random()*6; dp[di*3+2]=-6+Math.random()*10; }
    var dg=new T.BufferGeometry(); dg.setAttribute('position',new T.BufferAttribute(dp,3));
    var dm=new T.PointsMaterial({color:0x9FB4D8,size:0.035,transparent:true,opacity:.5,depthWrite:false});
    dust=new T.Points(dg,dm); g.add(dust);
    /* a little site truck looping the front road */
    /* walking people on the front walkway (red vest = site lead) */
    folk=[];
    function walker(vest){ var Wg=new T.Group();
      var tr2=bx(0.05,0.09,0.05,0x1A2233); tr2.position.y=0.045; Wg.add(tr2);
      var bd2=bx(0.075,0.11,0.05,vest?0xC22730:0xC9D2DE); bd2.position.y=0.15; Wg.add(bd2);
      var hd2=new T.Mesh(new T.SphereGeometry(0.032,10,10),mat(0xD9B99B)); hd2.position.y=0.245; Wg.add(hd2);
      var hm2=bx(0.052,0.02,0.052,0xF2F5FA); hm2.position.y=0.272; Wg.add(hm2);
      Wg.scale.setScalar(0.72);/* a person reads ~1.75m against a 4.5m car and a 16m rig */
      return Wg; }
    [[-1.6,0.9,0.78,0.9],[0.35,1.3,0.7,1.25],[1.3,0.55,0.86,0.7],[-0.45,1.1,0.62,1.05]].forEach(function(u,i){
      var Pw=walker(i===1); Pw.position.set(u[0],0,u[2]); g.add(Pw);
      folk.push({m:Pw,x0:u[0],range:u[1],sp:u[3]}); });
    truck=new T.Group();
    /* a proper articulated rig at real scale: long chassis, tall red tractor cab with
       windscreen, grille, bumper and twin stacks, then a high white box trailer on a
       fifth wheel, riding on ten wheels. Roughly 3.5x the length of a parked car. */
    var chas=bx(1.78,0.05,0.30,0x1A2233); chas.position.set(-0.05,0.150,0); truck.add(chas);
    /* tractor unit, coupled tight to the trailer nose the way a real rig sits */
    var cab=bx(0.36,0.40,0.34,0xC22730); cab.position.set(0.62,0.375,0); truck.add(cab);
    var cabRf=bx(0.30,0.05,0.345,0xA81C24); cabRf.position.set(0.62,0.595,0); truck.add(cabRf);
    var wind=bx(0.025,0.15,0.29,0x0E1622,{rough:.22}); wind.position.set(0.805,0.455,0); truck.add(wind);
    var grille=bx(0.03,0.13,0.30,0x39424F); grille.position.set(0.808,0.265,0); truck.add(grille);
    var bump=bx(0.05,0.06,0.36,0x2A3446); bump.position.set(0.82,0.175,0); truck.add(bump);
    for(var hl=0;hl<2;hl++){ var lamp=bx(0.02,0.045,0.07,0xF2F5FA);
      lamp.position.set(0.822,0.235,hl?0.115:-0.115); truck.add(lamp); }
    [0.15,-0.15].forEach(function(sz){ var stk=cl(0.022,0.34,0x8A94A2);
      stk.position.set(0.435,0.44,sz); truck.add(stk); });
    var fifth=bx(0.22,0.05,0.26,0x39424F); fifth.position.set(0.32,0.195,0); truck.add(fifth);
    /* box trailer, nose almost touching the cab */
    var boxT=bx(1.28,0.50,0.36,0xE8EDF4); boxT.position.set(-0.28,0.47,0); truck.add(boxT);
    var bandT=bx(1.285,0.085,0.365,0xC22730); bandT.position.set(-0.28,0.305,0); truck.add(bandT);
    var boxRf=bx(1.29,0.035,0.37,0xD5DCE7); boxRf.position.set(-0.28,0.735,0); truck.add(boxRf);
    var doorT=bx(0.025,0.44,0.33,0xCBD4E0); doorT.position.set(-0.925,0.47,0); truck.add(doorT);
    /* ten wheels: steer axle, tractor tandem, trailer tandem */
    [0.68,0.22,0.06,-0.60,-0.76].forEach(function(ax){ for(var side=0;side<2;side++){
      var wh=cl(0.085,0.07,0x0D1420); wh.rotation.x=Math.PI/2;
      wh.position.set(ax,0.085,side?0.175:-0.175); truck.add(wh);
      var hub=cl(0.035,0.075,0x39424F); hub.rotation.x=Math.PI/2;
      hub.position.set(ax,0.085,side?0.178:-0.178); truck.add(hub); } });
    /* the truck is the only moving caster: drop its shadow so the static shadow map can be baked once */
    truck.traverse(function(n){ if(n.isMesh) n.castShadow=false; });
    truck.position.set(-9,0,3.05); g.add(truck);/* running the near lane of the widened carriageway */
    /* red site bollards: an even protective row along the front kerb, centred on the apron (x0.2),
       forward of the truck lane (z2.4 box reaches 2.57) and inside the side kerbs and front kerb (z2.77) */
    for(var b2=0;b2<9;b2++){var bd=cl(0.035,0.17,0xC22730); bd.position.set(-5.4+b2*1.4,0.085,1.79); g.add(bd);}
    /* parked cars in the painted bays: static, so their shadows bake with the site */
    function car(x,c){ var cg=new T.Group();
      var bd2=bx(0.285,0.105,0.60,c); bd2.position.y=0.113; cg.add(bd2);
      var cab2=bx(0.245,0.10,0.31,0x11192A,{rough:.3}); cab2.position.set(0,0.213,-0.02); cg.add(cab2);
      for(var cw=0;cw<4;cw++){ var wh2=cl(0.055,0.05,0x0D1420); wh2.rotation.z=Math.PI/2;
        wh2.position.set(cw%2?0.138:-0.138,0.055,cw<2?0.19:-0.19); cg.add(wh2); }
      cg.position.set(x,0,1.12); g.add(cg); }
    car(-5.09,0x9AA6B6); car(-3.85,0x3A4557); car(-2.61,0x7E1F27);
    resize(); onWin('resize',resize);
    if(window.ResizeObserver){try{var ro=_ro(resize);ro.observe(host);ro.observe(canvas);}catch(e){}}
    host.addEventListener('pointermove',function(e){
      var r=host.getBoundingClientRect();
      pxt=((e.clientX-r.left)/r.width-0.5); pyt=((e.clientY-r.top)/r.height-0.5);
    },{passive:true});
    host.addEventListener('pointerleave',function(){pxt=0;pyt=0;});
    renderer.render(scene,camera);
    /* bake the static shadow map once, then stop re-rendering it every frame (only the truck moves, and it no longer casts) */
    renderer.shadowMap.needsUpdate=true; renderer.render(scene,camera); renderer.shadowMap.autoUpdate=false;
    if(reduce) return;
    /* run immediately; the observer only pauses the loop when the footer is far offscreen */
    visb=true; raf=_raf(frame);
    /* watchdog: if rAF is being throttled by the embedder, step the scene on a timer */
    _setIv(function(){ if(document.hidden||!visb) return;
      if(performance.now()-lastF>700){ try{ frame(performance.now()); }catch(e){} } },350);
    if(window.IntersectionObserver){ try{ _io(function(es){ visb=es[0].isIntersecting;
      if(visb){ if(!raf) raf=_raf(frame); } else if(raf){ cancelAnimationFrame(raf); raf=null; } },{rootMargin:'200px'}).observe(host);
    }catch(e){ visb=true; if(!raf) raf=_raf(frame);} }
  }
  var lastF=0;
  function frame(ts){ raf=_raf(frame); lastF=performance.now(); if(!visb)return;
    var t=ts||0;
    px+=(pxt-px)*0.05; py+=(pyt-py)*0.05;
    /* orbit AROUND the campus centre (CX) with a gentle idle swing, so the model sits in the
       middle of the frame on every breakpoint instead of drifting to the right */
    var CX=0.3;/* campus bounding-box centre in x */
    var a=px*0.32+Math.sin(t*0.00005)*0.12;
    /* the canvas is now a WIDE contained strip, not a full-height band: camera sits closer and
       lower so the campus fills the strip while its full width stays in frame */
    var mob=canvas.clientWidth<720;
    var camR=mob?17.4:6.4, camH=(mob?4.6:3.0)+py*0.8;/* closer + lower: campus fills the strip end to end */
    camera.position.set(CX+Math.sin(a)*camR*0.55, camH, Math.cos(a)*camR*0.8+2.6);
    camera.lookAt(CX+px*0.5, mob?0.7:0.35, 0);
    beacons.forEach(function(b3,bi){ b3.material.opacity=0.35+0.65*Math.abs(Math.sin(t*0.0018+bi*1.7)); });
    if(truck){ var tp=((t*0.00013)%1); truck.position.x=-10+tp*20; }
    for(var fw=0;fw<folk.length;fw++){ var u2=folk[fw], w2=t*0.00038*u2.sp;
      u2.m.position.x=u2.x0+Math.sin(w2)*u2.range;
      u2.m.position.y=Math.abs(Math.sin(w2*7))*0.013;
      u2.m.rotation.y=Math.cos(w2)>0?Math.PI/2:-Math.PI/2; }
    if(dust){ dust.rotation.y=t*0.000012; }
    /* a light wind: each tree sways on its own phase, small enough that baked shadows still read true */
    for(var tw=0;tw<trees.length;tw++){ var tg2=trees[tw];
      tg2.rotation.z=Math.sin(t*0.0011+tg2.userData.ph)*0.024;
      tg2.rotation.x=Math.sin(t*0.0009+tg2.userData.ph*1.7)*0.014; }
    if(starMat){ starMat.opacity=0.68+0.22*Math.sin(t*0.0009); }
    if(clouds){ for(var ck=0;ck<clouds.length;ck++){ var ccl=clouds[ck]; ccl.position.x+=ccl.userData.sp*0.003; if(ccl.position.x>22)ccl.position.x=-22; } }
    renderer.render(scene,camera); }
  function resize(){ if(!renderer)return; var cr=canvas.getBoundingClientRect();
    var w=Math.round(cr.width)||host.clientWidth||600, h=Math.round(cr.height)||host.clientHeight||500;
    renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
    var mob=w<720;
    camera.position.set(0.3,mob?4.6:3.0,mob?17.4:7.7); camera.lookAt(0.3,mob?0.7:0.35,0);
    renderer.render(scene,camera); }
  try{init(THREE_MOD);}catch(err){}
})();

/* ---- the film: magnetic play button, expanding theatre ---- */
(function(){
  var card=document.getElementById('filmCard'), stage=document.getElementById('filmStage'),
      frame=document.getElementById('filmFrame'), closeB=document.getElementById('filmClose'),
      play=document.getElementById('filmPlay');
  if(!card||!stage) return;
  var VID='VUG1QFOCL2E';
  /* Loop preview plays ONLY on hover so scrolling stays light (no video decode during scroll). */
  var lp=document.getElementById('filmLoop');
  if(lp){
    var loaded=false;
    var reduceMo=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
    function ytPost(fn){ try{ lp.contentWindow.postMessage(JSON.stringify({event:'command',func:fn,args:''}),'*'); }catch(e){} }
    function loopIn(){
      if(reduceMo) return;
      if(!loaded){ loaded=true;
        lp.addEventListener('load',function(){ window.__revealOnPlay(lp,card); },{once:true});
        lp.src=lp.getAttribute('data-src');
      } else { card.classList.add('live'); ytPost('playVideo'); }
    }
    function loopOut(){ if(!loaded) return; card.classList.remove('live'); ytPost('pauseVideo'); }
    /* Ambient loop: plays only once the film is the focus of the viewport, pauses when you scroll
       away, so the video decodes when it is being watched and never fights a fast scroll-past. */
    if(window.IntersectionObserver){
      _io(function(es){ es.forEach(function(en){ if(en.isIntersecting) loopIn(); else loopOut(); }); },{threshold:0.55}).observe(card);
    }
    card.addEventListener('pointerenter',loopIn);
  }
  if(card && play && window.matchMedia && matchMedia('(hover:hover)').matches){
    card.addEventListener('pointermove',function(e){
      var r=card.getBoundingClientRect();
      var dx=(e.clientX-r.left-r.width/2)/r.width, dy=(e.clientY-r.top-r.height/2)/r.height;
      play.style.transform='translate('+(dx*46)+'px,'+(dy*34)+'px)';
    },{passive:true});
    card.addEventListener('pointerleave',function(){play.style.transform='translate(0,0)';});
  }
  function open(){
    stage.classList.add('open'); stage.setAttribute('aria-hidden','false');
    document.documentElement.style.overflow='hidden';
    frame.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+VID+'?autoplay=1&rel=0&modestbranding=1" title="The opening of the Bosch Penang plant, an IAQ project" allow="autoplay; encrypted-media; fullscreen" referrerpolicy="origin" allowfullscreen></iframe>';
  }
  function close(){
    stage.classList.remove('open'); stage.setAttribute('aria-hidden','true');
    document.documentElement.style.overflow='';
    _setTo(function(){frame.innerHTML='';},450);
  }
  card.addEventListener('click',open);
  card.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
  closeB.addEventListener('click',close);
  stage.addEventListener('click',function(e){if(e.target===stage)close();});
  onDoc('keydown',function(e){if(e.key==='Escape'&&stage.classList.contains('open'))close();});
})();

/* ---- services: the delivery cycle galaxy ---- */
(function(){
  var stage=document.getElementById('lpStage'); if(!stage) return;
  var canvas=document.getElementById('lpCv'), tagsHost=document.getElementById('lpTags');
  var D=[
    {name:'Engineering Design & Consultation',short:'Design',img:'/assets/cycle3d/design-ic.webp',kick:'Where the facility is decided',tag:'CSA · MEP',desc:'Concept to detailed design across CSA and MEP, with expert advice through the development of the project.',pts:['Concept to detailed design across CSA and MEP','Feasibility studies and value engineering','Regulatory submissions and authority liaison']},
    {name:'Procurement',short:'Procure',img:'/assets/cycle3d/procure-ic.webp',kick:'The right materials, the right partners, right on time',tag:'Supply chain',desc:'Tracked, organised sourcing aligned to project requirements, quality standards and budget constraints.',pts:['Vendor qualification and tender management','Long-lead equipment tracking','Sourcing aligned to quality and budget']},
    {name:'Construction',short:'Construct',img:'/assets/cycle3d/construct-ic.webp',kick:'Precision engineering, built to exact standards',tag:'EPCC · EPCM',desc:'Project management, coordination and communication through a construction programme tailored to each client, on schedule and within budget.',pts:['EPCC and EPCM delivery models','Site management across all trades','Schedule and cost control to handover']},
    {name:'Testing & Commissioning',short:'Commission',img:'/assets/cycle3d/commission-ic.webp',kick:'Proven performance before you move in',tag:'Validation',desc:'Established T&C programmes that prove every facility operates as intended, at its optimum, before handover.',pts:['ISO cleanroom classification testing','System performance verification','Certified documentation for handover']},
    {name:'Maintenance',short:'Maintain',img:'/assets/cycle3d/maintain-ic.webp',kick:'Protecting your investment, long after handover',tag:'Lifecycle',desc:'Planned maintenance that protects asset lifespan, minimises downtime and keeps facilities compliant.',pts:['Planned preventive maintenance programmes','Rapid breakdown response','Compliance and asset lifecycle care','Hands to tools hookup when the machines change']},
    {name:'Tools Hookup',short:'Hookup',img:'/assets/cycle3d/hookup-ic.webp',kick:'When the machines arrive, or upgrade',tag:'Total Tool Installation',desc:'Connecting production tools to the facility, from utilities tie-ins to final qualification. It feeds the next design.',pts:['Tool move-in and hook-up engineering','Process utilities tie-ins in live, classified environments','Qualification and handback to production','Feeds the next cycle: the facility re-equips']}
  ];
  var SVC_ROUTE=['/services/all#design','/services/all#procurement','/services/all#construction','/services/all#commissioning','/services/all#maintenance','/services/tool-installation'];
  var elMore=document.getElementById('lpMore');
  var elImg=document.getElementById('lpImg'),elNum=document.getElementById('lpNum'),elKick=document.getElementById('lpKick'),elTitle=document.getElementById('lpTitle'),elDesc=document.getElementById('lpDesc'),elList=document.getElementById('lpList'),elTag=document.getElementById('lpTag'),elStep=document.getElementById('lpStep'),card=document.getElementById('lpPanel');
  /* the ring (28 Aug): six stations at fixed 60 degree steps, the active one scaled up with the
     red arc turned onto it, and the six card renders stacked at the centre. Every position and
     every transition lives in CSS; this only flips classes and turns the arc. */
  var bubbles=[].slice.call(document.querySelectorAll('#lpBubbles .lpn'));
  var heroes=[].slice.call(document.querySelectorAll('#lpBubbles .lpv'));
  var bubbleHost=document.getElementById('lpBubbles');
  /* 14 Sep: the clips' playable windows, in seconds, measured off the decoded frames. Design and
     procure assemble from an empty base and take themselves apart again, so outside these windows
     the centre shows an empty pallet or a bare wireframe, which reads as "still loading". Each pair
     was chosen where the frames at a and b are near identical (mean pixel difference 0.3 and 0.1 of
     255), so the jump back is not visible. The other four hold their subject for the whole clip and
     loop natively. The default image (.lpv-still) is the frame at a. */
  /* 22 Sep (Bazil: "no cutting the visual"): construct had no window, and for the first and last two
     seconds of that clip the red beam is still ABOVE the source frame on its way down, so the frame's
     own top edge sliced it (measured: subject top at 0.000 for 10 of 24 samples). It now runs 2.73 to
     8.533: the beam is whole on its cable at both ends (top at 0.044), it still lands every time, and
     the two frames differ by 0.66 of 255. construct-still.webp was recut at 2.73 to match. */
  var CLIP_WIN=[{a:3.083,b:8.208},{a:4.417,b:7.75},{a:2.73,b:8.533},{a:0},{a:0},{a:0}];
  function clipWin(h){ return CLIP_WIN[+heroes[h].dataset.i]||{a:0}; }
  heroes.forEach(function(el,h){
    var vd=el.querySelector('video'); if(!vd) return;
    var w=clipWin(h);
    /* live = real frames on screen. 'playing' alone fires before the seek has painted, so wait for
       the first presented frame where the browser can tell us, and a timeupdate otherwise. */
    function markLive(){
      if(vd.paused) return;
      if(vd.requestVideoFrameCallback) vd.requestVideoFrameCallback(function(){ if(!vd.paused) el.classList.add('live'); });
      else el.classList.add('live');
    }
    vd.addEventListener('playing',markLive);
    vd.addEventListener('waiting',function(){ el.classList.remove('live'); });
    vd.addEventListener('emptied',function(){ el.classList.remove('live'); });
    if(w.b){
      /* frame-accurate where supported; timeupdate (every ~250ms) otherwise, and both windows end
         at least 0.3s before the clip starts to come apart, so the slower check still lands in time */
      /* 22 Sep: where only timeupdate is available the check can land a quarter second late, and the
         construct window ends a quarter second before the beam reaches the frame edge, so it turns early */
      var lead=vd.requestVideoFrameCallback?0:.25;
      var loopBack=function(){ if(vd.currentTime>=w.b-lead) vd.currentTime=w.a; };
      if(vd.requestVideoFrameCallback){
        var tick=function(){ loopBack(); vd.requestVideoFrameCallback(tick); };
        vd.requestVideoFrameCallback(tick);
      } else vd.addEventListener('timeupdate',loopBack);
    }
  });
  var GLB_SRC=['/assets/cycle3d/design.glb','/assets/cycle3d/procure.glb','/assets/cycle3d/construct.glb',
               '/assets/cycle3d/commission.glb','/assets/cycle3d/maintain.glb','/assets/cycle3d/hookup.glb'];
  /* The resting angle each mark HOLDS, dialled in one by one against the live render: the
     models whose identity lives on one face (the commissioning fan, the maintenance panel,
     the construct frame) sit square to the viewer; the volumetric ones (design building,
     procure crate, hookup cabinet) take a light three-quarter so they read as objects. */
  var MARK_REST=[-0.35,-0.35,0,0,0,-0.3];
  /* the arc only ever turns FORWARD: the wrap from stage 6 back to stage 1 is another 60
     degrees clockwise, not a 300 degree rewind, so the loop reads as one continuous cycle. */
  var rot=0,rotFrom=0,dial=document.getElementById('lpDial');
  function syncBubbles(i){
    if(bubbleHost){
      rot+=((i-rotFrom)%6+6)%6*60; rotFrom=i;
      bubbleHost.style.setProperty('--rot',rot+'deg');
    }
    /* the copy column's mini dial fills to the same fraction, on the same easing as the arc */
    if(dial)dial.style.setProperty('--prog',((i+1)/6).toFixed(4));
    for(var b=0;b<bubbles.length;b++){
      var bi=+bubbles[b].dataset.i;
      bubbles[b].classList.toggle('on',bi===i);
      bubbles[b].setAttribute('aria-pressed',bi===i?'true':'false');
    }
    /* only the stage on screen plays: six clips running at once is wasted decode, and the
       restart is deliberate — the beam should land, the panel should swing, every time. */
    for(var h=0;h<heroes.length;h++){
      var onH=+heroes[h].dataset.i===i;
      heroes[h].classList.toggle('on',onH);
      var vd=heroes[h].querySelector('video');
      if(vd){
        if(onH&&!reduce){
          heroes[h].classList.remove('live');
          try{vd.currentTime=clipWin(h).a;}catch(e){}
          var pr=vd.play(); if(pr&&pr.catch)pr.catch(function(){});
        }
        else { vd.pause(); heroes[h].classList.remove('live'); }
      }
    }
  }
  /* The kicker DECODES into place on every stage change, the same mono decode the section
     eyebrows use. The shared scrambler captures its text once at build time, so it cannot be
     re-pointed at new copy: this is the same effect, re-armed per stage. */
  var GLY='!<>-_\\/[]{}=+*^?#ABCDEFGHJKLMNPQRSTUVWXYZ0123456789',kickRaf=null,kickTx='';
  /* a decode in flight is driven by rAF, which STOPS while the tab is hidden: without this the
     kicker would sit as garbage until the tab came back. Snap it to the real text instead. */
  onDoc('visibilitychange',function(){
    if(document.hidden&&kickRaf){cancelAnimationFrame(kickRaf);kickRaf=null;if(elKick)elKick.textContent=kickTx;}
  });
  function decode(el,text){
    if(!el)return;
    kickTx=text;
    if(kickRaf){cancelAnimationFrame(kickRaf);kickRaf=null;}
    if(reduce||document.hidden){el.textContent=text;return;}
    var n=text.length,t0=0,last=0,g=new Array(n);
    function fr(ts){
      if(!t0)t0=ts;
      var ms=ts-t0,swap=(ts-last)>=26; if(swap)last=ts;
      var out='',done=0;
      for(var i=0;i<n;i++){
        var ch=text[i];
        if(ch===' '){out+=' ';done++;continue;}
        if(ms>=i*15+80){out+=ch;done++;}
        else{ if(swap||g[i]===undefined)g[i]=GLY[(Math.random()*GLY.length)|0]; out+=g[i]; }
      }
      el.textContent=out;
      if(done===n){kickRaf=null;return;}
      kickRaf=_raf(fr);
    }
    kickRaf=_raf(fr);
  }
  var touch=window.matchMedia&&matchMedia('(hover:none)').matches;
  var mobile=window.matchMedia&&matchMedia('(max-width:900px)').matches;
  if(touch){var hx=document.getElementById('lpHintTx');if(hx)hx.textContent='One continuous cycle · tap a stage';}
  var active=0,swapT=null,hover=false,inView=false,api=null;
  function pad(n){return String(n);}
  function fillPanel(i){
    var d=D[i];
    elNum.textContent=pad(i+1); if(elImg)elImg.src=d.img; decode(elKick,d.kick); elTitle.textContent=d.name; elDesc.textContent=d.desc;
    /* the list and meta row left the panel on the 28 Aug trim; guarded so the data stays usable */
    if(elList)elList.innerHTML=d.pts.map(function(p){return '<li>'+p+'</li>';}).join('');
    if(elTag)elTag.textContent=d.tag; if(elStep)elStep.textContent='Step '+pad(i+1)+' of 06';
    if(elMore)elMore.setAttribute('href',SVC_ROUTE[i]||'/services');var elMoreT=document.getElementById('lpMoreT');if(elMoreT)elMoreT.textContent='See '+d.name;
  }
  fillPanel(0);
  /* the panel is always on: content crossfades as the cycle travels */
  function swapPanel(i){
    card.classList.add('out');
    clearTimeout(swapT);
    swapT=_setTo(function(){fillPanel(i);card.classList.remove('out');},190);
  }
  function activate(i,user){
    if(i===active)return;
    var prev=active; active=i;
    syncBubbles(i);
    swapPanel(i);
    if(api)api.setActive(i,prev);
  }
  syncBubbles(0);
  bubbles.forEach(function(b){
    b.addEventListener('click',function(){activate(+b.dataset.i,true);});
    if(!touch)b.addEventListener('mouseenter',function(){activate(+b.dataset.i,true);});
  });
  var AUTO=5200;
  if(!reduce)_setIv(function(){ if(inView&&!hover&&!document.hidden)activate((active+1)%6,false); },AUTO);
  if(window.IntersectionObserver){
    _io(function(es){es.forEach(function(en){
      inView=en.isIntersecting;
      if(inView)stage.classList.add('go');
      /* the ring's slow turn only runs while the section is on screen */
      stage.classList.toggle('run',inView);
      if(api)api.setRun(inView);
    });},{threshold:.2}).observe(stage);
  } else { inView=true; stage.classList.add('go'); stage.classList.add('run'); }
  stage.addEventListener('pointerenter',function(){hover=true;});
  stage.addEventListener('pointerleave',function(){hover=false;});

  /* ---------- WebGL: the delivery cycle ----------
     Composition: 01 sits at the top, the sequence runs clockwise, the ring never drifts.
     Motion: ONE motion at a time. Choosing a stage eases it to the front and everything stops.
     States: stages behind the current one read as done, ahead of it as still to come. */
  function nogl(){ stage.classList.add('nogl'); canvas.style.display='none'; stage.classList.add('go'); }
  function init(T){
    var W=stage.clientWidth||700,H=stage.clientHeight||600;
    var renderer=_reg(new T.WebGLRenderer({canvas:canvas,antialias:true,alpha:true}));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.setSize(W,H,false);
    renderer.setClearColor(0x000000,0);
    if(T.ColorManagement)T.ColorManagement.enabled=false;
    /* products, not film: Khronos PBR Neutral keeps the reds red and only rolls off blown
       highlights, which is what lets the PBR models below read premium without washing the
       flat-colour rail around them */
    if(T.NeutralToneMapping!==undefined){ renderer.toneMapping=T.NeutralToneMapping; renderer.toneMappingExposure=1.0; }
    var scene=new T.Scene();
    var camera=new T.PerspectiveCamera(36,W/H,0.1,40);
    var camZ=5.6, camY=2.75;                       /* a steeper look, so the ring reads as a ring */
    camera.position.set(0,camY,camZ); camera.lookAt(0,-.02,0);

    /* ---- ONE SOURCE FOR THE SCREEN-SPACE LAYOUT ----
       fit() reserves room for the marks and the chips; the frame loop seats them in that room. The
       two must never disagree, so both read these numbers and neither owns a constant of its own.
       Pitch adapts to the stage's shape: a tall stage is filled by looking further down onto the
       ring, a wide one by looking across it, and the projected ellipse follows either way. */
    function layout(w,h){
      var sta=Math.max(58,Math.min(152,h*.152));            /* the station disc, on screen (28 Aug: bigger ring pass) */
      var mark=sta*.88;                                     /* the mark's silhouette, inside it */
      /* the chip shrinks on a phone (see the mobile block in home.css), and reserving the desktop
         height for it there costs a fifth of a short stage and shrinks the whole ring */
      var chip=h<420?17:25;
      var drop=sta*.5+8+chip*.5;                           /* node centre -> chip centre */
      /* Pitch is a FRAMING decision, not a taste one. On a near-square stage the ring is limited by
         the stage width, so looking further down on it costs nothing horizontally and buys back the
         dead band above and below. On a wide stage the opposite holds: every degree of extra pitch
         narrows the ellipse and wastes the width that was the whole advantage. Measured across
         both, the fill peaks around 47 degrees square and 26 degrees wide. */
      var k=Math.max(0,Math.min(1,(1.5-w/Math.max(1,h))/.5));
      return {sta:sta,mark:mark,drop:drop,chip:chip,pitch:.62+.52*k};
    }

    scene.add(new T.AmbientLight(0xffffff,.9));
    var kl=new T.DirectionalLight(0xffffff,.75); kl.position.set(-2.4,4.2,3); scene.add(kl);
    var fl2=new T.DirectionalLight(0xDCE6F6,.4); fl2.position.set(2.8,1.4,-2.4); scene.add(fl2);

    /* The stage marks are real models now, and a model needs its own depth: they render in this
       overlay scene AFTER a depth clear, so each model self-occludes correctly while the set as a
       whole always draws over the rail and the discs. Same camera, its own lights. */
    var ovl=new T.Scene();
    /* image-based studio lighting: the metals and clearcoats below are mirrors of this
       environment, which is what makes them read as machined objects instead of clay */
    var _pmrem=new T.PMREMGenerator(renderer);
    var _envRT=null;
    try{ _envRT=_pmrem.fromScene(new RoomEnvironment(),.04); ovl.environment=_envRT.texture; }catch(e){}
    _pmrem.dispose();
    ovl.add(new T.AmbientLight(0xffffff,.18));
    var ovK=new T.DirectionalLight(0xffffff,1.25); ovK.position.set(-2.2,3.8,3.2); ovl.add(ovK);
    var ovR=new T.DirectionalLight(0xEAF2FF,.7); ovR.position.set(2.6,1.8,-2.6); ovl.add(ovR);
    renderer.autoClear=false;

    /* one palette, one job each: ink draws, red marks the current stage, nothing else is red */
    var INK=new T.Color(0x3E4A63), DONE=new T.Color(0x7A879F), AHEAD=new T.Color(0x97A2B6), RED=new T.Color(0xEC2027);
    var uni=new T.Group(); scene.add(uni);
    var sys=new T.Group(); uni.add(sys);
    var R=2.02, STEP=Math.PI*2/6, A0=-Math.PI/2;   /* 01 at the top, clockwise from there */
    function angOf(i){ return A0+i*STEP; }
    function ptOn(a,y){ return new T.Vector3(R*Math.cos(a),y||0,R*Math.sin(a)); }

    /* the ring itself: the strongest line in the picture */
    /* 28 Aug minimalist pass (client): ONE hairline ring. The old rail was a heavy tube that
       read as a pipe next to the equally heavy red arc. */
    var rail=new T.Mesh(new T.TorusGeometry(R,.0055,10,280),
      new T.MeshBasicMaterial({color:0x9AA6BA,transparent:true,opacity:.55}));
    rail.rotation.x=Math.PI/2; sys.add(rail);

    /* travelled distance: five pre-built arcs, 01 up to the current stage. Never ambiguous. */
    var arcs=[];
    for(var ai=0;ai<6;ai++){
      if(ai===0){ arcs.push(null); continue; }
      var pts=[]; for(var s=0;s<=ai*30;s++){ pts.push(ptOn(A0+(s/30)*STEP,.004)); }
      /* the travelled arc matches the rail's weight now: a red line, not a red band */
      var tube=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),ai*30,.0075,10,false),
        new T.MeshBasicMaterial({color:0xEC2027}));
      tube.visible=false; sys.add(tube); arcs.push(tube);
    }

    /* direction: five arrowheads glide slowly along the ring, so the journey itself is the motion.
       They dim as they pass a station node, then re-emerge on the other side. */
    /* 28 Aug minimalist pass: THREE small chevrons instead of six heavy arrowheads — the
       direction still reads, the ring stops looking like a diagram of itself. */
    var dirs=[], NDIR=3;
    for(var cv=0;cv<NDIR;cv++){
      var sh2=new T.Shape(); sh2.moveTo(.072,0); sh2.lineTo(-.042,.046); sh2.lineTo(-.021,0); sh2.lineTo(-.042,-.046);
      var cm=new T.Mesh(new T.ShapeGeometry(sh2),
        new T.MeshBasicMaterial({color:0x8894AB,transparent:true,opacity:.75,side:T.DoubleSide}));
      cm.rotation.x=-Math.PI/2;
      /* parked at the MIDPOINT between two stations, so a chevron never collides with a mark */
      dirs.push({m:cm,u:(cv*2+.5)/6});
      sys.add(cm);
    }
    /* 28 Aug (client: the arrows look bad and not aligned). They used to travel the ring and
       fade in and out against the active stage, so at any moment some sat half-faded and all
       of them floated .034 above a rail that is now a hairline. Each chevron is now PARKED on
       the line at a fixed angle at full strength; the ring's own turn carries them, which is
       the only motion the direction needs. */
    function seatDir(d){
      var a=A0+d.u*Math.PI*2;
      d.m.position.copy(ptOn(a,.006));
      d.m.rotation.z=-a-Math.PI/2;
    }
    dirs.forEach(seatDir);

    /* the core: an armillary of three fine rings around a small red centre. Few lines, much space. */
    var coreG=new T.Group(); sys.add(coreG);
    function circlePts2(r,n){ var p=[]; for(var k=0;k<(n||96);k++){var a2=k/(n||96)*Math.PI*2;
      p.push(new T.Vector3(r*Math.cos(a2),r*Math.sin(a2),0));} return p; }
    var CR=.42;
    function hoop(r,op,tx,ty){
      var m=new T.LineLoop(new T.BufferGeometry().setFromPoints(circlePts2(r)),
        new T.LineBasicMaterial({color:0x9BA5B8,transparent:true,opacity:op}));
      m.rotation.x=tx||0; m.rotation.y=ty||0;
      var g2=new T.Group(); g2.add(m); coreG.add(g2); return g2;
    }
    /* an armillary needs an equator and MERIDIANS. Three hoops that all present near head-on
       overlap into a single lens shape and read as an eye, not a cage. */
    /* 28 Aug premium pass: one equator + one soft meridian. Three hoops plus six spoke
       wires read as a cage; the calm core is the equator, one drifting meridian, the jewel. */
    var h1=hoop(CR,.38,Math.PI/2,0);             /* the equator, lying in the ring's own plane */
    var h2=hoop(CR*.94,.16,1.2,0);
    var h3=hoop(CR*.94,0,1.2,1.05); h3.visible=false;

    /* the centre: small, jewel-like, with the faintest bloom */
    var core=new T.Mesh(new T.SphereGeometry(.06,28,28),new T.MeshBasicMaterial({color:0xEC2027}));
    coreG.add(core);
    var coreGlow=new T.Mesh(new T.SphereGeometry(.155,22,22),
      new T.MeshBasicMaterial({color:0xEC2027,transparent:true,opacity:.085,depthWrite:false}));
    coreG.add(coreGlow);
    /* 28 Aug: the info panel lives at the centre now, so the 3D core stands down.
       The group and its animation stay (cheap, invisible) for an easy revert. */
    coreG.visible=false;

    /* 28 Aug, revised same day to the rolodex reference (client: "cleaner"): the tick
       dial is gone — ONE faint outer hoop is all the garnish the ellipse carries. */
    /* the second outer hoop is gone with the 28 Aug minimalist pass: one ring, one line. */

    /* one wire per stage, and a quiet pulse that runs out along it */
    /* 28 Aug premium pass: the spoke wires and their pulses are retired from the picture.
       The materials and pulse records stay (the stage logic still tints links[] and the
       frame loop still steps pulses), but nothing is added to the scene: the wheel is now
       just the rail, the travelled arc, the arrows and the core. */
    var links=[], pulses=[];
    for(var lk=0;lk<6;lk++){
      var lmat=new T.LineBasicMaterial({color:AHEAD.clone(),transparent:true,opacity:.3});
      links.push(lmat);
      var pm=new T.Mesh(new T.SphereGeometry(.019,10,10),
        new T.MeshBasicMaterial({color:0xEC2027,transparent:true,opacity:0,depthWrite:false}));
      pulses.push({m:pm,a:angOf(lk),t:lk/6});
    }

    /* ---- ONE ICON GRAMMAR, BUILT AS REAL OBJECTS ----
       Six miniature 3D models, one per stage, replacing the old textured planes (client call,
       7 Aug: the marks must read as engineered 3D, not stickers). Shared rules: every model fits
       a unit-diameter envelope, is built from the same four-colour palette, and carries EXACTLY
       ONE accent part that reads red only while its stage is current. The models live in an
       overlay scene rendered after a depth clear, so they self-occlude correctly while always
       drawing over the rail and the discs. State reads through colour, never through alpha:
       faded stages desaturate toward the page colour, which avoids every transparency-sorting
       artifact a lit model would otherwise hit. */
    var M_INK=0x1F2940, M_MID=0x9AA6BA, M_LITE=0xDDE4EF, M_EDGE=0x161F33, M_GREY=0x59616E;
    /* one PBR wardrobe for every model: graphite housings, brushed steel, painted panels and
       one glossy red accent. Values from the product-material recipes, tuned for 60 to 100 px. */
    function lam(c){
      if(c===0xEC2027) return new T.MeshPhysicalMaterial({color:0xE01B22,metalness:.08,roughness:.3,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:.85});
      if(c===M_MID)    return new T.MeshPhysicalMaterial({color:0xB9C3D2,metalness:.92,roughness:.3,envMapIntensity:1.25});
      if(c===M_LITE)   return new T.MeshPhysicalMaterial({color:0xC2CCDA,metalness:.55,roughness:.32,clearcoat:.6,clearcoatRoughness:.12,envMapIntensity:1.15});
      return new T.MeshPhysicalMaterial({color:c,metalness:.25,roughness:.48,clearcoat:.45,clearcoatRoughness:.22,envMapIntensity:.95});
    }
    function edges(geo,op){ return new T.LineSegments(new T.EdgesGeometry(geo,30),
      new T.LineBasicMaterial({color:M_EDGE,transparent:true,opacity:op||.42})); }
    /* the soft contact shadow that stops a model floating: one shared radial texture */
    var _shTex=(function(){ var cv=document.createElement('canvas'); cv.width=cv.height=128;
      var c=cv.getContext('2d'); var g=c.createRadialGradient(64,64,6,64,64,62);
      g.addColorStop(0,'rgba(16,22,38,.55)'); g.addColorStop(.55,'rgba(16,22,38,.18)'); g.addColorStop(1,'rgba(16,22,38,0)');
      c.fillStyle=g; c.fillRect(0,0,128,128); var tx=new T.CanvasTexture(cv); return tx; })();
    function contactShadow(y,sc){
      var m=new T.Mesh(new T.PlaneGeometry(1,1),
        new T.MeshBasicMaterial({map:_shTex,transparent:true,depthWrite:false,toneMapped:false,opacity:.55}));
      m.rotation.x=-Math.PI/2; m.position.y=y; m.scale.set(sc,sc*.82,1); m.renderOrder=-1;
      m.userData.noPaint=true; return m;
    }
    function boxM(w,h,d,mat){ var g=new T.BoxGeometry(w,h,d); var m=new T.Mesh(g,mat); m.add(edges(g)); return m; }

    function finishGlyph(g,spin){
      spin.add(contactShadow(-.46,.95));
      var mats=[];
      g.traverse(function(o){ var m=o.material; if(m&&!m.userData.noPaint&&mats.indexOf(m)<0&&o.userData.noPaint!==true)mats.push(m); });
      mats=mats.filter(function(m){ return !m.userData.noPaint&&m.map!==_shTex; });
      mats.forEach(function(m){
        m.userData.base=m.color.clone();
        /* fade less than before: the washed-out ghosts were what read as cheap. State still
           reads through the red accent, the scale pop and the disc rim. */
        m.userData.faded=m.color.clone().lerp(PLATE,.16);
      });
      var grey=new T.Color(M_GREY);
      g.userData.paint=function(strength,lit){
        for(var i2=0;i2<mats.length;i2++){ var m=mats[i2];
          if(m.userData.accent) m.color.copy(grey).lerp(RED,lit);
          else m.color.copy(m.userData.faded).lerp(m.userData.base,strength);
        }
      };
      g.userData.spin=spin;
      g.userData.env=1; g.userData.rad=.45; g.userData.fixedRad=true;
      g.matrixAutoUpdate=false;
      return g;
    }

    /* 01 Design: a blueprint that draws itself. Grid floor, a wireframe building, and a red
       survey plane that sweeps the volume while the stage is live. */
    function buildDesign(){
      var g=new T.Group(), sp=new T.Group(); g.add(sp);
      var gp=[]; for(var k=-2;k<=2;k++){ gp.push(new T.Vector3(k*.2,-.24,-.4),new T.Vector3(k*.2,-.24,.4));
        gp.push(new T.Vector3(-.4,-.24,k*.2),new T.Vector3(.4,-.24,k*.2)); }
      sp.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(gp),
        new T.LineBasicMaterial({color:M_MID,transparent:true,opacity:.55})));
      var m1=boxM(.44,.26,.3,lam(M_LITE)); m1.position.y=-.11; sp.add(m1);
      var m2=boxM(.2,.22,.18,lam(M_MID)); m2.position.set(-.06,.13,0); sp.add(m2);
      var m3=boxM(.12,.1,.12,lam(M_INK)); m3.position.set(.12,.07,.02); sp.add(m3);
      var scanM=lam(0xEC2027); scanM.userData.accent=true;
      var scan=new T.Mesh(new T.BoxGeometry(.5,.006,.38),scanM); scan.position.y=-.2; sp.add(scan);
      g.userData.anim=function(t,dt,lit){
        sp.rotation.y+=dt*.5;
        var p=(t*.5)%1;
        scan.position.y=-.22+(0.06+0.4*lit)*p;
        scan.material.opacity=1;
      };
      return finishGlyph(g,sp);
    }

    /* 02 Procure: the crate. The lid lifts while live and three parcels orbit in to be packed. */
    function buildProcure(){
      var g=new T.Group(), sp=new T.Group(); g.add(sp);
      var body=boxM(.4,.34,.4,lam(M_MID)); body.position.y=-.08; sp.add(body);
      var strapM=lam(0xEC2027); strapM.userData.accent=true;
      var st1=new T.Mesh(new T.BoxGeometry(.42,.05,.06),strapM); st1.position.y=-.08; sp.add(st1);
      var st2=new T.Mesh(new T.BoxGeometry(.06,.05,.42),strapM); st2.position.y=-.08; sp.add(st2);
      var lid=boxM(.44,.05,.44,lam(M_LITE)); lid.position.y=.12; sp.add(lid);
      var sats=[];
      for(var i2=0;i2<3;i2++){ var sat=boxM(.09,.09,.09,lam(M_LITE)); sat.visible=false; sp.add(sat); sats.push(sat); }
      g.userData.anim=function(t,dt,lit){
        sp.rotation.y+=dt*.45;
        lid.position.y=.12+lit*.16;
        lid.rotation.z=lit*.24;
        for(var i3=0;i3<3;i3++){ var a=t*1.7+i3*2.094, sa=sats[i3];
          sa.visible=lit>.03;
          sa.position.set(Math.cos(a)*.33,.3+Math.sin(t*2.1+i3)*.05,Math.sin(a)*.33);
          sa.scale.setScalar(Math.max(.001,lit));
          sa.rotation.y=a;
        }
      };
      return finishGlyph(g,sp);
    }

    /* 03 Construct: slab, columns and a live tower crane whose red hook works while the stage is
       current. */
    function buildConstruct(){
      var g=new T.Group(), sp=new T.Group(); g.add(sp);
      var base=boxM(.5,.045,.36,lam(M_MID)); base.position.y=-.21; sp.add(base);
      for(var cx=-1;cx<=1;cx+=2)for(var cz=-1;cz<=1;cz+=2){
        var col=boxM(.032,.3,.032,lam(M_INK)); col.position.set(cx*.2,-.04,cz*.13); sp.add(col); }
      var roof=boxM(.5,.04,.36,lam(M_LITE)); roof.position.y=.13; sp.add(roof);
      var mast=new T.Mesh(new T.CylinderGeometry(.014,.014,.62,8),lam(M_INK)); mast.position.set(.31,.06,0); sp.add(mast);
      var jib=boxM(.4,.022,.022,lam(M_INK)); jib.position.set(.12,.36,0); sp.add(jib);
      var lineM=new T.LineBasicMaterial({color:M_EDGE,transparent:true,opacity:.8});
      var lineG=new T.BufferGeometry().setFromPoints([new T.Vector3(0,0,0),new T.Vector3(0,-.16,0)]);
      var hoist=new T.Line(lineG,lineM); hoist.position.set(-.05,.35,0); sp.add(hoist);
      var hookM=lam(0xEC2027); hookM.userData.accent=true;
      var hook=new T.Mesh(new T.BoxGeometry(.055,.05,.055),hookM); hook.position.set(-.05,.17,0); sp.add(hook);
      g.userData.anim=function(t,dt,lit){
        sp.rotation.y+=dt*.4;
        var p=.5+.5*Math.sin(t*(0.7+lit*1.4));
        var drop=-.16-(.12*lit)*p;
        hoist.geometry.attributes.position.setY(1,drop); hoist.geometry.attributes.position.needsUpdate=true;
        hook.position.y=.35+drop-.025;
      };
      return finishGlyph(g,sp);
    }

    /* 04 Commission: the FFU fan, face on. Blades idle slowly and spin up while live; the red hub
       cap is the accent. Sways rather than yaws so the fan never turns edge on. */
    function buildCommission(){
      var g=new T.Group(), sp=new T.Group(); g.add(sp);
      var ring=new T.Mesh(new T.TorusGeometry(.3,.034,12,48),lam(M_MID)); sp.add(ring);
      var hub=new T.Mesh(new T.CylinderGeometry(.07,.07,.07,20),lam(M_LITE)); hub.rotation.x=Math.PI/2; sp.add(hub);
      var capM=lam(0xEC2027); capM.userData.accent=true;
      var cap=new T.Mesh(new T.CylinderGeometry(.045,.045,.02,18),capM); cap.rotation.x=Math.PI/2; cap.position.z=.045; sp.add(cap);
      var blades=new T.Group(); blades.position.z=.012; sp.add(blades);
      for(var b3=0;b3<4;b3++){ var bl=new T.Mesh(new T.BoxGeometry(.21,.075,.014),lam(M_INK));
        var hold=new T.Group(); hold.rotation.z=b3*Math.PI/2; bl.position.x=.15; bl.rotation.x=.5;
        hold.add(bl); blades.add(hold); }
      var leg1=boxM(.03,.16,.03,lam(M_INK)); leg1.position.set(-.14,-.4,0); leg1.rotation.z=.3; sp.add(leg1);
      var leg2=boxM(.03,.16,.03,lam(M_INK)); leg2.position.set(.14,-.4,0); leg2.rotation.z=-.3; sp.add(leg2);
      g.userData.anim=function(t,dt,lit){
        sp.rotation.y=Math.sin(t*.5)*.55;
        blades.rotation.z-=dt*(1.1+lit*9);
      };
      return finishGlyph(g,sp);
    }

    /* 05 Maintain: two meshing gears, counter-rotating, quickening while live. Red centre cap. */
    function buildMaintain(){
      var g=new T.Group(), sp=new T.Group(); g.add(sp);
      function gear(r,teeth,mat,tw){
        var gr=new T.Group();
        var disc=new T.Mesh(new T.CylinderGeometry(r,r,.06,28),mat); disc.rotation.x=Math.PI/2; gr.add(disc);
        for(var k2=0;k2<teeth;k2++){ var th=new T.Mesh(new T.BoxGeometry(tw,tw*.78,.055),mat);
          var a=k2/teeth*Math.PI*2; th.position.set(Math.cos(a)*(r+tw*.36),Math.sin(a)*(r+tw*.36),0); th.rotation.z=a; gr.add(th); }
        return gr;
      }
      var mA=lam(M_MID), mB=lam(M_MID);
      var A=gear(.185,8,mA,.075); A.position.set(-.1,-.08,0); sp.add(A);
      var B=gear(.115,6,mB,.06); B.position.set(.185,.135,0); sp.add(B);
      var capM=lam(0xEC2027); capM.userData.accent=true;
      var cap=new T.Mesh(new T.CylinderGeometry(.05,.05,.075,18),capM); cap.rotation.x=Math.PI/2; cap.position.copy(A.position); sp.add(cap);
      g.userData.anim=function(t,dt,lit){
        sp.rotation.y=Math.sin(t*.45+1)*.5;
        A.rotation.z+=dt*(.5+lit*2.4);
        B.rotation.z-=dt*(.5+lit*2.4)*(8/6);
      };
      return finishGlyph(g,sp);
    }

    /* 06 Tools Hookup: a process tool docking to the facility. Overhead service rail, a red
       umbilical dropping to the tool, and a charge that travels the line while the stage is live. */
    function buildHookup(){
      var g=new T.Group(), sp=new T.Group(); g.add(sp);
      var tool=boxM(.3,.4,.24,lam(M_LITE)); tool.position.set(-.11,-.05,0); sp.add(tool);
      var panel=boxM(.22,.1,.015,lam(M_MID)); panel.position.set(-.11,.02,.125); sp.add(panel);
      var rail=boxM(.5,.032,.07,lam(M_INK)); rail.position.y=.33; sp.add(rail);
      var curve=new T.CatmullRomCurve3([
        new T.Vector3(.2,.31,0), new T.Vector3(.24,.12,.02),
        new T.Vector3(.06,.03,.03), new T.Vector3(-.11,.16,0)]);
      var tubeM=lam(0xEC2027); tubeM.userData.accent=true;
      sp.add(new T.Mesh(new T.TubeGeometry(curve,24,.018,8,false),tubeM));
      var plug=boxM(.06,.05,.06,lam(M_INK)); plug.position.set(-.11,.17,0); sp.add(plug);
      var charge=new T.Mesh(new T.SphereGeometry(.026,12,12),lam(M_LITE)); charge.visible=false; sp.add(charge);
      g.userData.anim=function(t,dt,lit){
        sp.rotation.y+=dt*.42;
        charge.visible=lit>.03;
        if(charge.visible){ var p=(t*.8)%1; curve.getPoint(p,charge.position); charge.scale.setScalar(Math.max(.001,lit)); }
      };
      return finishGlyph(g,sp);
    }

    var GLYPH_BUILDERS=[buildDesign,buildProcure,buildConstruct,buildCommission,buildMaintain,buildHookup];

    /* ---- premium marks (23 Aug): each stage's generated PBR model replaces its procedural
       glyph IN PLACE once its GLB arrives. The procedural build stays as the instant paint
       and the fallback, so a slow network or a missing file can never blank a station. */
    var _glbLive=[],_glbScene=[null,null,null,null,null,null],_regauge=null;
    function _swapIn(g,i){
      var sc=_glbScene[i]; if(!sc||!g.userData.spin) return;
      var sp=g.userData.spin;
      /* keep the shared contact shadow, clear the procedural parts */
      for(var k=sp.children.length-1;k>=0;k--){ var ch=sp.children[k];
        if(!(ch.material&&ch.material.map===_shTex)) sp.remove(ch); }
      var inst=sc.clone(true);
      /* normalise to the one-envelope rule: fit a .9 diameter, feet on the shadow plane,
         centred on the model's own footprint */
      var bb=new T.Box3().setFromObject(inst), sz=new T.Vector3(), cn=new T.Vector3();
      bb.getSize(sz); bb.getCenter(cn);
      var s=.9/(Math.max(sz.x,sz.y,sz.z)||1);
      inst.scale.setScalar(s);
      inst.position.set(-cn.x*s,-.46-bb.min.y*s,-cn.z*s);
      sp.add(inst);
      /* the generated textures carry their lighting BAKED IN, so the models render UNLIT:
         lighting them again through the studio rig was what washed the set out. State still
         reads through a colour tint over the baked map. */
      var mats=[];
      inst.traverse(function(o){ if(o.isMesh&&o.material){
        var src=o.material;
        var nm=new T.MeshBasicMaterial({map:src.map||null,toneMapped:false});
        if(!src.map&&src.color)nm.color.copy(src.color);
        o.material=nm; mats.push(nm); o.frustumCulled=false; } });
      var WHITE=new T.Color(0xffffff), FADE=new T.Color(0xffffff).lerp(PLATE,.35);
      g.userData.paint=function(strength){ for(var m2=0;m2<mats.length;m2++) mats[m2].color.copy(FADE).lerp(WHITE,strength); };
      /* 28 Aug (client: the marks look messy and weird): they used to turn CONTINUOUSLY
         (sp.rotation.y += dt*.4), so every model was caught at whatever angle the clock
         landed on — backs, edges, blank sides. Each model now HOLDS its own presentation
         angle, tuned per stage below, and nothing on the ring rotates. */
      sp.rotation.y=MARK_REST[i]||0;
      g.userData.anim=null;
      g.userData.paint(1);
      /* hand the swapped model to the shared silhouette gauge so all six seat at one size */
      g.userData.fixedRad=false;
      if(_regauge)_regauge();
    }
    function _armGlb(){
      var loader=new GLTFLoader();
      GLB_SRC.forEach(function(src,i){
        loader.load(src,function(gltf){ if(dead)return; _glbScene[i]=gltf.scene;
          for(var k=0;k<_glbLive.length;k++){ if(_glbLive[k].i===i)_swapIn(_glbLive[k].g,i); }
        },undefined,function(){ /* missing file: the procedural mark simply stays */ });
      });
    }
    function makeGlyph(i){ var g=GLYPH_BUILDERS[i]();
      _glbLive.push({g:g,i:i}); if(_glbScene[i])_swapIn(g,i); return g; }
    _armGlb();

    /* The six stages, fixed on the ring.
       GEOMETRY lives in 3D: the rail, the nodes, the core. ANNOTATION lives in screen space: the
       marks and the name chips. That split is the whole layout rule. A mark seated in 3D renders
       at a different size and a different height for every stage, because every stage sits at a
       different depth, which is why the set used to read as scattered. Seated in screen space it
       is the same size and the same lift above its own node for all five, at any rotation.
       The mast is then drawn to wherever the mark actually landed, so nothing floats loose. */
    /* the page colour, so a station can mask the rail behind it without hard-coding a hex that
       would drift the day the token moves */
    var PLATE=new T.Color((getComputedStyle(document.documentElement)
                .getPropertyValue('--bg')||'').trim()||'#F7F9FC');
    var stations=[],hits=[];
    for(var i=0;i<6;i++){
      var g=new T.Group(); g.position.copy(ptOn(angOf(i)));
      /* Everything that reads as a station lives on one billboarded face: a disc that masks the
         rail, a rim carrying the stage's state, and the mark inside it. Drawn without depth so the
         face always sits over the rail it interrupts, and ordered so rail < disc < rim < mark. */
      var face=new T.Group(); face.frustumCulled=false; g.add(face);
      var plate=new T.Mesh(new T.CircleGeometry(1,56),
        new T.MeshBasicMaterial({color:PLATE,depthTest:false,depthWrite:false}));
      plate.renderOrder=2; plate.frustumCulled=false; face.add(plate);
      /* discs retired with the photoreal marks (23 Aug): the models carry the station on
         their own; the rail simply passes behind them */
      plate.visible=false;
      var rimM=new T.LineBasicMaterial({color:AHEAD.clone(),transparent:true,opacity:.55,depthTest:false});
      var rimP=[]; for(var rk=0;rk<=72;rk++){ var ra=rk/72*Math.PI*2;
        rimP.push(new T.Vector3(Math.cos(ra),Math.sin(ra),0)); }
      var rim=new T.Line(new T.BufferGeometry().setFromPoints(rimP),rimM);
      rim.renderOrder=3; rim.frustumCulled=false; face.add(rim);
      rim.visible=false;
      /* the anchor holds the seat (scale, float, lag) inside the billboarded face; the model
         itself lives in the overlay scene and copies the anchor's world matrix every frame */
      var anchor=new T.Group(); face.add(anchor);
      var glyph=makeGlyph(i); glyph.frustumCulled=false;
      glyph.traverse(function(o){ o.frustumCulled=false; });
      ovl.add(glyph);
      var hit=new T.Mesh(new T.SphereGeometry(.34,10,10),
        new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,depthTest:false}));
      hit.userData.i=i; hit.frustumCulled=false; g.add(hit); hits.push(hit);
      sys.add(g);
      stations.push({g:g,face:face,plate:plate,rim:rim,rimM:rimM,anchor:anchor,glyph:glyph,hit:hit,a:angOf(i),lit:0});
    }
    /* art-direction hook: lets the resting angle of each mark be dialled in from the console
       against the live render, which is the only honest way to pick one. Read-only helper. */
    window.__lpSt=stations;

    /* ---- ONE OPTICAL ENVELOPE FOR ALL FIVE MARKS ----
       Measuring a mark's bounding BOX and dividing by its longest side is not the same thing as
       making two marks look the same size. A flat gear and a tumbled crate have similar box sides
       but cast very different silhouettes once the face is pitched toward the viewer, and measured
       that way the set runs a third larger at one station than another, with the biggest marks
       touching the rim of their own disc. Measure instead the radius of the silhouette each mark
       actually casts AT THE ANGLE IT WILL BE SEEN FROM, and normalise on that: every mark then
       fills the same circle inside its disc. Only the camera pitch feeds this, so it is recomputed
       when the camera refits rather than every frame. */
    var _gv=new T.Vector3(), _gq=new T.Quaternion(), _ge=new T.Euler();
    function gaugeGlyphs(tilt){
      _gq.setFromEuler(_ge.set(tilt,0,0));
      for(var gi=0;gi<stations.length;gi++){
        var gg=stations[gi].glyph, best=0;
        if(gg.userData.fixedRad) continue;
        var keepQ=gg.quaternion.clone(), keepS=gg.scale.clone();
        gg.quaternion.identity(); gg.scale.set(1,1,1); gg.updateMatrixWorld(true);
        gg.traverse(function(o){
          var pos=o.geometry&&o.geometry.attributes&&o.geometry.attributes.position;
          if(!pos)return;
          for(var k=0;k<pos.count;k++){
            _gv.set(pos.getX(k),pos.getY(k),pos.getZ(k));
            o.localToWorld(_gv); gg.worldToLocal(_gv); _gv.applyQuaternion(_gq);
            var rr=_gv.x*_gv.x+_gv.y*_gv.y; if(rr>best)best=rr;
          }
        });
        gg.userData.rad=Math.sqrt(best)||.13;
        gg.quaternion.copy(keepQ); gg.scale.copy(keepS);
      }
    }

    /* the one travelling thing, and only while a stage is being handed over */
    var comet=new T.Mesh(new T.SphereGeometry(.052,16,16),new T.MeshBasicMaterial({color:0xEC2027}));
    comet.visible=false; sys.add(comet);

    /* labels: one rule, always outboard on the node's own radius */
    var tags=[];
    for(var l=0;l<6;l++){
      var b=document.createElement('button');
      b.type='button'; b.className='lp-tag'+(l===0?' on':''); b.setAttribute('aria-label',D[l].name);
      b.innerHTML='<span class="no">'+pad(l+1)+'</span><span class="nm">'+D[l].short+'</span>';
      (function(li){
        b.addEventListener('click',function(){activate(li,true);});
        if(!touch)b.addEventListener('mouseenter',function(){activate(li,true);});
      })(l);
      tagsHost.appendChild(b); tags.push(b);
    }
    function placeCoreTag(){}

    /* ---- MOTION: one eased turn per selection, then rest ---- */
    var ry=0, ryFrom=0, ryTo=0, tw=1, TWD=.9;      /* tw = 1 means settled */
    var FRONT=Math.PI/2;                            /* the chosen stage comes to the near side */
    function targetFor(i){ return stations[i].a-FRONT; }
    function shortest(from,to){ var d=to-from; while(d>Math.PI)d-=Math.PI*2; while(d<-Math.PI)d+=Math.PI*2; return from+d; }
    ry=ryTo=ryFrom=targetFor(0); sys.rotation.y=ry;
    var cm={on:false,t:0,from:0,to:0};

    api={
      setActive:function(i,prev){
        actPX=ptrCX; actPY=ptrCY;
        ryFrom=ry; ryTo=shortest(ry,targetFor(i)); tw=0;
        cm.on=true; cm.t=0; cm.from=stations[prev].a; cm.to=stations[i].a; comet.visible=true;
        arcs.forEach(function(a2,k){ if(a2)a2.visible=(k===i); });
        if(mini)mini.show(i);
        tags.forEach(function(t2,k){t2.classList.toggle('on',k===i);});
      },
      setRun:function(v){ if(v&&!looping){looping=true;_raf(frame);} }
    };
    arcs.forEach(function(a2,k){ if(a2)a2.visible=(k===0); });

    /* the CENTRE carries the same mark, live and large (28 Aug): one renderer, six glyphs,
       one visible. Sized to its slot and aspect-correct, and each handover spins the incoming
       model in — the interchange the ring's own turn is answered by at the middle. */
    var mini=(function(){
      var mc=document.getElementById('lpIcon'); if(!mc) return null;
      var mr;
      try{ mr=_reg(new T.WebGLRenderer({canvas:mc,antialias:true,alpha:true})); }catch(e){ return null; }
      mr.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      mr.setClearColor(0x000000,0);
      var ms=new T.Scene(), mcam=new T.OrthographicCamera(-.24,.24,.24,-.24,.01,10);
      mcam.position.set(0,0,2); mcam.lookAt(0,0,0);
      function mfit(){
        var w=mc.clientWidth||96,h=mc.clientHeight||96;
        mr.setSize(w,h,false);
        var a=w/Math.max(1,h);
        mcam.left=-.24*a; mcam.right=.24*a; mcam.top=.24; mcam.bottom=-.24;
        mcam.updateProjectionMatrix();
      }
      mfit();
      if(window.ResizeObserver)_ro(mfit).observe(mc);
      /* the centre shares the stage's studio look: same environment, same restrained rig */
      if(_envRT) ms.environment=_envRT.texture;
      ms.add(new T.AmbientLight(0xffffff,.3));
      var ml=new T.DirectionalLight(0xffffff,1.0); ml.position.set(-1.6,2.4,3); ms.add(ml);
      var gl=[];
      var _mb=new T.Box3(), _ms=new T.Vector3();
      for(var k=0;k<6;k++){ var gg2=makeGlyph(k); gg2.matrixAutoUpdate=true; gg2.visible=(k===0); gg2.rotation.set(0,0,0); ms.add(gg2); gl.push(gg2);
        /* the centre's mark obeys the same one-envelope rule as the ring's, and is always shown
           at full strength: it is the mark for the stage the panel is describing. */
        gg2.updateMatrixWorld(true); _mb.setFromObject(gg2).getSize(_ms);
        var bs=.34/(Math.max(_ms.x,_ms.y,_ms.z)||.26);
        gg2.scale.setScalar(bs); gg2.userData.baseS=bs;
        if(gg2.userData.mat) gg2.userData.mat.opacity=1; }
      var swapAt=-1e9;
      return {r:mr,s:ms,c:mcam,g:gl,
        show:function(i){ swapAt=performance.now();
          for(var k2=0;k2<6;k2++){this.g[k2].visible=(k2===i); if(k2===i&&this.g[k2].userData.paint)this.g[k2].userData.paint(1,1);} },
        tick:function(t,dt){
          /* the phone layout hides this canvas (the photo stands in): no work while hidden */
          if(!mc.clientWidth)return;
          /* handover: the incoming model spins in, then HOLDS its presentation angle
             (client, 28 Aug: no turntable) — a fixed three-quarter with a slight look-down.
             The models keep their own part animations, so the centre stays alive without turning. */
          var k=reduce?1:Math.min(1,(performance.now()-swapAt)/620);
          var e=1-Math.pow(1-k,3);
          for(var k3=0;k3<6;k3++){ var G3=this.g[k3]; if(!G3.visible)continue;
            G3.scale.setScalar((G3.userData.baseS||1)*(.62+.38*e));
            G3.rotation.x=.13;
            G3.rotation.y=.6+(1-e)*1.5;
            if(G3.userData.anim&&!reduce)G3.userData.anim(t,dt||.016,1); }
          this.r.render(this.s,this.c); }};
    })();
    if(mini)window.__lpMini=mini;

    /* interaction: hover to choose, drag to look around. No ambient spin. */
    var ray=new T.Raycaster(), ptr=new T.Vector2(-9,-9), px=0, hovIdx=-1;
    var ptrCX=0,ptrCY=0,actPX=-999,actPY=-999;   /* client-space pointer, and where it sat at the last activation */
    var drag=false,dragged=false,lastX=0,lastY=0,tilt=0;
    canvas.addEventListener('pointerdown',function(e){drag=true;dragged=false;lastX=e.clientX;lastY=e.clientY;canvas.classList.add('grabbing');});
    onWin('pointerup',function(){drag=false;canvas.classList.remove('grabbing');});
    canvas.addEventListener('pointermove',function(e){
      ptrCX=e.clientX; ptrCY=e.clientY;
      var r2=canvas.getBoundingClientRect();
      ptr.x=((e.clientX-r2.left)/r2.width)*2-1;
      ptr.y=-((e.clientY-r2.top)/r2.height)*2+1;
      px=ptr.x;
      if(drag){
        var dx=e.clientX-lastX, dy=e.clientY-lastY; lastX=e.clientX; lastY=e.clientY;
        if(Math.abs(dx)>1||Math.abs(dy)>1)dragged=true;
        ry+=dx*.005; ryTo=ry; ryFrom=ry; tw=1;
        tilt=Math.max(-.3,Math.min(.5,tilt-dy*.004));
      }
    });
    canvas.addEventListener('pointerleave',function(){ptr.set(-9,-9);px=0;});
    canvas.addEventListener('click',function(e){ if(dragged)return;
      var r3=canvas.getBoundingClientRect();
      ptr.x=((e.clientX-r3.left)/r3.width)*2-1; ptr.y=-((e.clientY-r3.top)/r3.height)*2+1;
      ray.setFromCamera(ptr,camera);
      var hit3=ray.intersectObjects(hits,false)[0];
      if(hit3)activate(hit3.object.userData.i,true); else if(hovIdx>=0)activate(hovIdx,true); });

    var looping=false,last=0,intro=0,fitW=0,fitH=0;
    /* whether the centre panel is the seated overlay (desktop) or a static block (phone);
       measured at fit time, not per frame — getComputedStyle is not a frame-loop call */
    var panelAbs=false;
    var easeOut=function(k){ return 1-Math.pow(1-k,3); };
    var easeIO=function(k){ return k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2; };
    var vec=new T.Vector3(), _pq=new T.Quaternion();
    var _sv=new T.Vector3(), _su=new T.Vector3(), _sd=new T.Vector3();
    /* last frame's ring angle, so the marks can trail its angular velocity */
    var _ringPrevY=0;
    function drawLink(){}
    var fchk=0;
    function frame(ts){
      _raf(frame);   /* always re-register: survives frozen tabs and missed visibility events */
      if(!inView){
        /* observer callbacks can be lost while a tab is suspended: recheck the rect ourselves */
        if((fchk++%45)===0){ var rr0=stage.getBoundingClientRect(); if(rr0.top<innerHeight&&rr0.bottom>0){ inView=true; stage.classList.add('go'); } }
        if(!inView){ last=ts; return; }
      }
      var dt=Math.min(.05,(ts-last)/1000||.016); last=ts;
      var t=ts/1000;
      if(intro<1)intro=Math.min(1,intro+dt/1.1);
      var ik=easeOut(intro);
      uni.scale.setScalar(.94+.06*ik);

      /* the single motion: the ring eases the chosen stage to the front, then holds */
      if(tw<1){ tw=Math.min(1,tw+dt/TWD); ry=ryFrom+(ryTo-ryFrom)*easeIO(tw); }
      sys.rotation.y=ry;
      if(!reduce){
        /* three hoops drifting at different rates: alive, but almost still */
        h1.rotation.y+=.05*dt;
        h2.rotation.x+=.035*dt; h2.rotation.z=Math.sin(t*.22)*.1;
        h3.rotation.z-=.045*dt;
        /* the chevrons are parked (28 Aug): they ride the ring's rotation, nothing else */
        var cb=1+Math.sin(t*1.2)*.045; core.scale.setScalar(cb);
        coreGlow.material.opacity=.055+.03*(0.5+0.5*Math.sin(t*1.2));
        /* a pulse leaves the core along every wire, staggered, and fades as it arrives */
        for(var pz=0;pz<pulses.length;pz++){
          var P3=pulses[pz]; P3.t+=dt*.42; if(P3.t>1)P3.t-=1;
          var rr3=CR+(R-CR)*P3.t;
          P3.m.position.set(rr3*Math.cos(P3.a),0,rr3*Math.sin(P3.a));
          P3.m.material.opacity=Math.sin(P3.t*Math.PI)*.45;
        }
      }
      uni.rotation.x+=((tilt*.55)-uni.rotation.x)*Math.min(1,dt*3);
      uni.rotation.z+=((px*.016)-uni.rotation.z)*Math.min(1,dt*2.4);   /* a whisper of parallax */

      /* the marks and the chips are seated from projected positions, so the world matrices have to
         be current BEFORE anything is measured, not after the render */
      /* raw canvas measurements, matching fit(): a fallback here would disagree with the
         recorded fitW/fitH while collapsed and re-fit every frame (the SW<2 guard handles it) */
      var SW=canvas.clientWidth, SH=canvas.clientHeight;
      /* A collapsed stage has no geometry to seat anything against, and every pixel-to-world
         conversion below divides by its height. Wait for it to have a size. */
      if(SW<2||SH<2){ last=ts; return; }
      /* fit() reserves the margins for the marks and chips at ONE stage size; this loop seats them
         at whatever size the stage is right now. If a resize is ever missed the two disagree and
         every mark lands at the wrong height, so close the loop here rather than trusting the
         observer to have fired. */
      if(SW!==fitW||SH!==fitH) fit();
      camera.updateMatrixWorld();
      uni.updateMatrixWorld(true);
      var TANH=Math.tan(camera.fov*Math.PI/360);
      var LO=layout(SW,SH);
      /* how fast the ring is turning right now. The marks trail it, which is what makes them read
         as objects carried around a rail rather than as stickers printed on one. */
      var _ringV=(sys.rotation.y-_ringPrevY)/Math.max(dt,.001); _ringPrevY=sys.rotation.y;
      var SPX=LO.sta;                               /* every station disc is this wide on screen */
      var MPX=LO.mark;                              /* every mark is this tall on screen */

      for(var i=0;i<6;i++){
        var s=stations[i], on=i===active, done=i<active;
        s.lit+=((on?1:0)-s.lit)*Math.min(1,dt*7);
        var base=done?DONE:AHEAD;
        s.rimM.color.copy(base).lerp(RED,s.lit);
        s.rimM.opacity=.5+s.lit*.5;
        links[i].color.copy(done?DONE:AHEAD).lerp(RED,s.lit);
        links[i].opacity=(done?.34:.2)+s.lit*.4;
        var GU=s.glyph.userData;

        /* ---- seat the station in screen space ----
           How many world units one screen pixel is worth AT THIS STATION'S DEPTH. The disc and the
           mark are then sized in pixels through it, so all five render identically however far
           round the ring they have travelled. The rail, the arrows and the core keep their
           perspective; only this annotation layer is held flat. */
        s.g.getWorldPosition(_sv);
        _su.copy(_sv).applyMatrix4(camera.matrixWorldInverse);
        var perPx=(Math.max(.05,-_su.z)*TANH*2)/SH;
        var staR=SPX*.5*perPx*(1+s.lit*.10);
        s.plate.scale.setScalar(staR);
        s.rim.scale.setScalar(staR);
        /* ---- the marks move, but only the live one ----
           Five marks all breathing is noise, and the whole job of the motion is to say which stage
           you are on. Everything below is weighted by s.lit, which is already the eased 0..1 the
           handover runs on, so a stage animates itself in as it takes over and settles as it hands
           on. Amplitudes are deliberately tiny: at 56px a 2% scale reads as alive and a 6% scale
           reads as a wobble. */
        var mv=reduce?0:s.lit;
        var breathe=1+mv*Math.sin(t*1.7+i*1.9)*.02;
        s.anchor.scale.setScalar((MPX*.5*perPx/(GU.rad||.5))*(1+s.lit*.2)*breathe);
        /* a slow float, out of phase with the breathe so the two never beat together */
        s.anchor.position.y=mv*Math.sin(t*1.15+i)*staR*.06;
        /* and a trailing tilt while the ring swings: the mark lags the rail it is carried on,
           then settles level. Clamped, because past a few degrees it reads as broken, not heavy. */
        var lag=reduce?0:Math.max(-.13,Math.min(.13,-_ringV*.018));
        s.anchor.rotation.z+=(lag-s.anchor.rotation.z)*Math.min(1,dt*6);
        /* state reads through colour: faded stages desaturate toward the page, the live one is
           full, and each model's single accent part turns red exactly as its stage takes over */
        if(GU.paint) GU.paint(Math.min(1,(done?.95:.78)+s.lit*.25), s.lit);
        if(GU.anim&&!reduce) GU.anim(t,dt,s.lit);
        s.hit.scale.setScalar(Math.max(.5,staR*1.2/.34));

        /* the whole face turns to the viewer as one, so the disc stays a disc and the mark inside
           it never shears away from its own rim */
        s.g.getWorldQuaternion(_pq);
        s.face.quaternion.copy(_pq).invert();
        s.face.rotateX(-Math.atan2(camera.position.y+.02,camera.position.z));

        /* the model mirrors its anchor: the seat lives in the face, the mesh lives in the
           overlay, and this copy is the only bridge between the two */
        s.anchor.updateWorldMatrix(true,false);
        s.glyph.matrix.copy(s.anchor.matrixWorld);
      }
      if(cm.on){
        cm.t+=dt/TWD;
        if(cm.t>=1){cm.on=false;comet.visible=false;}
        else{
          var d2=cm.to-cm.from; d2=((d2%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
          var aa=cm.from+d2*easeIO(cm.t);
          comet.position.copy(ptOn(aa,.02));
          var cs=1+Math.sin(cm.t*Math.PI)*.5; comet.scale.setScalar(cs);
        }
      }
      hovIdx=-1;
      if(ptr.x>-5&&!drag){
        ray.setFromCamera(ptr,camera);
        var hit=ray.intersectObjects(hits,false)[0];
        if(hit)hovIdx=hit.object.userData.i;
      }
      canvas.classList.toggle('pick',hovIdx>=0||tw<1);
      /* Hovering a stage spins it to the front, which moves every station UNDER the resting
         cursor. Two guards make the selection follow the spin instead of fighting it: nothing
         re-activates while the ring is still travelling, and nothing re-activates after it
         settles until the pointer has actually moved again. Without these, the station that
         lands under the cursor steals the selection the frame the ring stops. */
      if(hovIdx>=0&&!touch&&hovIdx!==active&&tw>=1){
        if(Math.abs(ptrCX-actPX)+Math.abs(ptrCY-actPY)>7) activate(hovIdx,true);
      }
      /* ---- LABELS: ONE RULE FOR ALL FIVE ----
         Every chip is centred directly under its own node at the same screen distance, so the mark
         is always above the node and the name always below it: one vertical stack per stage, five
         identical stacks around the ring. The old rule pushed each chip radially outward by a
         distance that depended on its own width, then let a collision solver shove it somewhere
         else, which is why no two names sat in the same relation to their node. Nothing moves a
         chip now except another chip, the core, or the frame edge. */
      vec.set(0,0,0).applyMatrix4(sys.matrixWorld).project(camera);
      var ccx=(vec.x*.5+.5)*SW, ccy=(-vec.y*.5+.5)*SH;
      /* the info panel rides the projected ring centre (desktop; the phone layout is static),
         seated a touch BELOW it (28 Aug, client): the ellipse reads bottom-heavy in perspective,
         so a dead-centre block looks high. Proportional to the stage so it holds at every size. */
      if(panelAbs&&card){
        var pdy=SH*.055;
        card.style.transform='translate('+ccx.toFixed(1)+'px,'+(ccy+pdy).toFixed(1)+'px) translate(-50%,-50%)';
      }
      var LBL=LO.drop;                              /* node centre -> chip centre, on screen */
      var lay=[];
      for(var l2=0;l2<6;l2++){
        stations[l2].g.getWorldPosition(vec); vec.project(camera);
        /* offsetWidth, not getBoundingClientRect: desktop carries zoom:1.12 on the root, which
           scales the rect but not clientWidth, so a rect here would report every chip 12% wider
           than the space SW and SH are measured in. */
        lay.push({i:l2,x:(vec.x*.5+.5)*SW,y:(-vec.y*.5+.5)*SH+LBL,
                  w:tags[l2].offsetWidth||96,h:tags[l2].offsetHeight||24});
      }
      /* the centre panel owns the middle of the wheel now: a chip steps around its real
         footprint, never across it (falls back to the old core box on the static layouts) */
      var CW=SW<760?84:104, CH=SW<760?62:76;
      if(panelAbs&&card&&card.offsetWidth){ CW=Math.max(CW,card.offsetWidth+34); CH=Math.max(CH,card.offsetHeight+26); }
      for(var pass=0;pass<3;pass++){
        for(var q1=0;q1<6;q1++){
          for(var q2=q1+1;q2<6;q2++){
            var A=lay[q1],B2=lay[q2];
            var ox=(A.w+B2.w)*.5+10-Math.abs(A.x-B2.x), oy=(A.h+B2.h)*.5+7-Math.abs(A.y-B2.y);
            if(ox>0&&oy>0){ if(A.y<=B2.y){A.y-=oy*.5;B2.y+=oy*.5;} else {A.y+=oy*.5;B2.y-=oy*.5;} }
          }
          var C=lay[q1];
          var ox2=(C.w+CW)*.5+8-Math.abs(C.x-ccx), oy2=(C.h+CH)*.5+8-Math.abs(C.y-ccy);
          if(ox2>0&&oy2>0){
            if(ox2<oy2){ C.x+=(C.x>=ccx?1:-1)*ox2; } else { C.y+=(C.y>=ccy?1:-1)*oy2; }
          }
        }
      }
      for(var l3=0;l3<6;l3++){
        var L=lay[l3];
        var cx2=Math.min(SW-L.w*.5-8,Math.max(L.w*.5+8,L.x));
        var cy2=Math.min(SH-L.h*.5-6,Math.max(L.h*.5+6,L.y));
        tags[L.i].style.transform='translate('+cx2.toFixed(1)+'px,'+cy2.toFixed(1)+'px) translate(-50%,-50%)';
        tags[L.i].style.opacity=(stage.classList.contains('go')?1:0);
      }
      renderer.clear();
      renderer.render(scene,camera);
      renderer.clearDepth();
      renderer.render(ovl,camera);
      if(mini)mini.tick(t,dt);
    }
    function fit(){
      /* measure the CANVAS box, not the stage: on the phone layout the ring is a fixed band
         at the top of the stage while the panel flows below it, so the stage is taller than
         the picture. On desktop the canvas fills the stage and the two agree. */
      var w=canvas.clientWidth||stage.clientWidth||700,h=canvas.clientHeight||stage.clientHeight||600;
      /* record the RAW measurement, not the fallback: the frame loop compares against it to decide
         whether a resize was missed, and a fallback that never equals the raw value would make it
         re-fit on every single frame while the stage is collapsed */
      fitW=canvas.clientWidth; fitH=canvas.clientHeight;
      panelAbs=!!(card&&getComputedStyle(card).position==='absolute');
      renderer.setSize(w,h,false);
      camera.aspect=w/h;camera.updateProjectionMatrix();
      /* The marks and the chips no longer live in the scene, so they cannot be tested as points in
         it. They are a known PIXEL margin instead: a mark of a known height a known lift above the
         rim, a chip of a known height a known drop below it. Reserve that margin, then pull the
         camera back until the bare ring fits inside what is left. */
      var L=layout(w,h);
      /* Reserve for the DISC on the flanks, not for the name chip. A chip is wider than a disc but
         it is also clamped back inside the frame by the label pass, so reserving its full half
         width here only shrinks the ring for a collision that cannot happen. */
      var mTop=L.sta*.5+6,                            /* half a station disc + air (28 Aug: tighter, bigger ring) */
          mBot=L.drop+L.chip*.5+6,                    /* chip drop + half a chip + air */
          mSide=L.sta*.5+6;
      var tx=Math.max(.4,1-2*mSide/w),
          tyT=Math.max(.4,1-2*mTop/h),
          tyB=Math.max(.4,1-2*mBot/h);
      /* the outer hoop is gone, so the fit samples the rail itself again (a hair outside it
         for the chevrons that ride on top of it) and the ring reclaims that margin */
      var RS=R*1.02;
      var pts2=[new T.Vector3(RS,0,0),new T.Vector3(-RS,0,0),new T.Vector3(0,0,RS),new T.Vector3(0,0,-RS),
                new T.Vector3(RS*.71,0,RS*.71),new T.Vector3(-(RS*.71),0,RS*.71),
                new T.Vector3(RS*.71,0,-(RS*.71)),new T.Vector3(-(RS*.71),0,-(RS*.71))];
      function seat(zz){ camera.clearViewOffset(); camera.position.set(0,L.pitch*zz,zz);
                         camera.lookAt(0,-.02,0); camera.updateMatrixWorld(); }
      var z=3.4,ok=false,v=new T.Vector3();
      while(z<=12&&!ok){
        seat(z);
        ok=true;
        for(var p3=0;p3<pts2.length;p3++){ v.copy(pts2[p3]).project(camera);
          if(Math.abs(v.x)>tx||v.y>tyT||v.y<-tyB){ok=false;break;} }
        if(!ok)z+=.2;
      }
      seat(z);
      /* Centre the composed block. Perspective lifts the far rim toward the middle of the frame
         while the near rim spreads down, so a ring that FITS still is not a ring that SITS centred:
         it leaves a wide dead band above and crowds the names below. Shift the FRUSTUM rather than
         move the camera. That is a pure image shift with no change to the perspective, and
         project/unproject stay honest through it, which matters because every mark and chip on this
         stage is seated from them. Measured against the ring's fixed near and far points rather
         than the current stage positions, so the framing holds still as the ring turns. */
      var fnear=new T.Vector3(0,0,R), ffar=new T.Vector3(0,0,-R), offY=0;
      for(var c2=0;c2<6;c2++){
        var yTop=(-v.copy(ffar).project(camera).y*.5+.5)*h-L.sta*.5;
        var yBot=h-((-v.copy(fnear).project(camera).y*.5+.5)*h+L.drop+L.chip*.5);
        var d3=(yBot-yTop)*.5;
        if(Math.abs(d3)<.5)break;
        offY-=d3; camera.setViewOffset(w,h,0,offY,w,h); camera.updateMatrixWorld();
      }
      camZ=z; camY=L.pitch*z;
      /* the marks are normalised against the angle they are seen from, so re-gauge them whenever
         that angle moves */
      gaugeGlyphs(-Math.atan2(camera.position.y+.02,camera.position.z));
      _regauge=function(){ gaugeGlyphs(-Math.atan2(camera.position.y+.02,camera.position.z)); };
      renderer.clear();
      renderer.render(scene,camera);
      renderer.clearDepth();
      renderer.render(ovl,camera);
    }
    if(window.ResizeObserver)_ro(fit).observe(stage);
    fit();
    onDoc('visibilitychange',function(){ if(!document.hidden&&inView&&!looping){looping=true;_raf(frame);} });
    looping=true;_raf(frame);
    if(reduce){ intro=1; uni.scale.setScalar(1); fit(); }
  }
  /* ---------- THE CLUSTER RENDERER (28 Aug) ----------
     The six marks are LIVE 3D again, but seated on the DOM bubbles rather than on a ring.
     Three decisions carry this:
       ONE canvas, not six. Browsers cap live WebGL contexts and this page already spends
       several (loader, globe, showpiece, footer); a context per bubble would exhaust them.
       ORTHOGRAPHIC, mapped 1:1 to CSS pixels. World units ARE pixels, so seating a model on
       a bubble is "read its centre, set position" with no projection maths to drift out of
       step with the CSS. It also suits marks that were authored as isometric renders.
       UNLIT. These GLBs carry their lighting baked into the texture (the same finding the
       ring pass made), so lighting them again only washes them out. No lights, no
       environment: cheaper AND more faithful.
     The <img> in each bubble stays as the fallback and is only hidden once a model is in. */
  function initCluster(T){
    var host=document.getElementById('lpBubbles'); if(!host) return;
    var renderer=_reg(new T.WebGLRenderer({canvas:canvas,antialias:true,alpha:true}));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.setClearColor(0x000000,0);
    if(T.ColorManagement)T.ColorManagement.enabled=false;
    if(T.NeutralToneMapping!==undefined){ renderer.toneMapping=T.NeutralToneMapping; renderer.toneMappingExposure=1.0; }
    var scene=new T.Scene();
    var camera=new T.OrthographicCamera(-1,1,1,-1,-4000,4000);
    camera.position.set(0,0,1000); camera.lookAt(0,0,0);
    var W=0,H=0;
    function fit(){
      W=host.clientWidth||1; H=host.clientHeight||1;
      renderer.setSize(W,H,false);
      camera.left=-W/2; camera.right=W/2; camera.top=H/2; camera.bottom=-H/2;
      camera.updateProjectionMatrix();
      for(var i=0;i<slots.length;i++) slots[i].gauged=false;   /* re-gauge at the new size */
    }
    /* one holder per stage; the GLB drops into it when it arrives */
    var slots=[];
    for(var s=0;s<6;s++){
      var g=new T.Group(); g.visible=false; scene.add(g);
      slots.push({g:g,model:null,unit:1,gauged:false,el:bubbles[s]||null,lit:0});
    }
    var _bb=new T.Box3(), _sz=new T.Vector3(), _cn=new T.Vector3();
    function mount(i,gltf){
      var sl=slots[i]; if(!sl||!sl.el) return;
      var inst=gltf.scene.clone(true);
      /* baked lighting: swap to unlit basic materials carrying the same map */
      inst.traverse(function(o){ if(o.isMesh&&o.material){
        var src=o.material, nm=new T.MeshBasicMaterial({map:src.map||null,toneMapped:false});
        if(!src.map&&src.color)nm.color.copy(src.color);
        o.material=nm; o.frustumCulled=false; } });
      /* the mark's own resting angle, then centre it on its own bounding box so every
         model hangs on the same point regardless of where its origin was authored */
      inst.rotation.set(.13,MARK_REST[i]||0,0);
      inst.updateMatrixWorld(true);
      _bb.setFromObject(inst); _bb.getSize(_sz); _bb.getCenter(_cn);
      sl.unit=Math.max(_sz.x,_sz.y)||1;
      var wrap=new T.Group(); wrap.add(inst);
      inst.position.set(-_cn.x,-_cn.y,-_cn.z);
      sl.g.add(wrap); sl.model=wrap; sl.g.visible=true; sl.gauged=false;
      /* the flat mark has done its job */
      var im=sl.el.querySelector('img'); if(im)im.style.opacity='0';
    }
    var loader=new GLTFLoader();
    GLB_SRC.forEach(function(src,i){
      loader.load(src,function(gltf){ if(!dead)mount(i,gltf); },undefined,function(){ /* keep the img */ });
    });

    /* hover: the mark under the pointer lifts and turns a few degrees, then settles back.
       Restrained on purpose — a spin here would undo the "hold the best angle" pass. */
    var hoverIdx=-1;
    bubbles.forEach(function(b,i){
      b.addEventListener('pointerenter',function(){hoverIdx=i;});
      b.addEventListener('pointerleave',function(){if(hoverIdx===i)hoverIdx=-1;});
    });

    var raf=0,vis=false,last=0;
    if(window.IntersectionObserver){
      _io(function(es){es.forEach(function(en){ vis=en.isIntersecting; if(vis&&!raf)raf=_raf(frame); });},{threshold:.05}).observe(host);
    } else { vis=true; }
    if(window.ResizeObserver)_ro(fit).observe(host);
    fit(); stage.classList.add('go');

    var _r=new T.Vector3();
    function frame(ts){
      raf=_raf(frame);
      if(!vis){ last=ts; return; }
      var dt=Math.min(.05,(ts-last)/1000||.016); last=ts;
      var t=ts/1000;
      if(host.clientWidth!==W||host.clientHeight!==H) fit();
      for(var i=0;i<6;i++){
        var sl=slots[i]; if(!sl.model||!sl.el) continue;
        /* offsetLeft/Top/Width, NEVER getBoundingClientRect: the desktop root carries
           zoom:1.12, which scales the rect but not clientWidth. Mixing the two units puts
           every model a growing distance off its bubble. The bubble is translated -50%/-50%
           about its own box, so its offsetLeft/offsetTop ARE its visual centre. */
        var px=sl.el.offsetLeft, py=sl.el.offsetTop, dia=sl.el.offsetWidth;
        var target=dia*.70;                            /* the mark sits INSIDE its bubble */
        var on=(i===active), hov=(i===hoverIdx);
        sl.lit+=(((on?1:0)+(hov?.6:0))-sl.lit)*Math.min(1,dt*6);
        var breathe=reduce?1:(1+Math.sin(t*1.1+i*1.7)*.012*sl.lit);
        sl.g.position.set(px-W/2,H/2-py-(reduce?0:sl.lit*4),0);
        sl.g.scale.setScalar((target/sl.unit)*(1+sl.lit*.05)*breathe);
        /* a few degrees of turn while lit, easing back to the resting angle */
        _r.copy(sl.model.rotation);
        sl.model.rotation.y=_r.y+((reduce?0:sl.lit*.20)-_r.y)*Math.min(1,dt*5);
        sl.model.rotation.x=(reduce?0:sl.lit*-.04);
        sl.g.renderOrder=on?2:1;
      }
      renderer.render(scene,camera);
    }
    raf=_raf(frame);
  }

  /* The WebGL RING above (init) is retired but kept intact for reference; the section now
     runs the cluster renderer. Restoring the ring means calling init(THREE_MOD) here. */
  if(canvas){
    try{
      var testCv=document.createElement('canvas');
      if(!(window.WebGLRenderingContext&&(testCv.getContext('webgl2')||testCv.getContext('webgl')))){nogl();}
      else { try{initCluster(THREE_MOD);}catch(err){if(window.console&&console.error)console.error('LP cluster init failed',err);nogl();} }
    }catch(e){nogl();}
  } else {
    stage.classList.add('go');
  }
})();

/* ---- industries: subtle 3D tilt toward the cursor ---- */
(function(){
  if(reduce || !window.matchMedia || !matchMedia('(hover:hover)').matches) return;
  document.querySelectorAll('.ind').forEach(function(card){
    var raf2=null;
    card.addEventListener('pointermove',function(e){
      if(raf2) return;
      raf2=_raf(function(){
        raf2=null;
        var r=card.getBoundingClientRect();
        var px=(e.clientX-r.left)/r.width-0.5, py=(e.clientY-r.top)/r.height-0.5;
        card.style.transform='rotateX('+(-py*5)+'deg) rotateY('+(px*6)+'deg) translateZ(0)';
      });
    });
    card.addEventListener('pointerleave',function(){
      if(raf2){cancelAnimationFrame(raf2);raf2=null;}
      card.style.transition='transform .6s var(--e1), border-color .35s, box-shadow .5s var(--e1)';
      card.style.transform='rotateX(0) rotateY(0)';
      _setTo(function(){card.style.transition='';},600);
    });
  });
})();

/* ---- text scramble / decode on mono labels ---- */
(function(){
  if(reduce)return;
  var GLYPHS='!<>-_\\/[]{}=+*^?#________ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  function rnd(){return GLYPHS[(Math.random()*GLYPHS.length)|0];}
  function esc(ch){if(ch==='&')return '&amp;';if(ch==='<')return '&lt;';if(ch==='>')return '&gt;';if(ch==='"')return '&quot;';return ch;}
  function makeScrambler(el){
    var finalText=el.textContent;
    var speed=parseFloat(el.dataset.scrambleSpeed)||24;
    var stagger=parseFloat(el.dataset.scrambleStagger)||38;
    var n=finalText.length;
    var revealAt=[];for(var i=0;i<n;i++)revealAt[i]=i*stagger;
    var totalMs=(n-1)*stagger+speed*6;
    var lastGlyphs=new Array(n),raf=null,startTs=0,lastSwap=0,running=false;
    function frame(ts){
      if(!running)return;
      if(!startTs)startTs=ts;
      var elapsed=ts-startTs;
      var doSwap=(ts-lastSwap)>=speed;
      if(doSwap)lastSwap=ts;
      var html='',settled=0;
      for(var i=0;i<n;i++){
        var ch=finalText[i];
        if(ch===' '){html+=' ';settled++;continue;}
        if(elapsed>=revealAt[i]+speed*3){html+=esc(ch);settled++;}
        else{
          if(doSwap||lastGlyphs[i]===undefined)lastGlyphs[i]=rnd();
          html+='<span class="scramble-glyph">'+lastGlyphs[i]+'</span>';
        }
      }
      el.innerHTML=html;
      if(elapsed>=totalMs||settled===n){el.textContent=finalText;stop();return;}
      raf=_raf(frame);
    }
    function start(){if(running)return;running=true;startTs=0;lastSwap=0;for(var i=0;i<n;i++)lastGlyphs[i]=undefined;raf=_raf(frame);}
    function stop(){running=false;if(raf)cancelAnimationFrame(raf);raf=null;}
    return {el:el,start:start,stop:stop,finalText:finalText};
  }
  document.querySelectorAll('[data-scramble]').forEach(function(el){
    var s=makeScrambler(el);
    ScrollTrigger.create({
      trigger:el,start:'top 88%',once:true,
      onEnter:function(){s.start();},
      onLeave:function(){s.el.textContent=s.finalText;s.stop();}
    });
  });
})();


return function cleanup(){
  dead=true;
  _cleanups.forEach(function(f){ try{ f(); }catch(e){} });
  _obs.forEach(function(o){ try{ o.disconnect(); }catch(e){} });
  _ivs.forEach(function(id){ clearInterval(id); });
  _tos.forEach(function(id){ clearTimeout(id); });
  try{ ScrollTrigger.getAll().forEach(function(t){ t.kill(); }); }catch(e){}
  _renderers.forEach(function(r){ try{ r.dispose(); r.forceContextLoss(); }catch(e){} });
  document.body.classList.remove('page-home');
  document.documentElement.classList.remove('is-loading','motion');
  document.documentElement.style.overflow='';
  window.__spActive=false;
  delete window.__revealOnPlay; delete window.__iaqLoaderDismiss; delete window.__resetSM;
  delete window.__p3dQA; delete window.__lpMini; delete window.S3D; delete window.__globeQA; delete window.__globeFocus;
};
}
