# Script para actualizar templates de notificaciones (Email y WhatsApp)

$ErrorActionPreference = "Stop"

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "ACTUALIZANDO TEMPLATES DE NOTIFICACIONES" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan

$SERVER = "ubuntu@18.224.136.235"
$KEY = "C:\Users\HP PROBOOK 455 G8\OneDrive\Desktop\NUBE SERVER AWS\medicare-ohio-key-fixed.pem"

# Verificar que existe la clave
if (-not (Test-Path $KEY)) {
    Write-Host "ERROR: No se encuentra la clave PEM" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "1. Subiendo emailService.js..." -ForegroundColor Yellow
scp -i $KEY backend/notifications/emailService.js "${SERVER}:/home/medicare/clinica-ai/backend/notifications/"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK emailService.js subido" -ForegroundColor Green
}

Write-Host ""
Write-Host "2. Subiendo whatsappService.js..." -ForegroundColor Yellow
scp -i $KEY backend/notifications/whatsappService.js "${SERVER}:/home/medicare/clinica-ai/backend/notifications/"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK whatsappService.js subido" -ForegroundColor Green
}

Write-Host ""
Write-Host "3. Reiniciando servidor con PM2..." -ForegroundColor Yellow
ssh -i $KEY $SERVER "cd /home/medicare/clinica-ai; pm2 restart medicare-ai"

if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK Servidor reiniciado exitosamente" -ForegroundColor Green
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "ACTUALIZACION COMPLETADA" -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "MEJORAS APLICADAS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Emails:" -ForegroundColor Cyan
Write-Host "  - Diseño profesional con gradientes azules" -ForegroundColor White
Write-Host "  - Branding: Clinica MediCare (no MediCare AI)" -ForegroundColor White
Write-Host "  - Email: info@clinicamedicare.com" -ForegroundColor White
Write-Host "  - Tarjeta de detalles con iconos" -ForegroundColor White
Write-Host "  - Instrucciones importantes destacadas" -ForegroundColor White
Write-Host "  - Footer con informacion de contacto completa" -ForegroundColor White
Write-Host ""
Write-Host "WhatsApp:" -ForegroundColor Cyan
Write-Host "  - Formato profesional con separadores" -ForegroundColor White
Write-Host "  - Branding: Clinica MediCare" -ForegroundColor White
Write-Host "  - Email: info@clinicamedicare.com" -ForegroundColor White
Write-Host "  - Iconos y emojis profesionales" -ForegroundColor White
Write-Host "  - Estructura clara y legible" -ForegroundColor White
Write-Host ""
Write-Host "Prueba agendando una cita para ver los nuevos templates!" -ForegroundColor Yellow
Write-Host "URL: http://18.224.136.235:3002/login.html" -ForegroundColor Cyan
