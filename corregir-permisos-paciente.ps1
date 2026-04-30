# Script para corregir permisos de pacientes para agendar citas

$ErrorActionPreference = "Stop"

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "CORRIGIENDO PERMISOS DE PACIENTES" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan

$SERVER = "ubuntu@18.224.136.235"
$KEY = "C:\Users\HP PROBOOK 455 G8\OneDrive\Desktop\NUBE SERVER AWS\medicare-ohio-key-fixed.pem"

# Verificar que existe la clave
if (-not (Test-Path $KEY)) {
    Write-Host "ERROR: No se encuentra la clave PEM" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "1. Subiendo server.js corregido..." -ForegroundColor Yellow
scp -i $KEY backend/server.js "${SERVER}:/home/medicare/clinica-ai/backend/"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK server.js subido" -ForegroundColor Green
}

Write-Host ""
Write-Host "2. Subiendo app.js corregido..." -ForegroundColor Yellow
scp -i $KEY frontend/app.js "${SERVER}:/home/medicare/clinica-ai/frontend/"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK app.js subido" -ForegroundColor Green
}

Write-Host ""
Write-Host "3. Reiniciando servidor con PM2..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "cd /home/medicare/clinica-ai; pm2 restart medicare-ai"

if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK Servidor reiniciado exitosamente" -ForegroundColor Green
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "CORRECCION COMPLETADA" -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "CAMBIOS REALIZADOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend (server.js):" -ForegroundColor Cyan
Write-Host "  - Pacientes ahora pueden agendar citas" -ForegroundColor White
Write-Host "  - El sistema usa automaticamente el email del paciente logueado" -ForegroundColor White
Write-Host "  - Admin puede agendar citas para cualquier email" -ForegroundColor White
Write-Host ""
Write-Host "Frontend (app.js):" -ForegroundColor Cyan
Write-Host "  - Campo de email se pre-llena para pacientes" -ForegroundColor White
Write-Host "  - Campo de email es readonly para pacientes" -ForegroundColor White
Write-Host "  - Mensaje de ayuda indica que se usa el email del usuario" -ForegroundColor White
Write-Host ""
Write-Host "Prueba ahora:" -ForegroundColor Yellow
Write-Host "  1. Login como paciente: patient1 / Patient123!" -ForegroundColor White
Write-Host "  2. Ve a 'Agendar Cita'" -ForegroundColor White
Write-Host "  3. El campo email debe estar pre-llenado y bloqueado" -ForegroundColor White
Write-Host "  4. Completa el formulario y agenda la cita" -ForegroundColor White
Write-Host ""
Write-Host "URL: http://18.224.136.235:3002/login.html" -ForegroundColor Cyan
