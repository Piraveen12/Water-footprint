
$currentDir = Get-Location
$backendDir = Join-Path $currentDir "backend"
$frontendDir = Join-Path $currentDir "frontend"

Write-Host "Starting Water Footprint App..." -ForegroundColor Cyan

# 1. Setup Backend
Write-Host "Setting up Backend..." -ForegroundColor Yellow
if (Test-Path $backendDir) {
    Push-Location $backendDir
    
    # Check if venv exists, if not create it (optional but good practice, skipping for now as user likely has python global or venv)
    # Install requirements
    Write-Host "Installing backend requirements..."
    pip install -r requirements.txt
    
    # Start Backend in a new process
    Write-Host "Starting Backend Server..." -ForegroundColor Green
    Start-Process -FilePath "python" -ArgumentList "app.py" -WorkingDirectory $backendDir -WindowStyle Minimized
    
    Pop-Location
} else {
    Write-Error "Backend directory not found!"
    exit 1
}

# 2. Setup Frontend
Write-Host "Setting up Frontend..." -ForegroundColor Yellow
if (Test-Path $frontendDir) {
    Push-Location $frontendDir
    
    # Install dependencies if node_modules missing
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing frontend dependencies (this may take a while)..."
        npm install
    }
    
    # Start Frontend
    Write-Host "Starting Frontend..." -ForegroundColor Green
    # We use Start-Process to keep it separate or just run it here
    Write-Host "Application is starting! Check the new browser window."
    npm run dev
    
    Pop-Location
} else {
    Write-Error "Frontend directory not found!"
    exit 1
}
