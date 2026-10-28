@echo off
rem IAQ exhibition deck: starts the small local web server and opens the deck in the browser.
rem "py" (the launcher python.org installs) is tried first: on many Windows PCs "python" is only a Microsoft Store
rem shortcut that opens the Store instead of running anything.
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 serve.py
  goto end
)
for /f "delims=" %%P in ('where python 2^>nul') do (
  echo %%P | find /i "WindowsApps" >nul || ( "%%P" serve.py & goto end )
)
echo.
echo Python 3 is needed to run the deck on this computer.
echo Install it from python.org and tick "Add python.exe to PATH", then double-click this file again.
echo Or put this folder online with app.netlify.com/drop (see README.txt).
:end
echo.
pause
