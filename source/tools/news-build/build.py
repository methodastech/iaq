"""Build the newsroom registry rows, bodies and WebP photographs.
python3 build.py            -> writes news.generated.js + review.txt, converts images, appends SOURCES.md
"""
import json, re, os, html, sys
from PIL import Image, ImageOps, features

import os
# 15 Sep: was the session scratchpad. Defaults to the project mirror; set NEWS_SP to override.
SP = os.environ.get('NEWS_SP', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '_reference', 'newsroom-scrape'))
PROJ = '/Users/zieel/Bazil Claude 3/Websites/iaq website'
OUTDIR = PROJ + '/public/assets/newsroom'
LEDGER = SP + '/news-bodies/created.json'
assert features.check('webp'), 'PIL has no WebP support'

posts = json.load(open(SP + '/news-bodies/posts.json'))
wp = json.load(open(SP + '/research/raw/wpposts_1.json'))
manifest = json.load(open(SP + '/research/images/manifest.json'))['images']
dlmap = json.load(open(SP + '/news-bodies/img-map.json'))


def norm(u):
    u = u.split('/uploads/')[-1]
    u = re.sub(r'-\d+x\d+(?=\.\w+$)', '', u)
    return u.replace('-scaled.', '.')


SRC = {}
for i in manifest:
    SRC[norm(i['image_url'])] = (SP + '/research/images/' + i['file'], i['image_url'])
for u, f in dlmap.items():
    SRC.setdefault(norm(u), (SP + '/news-bodies/' + f, u))

# not IAQ photographs: stock renders, wire or press shots, text graphics, an AI watermark
SKIP = {
    '2025/06/Testing.png': 'AI-generated watermark with a pasted logo',
    '2023/12/Untitled-design-2023-12-12T170012.194.png': 'stock photograph (solar farm)',
    '2024/01/CEO.png': 'stock New Year graphic', '2024/01/CEO-1.png': 'stock New Year graphic',
    '2025/06/2-mil.jpg': 'text poster naming the client',
    '2024/07/Data-Center-2.png': 'stock data centre render',
    '2024/06/Anwar-at-SEMICON.jpeg': 'press photograph of a third party event',
    '2024/06/Penang.webp': 'stock chip graphic',
    '2024/06/MITI.jpg': 'government press photograph',
    '2024/04/Data-center-linkedin.jpeg': 'stock skyline (freepik watermark)',
    '2024/04/Semiconductor-linkedin.jpeg': 'stock or wire photograph',
    '2024/03/Data-center.jpeg': 'stock circuit board',
    '2024/01/Morrow.jpeg': "Morrow's own press photograph", '2024/01/Morrow-1.jpeg': "Morrow's own press photograph",
    '2023/12/Untitled-design-2023-12-21T112343.981.png': 'stock data centre render',
    '2024/01/sweden.jpeg': 'stock EV charging photograph', '2024/01/sweden-1.jpeg': 'stock EV charging photograph',
    '2024/01/nvidia.jpg': 'press photograph of a third party visit', '2024/01/nvidia-1.jpg': 'press photograph of a third party visit',
}

# existing registry rows, keyed by URL
bak = open(PROJ + '/src/_backups/news-bodies-0915/src_data_news.js').read()
EXIST = {}
for m in re.finditer(r"\{ slug: '([^']+)', date: '([^']+)', tag: '([^']+)',\s*title: (['\"])(.+?)\4,\s*url: '([^']+)' \}", bak):
    EXIST[m.group(6)] = dict(slug=m.group(1), date=m.group(2), tag=m.group(3), title=m.group(5))
assert len(EXIST) == 20, len(EXIST)

