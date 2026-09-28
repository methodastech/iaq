import glob, os, re, sys, time
import numpy as np
from PIL import Image
SRC = sys.argv[1]; OUT = sys.argv[2]
# frames 1..55 and 57 are clean; 56 only exists as the hold duplicates "56 (N).png"
paths = {}
for p in glob.glob(os.path.join(SRC, '*.png')):
    b = os.path.basename(p)
    m = re.fullmatch(r'(\d+)\.png', b) or re.fullmatch(r'(\d+) \(\d+\)\.png', b)
    if m:
        n = int(m.group(1)); paths.setdefault(n, p)
order = sorted(paths)
print('frames:', len(order), order[0], '->', order[-1], flush=True)
SIZES = [('d', 1600), ('m', 1100)]
t0 = time.time(); tot = {k: 0 for k, _ in SIZES}
for i, n in enumerate(order):
    im = np.asarray(Image.open(paths[n]).convert('RGB')).astype(np.int16)
    mn = im.min(axis=2)
    # pure-white background -> alpha 0; ramp to opaque by 232 so anti-aliased edges keep their blend
    a = np.clip((252 - mn) * (255 / 20), 0, 255).astype(np.uint8)
    rgba = np.dstack([im.astype(np.uint8), a])
    src = Image.fromarray(rgba, 'RGBA')
    for tag, w in SIZES:
        h = round(w * 9 / 16)
        r = src.resize((w, h), Image.LANCZOS)
        fn = os.path.join(OUT, f'{tag}-{i+1:02d}.webp')
        r.save(fn, 'WEBP', quality=82, method=4)
        tot[tag] += os.path.getsize(fn)
    if (i + 1) % 8 == 0 or i == len(order) - 1:
        print(f'  {i+1}/{len(order)}  {time.time()-t0:.0f}s  desktop {tot["d"]//1024}KB  mobile {tot["m"]//1024}KB', flush=True)
print('DONE', {k: f'{v/1048576:.1f}MB' for k, v in tot.items()}, flush=True)
