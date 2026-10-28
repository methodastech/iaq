"""22 Oct 2026: a pinned 3D section leaves its scroll runway blank in a static capture (the home page's Scroll to build
is a 16,000 px runway under a 768 px stage). Runs of identical rows longer than MIN are cut to KEEP px so each
section shows once and the two builds compare at the same scale. Writes <slug>.<ext> in place (the original goes to
_removed/) and records the cut in the json. Usage: python3 tools/polish-collapse.py <outdir> <slug> [...]"""
import sys, os, json, shutil
from PIL import Image
out = sys.argv[1]; MIN, KEEP = 700, 160
for slug in sys.argv[2:]:
    j = f'{out}/{slug}.json'; meta = json.load(open(j)); ext = meta.get('ext', 'webp'); p = f'{out}/{slug}.{ext}'
    if meta.get('collapsed') is not None:
        print(slug, 'already collapsed'); continue
    im = Image.open(p).convert('RGB'); W, H = im.size
    # a row's signature: the row downscaled to 48 px, so a texture or faint gradient does not read as blank
    small = im.resize((48, H), Image.NEAREST); px = small.load()
    sig = [tuple(px[x, y] for x in range(48)) for y in range(H)]
    keep = []; y = 0; cut = 0; runs = []
    while y < H:
        y2 = y
        while y2 + 1 < H and sig[y2 + 1] == sig[y]:
            y2 += 1
        n = y2 - y + 1
        if n >= MIN:
            keep.append((y, y + KEEP)); cut += n - KEEP; runs.append((y, n))
        else:
            keep.append((y, y2 + 1))
        y = y2 + 1
    if not cut:
        print(slug, 'nothing to collapse'); meta['collapsed'] = 0; json.dump(meta, open(j, 'w'), indent=1); continue
    new = Image.new('RGB', (W, H - cut)); yy = 0
    for a, b in keep:
        new.paste(im.crop((0, a, W, b)), (0, yy)); yy += b - a
    bin_dir = f'{out}/_removed'; os.makedirs(bin_dir, exist_ok=True); shutil.move(p, f'{bin_dir}/{slug}.uncollapsed.{ext}')
    if ext == 'webp' and new.height > 16000:
        ext = 'jpg'; meta['ext'] = 'jpg'
    new.save(f'{out}/{slug}.{ext}', quality=80)
    meta['collapsed'] = cut; meta['heightShown'] = new.height; meta['runs'] = runs
    json.dump(meta, open(j, 'w'), indent=1); print(slug, 'cut', cut, 'px in', len(runs), 'runs ->', new.height)
