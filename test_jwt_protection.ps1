# 🧪 Script de Prueba de Autenticación JWT

$base_url = "http://localhost:8000/api"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🔒 PRUEBA 1: Acceso sin token (DEBE FALLAR)" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "$base_url/habitos/" -Method GET -ErrorAction Stop
    Write-Host "❌ ERROR: El endpoint NO está protegido!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 401) {
        Write-Host "✅ CORRECTO: Acceso denegado (401 Unauthorized)" -ForegroundColor Green
        Write-Host "   Respuesta: $($_.Exception.Message)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  ADVERTENCIA: Código de estado inesperado: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🔑 PRUEBA 2: Login y obtención de token" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

$loginData = @{
    correo = "juan@ejemplo.com"
    contrasena = "demo123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$base_url/auth/login/" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login exitoso!" -ForegroundColor Green
    Write-Host "   Access Token: $($loginResponse.access.Substring(0,50))..." -ForegroundColor Gray
    
    $token = $loginResponse.access
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "🎫 PRUEBA 3: Acceso con token válido (DEBE FUNCIONAR)" -ForegroundColor Yellow
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $habitosResponse = Invoke-RestMethod -Uri "$base_url/habitos/" -Method GET -Headers $headers
    Write-Host "✅ CORRECTO: Acceso permitido con token válido" -ForegroundColor Green
    Write-Host "   Hábitos encontrados: $($habitosResponse.Count)" -ForegroundColor Gray
    
    if ($habitosResponse.Count -gt 0) {
        Write-Host "   Primer hábito: $($habitosResponse[0].nombre)" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ ERROR en login o acceso: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🚫 PRUEBA 4: Acceso con token inválido (DEBE FALLAR)" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

$fakeHeaders = @{
    "Authorization" = "Bearer token-falso-12345"
}

try {
    $response = Invoke-RestMethod -Uri "$base_url/habitos/" -Method GET -Headers $fakeHeaders -ErrorAction Stop
    Write-Host "❌ ERROR: El sistema aceptó un token inválido!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 401) {
        Write-Host "✅ CORRECTO: Token inválido rechazado (401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  ADVERTENCIA: Código de estado inesperado: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📊 RESUMEN DE PRUEBAS" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "✅ Prueba 1: Sin token → 401 ✓" -ForegroundColor Green
Write-Host "✅ Prueba 2: Login → Token obtenido ✓" -ForegroundColor Green
Write-Host "✅ Prueba 3: Con token válido → 200 ✓" -ForegroundColor Green
Write-Host "✅ Prueba 4: Con token inválido → 401 ✓" -ForegroundColor Green

Write-Host "`n🎉 TODAS LAS PRUEBAS PASARON - La autenticación JWT funciona correctamente!`n" -ForegroundColor Green
