"""22 Oct 2026: stitch the clipped passes of a tall capture (tools/polish-shots.mjs saves <slug>.part<N>.png when a
page is taller than Chrome's 16,384 px capture limit) into one JPEG; the parts then go to _removed/.
Usage: python3 tools/polish-stitch.py <outdir> <slug>"""
import sys, os, glob, shutil
from PIL import Image
out, slug = sys.argv[1], sys.argv[2]
parts = sorted(glob.glob(f'{out}/{slug}.part*.png'), key=lambda f: int(f.rsplit('.part', 1)[1].split('.')[0]))
ims = [Image.open(p).convert('RGB') for p in parts]
W = ims[0].width; H = sum(i.height for i in ims)
sheet = Image.new('RGB', (W, H)); y = 0
for i in ims:
    sheet.paste(i, (0, y)); y += i.height
sheet.save(f'{out}/{slug}.jpg', quality=80)
bin_dir = f'{out}/_removed'; os.makedirs(bin_dir, exist_ok=True)
for p in parts:
    shutil.move(p, f'{bin_dir}/{os.path.basename(p)}')
print('stitched', slug, len(parts), 'parts ->', (W, H))
