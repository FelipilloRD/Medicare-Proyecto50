@echo off
echo ========================================
echo   🚀 Iniciando MediCare AI Server
echo ========================================
echo.
echo 📂 Cambiando al directorio del proyecto...
cd /d "%~dp0"

echo 🔍 Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado o no está en el PATH
    echo 💡 Instala Node.js desde: https://nodejs.org
    pause
    exit /b 1
)

echo 📦 Verificando dependencias...
if not exist "node_modules" (
    echo 📥 Instalando dependencias...
    npm install
)

echo 🌐 Iniciando servidor en http://localhost:3002...
echo.
echo ✅ El servidor está listo. Presiona Ctrl+C para detener.
echo 🌍 Abre tu navegador en: http://localhost:3002
echo.

node backend/server.js