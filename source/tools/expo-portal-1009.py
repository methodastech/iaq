"""9 Oct 2026 (Bazil: "please update the exhibition part fully with this", with Downloads/IAQ-Exhibition-Portal.html).

The exhibition portal arrives as one 200 MB HTML file: every print PDF, still, film and QR inside it as base64. This
unpacks it into public/booth/expo/ so the website's member portal can show it whole without loading 200 MB at once:

  public/booth/expo/index.html   the portal page, unchanged except where it read its embedded files
  public/booth/expo/files/       the 211 files, one by one

The page's own code is kept; only its file access changes: FILE(name) returns the file's address, FILEBLOB(name) fetches
it (so save() and the zip builder await it), the offline note says where files come from. Re-run whenever a new copy of
the portal file arrives:   python3 tools/expo-portal-1009.py [path to IAQ-Exhibition-Portal.html]
"""
import base64, os, re, sys, shutil
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Downloads/IAQ-Exhibition-Portal.html')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public/booth/expo')
html = open(SRC, encoding='utf-8').read()

# 1 the embedded files, out to disk
if os.path.isdir(OUT): shutil.rmtree(OUT)
os.makedirs(f'{OUT}/files')
names = []
def unpack(m):
    attrs, body = m.group(1), m.group(2)
    name = re.search(r'data-asset="([^"]+)"', attrs).group(1)
    if '/' in name or name.startswith('.'): raise SystemExit('unsafe asset name: ' + name)
    with open(f'{OUT}/files/{name}', 'wb') as f: f.write(base64.b64decode(body.strip()))
    names.append(name)
    return ''
html = re.sub(r'<script([^>]*data-asset="[^"]*"[^>]*)>(.*?)</script>\s*', unpack, html, flags=re.S)

# 2 file access: addresses instead of embedded blobs
old_loader = html[html.index('const __url = {}, __blob = {};'):html.index("document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('img[data-f]')")]
new_loader = """const __url = {}, __blob = {};
/* 9 Oct (Brand Method): the files sit beside this page in files/ instead of inside it; FILEBLOB fetches one */
async function FILEBLOB(name) {
  name = String(name).replace(/^files\\//, '');
  if (__blob[name]) return __blob[name];
  try { const r = await fetch(FILE(name)); if (!r.ok) return null; return (__blob[name] = await r.blob()); } catch (e) { return null; }
}
function FILE(name) {
  name = String(name).replace(/^files\\//, '');
  return __url[name] || (__url[name] = 'files/' + encodeURIComponent(name));
}
"""
html = html.replace(old_loader, new_loader, 1)
n0 = html.count('b = FILEBLOB(name);')
html = html.replace('function save(path) {\n  const name = path.split(\'/\').pop(), b = FILEBLOB(name);', 'async function save(path) {\n  const name = path.split(\'/\').pop(), b = await FILEBLOB(name);', 1)
html = html.replace('new Uint8Array(await FILEBLOB(it.file).arrayBuffer())', 'new Uint8Array(await (await FILEBLOB(it.file)).arrayBuffer())', 1)
html = html.replace('Every file is inside this page: the downloads work offline.', 'Every file downloads from this portal, one by one or as a bundle.', 1)
assert 'await FILEBLOB(name)' in html and 'await (await FILEBLOB(it.file))' in html, 'download code changed shape'
left = [m.start() for m in re.finditer(r'FILEBLOB\(', html)]
# the at-scale lineup ("Four surfaces, at one scale") was plain pictures: each becomes a button that opens the zoom view,
# drawn from the full-resolution file so the magnifier has detail (Bazil, 9 Oct: "where's the zoom in features")
LU_OLD = '<figure><img src="${FILE(preview(d).file)}" alt="${esc(d.title)}, variation ${v}" style="height:${Math.round(d.mm[1]*s)}px;width:auto"><figcaption>'
LU_NEW = '<figure><button class="shot lu" type="button" data-open="${d.board}" aria-label="Open ${esc(d.title)}, variation ${v} larger"><img loading="lazy" src="${FILE(sharp(d).file)}" alt="${esc(d.title)}, variation ${v}" style="height:${Math.round(d.mm[1]*s)}px;width:auto"></button><figcaption>'
assert html.count(LU_OLD) == 1, 'lineup template changed shape'
html = html.replace(LU_OLD, LU_NEW, 1)

