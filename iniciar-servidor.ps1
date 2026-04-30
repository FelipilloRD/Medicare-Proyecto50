# Script PowerShell para iniciar MediCare AI Server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🚀 Iniciando MediCare AI Server" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cambiar al directorio del script
Set-Location $PSScriptRoot

Write-Host "🔍 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js versión: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "💡 Instala Node.js desde: https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "📥 Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

Write-Host "🌐 Iniciando servidor en http://localhost:3002..." -ForegroundColor Green
Write-Host ""
Write-Host "✅ El servidor está listo. Presiona Ctrl+C para detener." -ForegroundColor Green
Write-Host "🌍 Abre tu navegador en: http://localhost:3002" -ForegroundColor Cyan
Write-Host ""

# Iniciar el servidor
node backend/server.js