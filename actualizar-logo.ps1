# Script para actualizar el logo a cruz medica profesional

$ErrorActionPreference = "Stop"

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "ACTUALIZANDO LOGO A CRUZ MEDICA PROFESIONAL" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan

$SERVER = "ubuntu@18.224.136.235"
$KEY = "C:\Users\HP PROBOOK 455 G8\OneDrive\Desktop\NUBE SERVER AWS\medicare-ohio-key-fixed.pem"

if (-not (Test-Path $KEY)) {
    Write-Host "ERROR: No se encuentra la clave PEM" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "1. Subiendo login.html con nuevo logo..." -ForegroundColor Yellow
scp -i $KEY frontend/login.html "${SERVER}:/home/medicare/clinica-ai/frontend/"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK login.html subido" -ForegroundColor Green
}

Write-Host ""
Write-Host "2. Subiendo index.html con nuevo logo..." -ForegroundColor Yellow
scp -i $KEY frontend/index.html "${SERVER}:/home/medicare/clinica-ai/frontend/"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK index.html subido" -ForegroundColor Green
}

Write-Host ""
Write-Host "3. Subiendo styles.css actualizado..." -ForegroundColor Yellow
scp -i $KEY frontend/styles.css "${SERVER}:/home/medicare/clinica-ai/frontend/"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK styles.css subido" -ForegroundColor Green
}

Write-Host ""
Write-Host "4. Reiniciando servidor..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "cd /home/medicare/clinica-ai; pm2 restart medicare-ai"

if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK Servidor reiniciado" -ForegroundColor Green
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "LOGO ACTUALIZADO" -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "CAMBIOS APLICADOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Antes:" -ForegroundColor Cyan
Write-Host "  - Simbolo: ✦ (estrella de 4 puntas - similar a Gemini)" -ForegroundColor White
Write-Host ""
Write-Host "Ahora:" -ForegroundColor Cyan
Write-Host "  - Simbolo: + (cruz medica profesional en circulo)" -ForegroundColor White
Write-Host "  - Diseño: SVG vectorial escalable" -ForegroundColor White
Write-Host "  - Color: Azul con efecto glow" -ForegroundColor White
Write-Host "  - Animacion: Pulse suave" -ForegroundColor White
Write-Host ""
Write-Host "Ubicaciones actualizadas:" -ForegroundColor Cyan
Write-Host "  - Login page (logo principal)" -ForegroundColor White
Write-Host "  - Index page (header)" -ForegroundColor White
Write-Host "  - Hero section (badge)" -ForegroundColor White
Write-Host ""
Write-Host "Prueba ahora: http://18.224.136.235:3002" -ForegroundColor Yellow
