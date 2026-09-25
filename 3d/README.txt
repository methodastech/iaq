IAQ CLEANROOM 3D  -  ready to upload
=====================================

PUT IT ONLINE (Netlify)
  1. Go to https://app.netlify.com/drop  (or your site's Deploys page).
  2. Drag this whole "3D ONLY" folder onto the page.
  3. When it finishes, open the link Netlify gives you.
       main page:      <your-link>/
       V3 layout page: <your-link>/v3.html

VIEW IT ON THIS COMPUTER
  Double-click "Open 3D (local).bat". It opens the 3D in your browser.
  Keep the black window open while you look; close it to stop.
  (Double-clicking index.html does NOT work: browsers block 3D files
   opened straight from disk. That is normal, not a broken build.)

WHAT IS IN HERE
  index.html, v3.html   the pages
  assets/               the app code
  models/               the 3D models (compressed; the app unpacks them)
  fallback/, signs/     images the app uses
  _headers              Netlify caching settings
  serve.ps1, *.bat      only for viewing on this computer
