#!/bin/zsh
# 27 Oct 2026: the one team zip (Bazil: "all website in 1 zip file to send to my team"). Same procedure as rebuild-zips.sh
# (26 Sep): START-HERE.md (tools/team-zip-START-HERE-1027.md), site-netlify (the public build) and source, zipped; then the zip
# is unpacked, the public build rebuilt from its own source, and the leak checks and the 8-route test run on both copies.
# Leaves out: node_modules, every dist folder, deliver, the backups, superseded exports, the standalone exhibition HTML (it is
# inside the exhibition zip), .claude and .bak files.   zsh tools/rebuild-zips-1027.sh
P="/Users/zieel/Bazil Claude 3/Websites/iaq website"; cd "$P"
R=iaq-website-complete-2026-10-27; Z="$P/deliver/$R.zip"
SP=$(mktemp -d -t iaqzip1027); mkdir -p "$SP/team-zip/$R"; cp "$P/tools/team-zip-START-HERE-1027.md" "$SP/team-zip/$R/START-HERE.md"
ln -sfn "$P/dist-launch" "$SP/team-zip/$R/site-netlify"; ln -sfn "$P" "$SP/team-zip/$R/source"
echo "start $(date +%H:%M:%S)"
npm run build:launch 2>&1 | grep -iE "error|built in|pruned|scrubbed" | tail -3
(cd dist-launch && echo "launch checks (all 0): passcode $(grep -rl 'iaqsolution321' . 2>/dev/null | wc -l | tr -d ' ') codex/portal $(ls assets | grep -ci 'codex\|portal') SOURCES $(find . -name 'SOURCES.md' | wc -l | tr -d ' ') hasegawa $(grep -rli 'hasegawa' . 2>/dev/null | wc -l | tr -d ' ') one-contract-claims $(grep -rli 'under one contract' . 2>/dev/null | wc -l | tr -d ' ')")
(cd "$SP/team-zip" && zip -qr -X "$Z" "$R" -x "$R/source/node_modules/*" "$R/source/dist/*" "$R/source/dist-launch/*" "$R/source/dist-file/*" "$R/source/dist-deck/*" "$R/source/dist-review/*" "$R/source/deliver/*" "$R/source/_backups/*" "$R/source/src/_backups/*" "$R/source/_removed/*" "$R/source/_exports/superseded/*" "$R/source/_exports/IAQ-Exhibition-Portal-*.html" "$R/source/.photo-quarantine/*" "$R/source/_handoff/*.zip" "$R/source/_handoff/*.zip.part*" "*.bak" "*.bak.*" "*.bak/*" "*/.src.pre-*" "*/.src.pre-*/*" "*.DS_Store" "$R/source/.claude/*")
echo "zip written $(date +%H:%M:%S): $(ls -la "$Z" | awk '{printf "%.2f GB", $5/1e9}') $(unzip -l "$Z" | tail -1 | awk '{print $2}') files"
T="$SP/unzip"; mkdir -p "$T"; unzip -q "$Z" -d "$T"
(cd "$T/$R/source" && ln -s "$P/node_modules" node_modules && npm run build:launch 2>&1 | grep -iE "error|built in" | tail -1 && cd dist-launch && echo "rebuilt checks (all 0): passcode $(grep -rl 'iaqsolution321' . | wc -l | tr -d ' ') codex $(ls assets | grep -ci 'codex\|portal') SOURCES $(find . -name 'SOURCES.md' | wc -l | tr -d ' ') hasegawa $(grep -rli 'hasegawa' . | wc -l | tr -d ' ')")
echo "site-netlify: $(ZPORT=8794 node tools/_ziptest-1027.mjs "$T/$R/site-netlify" 2>&1 | grep -c 'err 0 | fail 0') of 8 clean"
echo "rebuilt from the zip's source: $(ZPORT=8794 node tools/_ziptest-1027.mjs "$T/$R/source/dist-launch" 2>&1 | grep -c 'err 0 | fail 0') of 8 clean"
echo "START-HERE dated 27 Oct: $(unzip -p "$Z" "$R/START-HERE.md" | grep -c '27 October 2026')"
echo "done $(date +%H:%M:%S); staging and unpack in $SP"
