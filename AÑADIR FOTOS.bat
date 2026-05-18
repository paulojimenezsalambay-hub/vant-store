@echo off
title VANT - Organizador de fotos de perfumes
echo ================================================
echo   VANT STORE - Organizador de fotos
echo ================================================
echo   Arrastra imagenes a la carpeta assets\products\
echo   Se moveran solas a su subcarpeta correcta.
echo   Cierra esta ventana para detener.
echo ================================================
echo.
powershell.exe -ExecutionPolicy Bypass -NoExit -Command "& '%~dp0watch-products.ps1'"
pause
