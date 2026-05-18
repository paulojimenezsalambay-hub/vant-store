@echo off
title VANT - Auto Git Commit
echo ================================================
echo   VANT STORE - Auto Git Commit
echo ================================================
echo   Cada vez que guardes un cambio se creara
echo   un commit automatico en git.
echo   Cierra esta ventana para detener.
echo ================================================
echo.
powershell.exe -ExecutionPolicy Bypass -NoExit -Command "& '%~dp0watch-git.ps1'"
pause