NEW = {
 'celebrating-safety-milestones-in-east-malaysia': ('east-malaysia-2-million-safe-manhours', 'EHS'),
 'a-celebration-of-dedication-iaq-team-retreat-to-beijing': ('beijing-team-retreat-2024', 'Company'),
 'iaq-celebrates-team-excellence-behind-builder-of-the-year-win': ('builder-of-the-year-team-excellence', 'Company'),
 'iaq-named-builder-of-the-year-at-mciea-2024-setting-new-standards-in-high-tech-facility-construction': ('mciea-2024-setting-new-standards', 'Company'),
 'iaq-named-builder-of-the-year-at-mciea-2024': ('mciea-2024-builder-of-the-year', 'Company'),
 'iaq-joins-charity-luncheon-in-support-of-house-of-love': ('house-of-love-charity-luncheon-2024', 'CSR'),
 'house-of-love': ('house-of-love-chinese-new-year-giving', 'CSR'),
 'iaq-honoured-with-gold-award-for-osh-management-at-the-20th-osh-excellence-awards-2024': ('osh-excellence-awards-2024-gold', 'EHS'),
 'iaq-supports-kempen-tolak-gula-campaign-to-promote-workplace-health': ('kempen-tolak-gula-workplace-health', 'EHS'),
 'iaq-showcases-cleanroom-expertise-at-engineer-marvex-2024': ('engineer-marvex-2024-cleanroom', 'Industry'),
 'empowering-leadership-at-iaq-solutions-through-coaching': ('leader-as-a-coach-penang', 'Company'),
 'strengthening-team-bonds-beyond-the-workplace-at-iaq-solutions': ('safety-team-dinner-team-bonds', 'Company'),
 'iaq-celebrates-the-grand-opening-of-morrow-cell-factory-and-a-milestone-in-sustainable-energy-innovation': ('morrow-cell-factory-grand-opening', 'Industry'),
 'iaq-launches-osh-week-at-klm3-project-site-reinforcing-commitment-to-workplace-safety': ('klm3-osh-week-launch', 'EHS'),
 'honouring-dedication-mr-lim-kar-leang-celebrates-20-years-with-iaq-group': ('lim-kar-leang-20-years', 'Company'),
 'iaq-solutions-shines-at-penangs-cultural-night-run': ('penang-cultural-night-run-2024', 'Company'),
 'johor-emerges-as-the-next-data-centre-hub-iaq-solutions-at-the-forefront': ('johor-data-centre-hub', 'Industry'),
 'malaysias-tech-revolution-a-leap-forward-with-a-5-3-billion-semiconductor-strategy': ('national-semiconductor-strategy-2024', 'Industry'),
 'empowering-future-innovators-iaqs-contribution-to-the-asian-physics-olympiad-2024': ('asian-physics-olympiad-2024', 'CSR'),
 'nurturing-leadership-iaq-groups-commitment-to-employee-development-through-coaching-training-programs': ('coaching-training-programmes-2024', 'Company'),
 'fostering-future-leaders-iaq-group-joins-hands-with-matrade-paris-for-talent-development': ('matrade-paris-talent-development', 'Company'),
 'unity-in-celebration-iaq-family-marks-hari-raya-and-birthday-festivities': ('hari-raya-birthday-celebration-2024', 'Company'),
 'a-round-of-applause-for-our-east-malaysia-project-team': ('east-malaysia-1-million-safety-manhours', 'EHS'),
 'penangs-leap-forward-pioneering-the-future-of-the-global-semiconductor-industry': ('penang-semiconductor-leap-forward', 'Industry'),
 'celebrating-world-osh-day-with-iaq-safety-first': ('world-osh-day-2024', 'EHS'),
 'a-night-of-magic-and-merriment-iaqs-2024-annual-dinner': ('annual-dinner-2024', 'Company'),
 'empowering-the-future-malaysias-semiconductor-revolution-and-iaq-solutions-role-in-shaping-it': ('semiconductor-strategic-plan-miti', 'Industry'),
 'iaq-making-a-difference-in-the-holy-month-of-ramadan': ('ramadan-pakats-iftar-2024', 'CSR'),
 'iaq-continue-to-be-part-of-acc-second-production-block-of-gigafactory-in-billy-berclau-douvrin': ('acc-gigafactory-second-block', 'Industry'),
 'unlocking-malaysias-data-centre-potential-a-path-to-becoming-an-asian-digital-tiger': ('malaysia-data-centre-potential', 'Industry'),
 'honored-to-be-acknowledged-by-tengku-zafrul-aziz-for-our-commitment-to-x-fab': ('tengku-zafrul-acknowledgement', 'Company'),
 'iaq-partners-with-sjkc-choong-hua-elevating-student-learning-experience': ('sjkc-choong-hua-school-hall', 'CSR'),
 'malaysia-emerges-as-a-powerhouse-in-the-global-semiconductor-industry': ('malaysia-semiconductor-powerhouse', 'Industry'),
 'embracing-excellence-iaq-honors-womens-international-day': ('womens-international-day-2024', 'Company'),
 'empowering-tomorrows-engineers-reflecting-on-umengine-career-day': ('umengine-career-day-2024', 'Company'),
 'striking-a-balance-iaq-solutions-champions-work-life-harmony-through-football': ('football-work-life-balance', 'Company'),
 'iaq-welcomes-the-year-of-the-dragon-with-festive-cheer-and-excitement': ('year-of-the-dragon-2024', 'Company'),
 'iaq-office-visit-a-testament-to-innovation-and-collaboration': ('ormoy-france-office-visit', 'Company'),
 'malaysias-semiconductor-industry-riding-the-wave-of-global-demand': ('semiconductor-global-demand-2024', 'Industry'),
 'navigating-iaqs-evolution-a-journey-through-time': ('iaq-evolution-journey', 'Company'),
 'morrow-batteries-milestone-and-iaqs-role-in-advancing-sustainable-energy-solutions': ('morrow-batteries-dry-room-milestone', 'Industry'),
 'the-ai-revolution-in-data-centers-nvidia-foxconn-partnership-and-malaysias-ascent': ('ai-data-centres-nvidia-foxconn', 'Industry'),
 'northvolts-breakthrough-paving-the-way-for-sustainable-ev-solutions': ('northvolt-sodium-ion-breakthrough', 'Industry'),
 'malaysias-data-centre-boom-a-strategic-vision-for-technological-advancements': ('malaysia-data-centre-boom', 'Industry'),
 'reflecting-on-2023-a-message-from-iaq-group-ceo': ('ceo-message-2023', 'Company'),
 'factory-acceptance-test-fat': ('factory-acceptance-test-fat', 'Quality'),
 'celebrating-progress-clients-fab1e-building-opening-marks-a-milestone-in-innovation': ('fab1e-building-opening', 'Industry'),
 'iaqs-commitment-to-education-empowering-smjk-chung-hwa-confucian-with-a-generous-donation': ('smjk-chung-hwa-smart-tv-donation', 'CSR'),
 'western-discovery-trip-to-europe': ('western-discovery-trip-europe', 'Company'),
 'iaq-celebrates-community-and-philanthropy-at-malam-bakti-sekalung-kasih': ('malam-bakti-sekalung-kasih', 'CSR'),
}

