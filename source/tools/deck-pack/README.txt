IAQ EUROPE PRESENTATION 1: the exhibition screen deck
=====================================================

START IT ON THIS COMPUTER
  Mac:      double-click  "Start presentation (Mac).command"
            (the first time, macOS may ask: right-click it, choose Open, then Open again)
  Windows:  double-click  "Start presentation (Windows).bat"
  The deck opens in your browser. Keep the small black window open while it runs.
  Needs Python 3 (already on most Macs; on Windows install it from python.org and tick "Add to PATH").

ON THE BOOTH TV
  Press F (or the Full screen button) to fill the TV.
  The loop icon at the top right plays every slide on its own, round and round.
  A touch on a slide holds the loop; it carries on by itself after 30 seconds.
  Arrow keys: next and previous slide.  + and -: zoom.  The arrow mark at the top right hides the tabs.
  For an unattended screen, Chrome can open straight into it:
    chrome --kiosk http://localhost:8765

NO PYTHON?  PUT IT ONLINE INSTEAD
  Go to https://app.netlify.com/drop and drag this whole folder onto the page.
  Open the link it gives you. Everything works the same, from any computer.

WHAT IS IN HERE
  index.html      the deck
  assets/         the deck's code, fonts, pictures and the nine films
  3d/             IAQ's facility in 3D (the build, the walkthrough and the systems view)
  serve.py        the small local web server the start files run
  Double-clicking index.html on its own will not work: browsers block 3D files and
  films opened straight from disk. That is normal, not a broken file.

Built by Brand Method, 8 October 2026.
