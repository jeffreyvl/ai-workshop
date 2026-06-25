@echo off
cd /d "%~dp0"
echo Frontend opnieuw installeren en bouwen...
pushd app
call npm install --no-audit --no-fund
call npm run build
popd
echo.
echo Klaar. Start de app opnieuw met windows-start.bat
pause