# alt text: [lead, gallery...] in candidate order
ALT = {
 'house-of-love-chocolate-museum-day': ['IAQ team with children from House of Love outside Chocolate Museum Malaysia'],
 'osh-week-safety-pledge-signing': ['Aerial view of the site team in high visibility vests spelling OSH Week 2025 in front of the IAQ site office'],
 'penang-branch-office-opening': ['Ribbon cutting with lion dancers at the grand opening of the IAQ Penang branch office'],
 'prime-minister-business-roundtable-france': ['IAQ delegates at the meeting with the Captains of Industry in France', 'The roundtable in session in France'],
 'dosh-kuching-safety-benchmark-sarawak': ['Sarawak project team holding an IAQ banner marking their safe manhours milestone'],
 'university-malaya-engineering-insight': ['IAQ engineers with University of Malaya students in a lecture hall'],
 'ims-global-standards-commitment': ['IAQ team in a meeting room during the internal audit'],
 'annual-dinner-2025': ['IAQ staff group photograph at the Hawaiian Night Annual Dinner 2025'],
 'umengine-career-day-2025': ['IAQ team at its booth at UMENGINE Career Day 2025'],
 'eid-celebration-2025': ['IAQ staff in festive attire at the headquarters Jamuan Raya'],
 'pdk-kota-raja-community-visit': ['IAQ team with staff and children at PDK Kota Raja with the donated equipment'],
 'house-of-love-charity-luncheon': ['Guests on stage at the charity luncheon for House of Love', 'A second photograph of the guests on stage', 'Guests gathered on stage at the recognition and charity luncheon'],
 'celebrating-2-6-million-safe-manhours': ['Site team holding a banner marking 2.6 million safe manhours at the project site'],
 'cross-department-iftar-gathering': ['IAQ colleagues together at the cross department Iftar gathering'],
 'utar-engineering-science-fiesta-2025': ['IAQ representatives at their booth at UTAR Engineering Science and Fiesta 2025'],
 'safety-manhours-milestone-east-malaysia': ['Site team holding a banner marking 2.6 million safe manhours in East Malaysia'],
 'wafer-fab-facility-design-excellence': ['IAQ engineering team after the wafer fabrication training programme'],
 'chinese-new-year-community-2025': ['IAQ team with the children of House of Love for Chinese New Year'],
 'featured-in-the-star': ['IAQ delegation on stage at the MCIEA 2024 awards'],
 'beijing-team-retreat-2024': ['IAQ staff on the Great Wall of China with the company trip banner'],
 'builder-of-the-year-team-excellence': ['IAQ team in formal wear at the Builder of the Year celebration'],
 'mciea-2024-setting-new-standards': ['IAQ team on stage at MCIEA 2024'],
 'mciea-2024-builder-of-the-year': ['IAQ receiving Builder of the Year on stage at the Malaysian Construction Industry Excellence Awards 2024'],
 'house-of-love-charity-luncheon-2024': ['Guests on stage at the charity luncheon in support of House of Love'],
 'house-of-love-chinese-new-year-giving': ['IAQ team outside House of Love', 'IAQ team and the children with festive gifts', 'Handing out red packets to the children', 'A child receives a red packet'],
 'osh-excellence-awards-2024-gold': ['IAQ receiving the MOSHPA OSH Excellence Award 2024 Gold on stage'],
 'kempen-tolak-gula-workplace-health': ['IAQ staff at the Kempen Tolak Gula session'],
 'engineer-marvex-2024-cleanroom': ['Cleanroom solutions presentation at ENGINEER and MARVEX 2024'],
 'leader-as-a-coach-penang': ['Penang team at the Leader as a Coach training'],
 'safety-team-dinner-team-bonds': ['IAQ safety team at the team dinner'],
 'morrow-cell-factory-grand-opening': ['Ribbon cutting at the grand opening of the Morrow Cell Factory'],
 'klm3-osh-week-launch': ['Workers in hard hats at the OSH Week launch at the project site'],
 'lim-kar-leang-20-years': ['Long service award presentation for Mr. Lim Kar Leang at the Annual Dinner', 'The award presentation on stage, with his career milestones on screen'],
 'penang-cultural-night-run-2024': ['IAQ Penang team at the Cultural Night Run', 'IAQ runners at the Cultural Night Run'],
 'asian-physics-olympiad-2024': ['Opening stage of the Asian Physics Olympiad 2024 in Malaysia'],
 'coaching-training-programmes-2024': ['IAQ team members at the coaching training programme'],
 'matrade-paris-talent-development': ['IAQ Group representatives at MATRADE Paris'],
 'hari-raya-birthday-celebration-2024': ['IAQ family at the office Hari Raya and birthday celebration'],
 'east-malaysia-1-million-safety-manhours': ['East Malaysia project team in safety vests celebrating their safety manhours milestone'],
 'world-osh-day-2024': ['Project team under the World OSH Day 2024 banner'],
 'annual-dinner-2024': ['IAQ team in costume at the 2024 Annual Dinner'],
 'ramadan-pakats-iftar-2024': ['IAQ team with the children at PAKATS home for the Ramadan iftar'],
 'acc-gigafactory-second-block': ['Four representatives in front of the ACC logo'],
 'tengku-zafrul-acknowledgement': ['Handshake with Tengku Zafrul Aziz at the meeting'],
 'sjkc-choong-hua-school-hall': ['Presentation ceremony in the SJKC Choong Hua school hall'],
 'womens-international-day-2024': ['Women of IAQ at the headquarters celebration'],
 'umengine-career-day-2024': ['IAQ Solutions booth team with student organisers at UMEnGinE Career Day 2024'],
 'football-work-life-balance': ['IAQ football team on the pitch with IAQ flags', 'IAQ football team group photograph after the match'],
 'year-of-the-dragon-2024': ['IAQ staff with the lion dance at the headquarters Chinese New Year celebration'],
 'ormoy-france-office-visit': ['Visitors with the IAQ team at the office in Ormoy, France'],
 'iaq-evolution-journey': ['A cleanroom built by IAQ'],
 'fab1e-building-opening': ['IAQ team at the opening of the FAB1E building'],
 'smjk-chung-hwa-smart-tv-donation': ['Smart TV screen showing IAQ Solutions Sdn Bhd at SMJK Chung Hwa Confucian'],
 'western-discovery-trip-europe': ['IAQ staff with the Western Europe Discovery trip banner', 'IAQ staff with the trip banner in a European park'],
 'malam-bakti-sekalung-kasih': ['Guests on stage at Malam Bakti Sekalung Kasih in Penang'],
}

