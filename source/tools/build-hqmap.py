#!/usr/bin/env python3
"""HQ district for the Contact page map (22 Sep 2026).

Bazil: "this map suck put their actual map", then three white-clay isometric references: "to this
detail take all the details and make it awesome zoom in".

Source: OpenStreetMap, Overpass dump of everything within 560 m of IAQ's headquarters
(tools/data/hq-osm-0922.json, fetched 22 Sep 2026). ODbL: the page credits OpenStreetMap contributors.
The pin is Google Maps' own pin for "IAQ Technology International Sdn. Bhd." (2.9911454, 101.518056).

Output: public/assets/iaq/hq-district.json, metres east and north of the pin, 0.1 m precision.
  b   buildings   [height, [e,n, e,n, ...]]
  hq  index into b of IAQ's building: the footprint nearest the pin (23 m). INFERENCE, not a tag:
      OSM does not name the occupier.
  r   roads       [class, [e,n, ...]]   class: 0 motorway 1 tertiary 2 street 3 service 4 path
  w   water polygons, g green polygons, l landuse plates, d drains (polylines)
  t   trees       [e,n,size]  DECORATIVE: OSM maps no trees here. Planted on road verges and in the
      mapped parks, never inside a footprint or a carriageway.
Heights are ESTIMATED from footprint area (OSM carries a height on 3 of 772 buildings).

Refetch: see the Overpass query at the bottom of this file.
"""
import json, math, os, random
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'data', 'hq-osm-0922.json')
OUT = os.path.join(HERE, '..', 'public', 'assets', 'iaq', 'hq-district.json')
LAT, LON = 2.9911454, 101.518056
HQ_WAY = 1123052436
# IAQ's own street. OSM tags it highway=service with no name; the address and Google's pin put
# Jalan Sungai Jeluh 32/192 on this way, so it is drawn as a street and labelled (inference).
HQ_STREET = 399204508
KX = 111320 * math.cos(math.radians(LAT)); KY = 110574

