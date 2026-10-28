"""22 Oct 2026 (Bazil: "add another tab just like what you have with website LX, just the flow", "website flow and journey"):
the Web flow board, public/webflow.html, built on the Leadersclass flow board (leadersclass website/webflow.html): every
page a numbered picture, every click a labelled line, the live page beside it in a phone or desktop frame. The site posts
its route to the board on every change (main.jsx FramePing), so the board follows clicks inside the device.
Usage: python3 tools/webflow-build.py"""
import re, json, os
T = open('/Users/zieel/Bazil Claude 3/Websites/leadersclass website/webflow.html', encoding='utf-8').read()
bar = re.search(r'<div class="bmws"[\s\S]*?</div></div>\n', open('public/checklist.html', encoding='utf-8').read()).group(0)
bar = bar.replace(' class="on"', '').replace('<a href="/webflow.html"><i>12</i>Web flow</a>', '<a href="/webflow.html" class="on"><i>12</i>Web flow</a>')
# the icons the template ships, reused by key
icons = re.search(r'ICONS=(\{.*?\})(?=[;,]\s*(?:[A-Z]+=|\n))', T, re.S)
ICONS = icons.group(1) if icons else '{}'
keys = re.findall(r'(\w+):\s*\'<', ICONS)
pick = lambda *c: next((k for k in c if k in keys), keys[0] if keys else 'home')
LANES = [
  ['land', 'Land', 'Where every visitor starts', pick('home'), '#EC2027'],
  ['learn', 'Who IAQ is', 'About, the record, the commitment', pick('cap', 'story', 'back'), '#EC2027'],
  ['buy', 'What IAQ sells', 'The services and the three units', pick('tool', 'hand'), '#EC2027'],
  ['prove', 'The proof', 'Markets, projects, news', pick('back', 'story', 'keep'), '#0C1220'],
  ['act', 'Act', 'Contact, the brief, careers', pick('hand', 'ask'), '#0C1220'],
  ['member', 'Members', 'Sign in, the portal, the Codex', pick('keep', 'ask'), '#0B8FD8'],
  ['booth', 'Exhibition', 'SEMICON Europa 2026', pick('ask', 'off'), '#0B8FD8'],
]
# id, name, desc, lane, col, row, shown url, route, picture
def top(slug): return f'polish/new/{slug}-top.webp' if os.path.exists(f'public/polish/new/{slug}-top.webp') else None
NODES = [
  ['home', 'Home', 'The hero on IAQ’s own film, the record and the world, the delivery cycle, the Scroll to build 3D, the seven markets.', 'land', 0, 0, 'iaqgroup.com/', '/', top('home')],
  ['about', 'About IAQ', 'Who IAQ is since 1995: the story, vision and mission, six values, the certificates.', 'learn', 1, 0, 'iaqgroup.com/about', '/about', top('about')],
  ['history', 'History', 'Thirty-one years as a timeline with a time axis, IAQ’s 21 milestones.', 'learn', 2, 0, 'iaqgroup.com/about/history', '/about/history', top('about-history')],
  ['commitment', 'Corporate Commitment', 'The three pillars, the QEHS policies as PDFs, the CSR stories.', 'learn', 3, 0, 'iaqgroup.com/about/commitment', '/about/commitment', top('about-commitment')],
  ['global', 'Global presence', 'Seven countries on a flat map, the delivered-in countries, the registry by country.', 'learn', 4, 0, 'iaqgroup.com/global-presence', '/global-presence', top('global-presence')],
  ['services', 'Services', 'The facility map in 3D, the three business units, the units-by-services matrix, three choices, the FAQ.', 'buy', 1, 1, 'iaqgroup.com/services', '/services', top('services')],
  ['six', 'Six services, one page', 'The six stages in order, each with its photograph and the house line.', 'buy', 2, 1, 'iaqgroup.com/services/all', '/services/all', top('services-all')],
  ['epc', 'EPC', 'Engineering, Procurement & Construction: the unit page from IAQ’s sheet.', 'buy', 3, 1, 'iaqgroup.com/services/epc-construction', '/services/epc-construction', top('services-epc-construction')],
  ['tti', 'PCU & TTI', 'Process Critical Utilities & Total Tool Installation: what is delivered, the four stages, the statement.', 'buy', 4, 1, 'iaqgroup.com/services/tool-installation', '/services/tool-installation', top('services-tool-installation')],
  ['efm', 'Energy Management', 'The five solutions, Energy as a Service, the industries, the district cooling 3D.', 'buy', 5, 1, 'iaqgroup.com/services/energy-management', '/services/energy-management', top('services-energy-management')],
  ['markets', 'Markets', 'Seven markets as equal picture tiles, one project from each.', 'prove', 1, 2, 'iaqgroup.com/markets', '/markets', top('markets')],
  ['market', 'A market page', 'Semiconductor, the pattern of all seven: overview, capabilities, the projects delivered.', 'prove', 2, 2, 'iaqgroup.com/markets/semiconductor', '/markets/semiconductor', top('markets-semiconductor')],
  ['projects', 'Project registry', 'Every published project with its tags; filter by market, location, model and class.', 'prove', 3, 2, 'iaqgroup.com/projects', '/projects', top('projects')],
  ['project', 'A project page', 'The brief, the scope, the story, the six stages, class and contract, related projects.', 'prove', 4, 2, 'iaqgroup.com/projects/0', '/projects/0', top('projects-0')],
  ['news', 'Newsroom', 'The latest story, the featured four, the list.', 'prove', 5, 2, 'iaqgroup.com/news', '/news', top('news')],
  ['article', 'A story', 'IAQ’s own text and photograph, previous and next, more of the work.', 'prove', 6, 2, 'iaqgroup.com/news/…', '/news/pdk-kota-raja-community-visit', top('news-pdk-kota-raja-community-visit')],
  ['contact', 'Contact', 'The three-step brief, the direct contacts, the head office map, the seven offices.', 'act', 1, 3, 'iaqgroup.com/contact', '/contact', top('contact')],
  ['enquiry', 'Enquiry', 'The lead form on its own page: Contact, Project, what happens next.', 'act', 2, 3, 'iaqgroup.com/enquiry', '/enquiry', top('enquiry')],
  ['careers', 'Careers', 'Culture on top, the six values, the safety record, the open roles with their filters.', 'act', 3, 3, 'iaqgroup.com/careers', '/careers', top('careers')],
  ['policies', 'Policies', 'Six documents in one place, each at its own address.', 'act', 4, 3, 'iaqgroup.com/policies', '/policies', top('policies')],
  ['signin', 'Sign in', 'The member icon’s popover: the passcode, the emergency line, the request link.', 'member', 1, 4, 'the member icon', '/about', 'polish/before/states/01-signed-out.webp'],
  ['portal', 'The portal', 'The member portal: Super Admin, Edit website, Enquiries, Design direction, Exhibition, Presentation, Marketing, Documents, Email signature; the Codex first.', 'member', 2, 4, 'iaqgroup.com/portal/codex', '/portal/codex', 'polish/after/states/04-portal-signed-in.webp'],
  ['gate', 'The gate', 'What a visitor meets at the portal when signed out.', 'member', 3, 4, 'iaqgroup.com/portal', '/portal', 'polish/after/states/05-portal-gate.webp'],
  ['semicon', 'SEMICON Europa', 'The stand’s page for Munich: the fab built layer by layer, the three units, Dresden.', 'booth', 1, 5, 'iaqgroup.com/semicon', '/semicon', top('semicon')],
  ['screen', 'Booth screen', 'The touch screen on the stand, full screen, looping.', 'booth', 2, 5, 'iaqgroup.com/booth/screen', '/booth/screen', top('booth-screen')],
]
# from, to, the words on the page, where, how to draw (h beside, g down to a lower row, o over the top, '' listed only)
LINKS = [
  ['home', 'about', 'More about us', 'the hero', 'h'], ['home', 'services', 'Services', 'the menu', 'g'], ['home', 'markets', 'Explore the seven markets', 'the markets band', 'g'],
  ['home', 'contact', 'Start a project', 'the bar', 'g'], ['home', 'signin', 'The member icon', 'the bar', 'g'], ['home', 'careers', 'Careers', 'the menu', ''],
  ['about', 'history', 'The record since 1995', 'the story block', 'h'], ['history', 'commitment', 'Corporate Commitment', 'the About menu', 'h'], ['commitment', 'global', 'Global presence', 'the About menu', 'h'],
  ['about', 'policies', 'Policies and certificates', 'the achievements', ''],
  ['services', 'six', 'See the six services', 'the facility map', 'h'], ['six', 'epc', 'EPC', 'the units', 'h'], ['epc', 'tti', 'PCU & TTI', 'the Services menu', 'h'], ['tti', 'efm', 'Energy Management', 'the Services menu', 'h'],
  ['services', 'contact', 'Start a project', 'the bar', ''],
  ['markets', 'market', 'Explore the market', 'a tile', 'h'], ['market', 'projects', 'See all semiconductor projects', 'Delivered in this market', 'h'], ['projects', 'project', 'A project card', 'the registry', 'h'],
  ['project', 'news', 'News', 'the menu', 'h'], ['news', 'article', 'Read the story', 'the latest story', 'h'],
  ['contact', 'enquiry', 'Send the brief', 'the form', 'h'], ['enquiry', 'careers', 'Careers', 'the menu', 'h'], ['careers', 'policies', 'Policies', 'the footer', 'h'],
  ['signin', 'portal', 'Open the portal', 'the popover', 'h'], ['portal', 'gate', 'Sign out', 'the sidebar', 'h'],
  ['semicon', 'screen', 'Touch to explore', 'the stand', 'h'], ['home', 'semicon', 'SEMICON Europa', 'the exhibition page', ''],
]
SHOTS = {n[0]: n[8] for n in NODES if n[8]}
NOTES = {
  'signin': 'A state, not a page: the popover opens from the member icon on any page. The device shows the About page; press the icon.',
  'portal': 'Review builds only; the launch build carries no portal. Sign in with the member passcode first.',
  'gate': 'The same address signed out.',
  'market': 'One page stands for the seven; each follows the same sections from IAQ’s 20 Oct sheet.',
}
OFF = []
def js(v): return json.dumps(v, ensure_ascii=False)
data = 'var LANES=' + js(LANES) + ', NODES=' + js([n[:8] for n in NODES]) + ', LINKS=' + js(LINKS) + ', SHOTS=' + js(SHOTS) + ', NOTES=' + js(NOTES) + ', OFF=' + js(OFF) + ', ICONS=' + ICONS + ';\n'
out = T
out = re.sub(r'var LANES=.*?;\n', lambda m: data, out, count=1, flags=re.S)
out = re.sub(r'<!-- WORKSPACE ONLY[\s\S]*?<!-- END WORKSPACE ONLY -->', '<!-- WORKSPACE ONLY: the Brand Method bar (public/bmws.css). Not part of the client site. -->\n' + bar.strip() + '\n<!-- END WORKSPACE ONLY -->', out, count=1)
out = out.replace('<title>Leadersclass &middot; Web flow</title>', '<title>IAQ &middot; Web flow &middot; Brand Method</title>')
out = out.replace('The Leadersclass website as a flow board', 'The IAQ website as a flow board')
out = out.replace('assets/bmws.css?v=lc1018', '/bmws.css').replace('href="favicon.svg"', 'href="/favicon.ico"')
out = out.replace('family=Archivo:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600', 'family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700')
out = out.replace('--head:"Archivo",system-ui,sans-serif;--text:"IBM Plex Sans",system-ui,sans-serif', '--head:"Instrument Sans",system-ui,sans-serif;--text:"Instrument Sans",system-ui,sans-serif')
out = out.replace('--blue:#0057A3', '--blue:#EC2027').replace('--navy:#1F2966', '--navy:#0C1220').replace('#00498A', '#C8151C').replace('rgba(0,87,163,.35)', 'rgba(236,32,39,.35)')
out = out.replace('var W=300,IH=188,NH=292,CX=480,RY=450,OX=120,OY=160,GAP=106;', 'var W=300,IH=188,NH=292,CX=400,RY=420,OX=120,OY=160,GAP=106;')
out = out.replace("var o={id:n[0],file:n[0]+'.html',name:n[1],desc:n[2],lane:n[3],x:OX+n[4]*CX,y:OY+n[5]*RY,url:n[6],no:i+1,off:OFF.indexOf(n[0])>-1};", "var o={id:n[0],file:n[7],name:n[1],desc:n[2],lane:n[3],x:OX+n[4]*CX,y:OY+n[5]*RY,url:n[6],no:i+1,off:OFF.indexOf(n[0])>-1};")
out = out.replace("function load(n){fr0.src=n.file+'?shell';url.textContent=n.url;$('#full').setAttribute('href',n.file);}", "function load(n){fr0.src=n.file+(n.file.indexOf('?')>-1?'&':'?')+'launchview';url.textContent=n.url;$('#full').setAttribute('href',n.file);}")
out = out.replace("var f=(w.location.pathname.split('/').pop()||'index.html').replace(/\\.html$/,'')||'index',n=BY[f];", "var n=ALL.filter(function(x){return x.file.split('?')[0]===w.location.pathname;})[0];")
out = out.replace("if(!d||typeof d.lcPage!=='string')return;", "if(!d||typeof d.iaqPage!=='string')return;")
out = out.replace("var n=BY[d.lcPage.replace(/\\.html$/,'')||'index'];", "var n=ALL.filter(function(x){return x.file.split('?')[0]===d.iaqPage;})[0];")
out = out.replace("start=BY[h0]||BY.index", "start=BY[h0]||BY.home").replace("select('index',true)", "select('home',true)").replace("start.id==='index'", "start.id==='home'")
out = out.replace('leadersclass.com/', 'iaqgroup.com').replace('Leadersclass, the live page', 'IAQ, the live page')
out = out.replace('<b>Live draft.</b> Click inside it and the board follows. Sample content.', '<b>The live site, on this computer.</b> Click inside it and the board follows.')
out = out.replace('The web flow <span>12 screens</span>', 'The web flow <span>' + str(len(NODES)) + ' screens</span>')
out = out.replace('lc-inshell', 'iaq-inshell')
# the start screen is selected in an animation frame; a hidden or slow pane can miss it, so a timer repeats the start once
out = out.replace("window.__wf={select:select,center:center,fit:fit,BY:BY,T:T,EDGES:EDGES};", "window.__wf={select:select,center:center,fit:fit,BY:BY,T:T,EDGES:EDGES};\n  setTimeout(function(){ if(!document.querySelector('.node.on')){ fitDev(); select(start.id,true); fit(); } },900);")
open('public/webflow.html', 'w', encoding='utf-8').write(out)
checks = {k: (k in out) for k in ['var LANES=', 'iaqPage', 'BY.home', "'launchview'", 'Web flow</a>', 'x.file.split']}
print('webflow.html written', len(out) // 1024, 'KB', checks, 'icons:', keys)
