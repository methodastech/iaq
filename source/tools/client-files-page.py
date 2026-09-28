#!/usr/bin/env python3
"""Client files page (25 Sep 2026): builds _reference/client-files/index.html from the manifest that
client-files-index.py writes. Served at /client-files.html by tools/vite-client-files.mjs on the dev server; never
part of a build. Bazil: "create a tab here the videos and photos shared by our client", "keep all the comments"."""
import json, os, html, datetime, urllib.parse
REF = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '_reference', 'client-files')
man = json.load(open(os.path.join(REF, 'manifest.json')))
files = man['files']
def size(b):
    return f'{b/1073741824:.1f} GB' if b >= 1073741824 else f'{b/1048576:.1f} MB' if b >= 1048576 else f'{max(1, b//1024)} KB'
def dur(s):
    if not s: return ''
    s = int(round(s)); return f'{s//60}:{s%60:02d}'
def sect(rel):
    """(section, subgroup). 25 Sep (Bazil: "structure everything well"): the loose files are named by what they are, the
    stray "__Photos from past event" folder is folded into its proper section, and every section belongs to one of
    five parts (PARTS below)."""
    p = rel.split('/'); name = p[-1].lower()
    if len(p) == 1:
        if 'questionnaire' in name: return 'Questionnaires (27 Jul)', ''
        if 'website structure' in name: return 'Website structure (11 Jul)', ''
        if 'moodboard' in name: return 'Moodboard (Jun)', ''
        if 'company profile' in name: return 'Company profile brief', ''
        if name == 'sequence.zip': return 'Model sequence (sequence.zip)', ''
        return 'Other files', ''
    if p[0] == 'SharePoint 2027 (17 Sep)' and len(p) > 2: return p[1].replace('__Photos from past event', 'Photos from past event'), '/'.join(p[2:-1])
    if p[0].startswith('wetransfer_'): return 'Revit model set (WeTransfer, 17 Aug)', '/'.join(p[1:-1])
    if p[0].startswith('WhatsApp 2026-09-25 (EFM'): return 'EFM district cooling visual (25 Sep)', ''
    if p[0].startswith('From Brand Method'): return (p[1] if len(p) > 2 else 'Ready to send'), ''
    return p[0], '/'.join(p[1:-1])
PARTS = [
    ('Made by Brand Method, ready to send', 'Videos and stills made for the site from IAQ\u2019s material, numbered and named for sending. Each set has a README saying what each file is, how it was made, and where it is on the site.', ['2026-09-25 Video set']),
    ('Photographs of the work', 'What IAQ has built and where it works, photographed by IAQ.', ['Project Photos', 'Cleanroom Photos', 'HQ Offices']),
    ('The model', 'The Revit coordination model and its renders, the source of the 3D on the site.', ['3D Modelling Photos', 'Revit model set (WeTransfer, 17 Aug)', 'Model sequence (sequence.zip)', 'Fab Information']),
    ('Brand and marketing', 'Logos, templates, the moodboard, the profile, the website brief, the SEMICON booth.', ['EFM district cooling visual (25 Sep)', 'Branding Attachment', 'Logos by email (15 Sep)', 'Website Information', 'Moodboard (Jun)', 'Company profile brief', 'Website structure (11 Jul)', 'OneDrive 2026-09-22 (SEMICON Munich booth, Green Excel)']),
    ('Certificates, awards and answers', 'What IAQ holds and what it wrote back to us.', ['Certification & Award', 'Questionnaires (27 Jul)', 'Feedback and meeting notes', 'Other files']),
    ('Company life', 'Events, celebrations, training and community work, by year.', ['Photos from past event']),
]
ORDER = [sname for _, _, names in PARTS for sname in names]
data = []
for i, f in enumerate(files):
    s, d = sect(f['rel'])
    data.append({'i': i, 'n': f['name'], 'p': f['rel'], 's': s, 'd': d, 'k': f['kind'], 'z': f['size'], 'zs': size(f['size']), 't': f.get('thumb'),
                 'w': (f.get('wh') or [0, 0])[0], 'h': (f.get('wh') or [0, 0])[1], 'du': dur(f.get('dur')), 'e': f['ext'], 'm': datetime.date.fromtimestamp(f['mtime']).isoformat(), 'in': f.get('inside'), 'px': f.get('proxy'), 'cd': f.get('codec')})
