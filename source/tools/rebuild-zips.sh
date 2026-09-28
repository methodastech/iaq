#!/bin/zsh
# Rebuild both IAQ zips (26 Sep 2026): the "comolex" session's procedure, kept in the project so any session can run it.
# zsh tools/rebuild-zips.sh   (from the project root). Stages in a temp folder: START-HERE.md from tools/team-zip-START-HERE.md,
# site-netlify and source as links. Writes deliver/iaq-website-launch-2026-09-25.zip and deliver/iaq-website-complete-2026-09-26.zip,
# then unpacks the team zip, rebuilds the launch copy from its source and runs the leak checks and the 8-route zip test on both.
P="/Users/zieel/Bazil Claude 3/Websites/iaq website"; cd "$P"
SP=$(mktemp -d -t iaqzip); mkdir -p "$SP/team-zip/iaq-website-complete-2026-09-26"; cp "$P/tools/team-zip-START-HERE.md" "$SP/team-zip/iaq-website-complete-2026-09-26/START-HERE.md"; ln -sfn "$P/dist-launch" "$SP/team-zip/iaq-website-complete-2026-09-26/site-netlify"; ln -sfn "$P" "$SP/team-zip/iaq-website-complete-2026-09-26/source"
echo "start $(date +%H:%M:%S)"
npm run build 2>&1 | grep -iE "error|built in" | tail -1
npm run build:launch 2>&1 | grep -iE "error|built in|pruned|scrubbed" | tail -3
(cd dist-launch && echo "launch checks: passcode $(grep -rl 'iaqsolution321' . 2>/dev/null | wc -l | tr -d ' ') codex/portal $(ls assets | grep -ci 'codex\|portal') SOURCES $(find . -name 'SOURCES.md' | wc -l | tr -d ' ') IUS $(grep -rl 'IAQ Utility Solutions' . 2>/dev/null | wc -l | tr -d ' ') hasegawa $(grep -rli 'hasegawa' . 2>/dev/null | wc -l | tr -d ' ')/$(find . -iname '*hasegawa*' | wc -l | tr -d ' ') bazil $(grep -rli 'bazil' . 2>/dev/null | wc -l | tr -d ' ') other-clients $(grep -rliE 'tenthpin|baik khayr|myhero|methodas|helldive|avisenna' . 2>/dev/null | wc -l | tr -d ' ') design/lab $(ls -d design design.html loader-lab 2>/dev/null | wc -l | tr -d ' ') boot $(grep -c 'id=\"boot\"' index.html) knock $(ls assets/iaq-logo-knock.png 2>/dev/null | wc -l | tr -d ' ')")
Z1="$P/deliver/iaq-website-launch-2026-09-25.zip"
rm -f "/Users/zieel/Bazil Claude 3/Websites/iaq website/deliver/iaq-website-launch-2026-09-25.zip"
(cd dist-launch && zip -qr -X "$Z1" . -x '*.bak*' '*.DS_Store' '*/.DS_Store')
R=iaq-website-complete-2026-09-26; Z="$P/deliver/$R.zip"
rm -f "/Users/zieel/Bazil Claude 3/Websites/iaq website/deliver/iaq-website-complete-2026-09-26.zip"
(cd "$SP/team-zip" && zip -qr -X "$Z" "$R" -x "$R/source/node_modules/*" "$R/source/dist/*" "$R/source/dist-launch/*" "$R/source/dist-file/*" "$R/source/deliver/*" "$R/source/_backups/*" "$R/source/src/_backups/*" "$R/source/.photo-quarantine/*" "$R/source/_handoff/*.zip" "$R/source/_handoff/*.zip.part*" "*.bak" "*.bak.*" "*.bak/*" "*/.src.pre-*" "*/.src.pre-*/*" "*.DS_Store" "$R/source/.claude/*")
echo "zips written $(date +%H:%M:%S)"; ls -la "$Z1" "$Z" | awk '{print $5, $9, $10, $11, $12}'
T="$SP/team-unzip-0926"; mkdir -p "$T"; unzip -q "$Z" -d "$T"
(cd "$T/$R/source" && ln -s "$P/node_modules" node_modules && npm run build:launch 2>&1 | grep -iE "error|built in" | tail -1 && cd dist-launch && echo "rebuilt checks: passcode $(grep -rl 'iaqsolution321' . | wc -l | tr -d ' ') codex $(ls assets | grep -ci 'codex\|portal') SOURCES $(find . -name 'SOURCES.md' | wc -l | tr -d ' ') IUS $(grep -rl 'IAQ Utility Solutions' . | wc -l | tr -d ' ') hasegawa $(grep -rli 'hasegawa' . | wc -l | tr -d ' ') bazil $(grep -rli 'bazil' . | wc -l | tr -d ' ')")
echo "site-netlify: $(ZPORT=8793 node tools/_ziptest-0925.mjs "$T/$R/site-netlify" 2>&1 | grep -c 'err 0 | fail 0') of 8 clean"
echo "rebuilt: $(ZPORT=8793 node tools/_ziptest-0925.mjs "$T/$R/source/dist-launch" 2>&1 | grep -c 'err 0 | fail 0') of 8 clean"
echo "HANDOVER in team zip carries the morning section: $(unzip -p "$Z" "$R/source/HANDOVER.md" | grep -c 'Design tab fixes, loader v4 live')"
echo "done $(date +%H:%M:%S); temp staging and unpack left in $SP (delete when done)"
