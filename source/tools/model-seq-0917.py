#!/usr/bin/env python3
"""
model-seq-0917.py · 17 Sep 2026

IAQ's own 3D coordination model, rendered as a frame sequence of the facility building up
(SharePoint share, "3D Modelling Photos/Final/sequence/", 116 PNG frames at 3840x2160). The
unit pages scrub through it on scroll (src/components/UnitBuild.jsx). This script picks 60
evenly spaced frames, resizes them (1400px wide as shipped) and writes them as WebP into
public/assets/iaq/model-seq/ as 00.webp .. 59.webp, plus final.webp (the last frame, used as
the still under reduced motion and without a canvas).

Frame order in the share: 1.png .. 55.png, then "56 (2).png" .. "56 (61).png", then 57.png,
which is the wide view of the whole facility that closes the sequence. The union bounding box
of drawn pixels over all 116 frames spans the whole canvas (the camera pushes in to the right
edge before pulling back), so no constant crop is applied.

Pillow only, no ffmpeg. Usage: python3 tools/model-seq-0917.py [quality] [width] [out dir]
Trials on 17 Sep: q74 at 1600px came to 5.7MB (the service-dense frames run past 200KB); q60 at
1600px 5.0MB, q48 at 1600px 4.5MB, q58 at 1440px 4.1MB. Shipped: q60 at 1400px, 4.03MB, which
is drawn at no more than ~1390 CSS px on a 1440 desktop and looked the same as 1600px in a 1:1
crop of the densest frame. Run: python3 tools/model-seq-0917.py 60 1400
"""
import os, sys, time
from PIL import Image

SRC = '/Users/zieel/Bazil Claude 3/Client info/IAQ/SharePoint 2027 (17 Sep)/3D Modelling Photos/Final/sequence/'
N = 60
Q = int(sys.argv[1]) if len(sys.argv) > 1 else 74
W = int(sys.argv[2]) if len(sys.argv) > 2 else 1600
OUT = sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'assets', 'iaq', 'model-seq')

names = [f'{i}.png' for i in range(1, 56)] + [f'56 ({i}).png' for i in range(2, 62)] + ['57.png']
missing = [n for n in names if not os.path.exists(SRC + n)]
assert not missing, missing
total = len(names)
picks = [round(i * (total - 1) / (N - 1)) for i in range(N)]
assert picks[0] == 0 and picks[-1] == total - 1 and len(set(picks)) == N

os.makedirs(OUT, exist_ok=True)
t0 = time.time()
sizes = []
for k, src_i in enumerate(picks):
    im = Image.open(SRC + names[src_i]).convert('RGB')
    h = round(im.height * W / im.width)
    im = im.resize((W, h), Image.LANCZOS)
    path = os.path.join(OUT, f'{k:02d}.webp')
    im.save(path, 'WEBP', quality=Q, method=6)
    sizes.append(os.path.getsize(path))
    if k == N - 1:
        im.save(os.path.join(OUT, 'final.webp'), 'WEBP', quality=Q, method=6)
    print(f'{k:02d} <- {names[src_i]:12s} {sizes[-1] // 1024:4d} KB', flush=True)

tot = sum(sizes)
print(f'{N} frames, {W}px wide, q{Q}: total {tot / 1024 / 1024:.2f} MB, '
      f'min {min(sizes) // 1024} KB, max {max(sizes) // 1024} KB, mean {tot // N // 1024} KB, {time.time() - t0:.0f}s')