sections = sorted({d['s'] for d in data}, key=lambda s: (ORDER.index(s) if s in ORDER else 99, s))
tot = sum(f['size'] for f in files); nimg = sum(1 for f in files if f['kind'] == 'image'); nvid = sum(1 for f in files if f['kind'] == 'video'); ndoc = sum(1 for f in files if f['kind'] == 'doc')
LEDGER = [
    ('17 Aug 2026', 'Revit model set: FAB GF to 3F AR, site, UPW and existing, structure, CR, CW, FPS, MD, MW, PW, RWDP, SN, ST (20 RVT)', 'WeTransfer from IAQ', 'wetransfer_a253_iaq_fab_3f_ar_r22-rvt_2026-08-17_0553', 'The model behind the fab showpiece and the services page 3D.'),
    ('18 Aug 2026', 'Three BM questionnaires (EPC, Energy Management, general), the moodboard, the company profile brief, the website structure, sequence.zip', 'IAQ, by email', 'Loose files', ''),
    ('17 Sep 2026', 'The "Website 2027" share: 3D modelling photos, branding attachment, certification and awards, cleanroom photos, fab information, HQ offices, past events, project photos, website information', 'IAQ SharePoint (OneDrive_1_17-09-2026.zip, 3.4 GB; the second 5.5 GB download is a broken zip and is not needed)', 'SharePoint 2027 (17 Sep)', 'Everything used on the site from this share is logged in public/assets/iaq/SOURCES.md.'),
    ('17 Sep 2026', 'IAQ WEBSITE FEEDBACK (annotated deck, PDF) and the Gemini notes of the 10 Sep and 17 Sep meetings', 'IAQ, by email and Meet', 'Feedback and meeting notes', 'Stored here 25 Sep so the comments stay with the material.'),
    ('22 Sep 2026', 'Booth V3 renders (6) and the graphic specification (10 sheets, print guidelines) for SEMICON Europa, Munich, November 2026', 'Green Excel, the booth builder, forwarded by IAQ (OneDrive_2026-09-22.zip and the (1) zip)', 'OneDrive 2026-09-22 (SEMICON Munich booth, Green Excel)', 'Stored here 25 Sep.'),
    ('24 Sep 2026', 'Website review and comment, 24.09.2026 (PDF) and the tool hook-up diagram', 'IAQ', 'Feedback and meeting notes', 'The video note is quoted below.'),
    ('25 Sep 2026', 'EFM district cooling explainer: an animated isometric of the network (plant, storage tank, offices, hotel, hospital, universities, mall), ARROW-FLOW.gif, 1920x1080, 9.6 s, and the zip it came in', 'IAQ (Haydar), by WhatsApp: "This one is for visual EFM District cooling"', 'WhatsApp 2026-09-25 (EFM district cooling visual)', 'Bazil: "add this to the photo library, why is it missing". The Site Photos share sent the same day (Website 2027/Site Photos, IMG_9310 onward, 26 Oct 2022) is on SharePoint behind IAQ\u2019s login and is not downloaded yet.'),
    ('15 Sep 2026', 'Two logo exports (red, white)', 'IAQ, by email', 'Logos by email (15 Sep)', 'Stored here 25 Sep. The full logo set is in Branding Attachment.'),
]
NOT_IAQ = [
    ('OneDrive_3_14-09-2026 (2).zip and OneDrive_1_23-09-2026.zip', 'Tenthpin’s photo sets (office, training and event photographs, SAP banners). Already stored in Websites/tenthpin/client-photos. Not IAQ material, so not stored here.'),
    ('IAQ-Company-Profileddd.zip', 'Brand Method’s own Company Profile V3 (a single HTML). Our deliverable, not client material.'),
]
NOTES = [
    ('24 Sep 2026', 'Website review and comment', 'This AI video is still wrong. I have provided all materials, video and photos related to give you guys a better understanding on the construction / installation of the equipment. Better not to use other video that does not involve construction and installation as ai cannot accurately deliver the process.', 'Home hero. Answered 25 Sep: the four hero clips are now slow moves over IAQ’s own photographs (the IFKM site from the air, two cleanroom fit-outs, the Kuching plant at dusk); no generated footage on the hero.'),
]
h = html.escape
def esc(s): return h(s, quote=True)
rows = ''.join(f'<tr><td>{esc(a)}</td><td>{esc(b)}</td><td>{esc(c)}</td><td><code>{esc(d)}</code></td><td>{esc(e)}</td></tr>' for a, b, c, d, e in LEDGER)
notiaq = ''.join(f'<li><b>{esc(a)}</b> {esc(b)}</li>' for a, b in NOT_IAQ)
notes = ''.join(f'<li><span class="nd">{esc(a)} · {esc(b)}</span><blockquote>{esc(c)}</blockquote><p>{esc(d)}</p></li>' for a, b, c, d in NOTES)
page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><link rel="icon" type="image/png" href="/assets/iaq-logo.webp"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>IAQ Group · Client files · Brand Method</title>
<link rel="stylesheet" href="/bmws.css">
<style>
@font-face{{font-family:"Switzer";font-weight:600;font-display:swap;src:url(/assets/fonts/Switzer-600-normal.woff2) format("woff2")}}
@font-face{{font-family:"Instrument Sans";font-weight:400;font-display:swap;src:url(/assets/fonts/InstrumentSans-400-normal-latin.woff2) format("woff2")}}
@font-face{{font-family:"Instrument Sans";font-weight:500;font-display:swap;src:url(/assets/fonts/InstrumentSans-500-normal-latin.woff2) format("woff2")}}
@font-face{{font-family:"Instrument Sans";font-weight:600;font-display:swap;src:url(/assets/fonts/InstrumentSans-600-normal-latin.woff2) format("woff2")}}
:root{{--ink:#0C1220;--soft:#4A5468;--faint:#8A93A6;--line:#E4E8EF;--paper:#fff;--wash:#F5F7FA;--red:#EC2027}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:"Instrument Sans",system-ui,sans-serif;background:var(--paper);color:var(--ink);font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased}}
.wrap{{padding:0 28px}}
h1,h2,h3{{font-family:"Switzer","Instrument Sans",system-ui,sans-serif;font-weight:600;letter-spacing:-.02em;line-height:1.08}}
h1{{font-size:clamp(34px,4.2vw,56px);margin:44px 0 12px}} h1 em{{font-style:normal;color:var(--red)}}
h2{{font-size:clamp(22px,2.2vw,30px);margin:56px 0 6px;scroll-margin-top:96px}}
h3{{font-size:15px;font-weight:600;letter-spacing:-.005em;color:var(--soft);margin:26px 0 10px}}
.lede{{font-size:17px;color:var(--soft);max-width:78ch}}
.facts{{display:flex;flex-wrap:wrap;gap:8px 28px;margin:18px 0 0;color:var(--soft);font-size:14px}} .facts b{{color:var(--ink);font-family:"Switzer",sans-serif;font-size:20px;margin-right:6px}}
table{{border-collapse:collapse;width:100%;font-size:13.5px;margin-top:14px}} th,td{{text-align:left;vertical-align:top;padding:9px 12px 9px 0;border-top:1px solid var(--line)}} th{{font-weight:600;color:var(--faint);font-size:12px;border-top:0}} td code{{font-family:"Instrument Sans",sans-serif;background:var(--wash);padding:1px 6px;font-size:12.5px}}
.two{{display:grid;grid-template-columns:1.4fr 1fr;gap:40px;margin-top:8px}} @media(max-width:960px){{.two{{grid-template-columns:1fr}}}}
.notiaq{{list-style:none}} .notiaq li{{padding:10px 0;border-top:1px solid var(--line);font-size:13.5px;color:var(--soft)}} .notiaq b{{color:var(--ink);display:block;margin-bottom:2px}}
.notes{{list-style:none}} .notes li{{padding:12px 0;border-top:1px solid var(--line)}} .nd{{font-size:12px;color:var(--faint);font-weight:600}} blockquote{{margin:6px 0;padding:12px 16px;background:var(--wash);border-left:0;font-size:15px;line-height:1.5}} .notes p{{font-size:13.5px;color:var(--soft)}}
.ctl{{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.94);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:14px 28px;margin:36px -28px 0;display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;border-bottom:1px solid var(--line)}}
.chips{{display:flex;gap:4px;flex-wrap:wrap}} .chips button{{font:500 13px/1 "Instrument Sans",sans-serif;padding:9px 13px;border:0;background:var(--wash);color:var(--soft);cursor:pointer}} .chips button.on{{background:var(--ink);color:#fff}}
.ctl input{{font:400 14px/1 "Instrument Sans",sans-serif;padding:9px 12px;border:1px solid var(--line);min-width:260px;outline:0}} .ctl input:focus{{border-color:var(--ink)}}
.count{{font-size:13px;color:var(--faint);margin-left:auto}}
.toc{{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:14px;font-size:13.5px}} .toc a{{color:var(--soft);text-decoration:none}} .toc a:hover{{color:var(--ink)}} .toc a i{{font-style:normal;color:var(--faint);margin-left:4px}}
.part{{margin-top:64px;padding-top:28px;border-top:2px solid var(--ink)}} .part-h{{font-size:clamp(26px,2.6vw,36px);margin:0}} .part-lede{{margin:6px 0 0;color:var(--soft);font-size:15px}}
.toc-part{{flex-basis:100%;font-size:12px;font-weight:600;color:var(--faint);margin-top:8px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(184px,1fr));gap:18px 14px}}
.tile.wide{{grid-column:span 2}} .tile.wide .th{{aspect-ratio:auto;min-height:0;height:0;overflow:hidden}}
.ins{{display:block;margin-top:8px;padding:10px 12px;background:var(--wash);font-size:12px;line-height:1.45;color:var(--soft);white-space:normal}} .ins b{{display:block;color:var(--ink);font-weight:600;margin-bottom:4px}} .ins i{{display:block;font-style:normal;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}
.tile{{display:block;color:inherit;text-decoration:none;min-width:0;cursor:pointer}}
.th{{position:relative;aspect-ratio:4/3;background:var(--wash);overflow:hidden}} .th img{{width:100%;height:100%;object-fit:cover;display:block}} .th.doc img{{object-fit:contain;background:#fff}}
.th .ext{{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:600 13px/1 "Switzer",sans-serif;color:var(--faint);letter-spacing:.04em}}
.th .play{{position:absolute;left:8px;bottom:8px;display:flex;align-items:center;gap:6px;background:rgba(12,18,32,.82);color:#fff;font:600 11px/1 "Instrument Sans",sans-serif;padding:5px 8px}} .th .play::before{{content:"";border-style:solid;border-width:5px 0 5px 8px;border-color:transparent transparent transparent #fff}}
.nm{{display:block;font-size:13px;font-weight:500;margin-top:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}} .mt{{display:block;font-size:12px;color:var(--faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}} .th{{display:block}}
.sec.hide,.grp.hide,.tile.hide{{display:none}}
.lb{{position:fixed;inset:0;z-index:100;background:rgba(12,18,32,.92);display:none;align-items:center;justify-content:center;flex-direction:column;gap:12px;padding:24px}} .lb.on{{display:flex}}
.lb img,.lb video{{max-width:min(96vw,1600px);max-height:80vh;background:#000}} .lb .cap{{color:#fff;font-size:13px;display:flex;gap:18px;align-items:center}} .lb .cap a{{color:#fff}} .lb .x{{position:absolute;top:16px;right:20px;color:#fff;font:600 14px/1 "Instrument Sans",sans-serif;background:none;border:0;cursor:pointer;padding:8px}}
footer{{margin:64px 0 40px;font-size:12.5px;color:var(--faint)}}
</style>
</head>
<body>
<div class="bmws" style="--bmws-acc:#2536F5"><div class="bmws-in"><div class="bmws-crumb"><b>IAQ Utility Solutions</b><span>Super Admin</span></div><nav class="bmws-tabs" aria-label="Super admin developer navigation"><span class="bmws-g"><a href="/audit.html"><i>00</i>Web Audit</a><a href="/competitors.html"><i>01</i>Competitors</a><a href="/plan.html"><i>02</i>Web Plan</a><a href="/checklist.html"><i>03</i>Amendments</a><a href="/client-files.html" class="on"><i>10</i>Client files</a></span><span class="bmws-g"><a href="/design.html"><i>04</i>Design</a></span><span class="bmws-g"><a href="/web1/index.html" class="rej"><i>05</i>Web 1</a><a href="/home2" class="rej"><i>06</i>Web 2</a><a href="/"><i>07</i>Web 3 &middot; live</a><a href="/portal/newsroom?admin"><i>08</i>CMS</a><a href="/portal/codex?admin"><i>09</i>Codex</a></span></nav></div></div>
<div class="wrap">
<h1>Client files. <em>Everything IAQ has shared.</em></h1>
<p class="lede">Stored untouched at <code>Client info/IAQ</code>, outside the website repo, and shown here in full: every photograph, video, drawing, document and note IAQ has sent, in the folders they came in. A photo or video opens large here; a document opens in a new tab.</p>
<div class="facts"><span><b>{len(files)}</b>files</span><span><b>{size(tot)}</b>on disk</span><span><b>{nimg}</b>photos and images</span><span><b>{nvid}</b>videos</span><span><b>{ndoc}</b>documents</span></div>
<div class="two">
<div><h3>Deliveries, in order</h3><table><thead><tr><th>Received</th><th>What</th><th>From</th><th>Stored at</th><th>Note</th></tr></thead><tbody>{rows}</tbody></table></div>
<div><h3>Received but not IAQ&rsquo;s</h3><ul class="notiaq">{notiaq}</ul><h3>Client comments on the website</h3><ul class="notes">{notes}</ul></div>
</div>
<div class="ctl"><div class="chips" id="chips"><button data-k="" class="on">All</button><button data-k="image">Photos</button><button data-k="video">Videos</button><button data-k="doc">Documents</button><button data-k="file">Other</button></div><input id="q" type="search" placeholder="Search a name or folder" autocomplete="off"><span class="count" id="count"></span></div>
<div class="toc" id="toc"></div>
<div id="secs"></div>
<footer>Built {datetime.datetime.now().strftime('%d %b %Y %H:%M')} by tools/client-files-page.py from tools/client-files-index.py. Originals are read only; thumbnails live in _reference/client-files. Dev server only, never in a build.</footer>
</div>
<div class="lb" id="lb"><button class="x" id="lbx">Close</button><div id="lbm"></div><div class="cap" id="lbc"></div></div>
<script>
const D={json.dumps(data, ensure_ascii=False)};
const SECS={json.dumps(sections, ensure_ascii=False)};
const PARTS={json.dumps([[a, b, c] for a, b, c in PARTS], ensure_ascii=False)};
const raw=p=>'/client-files/raw/'+p.split('/').map(encodeURIComponent).join('/');
const esc=s=>s.replace(/[&<>"]/g,c=>({{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}}[c]));
const secs=document.getElementById('secs'), toc=document.getElementById('toc');
const placed=new Set();
for(const [ptitle, plede, pnames] of PARTS){{
  const secsHere=SECS.filter(x=>pnames.includes(x)); if(!secsHere.length) continue;
  const ph=document.createElement('div'); ph.className='part'; ph.innerHTML='<h2 class="part-h">'+esc(ptitle)+'</h2><p class="part-lede">'+esc(plede)+'</p>'; secs.appendChild(ph);
  const pt=document.createElement('span'); pt.className='toc-part'; pt.textContent=ptitle; toc.appendChild(pt);
  for(const s of secsHere) placed.add(s);
for(const s of secsHere){{
  const items=D.filter(d=>d.s===s); const groups=[...new Set(items.map(d=>d.d))];
  const el=document.createElement('section'); el.className='sec'; el.id='s'+SECS.indexOf(s); el.dataset.s=s;
  el.innerHTML='<h2>'+esc(s)+' <small style="font:500 14px/1 Instrument Sans,sans-serif;color:var(--faint)">'+items.length+' files</small></h2>';
  for(const g of groups){{
    const gi=items.filter(d=>d.d===g); const ge=document.createElement('div'); ge.className='grp';
    ge.innerHTML=(g?'<h3>'+esc(g)+'</h3>':'<h3 style="height:6px;margin:10px 0 0"></h3>')+'<div class="grid"></div>';
    const grid=ge.querySelector('.grid');
    for(const d of gi){{
      const a=document.createElement('a'); a.className='tile'; a.href=raw(d.p); a.target='_blank'; a.rel='noopener'; a.dataset.i=d.i; a.dataset.k=d.k; a.dataset.q=(d.n+' '+d.p).toLowerCase();
      const th=d.t?'<img loading="lazy" decoding="async" src="/client-files/'+d.t+'" alt="">':'<span class="ext">'+esc(d.e.toUpperCase()||'FILE')+'</span>';
      const play=d.k==='video'?'<span class="play">'+esc(d.du||'video')+'</span>':'';
      const meta=[d.k==='image'&&d.w?d.w+'×'+d.h:'', d.k==='video'&&d.w?d.w+'×'+d.h:'', d.zs, d.e.toUpperCase()].filter(Boolean).join(' · ');
      const ins=d.in?'<span class="ins"><b>'+esc(d.in.kind)+(d.in.count?' · '+d.in.count+(d.in.kind==='Deck'?' slides':d.in.kind==='Workbook'?' sheets':d.in.kind==='Archive'?' files':d.in.kind==='PDF'?' pages':d.in.kind==='Diagram'?' pages':d.in.kind==='Text'?' lines':' paragraphs'):'')+'</b>'+d.in.lines.map(l=>'<i>'+esc(l)+'</i>').join('')+'</span>':'';
      if(d.in && !d.t){{ a.classList.add('wide'); }}
      a.innerHTML='<span class="th '+d.k+'">'+th+play+'</span><span class="nm" title="'+esc(d.n)+'">'+esc(d.n)+'</span><span class="mt">'+esc(meta)+'</span>'+ins;
      grid.appendChild(a);
    }}
    el.appendChild(ge);
  }}
  secs.appendChild(el);
  const t=document.createElement('a'); t.href='#'+el.id; t.innerHTML=esc(s)+'<i>'+items.length+'</i>'; toc.appendChild(t);
}}
}}
let kind='', q='';
function apply(){{
  let n=0;
  for(const a of document.querySelectorAll('.tile')){{ const ok=(!kind||a.dataset.k===kind)&&(!q||a.dataset.q.includes(q)); a.classList.toggle('hide',!ok); if(ok)n++; }}
  for(const g of document.querySelectorAll('.grp')) g.classList.toggle('hide',!g.querySelector('.tile:not(.hide)'));
  for(const s of document.querySelectorAll('.sec')) s.classList.toggle('hide',!s.querySelector('.tile:not(.hide)'));
  document.getElementById('count').textContent=n+' of '+D.length+' shown';
}}
document.getElementById('chips').addEventListener('click',e=>{{ const b=e.target.closest('button'); if(!b)return; kind=b.dataset.k; for(const x of b.parentNode.children)x.classList.toggle('on',x===b); apply(); }});
document.getElementById('q').addEventListener('input',e=>{{ q=e.target.value.trim().toLowerCase(); apply(); }});
apply();
/* lightbox for photos and videos; documents and other files open in a new tab */
const lb=document.getElementById('lb'), lbm=document.getElementById('lbm'), lbc=document.getElementById('lbc');
secs.addEventListener('click',e=>{{ const a=e.target.closest('.tile'); if(!a)return; const d=D[a.dataset.i]; if(d.k!=='image'&&d.k!=='video')return; if(d.k==='image'&&/^(heic|heif)$/.test(d.e))return;
  e.preventDefault(); lbm.innerHTML=d.k==='video'?'<video src="'+(d.px?'/client-files/'+d.px:raw(d.p))+'" controls autoplay playsinline></video>':'<img src="'+raw(d.p)+'" alt="">';
  lbc.innerHTML='<span>'+esc(d.p)+'</span><span>'+esc(d.zs)+(d.cd?' · '+esc(d.cd.toUpperCase())+(d.px?', playing a 720p H.264 proxy':''):'')+'</span><a href="'+raw(d.p)+'" target="_blank" rel="noopener">Open the original</a>'; lb.classList.add('on'); }});
function close(){{ lb.classList.remove('on'); lbm.innerHTML=''; }}
document.getElementById('lbx').addEventListener('click',close); lb.addEventListener('click',e=>{{ if(e.target===lb)close(); }}); addEventListener('keydown',e=>{{ if(e.key==='Escape')close(); }});
</script>
</body>
</html>'''
open(os.path.join(REF, 'index.html'), 'w', encoding='utf-8').write(page)
print('page written', len(page)//1024, 'KB;', len(files), 'files;', len(sections), 'sections')
