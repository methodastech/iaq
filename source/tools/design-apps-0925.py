#!/usr/bin/env python3
"""Design tab, 25 Sep 2026 night: inserts 02 Brand elements and 18 Applications (tools/design-apps/*.html),
the left sidebar and its scroll spy, renumbers every section and rebuilds the top section bar.
Re-runnable: every insert sits between DESIGN-APPS markers and is replaced on the next run.
Styles: public/design/apps.css. Run: python3 tools/design-apps-0925.py"""
import re, os
P = 'public/design.html'
s = open(P, encoding='utf-8').read()
s = re.sub(r'<!-- DESIGN-APPS:(\w+):START -->[\s\S]*?<!-- DESIGN-APPS:\1:END -->\n?', '', s)

def block(name, html): return f'<!-- DESIGN-APPS:{name}:START -->\n{html}\n<!-- DESIGN-APPS:{name}:END -->\n'
el = open('tools/design-apps/elements.html', encoding='utf-8').read()
ap = open('tools/design-apps/applications.html', encoding='utf-8').read()
rf = open('tools/design-apps/references.html', encoding='utf-8').read()
pix = open('/private/tmp/claude-501/-Users-zieel-Bazil-Claude-3-Websites/f19488ad-dbd8-4061-ade0-b04e4d89e671/scratchpad/pix31.html', encoding='utf-8').read() if os.path.exists('/private/tmp/claude-501/-Users-zieel-Bazil-Claude-3-Websites/f19488ad-dbd8-4061-ade0-b04e4d89e671/scratchpad/pix31.html') else ''
el = el.replace('<!--PIX31-->', pix)

# 1 stylesheet
s = s.replace('<link rel="stylesheet" href="/bmws.css">', '<link rel="stylesheet" href="/bmws.css">\n' + block('CSS', '<link rel="stylesheet" href="/design/apps.css?v=' + str(int(os.path.getmtime('public/design/apps.css'))) + '">\n<script>/* embedded in the portal: the portal carries the bar */if(/[?&]embed\\b/.test(location.search))document.documentElement.classList.add(\'embed\')</script>'), 1)
# 2 sections: elements after the mark, applications before tokens
s = s.replace('<section id="colour"', block('ELEMENTS', el) + block('DIRECTION', rf) + '<section id="colour"', 1)
s = s.replace('<section id="tokens"', block('APPLICATIONS', ap) + '<section id="tokens"', 1)
dec = open('tools/design-apps/decisions.html', encoding='utf-8').read()
i_prov = s.index('<section id="provenance"'); i_end = s.rindex('</section>', 0, i_prov)
s = s[:i_end] + block('DECISIONS26', dec) + s[i_end:]
art = open('tools/design-apps/artmarks.html', encoding='utf-8').read()
m_art = re.search(r'<img src="/design-assets/value-marks\.webp"[^>]*>', s)
assert m_art, 'value marks anchor missing'
s = s[:m_art.end()] + '\n' + block('ARTMARKS', art) + s[m_art.end():]
# 26 Sep: the loading screen and its three variations, at the end of Motion (tools/design-apps/loader.html)
ld = open('tools/design-apps/loader.html', encoding='utf-8').read()
# at the TOP of Motion, straight under its head (Bazil, 26 Sep: "i cant find the loader" when it sat at the end)
i_mo = s.index('<section id="motion"'); i_me = s.index('</div></div>', i_mo) + len('</div></div>')
s = s[:i_me] + '\n' + block('LOADER', ld) + s[i_me:]
# 3 renumber in document order
ids = re.findall(r'<section id="([^"]+)"', s)
n = iter(range(1, 100))
s = re.sub(r'(<div class="sh"><span class="no">)\d+(</span>)', lambda m: f'{m.group(1)}{next(n):02d}{m.group(2)}', s)
NAMES = {'mark': 'Mark', 'elements': 'Brand elements', 'direction': 'Art direction', 'colour': 'Colour', 'type': 'Type', 'icons': 'Icons', 'components': 'Components', 'ui': 'Interface', 'data': 'Data', 'photography': 'Photography', 'illustration': 'Illustration', 'space': 'Grid &amp; space', 'motion': 'Motion', 'a11y': 'Accessibility', 'voice': 'Voice', 'decisions': 'Decisions', 'provenance': 'Provenance', 'inuse': 'In use', 'applications': 'Applications', 'tokens': 'Tokens'}
NEW = {'elements', 'direction', 'applications'}
SUBS = {'motion': [('mo-loader', 'Loading screen')], 'applications': [('ap-panels', 'Vision and mission panels'), ('ap-signature', 'Email signature'), ('ap-documents', 'Tender and investor documents'), ('ap-cards', 'Business card'), ('ap-rollups', 'Roll up bunting'), ('ap-banners', 'Ad banner'), ('ap-stationery', 'Folder, letterhead, notebook'), ('ap-signage', 'Site signage')],
        'elements': [('el-lockup', 'Lockup'), ('el-colour', 'Colour'), ('el-fonts', 'Fonts'), ('el-line', 'The line'), ('el-seven', 'The seven lines'), ('el-cycle', 'The delivery cycle'), ('el-boxes', 'Slim boxes'), ('el-square', 'Squares and texture'), ('el-wire', 'Construction wireframe'), ('el-visuals', 'Visuals'), ('el-gradients', 'Gradients'), ('el-badges', 'Badges'), ('el-library', 'Element library'), ('el-bounds', 'Boundaries')]}
