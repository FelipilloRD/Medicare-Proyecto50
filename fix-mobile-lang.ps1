#!/usr/bin/env pwsh
# Script para arreglar el selector de idioma en movil

$ErrorActionPreference = "Stop"

Write-Host "Arreglando selector de idioma para movil..." -ForegroundColor Cyan

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

# Subir styles.css
Write-Host "  Subiendo styles.css..." -ForegroundColor Gray
scp -i $pemPath "frontend/styles.css" "${serverUser}@${serverIP}:${remoteDir}/frontend/"

# Subir login.html
Write-Host "  Subiendo login.html..." -ForegroundColor Gray
scp -i $pemPath "frontend/login.html" "${serverUser}@${serverIP}:${remoteDir}/frontend/"

Write-Host ""
Write-Host "Reiniciando servidor..." -ForegroundColor Yellow
ssh -i $pemPath "${serverUser}@${serverIP}" "cd $remoteDir && pm2 restart clinica-ai"

Write-Host ""
Write-Host "Selector de idioma arreglado para movil!" -ForegroundColor Green
Write-Host ""
Write-Host "Cambios aplicados:" -ForegroundColor Cyan
Write-Host "  - Selector de idioma mas grande en movil" -ForegroundColor White
Write-Host "  - Mejor area tactil (touch target)" -ForegroundColor White
Write-Host "  - Flecha visual para indicar que es un selector" -ForegroundColor White
Write-Host "  - Posicion fija en login para mejor acceso" -ForegroundColor White
Write-Host "  - Estilos mejorados para pantallas pequenas" -ForegroundColor White
Write-Host ""
$url = "http://18.224.136.235:3002"
Write-Host "Prueba en tu celular: $url" -ForegroundColor Cyan
Write-Host ""