# paragraph level overrides: (slug, substring in paragraph, replacement or None to delete)
PARA = [
 ('featured-in-the-star', 'We invite you to read the article',
  'We invite you to read the article and join us in celebrating this incredible achievement:\n[The Star: Leading the Future in Hi-Tech Facility Solutions](https://www.thestar.com.my/starpicks/2024/12/24/leading-the-future-in-hi-tech-facility-solutions)'),
 ('mciea-2024-setting-new-standards', 'Read the full article on CIDB',
  'Read the full article on CIDB Malaysia:\n[Setting New Standards in Construction: Builder of the Year Award 2024](https://www.cidb.gov.my/setting-new-standards-in-construction-builder-of-the-year-award-2024/)'),
 ('annual-dinner-2025', 'Watch the official highlights video', None),
]

# dash contexts that read as a colon rather than a comma
COLON = [
 'heart of our company', 'safety achievement', 'IAQ —building', 'momentum going', 'our people—connected',
 'students who joined us', 'AI services', 'IAQ exceptional', 'our calendar', 'aspirations—they',
 'community members', 'meaningful act',
]
PRON = re.compile(r"^(they|they’re|they're|it|it’s|it's|we|we’re|this is|that is)\b", re.I)

EMOJI = re.compile('[\U0001F000-\U0001FFFF☀-➿️‍]|\\?{2,}')
log = []


