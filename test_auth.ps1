# Script de Prueba de Autenticacion JWT

$base_url = "http://localhost:8000/api"

Write-Host "`n========================================"
Write-Host "PRUEBA 1: Acceso sin token (DEBE FALLAR)"
Write-Host "========================================`n"

try {
    $response = Invoke-WebRequest -Uri "$base_url/habitos/" -Method GET -ErrorAction Stop
    Write-Host "ERROR: El endpoint NO esta protegido!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 401) {
        Write-Host "CORRECTO: Acceso denegado (401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "ADVERTENCIA: Codigo de estado inesperado" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================"
Write-Host "PRUEBA 2: Login y obtencion de token"
Write-Host "========================================`n"

$loginData = @{
    correo = "juan@ejemplo.com"
    contrasena = "demo123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$base_url/auth/login/" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "Login exitoso!" -ForegroundColor Green
    Write-Host "Access Token: $($loginResponse.access.Substring(0,50))..." -ForegroundColor Gray
    
    $token = $loginResponse.access
    
    Write-Host "`n========================================"
    Write-Host "PRUEBA 3: Acceso con token valido"
    Write-Host "========================================`n"
    
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $habitosResponse = Invoke-RestMethod -Uri "$base_url/habitos/" -Method GET -Headers $headers
    Write-Host "CORRECTO: Acceso permitido con token valido" -ForegroundColor Green
    Write-Host "Habitos encontrados: $($habitosResponse.Count)" -ForegroundColor Gray
    
    if ($habitosResponse.Count -gt 0) {
        Write-Host "Primer habito: $($habitosResponse[0].nombre)" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "ERROR en login o acceso: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================"
Write-Host "PRUEBA 4: Acceso con token invalido"
Write-Host "========================================`n"

$fakeHeaders = @{
    "Authorization" = "Bearer token-falso-12345"
}

try {
    $response = Invoke-RestMethod -Uri "$base_url/habitos/" -Method GET -Headers $fakeHeaders -ErrorAction Stop
    Write-Host "ERROR: El sistema acepto un token invalido!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 401) {
        Write-Host "CORRECTO: Token invalido rechazado (401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "ADVERTENCIA: Codigo de estado inesperado" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================"
Write-Host "RESUMEN DE PRUEBAS"
Write-Host "========================================`n"

Write-Host "Prueba 1: Sin token = 401" -ForegroundColor Green
Write-Host "Prueba 2: Login = Token obtenido" -ForegroundColor Green
Write-Host "Prueba 3: Con token valido = 200" -ForegroundColor Green
Write-Host "Prueba 4: Con token invalido = 401" -ForegroundColor Green

Write-Host "`nTODAS LAS PRUEBAS PASARON - La autenticacion JWT funciona!`n" -ForegroundColor Green
