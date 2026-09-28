import { ROLES, applyHref } from '../data/roles.js'
import { roleIcon } from '../data/roleIcons.js'

/* Careers page scripts, ported verbatim from _source/careers.html.
   Shell-owned scripts (nav, burger, Lenis, universal search, BM ribbon, bmBack/embedded) are omitted. */

/* ============ jobs: filter console, grouped list, FLIP animation, #q= deep link ============ */
function initJobs() {
/* 16 live openings from iaqtechnology.com.my/career, July 2026 */
/* the shipped roles live in data/roles.js; the CMS portal stores an edited
   copy which wins here, so HR publishes without a developer */
var JOBS=ROLES.slice();
try{ var _ov=JSON.parse(localStorage.getItem('iaq.cms.roles.v1')); if(Array.isArray(_ov)&&_ov.length)JOBS=_ov; }catch(e){}
var LOCS=[["shah-alam","Shah Alam, Selangor"],["penang","Simpang Ampat, Penang"]];
var DEPTS=[["engineering","Engineering"],["project","Project"],["commercial","Commercial"],["finance","Finance & Accounts"]];
var LOCLBL={},DEPTLBL={};
LOCS.forEach(function(x){LOCLBL[x[0]]=x[1]});DEPTS.forEach(function(x){DEPTLBL[x[0]]=x[1]});
/* Level is derived from the title, which is where seniority actually lives in the
   supplied data: "Senior Engineer, Process" and "Manager, Project" both state it.
   Deriving it beats asking HR for a field they have not been asked for. */
var LEVELS=[["manager","Manager"],["senior","Senior"],["engineer","Engineer / Executive"]];
var LEVELLBL={};LEVELS.forEach(function(x){LEVELLBL[x[0]]=x[1]});
function levelOf(j){
  var t=String(j.t||'');
  if(/\bManager\b/i.test(t))return 'manager';
  if(/\bSenior\b/i.test(t))return 'senior';
  return 'engineer';
}
var state={loc:new Set(),dept:new Set(),level:new Set(),q:""};
var REDUCED=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

function chipRow(mount,items,key){
  var el=document.getElementById(mount);
  items.forEach(function(it){
    var b=document.createElement('button');
    b.type='button';b.className='fchip';b.dataset.v=it[0];
    b.appendChild(document.createTextNode(it[1]));
    var ct=document.createElement('span');ct.className='ct';b.appendChild(ct);
    b.setAttribute('aria-pressed','false');
    b.addEventListener('click',function(){
      if(state[key].has(it[0])){state[key].delete(it[0]);b.classList.remove('on');b.setAttribute('aria-pressed','false');}
      else{state[key].add(it[0]);b.classList.add('on');b.setAttribute('aria-pressed','true');}
      if(!REDUCED&&b.animate)b.animate([{transform:'scale(.94)'},{transform:'scale(1)'}],{duration:180,easing:'cubic-bezier(.22,1,.36,1)'});
      render();
    });
    el.appendChild(b);
  });
}
chipRow('fLoc',LOCS,'loc');
chipRow('fDept',DEPTS,'dept');
if(document.getElementById('fLevel'))chipRow('fLevel',LEVELS,'level');

var PIN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>';
var CHEV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
/* DICONS used to live here: one mark per DEPARTMENT, so all eight Engineering rows wore the
   same gear and all five Project rows the same clipboard. The row now carries a mark for its
   discipline, read from the title; the mapping and the drawings are in data/roleIcons.js and
   the motion is under "role marks" in styles/careers.css. */
/* Each mark plays its motion once as its row first scrolls into view, so the list reads as
   animated on a phone, where there is no hover. Hover and keyboard focus loop it (CSS). The
   class is removed when the pass ends so a later hover starts from the resting drawing rather
   than mid cycle. The drawing is complete without any of this: a missed trigger costs the
   motion, never the icon. */
var RI_MS=3300, riSeen={}, riTimers=[], riIO=null;
if(!REDUCED&&'IntersectionObserver' in window){
  riIO=new IntersectionObserver(function(entries){
    var k=0;
    entries.forEach(function(en){
      if(!en.isIntersecting)return;
      var el=en.target; riIO.unobserve(el);
      var key=el.dataset.ref||el.dataset.key; if(riSeen[key])return; riSeen[key]=1;
      var d=Math.min(k++,8)*120;
      el.style.setProperty('--ri-d',d+'ms');
      el.classList.add('ri-in');
      riTimers.push(setTimeout(function(){el.classList.remove('ri-in');},d+RI_MS));
    });
  },{rootMargin:'0px 0px -12% 0px',threshold:0.5});
}
/* jobDetail() USED TO LIVE HERE and it has been deleted, not fixed.

   It took the job title, ran it through nine regular expressions, and printed
   whichever block of "About the role" / "What you will do" / "What you bring"
   copy matched — copy that IAQ never wrote, presented as its hiring criteria,
   including certification requirements a candidate would act on. "Manager,
   Project" matched none of the nine and fell through to the final else, so that
   role rendered a FINANCE job spec under the Project heading. The fall-through
   was not a latent risk; it was live on the page.

   The accordion now renders the fields that exist on the role and a labelled
   slot for the ones HR has not supplied. See the header of data/roles.js. */
function jobBody(j){
  var has=function(v){return Array.isArray(v)?v.length>0:!!(v&&String(v).trim())};
  var list=function(h,arr){return '<div><h4>'+h+'</h4><ul>'+arr.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></div>'};
  var out='';
  if(has(j.about)) out+='<p class="about">'+esc(j.about)+'</p>';
  var cols='';
  if(has(j.duties)) cols+=list('What you will do',j.duties);
  if(has(j.reqs)) cols+=list('What you bring',j.reqs);
  if(cols) out+='<div class="jd-cols">'+cols+'</div>';
  if(!out){
    /* the honest state: three supplied fields, so three are shown.
       17 Sep: two versions of it. The review build keeps the labelled slot, which names what is
       owed and who owes it. The public build gets a plain line with no internal tagging, the same
       pair the vacancy page carries (pages/RolePage.jsx). Hiding it outright, the way the launch
       gate hides the other owed blocks, would leave a role with nothing under its title. */
    if(document.documentElement.classList.contains('is-launch')){
      out='<p class="about">The full description for this role comes from IAQ HR. Open the role to '+
        'apply, or write to HR quoting the reference and the team will send it.</p>';
    } else {
      out='<div class="jd-slot"><span class="jd-slot-tag">Role description &middot; supplied by IAQ HR</span>'+
        '<b>The title, department and location are IAQ\'s own. The description follows from HR.</b>'+
        '<p>This opening is real and current. Its duties and requirements have not been '+
        'published yet, and this page holds the space rather than filling it with stand-in text. '+
        'Write to HR using the button below and the team will send the full description.</p></div>';
    }
  }
  /* only facts: the type stamp is shown when HR states it, never assumed */
  var meta='<div class="jd-meta"><span>'+esc(LOCLBL[j.loc])+'</span><span>'+esc(DEPTLBL[j.dept])+'</span>'+
    (has(j.type)?'<span>'+esc(j.type)+'</span>':'')+'</div>';
  return out+meta;
}
function esc(v){return String(v==null?'':v).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

function pass(j){
  if(state.loc.size&&!state.loc.has(j.loc))return false;
  if(state.dept.size&&!state.dept.has(j.dept))return false;
  if(state.level.size&&!state.level.has(levelOf(j)))return false;
  if(state.q){
    var h=(j.t+' '+LOCLBL[j.loc]+' '+DEPTLBL[j.dept]+' '+LEVELLBL[levelOf(j)]+' '+(j.ref||'')).toLowerCase();
    if(h.indexOf(state.q)<0)return false;
  }
  return true;
}
function facetOf(j,key){return key==='level'?levelOf(j):j[key]}
function countFor(key,val){
  var n=0;
  JOBS.forEach(function(j){
    if(facetOf(j,key)!==val)return;
    if(key!=='loc'&&state.loc.size&&!state.loc.has(j.loc))return;
    if(key!=='dept'&&state.dept.size&&!state.dept.has(j.dept))return;
    if(key!=='level'&&state.level.size&&!state.level.has(levelOf(j)))return;
    if(state.q){
      var h=(j.t+' '+LOCLBL[j.loc]+' '+DEPTLBL[j.dept]+' '+LEVELLBL[levelOf(j)]+' '+(j.ref||'')).toLowerCase();
      if(h.indexOf(state.q)<0)return;
    }
    n++;
  });
  return n;
}
function updateCounts(){
  [['fLoc','loc'],['fDept','dept'],['fLevel','level']].forEach(function(p){
    if(!document.getElementById(p[0]))return;
    document.querySelectorAll('#'+p[0]+' .fchip').forEach(function(b){
      var n=countFor(p[1],b.dataset.v);
      b.querySelector('.ct').textContent=n;
      b.classList.toggle('zero',n===0&&!b.classList.contains('on'));
    });
  });
}
function updateReadout(n){
  var ro=document.getElementById('readout');
  var nEl=ro.querySelector('.rd-n');
  if(!nEl){
    ro.textContent='';
    nEl=document.createElement('span');nEl.className='rd-n';ro.appendChild(nEl);
    var rest=document.createElement('span');rest.className='rd-rest';ro.appendChild(rest);
  }
  if(nEl.textContent!==String(n)){
    nEl.textContent=n;
    nEl.classList.remove('tick');void nEl.offsetWidth;nEl.classList.add('tick');
  }
  ro.querySelector('.rd-rest').textContent=' / '+JOBS.length+' roles';
  var _tot=document.getElementById('totRoles'); if(_tot)_tot.textContent=JOBS.length;
}
function render(){
  var list=JOBS.filter(pass);
  var byDept={};
  list.forEach(function(j){(byDept[j.dept]=byDept[j.dept]||[]).push(j);});
  var mount=document.getElementById('joblist');
  var prev={};
  if(!REDUCED){
    mount.querySelectorAll('.job[data-key]').forEach(function(el){prev[el.dataset.key]=el.getBoundingClientRect();});
  }
  mount.innerHTML=DEPTS.filter(function(d){return byDept[d[0]];}).map(function(d){
    var rows=byDept[d[0]].map(function(j){
      /* the ref is a STORED field now, not a number derived from array position:
         a candidate quoting IAQ-PRJ-04 in an email still resolves to the same
         role after HR reorders or removes a row */
      var ref=j.ref||('IAQ-'+d[0].slice(0,3).toUpperCase()+'-'+String(JOBS.indexOf(j)+1).padStart(2,'0'));
      var jid='job-'+ref.toLowerCase().replace(/[^a-z0-9]+/g,'-');
      return '<div class="job" data-key="'+esc(j.t)+'" data-ref="'+esc(ref)+'" id="'+jid+'">'+
      '<button type="button" class="job-head" aria-expanded="false" aria-controls="'+jid+'-b"><span class="dic">'+roleIcon(j)+'</span><span class="ref">'+esc(ref)+'</span><h3>'+esc(j.t)+'</h3>'+
      '<span class="locrow">'+PIN+esc(LOCLBL[j.loc])+'</span><span class="chev">'+CHEV+'</span></button>'+
      '<div class="job-body" id="'+jid+'-b"><div><div class="jd">'+
      jobBody(j)+
      /* a real destination carrying the role and its reference, not href="#" and
         a toast. No role="button" on an anchor: Space would not activate it and a
         screen reader announced a button that did nothing. */
      /* 17 Sep: the dropdown keeps the summary and the direct email, and the full description and
         the application form live on the role's own page (client asked which route to take;
         see pages/RolePage.jsx for the reasons). */
      '<div class="jd-act"><a class="apply" href="/careers/role/'+esc(ref.toLowerCase().replace(/[^a-z0-9]+/g,'-'))+'">Open this role and apply</a>'+
      '<a class="jd-mail" href="'+esc(applyHref(Object.assign({},j,{ref:ref})))+'">Email HR directly</a>'+
      '<a class="jd-copy" href="#'+jid+'" data-copy="'+jid+'">Copy link to this role</a></div>'+
      '</div></div></div></div>';
    }).join('');
    return '<section class="dept"><div class="dept-h"><h2>'+d[1]+'</h2><span class="n">'+byDept[d[0]].length+' open</span></div>'+rows+'</section>';
  }).join('');
  document.getElementById('empty').classList.toggle('show',!list.length);
  updateReadout(list.length);
  updateCounts();
  if(!REDUCED)flipJobs(mount,prev);
  if(riIO){riIO.disconnect();mount.querySelectorAll('.job').forEach(function(el){riIO.observe(el);});}
}
function flipJobs(mount,prev){
  var ease='cubic-bezier(.22,1,.36,1)';
  var moved=[],fresh=[];
  mount.querySelectorAll('.job[data-key]').forEach(function(el){
    var old=prev[el.dataset.key];
    if(old){
      var now=el.getBoundingClientRect();
      var dx=old.left-now.left,dy=old.top-now.top;
      if(dx||dy){
        el.style.transition='none';
        el.style.transform='translate('+dx+'px,'+dy+'px)';
        moved.push(el);
      }
    }else{
      el.style.transition='none';
      el.style.opacity='0';
      el.style.transform='translateY(14px)';
      fresh.push(el);
    }
  });
  if(!moved.length&&!fresh.length)return;
  void mount.offsetHeight;
  moved.forEach(function(el){
    el.style.transition='transform .32s '+ease;
    el.style.transform='';
  });
  fresh.forEach(function(el,i){
    var d=Math.min(i,10)*22;
    el.style.transition='opacity .38s '+ease+' '+d+'ms,transform .38s '+ease+' '+d+'ms';
    el.style.opacity='';
    el.style.transform='';
  });
  setTimeout(function(){
    mount.querySelectorAll('.job').forEach(function(el){el.style.transition='';el.style.transform='';el.style.opacity='';});
  },700);
}
/* showApplyToast() used to live here: 20 lines of inline style assignments building a
   fixed, hardcoded-colour element that told the visitor "Applications are not open in
   this concept preview". The apply control has a real destination now, so both the
   toast and the click intercept that swallowed the anchor are gone. */
document.getElementById('joblist').addEventListener('click',function(e){
  /* .apply is a real link now and is left alone to navigate */
  var cp=e.target.closest('.jd-copy');
  if(cp){
    e.preventDefault();
    var url=location.href.split('#')[0]+'#/careers#'+cp.dataset.copy;
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(url).then(function(){
        cp.textContent='Link copied';setTimeout(function(){cp.textContent='Copy link to this role'},1800);
      }).catch(function(){});
    }
    return;
  }
  var head=e.target.closest('.job-head'); if(!head) return;
  var job=head.parentElement, open=job.classList.contains('open');
  document.querySelectorAll('#joblist .job.open').forEach(function(o){o.classList.remove('open');o.querySelector('.job-head').setAttribute('aria-expanded','false');});
  if(!open){job.classList.add('open');head.setAttribute('aria-expanded','true');}
});
document.getElementById('q').addEventListener('input',function(){state.q=this.value.trim().toLowerCase();render();});
document.getElementById('clear').addEventListener('click',function(){
  state.loc.clear();state.dept.clear();state.level.clear();state.q='';
  document.getElementById('q').value='';
  document.querySelectorAll('.fchip.on').forEach(function(c){c.classList.remove('on');c.setAttribute('aria-pressed','false');});
  render();
});
/* universal search lands with #q=<role>: prefill and run the role search */
window.__usApplyQ=function(q){
  state.q=q.toLowerCase();
  document.getElementById('q').value=q;
  render();
  var jl=document.getElementById('joblist'); if(jl)jl.scrollIntoView({behavior:'smooth',block:'start'});
};
if(location.hash.indexOf('#q=')===0) window.__usApplyQ(decodeURIComponent(location.hash.slice(3)));
/* 15 Sep: the Careers wing in the nav deep-links a department or a location (#dept=engineering,
   #loc=penang) and #roles lands on the list. Works on arrival and when the hash changes on the page.
   18 Sep (Bazil: "just one page", Culture on top, Careers below): #culture is the culture wrapper at
   the top of the page and #roles is the console-and-list block. Both are real ids, so ScrollToTop in
   main.jsx lands them on every route or hash change with the same offset used here; landing them
   here as well covers a router effect that never fires, and both aim at the same element, so the
   two cannot fight. The nav is 75px tall; 70 matches main.jsx exactly. */
var NAV_OFFSET=70;
function landOn(id){
  var el=document.getElementById(id); if(!el) return false;
  if(window.__lenis) window.__lenis.scrollTo(el,{offset:-NAV_OFFSET});
  else window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-NAV_OFFSET,behavior:'smooth'});
  /* if the smooth loop cannot run (stalled rAF, background tab), land the jump anyway */
  setTimeout(function(){var d=el.getBoundingClientRect().top-NAV_OFFSET;if(Math.abs(d)>260)window.scrollTo(0,window.scrollY+d);},1000);
  return true;
}
function applyHashFilter(){
  var h=location.hash||'';
  if(h==='#culture') return landOn('culture');
  if(h==='#roles'){if(landOn('roles'))return true;var jl0=document.getElementById('joblist');if(jl0)jl0.scrollIntoView({behavior:'smooth',block:'start'});return true;}
  var m=h.match(/^#(dept|loc)=([a-z-]+)$/); if(!m) return false;
  var key=m[1], val=m[2];
  state.loc.clear();state.dept.clear();state.level.clear();state.q='';
  document.getElementById('q').value='';
  document.querySelectorAll('.fchip.on').forEach(function(c){c.classList.remove('on');c.setAttribute('aria-pressed','false');});
  state[key].add(val);
  var chip=document.querySelector('#'+(key==='dept'?'fDept':'fLoc')+' .fchip[data-v="'+val+'"]');
  if(chip){chip.classList.add('on');chip.setAttribute('aria-pressed','true');}
  render();
  var jl=document.getElementById('joblist'); if(jl)jl.scrollIntoView({behavior:'smooth',block:'start'});
  return true;
}
var onHash=function(){applyHashFilter();};
window.addEventListener('hashchange',onHash);
render();
applyHashFilter();

/* the console is sticky now, at --sticktop, matching the newsroom bar and the registry */

return function cleanup(){
  window.removeEventListener('hashchange',onHash);
  if(riIO)riIO.disconnect();
  riTimers.forEach(clearTimeout);
  delete window.__usApplyQ;
  /* the apply toast and its timer are gone with showApplyToast: the apply control is a
     real link. Leaving the teardown behind threw a ReferenceError on every navigation
     AWAY from this page, which is why the error surfaced on /contact. */
};
}

/* ============ closing section: interactive 3D IAQ campus, follows the cursor ============ */
/* initCampus() used to live here: 233 lines of Three.js building a campus diorama with a
   sky dome, starfield, clouds, trucks and trees. It never ran. Line 2 of it read
   `document.getElementById('closeCv')` and returned an empty cleanup when that was
   missing, and no page renders a #closeCv canvas — the closing band is CloseAmbient.jsx,
   which brings its own. So the whole scene, and the `three` import at the top of this
   file, were parsed and shipped in the Careers chunk to do nothing. Both are gone.
   If a campus diorama is wanted back, it belongs in a component that owns its canvas,
   not in a page script guarded by an id that does not exist. */

export default function initCareers() {
  var cleanups=[initJobs()];
  return function(){ cleanups.forEach(function(fn){ if(typeof fn==='function') fn(); }); };
}
