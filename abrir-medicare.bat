@echo off
echo 🚀 Iniciando MediCare AI...

REM Iniciar el servidor en segundo plano
start /min cmd /c "cd /d %~dp0 && node backend/server.js"

REM Esperar 3 segundos para que el servidor inicie
timeout /t 3 /nobreak >nul

REM Abrir el navegador
echo 🌍 Abriendo navegador...
start http://localhost:3002

echo ✅ MediCare AI iniciado correctamente
echo 💡 Si no se abre automáticamente, ve a: http://localhost:3002
pause