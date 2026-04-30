# Script para verificar que el login funciona correctamente

$ErrorActionPreference = "Stop"

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "VERIFICANDO LOGIN EN AWS" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan

$SERVER_URL = "http://18.224.136.235:3002"

Write-Host ""
Write-Host "1. Verificando que el servidor responde..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$SERVER_URL/api/health" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   OK Servidor respondiendo correctamente" -ForegroundColor Green
    }
} catch {
    Write-Host "   ERROR: Servidor no responde" -ForegroundColor Red
    Write-Host "   $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Verificando pagina de login..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$SERVER_URL/login.html" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   OK Pagina de login carga correctamente" -ForegroundColor Green
        
        # Verificar que NO contiene localhost:3002
        if ($response.Content -match "localhost:3002") {
            Write-Host "   ADVERTENCIA: Aun hay referencias a localhost:3002" -ForegroundColor Yellow
        } else {
            Write-Host "   OK No hay referencias a localhost:3002" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "   ERROR: No se puede cargar login.html" -ForegroundColor Red
    Write-Host "   $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Probando login con credenciales de admin..." -ForegroundColor Yellow

try {
    $body = @{
        username = "admin"
        password = "Admin123!"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$SERVER_URL/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -SessionVariable session `
        -TimeoutSec 10

    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   OK Login exitoso" -ForegroundColor Green
        Write-Host "   Usuario: $($data.user.username)" -ForegroundColor Cyan
        Write-Host "   Rol: $($data.user.role)" -ForegroundColor Cyan
        Write-Host "   Email: $($data.user.email)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ERROR: Login fallo" -ForegroundColor Red
    Write-Host "   $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "VERIFICACION COMPLETADA" -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ahora prueba manualmente en tu navegador:" -ForegroundColor Yellow
Write-Host "  URL: http://18.224.136.235:3002/login.html" -ForegroundColor White
Write-Host ""
Write-Host "Credenciales:" -ForegroundColor Cyan
Write-Host "  Admin: admin / Admin123!" -ForegroundColor White
Write-Host "  Paciente 1: patient1 / Patient123!" -ForegroundColor White
Write-Host "  Paciente 2: patient2 / Patient123!" -ForegroundColor White