def fix_text(s, slug):
    s = EMOJI.sub('', s)
    s = s.replace(' ', ' ')
    # separator dashes
    pat = re.compile(r'[ \t]*[—–][ \t]*|[ \t]+-[ \t]+')

    def rep(m):
        before, after = s[:m.start()], s[m.end():]
        ctx = s[max(0, m.start() - 30):m.end() + 30]
        if not after.strip() or after[:1] in ',.;:)':
            out = ''
        elif before.rstrip()[-1:] in ',:;':
            out = ' '
        elif any(c in ctx for c in COLON) or PRON.match(after):
            out = ': '
        else:
            out = ', '
        log.append(f'DASH {slug}: …{ctx.strip()}…  =>  {out.strip() or "(dropped)"}')
        return out
    s = pat.sub(rep, s)
    # exclamation marks
    if '!' in s:
        log.append(f'EXCL {slug}: {s[:0]}' + ' | '.join(re.findall(r'[^.!?]{0,50}!', s)))
        s = re.sub(r'!+', '.', s)
    s = re.sub(r'US\$(\d[\d.]*)(Billion|billion)', r'US$\1 \2', s)
    s = re.sub(r'[ \t]+', ' ', s)
    s = re.sub(r' +([,.;:])', r'\1', s)
    s = re.sub(r'\.\.+', '.', s)
    s = re.sub(r' *\n *', '\n', s)
    return s.strip()