# inside the website's portal (an iframe), the page's own # links scroll this page only, never the portal around it
EMBED = '''<script>
/* 9 Oct (Brand Method): in the member portal this page sits in a frame; a # link scrolled the portal too and hid its
   super admin bar. Inside a frame, # links scroll this page only, under its own header bar */
if (window.top !== window) document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return
  const id = a.getAttribute('href').slice(1), el = id ? document.getElementById(id) : null
  if (!el && id !== 'top') return
  e.preventDefault()
  const bar = document.querySelector('header.bar'), off = bar ? bar.getBoundingClientRect().height : 0
  window.scrollTo({ top: id === 'top' || !el ? 0 : el.getBoundingClientRect().top + window.scrollY - off, behavior: 'smooth' })
}, true)
</script>
'''
# the lightbox gets a real zoom (Bazil, 9 Oct: "where's the zoom in"): - / % / + / Fit, wheel and pinch zoom toward the
# pointer, drag to pan, double-click to zoom in, + and - keys; the page's own "Actual size" toggle gives way to it
ZOOM = '''<style>
.lb .pic{overflow:hidden!important;touch-action:none;cursor:zoom-in}
.lb .pic img{transform-origin:0 0;will-change:transform;user-select:none;-webkit-user-drag:none}
.lb .pic.zz img{max-width:100%!important;max-height:100%!important}
.lb .pic.grab{cursor:grab}.lb .pic.grabbing{cursor:grabbing}
.lb .zctl{display:inline-flex;align-items:center;gap:2px}
.lb .zctl button{min-width:40px}
.lb .zctl b{color:#fff;font:600 13px/1 var(--display, sans-serif);min-width:54px;text-align:center;font-variant-numeric:tabular-nums}
/* every picture says it zooms: a square label, always visible (touch screens have no hover) */
.shot{position:relative}
.shot.lu{appearance:none;border:0;padding:0;background:none;cursor:zoom-in;display:block}
.shot::after{content:"Zoom";position:absolute;right:8px;bottom:8px;z-index:2;display:flex;align-items:center;gap:6px;padding:6px 9px 6px 26px;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23EC2326' stroke-width='2.2'%3E%3Ccircle cx='10.5' cy='10.5' r='6.5'/%3E%3Cpath d='M15.5 15.5L21 21M10.5 7.5v6M7.5 10.5h6'/%3E%3C/svg%3E") 8px 50%/13px 13px no-repeat;color:#231F20;font:600 12px/1 var(--display, sans-serif);box-shadow:0 1px 2px rgba(0,0,0,.12),0 0 0 1px rgba(35,31,32,.08);pointer-events:none;transition:background-color .2s,color .2s}
.shot:hover::after{background-color:#231F20;color:#fff}
.shot.lu::after{right:4px;bottom:4px;padding:4px 6px 4px 20px;background-size:11px 11px;background-position:6px 50%;font-size:10.5px}
/* the magnifier: a square lens that follows the mouse over a picture */
.zlens{position:fixed;z-index:2147482000;width:260px;height:260px;pointer-events:none;background-repeat:no-repeat;background-color:#fff;box-shadow:0 0 0 1px rgba(35,31,32,.25),0 18px 40px rgba(20,22,28,.28);display:none}
@media (hover:none){.zlens{display:none!important}}
/* the lightbox fully covers the page under it (the page's header showed through its top bar) */
.lb{background:#14161C!important;z-index:2147483000!important}
</style>
<script>
/* 9 Oct (Brand Method): zoom in the lightbox */
(function () {
  const lb = document.getElementById('lb'), pic = document.getElementById('lb-pic'), img = document.getElementById('lb-img'), old = document.getElementById('lb-zoom')
  if (!lb || !pic || !img) return
  pic.classList.add('zz')
  const ctl = document.createElement('span'); ctl.className = 'zctl'
  ctl.innerHTML = '<button class="btn ghost" type="button" data-z="-" aria-label="Zoom out">&minus;</button><b aria-live="polite">100%</b><button class="btn ghost" type="button" data-z="+" aria-label="Zoom in">+</button><button class="btn ghost" type="button" data-z="fit">Fit</button>'
  /* the page's own code still sets that button's text on every open: it stays in the page, hidden, the zoom beside it */
  if (old) { old.style.display = 'none'; old.after(ctl) } else { lb.querySelector('.top').appendChild(ctl) }
  const lab = ctl.querySelector('b')
  let s = 1, tx = 0, ty = 0
  const MAX = () => Math.max(4, (img.naturalWidth || 1) / Math.max(1, img.offsetWidth) * 2)
  const apply = () => { img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')'; lab.textContent = Math.round(s * 100) + '%'; pic.classList.toggle('grab', s > 1) }
  const reset = () => { s = 1; tx = 0; ty = 0; apply() }
  const zoomAt = (cx, cy, ns) => {
    ns = Math.min(MAX(), Math.max(1, ns))
    const r = img.getBoundingClientRect(), L = r.left - tx, T = r.top - ty
    const px = (cx - L - tx) / s, py = (cy - T - ty) / s
    tx = cx - L - px * ns; ty = cy - T - py * ns; s = ns
    if (s === 1) { tx = 0; ty = 0 }
    apply()
  }
  const centre = () => { const r = pic.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] }
  ctl.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const z = b.dataset.z
    if (z === 'fit') return reset(); const [cx, cy] = centre(); zoomAt(cx, cy, z === '+' ? s * 1.5 : s / 1.5) })
  pic.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.clientX, e.clientY, s * Math.exp(-e.deltaY * 0.0022)) }, { passive: false })
  pic.addEventListener('dblclick', e => { s > 1.01 ? reset() : zoomAt(e.clientX, e.clientY, 2.5) })
  const pts = new Map(); let last = null, pinch = null, moved = 0
  /* a drag or a pinch never counts as the click that closes the lightbox */
  pic.addEventListener('click', e => { if (moved > 5) { e.stopPropagation(); e.preventDefault() } moved = 0 }, true)
  pic.addEventListener('pointerdown', e => { moved = 0; pic.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); last = [e.clientX, e.clientY]; if (s > 1) pic.classList.add('grabbing')
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s } } })
  pic.addEventListener('pointermove', e => { if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, [e.clientX, e.clientY])
    if (pts.size === 2 && pinch) { moved += 10; const [a, b] = [...pts.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, pinch.s * d / pinch.d); return }
    if (last) moved += Math.abs(e.clientX - last[0]) + Math.abs(e.clientY - last[1])
    if (s > 1 && last) { tx += e.clientX - last[0]; ty += e.clientY - last[1]; last = [e.clientX, e.clientY]; apply() } else if (last) last = [e.clientX, e.clientY] })
  const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) { last = null; pic.classList.remove('grabbing') } }
  pic.addEventListener('pointerup', up); pic.addEventListener('pointercancel', up)
  document.addEventListener('keydown', e => { if (lb.hidden) return; const [cx, cy] = centre()
    if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomAt(cx, cy, s * 1.5) } else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomAt(cx, cy, s / 1.5) } else if (e.key === '0') reset() })
  img.addEventListener('load', reset)
  /* the magnifier over the pictures on the page (mouse only): the picture under the pointer at up to four times */
  const lens = document.createElement('div'); lens.className = 'zlens'; document.body.appendChild(lens)
  const L = 260
  document.addEventListener('pointermove', e => {
    if (e.pointerType && e.pointerType !== 'mouse') { lens.style.display = 'none'; return }
    const pic = e.target.closest && e.target.closest('.shot'); const im = pic && pic.querySelector('img')
    if (!im || !im.naturalWidth || !lb.hidden) { lens.style.display = 'none'; return }
    const r = im.getBoundingClientRect(), k = Math.min(r.width / im.naturalWidth, r.height / im.naturalHeight)
    const cw = im.naturalWidth * k, ch = im.naturalHeight * k, cx = r.left + (r.width - cw) / 2, cy = r.top + (r.height - ch) / 2
    const x = e.clientX - cx, y = e.clientY - cy
    if (x < 0 || y < 0 || x > cw || y > ch) { lens.style.display = 'none'; return }
    const m = Math.max(2.2, Math.min(4, im.naturalWidth / cw))
    lens.style.backgroundImage = 'url("' + (im.currentSrc || im.src) + '")'
    lens.style.backgroundSize = (cw * m) + 'px ' + (ch * m) + 'px'
    lens.style.backgroundPosition = (L / 2 - x * m) + 'px ' + (L / 2 - y * m) + 'px'
    let lx = e.clientX + 24, ly = e.clientY - L / 2
    if (lx + L > innerWidth - 8) lx = e.clientX - L - 24
    ly = Math.max(8, Math.min(innerHeight - L - 8, ly))
    lens.style.left = lx + 'px'; lens.style.top = ly + 'px'; lens.style.display = 'block'
  }, { passive: true })
  document.addEventListener('pointerleave', () => { lens.style.display = 'none' })
  addEventListener('scroll', () => { lens.style.display = 'none' }, { passive: true })
  new MutationObserver(() => { if (!lb.hidden) reset() }).observe(lb, { attributes: true, attributeFilter: ['hidden'] })
})()
</script>
'''
html = html.replace('</body>', EMBED + ZOOM + '</body>', 1)
open(f'{OUT}/index.html', 'w', encoding='utf-8').write(html)
size = sum(os.path.getsize(f'{OUT}/files/{n}') for n in names)
print(f'{len(names)} files, {size/1048576:.1f} MB; page {len(html)/1024:.0f} KB; FILEBLOB calls left {len(left)}')
