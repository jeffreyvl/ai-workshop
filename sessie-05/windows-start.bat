@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ==================================================
echo   Fractie-Radar Volt Soest - lokaal starten
echo ==================================================
echo.

REM 1) Controleer of Node.js aanwezig is
where node >nul 2>nul
if errorlevel 1 (
  echo [FOUT] Node.js is niet gevonden.
  echo.
  echo Installeer eerst Node.js LTS ^(versie 20 of 22^) via:
  echo     https://nodejs.org/
  echo Sluit daarna dit venster, open een nieuwe en start dit script opnieuw.
  echo.
  pause
  exit /b 1
)

REM 2) Backend-pakketten installeren (eenmalig)
if exist "backend\node_modules" (
  echo [1/3] Backend-pakketten al aanwezig - overslaan.
) else (
  echo [1/3] Backend-pakketten installeren ^(eenmalig, kan even duren^)...
  pushd backend
  call npm install --no-audit --no-fund
  set "RC=!errorlevel!"
  popd
  if not "!RC!"=="0" goto fout
)

REM 3) Frontend-pakketten installeren (eenmalig)
if exist "app\node_modules" (
  echo [2/3] Frontend-pakketten al aanwezig - overslaan.
) else (
  echo [2/3] Frontend-pakketten installeren ^(eenmalig, kan even duren^)...
  pushd app
  call npm install --no-audit --no-fund
  set "RC=!errorlevel!"
  popd
  if not "!RC!"=="0" goto fout
)

REM 4) Frontend bouwen indien nog niet gebeurd
if exist "app\dist\index.html" (
  echo [3/3] Frontend al gebouwd - overslaan ^(opnieuw bouwen? gebruik windows-herbouwen.bat^).
) else (
  echo [3/3] Frontend bouwen...
  pushd app
  call npm run build
  set "RC=!errorlevel!"
  popd
  if not "!RC!"=="0" goto fout
)

echo.
echo --------------------------------------------------
if exist "backend\.env" (
  echo Modus: backend\.env gevonden -- AI-modus mogelijk.
) else (
  echo Modus: geen backend\.env -- nieuws-modus ^(echte RSS-artikelen^).
  echo   Tip: zet ANTHROPIC_API_KEY in backend\.env voor AI-analyse.
)
echo --------------------------------------------------
echo.
echo Server start op http://localhost:3005
echo De browser opent zo automatisch. Sluit dit venster om te stoppen.
echo.

REM Open de browser na 3 seconden (server moet eerst opstarten)
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3005'"

cd backend
node --env-file-if-exists=.env server.js

echo.
echo Server gestopt.
pause
exit /b 0

:fout
echo.
echo [FOUT] Er ging iets mis tijdens het installeren of bouwen. Lees de melding hierboven.
pause
exit /b 1