def key(t):
    t = t.lower().replace('’', "'").replace('solutions', '')
    return re.sub(r'[^a-z0-9]', '', t)


def ahash(p):
    im = Image.open(p).convert('L').resize((16, 16))
    px = list(im.getdata()); m = sum(px) / len(px)
    return [v > m for v in px]


created = set(json.load(open(LEDGER))) if os.path.exists(LEDGER) else set()
os.makedirs(OUTDIR, exist_ok=True)
sources_lines = []
rows = []
noimg = []
counts = {'posts': 0, 'imgs': 0}

for p in wp:
    link = p['link']
    wslug = link.rstrip('/').split('/')[-1]
    rec = posts[wslug]
    wtitle = html.unescape(p['title']['rendered']).strip()
    if link in EXIST:
        e = EXIST[link]; slug, tag, title = e['slug'], e['tag'], e['title']
        assert e['date'] == p['date'][:10], (slug, e['date'], p['date'])
    else:
        slug, tag = NEW[wslug]
        title = wtitle.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
        if '!' in title:
            log.append(f'TITLE! {slug}: {title}')
            title = title.replace('!', '').strip()
    date = p['date'][:10]

    # ---- body
    blocks = []
    for b in rec['blocks']:
        if b['t'] == 'p':
            txt = b['text']
            parts = [x for x in re.split(r'\n\s*\n', txt) if x.strip()]
            for part in parts:
                blocks.append(('p', part, b.get('strong', False)))
        elif b['t'] == 'h':
            blocks.append(('h', b['text'], False))
        elif b['t'] in ('ul', 'ol'):
            blocks.append(('ul', b['items'], False))
    out = []
    for i, (t, v, strong) in enumerate(blocks):
        if t == 'ul':
            items = []
            for it in v:
                it = fix_text(it, slug)
                lines = [l for l in it.split('\n') if l.strip()]
                items.append('* ' + '\n'.join(lines))
            out.append('\n'.join(items))
            continue
        raw = v
        hit = next((r for r in PARA if r[0] == slug and r[1] in EMOJI.sub('', raw)), None)
        if hit:
            log.append(f'PARA {slug}: {"deleted" if hit[2] is None else "replaced"}: {raw[:80]}')
            if hit[2] is None:
                continue
            out.append(hit[2]); continue
        if t == 'p' and key(EMOJI.sub('', raw)) in (key(wtitle), key(title)):
            log.append(f'DUPHEAD {slug}: removed in-body repeat of the headline: {raw[:80]}')
            continue
        txt = fix_text(raw, slug)
        if not txt:
            continue
        if t == 'h' or (strong and i == 0 and len(txt) < 90 and txt[-1:] not in '.”"?'):
            out.append('## ' + txt)
        else:
            out.append(txt)
    body = '\n\n'.join(out)

    # ---- photographs
    cands = []
    urls = [rec['og_image']] if rec['og_image'] else []
    for b in rec['blocks']:
        if b['t'] == 'img': urls.append(b['src'])
        if b['t'] == 'gallery': urls += [x['src'] for x in b['items']]
    seen = set(); hashes = []
    for u in urls:
        n = norm(u)
        if n in seen: continue
        seen.add(n)
        if n in SKIP:
            log.append(f'SKIPIMG {slug}: {n} ({SKIP[n]})'); continue
        if n not in SRC:
            log.append(f'MISSINGIMG {slug}: {n}'); continue
        f, src_url = SRC[n]
        h = ahash(f)
        if any(sum(a != c for a, c in zip(h, hh)) <= 20 for hh in hashes):
            log.append(f'DUPIMG {slug}: {n}'); continue
        hashes.append(h); cands.append((f, src_url))
    alts = ALT.get(slug, [])
    if cands and len(alts) != len(cands):
        log.append(f'ALTCOUNT {slug}: {len(cands)} images, {len(alts)} alts')
    pics = []
    for k, (f, src_url) in enumerate(cands):
        name = f'{slug}.webp' if k == 0 else f'{slug}-{k + 1}.webp'
        dest = OUTDIR + '/' + name
        if os.path.exists(dest) and name not in created:
            alt_name = name.replace('.webp', '-photo.webp')
            log.append(f'EXISTS-NOT-MINE {name}: left untouched, writing {alt_name} instead')
            name, dest = alt_name, OUTDIR + '/' + alt_name
            if os.path.exists(dest) and name not in created:
                log.append(f'EXISTS-NOT-MINE {name}: left untouched, no image'); continue
        im = ImageOps.exif_transpose(Image.open(f))
        if im.mode in ('RGBA', 'LA', 'P'):
            im = im.convert('RGBA'); bg = Image.new('RGB', im.size, 'white'); bg.paste(im, mask=im.split()[-1]); im = bg
        else:
            im = im.convert('RGB')
        if im.width > 1600:
            im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
        im.save(dest, 'WEBP', quality=80, method=6)
        created.add(name); counts['imgs'] += 1
        pics.append(dict(src='/assets/newsroom/' + name, w=im.width, h=im.height, alt=alts[k] if k < len(alts) else ''))
        sources_lines.append(f'| {name} | {src_url} | {html.unescape(p["title"]["rendered"]).strip()} | {link} |')
    if not pics:
        noimg.append(slug)

    rows.append(dict(slug=slug, date=date, tag=tag, title=title, url=link, pics=pics, body=body))
    counts['posts'] += 1

