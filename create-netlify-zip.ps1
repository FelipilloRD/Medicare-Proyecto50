#!/usr/bin/env pwsh
# Script para crear ZIP para despliegue en Netlify

$ErrorActionPreference = "Stop"

Write-Host "Creando ZIP para despliegue en Netlify..." -ForegroundColor Cyan

# Verificar que existe la carpeta netlify-deploy
if (-not (Test-Path "netlify-deploy")) {
    Write-Host "Error: No se encuentra la carpeta netlify-deploy" -ForegroundColor Red
    exit 1
}

# Crear ZIP
$zipPath = "clinica-medicare-netlify.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-Host "Archivo ZIP anterior eliminado" -ForegroundColor Yellow
}

Write-Host "Comprimiendo archivos..." -ForegroundColor Yellow
Compress-Archive -Path "netlify-deploy\*" -DestinationPath $zipPath -Force

Write-Host ""
Write-Host "ZIP creado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Archivo: $zipPath" -ForegroundColor Cyan
Write-Host "Tamaño: $((Get-Item $zipPath).Length / 1KB) KB" -ForegroundColor Gray
Write-Host ""
Write-Host "Instrucciones para desplegar en Netlify:" -ForegroundColor Cyan
Write-Host "1. Ve a https://netlify.com" -ForegroundColor White
Write-Host "2. Arrastra el archivo $zipPath a la zona de despliegue" -ForegroundColor White
Write-Host "3. Espera a que se complete el despliegue" -ForegroundColor White
Write-Host "4. Tu app estara disponible en https://tu-app.netlify.app" -ForegroundColor White
Write-Host ""
Write-Host "Configuracion del backend:" -ForegroundColor Yellow
Write-Host "- Backend AWS: http://18.224.136.235:3002" -ForegroundColor Gray
Write-Host "- CORS configurado para Netlify" -ForegroundColor Gray
Write-Host "- Credenciales: admin/Admin123!, patient1/Patient123!" -ForegroundColor Gray
Write-Host ""