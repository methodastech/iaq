#!/usr/bin/env python3
"""The whole exhibition in one ZIP (30 Sep 2026, Bazil: "you're supposed to have a download button for this total page",
"then just give me the whole zip file"). public/booth/iaq-exhibition-everything.zip holds:
  README.txt
  codex/        the exhibition codex, one HTML file that opens offline
  print-pdf/    every print PDF at 1:1 with bleed, by direction (the print zip's own folders, rejected ones under rejected/)
  png/          every piece as PNG for review, by direction
and src/data/boothEverything.js carries its link, name and size for the buttons on /portal/booth.
Run AFTER tools/booth-codex-0930.py (it reuses the codex and the print zip): python3 tools/booth-everything-0930.py"""
import os, re, zipfile, datetime, json, time
PUB = 'public/booth'
CODEX = f'{PUB}/iaq-exhibition-codex.html'
PRINT_ZIP = f'{PUB}/iaq-exhibition-print-files.zip'
OUT = f'{PUB}/iaq-exhibition-everything.zip'
DATA = 'src/data/boothEverything.js'
ROOT = 'IAQ-SEMICON-Europa-2026-exhibition'
LIVE = {'': 'direction-A-white-cleanroom', 'b': 'rejected/direction-B-navy-statement', 'c': 'direction-C-isometric-cleanroom',
        'c2': 'direction-C2-isometric-cleanroom-red-front', 'c3': 'direction-C3-isometric-cleanroom-red-back-wall',
        'd': 'rejected/direction-D-field-red', 'e': 'direction-E-red-back-wall', 'f': 'direction-F-3d-cleanroom'}

def png_folder(name):
    n = name[:-4]
    if re.match(r'^(tri|trifold|leaflet|a5|print)', n, re.I): return 'exhibition-print'
    m = re.search(r'-(c2|c3|b|c|d|e|f)(@2x)?$', n)
    if m: return LIVE[m.group(1)]
    m = re.search(r'(B|C|D|E|F)(\d)?$', n)          # flyerB1, rollC ...
    if m and m.group(1).lower() in LIVE: return LIVE[m.group(1).lower()]
    return LIVE['']

today = datetime.date.today().isoformat()
tmp = OUT + '.tmp'
pngs = sorted(f for f in os.listdir(f'{PUB}/png') if f.lower().endswith('.png'))
with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    readme = f"""IAQ at SEMICON Europa 2026, the whole exhibition ({today})

codex/      The exhibition codex: one HTML file that opens offline in any browser, with the brief, every design direction
            to scale, all the print in every design, the surfaces measured, the print specification, the open questions.
print-pdf/  Every print file at 1:1 with bleed, by direction; the rejected directions under rejected/. The walls, counter
            and roll ups carry 10 mm bleed, the leaflets and trifolds 3 mm. Direction C is preferred.
png/        Every piece as a PNG for review and for sharing, by direction.

Personal contact details read "Contact details to follow from IAQ" until IAQ sends them.
Direction F's pictures are 3D renders (representations), not photographs.
Prepared by Brand Method for IAQ Group.
"""
    z.writestr(f'{ROOT}/README.txt', readme)
    z.write(CODEX, f'{ROOT}/codex/IAQ-SEMICON-Europa-2026-exhibition-codex.html')
    with zipfile.ZipFile(PRINT_ZIP) as pz:
        for info in pz.infolist():
            if info.is_dir() or info.filename.endswith('README.txt'): continue
            rel = info.filename.split('/', 1)[1] if '/' in info.filename else info.filename
            z.writestr(f'{ROOT}/print-pdf/{rel}', pz.read(info), compress_type=zipfile.ZIP_DEFLATED)
    for f in pngs:
        z.write(f'{PUB}/png/{f}', f'{ROOT}/png/{png_folder(f)}/{f}')
os.replace(tmp, OUT)
b = os.path.getsize(OUT)
with zipfile.ZipFile(OUT) as z: n = len([i for i in z.infolist() if not i.is_dir()])
ver = int(time.time())
data = {'date': today, 'href': f'/booth/{os.path.basename(OUT)}?v={ver}', 'name': f'{ROOT}-{today}.zip', 'bytes': b, 'files': n, 'pngs': len(pngs)}
open(DATA, 'w', encoding='utf-8').write('/* Written by tools/booth-everything-0930.py, do not edit: the whole exhibition in one ZIP, for the download buttons\n   on /portal/booth (components/booth/CodexDownload.jsx). Rerun after tools/booth-codex-0930.py. */\nexport const EVERYTHING = ' + json.dumps(data, indent=2) + '\n')
print(f'everything {OUT}: {round(b/1e6,1)} MB, {n} files ({len(pngs)} PNG), data {DATA}')
