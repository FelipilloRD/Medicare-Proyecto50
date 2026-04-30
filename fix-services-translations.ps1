#!/usr/bin/env pwsh
# Script para arreglar las traducciones de la seccion de servicios

$ErrorActionPreference = "Stop"

Write-Host "Arreglando traducciones de la seccion de servicios..." -ForegroundColor Cyan

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

# Subir index.html con servicios traducibles
Write-Host "  Subiendo index.html..." -ForegroundColor Gray
scp -i $pemPath "frontend/index.html" "${serverUser}@${serverIP}:${remoteDir}/frontend/"

# Subir i18n.js con traducciones de servicios
Write-Host "  Subiendo i18n.js..." -ForegroundColor Gray
scp -i $pemPath "frontend/i18n.js" "${serverUser}@${serverIP}:${remoteDir}/frontend/"

Write-Host ""
Write-Host "Reiniciando servidor..." -ForegroundColor Yellow
ssh -i $pemPath "${serverUser}@${serverIP}" "cd $remoteDir && pm2 restart medicare-ai"

Write-Host ""
Write-Host "Traducciones de servicios completadas!" -ForegroundColor Green
Write-Host ""
Write-Host "Cambios aplicados:" -ForegroundColor Cyan
Write-Host "  - Header de servicios traducible" -ForegroundColor White
Write-Host "  - Badge 'Especialidades Medicas' traducible" -ForegroundColor White
Write-Host "  - Subtitulo de servicios traducible" -ForegroundColor White
Write-Host "  - Todas las 8 tarjetas de servicios traducibles" -ForegroundColor White
Write-Host "  - Titulos de servicios traducibles" -ForegroundColor White
Write-Host "  - Descripciones de servicios traducibles" -ForegroundColor White
Write-Host "  - Caracteristicas de servicios traducibles" -ForegroundColor White
Write-Host "  - Botones 'Ver detalles' traducibles" -ForegroundColor White
Write-Host "  - Categorias (General, Especialidad, Diagnostico) traducibles" -ForegroundColor White
Write-Host ""
$url = "http://18.224.136.235:3002"
Write-Host "Prueba en tu celular: $url" -ForegroundColor Cyan
Write-Host "Ve a Servicios y cambia el idioma - TODO debe traducirse" -ForegroundColor Yellow
Write-Host ""