json.dump(sorted(created), open(LEDGER, 'w'), indent=1)

# ---- SOURCES.md (append only)
sp = OUTDIR + '/SOURCES.md'
MARK = '<!-- appended 15 Sep 2026, newsroom bodies pass -->'
existing = open(sp).read() if os.path.exists(sp) else ''
add = [l for l in sources_lines if ('| ' + l.split('|')[1].strip() + ' |') not in existing]
if add:
    with open(sp, 'a') as fh:
        if not existing:
            fh.write('# Newsroom photographs\n\n' + MARK + '\n| File | Source image | Post title | Post |\n|---|---|---|---|\n')
        else:
            tail_is_mine = MARK in existing and existing.rfind(MARK) > existing.rfind('\n#') and existing.rstrip().endswith('|')
            if not existing.endswith('\n'):
                fh.write('\n')
            if not tail_is_mine:
                fh.write('\n## Article photographs, newsroom bodies pass (15 Sep 2026)\n\nConverted to WebP, quality 80, at most 1600 px wide, for the article pages and news cards (src/data/news.js). One row per file: the file, the source image as IAQ published it, the post title and the post.\n\n' + MARK + '\n| File | Source image | Post title | Post |\n|---|---|---|---|\n')
        fh.write('\n'.join(add) + '\n')
log.append(f'SOURCES appended {len(add)} rows')

# ---- JS rows
J = lambda s: json.dumps(s, ensure_ascii=False)
lines = []
for r in rows:
    s = f"  {{ slug: '{r['slug']}', date: '{r['date']}', tag: '{r['tag']}',\n    title: {J(r['title'])},\n    url: '{r['url']}',\n"
    if r['pics']:
        L = r['pics'][0]
        s += f"    img: '{L['src']}', imgW: {L['w']}, imgH: {L['h']}, imgAlt: {J(L['alt'])},\n"
        if len(r['pics']) > 1:
            s += '    gallery: [\n' + ''.join(f"      {{ src: '{g['src']}', w: {g['w']}, h: {g['h']}, alt: {J(g['alt'])} }},\n" for g in r['pics'][1:]) + '    ],\n'
    s += f"    body: {J(r['body'])} }},"
    lines.append(s)
