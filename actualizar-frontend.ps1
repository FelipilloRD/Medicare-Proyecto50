# Script para actualizar archivos frontend en AWS

$ErrorActionPreference = "Stop"

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "ACTUALIZANDO FRONTEND EN AWS" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan

$SERVER = "ubuntu@18.224.136.235"
$KEY = "C:\Users\HP PROBOOK 455 G8\OneDrive\Desktop\NUBE SERVER AWS\medicare-ohio-key-fixed.pem"
$REMOTE_DIR = "/home/medicare/clinica-ai/frontend"

# Verificar que existe la clave
if (-not (Test-Path $KEY)) {
    Write-Host "ERROR: No se encuentra la clave PEM" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "1. Subiendo archivos frontend corregidos..." -ForegroundColor Yellow

# Subir login.html (archivo principal corregido)
Write-Host "   Subiendo login.html..." -ForegroundColor Gray
scp -i $KEY frontend/login.html "${SERVER}:${REMOTE_DIR}/"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK login.html subido" -ForegroundColor Green
}

# Subir index.html
Write-Host "   Subiendo index.html..." -ForegroundColor Gray
scp -i $KEY frontend/index.html "${SERVER}:${REMOTE_DIR}/"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK index.html subido" -ForegroundColor Green
}

# Subir app.js
Write-Host "   Subiendo app.js..." -ForegroundColor Gray
scp -i $KEY frontend/app.js "${SERVER}:${REMOTE_DIR}/"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK app.js subido" -ForegroundColor Green
}

# Subir dashboard.js
Write-Host "   Subiendo dashboard.js..." -ForegroundColor Gray
scp -i $KEY frontend/dashboard.js "${SERVER}:${REMOTE_DIR}/"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK dashboard.js subido" -ForegroundColor Green
}

# Subir dashboard.html
Write-Host "   Subiendo dashboard.html..." -ForegroundColor Gray
scp -i $KEY frontend/dashboard.html "${SERVER}:${REMOTE_DIR}/"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK dashboard.html subido" -ForegroundColor Green
}

Write-Host ""
Write-Host "2. Reiniciando servidor con PM2..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "cd /home/medicare/clinica-ai; pm2 restart medicare-ai"

if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK Servidor reiniciado exitosamente" -ForegroundColor Green
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "ACTUALIZACION COMPLETADA" -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prueba el login en: http://18.224.136.235:3002/login.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "Credenciales de prueba:" -ForegroundColor Cyan
Write-Host "  Admin: admin / Admin123!" -ForegroundColor White
Write-Host "  Paciente 1: patient1 / Patient123!" -ForegroundColor White
Write-Host "  Paciente 2: patient2 / Patient123!" -ForegroundColor White
