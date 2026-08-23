$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host 'Digital Ruble PWA Mock' -ForegroundColor Cyan
Write-Host "Project: $PSScriptRoot"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host ''
    Write-Host 'Node.js is not installed or is not in PATH.' -ForegroundColor Yellow
    Write-Host 'Install Node.js LTS, reopen PowerShell and run this script again.'
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host 'npm is not available in PATH.' -ForegroundColor Red
    exit 1
}

Write-Host ("Node: " + (node --version))
Write-Host ("npm : " + (npm --version))

if (-not (Test-Path (Join-Path $PSScriptRoot 'node_modules'))) {
    Write-Host ''
    Write-Host 'Installing dependencies...' -ForegroundColor Cyan
    npm install
}

Write-Host ''
Write-Host 'Starting Vite on http://localhost:5173 ...' -ForegroundColor Green
Write-Host 'For a phone on the same LAN use the Network URL printed by Vite.'
npm run dev
