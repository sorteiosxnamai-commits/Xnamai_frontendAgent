$port = 8000
$backendDir = Join-Path $PSScriptRoot "..\..\backend-xnamai"
$uvicorn = Join-Path $backendDir "venv\Scripts\uvicorn.exe"

$inUse = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($inUse) {
    $processId = $inUse[0].OwningProcess
    Write-Host "Parando processo na porta $port (PID $processId)..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

Set-Location $backendDir
Write-Host "Reiniciando backend em http://localhost:$port ..." -ForegroundColor Green
& $uvicorn main:app --reload --port $port