open(SP + '/news-bodies/news.generated.js', 'w').write('\n'.join(lines) + '\n')

# ---- src/data/news.js
reasons = {}
for r in rows:
    if not r['pics']:
        why = sorted({l.split('(', 1)[1][:-1] for l in log if l.startswith('SKIPIMG ' + r['slug'] + ':')})
        reasons[r['slug']] = '; '.join(why) or 'no photograph in the post'
n_new = sum(1 for p in wp if p['link'] not in EXIST)
HEADER = f"""/* ============ newsroom registry ============
   Every row is a post from IAQ's own newsroom on iaqtechnology.com.my. The site's post index
   (wp-json/wp/v2/posts, read 15 Sep 2026) lists {len(rows)} posts, and all {len(rows)} are here.

   15 SEP 2026, BODIES AND PHOTOGRAPHS. Until today this file held 20 headline-only rows and the
   article page showed a note instead of prose. Each of those 20 now carries its body and
   photographs, and the {n_new} posts that were live on the old site but missing here were added
   with their exact title, date, body and photographs. Titles, dates and bodies were read from
   each post's own page; `url` is that page.

   WORDING. IAQ's copy is kept. The only edits:
   · site furniture removed: an in-body repeat of the headline (three posts), and on the
     Annual Dinner 2025 post a line pointing to a highlights video the post no longer embeds
   · emoji removed (the saved pages had already reduced most of them to question marks)
   · obvious spacing fixed, and a paragraph break restored where the post used two line breaks
   · a dash used as a separator replaced with a comma or a colon; hyphenated words are kept
   · exclamation marks replaced with a full stop, and dropped from the end of titles, per the
     newsroom house rule the portal states (the first title treated this way was "Celebrating
     2.6 million Safe Manhours"; three more titles now follow it)
   Typos in the originals are left as published. Two posts link out to the article they cite
   (The Star, CIDB Malaysia); those links are kept inline.

   BODY FORMAT, read by pages/Article.jsx and editable in the portal textarea:
     a blank line          starts a new paragraph
     ## Heading            a subheading
     * item                a list item; a following line without "* " continues that item
     [label](https://...)  an inline link
   A single line break inside a paragraph is kept as a line break.

   PHOTOGRAPHS. `img` is the post's featured photograph and `gallery` the post's other
   photographs, converted to WebP in public/assets/newsroom/ (file, source image and post are
   listed in SOURCES.md there). `imgW` and `imgH` let the page reserve the space. A post whose
   only images are stock, wire or press photographs, a text poster or an AI-watermarked edit has
   no `img` and falls back to the interim pool in data/newsArt.js:
""" + ''.join(f"     {s}: {reasons[s]}\n" for s in reasons) + """
   TAGS. `tag` is Brand Method's editorial classification against the five newsroom tags:
   Industry covers market insight, project milestones in client industries and work with
   universities; Company covers people, culture, awards and offices. IAQ confirms.

   CLIENT NAMES. Several posts name clients or partners (Robert Bosch, M.E.I, X-FAB, Morrow, ACC,
   Intel, NVIDIA, Foxconn, Northvolt). They are IAQ's own public posts and are kept as published;
   the portal's house rule on client names needs IAQ's decision for these stories. */
"""
helpers = bak[bak.index('export const bySlug'):]
open(PROJ + '/src/data/news.js', 'w').write(
    HEADER + "\nexport const TAGS = ['CSR', 'EHS', 'Quality', 'Company', 'Industry']\n\nexport const NEWS = [\n"
    + '\n'.join(lines) + '\n]\n\n' + helpers)
json.dump(dict(noimg=noimg, counts=counts, skipped={s: SKIP[s] for s in SKIP}), open(SP + '/news-bodies/build-meta.json', 'w'), indent=1)
open(SP + '/news-bodies/review.txt', 'w').write('\n'.join(log) + '\n')
print(counts, 'no image:', len(noimg), noimg)
print('log lines', len(log))