def xy(p): return ((p['lon'] - LON) * KX, (p['lat'] - LAT) * KY)
def area(r): return sum(a[0]*b[1] - b[0]*a[1] for a, b in zip(r, r[1:] + r[:1])) / 2
def flat(r): return [round(v, 1) for p in r for v in p]
def inside(pt, r):
    x, y = pt; c = False
    for (x1, y1), (x2, y2) in zip(r, r[1:] + r[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
    return c
def seg_d(p, a, b):
    ax, ay = a; bx, by = b; px, py = p; dx, dy = bx-ax, by-ay; L = dx*dx + dy*dy
    t = 0 if L == 0 else max(0, min(1, ((px-ax)*dx + (py-ay)*dy) / L))
    return math.hypot(px - ax - t*dx, py - ay - t*dy)

d = json.load(open(SRC))
B, R, W, G, L, D = [], [], [], [], [], []
hq = -1
CLASS = {'motorway': 0, 'motorway_link': 0, 'trunk': 0, 'primary': 1, 'secondary': 1, 'tertiary': 1,
         'residential': 2, 'unclassified': 2, 'service': 3}
WIDTH = [11, 9, 7, 4, 2]
for e in d['elements']:
    t = e.get('tags', {}); g = e.get('geometry')
    if not g: continue
    pts = [xy(p) for p in g]
    closed = len(pts) > 3 and pts[0] == pts[-1]
    if 'building' in t and closed:
        ring = pts[:-1]
        if area(ring) < 0: ring.reverse()
        a = area(ring)
        if a < 12: continue
        rnd = random.Random(e['id'])
        if 'height' in t:
            try: h = float(str(t['height']).split()[0])
            except ValueError: h = 8
        elif 'building:levels' in t:
            try: h = float(t['building:levels']) * 3.4 + 1
            except ValueError: h = 8
        else:
            h = 3.2 if a < 45 else 6.6 if a < 420 else 9.5 if a < 2000 else 12 if a < 8000 else 15
            h *= 0.9 + rnd.random() * 0.22
        if e['id'] == HQ_WAY: hq = len(B); h = 11
        B.append([round(h, 1), flat(ring)])
    elif 'highway' in t:
        R.append([2 if e['id'] == HQ_STREET else CLASS.get(t['highway'], 4), flat(pts)])
    elif t.get('natural') == 'water' and closed: W.append(flat(pts[:-1]))
    elif (t.get('leisure') or t.get('landuse') in ('recreation_ground',) or t.get('natural') == 'heath') and closed: G.append(flat(pts[:-1]))
    elif t.get('landuse') in ('industrial', 'residential', 'commercial') and closed: L.append(flat(pts[:-1]))
    elif 'waterway' in t: D.append(flat(pts))
assert hq >= 0, 'HQ way missing'

# ---- trees: verges of streets and tertiary roads, plus the mapped parks ----
def ring_of(f): return list(zip(f[0::2], f[1::2]))
brings = [ring_of(b[1]) for b in B]
bbox = [(min(x for x, _ in r) - 3, min(y for _, y in r) - 3, max(x for x, _ in r) + 3, max(y for _, y in r) + 3) for r in brings]
rsegs = []
for c, f in R:
    p = ring_of(f)
    for a, b in zip(p, p[1:]): rsegs.append((a, b, WIDTH[c] / 2))
wrings = [ring_of(w) for w in W]
def clear(p):
    if math.hypot(*p) > 600: return False
    for r, bb in zip(brings, bbox):
        if bb[0] <= p[0] <= bb[2] and bb[1] <= p[1] <= bb[3]:
            if inside(p, r) or min(seg_d(p, a, b) for a, b in zip(r, r[1:] + r[:1])) < 2.5: return False
    for a, b, hw in rsegs:
        if abs(p[0] - a[0]) > 60 and abs(p[0] - b[0]) > 60: continue
        if seg_d(p, a, b) < hw + 1.6: return False
    return not any(inside(p, r) for r in wrings)
rnd = random.Random(922)
T = []
for c, f in R:
    if c not in (1, 2): continue
    p = ring_of(f); off = WIDTH[c] / 2 + 3.2; carry = rnd.random() * 14
    for a, b in zip(p, p[1:]):
        dx, dy = b[0]-a[0], b[1]-a[1]; n = math.hypot(dx, dy)
        if n < 1: continue
        ux, uy = dx/n, dy/n; s = carry
        while s < n:
            for side in (1, -1):
                q = (a[0] + ux*s - uy*off*side + rnd.uniform(-.8, .8), a[1] + uy*s + ux*off*side + rnd.uniform(-.8, .8))
                if clear(q): T.append([round(q[0], 1), round(q[1], 1), round(rnd.uniform(.8, 1.25), 2)])
            s += rnd.uniform(15, 21)
        carry = s - n
for f in G:
    r = ring_of(f); xs = [x for x, _ in r]; ys = [y for _, y in r]
    for _ in range(int(min(60, abs(area(r)) / 160))):
        q = (rnd.uniform(min(xs), max(xs)), rnd.uniform(min(ys), max(ys)))
        if inside(q, r) and clear(q): T.append([round(q[0], 1), round(q[1], 1), round(rnd.uniform(.9, 1.5), 2)])
# thin out trees that stand on one another
T.sort(); keep = []
for t in T:
    if all(math.hypot(t[0]-k[0], t[1]-k[1]) > 6 for k in keep[-40:]): keep.append(t)
T = keep

# label anchors, metres from the pin, chosen so all four read at the opening view without touching
LABELS = [['Jalan Sungai Jeluh 32/192', '', -12, -44, 620], ['Lebuhraya Shah Alam', 'E5', -50, 105, 1150],
          ['Jalan Bukit Rimau', '', 124, 14, 900], ['Jalan Sungai Rincing', '', 330, -21, 900]]
out = {'labels': LABELS, 'src': 'OpenStreetMap contributors, ODbL. Fetched 22 Sep 2026.', 'pin': [LAT, LON], 'hq': hq,
       'b': B, 'r': R, 'w': W, 'g': G, 'l': L, 'd': D, 't': T}
json.dump(out, open(OUT, 'w'), separators=(',', ':'))
print('buildings', len(B), 'hq index', hq, 'roads', len(R), 'water', len(W), 'green', len(G), 'landuse', len(L), 'drains', len(D), 'trees', len(T))
print(round(os.path.getsize(OUT) / 1024), 'KB')

# Overpass query used:
# [out:json][timeout:90];(way["building"](around:520,2.9911454,101.518056);way["highway"](around:560,...);
#  way["waterway"](around:560,...);way["natural"](around:560,...);way["landuse"](around:560,...);
#  way["leisure"](around:560,...);relation["building"](around:520,...););out geom;
