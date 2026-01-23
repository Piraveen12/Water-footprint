$currentDir = Get-Location
$backendDir = Join-Path $currentDir "backend"
$frontendDir = Join-Path $currentDir "frontend"

Write-Host "Starting Production Build..." -ForegroundColor Cyan

# 1. Build Frontend
Write-Host "Building Frontend..." -ForegroundColor Yellow
if (Test-Path $frontendDir) {
    Push-Location $frontendDir
    # Install if needed
    if (-not (Test-Path "node_modules")) {
        npm install
    }
    # Build
    npm run build
    Pop-Location
} else {
    Write-Error "Frontend directory not found!"
    exit 1
}

# 2. Start Backend (which now serves frontend)
Write-Host "Starting App Server..." -ForegroundColor Green
if (Test-Path $backendDir) {
    Push-Location $backendDir
    
    # Check dependencies (simplified)
    # pip install -r requirements.txt
    
    Write-Host "Server running at http://localhost:5000"
    Write-Host "Press Ctrl+C to stop."
    
    python app.py
    
    Pop-Location
} else {
    Write-Error "Backend directory not found!"
    exit 1
}
