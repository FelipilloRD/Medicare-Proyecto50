# Script para actualizar configuracion de sesion en AWS

$ErrorActionPreference = "Stop"

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "ACTUALIZANDO CONFIGURACION DE SESION EN AWS" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan

$SERVER = "ubuntu@18.224.136.235"
$KEY = "C:\Users\HP PROBOOK 455 G8\OneDrive\Desktop\NUBE SERVER AWS\medicare-ohio-key-fixed.pem"
$REMOTE_DIR = "/home/medicare/clinica-ai/backend"

# Verificar que existe la clave
if (-not (Test-Path $KEY)) {
    Write-Host "ERROR: No se encuentra la clave PEM" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "1. Subiendo server.js con configuracion de sesion corregida..." -ForegroundColor Yellow
scp -i $KEY backend/server.js "${SERVER}:${REMOTE_DIR}/"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK server.js subido" -ForegroundColor Green
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
Write-Host "CAMBIOS REALIZADOS:" -ForegroundColor Yellow
Write-Host "  - sameSite cambiado de 'strict' a 'lax'" -ForegroundColor White
Write-Host "  - secure cambiado a false (para HTTP)" -ForegroundColor White
Write-Host "  - Esto permite que las cookies persistan en redirecciones" -ForegroundColor White
Write-Host ""
Write-Host "Prueba el login nuevamente en: http://18.224.136.235:3002/login.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "Credenciales:" -ForegroundColor Cyan
Write-Host "  Admin: admin / Admin123!" -ForegroundColor White
Write-Host "  Paciente 1: patient1 / Patient123!" -ForegroundColor White
