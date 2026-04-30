# Script para arreglar el sistema de idiomas

$ErrorActionPreference = "Stop"

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "ARREGLANDO SISTEMA DE IDIOMAS" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan

$SERVER = "ubuntu@18.224.136.235"
$KEY = "C:\Users\HP PROBOOK 455 G8\OneDrive\Desktop\NUBE SERVER AWS\medicare-ohio-key-fixed.pem"

# Verificar que existe la clave
if (-not (Test-Path $KEY)) {
    Write-Host "ERROR: No se encuentra la clave PEM" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "1. Subiendo i18n.js mejorado..." -ForegroundColor Yellow
scp -i $KEY frontend/i18n.js "${SERVER}:/home/medicare/clinica-ai/frontend/"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK i18n.js subido" -ForegroundColor Green
}

Write-Host ""
Write-Host "2. Subiendo app.js actualizado..." -ForegroundColor Yellow
scp -i $KEY frontend/app.js "${SERVER}:/home/medicare/clinica-ai/frontend/"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK app.js subido" -ForegroundColor Green
}

Write-Host ""
Write-Host "3. Subiendo login.html actualizado..." -ForegroundColor Yellow
scp -i $KEY frontend/login.html "${SERVER}:/home/medicare/clinica-ai/frontend/"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK login.html subido" -ForegroundColor Green
}

Write-Host ""
Write-Host "4. Reiniciando servidor con PM2..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "cd /home/medicare/clinica-ai; pm2 restart medicare-ai"

if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK Servidor reiniciado exitosamente" -ForegroundColor Green
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "SISTEMA DE IDIOMAS ARREGLADO" -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "MEJORAS APLICADAS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Funcionalidad:" -ForegroundColor Cyan
Write-Host "  - Cambio de idioma SIN recargar la pagina" -ForegroundColor White
Write-Host "  - Traducciones se aplican dinamicamente" -ForegroundColor White
Write-Host "  - Idioma se guarda en localStorage" -ForegroundColor White
Write-Host "  - Deteccion automatica del idioma del navegador" -ForegroundColor White
Write-Host ""
Write-Host "Idiomas soportados:" -ForegroundColor Cyan
Write-Host "  - Espanol (ES)" -ForegroundColor White
Write-Host "  - English (EN)" -ForegroundColor White
Write-Host "  - Francais (FR)" -ForegroundColor White
Write-Host "  - Portugues (PT)" -ForegroundColor White
Write-Host "  - Deutsch (DE)" -ForegroundColor White
Write-Host ""
Write-Host "Como probar:" -ForegroundColor Yellow
Write-Host "  1. Abre: http://18.224.136.235:3002/login.html" -ForegroundColor White
Write-Host "  2. Cambia el idioma en el selector (arriba derecha)" -ForegroundColor White
Write-Host "  3. Las traducciones se aplican INSTANTANEAMENTE" -ForegroundColor White
Write-Host "  4. No necesita recargar la pagina" -ForegroundColor White
Write-Host ""
Write-Host "Consola del navegador:" -ForegroundColor Cyan
Write-Host "  - Abre DevTools (F12)" -ForegroundColor White
Write-Host "  - Veras mensajes de confirmacion al cambiar idioma" -ForegroundColor White
Write-Host "  - Ejemplo: 'Idioma cambiado a: en'" -ForegroundColor White