# 4 the top bar (phones and tablets)
snav = ''.join(f'<a href="#{i}"><i>{k:02d}</i>{NAMES.get(i, i)}</a>' for k, i in enumerate(ids, 1))
s = re.sub(r'(<nav class="snav"[^>]*><div class="snav-in">)[\s\S]*?(</div></nav>)', lambda m: m.group(1) + '\n  ' + snav + '\n' + m.group(2), s, 1)
# 5 the sidebar (1100px and up)
items = []
for k, i in enumerate(ids, 1):
    sub = ''.join(f'<li><a href="#{a}">{t}</a></li>' for a, t in SUBS.get(i, []))
    items.append(f'<li><a href="#{i}"><i>{k:02d}</i>{NAMES.get(i, i)}{"<b class=new>New</b>" if i in NEW else ""}</a>{f"<ol class=dsb-sub>{sub}</ol>" if sub else ""}</li>')
side = ('<aside class="dsb" aria-label="Design system sections"><div class="dsb-in">'
        f'<a class="dsb-h" href="#top">IAQ design system<small>Tab 04 &middot; {len(ids)} sections</small></a><ol>' + ''.join(items) + '</ol></div></aside>')
s = re.sub(r'(<nav class="snav"[\s\S]*?</div></nav>\n)', lambda m: m.group(1) + block('SIDEBAR', side), s, 1)
# 6 scroll spy
spy = '''<script>
/* 25 Sep 2026: the sidebar marks the section, and inside Applications the piece, that holds the upper third of the screen */
(function(){
  var links={}; document.querySelectorAll('.dsb a[href^="#"]').forEach(function(a){ links[a.getAttribute('href').slice(1)]=a; });
  var targets=[].slice.call(document.querySelectorAll('section[id], .ap[id], .be-sub[id]')).filter(function(t){ return links[t.id]; });
  function pick(){
    var y=innerHeight*0.3, sec=null, sub=null;
    targets.forEach(function(t){ var r=t.getBoundingClientRect(); if(r.top<=y&&r.bottom>y){ if(t.tagName==='SECTION') sec=t.id; else sub=t.id; } });
    Object.keys(links).forEach(function(k){ links[k].classList.toggle('on', k===sec||k===sub); });
    var on=sec&&links[sec]; if(on){ var box=on.closest('.dsb'), r=on.getBoundingClientRect(), b=box.getBoundingClientRect(); if(r.top<b.top+40||r.bottom>b.bottom-40) box.scrollTop+=r.top-b.top-b.height/3; }
  }
  var raf=0; addEventListener('scroll',function(){ if(!raf) raf=requestAnimationFrame(function(){ raf=0; pick(); }); },{passive:true});
  addEventListener('resize',pick); pick(); setTimeout(pick,500);
  /* the service art marks move only while on screen */
  if('IntersectionObserver' in window && !(matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ e.target.classList.toggle('is-live', e.isIntersecting); }); },{threshold:.3});
    document.querySelectorAll('.sm2').forEach(function(el){ io.observe(el); });
  }
})();
</script>'''
s = s.replace('</body>', block('SPY', spy) + '</body>', 1)
# 7 the head's date
s = re.sub(r'(<div><b>Updated</b><span>)[^<]*(</span></div>)', r'\g<1>25 September 2026\g<2>', s, 1)
open(P, 'w', encoding='utf-8').write(s)
print('sections', len(ids), ids)
