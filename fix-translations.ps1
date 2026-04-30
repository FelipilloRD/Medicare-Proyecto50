#!/usr/bin/env pwsh
# Script para arreglar las traducciones completas en index.html

$ErrorActionPreference = "Stop"

Write-Host "Arreglando traducciones completas en index.html..." -ForegroundColor Cyan

# Configuracion AWS
$pemPath = "C:\Users\HP PROBOOK 455 G8\OneDrive\Desktop\NUBE SERVER AWS\medicare-ohio-key-fixed.pem"
$serverUser = "ubuntu"
$serverIP = "18.224.136.235"
$remoteDir = "/home/medicare/clinica-ai"

# Verificar que existe el archivo PEM
if (-not (Test-Path $pemPath)) {
    Write-Host "Error: No se encuentra el archivo PEM" -ForegroundColor Red
    exit 1
}

Write-Host "Subiendo archivos actualizados..." -ForegroundColor Yellow

# Subir index.html con todas las traducciones
Write-Host "  Subiendo index.html..." -ForegroundColor Gray
scp -i $pemPath "frontend/index.html" "${serverUser}@${serverIP}:${remoteDir}/frontend/"

# Subir i18n.js con nuevas traducciones
Write-Host "  Subiendo i18n.js..." -ForegroundColor Gray
scp -i $pemPath "frontend/i18n.js" "${serverUser}@${serverIP}:${remoteDir}/frontend/"

Write-Host ""
Write-Host "Reiniciando servidor..." -ForegroundColor Yellow
ssh -i $pemPath "${serverUser}@${serverIP}" "cd $remoteDir && pm2 restart medicare-ai"

Write-Host ""
Write-Host "Traducciones completas arregladas!" -ForegroundColor Green
Write-Host ""
Write-Host "Cambios aplicados:" -ForegroundColor Cyan
Write-Host "  - Hero section completamente traducible" -ForegroundColor White
Write-Host "  - Features section con traducciones" -ForegroundColor White
Write-Host "  - Trust indicators traducibles" -ForegroundColor White
Write-Host "  - Stats section con traducciones" -ForegroundColor White
Write-Host "  - Floating cards traducibles" -ForegroundColor White
Write-Host "  - Todas las secciones ahora cambian de idioma" -ForegroundColor White
Write-Host ""
$url = "http://18.224.136.235:3002"
Write-Host "Prueba en tu celular: $url" -ForegroundColor Cyan
Write-Host "Cambia el idioma y verifica que TODO el contenido se traduce" -ForegroundColor Yellow
Write-Host ""