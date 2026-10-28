"""9 Oct 2026: the exhibition portal back into one HTML file to send (like the 200 MB original), with this session's
edits: the D artwork, the lightbox zoom. Reads public/booth/expo/ and writes _exports/IAQ-Exhibition-Portal-<date>.html.
Run after tools/expo-portal-1009.py and tools/expo-art-1009.py. Check with:
  node tools/check-expo-single-1009.mjs "<absolute path of the html>"   (counts pictures that actually drew)"""
import base64, datetime, mimetypes, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'public/booth/expo')
h = open(os.path.join(SRC, 'index.html'), encoding='utf-8').read()
# file access back to embedded: the 200 MB original's own loader
start = h.index('const __url = {}, __blob = {};'); end = h.index("document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('img[data-f]')")
h = h[:start] + """const __url = {}, __blob = {};
function FILEBLOB(name) {
  name = String(name).replace(/^files\\//, '');
  if (__blob[name]) return __blob[name];
  const el = document.querySelector('script[data-asset="' + name + '"]');
  if (!el) return null;
  const s = atob(el.textContent.trim()), a = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
  return (__blob[name] = new Blob([a], { type: el.dataset.type }));
}
function FILE(name) {
  name = String(name).replace(/^files\\//, '');
  if (!__url[name]) { const b = FILEBLOB(name); __url[name] = b ? URL.createObjectURL(b) : ''; }
  return __url[name];
}
""" + h[end:]
h = h.replace('Every file downloads from this portal, one by one or as a bundle.', 'Every file is inside this page: the downloads work offline.', 1)
blocks = []
for n in sorted(os.listdir(os.path.join(SRC, 'files'))):
    t = mimetypes.guess_type(n)[0] or 'application/octet-stream'
    b64 = base64.b64encode(open(os.path.join(SRC, 'files', n), 'rb').read()).decode()
    blocks.append(f'<script  type="application/octet-stream" data-asset="{n}" data-type="{t}">{b64}</script>')
# the embedded files must be parsed BEFORE the page script that renders the tiles (it calls FILE() as it draws, and an
# asset block that is not yet in the document gives an empty address): they go right before the script that opens with
# `const DATA = [`, as in IAQ's own portal file. Found 9 Oct by the Brand Identity session (2 of 100 pictures drew).
i = h.find('const DATA = [')
assert i > 0, 'page data script not found'
at = h.rfind('<script', 0, i)
h = h[:at] + '\n'.join(blocks) + '\n' + h[at:]
os.makedirs(os.path.join(ROOT, '_exports'), exist_ok=True)
out = os.path.join(ROOT, '_exports', f'IAQ-Exhibition-Portal-{datetime.date.today().isoformat()}.html')
open(out, 'w', encoding='utf-8').write(h)
print(out, f'{os.path.getsize(out)/1048576:.1f} MB', len(blocks), 'files')
