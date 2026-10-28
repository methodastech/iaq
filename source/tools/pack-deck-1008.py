"""8 Oct 2026 (Bazil: "give me the zip file for this page only"): the exhibition deck as its own site, zipped.

  python3 tools/pack-deck-1008.py

1. builds deck.html with vite.config.deck.js into dist-deck/ (publicDir off), renames it index.html
2. copies every /assets/... file the built deck and its font stylesheet reference, and the whole 3D app (public/3d)
3. adds serve.py (a local server that answers byte ranges, so the films loop), the Mac and Windows start files, README
4. zips dist-deck/ into _exports/IAQ-Europe-presentation-1-<date>.zip (films and models stored, text deflated)
"""
import datetime, os, re, shutil, subprocess, sys, zipfile
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
PUB, OUT, PACK = 'public', 'dist-deck', 'tools/deck-pack'

r = subprocess.run(['npx', 'vite', 'build', '--config', 'vite.config.deck.js'], capture_output=True, text=True)
if r.returncode:
    print(r.stdout[-3000:], r.stderr[-3000:]); sys.exit('build failed')
os.replace(f'{OUT}/deck.html', f'{OUT}/index.html')

# every /assets/ path in the built html, js and css, and in the font stylesheet
texts = []
for d, _, fs in os.walk(OUT):
    for f in fs:
        if f.endswith(('.html', '.js', '.css')):
            texts.append(open(os.path.join(d, f), encoding='utf-8', errors='ignore').read())
texts.append(open(f'{PUB}/assets/fonts/fonts.css', encoding='utf-8').read())
refs = set()
for t in texts:
    for m in re.finditer(r'/assets/[A-Za-z0-9_./%-]+\.(?:webp|png|jpg|jpeg|svg|mp4|webm|woff2|css|json|gif|avif|ico)', t):
        refs.add(m.group(0))
copied, missing, size = [], [], 0
for ref in sorted(refs):
    src = PUB + ref
    if os.path.isfile(src):
        dst = OUT + ref
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if not os.path.exists(dst):
            shutil.copy2(src, dst); copied.append(ref); size += os.path.getsize(src)
    else:
        missing.append(ref)
# folders the bundle reaches through template paths (`/assets/units/iso/${key}.webp`), which the scan above cannot see
for folder in ['assets/units/iso']:
    shutil.copytree(f'{PUB}/{folder}', f'{OUT}/{folder}', dirs_exist_ok=True)
for t in texts:
    for m in re.finditer(r'/assets/([A-Za-z0-9_./-]+)/\$\{', t):
        if m.group(1) not in ('units/iso',): print('   template path not packed:', m.group(0))
# the 3D app, whole
shutil.copytree(f'{PUB}/3d', f'{OUT}/3d', dirs_exist_ok=True,
                ignore=shutil.ignore_patterns('*.bat', '*.ps1', '.DS_Store'))
for f in os.listdir(PACK):
    shutil.copy2(os.path.join(PACK, f), os.path.join(OUT, f))

def tree_size(p):
    return sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(p) for f in fs)
print(f'copied {len(copied)} referenced files ({size/1048576:.1f} MB); not found in public: {len(missing)}')
for m in missing[:40]: print('   missing', m)
print(f'dist-deck total {tree_size(OUT)/1048576:.1f} MB')

os.makedirs('_exports', exist_ok=True)
name = f'IAQ-Europe-presentation-1-{datetime.date.today().isoformat()}'
zpath = f'_exports/{name}.zip'
STORE = ('.mp4', '.glb', '.webp', '.png', '.jpg', '.woff2', '.wasm', '.gz')
with zipfile.ZipFile(zpath, 'w') as z:
    for d, _, fs in os.walk(OUT):
        for f in sorted(fs):
            if f == '.DS_Store': continue
            full = os.path.join(d, f)
            arc = os.path.join(name, os.path.relpath(full, OUT))
            zi = zipfile.ZipInfo.from_file(full, arc)
            zi.compress_type = zipfile.ZIP_STORED if f.lower().endswith(STORE) else zipfile.ZIP_DEFLATED
            if f.endswith(('.command', '.py')): zi.external_attr = (0o755 << 16)
            with open(full, 'rb') as fh: z.writestr(zi, fh.read())
print('zip', zpath, f'{os.path.getsize(zpath)/1048576:.1f} MB')
