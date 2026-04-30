# Diagnostico del problema de login

$EC2_HOST = "18.224.136.235"
$EC2_USER = "ubuntu"
$KEY_FILE = "C:\Users\HP PROBOOK 455 G8\OneDrive\Desktop\NUBE SERVER AWS\medicare-ohio-key-fixed.pem"
$REMOTE_DIR = "/home/medicare/clinica-ai"

Write-Host "===============================================================" -ForegroundColor Blue
Write-Host "DIAGNOSTICANDO PROBLEMA DE LOGIN" -ForegroundColor Blue
Write-Host "===============================================================" -ForegroundColor Blue
Write-Host ""

function Invoke-SSH {
    param([string]$Command)
    ssh -i $KEY_FILE -o StrictHostKeyChecking=no -o ConnectTimeout=30 "$EC2_USER@$EC2_HOST" $Command 2>$null
}

Write-Host "1. Verificando estado del servidor..." -ForegroundColor Yellow
$pm2Status = Invoke-SSH "pm2 status"
Write-Host $pm2Status
Write-Host ""

Write-Host "2. Verificando logs del servidor..." -ForegroundColor Yellow
$logs = Invoke-SSH "pm2 logs medicare-ai --lines 30 --nostream"
Write-Host $logs
Write-Host ""

Write-Host "3. Verificando puerto 3002..." -ForegroundColor Yellow
$portCheck = Invoke-SSH "netstat -tlnp 2>/dev/null | grep 3002"
Write-Host $portCheck
Write-Host ""

Write-Host "4. Probando endpoint de login desde el servidor..." -ForegroundColor Yellow
$loginTest = Invoke-SSH "curl -X POST http://localhost:3002/api/auth/login -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"Admin123!\"}' -v 2>&1"
Write-Host $loginTest
Write-Host ""

Write-Host "5. Verificando archivo login.html..." -ForegroundColor Yellow
$loginHtml = Invoke-SSH "ls -la $REMOTE_DIR/frontend/login.html"
Write-Host $loginHtml
Write-Host ""

Write-Host "6. Verificando configuracion CORS en server.js..." -ForegroundColor Yellow
$corsConfig = Invoke-SSH "grep -A 3 'cors(' $REMOTE_DIR/backend/server.js"
Write-Host $corsConfig
Write-Host ""

Write-Host "7. Probando health check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://${EC2_HOST}:3002/health" -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    Write-Host "OK - Health check responde (HTTP $($response.StatusCode))" -ForegroundColor Green
    Write-Host "Contenido: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "ERROR - Health check fallo: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "8. Probando login desde tu computadora..." -ForegroundColor Yellow
try {
    $body = @{
        username = "admin"
        password = "Admin123!"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://${EC2_HOST}:3002/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 10 `
        -UseBasicParsing `
        -ErrorAction Stop

    Write-Host "OK - Login responde (HTTP $($response.StatusCode))" -ForegroundColor Green
    Write-Host "Respuesta: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "ERROR - Login fallo: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Detalles: $($_.Exception)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "===============================================================" -ForegroundColor Blue
Write-Host "FIN DEL DIAGNOSTICO" -ForegroundColor Blue
Write-Host "===============================================================" -ForegroundColor Blue
