# Script para copiar archivos actualizados al repositorio GitHub
# Ejecutar desde PowerShell: .\copiar-a-github.ps1

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  COPIAR ARCHIVOS ACTUALIZADOS A GITHUB" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Ruta del proyecto actual
$sourceDir = "C:\Users\HP PROBOOK 455 G8\OneDrive\Desktop\app\clinica-ai"

# Verificar que la carpeta existe
if (-not (Test-Path $sourceDir)) {
    Write-Host "❌ Error: No se encuentra la carpeta $sourceDir" -ForegroundColor Red
    exit 1
}

Write-Host "📂 Carpeta de origen: $sourceDir" -ForegroundColor Green
Write-Host ""

# Lista de archivos importantes a verificar
$archivosImportantes = @(
    "vercel.json",
    ".env.example",
    ".gitignore",
    "VERCEL_SETUP.md",
    "SUBIR_A_GITHUB.md",
    "backend\database-postgres.js",
    "backend\server.js",
    "backend\auth\authService.js",
    "package.json"
)

Write-Host "✅ ARCHIVOS LISTOS PARA GITHUB:" -ForegroundColor Green
Write-Host ""

foreach ($archivo in $archivosImportantes) {
    $rutaCompleta = Join-Path $sourceDir $archivo
    if (Test-Path $rutaCompleta) {
        $tamaño = (Get-Item $rutaCompleta).Length
        Write-Host "  ✓ $archivo ($tamaño bytes)" -ForegroundColor White
    } else {
        Write-Host "  ✗ $archivo (NO ENCONTRADO)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SIGUIENTE PASO:" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Abre GitHub Desktop" -ForegroundColor White
Write-Host "2. Selecciona el repositorio 'medicare-ai'" -ForegroundColor White
Write-Host "3. Verás los archivos modificados" -ForegroundColor White
Write-Host "4. Escribe un mensaje: 'Actualizar para Vercel'" -ForegroundColor White
Write-Host "5. Haz clic en 'Commit to main'" -ForegroundColor White
Write-Host "6. Haz clic en 'Push origin'" -ForegroundColor White
Write-Host ""
Write-Host "O usa el comando:" -ForegroundColor Yellow
Write-Host "  git add ." -ForegroundColor Cyan
Write-Host "  git commit -m 'Actualizar configuración para Vercel'" -ForegroundColor Cyan
Write-Host "  git push origin main" -ForegroundColor Cyan
Write-Host ""
